import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Pencil, Trash2, Upload, X, Sparkles, Package, Palette, Flame, Zap, GripVertical, CalendarIcon, Clock, Eye, EyeOff } from 'lucide-react';
import { compressImageToFile } from '@/lib/imageCompression';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CountdownBadge } from '@/components/ui/countdown-timer';
import { cn } from '@/lib/utils';

interface SpecialOffer {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  size: string;
  price: number | null;
  condition_text: string | null;
  sort_order: number;
  is_active: boolean;
  offer_type: string;
  required_quantity: number;
  bundle_price: number | null;
  background_color: string;
  text_color: string;
  expires_at: string | null;
}

interface Product {
  id: string;
  name: string;
  image_url: string | null;
}

const sizeOptions = [
  { id: '2x2', name: 'مربع صغير 2×2', preview: '⬜' },
  { id: '2x4', name: 'مستطيل 2×4', preview: '▬' },
  { id: '4x4', name: 'مربع كبير 4×4', preview: '⬛' },
  { id: 'circle', name: 'دائرة', preview: '⭕' },
];

const colorPresets = [
  { bg: '#7c3aed', text: '#ffffff', name: 'بنفسجي' },
  { bg: '#ef4444', text: '#ffffff', name: 'أحمر' },
  { bg: '#f97316', text: '#ffffff', name: 'برتقالي' },
  { bg: '#22c55e', text: '#ffffff', name: 'أخضر' },
  { bg: '#3b82f6', text: '#ffffff', name: 'أزرق' },
  { bg: '#ec4899', text: '#ffffff', name: 'وردي' },
  { bg: '#1a1a2e', text: '#ffffff', name: 'داكن' },
  { bg: '#fbbf24', text: '#000000', name: 'ذهبي' },
];

// Sortable Offer Card Component
const SortableOfferCard = ({ 
  offer, 
  index, 
  onEdit, 
  onProducts, 
  onDelete 
}: { 
  offer: SpecialOffer; 
  index: number; 
  onEdit: () => void; 
  onProducts: () => void; 
  onDelete: () => void; 
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: offer.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderColor: offer.background_color,
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden ${!offer.is_active ? 'opacity-50' : ''} ${isDragging ? 'shadow-xl z-50' : ''}`}
    >
      <div className="flex items-stretch">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="flex flex-col items-center justify-center gap-1 p-3 bg-muted/50 border-l cursor-grab active:cursor-grabbing hover:bg-muted transition-colors"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {index + 1}
          </div>
        </div>

        {/* Offer Preview */}
        <div 
          className="w-24 h-24 flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: offer.background_color }}
        >
          {offer.image_url ? (
            <img src={offer.image_url} alt={offer.name} className="w-full h-full object-cover" />
          ) : (
            offer.offer_type === 'bundle' ? (
              <Flame className="h-10 w-10" style={{ color: `${offer.text_color}50` }} />
            ) : (
              <Sparkles className="h-10 w-10" style={{ color: `${offer.text_color}50` }} />
            )
          )}
        </div>

        {/* Offer Info */}
        <CardContent className="flex-1 p-3 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold truncate">{offer.name}</h3>
              {offer.offer_type === 'bundle' && (
                <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1 flex-shrink-0">
                  <Flame className="h-3 w-3" />
                  باقة
                </span>
              )}
            </div>
            {offer.offer_type === 'bundle' && offer.bundle_price ? (
              <div className="text-orange-600 font-bold flex items-center gap-1 text-sm">
                <Package className="h-4 w-4" />
                {offer.required_quantity} بـ {offer.bundle_price}₪
              </div>
            ) : offer.price ? (
              <div className="text-primary font-bold text-sm">{offer.price}₪</div>
            ) : null}
            {offer.expires_at && (
              <div className="mt-1">
                <CountdownBadge expiresAt={offer.expires_at} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onProducts}>
              <Package className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف العرض؟</AlertDialogTitle>
                  <AlertDialogDescription>سيتم حذف العرض نهائياً</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>حذف</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

const AdminSpecialOffers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [uploading, setUploading] = useState(false);
  const [productsDialogOpen, setProductsDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [showOfferBadges, setShowOfferBadges] = useState(true);

  // Fetch current settings for badge visibility
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*').single();
      if (data) {
        setShowOfferBadges((data as any).show_offer_badges !== false);
      }
    };
    fetchSettings();
  }, []);

  const toggleBadgesSetting = async () => {
    const newValue = !showOfferBadges;
    setShowOfferBadges(newValue);
    
    const { error } = await supabase
      .from('settings')
      .update({ show_offer_badges: newValue } as any)
      .eq('id', (await supabase.from('settings').select('id').single()).data?.id);
    
    if (error) {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
      setShowOfferBadges(!newValue);
    } else {
      // Update localStorage cache
      const cached = localStorage.getItem('store_settings');
      if (cached) {
        const settings = JSON.parse(cached);
        settings.show_offer_badges = newValue;
        localStorage.setItem('store_settings', JSON.stringify(settings));
      }
      toast({ title: newValue ? 'تم إظهار الشارات' : 'تم إخفاء الشارات' });
    }
  };

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [size, setSize] = useState('2x2');
  const [price, setPrice] = useState('');
  const [conditionText, setConditionText] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  // New fields
  const [offerType, setOfferType] = useState('bundle');
  const [requiredQuantity, setRequiredQuantity] = useState(3);
  const [bundlePrice, setBundlePrice] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#7c3aed');
  const [textColor, setTextColor] = useState('#ffffff');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [expiresTime, setExpiresTime] = useState('23:59');

  const { data: offers, isLoading } = useQuery({
    queryKey: ['admin-special-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as SpecialOffer[];
    }
  });

  const { data: allProducts } = useQuery({
    queryKey: ['all-products-for-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Product[];
    }
  });

  const { data: offerProducts } = useQuery({
    queryKey: ['offer-products', selectedOfferId],
    queryFn: async () => {
      if (!selectedOfferId) return [];
      const { data, error } = await supabase
        .from('special_offer_products')
        .select('product_id')
        .eq('offer_id', selectedOfferId);
      if (error) throw error;
      return data.map(p => p.product_id);
    },
    enabled: !!selectedOfferId
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setImageUrl('');
    setSize('2x2');
    setPrice('');
    setConditionText('');
    setSortOrder(0);
    setIsActive(true);
    setOfferType('bundle');
    setRequiredQuantity(3);
    setBundlePrice('');
    setBackgroundColor('#7c3aed');
    setTextColor('#ffffff');
    setHasExpiration(false);
    setExpiresAt(undefined);
    setExpiresTime('23:59');
    setEditingOffer(null);
  };

  const openEditDialog = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setName(offer.name);
    setDescription(offer.description || '');
    setImageUrl(offer.image_url || '');
    setSize(offer.size);
    setPrice(offer.price?.toString() || '');
    setConditionText(offer.condition_text || '');
    setSortOrder(offer.sort_order);
    setIsActive(offer.is_active);
    setOfferType(offer.offer_type || 'bundle');
    setRequiredQuantity(offer.required_quantity || 3);
    setBundlePrice(offer.bundle_price?.toString() || '');
    setBackgroundColor(offer.background_color || '#7c3aed');
    setTextColor(offer.text_color || '#ffffff');
    if (offer.expires_at) {
      setHasExpiration(true);
      const date = new Date(offer.expires_at);
      setExpiresAt(date);
      setExpiresTime(format(date, 'HH:mm'));
    } else {
      setHasExpiration(false);
      setExpiresAt(undefined);
      setExpiresTime('23:59');
    }
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressed = await compressImageToFile(file, 1200, 1200, 0.85);
      const fileName = `special-offer-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressed);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setImageUrl(publicUrl);
      toast({ title: 'تم رفع الصورة بنجاح' });
    } catch (error) {
      toast({ title: 'خطأ في رفع الصورة', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let expiresAtValue: string | null = null;
      if (hasExpiration && expiresAt) {
        const [hours, minutes] = expiresTime.split(':').map(Number);
        const dateWithTime = new Date(expiresAt);
        dateWithTime.setHours(hours, minutes, 0, 0);
        expiresAtValue = dateWithTime.toISOString();
      }

      const offerData = {
        name,
        description: description || null,
        image_url: imageUrl || null,
        size,
        price: price ? parseFloat(price) : null,
        condition_text: conditionText || null,
        sort_order: sortOrder,
        is_active: isActive,
        offer_type: offerType,
        required_quantity: requiredQuantity,
        bundle_price: bundlePrice ? parseFloat(bundlePrice) : null,
        background_color: backgroundColor,
        text_color: textColor,
        expires_at: expiresAtValue,
      };

      if (editingOffer) {
        const { error } = await supabase
          .from('special_offers')
          .update(offerData)
          .eq('id', editingOffer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('special_offers')
          .insert(offerData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-special-offers'] });
      setDialogOpen(false);
      resetForm();
      toast({ title: editingOffer ? 'تم تحديث العرض' : 'تم إضافة العرض' });
    },
    onError: () => {
      toast({ title: 'حدث خطأ', variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('special_offers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-special-offers'] });
      toast({ title: 'تم حذف العرض' });
    }
  });

  const toggleProductMutation = useMutation({
    mutationFn: async ({ productId, add }: { productId: string; add: boolean }) => {
      if (!selectedOfferId) return;
      if (add) {
        const { error } = await supabase
          .from('special_offer_products')
          .insert({ offer_id: selectedOfferId, product_id: productId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('special_offer_products')
          .delete()
          .eq('offer_id', selectedOfferId)
          .eq('product_id', productId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer-products', selectedOfferId] });
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !offers) return;

    const oldIndex = offers.findIndex(o => o.id === active.id);
    const newIndex = offers.findIndex(o => o.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newOffers = arrayMove(offers, oldIndex, newIndex);
      // Update sort_order for all affected items
      for (let i = 0; i < newOffers.length; i++) {
        await supabase.from('special_offers').update({ sort_order: i }).eq('id', newOffers[i].id);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-special-offers'] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">العروض الخاصة</h1>
          <p className="text-muted-foreground mt-1">إدارة العروض الخاصة وباقات المنتجات</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={toggleBadgesSetting}
            className="gap-2"
          >
            {showOfferBadges ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showOfferBadges ? 'إخفاء الشارات' : 'إظهار الشارات'}
          </Button>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 ml-2" /> إضافة عرض</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Offer Type Selection */}
              <div>
                <Label>نوع العرض</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setOfferType('bundle')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      offerType === 'bundle' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <div className="font-bold">باقة منتجات</div>
                    <p className="text-xs text-muted-foreground mt-1">اختر X منتجات بسعر Y</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferType('discount')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      offerType === 'discount' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <div className="font-bold">عرض عادي</div>
                    <p className="text-xs text-muted-foreground mt-1">خصم أو سعر ثابت</p>
                  </button>
                </div>
              </div>

              <div>
                <Label>اسم العرض *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: أي 3 منتجات بـ 100₪" />
              </div>

              <div>
                <Label>وصف العرض</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="تفاصيل إضافية عن العرض" />
              </div>

              <div>
                <Label>شرط العرض</Label>
                <Input value={conditionText} onChange={(e) => setConditionText(e.target.value)} placeholder="مثال: اختر أي 3 منتجات من القائمة" />
              </div>

              {/* Bundle Options */}
              {offerType === 'bundle' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div>
                    <Label className="text-orange-700 dark:text-orange-400">عدد المنتجات المطلوبة</Label>
                    <Input 
                      type="number" 
                      value={requiredQuantity} 
                      onChange={(e) => setRequiredQuantity(Number(e.target.value))} 
                      min={1}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-orange-700 dark:text-orange-400">سعر الباقة (₪)</Label>
                    <Input 
                      type="number" 
                      value={bundlePrice} 
                      onChange={(e) => setBundlePrice(e.target.value)} 
                      placeholder="100"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {offerType === 'discount' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>السعر (₪)</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="100" />
                  </div>
                  <div>
                    <Label>ترتيب العرض</Label>
                    <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
                  </div>
                </div>
              )}

              {/* Color Selection */}
              <div>
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  ألوان العرض
                </Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.bg}
                      type="button"
                      onClick={() => { setBackgroundColor(preset.bg); setTextColor(preset.text); }}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        backgroundColor === preset.bg ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
                      }`}
                      style={{ backgroundColor: preset.bg, color: preset.text }}
                    >
                      <span className="text-sm font-bold">{preset.name}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label className="text-xs">لون الخلفية</Label>
                    <div className="flex gap-2 mt-1">
                      <input 
                        type="color" 
                        value={backgroundColor} 
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">لون النص</Label>
                    <div className="flex gap-2 mt-1">
                      <input 
                        type="color" 
                        value={textColor} 
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input value={textColor} onChange={(e) => setTextColor(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <Label>معاينة</Label>
                <div 
                  className="mt-2 p-4 rounded-xl text-center"
                  style={{ backgroundColor, color: textColor }}
                >
                  <p className="font-bold text-lg">{name || 'اسم العرض'}</p>
                  {offerType === 'bundle' && bundlePrice && (
                    <p className="mt-1">{requiredQuantity} منتجات بـ {bundlePrice}₪</p>
                  )}
                </div>
              </div>

              <div>
                <Label>حجم البانر</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {sizeOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSize(option.id)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        size === option.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.preview}</div>
                      <div className="text-xs">{option.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>صورة العرض (اختياري)</Label>
                {imageUrl ? (
                  <div className="relative mt-2 inline-block">
                    <img src={imageUrl} alt="Preview" className="w-40 h-40 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Label className="cursor-pointer mt-2 block">
                    <div className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-muted/50">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">{uploading ? 'جاري الرفع...' : 'اختر صورة'}</span>
                    </div>
                    <Input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </Label>
                )}
              </div>

              {/* Expiration Date */}
              <div className="p-4 bg-muted/50 rounded-xl border">
                <div className="flex items-center gap-2 mb-3">
                  <Switch checked={hasExpiration} onCheckedChange={setHasExpiration} />
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    تحديد تاريخ انتهاء العرض
                  </Label>
                </div>
                
                {hasExpiration && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">تاريخ الانتهاء</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-right font-normal mt-1",
                              !expiresAt && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {expiresAt ? format(expiresAt, 'dd/MM/yyyy', { locale: ar }) : 'اختر التاريخ'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={expiresAt}
                            onSelect={setExpiresAt}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-xs">وقت الانتهاء</Label>
                      <Input
                        type="time"
                        value={expiresTime}
                        onChange={(e) => setExpiresTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>العرض فعّال</Label>
              </div>

              <Button onClick={() => saveMutation.mutate()} disabled={!name || saveMutation.isPending} className="w-full">
                {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ العرض'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Offers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : offers && offers.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={offers.map(o => o.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {offers.map((offer, index) => (
                <SortableOfferCard
                  key={offer.id}
                  offer={offer}
                  index={index}
                  onEdit={() => openEditDialog(offer)}
                  onProducts={() => { setSelectedOfferId(offer.id); setProductsDialogOpen(true); }}
                  onDelete={() => deleteMutation.mutate(offer.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card className="py-12">
          <div className="text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد عروض خاصة</p>
            <p className="text-sm text-muted-foreground/70">أضف عروضاً جديدة لجذب العملاء</p>
          </div>
        </Card>
      )}

      {/* Products Dialog */}
      <Dialog open={productsDialogOpen} onOpenChange={setProductsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>منتجات العرض</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">اختر المنتجات المتاحة للعميل ضمن هذا العرض</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
            {allProducts?.map((product) => {
              const isSelected = offerProducts?.includes(product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => toggleProductMutation.mutate({ productId: product.id, add: !isSelected })}
                  className={`p-3 rounded-xl border-2 text-right transition-all ${
                    isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  }`}
                >
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                  )}
                  <p className="text-sm font-medium truncate">{product.name}</p>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSpecialOffers;

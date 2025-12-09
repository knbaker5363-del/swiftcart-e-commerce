import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Plus, Pencil, Trash2, Upload, X, Sparkles, Package } from 'lucide-react';
import { compressImageToFile } from '@/lib/imageCompression';

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

const AdminSpecialOffers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [uploading, setUploading] = useState(false);
  const [productsDialogOpen, setProductsDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [size, setSize] = useState('2x2');
  const [price, setPrice] = useState('');
  const [conditionText, setConditionText] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

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
      const offerData = {
        name,
        description: description || null,
        image_url: imageUrl || null,
        size,
        price: price ? parseFloat(price) : null,
        condition_text: conditionText || null,
        sort_order: sortOrder,
        is_active: isActive,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">العروض الخاصة</h1>
          <p className="text-muted-foreground mt-1">إدارة بانرات العروض الخاصة</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 ml-2" /> إضافة عرض</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
                <Label>صورة العرض</Label>
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

      {/* Offers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : offers && offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <Card key={offer.id} className={`overflow-hidden ${!offer.is_active ? 'opacity-50' : ''}`}>
              <div className="relative h-32">
                {offer.image_url ? (
                  <img src={offer.image_url} alt={offer.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-primary/30" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-muted/90 px-2 py-1 rounded text-xs">
                  {sizeOptions.find(s => s.id === offer.size)?.name || offer.size}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-1">{offer.name}</h3>
                {offer.condition_text && (
                  <p className="text-sm text-muted-foreground mb-2">{offer.condition_text}</p>
                )}
                {offer.price && (
                  <div className="text-primary font-bold">{offer.price} ₪</div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(offer)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { setSelectedOfferId(offer.id); setProductsDialogOpen(true); }}
                  >
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
                        <AlertDialogAction onClick={() => deleteMutation.mutate(offer.id)}>حذف</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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

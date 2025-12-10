import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Save, Home, Eye, Flame, Sparkles, Package, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SpecialOffer {
  id: string;
  name: string;
  image_url: string | null;
  size: string;
  offer_type: string;
  required_quantity: number;
  bundle_price: number | null;
  background_color: string;
  text_color: string;
  sort_order: number;
  is_active: boolean;
}

interface OffersGridEditorProps {
  offers: SpecialOffer[];
  onRefresh: () => void;
}

// Sortable offer item for homepage selection
const SortableOfferItem = ({ 
  offer, 
  index,
  isSelected,
  onToggle,
}: { 
  offer: SpecialOffer;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: offer.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
        isSelected 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'border-border bg-card hover:border-muted-foreground/30'
      } ${isDragging ? 'shadow-xl z-50' : ''}`}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Order number */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}>
        {index + 1}
      </div>

      {/* Offer preview */}
      <div 
        className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: offer.background_color }}
      >
        {offer.image_url ? (
          <img src={offer.image_url} alt={offer.name} className="w-full h-full object-cover" />
        ) : offer.offer_type === 'bundle' ? (
          <Flame className="h-6 w-6" style={{ color: `${offer.text_color}80` }} />
        ) : (
          <Sparkles className="h-6 w-6" style={{ color: `${offer.text_color}80` }} />
        )}
      </div>

      {/* Offer info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{offer.name}</p>
        {offer.offer_type === 'bundle' && offer.bundle_price && (
          <p className="text-xs text-muted-foreground">
            {offer.required_quantity} بـ {offer.bundle_price}₪
          </p>
        )}
      </div>

      {/* Toggle for homepage */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground hidden sm:block">الرئيسية</Label>
        <Switch 
          checked={isSelected}
          onCheckedChange={onToggle}
        />
      </div>
    </div>
  );
};

const OffersGridEditor = ({ offers, onRefresh }: OffersGridEditorProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>(() => {
    // Initially select first 4 offers with lowest sort_order
    return offers
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .slice(0, 4)
      .map(o => o.id);
  });
  const [orderedOffers, setOrderedOffers] = useState(offers);
  const [maxHomepageOffers, setMaxHomepageOffers] = useState(4);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedOffers.findIndex(o => o.id === active.id);
    const newIndex = orderedOffers.findIndex(o => o.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      setOrderedOffers(arrayMove(orderedOffers, oldIndex, newIndex));
    }
  };

  const toggleOfferSelection = (offerId: string) => {
    setSelectedOfferIds(prev => {
      if (prev.includes(offerId)) {
        return prev.filter(id => id !== offerId);
      } else {
        if (prev.length >= maxHomepageOffers) {
          toast({ 
            title: `الحد الأقصى ${maxHomepageOffers} عروض`, 
            description: 'قم بإلغاء تحديد عرض آخر أولاً',
            variant: 'destructive' 
          });
          return prev;
        }
        return [...prev, offerId];
      }
    });
  };

  const saveSelection = async () => {
    setSaving(true);
    try {
      // Update sort_order based on new order, with selected offers first
      const selectedOrdered = orderedOffers.filter(o => selectedOfferIds.includes(o.id));
      const unselectedOrdered = orderedOffers.filter(o => !selectedOfferIds.includes(o.id));
      
      let sortIndex = 0;
      
      // Selected offers get lower sort_order (appear first)
      for (const offer of selectedOrdered) {
        await supabase
          .from('special_offers')
          .update({ sort_order: sortIndex })
          .eq('id', offer.id);
        sortIndex++;
      }
      
      // Unselected offers get higher sort_order
      for (const offer of unselectedOrdered) {
        await supabase
          .from('special_offers')
          .update({ sort_order: sortIndex + 100 })
          .eq('id', offer.id);
        sortIndex++;
      }
      
      toast({ title: 'تم حفظ التغييرات بنجاح' });
      onRefresh();
    } catch (error) {
      toast({ title: 'حدث خطأ في الحفظ', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const selectedOffers = orderedOffers.filter(o => selectedOfferIds.includes(o.id));

  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Home className="h-5 w-5" />
            عروض الصفحة الرئيسية
          </h2>
          <p className="text-muted-foreground text-sm">اختر العروض التي تظهر في الصفحة الرئيسية وحدد ترتيبها</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
            <Label className="text-xs">الحد الأقصى:</Label>
            <Input 
              type="number" 
              value={maxHomepageOffers}
              onChange={(e) => setMaxHomepageOffers(Math.max(1, Math.min(8, parseInt(e.target.value) || 4)))}
              className="w-14 h-7 text-center text-sm"
              min={1}
              max={8}
            />
          </div>
          <Button
            size="sm"
            onClick={saveSelection}
            disabled={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offers List */}
        <Card className="p-4">
          <h3 className="font-bold mb-4 text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            جميع العروض
            <span className="text-muted-foreground font-normal">
              ({selectedOfferIds.length}/{maxHomepageOffers} مختار)
            </span>
          </h3>
          
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedOffers.map(o => o.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {orderedOffers.map((offer, index) => (
                  <SortableOfferItem
                    key={offer.id}
                    offer={offer}
                    index={index}
                    isSelected={selectedOfferIds.includes(offer.id)}
                    onToggle={() => toggleOfferSelection(offer.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <p className="text-xs text-muted-foreground text-center mt-4">
            💡 اسحب لتغيير الترتيب • فعّل الزر لإظهار العرض في الرئيسية
          </p>
        </Card>

        {/* Preview */}
        <Card className="p-4">
          <h3 className="font-bold mb-4 text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            معاينة الصفحة الرئيسية
          </h3>
          
          {selectedOffers.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {selectedOffers.slice(0, maxHomepageOffers).map((offer, index) => (
                <div
                  key={offer.id}
                  className="relative aspect-square rounded-xl overflow-hidden shadow-lg group"
                  style={{ 
                    background: offer.image_url ? undefined : `linear-gradient(135deg, ${offer.background_color}, ${offer.background_color}dd)`,
                  }}
                >
                  {/* Order badge */}
                  <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>

                  {offer.image_url ? (
                    <img
                      src={offer.image_url}
                      alt={offer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: offer.background_color }}
                    >
                      {offer.offer_type === 'bundle' ? (
                        <Flame className="h-10 w-10 opacity-30" style={{ color: offer.text_color }} />
                      ) : (
                        <Sparkles className="h-10 w-10 opacity-30" style={{ color: offer.text_color }} />
                      )}
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                    <div className="text-white">
                      <p className="font-bold text-sm line-clamp-1">{offer.name}</p>
                      {offer.bundle_price && (
                        <p className="text-xs opacity-80">
                          {offer.required_quantity} بـ {offer.bundle_price}₪
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-video bg-muted/50 rounded-xl flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Home className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لم يتم اختيار أي عروض</p>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-4">
            هذه هي العروض التي ستظهر في الصفحة الرئيسية
          </p>
        </Card>
      </div>
    </div>
  );
};

export default OffersGridEditor;

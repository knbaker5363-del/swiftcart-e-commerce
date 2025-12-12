import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Gift, Package, Edit, Save, Shuffle, MousePointer, Percent } from 'lucide-react';
import { calculateProbabilities } from '@/lib/weightedRandom';

interface GiftOffer {
  id: string;
  name: string;
  minimum_amount: number;
  is_active: boolean;
  gift_type: 'choice' | 'random';
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
}

interface GiftProductWithWeight {
  product_id: string;
  weight: number;
}

const AdminGifts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<GiftOffer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    minimum_amount: 100,
    gift_type: 'choice' as 'choice' | 'random',
  });
  const [selectedProducts, setSelectedProducts] = useState<GiftProductWithWeight[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [currentOfferId, setCurrentOfferId] = useState<string | null>(null);
  const [currentOfferType, setCurrentOfferType] = useState<'choice' | 'random'>('choice');

  // Fetch gift offers
  const { data: giftOffers, isLoading: offersLoading } = useQuery({
    queryKey: ['admin-gift-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gift_offers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GiftOffer[];
    },
  });

  // Fetch all products
  const { data: products } = useQuery({
    queryKey: ['admin-products-for-gifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url, price')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Product[];
    },
  });

  // Fetch gift products with weights for a specific offer
  const fetchGiftProducts = async (offerId: string) => {
    const { data, error } = await supabase
      .from('gift_products')
      .select('product_id, weight')
      .eq('gift_offer_id', offerId);
    if (error) throw error;
    return data.map((gp) => ({ 
      product_id: gp.product_id, 
      weight: gp.weight || 100 
    }));
  };

  // Create gift offer
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; minimum_amount: number; gift_type: string }) => {
      const { data: offer, error } = await supabase
        .from('gift_offers')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gift-offers'] });
      toast({ title: 'تم إنشاء عرض الهدايا بنجاح' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'خطأ في إنشاء العرض', variant: 'destructive' });
    },
  });

  // Update gift offer
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GiftOffer> }) => {
      const { error } = await supabase
        .from('gift_offers')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gift-offers'] });
      toast({ title: 'تم تحديث العرض' });
      setIsDialogOpen(false);
      setEditingOffer(null);
      resetForm();
    },
    onError: () => {
      toast({ title: 'خطأ في التحديث', variant: 'destructive' });
    },
  });

  // Delete gift offer
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gift_offers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gift-offers'] });
      toast({ title: 'تم حذف العرض' });
    },
    onError: () => {
      toast({ title: 'خطأ في الحذف', variant: 'destructive' });
    },
  });

  // Update gift products with weights
  const updateGiftProductsMutation = useMutation({
    mutationFn: async ({ offerId, products }: { offerId: string; products: GiftProductWithWeight[] }) => {
      // Delete existing
      await supabase.from('gift_products').delete().eq('gift_offer_id', offerId);
      // Insert new with weights
      if (products.length > 0) {
        const { error } = await supabase.from('gift_products').insert(
          products.map((p) => ({ 
            gift_offer_id: offerId, 
            product_id: p.product_id,
            weight: p.weight
          }))
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: 'تم تحديث منتجات الهدايا' });
      setIsProductDialogOpen(false);
      setCurrentOfferId(null);
      setSelectedProducts([]);
    },
    onError: () => {
      toast({ title: 'خطأ في تحديث المنتجات', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', minimum_amount: 100, gift_type: 'choice' });
    setEditingOffer(null);
  };

  const handleEdit = (offer: GiftOffer) => {
    setEditingOffer(offer);
    setFormData({ 
      name: offer.name, 
      minimum_amount: offer.minimum_amount,
      gift_type: offer.gift_type || 'choice'
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOffer) {
      updateMutation.mutate({ id: editingOffer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleOpenProductDialog = async (offerId: string, giftType: 'choice' | 'random') => {
    setCurrentOfferId(offerId);
    setCurrentOfferType(giftType);
    const giftProducts = await fetchGiftProducts(offerId);
    setSelectedProducts(giftProducts);
    setIsProductDialogOpen(true);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) => {
      const existing = prev.find(p => p.product_id === productId);
      if (existing) {
        return prev.filter((p) => p.product_id !== productId);
      } else {
        return [...prev, { product_id: productId, weight: 100 }];
      }
    });
  };

  const updateProductWeight = (productId: string, weight: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.product_id === productId ? { ...p, weight } : p
      )
    );
  };

  const handleSaveProducts = () => {
    if (currentOfferId) {
      updateGiftProductsMutation.mutate({ offerId: currentOfferId, products: selectedProducts });
    }
  };

  const toggleActive = (offer: GiftOffer) => {
    updateMutation.mutate({ id: offer.id, data: { is_active: !offer.is_active } });
  };

  // Calculate probabilities for display
  const productsWithProbabilities = calculateProbabilities(
    selectedProducts.map(sp => ({
      ...sp,
      id: sp.product_id
    }))
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gift className="h-8 w-8" />
            إدارة الهدايا والعروض
          </h1>
          <p className="text-muted-foreground mt-1">
            أنشئ عروض هدايا للعملاء عند الشراء بمبلغ معين
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة عرض جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? 'تعديل عرض الهدايا' : 'إضافة عرض هدايا جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم العرض</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: عرض الصيف"
                  required
                />
              </div>
              <div>
                <Label htmlFor="minimum_amount">الحد الأدنى للشراء (₪)</Label>
                <Input
                  id="minimum_amount"
                  type="number"
                  value={formData.minimum_amount}
                  onChange={(e) => setFormData({ ...formData, minimum_amount: Number(e.target.value) })}
                  min="1"
                  required
                />
              </div>
              <div>
                <Label>نوع الهدية</Label>
                <Select
                  value={formData.gift_type}
                  onValueChange={(value: 'choice' | 'random') => 
                    setFormData({ ...formData, gift_type: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="choice">
                      <div className="flex items-center gap-2">
                        <MousePointer className="h-4 w-4" />
                        <span>العميل يختار</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="random">
                      <div className="flex items-center gap-2">
                        <Shuffle className="h-4 w-4" />
                        <span>هدية عشوائية</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.gift_type === 'choice' 
                    ? 'سيختار العميل هديته من القائمة المحددة'
                    : 'سيحصل العميل على هدية عشوائية بناءً على نسب الظهور'}
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="ml-2 h-4 w-4" />
                {editingOffer ? 'تحديث' : 'إنشاء'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gift Offers List */}
      {offersLoading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : giftOffers && giftOffers.length > 0 ? (
        <div className="grid gap-4">
          {giftOffers.map((offer) => (
            <Card key={offer.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {offer.gift_type === 'random' ? (
                      <Shuffle className="h-6 w-6 text-purple-500" />
                    ) : (
                      <Gift className="h-6 w-6 text-primary" />
                    )}
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {offer.name}
                        <Badge variant="outline" className="text-xs">
                          {offer.gift_type === 'random' ? '🎲 عشوائي' : '🎯 اختيار'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        اشترِ بـ {offer.minimum_amount} ₪ واحصل على هدية
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={offer.is_active ? 'default' : 'secondary'}>
                      {offer.is_active ? 'فعال' : 'معطل'}
                    </Badge>
                    <Switch
                      checked={offer.is_active}
                      onCheckedChange={() => toggleActive(offer)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenProductDialog(offer.id, offer.gift_type || 'choice')}
                    className="gap-2"
                  >
                    <Package className="h-4 w-4" />
                    إدارة منتجات الهدايا
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(offer)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(offer.id)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">لا توجد عروض هدايا</h3>
            <p className="text-muted-foreground">
              أنشئ عرض هدايا لجذب المزيد من العملاء
            </p>
          </CardContent>
        </Card>
      )}

      {/* Product Selection Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentOfferType === 'random' ? (
                <>
                  <Shuffle className="h-5 w-5 text-purple-500" />
                  اختر منتجات الهدايا وحدد نسب الظهور
                </>
              ) : (
                <>
                  <Gift className="h-5 w-5 text-primary" />
                  اختر منتجات الهدايا
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Probability visualization for random type */}
          {currentOfferType === 'random' && selectedProducts.length > 0 && (
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Percent className="h-4 w-4" />
                توزيع نسب الظهور:
              </p>
              <div className="flex h-6 rounded-full overflow-hidden">
                {productsWithProbabilities.map((p, idx) => {
                  const product = products?.find(pr => pr.id === p.product_id);
                  const colors = ['bg-primary', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-green-500'];
                  return (
                    <div
                      key={p.product_id}
                      className={`${colors[idx % colors.length]} flex items-center justify-center text-xs text-white font-medium`}
                      style={{ width: `${p.probability}%` }}
                      title={`${product?.name}: ${p.probability.toFixed(1)}%`}
                    >
                      {p.probability >= 10 && `${p.probability.toFixed(0)}%`}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {products?.map((product) => {
              const selectedProduct = selectedProducts.find(sp => sp.product_id === product.id);
              const isSelected = !!selectedProduct;
              const probability = productsWithProbabilities.find(p => p.product_id === product.id)?.probability || 0;

              return (
                <Card
                  key={product.id}
                  className={`p-3 transition-all ${
                    isSelected
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div 
                        className="cursor-pointer"
                        onClick={() => toggleProductSelection(product.id)}
                      >
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-20 object-cover rounded mb-2"
                          />
                        )}
                        <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.price} ₪</p>
                      </div>

                      {/* Weight slider for random type */}
                      {currentOfferType === 'random' && isSelected && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">نسبة الظهور:</span>
                            <Badge variant="outline" className="text-xs">
                              {probability.toFixed(1)}%
                            </Badge>
                          </div>
                          <Slider
                            value={[selectedProduct?.weight || 100]}
                            onValueChange={([value]) => updateProductWeight(product.id, value)}
                            min={1}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>نادر</span>
                            <span>الوزن: {selectedProduct?.weight}</span>
                            <span>شائع</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSaveProducts} className="flex-1">
              <Save className="ml-2 h-4 w-4" />
              حفظ ({selectedProducts.length} منتج)
            </Button>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGifts;

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const AdminProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    additional_images: [] as string[],
    is_active: true,
    discount_percentage: 0,
    discount_end_date: '',
  });
  const [options, setOptions] = useState<{ sizes: string[]; colors: string[] }>({
    sizes: [],
    colors: [],
  });
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('#000000');
  const [uploading, setUploading] = useState(false);

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('products').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'تم إضافة المنتج بنجاح' });
      resetForm();
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('products').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'تم تحديث المنتج بنجاح' });
      resetForm();
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'تم حذف المنتج بنجاح' });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: 'خطأ في رفع الصورة', variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    setFormData({ ...formData, image_url: publicUrl });
    setUploading(false);
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: 'خطأ في رفع الصورة', variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    setFormData({ 
      ...formData, 
      additional_images: [...formData.additional_images, publicUrl] 
    });
    setUploading(false);
    toast({ title: 'تم إضافة الصورة بنجاح' });
  };

  const removeAdditionalImage = (index: number) => {
    setFormData({
      ...formData,
      additional_images: formData.additional_images.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id) {
      toast({ title: 'الرجاء اختيار التصنيف', variant: 'destructive' });
      return;
    }
    
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      category_id: formData.category_id || null,
      options: options,
      discount_percentage: parseFloat(formData.discount_percentage.toString()) || 0,
      discount_end_date: formData.discount_end_date || null,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      additional_images: [],
      is_active: true,
      discount_percentage: 0,
      discount_end_date: '',
    });
    setOptions({ sizes: [], colors: [] });
    setEditingProduct(null);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id,
      image_url: product.image_url || '',
      additional_images: (product.additional_images as string[]) || [],
      is_active: product.is_active,
      discount_percentage: product.discount_percentage || 0,
      discount_end_date: product.discount_end_date || '',
    });
    setOptions(product.options || { sizes: [], colors: [] });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-button">
              <Plus className="ml-2 h-4 w-4" />
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>الاسم *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>الوصف</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>السعر *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>التصنيف *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger className={!formData.category_id ? 'border-destructive' : ''}>
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!formData.category_id && (
                    <p className="text-xs text-destructive mt-1">التصنيف مطلوب</p>
                  )}
                </div>
              </div>

              {/* Discount Section */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-destructive">%</span>
                  إعدادات الخصم
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>نسبة الخصم (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.discount_percentage > 0 && formData.price && 
                        `السعر بعد الخصم: ${(parseFloat(formData.price) * (1 - formData.discount_percentage / 100)).toFixed(2)} ₪`
                      }
                    </p>
                  </div>
                  <div>
                    <Label>تاريخ انتهاء الخصم</Label>
                    <Input
                      type="date"
                      value={formData.discount_end_date}
                      onChange={(e) => setFormData({ ...formData, discount_end_date: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">اتركه فارغاً إذا لم يكن هناك تاريخ محدد</p>
                  </div>
                </div>
              </div>
              <div>
                <Label>صورة المنتج الرئيسية</Label>
                <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded" />
                )}
              </div>

              <div>
                <Label>صور إضافية للمنتج</Label>
                <Input type="file" accept="image/*" onChange={handleAdditionalImageUpload} disabled={uploading} />
                {formData.additional_images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.additional_images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`صورة ${idx + 1}`} className="h-24 w-24 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(idx)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">يمكنك إضافة عدة صور. تظهر عند hover على المنتج.</p>
              </div>

              <div>
                <Label>المقاسات</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="أضف مقاس"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newSize.trim()) {
                        setOptions({ ...options, sizes: [...options.sizes, newSize.trim()] });
                        setNewSize('');
                      }
                    }}
                  >
                    إضافة
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {options.sizes.map((size, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full">
                      {size}
                      <button
                        type="button"
                        onClick={() => setOptions({ ...options, sizes: options.sizes.filter((_, idx) => idx !== i) })}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>الألوان</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newColor) {
                        setOptions({ ...options, colors: [...options.colors, newColor] });
                        setNewColor('#000000');
                      }
                    }}
                  >
                    إضافة
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {options.colors.map((color, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                      <span 
                        className="w-5 h-5 rounded-full border border-border" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs">{color}</span>
                      <button
                        type="button"
                        onClick={() => setOptions({ ...options, colors: options.colors.filter((_, idx) => idx !== i) })}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>نشط</Label>
              </div>

              <Button type="submit" className="w-full bg-gradient-primary">
                {editingProduct ? 'تحديث' : 'إضافة'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {products?.map((product) => (
          <Card key={product.id} className="p-4 shadow-card">
            <div className="flex gap-4">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.categories?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {product.discount_percentage > 0 ? (
                    <>
                      <p className="text-primary font-semibold">
                        {(product.price * (1 - product.discount_percentage / 100)).toFixed(2)} ₪
                      </p>
                      <p className="text-sm text-muted-foreground line-through">
                        {product.price.toFixed(2)} ₪
                      </p>
                      <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded">
                        خصم {product.discount_percentage}%
                      </span>
                    </>
                  ) : (
                    <p className="text-primary font-semibold">{product.price.toFixed(2)} ₪</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.is_active ? '✓ نشط' : '✗ غير نشط'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteMutation.mutate(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
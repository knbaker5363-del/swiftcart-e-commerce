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
import { compressImageToFile, isImageFile } from '@/lib/imageCompression';

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
  // New structure: sizes can have pricing info
  interface SizeOption {
    name: string;
    price_type: 'base' | 'fixed' | 'addition'; // base = use product price, fixed = specific price, addition = add to base price
    price_value: number | null; // null for base, actual value for fixed/addition
  }

  interface AddOnOption {
    name: string;
    price: number;
  }

  interface CustomVariantOption {
    value: string;
    price_addition: number;
  }

  interface CustomVariant {
    name: string;
    options: CustomVariantOption[];
  }
  
  const [options, setOptions] = useState<{ sizes: SizeOption[]; colors: string[]; addons: AddOnOption[]; customVariants: CustomVariant[] }>({
    sizes: [],
    colors: [],
    addons: [],
    customVariants: [],
  });
  const [newSize, setNewSize] = useState('');
  const [newSizePriceType, setNewSizePriceType] = useState<'base' | 'fixed' | 'addition'>('base');
  const [newSizePriceValue, setNewSizePriceValue] = useState('');
  const [newColor, setNewColor] = useState('#000000');
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantOption, setNewVariantOption] = useState('');
  const [newVariantOptionPrice, setNewVariantOptionPrice] = useState('');
  const [currentVariantIndex, setCurrentVariantIndex] = useState<number | null>(null);
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
    try {
      // Compress image before upload
      let fileToUpload: File | Blob = file;
      if (isImageFile(file)) {
        toast({ title: 'جاري ضغط الصورة...' });
        fileToUpload = await compressImageToFile(file);
      }
      
      const fileName = `${Date.now()}-${(fileToUpload as File).name || 'image.webp'}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, fileToUpload);

      if (uploadError) {
        toast({ title: 'خطأ في رفع الصورة', variant: 'destructive' });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast({ title: 'تم رفع الصورة بنجاح' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'خطأ في معالجة الصورة', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Compress image before upload
      let fileToUpload: File | Blob = file;
      if (isImageFile(file)) {
        toast({ title: 'جاري ضغط الصورة...' });
        fileToUpload = await compressImageToFile(file);
      }
      
      const fileName = `${Date.now()}-${(fileToUpload as File).name || 'image.webp'}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, fileToUpload);

      if (uploadError) {
        toast({ title: 'خطأ في رفع الصورة', variant: 'destructive' });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData({ 
        ...formData, 
        additional_images: [...formData.additional_images, publicUrl] 
      });
      toast({ title: 'تم إضافة الصورة بنجاح' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'خطأ في معالجة الصورة', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
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
    setOptions({ sizes: [], colors: [], addons: [], customVariants: [] });
    setNewSizePriceType('base');
    setNewSizePriceValue('');
    setNewAddonName('');
    setNewAddonPrice('');
    setNewVariantName('');
    setNewVariantOption('');
    setNewVariantOptionPrice('');
    setCurrentVariantIndex(null);
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
    // Handle old format (array of strings) vs new format (array of objects)
    const productOptions = product.options || { sizes: [], colors: [], addons: [] };
    const normalizedSizes = (productOptions.sizes || []).map((size: any) => {
      if (typeof size === 'string') {
        return { name: size, price_type: 'base', price_value: null };
      }
      return size;
    });
    setOptions({ 
      sizes: normalizedSizes, 
      colors: productOptions.colors || [],
      addons: productOptions.addons || [],
      customVariants: productOptions.customVariants || []
    });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
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

              <div className="p-4 border rounded-lg bg-muted/30">
                <Label className="text-base font-semibold mb-3 block">المقاسات مع التسعير</Label>
                <div className="space-y-3 mb-4">
                  <div className="flex gap-2 flex-wrap">
                    <Input
                      placeholder="اسم المقاس (مثل: S, M, L)"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="flex-1 min-w-[120px]"
                    />
                    <Select
                      value={newSizePriceType}
                      onValueChange={(value: 'base' | 'fixed' | 'addition') => setNewSizePriceType(value)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base">السعر الأساسي</SelectItem>
                        <SelectItem value="fixed">سعر مختلف</SelectItem>
                        <SelectItem value="addition">إضافة على السعر</SelectItem>
                      </SelectContent>
                    </Select>
                    {newSizePriceType !== 'base' && (
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={newSizePriceType === 'fixed' ? 'السعر' : 'الإضافة'}
                        value={newSizePriceValue}
                        onChange={(e) => setNewSizePriceValue(e.target.value)}
                        className="w-[100px]"
                      />
                    )}
                    <Button
                      type="button"
                      onClick={() => {
                        if (newSize.trim()) {
                          const priceValue = newSizePriceType !== 'base' ? parseFloat(newSizePriceValue) || 0 : null;
                          setOptions({ 
                            ...options, 
                            sizes: [...options.sizes, { 
                              name: newSize.trim(), 
                              price_type: newSizePriceType,
                              price_value: priceValue
                            }] 
                          });
                          setNewSize('');
                          setNewSizePriceType('base');
                          setNewSizePriceValue('');
                        }
                      }}
                    >
                      إضافة
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    • السعر الأساسي: يستخدم سعر المنتج | سعر مختلف: سعر خاص للمقاس | إضافة: زيادة على السعر الأساسي
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {options.sizes.map((size, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-3 py-2 bg-background border rounded-lg">
                      <span className="font-medium">{size.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {size.price_type === 'base' && 'السعر الأساسي'}
                        {size.price_type === 'fixed' && `سعر مختلف: ${size.price_value} ₪`}
                        {size.price_type === 'addition' && `+${size.price_value} ₪`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOptions({ ...options, sizes: options.sizes.filter((_, idx) => idx !== i) })}
                        className="text-destructive hover:text-destructive/80"
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

              {/* Add-ons Section */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <Label className="text-base font-semibold mb-3 block">الإضافات (مثل: إضافة بطاطا، صوص إضافي)</Label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <Input
                    placeholder="اسم الإضافة"
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                    className="flex-1 min-w-[150px]"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="السعر الإضافي"
                    value={newAddonPrice}
                    onChange={(e) => setNewAddonPrice(e.target.value)}
                    className="w-[120px]"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newAddonName.trim()) {
                        setOptions({
                          ...options,
                          addons: [...options.addons, { 
                            name: newAddonName.trim(), 
                            price: parseFloat(newAddonPrice) || 0 
                          }]
                        });
                        setNewAddonName('');
                        setNewAddonPrice('');
                      }
                    }}
                  >
                    إضافة
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {options.addons.map((addon, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-3 py-2 bg-background border rounded-lg">
                      <span className="font-medium">{addon.name}</span>
                      <span className="text-xs text-muted-foreground">+{addon.price} ₪</span>
                      <button
                        type="button"
                        onClick={() => setOptions({ ...options, addons: options.addons.filter((_, idx) => idx !== i) })}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {options.addons.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    أضف إضافات اختيارية للمنتج (مثل: إضافة جبنة، صوص حار، إلخ)
                  </p>
                )}
              </div>

              {/* Custom Variants Section */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <Label className="text-base font-semibold mb-3 block">متغيرات إضافية (مثل: حجم، نكهة)</Label>
                
                {/* Add New Variant Group */}
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="اسم المتغير (مثل: حجم، نكهة)"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newVariantName.trim()) {
                        setOptions({
                          ...options,
                          customVariants: [...options.customVariants, { 
                            name: newVariantName.trim(), 
                            options: [] 
                          }]
                        });
                        setNewVariantName('');
                        setCurrentVariantIndex(options.customVariants.length);
                      }
                    }}
                  >
                    إضافة متغير
                  </Button>
                </div>

                {/* Display Existing Variants */}
                <div className="space-y-4">
                  {options.customVariants.map((variant, variantIdx) => (
                    <div key={variantIdx} className="p-3 bg-background border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">{variant.name}</span>
                        <button
                          type="button"
                          onClick={() => setOptions({
                            ...options,
                            customVariants: options.customVariants.filter((_, idx) => idx !== variantIdx)
                          })}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Add Option to this Variant */}
                      {currentVariantIndex === variantIdx && (
                        <div className="flex gap-2 mb-2 flex-wrap">
                          <Input
                            placeholder="القيمة (مثل: صغير)"
                            value={newVariantOption}
                            onChange={(e) => setNewVariantOption(e.target.value)}
                            className="flex-1 min-w-[120px]"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="سعر إضافي"
                            value={newVariantOptionPrice}
                            onChange={(e) => setNewVariantOptionPrice(e.target.value)}
                            className="w-[100px]"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              if (newVariantOption.trim()) {
                                const updatedVariants = [...options.customVariants];
                                updatedVariants[variantIdx].options.push({
                                  value: newVariantOption.trim(),
                                  price_addition: parseFloat(newVariantOptionPrice) || 0
                                });
                                setOptions({ ...options, customVariants: updatedVariants });
                                setNewVariantOption('');
                                setNewVariantOptionPrice('');
                              }
                            }}
                          >
                            إضافة
                          </Button>
                        </div>
                      )}
                      
                      {currentVariantIndex !== variantIdx && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentVariantIndex(variantIdx)}
                          className="mb-2"
                        >
                          إضافة خيار
                        </Button>
                      )}
                      
                      {/* Display Options */}
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((opt, optIdx) => (
                          <span key={optIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                            <span>{opt.value}</span>
                            {opt.price_addition > 0 && (
                              <span className="text-xs text-muted-foreground">+{opt.price_addition}₪</span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const updatedVariants = [...options.customVariants];
                                updatedVariants[variantIdx].options = updatedVariants[variantIdx].options.filter((_, idx) => idx !== optIdx);
                                setOptions({ ...options, customVariants: updatedVariants });
                              }}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {options.customVariants.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    أضف متغيرات مخصصة للمنتج (مثل: حجم المشروب - صغير/وسط/كبير)
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>نشط</Label>
              </div>

              <Button type="submit" className="w-full">
                {editingProduct ? 'تحديث' : 'إضافة'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {products?.map((product) => (
          <Card key={product.id} className="p-4 shadow-card overflow-hidden">
            <div className="flex gap-4 flex-wrap sm:flex-nowrap">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{product.categories?.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {product.discount_percentage > 0 ? (
                    <>
                      <p className="text-primary font-semibold text-sm">
                        {(product.price * (1 - product.discount_percentage / 100)).toFixed(2)} ₪
                      </p>
                      <p className="text-xs text-muted-foreground line-through">
                        {product.price.toFixed(2)} ₪
                      </p>
                      <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded">
                        خصم {product.discount_percentage}%
                      </span>
                    </>
                  ) : (
                    <p className="text-primary font-semibold text-sm">{product.price.toFixed(2)} ₪</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {product.is_active ? '✓ نشط' : '✗ غير نشط'}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0 self-start">
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
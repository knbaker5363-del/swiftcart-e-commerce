import { useState, lazy, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Image, Grid, List, Check, Settings2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categoryIcons } from '@/lib/categoryIcons';
import { useSettings } from '@/contexts/SettingsContext';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof dynamicIconImports;
}

// Dynamic icon component
const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  const LucideIcon = lazy(dynamicIconImports[name]);
  return (
    <Suspense fallback={<div className="w-5 h-5 bg-muted rounded animate-pulse" />}>
      <LucideIcon {...props} />
    </Suspense>
  );
};

// Icon picker component
const IconPicker = ({ 
  selectedIcon, 
  onSelect 
}: { 
  selectedIcon: string | null; 
  onSelect: (iconId: string | null) => void;
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>اختر أيقونة</Label>
        {selectedIcon && (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={() => onSelect(null)}
          >
            إزالة الأيقونة
          </Button>
        )}
      </div>
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[300px] overflow-y-auto p-2 border rounded-lg bg-muted/30">
        {categoryIcons.map((icon) => {
          const iconName = icon.icon.charAt(0).toLowerCase() + icon.icon.slice(1).replace(/([A-Z])/g, '-$1').toLowerCase() as keyof typeof dynamicIconImports;
          return (
            <button
              key={icon.id}
              type="button"
              onClick={() => onSelect(icon.icon)}
              title={icon.name}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                selectedIcon === icon.icon
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                  : 'bg-background hover:bg-muted border border-border hover:border-primary/50'
              }`}
            >
              <DynamicIcon name={iconName} className="h-5 w-5" />
              <span className="text-[10px] mt-1 truncate w-full text-center">{icon.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AdminCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings, refreshSettings } = useSettings();
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', image_url: '', icon_name: '' as string | null });
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'icon'>('image');
  
  // Category display settings
  const [categoryDisplayStyle, setCategoryDisplayStyle] = useState(
    (settings as any)?.category_display_style || 'grid'
  );
  const [showBrandsButton, setShowBrandsButton] = useState(
    (settings as any)?.show_brands_button !== false
  );

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('categories').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'تم إضافة التصنيف بنجاح' });
      resetForm();
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('categories').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'تم تحديث التصنيف بنجاح' });
      resetForm();
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'تم حذف التصنيف بنجاح' });
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

    setFormData({ ...formData, image_url: publicUrl, icon_name: null });
    setActiveTab('image');
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      name: formData.name,
      image_url: formData.image_url || null,
      icon_name: formData.icon_name || null,
    };
    
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', image_url: '', icon_name: null });
    setEditingCategory(null);
    setActiveTab('image');
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      image_url: category.image_url || '',
      icon_name: category.icon_name || null
    });
    setActiveTab(category.icon_name ? 'icon' : 'image');
    setOpen(true);
  };

  const handleIconSelect = (iconName: string | null) => {
    setFormData({ ...formData, icon_name: iconName, image_url: iconName ? '' : formData.image_url });
  };

  // Save display settings
  const handleSaveDisplaySettings = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          category_display_style: categoryDisplayStyle,
          show_brands_button: showBrandsButton,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings?.id);

      if (error) throw error;

      await refreshSettings();
      
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات العرض بنجاح',
      });
    } catch (error) {
      console.error('Error saving display settings:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ الإعدادات',
        variant: 'destructive',
      });
    }
  };

  // Get icon component for display
  const getCategoryIcon = (iconName: string) => {
    const iconId = iconName.charAt(0).toLowerCase() + iconName.slice(1).replace(/([A-Z])/g, '-$1').toLowerCase() as keyof typeof dynamicIconImports;
    return <DynamicIcon name={iconId} className="h-12 w-12 text-primary" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة التصنيفات</h1>
        <p className="text-muted-foreground mt-2">إضافة وتعديل تصنيفات المنتجات وإعدادات العرض</p>
      </div>

      {/* إعدادات عرض التصنيفات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            إعدادات عرض التصنيفات
          </CardTitle>
          <CardDescription>تخصيص طريقة عرض التصنيفات في الصفحة الرئيسية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* نوع عرض التصنيفات */}
          <div>
            <Label className="text-base font-medium mb-3 block">طريقة عرض التصنيفات</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setCategoryDisplayStyle('grid')}
                className={`p-4 rounded-lg border-2 text-right transition-all ${
                  categoryDisplayStyle === 'grid'
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="grid grid-cols-2 gap-1 w-8 h-8">
                    <div className="bg-primary/30 rounded"></div>
                    <div className="bg-primary/30 rounded"></div>
                    <div className="bg-primary/30 rounded"></div>
                    <div className="bg-primary/30 rounded"></div>
                  </div>
                  <span className="font-semibold">مربعات مع صور/أيقونات</span>
                  {categoryDisplayStyle === 'grid' && <Check className="h-4 w-4 text-primary mr-auto" />}
                </div>
                <p className="text-sm text-muted-foreground">عرض التصنيفات كمربعات مع صور أو أيقونات كبيرة</p>
              </button>
              
              <button
                type="button"
                onClick={() => setCategoryDisplayStyle('list')}
                className={`p-4 rounded-lg border-2 text-right transition-all ${
                  categoryDisplayStyle === 'list'
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex flex-col gap-1 w-8 h-8 justify-center">
                    <div className="bg-primary/30 rounded h-2 w-full"></div>
                    <div className="bg-primary/30 rounded h-2 w-full"></div>
                    <div className="bg-primary/30 rounded h-2 w-full"></div>
                  </div>
                  <span className="font-semibold">مستطيلات نصية</span>
                  {categoryDisplayStyle === 'list' && <Check className="h-4 w-4 text-primary mr-auto" />}
                </div>
                <p className="text-sm text-muted-foreground">عرض أسماء التصنيفات فقط بدون صور</p>
              </button>
              
              <button
                type="button"
                onClick={() => setCategoryDisplayStyle('icon-list')}
                className={`p-4 rounded-lg border-2 text-right transition-all ${
                  categoryDisplayStyle === 'icon-list'
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex flex-col gap-1 w-8 h-8 justify-center">
                    <div className="flex gap-1 items-center">
                      <div className="bg-primary/30 rounded w-3 h-3"></div>
                      <div className="bg-primary/30 rounded h-2 flex-1"></div>
                    </div>
                    <div className="flex gap-1 items-center">
                      <div className="bg-primary/30 rounded w-3 h-3"></div>
                      <div className="bg-primary/30 rounded h-2 flex-1"></div>
                    </div>
                  </div>
                  <span className="font-semibold">أيقونة صغيرة مع اسم</span>
                  {categoryDisplayStyle === 'icon-list' && <Check className="h-4 w-4 text-primary mr-auto" />}
                </div>
                <p className="text-sm text-muted-foreground">أيقونة صغيرة على اليمين مع اسم التصنيف</p>
              </button>
            </div>
          </div>

          {/* إظهار/إخفاء البراندات */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="showBrandsButton" className="text-base font-medium">
                إظهار زر البراندات
              </Label>
              <p className="text-sm text-muted-foreground">
                إظهار زر "البراندات الخاصة بنا" في الصفحة الرئيسية
              </p>
            </div>
            <Switch
              id="showBrandsButton"
              checked={showBrandsButton}
              onCheckedChange={setShowBrandsButton}
            />
          </div>

          <Button onClick={handleSaveDisplaySettings}>
            حفظ إعدادات العرض
          </Button>
        </CardContent>
      </Card>

      {/* قائمة التصنيفات */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>التصنيفات</CardTitle>
              <CardDescription>إدارة تصنيفات المنتجات</CardDescription>
            </div>
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة تصنيف
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl" className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>اسم التصنيف *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'icon')}>
                    <TabsList className="w-full">
                      <TabsTrigger value="image" className="flex-1">
                        <Image className="h-4 w-4 ml-2" />
                        صورة
                      </TabsTrigger>
                      <TabsTrigger value="icon" className="flex-1">
                        <Grid className="h-4 w-4 ml-2" />
                        أيقونة
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="image" className="space-y-3">
                      <div>
                        <Label>صورة التصنيف</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        {formData.image_url && (
                          <div className="relative mt-2">
                            <img
                              src={formData.image_url}
                              alt="Preview"
                              className="h-32 w-full object-cover rounded"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 left-2"
                              onClick={() => setFormData({ ...formData, image_url: '' })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="icon">
                      <IconPicker 
                        selectedIcon={formData.icon_name} 
                        onSelect={handleIconSelect}
                      />
                    </TabsContent>
                  </Tabs>

                  <Button type="submit" className="w-full">
                    {editingCategory ? 'تحديث' : 'إضافة'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories?.map((category: any) => (
              <Card key={category.id} className="overflow-hidden shadow-card">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-40 object-cover"
                  />
                ) : category.icon_name ? (
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    {getCategoryIcon(category.icon_name)}
                  </div>
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    <Image className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-3">{category.name}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="ml-1 h-4 w-4" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => deleteMutation.mutate(category.id)}
                    >
                      <Trash2 className="ml-1 h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {categories?.length === 0 && (
            <div className="text-center py-12">
              <Grid className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد تصنيفات بعد</p>
              <p className="text-sm text-muted-foreground">أضف تصنيفات لتنظيم منتجاتك</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategories;

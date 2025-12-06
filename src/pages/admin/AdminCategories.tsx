import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Image, Grid3X3, Check, Settings2, GripVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getIconByName, getAvailableIconNames } from '@/lib/categoryIcons';
import { useSettings } from '@/contexts/SettingsContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Predefined background colors
const bgColorOptions = [
  { id: 'default', name: 'افتراضي', color: null },
  { id: 'red', name: 'أحمر', color: '#FEE2E2' },
  { id: 'orange', name: 'برتقالي', color: '#FFEDD5' },
  { id: 'yellow', name: 'أصفر', color: '#FEF3C7' },
  { id: 'green', name: 'أخضر', color: '#DCFCE7' },
  { id: 'teal', name: 'فيروزي', color: '#CCFBF1' },
  { id: 'blue', name: 'أزرق', color: '#DBEAFE' },
  { id: 'indigo', name: 'نيلي', color: '#E0E7FF' },
  { id: 'purple', name: 'بنفسجي', color: '#F3E8FF' },
  { id: 'pink', name: 'وردي', color: '#FCE7F3' },
  { id: 'rose', name: 'زهري', color: '#FFE4E6' },
  { id: 'gray', name: 'رمادي', color: '#F3F4F6' },
];

// Render icon by name
const RenderIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  const IconComponent = getIconByName(iconName);
  if (!IconComponent) {
    return <Grid3X3 className={className} />;
  }
  return <IconComponent className={className} />;
};

// Icon picker component
// Icon picker component with search
const IconPicker = ({ 
  selectedIcon, 
  onSelect 
}: { 
  selectedIcon: string | null; 
  onSelect: (iconId: string | null) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const availableIcons = getAvailableIconNames();
  
  const filteredIcons = availableIcons.filter(iconName => 
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>اختر أيقونة (اكتب اسم الأيقونة بالإنجليزية)</Label>
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
      
      {/* Search input */}
      <Input
        placeholder="ابحث عن أيقونة... مثل: Home, Star, Heart"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />
      
      {/* Selected icon preview */}
      {selectedIcon && (
        <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
          <RenderIcon iconName={selectedIcon} className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium">{selectedIcon}</span>
        </div>
      )}
      
      {/* Icons grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[250px] overflow-y-auto p-2 border rounded-lg bg-muted/30">
        {filteredIcons.slice(0, 100).map((iconName) => (
          <button
            key={iconName}
            type="button"
            onClick={() => onSelect(iconName)}
            title={iconName}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
              selectedIcon === iconName
                ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                : 'bg-background hover:bg-muted border border-border hover:border-primary/50'
            }`}
          >
            <RenderIcon iconName={iconName} className="h-5 w-5" />
            <span className="text-[8px] mt-1 truncate w-full text-center">{iconName}</span>
          </button>
        ))}
      </div>
      
      {filteredIcons.length > 100 && (
        <p className="text-xs text-muted-foreground text-center">
          يظهر أول 100 نتيجة - استخدم البحث لإيجاد أيقونات أخرى
        </p>
      )}
    </div>
  );
};

// Color picker component
const ColorPicker = ({
  selectedColor,
  onSelect
}: {
  selectedColor: string | null;
  onSelect: (color: string | null) => void;
}) => {
  return (
    <div className="space-y-3">
      <Label>لون الخلفية</Label>
      <div className="grid grid-cols-6 gap-2">
        {bgColorOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.color)}
            title={option.name}
            className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
              selectedColor === option.color
                ? 'border-primary ring-2 ring-primary/50'
                : 'border-border hover:border-primary/50'
            }`}
            style={{ backgroundColor: option.color || 'hsl(var(--primary) / 0.1)' }}
          >
            {selectedColor === option.color && <Check className="h-4 w-4 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
};

// Sortable category item
const SortableCategoryItem = ({ 
  category, 
  onEdit, 
  onDelete 
}: { 
  category: any; 
  onEdit: (cat: any) => void; 
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`overflow-hidden shadow-card ${isDragging ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="flex items-stretch">
        {/* Drag handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="flex items-center justify-center px-3 bg-muted/50 cursor-grab active:cursor-grabbing hover:bg-muted transition-colors"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        
        {/* Category content */}
        <div className="flex-1 flex items-center gap-4 p-4">
          {/* Image/Icon preview */}
          <div 
            className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: category.bg_color || 'hsl(var(--primary) / 0.1)' }}
          >
            {category.image_url ? (
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : category.icon_name ? (
              <RenderIcon iconName={category.icon_name} className="h-8 w-8 text-primary" />
            ) : (
              <Image className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          
          {/* Name */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{category.name}</h3>
            <p className="text-sm text-muted-foreground">
              {category.image_url ? 'صورة' : category.icon_name ? 'أيقونة' : 'بدون صورة'}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
            >
              <Edit className="ml-1 h-4 w-4" />
              تعديل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(category.id)}
            >
              <Trash2 className="ml-1 h-4 w-4" />
              حذف
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const AdminCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings, refreshSettings } = useSettings();
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    image_url: '', 
    icon_name: '' as string | null,
    bg_color: null as string | null 
  });
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'icon'>('image');
  
  // Category display settings
  const [categoryDisplayStyle, setCategoryDisplayStyle] = useState(
    (settings as any)?.category_display_style || 'grid'
  );
  const [showBrandsButton, setShowBrandsButton] = useState(
    (settings as any)?.show_brands_button !== false
  );

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Get max sort order
      const maxOrder = categories?.reduce((max, cat: any) => Math.max(max, cat.sort_order || 0), 0) || 0;
      const { error } = await supabase.from('categories').insert({
        ...data,
        sort_order: maxOrder + 1
      });
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

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (orderedCategories: { id: string; sort_order: number }[]) => {
      const updates = orderedCategories.map(cat => 
        supabase.from('categories').update({ sort_order: cat.sort_order }).eq('id', cat.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'تم حفظ الترتيب' });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && categories) {
      const oldIndex = categories.findIndex((cat: any) => cat.id === active.id);
      const newIndex = categories.findIndex((cat: any) => cat.id === over.id);
      
      const newOrder = arrayMove(categories, oldIndex, newIndex);
      const orderedCategories = newOrder.map((cat: any, index: number) => ({
        id: cat.id,
        sort_order: index + 1
      }));
      
      // Optimistically update UI
      queryClient.setQueryData(['admin-categories'], newOrder);
      
      // Save to database
      reorderMutation.mutate(orderedCategories);
    }
  };

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
      bg_color: formData.bg_color || null,
    };
    
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', image_url: '', icon_name: null, bg_color: null });
    setEditingCategory(null);
    setActiveTab('image');
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      image_url: category.image_url || '',
      icon_name: category.icon_name || null,
      bg_color: category.bg_color || null
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة التصنيفات</h1>
        <p className="text-muted-foreground mt-2">إضافة وتعديل وترتيب تصنيفات المنتجات</p>
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
              <CardDescription>اسحب لإعادة ترتيب التصنيفات</CardDescription>
            </div>
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة تصنيف
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl" className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                        <Grid3X3 className="h-4 w-4 ml-2" />
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
                    
                    <TabsContent value="icon" className="space-y-4">
                      <IconPicker 
                        selectedIcon={formData.icon_name} 
                        onSelect={handleIconSelect}
                      />
                      
                      {/* Color picker for icons */}
                      <ColorPicker
                        selectedColor={formData.bg_color}
                        onSelect={(color) => setFormData({ ...formData, bg_color: color })}
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
          {categories && categories.length > 0 ? (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={categories.map((cat: any) => cat.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {categories.map((category: any) => (
                    <SortableCategoryItem
                      key={category.id}
                      category={category}
                      onEdit={handleEdit}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-12">
              <Grid3X3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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

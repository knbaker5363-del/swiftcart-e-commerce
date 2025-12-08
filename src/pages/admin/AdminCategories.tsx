import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Image, Grid3X3, Check, Settings2, GripVertical, Square, Circle, ImageIcon, Sparkles, Maximize2, Minimize2, LayoutGrid, PanelRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      
      <Input
        placeholder="ابحث عن أيقونة... مثل: Home, Star, Heart"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />
      
      {selectedIcon && (
        <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
          <RenderIcon iconName={selectedIcon} className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium">{selectedIcon}</span>
        </div>
      )}
      
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
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        <div 
          {...attributes} 
          {...listeners}
          className="flex items-center justify-center px-3 py-2 sm:py-0 bg-muted/50 cursor-grab active:cursor-grabbing hover:bg-muted transition-colors"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
          <div 
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0"
            style={{ backgroundColor: category.bg_color || 'hsl(var(--primary) / 0.1)' }}
          >
            {category.image_url ? (
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : category.icon_name ? (
              <RenderIcon iconName={category.icon_name} className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            ) : (
              <Image className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 text-center sm:text-right">
            <h3 className="font-semibold text-base sm:text-lg">{category.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {category.image_url ? 'صورة' : category.icon_name ? 'أيقونة' : 'بدون صورة'}
            </p>
          </div>
          
          <div className="flex gap-2 justify-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
              className="flex-1 sm:flex-none"
            >
              <Edit className="ml-1 h-4 w-4" />
              <span className="hidden sm:inline">تعديل</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(category.id)}
              className="flex-1 sm:flex-none text-destructive hover:text-destructive"
            >
              <Trash2 className="ml-1 h-4 w-4" />
              <span className="hidden sm:inline">حذف</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Category Display Settings Type
interface CategoryDisplayConfig {
  style: 'slider' | 'grid' | 'sidebar';
  shape: 'square' | 'circle';
  displayType: 'image' | 'icon';
  size: 'small' | 'large';
}

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
  
  // Category display configuration
  const [displayConfig, setDisplayConfig] = useState<CategoryDisplayConfig>({
    style: 'slider',
    shape: 'square',
    displayType: 'image',
    size: 'large'
  });

  // Load saved settings
  useEffect(() => {
    if (settings?.category_display_style) {
      try {
        const parsed = JSON.parse(settings.category_display_style);
        if (typeof parsed === 'object') {
          setDisplayConfig({
            style: parsed.style || 'slider',
            shape: parsed.shape || 'square',
            displayType: parsed.displayType || 'image',
            size: parsed.size || 'large'
          });
        }
      } catch {
        // Legacy string format - convert to new format
        const legacyMap: Record<string, CategoryDisplayConfig['style']> = {
          'grid': 'grid',
          'list': 'slider',
          'icon-list': 'slider',
          'dropdown': 'slider',
          'sidebar': 'slider'
        };
        setDisplayConfig(prev => ({
          ...prev,
          style: legacyMap[settings.category_display_style] || 'slider'
        }));
      }
    }
  }, [settings?.category_display_style]);

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
      
      queryClient.setQueryData(['admin-categories'], newOrder);
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
      const configString = JSON.stringify(displayConfig);
      
      const { error } = await supabase
        .from('settings')
        .update({
          category_display_style: configString,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings?.id);

      if (error) throw error;

      // Update localStorage
      const cached = localStorage.getItem('storeSettings');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        parsedCache.category_display_style = configString;
        localStorage.setItem('storeSettings', JSON.stringify(parsedCache));
      }

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
        <CardContent className="space-y-8">
          
          {/* نوع العرض الرئيسي */}
          <div>
            <Label className="text-base font-semibold mb-4 block">طريقة عرض التصنيفات</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* السلايدر */}
              <div 
                className={`rounded-xl border-2 transition-all cursor-pointer ${
                  displayConfig.style === 'slider'
                    ? 'border-primary bg-primary/10 shadow-lg'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setDisplayConfig(prev => ({ ...prev, style: 'slider' }))}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <LayoutGrid className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold">سلايدر أفقي</span>
                      {displayConfig.style === 'slider' && <Check className="h-4 w-4 text-primary inline mr-2" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">عرض التصنيفات بشكل أفقي قابل للتمرير</p>
                  
                  {/* معاينة */}
                  <div className="mt-3 flex gap-2 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`w-8 h-8 ${displayConfig.shape === 'circle' ? 'rounded-full' : 'rounded-lg'} bg-primary/20 flex-shrink-0`} />
                    ))}
                  </div>
                </div>
                
                {/* تخصيصات السلايدر */}
                {displayConfig.style === 'slider' && (
                  <div className="border-t border-primary/20 p-4 space-y-4 bg-muted/30">
                    {/* الشكل */}
                    <div>
                      <Label className="text-sm mb-2 block">الشكل</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={displayConfig.shape === 'square' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, shape: 'square' })); }}
                          className="flex-1"
                        >
                          <Square className="h-4 w-4 ml-1" />
                          مربع
                        </Button>
                        <Button
                          variant={displayConfig.shape === 'circle' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, shape: 'circle' })); }}
                          className="flex-1"
                        >
                          <Circle className="h-4 w-4 ml-1" />
                          دائرة
                        </Button>
                      </div>
                    </div>
                    
                    {/* نوع المحتوى */}
                    <div>
                      <Label className="text-sm mb-2 block">المحتوى</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={displayConfig.displayType === 'image' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, displayType: 'image' })); }}
                          className="flex-1"
                        >
                          <ImageIcon className="h-4 w-4 ml-1" />
                          صورة
                        </Button>
                        <Button
                          variant={displayConfig.displayType === 'icon' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, displayType: 'icon' })); }}
                          className="flex-1"
                        >
                          <Sparkles className="h-4 w-4 ml-1" />
                          أيقونة
                        </Button>
                      </div>
                    </div>
                    
                    {/* الحجم */}
                    <div>
                      <Label className="text-sm mb-2 block">الحجم</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={displayConfig.size === 'large' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, size: 'large' })); }}
                          className="flex-1"
                        >
                          <Maximize2 className="h-4 w-4 ml-1" />
                          كبير
                        </Button>
                        <Button
                          variant={displayConfig.size === 'small' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, size: 'small' })); }}
                          className="flex-1"
                        >
                          <Minimize2 className="h-4 w-4 ml-1" />
                          صغير
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* شبكة التصنيفات */}
              <div 
                className={`rounded-xl border-2 transition-all cursor-pointer ${
                  displayConfig.style === 'grid'
                    ? 'border-primary bg-primary/10 shadow-lg'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setDisplayConfig(prev => ({ ...prev, style: 'grid' }))}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Grid3X3 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold">شبكة مربعات</span>
                      {displayConfig.style === 'grid' && <Check className="h-4 w-4 text-primary inline mr-2" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">عرض 10 تصنيفات كمربعات + عرض المزيد</p>
                  
                  {/* معاينة */}
                  <div className="mt-3 grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                      <div key={i} className={`w-5 h-5 ${displayConfig.shape === 'circle' ? 'rounded-full' : 'rounded'} bg-primary/20`} />
                    ))}
                  </div>
                </div>
                
                {/* تخصيصات الشبكة */}
                {displayConfig.style === 'grid' && (
                  <div className="border-t border-primary/20 p-4 space-y-4 bg-muted/30">
                    {/* الشكل */}
                    <div>
                      <Label className="text-sm mb-2 block">الشكل</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={displayConfig.shape === 'square' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, shape: 'square' })); }}
                          className="flex-1"
                        >
                          <Square className="h-4 w-4 ml-1" />
                          مربع
                        </Button>
                        <Button
                          variant={displayConfig.shape === 'circle' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, shape: 'circle' })); }}
                          className="flex-1"
                        >
                          <Circle className="h-4 w-4 ml-1" />
                          دائرة
                        </Button>
                      </div>
                    </div>
                    
                    {/* نوع المحتوى */}
                    <div>
                      <Label className="text-sm mb-2 block">المحتوى</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={displayConfig.displayType === 'image' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, displayType: 'image' })); }}
                          className="flex-1"
                        >
                          <ImageIcon className="h-4 w-4 ml-1" />
                          صورة
                        </Button>
                        <Button
                          variant={displayConfig.displayType === 'icon' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, displayType: 'icon' })); }}
                          className="flex-1"
                        >
                          <Sparkles className="h-4 w-4 ml-1" />
                          أيقونة
                        </Button>
                      </div>
                    </div>
                    
                    {/* الحجم */}
                    <div>
                      <Label className="text-sm mb-2 block">الحجم</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={displayConfig.size === 'large' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, size: 'large' })); }}
                          className="flex-1"
                        >
                          <Maximize2 className="h-4 w-4 ml-1" />
                          كبير
                        </Button>
                        <Button
                          variant={displayConfig.size === 'small' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, size: 'small' })); }}
                          className="flex-1"
                        >
                          <Minimize2 className="h-4 w-4 ml-1" />
                          صغير
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* القائمة الجانبية */}
              <div 
                className={`rounded-xl border-2 transition-all cursor-pointer ${
                  displayConfig.style === 'sidebar'
                    ? 'border-primary bg-primary/10 shadow-lg'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setDisplayConfig(prev => ({ ...prev, style: 'sidebar' }))}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <PanelRight className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold">قائمة جانبية</span>
                      {displayConfig.style === 'sidebar' && <Check className="h-4 w-4 text-primary inline mr-2" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">قائمة ثابتة على سطح المكتب + زر قائمة في الهاتف</p>
                  
                  {/* معاينة */}
                  <div className="mt-3 flex gap-2">
                    <div className="w-12 bg-primary/10 rounded-lg p-1 space-y-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-2 ${displayConfig.shape === 'circle' ? 'rounded-full' : 'rounded'} bg-primary/30`} />
                      ))}
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-lg" />
                  </div>
                </div>
                
                {/* تخصيصات القائمة الجانبية */}
                {displayConfig.style === 'sidebar' && (
                  <div className="border-t border-primary/20 p-4 space-y-4 bg-muted/30">
                    {/* الشكل */}
                    <div>
                      <Label className="text-sm mb-2 block">الشكل</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={displayConfig.shape === 'square' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, shape: 'square' })); }}
                          className="flex-1"
                        >
                          <Square className="h-4 w-4 ml-1" />
                          مربع
                        </Button>
                        <Button
                          variant={displayConfig.shape === 'circle' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, shape: 'circle' })); }}
                          className="flex-1"
                        >
                          <Circle className="h-4 w-4 ml-1" />
                          دائرة
                        </Button>
                      </div>
                    </div>
                    
                    {/* نوع المحتوى */}
                    <div>
                      <Label className="text-sm mb-2 block">المحتوى</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={displayConfig.displayType === 'image' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, displayType: 'image' })); }}
                          className="flex-1"
                        >
                          <ImageIcon className="h-4 w-4 ml-1" />
                          صورة
                        </Button>
                        <Button
                          variant={displayConfig.displayType === 'icon' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, displayType: 'icon' })); }}
                          className="flex-1"
                        >
                          <Sparkles className="h-4 w-4 ml-1" />
                          أيقونة
                        </Button>
                      </div>
                    </div>
                    
                    {/* الحجم */}
                    <div>
                      <Label className="text-sm mb-2 block">الحجم</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={displayConfig.size === 'large' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, size: 'large' })); }}
                          className="flex-1"
                        >
                          <Maximize2 className="h-4 w-4 ml-1" />
                          كبير
                        </Button>
                        <Button
                          variant={displayConfig.size === 'small' ? 'default' : 'outline'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDisplayConfig(prev => ({ ...prev, size: 'small' })); }}
                          className="flex-1"
                        >
                          <Minimize2 className="h-4 w-4 ml-1" />
                          صغير
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button onClick={handleSaveDisplaySettings} size="lg">
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

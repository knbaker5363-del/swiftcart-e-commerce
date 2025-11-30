import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  created_at: string;
}

const AdminBrands = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    description: '',
  });

  const { data: brands, isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Brand[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('brands').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      toast({ title: 'تم الإضافة', description: 'تم إضافة العلامة التجارية بنجاح' });
      resetForm();
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل إضافة العلامة التجارية', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from('brands').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      toast({ title: 'تم التحديث', description: 'تم تحديث العلامة التجارية بنجاح' });
      resetForm();
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل تحديث العلامة التجارية', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      toast({ title: 'تم الحذف', description: 'تم حذف العلامة التجارية بنجاح' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل حذف العلامة التجارية', variant: 'destructive' });
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'خطأ', description: 'يرجى اختيار صورة فقط', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `brand-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, logo_url: publicUrl });
      toast({ title: 'تم الرفع', description: 'تم رفع الشعار بنجاح' });
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل رفع الشعار', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', logo_url: '', description: '' });
    setEditingBrand(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo_url: brand.logo_url || '',
      description: brand.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">العلامات التجارية</h1>
          <p className="text-muted-foreground mt-2">إدارة العلامات التجارية المتاحة</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة علامة تجارية
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? 'تعديل علامة تجارية' : 'إضافة علامة تجارية جديدة'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>شعار العلامة</Label>
                <div className="flex items-center gap-4">
                  {formData.logo_url ? (
                    <div className="relative">
                      <img
                        src={formData.logo_url}
                        alt="الشعار"
                        className="w-24 h-24 rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logo_url: '' })}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">اسم العلامة *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="مثال: Adidas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف مختصر عن العلامة التجارية"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingBrand ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جميع العلامات التجارية</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : brands && brands.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الشعار</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">لا صورة</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {brand.description || '-'}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(brand)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذه العلامة التجارية؟')) {
                              deleteMutation.mutate(brand.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد علامات تجارية</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBrands;
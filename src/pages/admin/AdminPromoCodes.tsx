import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PromoCode {
  id: string;
  code: string;
  discount_percentage: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

const AdminPromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: 10,
    expires_at: '',
  });
  const { toast } = useToast();

  const fetchPromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.expires_at) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('promo_codes').insert({
        code: formData.code.trim().toUpperCase(),
        discount_percentage: formData.discount_percentage,
        expires_at: new Date(formData.expires_at).toISOString(),
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: 'تم الإنشاء',
        description: 'تم إنشاء كود الخصم بنجاح',
      });
      
      setFormData({ code: '', discount_percentage: 10, expires_at: '' });
      setDialogOpen(false);
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Error creating promo code:', error);
      toast({
        title: 'خطأ',
        description: error.message?.includes('duplicate') ? 'هذا الكود موجود مسبقاً' : 'فشل إنشاء كود الخصم',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      fetchPromoCodes();
    } catch (error) {
      console.error('Error toggling promo code:', error);
    }
  };

  const deletePromoCode = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكود؟')) return;

    try {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف كود الخصم بنجاح',
      });
      fetchPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">أكواد الخصم</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              كود جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء كود خصم جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>الكود</Label>
                <Input
                  placeholder="مثال: SAVE20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="uppercase"
                />
              </div>
              <div>
                <Label>نسبة الخصم (%)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>تاريخ الانتهاء</Label>
                <Input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                إنشاء الكود
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : promoCodes.length === 0 ? (
        <Card className="p-8 text-center">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">لا توجد أكواد خصم</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الكود</TableHead>
                <TableHead className="text-right">الخصم</TableHead>
                <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">مفعل</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono font-bold">{promo.code}</TableCell>
                  <TableCell>{promo.discount_percentage}%</TableCell>
                  <TableCell dir="ltr" className="text-right">
                    {new Date(promo.expires_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    {isExpired(promo.expires_at) ? (
                      <span className="text-red-500 text-sm">منتهي</span>
                    ) : (
                      <span className="text-green-500 text-sm">صالح</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={promo.is_active}
                      onCheckedChange={() => toggleActive(promo.id, promo.is_active)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePromoCode(promo.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default AdminPromoCodes;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getSupabaseUrl } from '@/integrations/supabase/client';

const CreateAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [creationCode, setCreationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCreateAdmin = async () => {
    if (!email || !password || !creationCode) {
      toast({ title: 'خطأ', description: 'يرجى إدخال جميع البيانات المطلوبة', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'خطأ', description: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const supabaseUrl = getSupabaseUrl();
      
      if (!supabaseUrl) {
        throw new Error('لم يتم تكوين قاعدة البيانات');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          creationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل إنشاء الحساب');
      }

      toast({ title: 'نجاح!', description: 'تم إنشاء حساب المسؤول بنجاح' });
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Create admin error:', error);
      toast({ 
        title: 'خطأ', 
        description: error.message || 'فشل إنشاء الحساب', 
        variant: 'destructive' 
      });
    }
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">تم إنشاء حساب المسؤول! 🎉</h2>
            <p className="text-muted-foreground">
              يمكنك الآن تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
            </p>
            <div className="bg-muted/50 border rounded-lg p-4 text-sm text-right">
              <p><strong>البريد الإلكتروني:</strong> {email}</p>
            </div>
            <Button onClick={() => navigate('/admin123')} size="lg" className="gap-2">
              الذهاب لتسجيل الدخول
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">إنشاء حساب مسؤول جديد</CardTitle>
          <CardDescription>
            أنشئ حساب مسؤول للوصول إلى لوحة التحكم
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أحمد محمد"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                dir="ltr"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="creationCode">كود الإنشاء *</Label>
              <Input
                id="creationCode"
                type="password"
                value={creationCode}
                onChange={(e) => setCreationCode(e.target.value)}
                placeholder="أدخل كود الإنشاء السري"
                dir="ltr"
                required
              />
              <p className="text-xs text-muted-foreground">
                كود الإنشاء هو ADMIN_CREATION_CODE المُعد في Supabase Secrets
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>ملاحظة:</strong> هذه الصفحة تستخدم Edge Function مع Service Role Key، 
              مما يتجاوز سياسات RLS ويضمن إنشاء الحساب بنجاح.
            </p>
          </div>
          
          <Button 
            onClick={handleCreateAdmin}
            disabled={isLoading || !email || !password || !creationCode}
            className="w-full gap-2"
            size="lg"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            إنشاء حساب المسؤول
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="w-full"
          >
            العودة للصفحة الرئيسية
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAdmin;

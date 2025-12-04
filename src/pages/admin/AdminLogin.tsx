import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, Shield } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [createAdminData, setCreateAdminData] = useState({
    email: '',
    password: '',
    fullName: '',
    creationCode: '',
  });

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate('/admin/products');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    
    if (!error) {
      // Will be redirected by useEffect when isAdmin updates
    }
    setLoading(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createAdminData.password.length < 6) {
      toast({
        title: 'خطأ',
        description: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: {
          email: createAdminData.email,
          password: createAdminData.password,
          fullName: createAdminData.fullName,
          creationCode: createAdminData.creationCode,
        },
      });

      if (error) {
        toast({
          title: 'خطأ في إنشاء الحساب',
          description: error.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (data?.error) {
        toast({
          title: 'خطأ',
          description: data.error,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'تم إنشاء حساب Admin بنجاح',
        description: 'يمكنك الآن تسجيل الدخول',
      });

      // Switch to login form and prefill email
      setShowCreateAdmin(false);
      setLoginData({ email: createAdminData.email, password: '' });
      setCreateAdminData({ email: '', password: '', fullName: '', creationCode: '' });
      
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md p-8 shadow-card-hover">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">
            لوحة التحكم
          </h1>
          <p className="text-muted-foreground mt-2">
            {showCreateAdmin ? 'إنشاء حساب مسؤول' : 'تسجيل دخول المسؤولين'}
          </p>
        </div>

        {!showCreateAdmin ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative mt-2">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="pr-10"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative mt-2">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pr-10"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  dir="ltr"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-xs text-muted-foreground"
                onClick={() => setShowCreateAdmin(true)}
              >
                إنشاء حساب مسؤول جديد
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <Label htmlFor="create-fullname">الاسم الكامل (اختياري)</Label>
              <div className="relative mt-2">
                <Input
                  id="create-fullname"
                  type="text"
                  placeholder="محمد أحمد"
                  value={createAdminData.fullName}
                  onChange={(e) => setCreateAdminData({ ...createAdminData, fullName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="create-email">البريد الإلكتروني</Label>
              <div className="relative mt-2">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="create-email"
                  type="email"
                  placeholder="admin@example.com"
                  className="pr-10"
                  value={createAdminData.email}
                  onChange={(e) => setCreateAdminData({ ...createAdminData, email: e.target.value })}
                  required
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="create-password">كلمة المرور</Label>
              <div className="relative mt-2">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="create-password"
                  type="password"
                  placeholder="••••••••"
                  className="pr-10"
                  value={createAdminData.password}
                  onChange={(e) => setCreateAdminData({ ...createAdminData, password: e.target.value })}
                  required
                  dir="ltr"
                  minLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">6 أحرف على الأقل</p>
            </div>
            <div>
              <Label htmlFor="creation-code">كود الإنشاء السري</Label>
              <div className="relative mt-2">
                <Shield className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="creation-code"
                  type="password"
                  placeholder="أدخل الكود السري"
                  className="pr-10"
                  value={createAdminData.creationCode}
                  onChange={(e) => setCreateAdminData({ ...createAdminData, creationCode: e.target.value })}
                  required
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                الكود السري الذي تم تكوينه في إعدادات المشروع
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء حساب Admin'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-xs text-muted-foreground"
                onClick={() => setShowCreateAdmin(false)}
              >
                العودة لتسجيل الدخول
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            للمسؤولين المصرح لهم فقط
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
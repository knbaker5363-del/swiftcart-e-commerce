import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';

const themes = [
  { id: 'default', name: 'الافتراضي', colors: 'من #9b87f5 إلى #7E69AB' },
  { id: 'night', name: 'ليلي', colors: 'من #1A1F2C إلى #403E43' },
  { id: 'day', name: 'نهاري', colors: 'من #F97316 إلى #FBBF24' },
  { id: 'pink', name: 'زهري', colors: 'من #EC4899 إلى #F472B6' },
  { id: 'green', name: 'أخضر', colors: 'من #10B981 إلى #34D399' },
  { id: 'orange', name: 'برتقالي', colors: 'من #F59E0B إلى #FB923C' },
];

const AdminSettings = () => {
  const { settings, loading, updateSettings } = useSettings();
  const [storeName, setStoreName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('default');

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name);
      setSelectedTheme(settings.theme);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(storeName, selectedTheme);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground mt-2">إدارة إعدادات المتجر والمظهر</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>معلومات المتجر</CardTitle>
            <CardDescription>تخصيص اسم المتجر</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">اسم المتجر</Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="اسم متجرك"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              المظهر
            </CardTitle>
            <CardDescription>اختر مظهر المتجر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-4 rounded-lg border-2 text-right transition-all ${
                    selectedTheme === theme.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold text-lg mb-1">{theme.name}</div>
                  <div className="text-sm text-muted-foreground">{theme.colors}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} size="lg">
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
import { useSettings } from '@/contexts/SettingsContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const DeveloperFooter = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [secretDialogOpen, setSecretDialogOpen] = useState(false);
  const [secretCode, setSecretCode] = useState('');

  const handleSecretCodeSubmit = () => {
    if (secretCode === 'admin123123') {
      setSecretDialogOpen(false);
      setSecretCode('');
      navigate('/admin123');
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = (settings as any)?.whatsapp_number?.replace(/^0/, '');
    const countryCode = (settings as any)?.whatsapp_country_code || '970';
    if (phoneNumber) {
      window.open(`https://wa.me/${countryCode}${phoneNumber}`, '_blank');
    }
  };

  return (
    <footer className="bg-card border-t mt-8">
      {/* قسم المساعدة */}
      <div className="container py-6 border-b">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            هل تحتاج مساعدة؟
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {(settings as any)?.whatsapp_number && (
              <Button variant="outline" size="sm" onClick={handleWhatsAppClick}>
                📱 تواصل عبر واتساب
              </Button>
            )}
            {(settings as any)?.social_instagram && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`https://instagram.com/${(settings as any).social_instagram}`, '_blank')}
              >
                📸 انستجرام
              </Button>
            )}
            {(settings as any)?.social_facebook && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`https://facebook.com/${(settings as any).social_facebook}`, '_blank')}
              >
                📘 فيسبوك
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSecretDialogOpen(true)}
              className="text-muted-foreground/60 hover:text-muted-foreground"
            >
              ℹ️ معلومات إضافية
            </Button>
          </div>
        </div>
      </div>

      {/* حقوق المتجر */}
      <div className="container py-6">
        <p className="text-center text-sm text-muted-foreground">
          جميع الحقوق محفوظة لـ {settings?.store_name || 'متجري'} © {new Date().getFullYear()}
        </p>
      </div>
      
      {/* تم التطوير بواسطة PALPROX */}
      <div className="border-t bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container py-4">
          <div className="flex justify-center">
            <a
              href="https://palprox.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-lg hover:shadow-primary/20 hover:scale-105"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
              
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors relative z-10">
                تم التطوير بواسطة
              </span>
              
              {/* PALPROX Logo/Text with special styling */}
              <span className="relative z-10 font-black text-lg tracking-wider bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:via-primary/90 group-hover:to-primary transition-all duration-500">
                PALPROX
              </span>
              
              {/* Sparkle decoration */}
              <svg 
                className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Secret code dialog */}
      <Dialog open={secretDialogOpen} onOpenChange={setSecretDialogOpen}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle className="text-center">معلومات إضافية</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              type="password"
              placeholder="أدخل الكود"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSecretCodeSubmit()}
              className="text-center"
            />
            <Button onClick={handleSecretCodeSubmit} className="w-full">
              تأكيد
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default DeveloperFooter;

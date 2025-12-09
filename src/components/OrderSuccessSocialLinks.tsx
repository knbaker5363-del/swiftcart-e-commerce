import { MessageCircle, Instagram, Facebook } from 'lucide-react';
import { SiTiktok, SiSnapchat } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Snapchat icon component
const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/>
  </svg>
);

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface SocialLink {
  key: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  colors: {
    rounded: string;
    square: string;
    minimal: string;
  };
}

interface OrderSuccessSocialLinksProps {
  socialMedia: {
    whatsapp: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    snapchat: string;
  };
  whatsappNumber: string;
  whatsappCountryCode: string;
  iconStyle?: 'rounded' | 'square' | 'minimal';
  storeName?: string;
}

const OrderSuccessSocialLinks = ({
  socialMedia,
  whatsappNumber,
  whatsappCountryCode,
  iconStyle = 'rounded',
  storeName = 'المتجر'
}: OrderSuccessSocialLinksProps) => {
  const socialLinks: SocialLink[] = [
    {
      key: 'whatsapp',
      url: whatsappNumber ? `https://wa.me/${whatsappCountryCode}${whatsappNumber}` : socialMedia.whatsapp,
      icon: MessageCircle,
      label: 'واتساب',
      colors: {
        rounded: 'bg-green-500 hover:bg-green-600 text-white',
        square: 'bg-green-500 hover:bg-green-600 text-white',
        minimal: 'bg-green-500/10 hover:bg-green-500/20 text-green-600 border border-green-500/30',
      }
    },
    {
      key: 'facebook',
      url: socialMedia.facebook?.startsWith('http') ? socialMedia.facebook : `https://facebook.com/${socialMedia.facebook}`,
      icon: Facebook,
      label: 'فيسبوك',
      colors: {
        rounded: 'bg-blue-600 hover:bg-blue-700 text-white',
        square: 'bg-blue-600 hover:bg-blue-700 text-white',
        minimal: 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 border border-blue-600/30',
      }
    },
    {
      key: 'tiktok',
      url: socialMedia.tiktok?.startsWith('http') ? socialMedia.tiktok : `https://tiktok.com/@${socialMedia.tiktok}`,
      icon: TikTokIcon,
      label: 'تيك توك',
      colors: {
        rounded: 'bg-black hover:bg-gray-800 text-white',
        square: 'bg-black hover:bg-gray-800 text-white',
        minimal: 'bg-black/10 hover:bg-black/20 text-foreground border border-black/30',
      }
    },
    {
      key: 'snapchat',
      url: socialMedia.snapchat?.startsWith('http') ? socialMedia.snapchat : `https://snapchat.com/add/${socialMedia.snapchat}`,
      icon: SnapchatIcon,
      label: 'سناب شات',
      colors: {
        rounded: 'bg-yellow-400 hover:bg-yellow-500 text-black',
        square: 'bg-yellow-400 hover:bg-yellow-500 text-black',
        minimal: 'bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-600 border border-yellow-400/30',
      }
    },
  ];

  const hasAnySocial = socialLinks.some(link => {
    if (link.key === 'whatsapp') return !!whatsappNumber || !!socialMedia.whatsapp;
    return !!(socialMedia as any)[link.key];
  });

  if (!hasAnySocial) return null;

  const getIconClasses = () => {
    switch (iconStyle) {
      case 'square':
        return 'rounded-lg';
      case 'minimal':
        return 'rounded-xl';
      default: // rounded
        return 'rounded-full';
    }
  };

  return (
    <div className="space-y-6 py-6 border-t">
      {/* زر التواصل الرئيسي عبر واتساب */}
      {(whatsappNumber || socialMedia.whatsapp) && (
        <div className="text-center">
          <a
            href={whatsappNumber ? `https://wa.me/${whatsappCountryCode}${whatsappNumber}` : socialMedia.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="h-6 w-6" />
            تواصل معنا
          </a>
        </div>
      )}

      {/* باقي منصات التواصل */}
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">تابعنا أيضاً على</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {socialLinks.map(({ key, url, icon: Icon, label, colors }) => {
            const value = key === 'whatsapp' 
              ? (whatsappNumber || socialMedia.whatsapp)
              : (socialMedia as any)[key];
            
            if (!value) return null;

            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 transition-all duration-300 hover:scale-110 hover:shadow-lg",
                  getIconClasses(),
                  colors[iconStyle]
                )}
                title={label}
              >
                <Icon className="h-5 w-5" />
                {iconStyle === 'minimal' && (
                  <span className="text-sm font-medium">{label}</span>
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* حقوق المتجر */}
      <div className="text-center pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          جميع الحقوق محفوظة لـ {storeName} © {new Date().getFullYear()}
        </p>
      </div>

      {/* تم التطوير بواسطة PALPROX */}
      <div className="text-center">
        <a
          href="https://palprox.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-md hover:scale-105"
        >
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            تم التطوير بواسطة
          </span>
          <span className="font-black text-sm tracking-wider bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            PALPROX
          </span>
          <svg 
            className="w-3 h-3 text-primary opacity-60 group-hover:opacity-100 transition-all duration-300" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default OrderSuccessSocialLinks;

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, MessageCircle, Instagram, Facebook, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';

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

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
}

// Social icons component
const SocialIcons = ({ settings, size = 'md' }: { settings: any; size?: 'sm' | 'md' }) => {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  const containerSize = size === 'sm' ? 'w-6 h-6' : 'w-9 h-9';
  
  const socialLinks = [
    { key: 'social_whatsapp', icon: MessageCircle, color: 'bg-green-500 hover:bg-green-600' },
    { key: 'social_instagram', icon: Instagram, color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500' },
    { key: 'social_facebook', icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700' },
    { key: 'social_snapchat', icon: SnapchatIcon, color: 'bg-yellow-400 hover:bg-yellow-500 text-black' },
    { key: 'social_tiktok', icon: TikTokIcon, color: 'bg-black hover:bg-gray-800' },
  ];

  const hasAnySocial = socialLinks.some(link => settings?.[link.key]);
  
  if (!hasAnySocial) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-end">
      {socialLinks.map(({ key, icon: Icon, color }) => {
        const url = settings?.[key];
        if (!url) return null;
        
        return (
          <a
            key={key}
            href={url.startsWith('http') ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${containerSize} ${color} rounded-full flex items-center justify-center text-white transition-all shadow-md hover:scale-110`}
          >
            <Icon className={iconSize} />
          </a>
        );
      })}
    </div>
  );
}

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings } = useSettings();

  // Get header layout setting
  const headerLayout = (settings as any)?.header_layout || 'logo-right';
  const showImageBorder = (settings as any)?.show_image_border !== false;
  const logoShape = (settings as any)?.logo_shape || 'circle';
  const siteStyle = (settings as any)?.site_style || 'classic';

  // Get logo shape class
  const getLogoShapeClass = (size: 'sm' | 'lg') => {
    const baseClass = logoShape === 'circle' ? 'rounded-full' : 'rounded-xl';
    return baseClass;
  };

  // Get site style classes
  const getSiteStyleClasses = () => {
    switch (siteStyle) {
      case 'modern':
        return 'bg-gradient-to-br from-card to-card/80 backdrop-blur-sm';
      case 'minimal':
        return 'bg-card/50 border-0';
      default: // classic
        return 'bg-card';
    }
  };

  // شرائح البانر من الإعدادات أو افتراضية
  const defaultImages = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
  ];

  const bannerImages = (settings as any)?.banner_images?.length > 0 
    ? (settings as any).banner_images 
    : defaultImages;

  const slides: HeroSlide[] = bannerImages.map((image: string, index: number) => ({
    id: index + 1,
    title: '',
    subtitle: '',
    description: '',
    image,
    buttonText: '',
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Determine store name color based on settings
  const storeNameBlack = (settings as any)?.store_name_black;
  const storeNameClass = storeNameBlack 
    ? 'text-foreground' 
    : 'text-[hsl(var(--store-name-color))]';

  // Logo component
  const LogoComponent = ({ size = 'lg' }: { size?: 'sm' | 'lg' }) => {
    const sizeClass = size === 'lg' ? 'w-32 h-32' : 'w-14 h-14';
    const textSize = size === 'lg' ? 'text-4xl' : 'text-xl';
    const borderWidth = size === 'lg' ? 'border-4' : 'border-2';
    const shapeClass = getLogoShapeClass(size);
    
    return (
      <div className={`${sizeClass} ${shapeClass} overflow-hidden shadow-hover ${borderWidth} border-primary/20 flex-shrink-0 ${showImageBorder ? '' : 'border-0 shadow-none'}`}>
        {settings?.logo_url ? (
          <img
            src={settings.logo_url}
            alt={settings.store_name || 'شعار المتجر'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-primary flex items-center justify-center`}>
            <span className={`${textSize} font-bold text-primary-foreground`}>
              {settings?.store_name?.charAt(0) || 'م'}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Store info component for desktop based on layout
  const DesktopStoreInfo = () => {
    const cardClass = `hidden lg:flex flex-col rounded-lg shadow-card p-6 ${getSiteStyleClasses()}`;
    
    if (headerLayout === 'logo-center') {
      return (
        <div className={`${cardClass} items-center justify-center text-center`}>
          <LogoComponent size="lg" />
          <h2 className={`text-2xl font-bold mb-3 mt-4 ${storeNameClass}`}>
            {settings?.store_name || 'متجري'}
          </h2>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{settings?.location || 'الرياض، المملكة العربية السعودية'}</span>
          </div>
          <SocialIcons settings={settings} size="md" />
          <Link to="/my-orders" className="block w-full mt-4">
            <div className="w-full p-3 rounded-xl bg-black hover:bg-black/90 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer">
              <div className="flex items-center justify-center gap-2">
                <Package className="h-5 w-5 text-white" />
                <span className="text-base font-bold text-white">طلباتي</span>
              </div>
            </div>
          </Link>
        </div>
      );
    }

    if (headerLayout === 'logo-left') {
      return (
        <div className={cardClass}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <SocialIcons settings={settings} size="md" />
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-4">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{settings?.location || 'الرياض، المملكة العربية السعودية'}</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <LogoComponent size="lg" />
              <h2 className={`text-xl font-bold mt-3 ${storeNameClass}`}>
                {settings?.store_name || 'متجري'}
              </h2>
            </div>
          </div>
          <Link to="/my-orders" className="block w-full mt-4">
            <div className="w-full p-3 rounded-xl bg-black hover:bg-black/90 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer">
              <div className="flex items-center justify-center gap-2">
                <Package className="h-5 w-5 text-white" />
                <span className="text-base font-bold text-white">طلباتي</span>
              </div>
            </div>
          </Link>
        </div>
      );
    }

    // Default: logo-right
    return (
      <div className={`${cardClass} items-center justify-center text-center`}>
        <LogoComponent size="lg" />
        <h2 className={`text-2xl font-bold mb-3 mt-4 ${storeNameClass}`}>
          {settings?.store_name || 'متجري'}
        </h2>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{settings?.location || 'الرياض، المملكة العربية السعودية'}</span>
        </div>
        <SocialIcons settings={settings} size="md" />
        <Link to="/my-orders" className="block w-full mt-4">
          <div className="w-full p-3 rounded-xl bg-black hover:bg-black/90 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer">
            <div className="flex items-center justify-center gap-2">
              <Package className="h-5 w-5 text-white" />
              <span className="text-base font-bold text-white">طلباتي</span>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  // Mobile store info based on layout
  const MobileStoreInfo = () => {
    const mobileCardClass = `flex lg:hidden rounded-lg shadow-card p-3 ${getSiteStyleClasses()}`;
    const mobileLogoShape = logoShape === 'circle' ? 'rounded-full' : 'rounded-xl';
    
    if (headerLayout === 'logo-center') {
      return (
        <div className={`${mobileCardClass} flex-col items-center gap-3 mb-4`}>
          <div className={`w-16 h-16 ${mobileLogoShape} overflow-hidden shadow-hover border-2 border-primary/20 ${showImageBorder ? '' : 'border-0 shadow-none'}`}>
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.store_name || 'شعار المتجر'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {settings?.store_name?.charAt(0) || 'م'}
                </span>
              </div>
            )}
          </div>
          <h2 className={`text-lg font-bold ${storeNameClass}`}>
            {settings?.store_name || 'متجري'}
          </h2>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin className="h-3 w-3 text-primary" />
            <span>{settings?.location || 'الرياض، المملكة العربية السعودية'}</span>
          </div>
          <SocialIcons settings={settings} size="sm" />
        </div>
      );
    }

    if (headerLayout === 'logo-left') {
      return (
        <div className={`${mobileCardClass} items-center gap-3 mb-4`}>
          <div className="flex-1">
            <SocialIcons settings={settings} size="sm" />
            <div className="flex items-center gap-1 text-muted-foreground text-xs mt-2">
              <MapPin className="h-3 w-3 text-primary" />
              <span>{settings?.location || 'الرياض، المملكة العربية السعودية'}</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 ${mobileLogoShape} overflow-hidden shadow-hover border-2 border-primary/20 flex-shrink-0 ${showImageBorder ? '' : 'border-0 shadow-none'}`}>
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.store_name || 'شعار المتجر'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground">
                    {settings?.store_name?.charAt(0) || 'م'}
                  </span>
                </div>
              )}
            </div>
            <h2 className={`text-sm font-bold mt-1 ${storeNameClass}`}>
              {settings?.store_name || 'متجري'}
            </h2>
          </div>
        </div>
      );
    }

    // Default: logo-right
    return (
      <div className={`${mobileCardClass} items-center gap-3 mb-4`}>
        <div className={`w-14 h-14 ${mobileLogoShape} overflow-hidden shadow-hover border-2 border-primary/20 flex-shrink-0 ${showImageBorder ? '' : 'border-0 shadow-none'}`}>
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.store_name || 'شعار المتجر'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">
                {settings?.store_name?.charAt(0) || 'م'}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className={`text-lg font-bold ${storeNameClass}`}>
            {settings?.store_name || 'متجري'}
          </h2>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin className="h-3 w-3 text-primary" />
            <span>{settings?.location || 'الرياض، المملكة العربية السعودية'}</span>
          </div>
        </div>
        <SocialIcons settings={settings} size="sm" />
      </div>
    );
  };

  return (
    <section className="bg-background py-6">
      <div className="container">
        {/* معلومات المتجر للجوال */}
        <MobileStoreInfo />

        {/* زر طلباتي للجوال */}
        <Link to="/my-orders" className="block lg:hidden mb-4">
          <div className="w-full p-3 rounded-xl bg-black hover:bg-black/90 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer">
            <div className="flex items-center justify-center gap-2">
              <Package className="h-5 w-5 text-white" />
              <span className="text-base font-bold text-white">طلباتي</span>
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* معلومات المتجر - على اليمين في الديسكتوب */}
          <DesktopStoreInfo />

          {/* البانر الرئيسي */}
          <div className="lg:col-span-3 relative rounded-lg overflow-hidden shadow-card h-[180px] sm:h-[220px] lg:h-[400px] group">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={`شريحة ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="الشريحة السابقة"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="الشريحة التالية"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-primary-foreground w-8'
                      : 'bg-primary-foreground/50 hover:bg-primary-foreground/75'
                  }`}
                  aria-label={`الذهاب إلى الشريحة ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

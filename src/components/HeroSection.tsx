import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
}

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings } = useSettings();

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

  return (
    <section className="bg-background py-6">
      <div className="container">
        {/* معلومات المتجر للجوال - فوق الشرائح */}
        <div className="flex lg:hidden items-center gap-3 mb-4 bg-card rounded-lg shadow-card p-3">
          <div className="w-14 h-14 rounded-full overflow-hidden shadow-hover border-2 border-primary/20 flex-shrink-0">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.store_name || 'شعار المتجر'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">
                  {settings?.store_name?.charAt(0) || 'م'}
                </span>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              {settings?.store_name || 'متجري'}
            </h2>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <MapPin className="h-3 w-3 text-primary" />
              <span>{settings?.location || 'الرياض، المملكة العربية السعودية'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* معلومات المتجر - على اليمين في الديسكتوب */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-card rounded-lg shadow-card p-6 text-center">
            {/* شعار المتجر */}
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 shadow-hover border-4 border-primary/20">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.store_name || 'شعار المتجر'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary-foreground">
                    {settings?.store_name?.charAt(0) || 'م'}
                  </span>
                </div>
              )}
            </div>
            
            {/* اسم المتجر */}
            <h2 className="text-2xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
              {settings?.store_name || 'متجري'}
            </h2>
            
            {/* الموقع */}
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{settings?.location || 'الرياض، المملكة العربية السعودية'}</span>
            </div>
          </div>

          {/* البانر الرئيسي - يأخذ 3 أعمدة */}
          <div className="lg:col-span-3 relative rounded-lg overflow-hidden shadow-card h-[300px] lg:h-[400px] group">
            {/* الشرائح */}
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

            {/* أزرار التنقل */}
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

            {/* نقاط التنقل */}
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
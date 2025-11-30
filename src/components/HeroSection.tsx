import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { MapPin } from 'lucide-react';

const HeroSection = () => {
  const { settings } = useSettings();
  const [currentImageSet, setCurrentImageSet] = useState(0);

  // صور تجريبية - يمكن استبدالها بصور من قاعدة البيانات
  const heroImages = [
    [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
      'https://images.unsplash.com/photo-1445205170230-053b83016050',
    ],
    [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
      'https://images.unsplash.com/photo-1511556820780-d912e42b4980',
    ],
    [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',
    ],
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageSet((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentImages = heroImages[currentImageSet];

  return (
    <section className="bg-gradient-hero py-12 lg:py-0">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* معلومات المتجر - يمين في الديسكتوب، أعلى في الموبايل */}
          <div className="lg:col-span-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-right py-8 lg:py-20 animate-fade-in">
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden mb-6 shadow-hover border-4 border-primary-foreground/20">
              <img
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04"
                alt="شعار المتجر"
                className="w-full h-full object-cover"
              />
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              {settings?.store_name || 'متجري'}
            </h1>
            
            <div className="flex items-center gap-2 text-primary-foreground/90 text-lg mb-2">
              <MapPin className="h-5 w-5" />
              <span>الرياض، المملكة العربية السعودية</span>
            </div>
            
            <p className="text-primary-foreground/80 text-lg max-w-md">
              أفضل المنتجات العصرية بأسعار منافسة
            </p>
          </div>

          {/* الصور المتحركة - يسار في الديسكتوب، أسفل في الموبايل */}
          <div className="lg:col-span-2 grid grid-cols-3 gap-4 h-[300px] lg:h-auto">
            {currentImages.map((image, index) => (
              <div
                key={`${currentImageSet}-${index}`}
                className="relative overflow-hidden rounded-lg shadow-card animate-scale-in"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <img
                  src={image}
                  alt={`منتج ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
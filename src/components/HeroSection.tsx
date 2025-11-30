import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const { data: categories } = useQuery({
    queryKey: ['categories-hero'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // شرائح البانر - يمكن جعلها ديناميكية من قاعدة البيانات
  const slides: HeroSlide[] = [
    {
      id: 1,
      title: 'تسوق الآن',
      subtitle: 'وصيل متوفر',
      description: 'واستمتع بتجربة تسوق فريدة - رجال، نساء، أطفال',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
      buttonText: 'تسوق الآن',
    },
    {
      id: 2,
      title: 'عروض حصرية',
      subtitle: 'خصومات تصل إلى 50%',
      description: 'على جميع الفئات - لا تفوت الفرصة',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
      buttonText: 'اكتشف العروض',
    },
    {
      id: 3,
      title: 'أحدث المنتجات',
      subtitle: 'وصل حديثاً',
      description: 'تشكيلة جديدة من أفضل الماركات',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
      buttonText: 'شاهد الجديد',
    },
  ];

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* قائمة التصنيفات - على اليمين في الديسكتوب */}
          <div className="hidden lg:block bg-card rounded-lg shadow-card p-4">
            <h3 className="font-bold text-lg mb-4 pb-3 border-b">التصنيفات</h3>
            <div className="space-y-2">
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                >
                  {category.image_url && (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </Link>
              ))}
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
                <div className="absolute inset-0 bg-gradient-to-l from-primary/90 to-accent/80" />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover mix-blend-overlay"
                />
                
                {/* محتوى الشريحة */}
                <div className="absolute inset-0 flex items-center justify-center lg:justify-start px-8 lg:px-16">
                  <div className="text-center lg:text-right text-primary-foreground max-w-2xl animate-fade-in">
                    <p className="text-xl lg:text-2xl mb-2 font-medium">{slide.subtitle}</p>
                    <h2 className="text-4xl lg:text-6xl font-bold mb-4">{slide.title}</h2>
                    <p className="text-lg lg:text-xl mb-6 opacity-90">{slide.description}</p>
                    <button className="bg-background text-foreground px-8 py-3 rounded-lg font-bold hover:bg-background/90 transition-colors shadow-lg">
                      {slide.buttonText}
                    </button>
                  </div>
                </div>
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
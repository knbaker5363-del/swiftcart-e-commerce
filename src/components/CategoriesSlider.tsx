import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getIconByName } from '@/lib/categoryIcons';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: string;
  name: string;
  image_url?: string | null;
  icon_name?: string | null;
  bg_color?: string | null;
}

interface CategoryDisplaySettings {
  shape?: 'square' | 'circle';
  displayType?: 'image' | 'icon';
  size?: 'small' | 'large';
}

interface CategoriesSliderProps {
  categories: Category[] | undefined;
  isLoading: boolean;
  displayStyle?: 'slider' | 'grid';
  settings?: CategoryDisplaySettings;
}

const RenderCategoryIcon = ({
  iconName,
  className
}: {
  iconName: string;
  className?: string;
}) => {
  const IconComponent = getIconByName(iconName);
  if (!IconComponent) {
    return <Grid3X3 className={className} />;
  }
  return <IconComponent className={className} />;
};

const CategoriesSlider = ({ 
  categories, 
  isLoading, 
  displayStyle = 'slider',
  settings = { shape: 'square', displayType: 'image', size: 'large' }
}: CategoriesSliderProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { shape = 'square', displayType = 'image', size = 'large' } = settings;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    scrollRef.current?.setAttribute('data-touch-start-x', touch.clientX.toString());
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const startX = parseFloat(scrollRef.current.getAttribute('data-touch-start-x') || '0');
    const touch = e.touches[0];
    const diff = startX - touch.clientX;
    scrollRef.current.scrollLeft += diff;
    scrollRef.current.setAttribute('data-touch-start-x', touch.clientX.toString());
  };

  // Size classes
  const getSizeClasses = () => {
    if (size === 'small') {
      return {
        container: 'w-16 h-16',
        icon: 'h-6 w-6',
        minWidth: 'min-w-[80px]',
        text: 'text-xs',
        maxWidth: 'max-w-[80px]'
      };
    }
    return {
      container: 'w-24 h-24',
      icon: 'h-10 w-10',
      minWidth: 'min-w-[110px]',
      text: 'text-sm',
      maxWidth: 'max-w-[110px]'
    };
  };

  const sizeClasses = getSizeClasses();
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  const renderCategory = (category: Category, onClick?: () => void) => {
    const bgColorStyle = category.bg_color ? { backgroundColor: category.bg_color } : {};
    const showImage = displayType === 'image' && category.image_url;
    const showIcon = displayType === 'icon' || !category.image_url;

    return (
      <Link
        key={category.id}
        to={`/category/${category.id}`}
        onClick={onClick}
        className={`flex flex-col items-center gap-2 ${sizeClasses.minWidth} group`}
      >
        <div
          className={`${sizeClasses.container} ${shapeClass} overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-md border-2 border-border flex items-center justify-center`}
          style={showImage ? {} : (category.bg_color ? bgColorStyle : { backgroundColor: 'hsl(var(--primary) / 0.1)' })}
        >
          {showImage ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          ) : category.icon_name ? (
            <RenderCategoryIcon iconName={category.icon_name} className={`${sizeClasses.icon} text-primary`} />
          ) : (
            <Grid3X3 className={`${sizeClasses.icon} text-muted-foreground`} />
          )}
        </div>
        <span className={`${sizeClasses.text} font-medium text-center line-clamp-1 ${sizeClasses.maxWidth}`}>
          {category.name}
        </span>
      </Link>
    );
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden py-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 min-w-[90px]">
            <Skeleton className={`${sizeClasses.container} ${shapeClass}`} />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  // Grid style rendering (shows 10 categories + "View More" link if more)
  if (displayStyle === 'grid') {
    const visibleCategories = categories?.slice(0, 10) || [];
    const hasMore = (categories?.length || 0) > 10;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
          {visibleCategories.map((category) => {
            const bgColorStyle = category.bg_color ? { backgroundColor: category.bg_color } : {};
            const showImage = displayType === 'image' && category.image_url;
            
            return (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`${size === 'small' ? 'w-14 h-14' : 'w-16 h-16 md:w-20 md:h-20'} ${shapeClass} overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-md border-2 border-border flex items-center justify-center`}
                  style={showImage ? {} : (category.bg_color ? bgColorStyle : { backgroundColor: 'hsl(var(--primary) / 0.1)' })}
                >
                  {showImage ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : category.icon_name ? (
                    <RenderCategoryIcon iconName={category.icon_name} className={`${size === 'small' ? 'h-5 w-5' : 'h-6 w-6 md:h-8 md:w-8'} text-primary`} />
                  ) : (
                    <Grid3X3 className={`${size === 'small' ? 'h-5 w-5' : 'h-6 w-6 md:h-8 md:w-8'} text-muted-foreground`} />
                  )}
                </div>
                <span className={`${size === 'small' ? 'text-[10px]' : 'text-xs'} font-medium text-center line-clamp-1 max-w-[70px]`}>
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* View More Link */}
        {hasMore && (
          <div className="flex justify-center">
            <Link
              to="/products"
              className="px-6 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
            >
              عرض جميع التصنيفات ({categories?.length})
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Default slider style
  return (
    <div className="relative group/slider">
      {/* Scroll Left Button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Scroll Right Button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Categories Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1 scroll-smooth touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {categories?.map((cat) => renderCategory(cat))}
      </div>
    </div>
  );
};

export default CategoriesSlider;

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

interface CategoriesSliderProps {
  categories: Category[] | undefined;
  isLoading: boolean;
  displayStyle?: 'square' | 'circle' | 'icon';
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

const CategoriesSlider = ({ categories, isLoading, displayStyle = 'square' }: CategoriesSliderProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getShapeClass = () => {
    switch (displayStyle) {
      case 'circle':
        return 'rounded-full';
      case 'icon':
        return 'rounded-xl';
      default:
        return 'rounded-xl';
    }
  };

  const renderCategory = (category: Category) => {
    const shapeClass = getShapeClass();
    const bgColorStyle = category.bg_color ? { backgroundColor: category.bg_color } : {};

    // Icon only style
    if (displayStyle === 'icon') {
      return (
        <Link
          key={category.id}
          to={`/category/${category.id}`}
          className="flex flex-col items-center gap-2 min-w-[80px] group"
        >
          <div
            className={`w-16 h-16 ${shapeClass} flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md`}
            style={category.bg_color ? bgColorStyle : { backgroundColor: 'hsl(var(--primary) / 0.1)' }}
          >
            {category.icon_name ? (
              <RenderCategoryIcon iconName={category.icon_name} className="h-8 w-8 text-primary" />
            ) : (
              <Grid3X3 className="h-8 w-8 text-primary" />
            )}
          </div>
          <span className="text-xs font-medium text-center line-clamp-1 max-w-[80px]">
            {category.name}
          </span>
        </Link>
      );
    }

    // Square or Circle with image
    return (
      <Link
        key={category.id}
        to={`/category/${category.id}`}
        className="flex flex-col items-center gap-2 min-w-[90px] group"
      >
        <div
          className={`w-20 h-20 ${shapeClass} overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-md border-2 border-border`}
        >
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          ) : category.icon_name ? (
            <div
              className="w-full h-full flex items-center justify-center"
              style={category.bg_color ? bgColorStyle : { backgroundColor: 'hsl(var(--primary) / 0.1)' }}
            >
              <RenderCategoryIcon iconName={category.icon_name} className="h-10 w-10 text-primary" />
            </div>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Grid3X3 className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
        <span className="text-xs font-medium text-center line-clamp-1 max-w-[90px]">
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
            <Skeleton className={`w-20 h-20 ${displayStyle === 'circle' ? 'rounded-full' : 'rounded-xl'}`} />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

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
        className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map(renderCategory)}
      </div>
    </div>
  );
};

export default CategoriesSlider;

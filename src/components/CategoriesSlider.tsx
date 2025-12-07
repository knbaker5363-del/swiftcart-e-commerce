import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Grid3X3, ChevronDown, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getIconByName } from '@/lib/categoryIcons';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  displayStyle?: 'square' | 'circle' | 'icon' | 'dropdown';
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
          className="flex flex-col items-center gap-2 min-w-[100px] group"
        >
          <div
            className={`w-20 h-20 ${shapeClass} flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md`}
            style={category.bg_color ? bgColorStyle : { backgroundColor: 'hsl(var(--primary) / 0.1)' }}
          >
            {category.icon_name ? (
              <RenderCategoryIcon iconName={category.icon_name} className="h-10 w-10 text-primary" />
            ) : (
              <Grid3X3 className="h-10 w-10 text-primary" />
            )}
          </div>
          <span className="text-sm font-medium text-center line-clamp-1 max-w-[100px]">
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
        className="flex flex-col items-center gap-2 min-w-[110px] group"
      >
        <div
          className={`w-24 h-24 ${shapeClass} overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-md border-2 border-border`}
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
              <RenderCategoryIcon iconName={category.icon_name} className="h-12 w-12 text-primary" />
            </div>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Grid3X3 className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-center line-clamp-1 max-w-[110px]">
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

  // Dropdown style rendering
  if (displayStyle === 'dropdown') {
    return (
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 h-12 px-6 text-base">
              <List className="h-5 w-5" />
              <span>التصنيفات</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-56 max-h-[400px] overflow-y-auto bg-background z-50"
          >
            {categories.map((category) => (
              <DropdownMenuItem key={category.id} asChild>
                <Link 
                  to={`/category/${category.id}`}
                  className="flex items-center gap-3 py-3 cursor-pointer"
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: category.bg_color || 'hsl(var(--primary) / 0.1)' }}
                  >
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : category.icon_name ? (
                      <RenderCategoryIcon iconName={category.icon_name} className="h-4 w-4 text-primary" />
                    ) : (
                      <Grid3X3 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <span className="font-medium">{category.name}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
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
        className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1 scroll-smooth touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {categories.map(renderCategory)}
      </div>
    </div>
  );
};

export default CategoriesSlider;

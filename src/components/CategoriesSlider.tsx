import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Grid3X3, ChevronDown, List, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getIconByName } from '@/lib/categoryIcons';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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
  displayStyle?: 'slider' | 'dropdown' | 'sidebar';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            className="w-64 max-h-[400px] overflow-y-auto bg-background z-50"
          >
            {categories?.map((category) => (
              <DropdownMenuItem key={category.id} asChild>
                <Link 
                  to={`/category/${category.id}`}
                  className="flex items-center gap-3 py-3 cursor-pointer"
                >
                  <div 
                    className={`${size === 'small' ? 'w-8 h-8' : 'w-10 h-10'} ${shapeClass} flex items-center justify-center shrink-0 overflow-hidden`}
                    style={{ backgroundColor: category.bg_color || 'hsl(var(--primary) / 0.1)' }}
                  >
                    {displayType === 'image' && category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className={`w-full h-full object-cover ${shapeClass}`}
                      />
                    ) : category.icon_name ? (
                      <RenderCategoryIcon iconName={category.icon_name} className="h-5 w-5 text-primary" />
                    ) : (
                      <Grid3X3 className="h-5 w-5 text-primary" />
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

  // Sidebar style rendering (shows 4 categories + "View More" button)
  if (displayStyle === 'sidebar') {
    const visibleCategories = categories?.slice(0, 4) || [];
    const hasMore = (categories?.length || 0) > 4;

    return (
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {/* Show first 4 categories */}
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
                className={`${size === 'small' ? 'w-16 h-16' : 'w-20 h-20'} ${shapeClass} overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-md border-2 border-border flex items-center justify-center`}
                style={showImage ? {} : (category.bg_color ? bgColorStyle : { backgroundColor: 'hsl(var(--primary) / 0.1)' })}
              >
                {showImage ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : category.icon_name ? (
                  <RenderCategoryIcon iconName={category.icon_name} className={`${size === 'small' ? 'h-6 w-6' : 'h-8 w-8'} text-primary`} />
                ) : (
                  <Grid3X3 className={`${size === 'small' ? 'h-6 w-6' : 'h-8 w-8'} text-muted-foreground`} />
                )}
              </div>
              <span className={`${size === 'small' ? 'text-xs' : 'text-sm'} font-medium text-center line-clamp-1 max-w-[80px]`}>
                {category.name}
              </span>
            </Link>
          );
        })}

        {/* View More Button - opens sidebar */}
        {hasMore && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center gap-2 group cursor-pointer">
                <div
                  className={`${size === 'small' ? 'w-16 h-16' : 'w-20 h-20'} ${shapeClass} overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-md border-2 border-primary/50 flex items-center justify-center bg-primary/10`}
                >
                  <Menu className={`${size === 'small' ? 'h-6 w-6' : 'h-8 w-8'} text-primary`} />
                </div>
                <span className={`${size === 'small' ? 'text-xs' : 'text-sm'} font-medium text-center text-primary`}>
                  عرض المزيد
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 bg-background">
              <SheetHeader className="p-4 border-b bg-muted/30">
                <SheetTitle className="text-right">جميع التصنيفات</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto h-[calc(100vh-80px)]">
                {categories?.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border/50"
                  >
                    <div 
                      className={`${size === 'small' ? 'w-10 h-10' : 'w-14 h-14'} ${shapeClass} flex items-center justify-center shrink-0 overflow-hidden shadow-sm`}
                      style={{ backgroundColor: category.bg_color || 'hsl(var(--primary) / 0.1)' }}
                    >
                      {displayType === 'image' && category.image_url ? (
                        <img 
                          src={category.image_url} 
                          alt={category.name}
                          className={`w-full h-full object-cover ${shapeClass}`}
                        />
                      ) : category.icon_name ? (
                        <RenderCategoryIcon iconName={category.icon_name} className={`${size === 'small' ? 'h-5 w-5' : 'h-7 w-7'} text-primary`} />
                      ) : (
                        <Grid3X3 className={`${size === 'small' ? 'h-5 w-5' : 'h-7 w-7'} text-primary`} />
                      )}
                    </div>
                    <span className="font-medium text-base">{category.name}</span>
                    <ChevronLeft className="h-5 w-5 mr-auto text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
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

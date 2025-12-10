import { useState, useCallback, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImageCarouselProps {
  mainImage: string;
  additionalImages?: string[];
  productName: string;
}

export const ProductImageCarousel = memo<ProductImageCarouselProps>(({
  mainImage,
  additionalImages = [],
  productName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const allImages = [mainImage, ...additionalImages];

  const nextImage = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
    setImageLoaded(false);
  }, [allImages.length]);

  const prevImage = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    setImageLoaded(false);
  }, [allImages.length]);

  // Touch handling for swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe left - next image (RTL)
        prevImage();
      } else {
        // Swipe right - prev image (RTL)
        nextImage();
      }
    }
    setTouchStart(null);
  }, [touchStart, nextImage, prevImage]);

  if (allImages.length <= 1) {
    return (
      <div className="relative overflow-hidden bg-muted/30 w-full aspect-[4/3]">
        <img
          src={mainImage}
          alt={productName}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
        />
      </div>
    );
  }

  return (
    <div 
      className="relative overflow-hidden bg-muted/30 w-full aspect-[4/3] group/carousel select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted/50 animate-pulse" />
      )}
      
      <img
        src={allImages[currentIndex]}
        alt={`${productName} - صورة ${currentIndex + 1}`}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
      />
      
      {/* Navigation Buttons - visible on hover (desktop) */}
      <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity pointer-events-none">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full shadow-md bg-background/90 hover:bg-background pointer-events-auto active:scale-95 transition-transform"
          onClick={prevImage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full shadow-md bg-background/90 hover:bg-background pointer-events-auto active:scale-95 transition-transform"
          onClick={nextImage}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Dots indicator for multiple images */}
      {allImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {allImages.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-primary' : 'bg-background/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
});
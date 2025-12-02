import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImageCarouselProps {
  mainImage: string;
  additionalImages?: string[];
  productName: string;
}

export const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  mainImage,
  additionalImages = [],
  productName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const allImages = [mainImage, ...additionalImages];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (allImages.length <= 1) {
    return (
      <div className="relative overflow-hidden bg-background w-full aspect-square">
        <img
          src={mainImage}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-background w-full aspect-square group/carousel">
      <img
        src={allImages[currentIndex]}
        alt={`${productName} - صورة ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      
      {/* Navigation Buttons - تظهر عند hover */}
      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 rounded-full shadow-lg bg-white/90 hover:bg-white"
          onClick={prevImage}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 rounded-full shadow-lg bg-white/90 hover:bg-white"
          onClick={nextImage}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {allImages.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
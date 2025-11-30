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
      <div className="relative overflow-hidden bg-gray-50 h-64">
        <img
          src={mainImage}
          alt={productName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gray-50 h-64 group/carousel">
      <img
        src={allImages[currentIndex]}
        alt={`${productName} - صورة ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      
      {/* Navigation Buttons - تظهر عند hover */}
      <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full shadow-lg bg-white/90 hover:bg-white"
          onClick={prevImage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full shadow-lg bg-white/90 hover:bg-white"
          onClick={nextImage}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {allImages.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentIndex
                ? 'w-6 bg-white'
                : 'w-1.5 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  showNavigation?: boolean;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  alt,
  className,
  aspectRatio = 'video',
  showNavigation = true,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  // Filter out invalid images
  const validImages = images.filter((img) => img && img.trim() !== '');

  // Auto-play functionality - must be before any conditional returns
  useEffect(() => {
    if (!autoPlay || validImages.length <= 1) {
      return;
    }

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
      }, autoPlayInterval);
    };

    const stopAutoPlay = () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };

    startAutoPlay();

    return () => {
      stopAutoPlay();
    };
  }, [autoPlay, autoPlayInterval, validImages.length]);

  // Return placeholder if no valid images
  if (!validImages.length) {
    return (
      <div
        className={cn(
          'relative w-full bg-gray-100 flex items-center justify-center rounded-xl overflow-hidden',
          aspectRatio === 'square' && 'aspect-square',
          aspectRatio === 'video' && 'aspect-video',
          aspectRatio === 'auto' && 'h-60',
          className
        )}
      >
        <Image
          src="/images/placeholder.svg"
          alt="No Image"
          width={160}
          height={160}
          className="opacity-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-500 text-sm font-medium">No Image</span>
        </div>
      </div>
    );
  }

  // If only one image, show it without carousel controls
  if (validImages.length === 1) {
    return (
      <div
        className={cn(
          'relative w-full rounded-xl overflow-hidden',
          aspectRatio === 'square' && 'aspect-square',
          aspectRatio === 'video' && 'aspect-video',
          aspectRatio === 'auto' && 'h-60',
          className
        )}
      >
        {imageErrors[0] ? (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <Image
              src="/images/placeholder.svg"
              alt="Error loading image"
              width={160}
              height={160}
              className="opacity-50"
            />
          </div>
        ) : (
          <Image
            src={validImages[0]}
            alt={alt}
            fill
            className="object-cover"
            onError={() => setImageErrors((prev) => ({ ...prev, 0: true }))}
            priority={true}
          />
        )}
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div
      className={cn(
        'relative w-full rounded-xl overflow-hidden group',
        aspectRatio === 'square' && 'aspect-square',
        aspectRatio === 'video' && 'aspect-video',
        aspectRatio === 'auto' && 'h-60',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Image */}
      <div className="relative w-full h-full">
        {imageErrors[currentIndex] ? (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <Image
              src="/images/placeholder.svg"
              alt="Error loading image"
              width={160}
              height={160}
              className="opacity-50"
            />
          </div>
        ) : (
          <Image
            src={validImages[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            fill
            className="object-cover"
            onError={() => handleImageError(currentIndex)}
            priority={currentIndex === 0}
          />
        )}
      </div>

      {/* Navigation Arrows */}
      {showNavigation && validImages.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="sm"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white border-0 hover:bg-black/60 backdrop-blur-sm w-8 h-8 p-0"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white border-0 hover:bg-black/60 backdrop-blur-sm w-8 h-8 p-0"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && validImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
          <div className="flex space-x-1.5">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'bg-white scale-110'
                    : 'bg-white/60 hover:bg-white/80'
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Image Counter */}
      {validImages.length > 1 && (
        <div className="absolute top-3 right-3 z-10 bg-black/40 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {currentIndex + 1}/{validImages.length}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;

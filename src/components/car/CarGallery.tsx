
import React, { useState, useEffect } from "react";
import { Car } from "@/types/car";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageStorage } from "@/hooks/useImageStorage";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CarGalleryProps {
  car: Car;
}

export const CarGallery = ({ car }: CarGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const imageStorage = useImageStorage();
  
  // Load images from storage on component mount
  useEffect(() => {
    if (car.images && car.images.length > 0) {
      const images = car.images.map(img => imageStorage.getImage(img));
      setLoadedImages(images);
    } else {
      setLoadedImages([]);
    }
  }, [car.images, imageStorage]);
  
  // Use placeholder if no images are available or if all images have errors
  const validImages = loadedImages.length > 0
    ? loadedImages.filter((_, index) => !imageErrors[index])
    : [];
    
  const images = validImages.length > 0 ? validImages : ["/placeholder.svg"];
  
  const handlePrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };
  
  const handleNext = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };
  
  const handleImageError = (index: number) => {
    console.log(`Image error in gallery: index ${index}`);
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
    
    // Reset to first image or placeholder if current image fails
    if (index === currentImageIndex && images.length > 1) {
      setCurrentImageIndex(0);
    }
  };
  
  // If using a placeholder image, show a different UI
  if (images.length === 1 && images[0] === "/placeholder.svg") {
    return (
      <div className="space-y-4">
        <div className="relative aspect-[16/9] flex items-center justify-center rounded-lg border bg-muted">
          <div className="text-center p-6">
            <ImageOff className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No images available for this car</p>
          </div>
        </div>
      </div>
    );
  }
  
  // For multiple images, use the carousel component
  if (images.length > 1) {
    return (
      <div className="space-y-4">
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-[16/9] relative rounded-lg border overflow-hidden bg-secondary">
                  <img 
                    src={image}
                    alt={`${car.make} ${car.model} - Image ${index + 1}`}
                    className="h-full w-full object-contain"
                    onError={() => handleImageError(index)}
                  />
                  <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs">
                    {index + 1} / {images.length}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "relative w-20 h-16 flex-shrink-0 rounded border transition-opacity",
                currentImageIndex === index 
                  ? "border-primary" 
                  : "hover:opacity-80"
              )}
              onClick={() => setCurrentImageIndex(index)}
            >
              <img 
                src={image} 
                alt={`Thumbnail ${index + 1}`} 
                className="h-full w-full object-cover rounded"
                onError={() => handleImageError(index)}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }
  
  // Single image display
  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-secondary">
        <img 
          src={images[0]} 
          alt={`${car.make} ${car.model}`} 
          className="h-full w-full object-contain"
          onError={() => handleImageError(0)}
        />
      </div>
    </div>
  );
};

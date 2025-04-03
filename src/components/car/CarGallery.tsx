
import React, { useState } from "react";
import { Car } from "@/types/car";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarGalleryProps {
  car: Car;
}

export const CarGallery = ({ car }: CarGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Use placeholder if no images are available
  const images = (car.images && car.images.length > 0) 
    ? car.images 
    : ["/placeholder.svg"];
  
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
  
  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-secondary">
        <img 
          src={images[currentImageIndex]} 
          alt={`${car.make} ${car.model}`} 
          className="h-full w-full object-contain"
        />
        
        {images.length > 1 && (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous image</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next image</span>
            </Button>
            
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentImageIndex === index 
                      ? "bg-background" 
                      : "bg-background/50"
                  )}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <span className="sr-only">Image {index + 1}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      
      {images.length > 1 && (
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
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

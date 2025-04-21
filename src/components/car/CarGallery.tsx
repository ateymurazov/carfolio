
import React, { useState } from "react";
import { Car } from "@/types/car";
import { cn } from "@/lib/utils";
import { ImageOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useCarCollections } from "@/hooks/useCarCollections";
import { toast } from "@/components/ui/use-toast";
import { useProcessedCars } from "@/hooks/useProcessedCars";

interface CarGalleryProps {
  car: Car;
}

export const CarGallery = ({ car }: CarGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { updateCar } = useCarCollections();
  
  // Process car to resolve images properly
  const processedCars = useProcessedCars([car]);
  const processedCar = processedCars[0];
  
  // Simple image handling - use images array or placeholder
  const images = car.images?.length ? car.images : ["/placeholder.svg"];
  
  // Handle deleting an image
  const handleDeleteImage = (index: number) => {
    if (!car.images || index >= car.images.length) {
      toast({
        title: "Error",
        description: "Cannot delete image: Invalid image index",
        variant: "destructive"
      });
      return;
    }
    
    // Update car with remaining images
    const updatedImages = [...car.images];
    updatedImages.splice(index, 1);
    
    updateCar(car.id, {
      ...car,
      images: updatedImages,
    });
    
    // Adjust current index if needed
    if (currentImageIndex >= updatedImages.length) {
      setCurrentImageIndex(Math.max(0, updatedImages.length - 1));
    }
    
    toast({
      title: "Image deleted",
      description: "Image was successfully removed"
    });
  };
  
  // If no images or using placeholder
  if (images.length === 1 && images[0] === "/placeholder.svg") {
    return (
      <div className="space-y-4">
        <div className="aspect-[16/9] flex items-center justify-center rounded-lg border bg-muted">
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
                    onError={(e) => {
                      console.error(`Failed to load image: ${image}`);
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs">
                    {index + 1} / {images.length}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
            <div
              key={index}
              className={cn(
                "relative w-20 h-16 flex-shrink-0 rounded border transition-opacity group cursor-pointer",
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
                onError={(e) => {
                  console.error(`Failed to load thumbnail: ${image}`);
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(index);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
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
          onError={(e) => {
            console.error(`Failed to load image: ${images[0]}`);
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        {images[0] !== "/placeholder.svg" && (
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteImage(0)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

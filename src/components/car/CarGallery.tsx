
import React, { useState } from "react";
import { Car } from "@/types/car";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageStorage } from "@/hooks/useImageStorage";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useCarCollections } from "@/hooks/useCarCollections";
import { toast } from "@/components/ui/use-toast";
import { CarImage } from "./CarImage";

interface CarGalleryProps {
  car: Car;
}

export const CarGallery = ({ car }: CarGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageStorage = useImageStorage();
  const { updateCar } = useCarCollections();
  
  // Filter out invalid image IDs
  const imageIds = (car.images || []).filter(Boolean);
  
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

    // Get the image ID to remove
    const imageId = car.images[index];
    
    try {
      // Remove from storage
      if (typeof imageId === 'string' && !imageId.startsWith('data:') && 
          !imageId.startsWith('http') && !imageId.startsWith('/')) {
        imageStorage.removeImage(imageId);
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
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // If no images, show placeholder
  if (imageIds.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-[16/9]">
          <CarImage
            imageId=""
            alt={`${car.make} ${car.model}`}
            className="h-full w-full"
            aspectRatio="video"
          />
        </div>
      </div>
    );
  }
  
  // For multiple images, use the carousel component
  if (imageIds.length > 1) {
    return (
      <div className="space-y-4">
        <Carousel className="w-full">
          <CarouselContent>
            {imageIds.map((imageId, index) => (
              <CarouselItem key={index}>
                <div className="aspect-[16/9] relative rounded-lg border overflow-hidden bg-secondary">
                  <CarImage
                    imageId={imageId}
                    alt={`${car.make} ${car.model} - Image ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs">
                    {index + 1} / {imageIds.length}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleDeleteImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {imageIds.map((imageId, index) => (
            <button
              key={index}
              className={cn(
                "relative w-20 h-16 flex-shrink-0 rounded border transition-opacity group",
                currentImageIndex === index 
                  ? "border-primary" 
                  : "hover:opacity-80"
              )}
              onClick={() => setCurrentImageIndex(index)}
            >
              <CarImage
                imageId={imageId}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover rounded"
                aspectRatio="auto"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-0 right-0 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage(index);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
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
        <CarImage
          imageId={imageIds[0]}
          alt={`${car.make} ${car.model}`}
          className="h-full w-full object-contain"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={() => handleDeleteImage(0)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

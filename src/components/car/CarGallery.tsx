
import React, { useState, useEffect } from "react";
import { Car } from "@/types/car";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ImageOff, Trash2 } from "lucide-react";
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

interface CarGalleryProps {
  car: Car;
}

export const CarGallery = ({ car }: CarGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const imageStorage = useImageStorage();
  const { updateCar } = useCarCollections();
  
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
      if (typeof imageId === 'string' && !imageId.startsWith('data:')) {
        imageStorage.removeImage(imageId);
      }
      
      // Update car with remaining images
      const updatedImages = [...car.images];
      updatedImages.splice(index, 1);
      
      updateCar(car.id, {
        ...car,
        images: updatedImages,
      });
      
      // Update loaded images
      setLoadedImages(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
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
          {images.map((image, index) => (
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
              <img 
                src={image} 
                alt={`Thumbnail ${index + 1}`} 
                className="h-full w-full object-cover rounded"
                onError={() => handleImageError(index)}
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
        <img 
          src={images[0]} 
          alt={`${car.make} ${car.model}`} 
          className="h-full w-full object-contain"
          onError={() => handleImageError(0)}
        />
        {images[0] !== "/placeholder.svg" && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => handleDeleteImage(0)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

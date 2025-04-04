
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car } from "@/types/car";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCarCollections } from "@/hooks/useCarCollections";
import { Badge } from "@/components/ui/badge";
import { useImageStorage } from "@/hooks/useImageStorage";
import { cn } from "@/lib/utils";

interface FeaturedCarProps {
  car: Car;
}

export const FeaturedCar = ({ car }: FeaturedCarProps) => {
  const navigate = useNavigate();
  const { getCollectionById } = useCarCollections();
  const [imageError, setImageError] = useState(false);
  const [loadedImage, setLoadedImage] = useState<string>("");
  const imageStorage = useImageStorage();
  
  // Load image from storage when component mounts
  useEffect(() => {
    if (car.images && car.images.length > 0) {
      try {
        const imageId = car.images[0];
        const img = imageStorage.getImage(imageId);
        
        if (img) {
          setLoadedImage(img);
          setImageError(false);
        } else {
          console.warn(`Image ${imageId} not found in storage for featured car`);
          setImageError(true);
        }
      } catch (error) {
        console.error(`Error loading image for featured car ${car.id}:`, error);
        setImageError(true);
      }
    }
  }, [car.images, imageStorage, car.id]);
  
  // Get the collection for this car
  const collection = car.collectionId ? getCollectionById(car.collectionId) : null;
  
  // Placeholder car image if not provided or if there's an error
  const carImage = imageError || !loadedImage
    ? "/placeholder.svg"
    : loadedImage;
  
  const handleImageError = () => {
    console.log(`Image error for featured car: ${car.id}`);
    setImageError(true);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-200">
        <img 
          src={carImage} 
          alt={`${car.make} ${car.model}`} 
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
        <Badge className={cn(
          "absolute top-2 right-2 text-white",
          car.status === "In Service" ? "bg-amber-500" : "bg-emerald-500"
        )}>
          {car.status || "Available"}
        </Badge>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {car.year} {car.make} {car.model}
          </h3>
          <div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => navigate(`/cars/${car.id}`)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">{car.exteriorColor}, {car.transmission}</span>
        </div>
        <div className="mt-2 flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="text-sm">
            <span>VIN: {car.vin.slice(-8)}</span>
          </div>
          {collection && (
            <div className="text-sm text-gray-600">
              Collection: {collection.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

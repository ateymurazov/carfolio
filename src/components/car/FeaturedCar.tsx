
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car } from "@/types/car";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCarCollections } from "@/hooks/useCarCollections";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CarImage } from "./CarImage";

interface FeaturedCarProps {
  car: Car;
}

export const FeaturedCar = ({ car }: FeaturedCarProps) => {
  const navigate = useNavigate();
  const { getCollectionById } = useCarCollections();
  const [hasImageError, setHasImageError] = useState(false);
  
  // Get the collection for this car
  const collection = car.collectionId ? getCollectionById(car.collectionId) : null;
  
  // Get the primary image ID with better error handling
  const getFirstValidImage = () => {
    if (!car.images || !Array.isArray(car.images) || car.images.length === 0) return "";
    return car.images[0] || "";
  };
  
  const imageId = getFirstValidImage();
  
  const handleImageError = () => {
    console.log(`Image error for featured car ${car.id}`);
    setHasImageError(true);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-200">
        <CarImage 
          imageId={imageId}
          alt={`${car.make} ${car.model}`} 
          className="h-full w-full object-cover"
          aspectRatio="video"
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

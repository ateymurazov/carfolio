
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car } from "@/types/car";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car as CarIcon } from "lucide-react";
import { useCarCollections } from "@/hooks/useCarCollections";
import { Badge } from "@/components/ui/badge";

interface FeaturedCarProps {
  car: Car;
}

export const FeaturedCar = ({ car }: FeaturedCarProps) => {
  const navigate = useNavigate();
  const { getCollectionById } = useCarCollections();
  const collection = getCollectionById(car.collectionId);
  const [imageError, setImageError] = useState(false);
  
  // Placeholder car image if not provided or if there's an error
  const carImage = imageError || !(car.images && car.images.length > 0)
    ? "/placeholder.svg"
    : car.images[0];
  
  const handleImageError = () => {
    console.log(`Image error for featured car: ${car.id}`);
    setImageError(true);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
        <img 
          src={carImage} 
          alt={`${car.make} ${car.model}`} 
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
        <Badge className="absolute top-2 right-2">
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
        <div className="flex items-center text-sm text-muted-foreground">
          <CarIcon className="mr-1 h-4 w-4" /> Collection: {collection?.name || "None"}
        </div>
        <div className="mt-2">
          <p className="text-sm line-clamp-2">
            {car.notes || `${car.exteriorColor} exterior with ${car.interiorColor} interior. ${car.transmission} transmission.`}
          </p>
        </div>
      </div>
    </div>
  );
};

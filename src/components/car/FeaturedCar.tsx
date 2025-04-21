
import React from "react";
import { useNavigate } from "react-router-dom";
import { Car } from "@/types/car";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCarCollections } from "@/hooks/useCarCollections";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProcessedCars } from "@/hooks/useProcessedCars";

interface FeaturedCarProps {
  car: Car;
}

export const FeaturedCar = ({ car }: FeaturedCarProps) => {
  const navigate = useNavigate();
  const { getCollectionById } = useCarCollections();
  
  // Get the collection for this car
  const collection = car.collectionId ? getCollectionById(car.collectionId) : null;
  
  // Process car to get resolved images
  const processedCars = useProcessedCars([car]);
  const processedCar = processedCars[0];
  
  // Use the first resolved image or placeholder
  const carImage = !processedCar.resolvedImages?.length 
    ? "/placeholder.svg" 
    : processedCar.resolvedImages[0];
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-200">
        <img 
          src={carImage} 
          alt={`${car.make} ${car.model}`} 
          className="h-full w-full object-cover"
          onError={(e) => {
            console.error(`Failed to load image in FeaturedCar: ${carImage}`);
            e.currentTarget.src = "/placeholder.svg";
          }}
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

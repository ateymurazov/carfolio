
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car as CarType } from "@/types/car";
import { cn } from "@/lib/utils";
import { CarImage } from "./CarImage";
import { ImageOff } from "lucide-react";

interface CarCardProps {
  car: CarType;
  className?: string;
}

export const CarCard = ({ car, className }: CarCardProps) => {
  const navigate = useNavigate();
  const [hasImageError, setHasImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Get the first valid image ID or empty string if none exists
  const getFirstValidImage = () => {
    if (!car.images || !Array.isArray(car.images) || car.images.length === 0) return "";
    return car.images[0] || "";
  };
  
  const imageId = getFirstValidImage();
  
  // Reset image error state when car changes
  useEffect(() => {
    setHasImageError(false);
    setIsImageLoaded(false);
  }, [car.id, imageId]);
  
  const handleImageError = () => {
    console.log(`Image error for car ${car.id}`);
    setHasImageError(true);
  };
  
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };
  
  return (
    <div 
      className={cn("bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition-all cursor-pointer", className)}
      onClick={() => navigate(`/cars/${car.id}`)}
    >
      <div className="aspect-[16/9] bg-gray-200 relative">
        {!hasImageError && imageId ? (
          <CarImage 
            imageId={imageId}
            alt={`${car.make} ${car.model}`} 
            className="h-full w-full object-cover"
            aspectRatio="video"
            onError={handleImageError}
            fallbackSrc="/placeholder.svg"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <ImageOff className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">
          {car.year} {car.make} {car.model}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {car.exteriorColor}, {car.transmission}
        </p>
        
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
          <div className="text-sm">
            <span>VIN: {car.vin ? car.vin.slice(-8) : 'N/A'}</span>
          </div>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full text-white",
            car.status === "In Service" 
              ? "bg-amber-500" 
              : "bg-emerald-500"
          )}>
            {car.status || "Available"}
          </span>
        </div>
      </div>
    </div>
  );
};

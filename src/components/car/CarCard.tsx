
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car as CarType } from "@/types/car";
import { cn } from "@/lib/utils";
import { CarImage } from "./CarImage";

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
    
    // Try each image in sequence until we find one that seems valid
    for (const img of car.images) {
      if (img && img !== "/placeholder.svg") {
        return img;
      }
    }
    
    return "";
  };
  
  const imageId = getFirstValidImage();
  
  const handleImageError = () => {
    console.log(`Image error for car ${car.id}: ${imageId}`);
    setHasImageError(true);
  };
  
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };
  
  return (
    <div 
      className={cn(
        "bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition-all cursor-pointer",
        className
      )}
      onClick={() => navigate(`/cars/${car.id}`)}
    >
      <div className="aspect-[16/9] bg-gray-100 relative">
        <CarImage 
          imageId={imageId}
          alt={`${car.make} ${car.model}`} 
          className="h-full w-full object-cover"
          aspectRatio="video"
          onError={handleImageError}
          onLoad={handleImageLoad}
          fallbackSrc="/placeholder.svg"
        />
        
        {!isImageLoaded && !hasImageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-60">
            <div className="w-6 h-6 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
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

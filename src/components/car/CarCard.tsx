
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car as CarType } from "@/types/car";
import { cn } from "@/lib/utils";
import { useImageStorage } from "@/hooks/useImageStorage";

interface CarCardProps {
  car: CarType;
  className?: string;
}

export const CarCard = ({ car, className }: CarCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [loadedImage, setLoadedImage] = useState<string>("");
  const imageStorage = useImageStorage();
  
  // Load image from storage when component mounts
  useEffect(() => {
    if (car.images && car.images.length > 0) {
      const img = imageStorage.getImage(car.images[0]);
      setLoadedImage(img);
    }
  }, [car.images, imageStorage]);
  
  // Placeholder car image if not provided or if there's an error
  const carImage = imageError || !loadedImage
    ? "/placeholder.svg"
    : loadedImage;
  
  const handleImageError = () => {
    console.log(`Image error for car: ${car.id}`);
    setImageError(true);
  };
  
  return (
    <div 
      className={cn("bg-card border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all", className)}
      onClick={() => navigate(`/cars/${car.id}`)}
    >
      <div className="aspect-[16/9] bg-secondary relative">
        <img 
          src={carImage} 
          alt={`${car.make} ${car.model}`} 
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold">
          {car.year} {car.make} {car.model}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {car.exteriorColor}, {car.transmission}
        </p>
        
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm">
            <span>VIN: {car.vin.slice(-8)}</span>
          </div>
          <span className={cn(
            "text-xs px-3 py-1 rounded-full",
            car.status === "In Service" 
              ? "bg-amber-100 text-amber-800" 
              : "bg-emerald-100 text-emerald-800"
          )}>
            {car.status || "Available"}
          </span>
        </div>
      </div>
    </div>
  );
};

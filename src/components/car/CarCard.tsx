
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car as CarType } from "@/types/car";
import { cn } from "@/lib/utils";
import { useImageStorage } from "@/hooks/useImageStorage";
import { toast } from "@/components/ui/use-toast";

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
    try {
      if (car.images && car.images.length > 0) {
        // Try to get the image from storage
        const img = imageStorage.getImage(car.images[0]);
        // Check if we got a placeholder back (indicating image not found)
        if (img === '/placeholder.svg') {
          console.log(`Using placeholder for car ${car.id} - image not found in storage`);
          setImageError(true);
        } else {
          setLoadedImage(img);
        }
      }
    } catch (error) {
      console.error(`Failed to load image for car ${car.id}:`, error);
      setImageError(true);
    }
  }, [car.images, car.id, imageStorage]);
  
  // Determine which image to display
  const carImage = imageError || !loadedImage || loadedImage === '/placeholder.svg'
    ? "/placeholder.svg"
    : loadedImage;
  
  const handleImageError = () => {
    console.log(`Image error for car: ${car.id}`);
    setImageError(true);
  };
  
  return (
    <div 
      className={cn("bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition-all cursor-pointer", className)}
      onClick={() => navigate(`/cars/${car.id}`)}
    >
      <div className="aspect-[16/9] bg-gray-200 relative">
        <img 
          src={carImage} 
          alt={`${car.make} ${car.model}`} 
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
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
            <span>VIN: {car.vin.slice(-8)}</span>
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

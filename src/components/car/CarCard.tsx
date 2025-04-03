
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car as CarType } from "@/types/car";
import { cn } from "@/lib/utils";

interface CarCardProps {
  car: CarType;
  className?: string;
}

export const CarCard = ({ car, className }: CarCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  // Placeholder car image if not provided or if there's an error
  const carImage = imageError || !(car.images && car.images.length > 0)
    ? "/placeholder.svg"
    : car.images[0];
  
  return (
    <div 
      className={cn("car-card animation-hover cursor-pointer", className)}
      onClick={() => navigate(`/cars/${car.id}`)}
    >
      <div className="car-card-image">
        <img 
          src={carImage} 
          alt={`${car.make} ${car.model}`} 
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
      <div className="car-card-content">
        <h3 className="text-lg font-semibold">
          {car.year} {car.make} {car.model}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {car.exteriorColor}, {car.transmission}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm">VIN: {car.vin.slice(-8)}</span>
          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
            {car.status || "Available"}
          </span>
        </div>
      </div>
    </div>
  );
};


import React from "react";
import { useNavigate } from "react-router-dom";
import { Car as CarType } from "@/types/car";
import { cn } from "@/lib/utils";
import { useProcessedCars } from "@/hooks/useProcessedCars";

interface CarCardProps {
  car: CarType;
  className?: string;
}

export const CarCard = ({ car, className }: CarCardProps) => {
  const navigate = useNavigate();
  
  // Process car to get resolved images
  const processedCars = useProcessedCars([car]);
  const processedCar = processedCars[0];
  
  // Use the first resolved image or placeholder
  const carImage = !processedCar.resolvedImages?.length 
    ? "/placeholder.svg" 
    : processedCar.resolvedImages[0];
  
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
          onError={(e) => {
            console.error(`Failed to load image in CarCard: ${carImage}`);
            e.currentTarget.src = "/placeholder.svg";
          }}
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

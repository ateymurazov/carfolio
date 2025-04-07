
import React, { useEffect, useState } from "react";
import { Car } from "@/types/car";
import { CarCard } from "./CarCard";
import { cn } from "@/lib/utils";

interface CarGridProps {
  cars: Car[];
  className?: string;
}

export const CarGrid = ({ cars, className }: CarGridProps) => {
  const [validCars, setValidCars] = useState<Car[]>([]);
  
  // Filter out invalid cars
  useEffect(() => {
    // Make sure we have valid car data
    const filtered = cars.filter(car => 
      car && car.id && car.make && car.model
    );
    
    if (filtered.length !== cars.length) {
      console.log(`Filtered out ${cars.length - filtered.length} invalid cars`);
    }
    
    setValidCars(filtered);
  }, [cars]);

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", className)}>
      {validCars.map(car => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
};

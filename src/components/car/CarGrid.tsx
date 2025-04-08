
import React from "react";
import { Car } from "@/types/car";
import { CarCard } from "./CarCard";
import { cn } from "@/lib/utils";

interface CarGridProps {
  cars: Car[];
  className?: string;
}

export const CarGrid = ({ cars, className }: CarGridProps) => {
  // Filter out invalid cars inline rather than using state
  const validCars = cars.filter(car => {
    const isValid = car && car.id && car.make && car.model;
    if (!isValid) {
      console.warn(`CarGrid: Filtered out invalid car`, car);
    }
    return isValid;
  });
  
  if (validCars.length !== cars.length) {
    console.log(`CarGrid: Filtered out ${cars.length - validCars.length} invalid cars`);
  }
  
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", className)}>
      {validCars.map(car => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
};

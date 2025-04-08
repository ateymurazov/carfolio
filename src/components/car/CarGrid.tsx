
import React from "react";
import { Car } from "@/types/car";
import { CarCard } from "./CarCard";
import { cn } from "@/lib/utils";
import { StorageUsageIndicator } from "@/components/ui/storage-indicator";

interface CarGridProps {
  cars: Car[];
  className?: string;
}

export const CarGrid = ({ cars, className }: CarGridProps) => {
  // Ensure we're working with a valid array of cars
  const carsArray = Array.isArray(cars) ? cars : [];
  
  // Filter out invalid cars inline rather than using state
  const validCars = carsArray.filter(car => {
    const isValid = car && car.id && car.make && car.model;
    if (!isValid) {
      console.warn(`CarGrid: Filtered out invalid car`, car);
    }
    return isValid;
  });
  
  if (validCars.length !== carsArray.length) {
    console.log(`CarGrid: Filtered out ${carsArray.length - validCars.length} invalid cars`);
  }
  
  return (
    <>
      <StorageUsageIndicator />
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", className)}>
        {validCars.map(car => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </>
  );
};

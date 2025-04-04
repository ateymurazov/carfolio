
import React from "react";
import { Car } from "@/types/car";
import { CarCard } from "./CarCard";
import { cn } from "@/lib/utils";

interface CarGridProps {
  cars: Car[];
  className?: string;
}

export const CarGrid = ({ cars, className }: CarGridProps) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {cars.map(car => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
};

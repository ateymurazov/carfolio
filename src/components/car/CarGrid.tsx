import React from "react";
import { Car } from "@/types/car";
import { CarCard } from "./CarCard";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useCarStorage } from "@/hooks/useCarStorage";
import { toast } from "@/components/ui/use-toast";

interface CarGridProps {
  cars: Car[];
  className?: string;
  isLoading?: boolean;
}

export const CarGrid = ({ cars, className, isLoading = false }: CarGridProps) => {
  const { backupData } = useCarStorage();
  
  const handleBackup = () => {
    try {
      backupData();
    } catch (error) {
      console.error("Backup failed:", error);
      toast({
        title: "Backup Failed",
        description: "There was an error creating your backup.",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white border rounded-lg overflow-hidden shadow">
            <Skeleton className="aspect-[16/9] w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="pt-2 mt-3 border-t border-gray-100 flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-1/4 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBackup}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          <span>Backup Data</span>
        </Button>
      </div>
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", className)}>
        {cars.map(car => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </>
  );
};

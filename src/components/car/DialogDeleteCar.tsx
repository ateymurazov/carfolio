
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { useCarCollections } from "@/hooks/useCarCollections";

interface DialogDeleteCarProps {
  carId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export const DialogDeleteCar = ({ 
  carId, 
  open, 
  onOpenChange,
  onDeleted 
}: DialogDeleteCarProps) => {
  const { getCarById, deleteCar } = useCarCollections();
  const car = getCarById(carId);
  
  const handleDelete = async () => {
    try {
      if (car) {
        await deleteCar(carId);
        
        toast({
          title: "Car deleted",
          description: `${car.year} ${car.make} ${car.model} has been removed from the inventory.`,
        });
        
        if (onDeleted) {
          onDeleted();
        }
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete car. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (!car) return null;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the {car.year} {car.make} {car.model} from your inventory.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

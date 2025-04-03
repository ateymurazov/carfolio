
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

interface DialogDeleteCollectionProps {
  collectionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export const DialogDeleteCollection = ({ 
  collectionId, 
  open, 
  onOpenChange,
  onDeleted 
}: DialogDeleteCollectionProps) => {
  const { getCollectionById, deleteCollection, getCarsByCollectionId } = useCarCollections();
  const collection = getCollectionById(collectionId);
  const cars = getCarsByCollectionId(collectionId);
  
  const handleDelete = () => {
    try {
      if (collection) {
        // Check if collection has cars
        if (cars.length > 0) {
          toast({
            title: "Cannot delete collection",
            description: `The collection contains ${cars.length} cars. Move or delete the cars first.`,
            variant: "destructive",
          });
          onOpenChange(false);
          return;
        }
        
        deleteCollection(collectionId);
        
        toast({
          title: "Collection deleted",
          description: `"${collection.name}" collection has been deleted.`,
        });
        
        if (onDeleted) {
          onDeleted();
        }
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete collection. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (!collection) return null;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {cars.length > 0 ? (
              <>
                This collection contains {cars.length} cars. You cannot delete a collection
                that contains cars. Please move or delete the cars first.
              </>
            ) : (
              <>
                This will permanently delete the "{collection.name}" collection.
                This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {cars.length === 0 && (
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

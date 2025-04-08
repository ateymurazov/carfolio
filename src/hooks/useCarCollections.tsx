
import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { toast } from "@/components/ui/use-toast";
import { useDatabase } from "./useDatabase";

// Define the context type
interface CarCollectionsContextType {
  cars: Car[];
  collections: Collection[];
  isLoading: boolean;
  isOnline: boolean;
  getCarById: (id: string) => Car | undefined;
  getCollectionById: (id: string) => Collection | undefined;
  getCarsByCollectionId: (collectionId: string) => Car[];
  addCar: (car: Car) => Promise<void>;
  updateCar: (idOrCars: string | Car[], car?: Car) => Promise<void>;
  deleteCar: (id: string) => Promise<void>;
  addCollection: (collection: Collection) => Promise<void>;
  updateCollection: (idOrCollections: string | Collection[], collection?: Collection) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  mergeImportedData: (importedCars: Car[], importedCollections: Collection[]) => Promise<boolean>;
  backupData: () => Promise<void>;
  restoreInitialData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

// Create the context
const CarCollectionsContext = createContext<CarCollectionsContextType | undefined>(undefined);

// Provider component
export const CarCollectionsProvider = ({ children }: { children: ReactNode }) => {
  const {
    cars,
    collections,
    isLoading,
    error,
    isOnline,
    getCarById,
    getCarsByCollectionId,
    getCollectionById,
    addCar,
    updateCar,
    deleteCar,
    addCollection,
    updateCollection,
    deleteCollection,
    mergeImportedData,
    backupData,
    restoreInitialData,
    refreshData
  } = useDatabase();
  
  // Show toast when offline status changes
  useEffect(() => {
    if (!isOnline) {
      toast({
        title: "You are offline",
        description: "Working with local data. Changes will sync when back online.",
      });
    }
  }, [isOnline]);
  
  // Show error toast if database error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "Database Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error]);
  
  // Context value
  const contextValue: CarCollectionsContextType = {
    cars,
    collections,
    isLoading,
    isOnline,
    getCarById,
    getCollectionById,
    getCarsByCollectionId,
    addCar,
    updateCar,
    deleteCar,
    addCollection,
    updateCollection,
    deleteCollection,
    mergeImportedData,
    backupData,
    restoreInitialData,
    refreshData
  };
  
  return (
    <CarCollectionsContext.Provider value={contextValue}>
      {children}
    </CarCollectionsContext.Provider>
  );
};

// Hook to use the context
export const useCarCollections = () => {
  const context = useContext(CarCollectionsContext);
  if (context === undefined) {
    throw new Error('useCarCollections must be used within a CarCollectionsProvider');
  }
  return context;
};

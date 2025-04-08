
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { useDatabase } from "@/hooks/useDatabase";

export type CarStorageState = {
  cars: Car[];
  collections: Collection[];
};

export function useCarStorage(): CarStorageState & {
  updateCars: (cars: Car[]) => Promise<void>;
  updateCollections: (collections: Collection[]) => Promise<void>;
  backupData: () => Promise<void>;
  restoreInitialData: () => Promise<void>;
} {
  const { 
    cars, 
    collections, 
    updateCar, 
    updateCollection,
    backupData,
    restoreInitialData
  } = useDatabase();
  
  return {
    cars,
    collections,
    updateCars: (newCars: Car[]) => updateCar(newCars),
    updateCollections: (newCollections: Collection[]) => updateCollection(newCollections),
    backupData,
    restoreInitialData
  };
}

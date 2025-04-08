
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { useIndexedDBState } from "@/hooks/useIndexedDBState";
import { initialCars, initialCollections } from "@/data/initialCarData";
import { saveBackup } from "@/utils/indexedDBUtils";

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
  const [cars, setCars] = useIndexedDBState<Car[]>('cars', initialCars);
  const [collections, setCollections] = useIndexedDBState<Collection[]>('collections', initialCollections);
  
  const updateCars = async (newCars: Car[]) => {
    setCars(newCars);
    return Promise.resolve();
  };
  
  const updateCollections = async (newCollections: Collection[]) => {
    setCollections(newCollections);
    return Promise.resolve();
  };
  
  const backupData = async () => {
    try {
      await saveBackup(cars, collections);
      console.log("Backup created successfully");
      return Promise.resolve();
    } catch (error) {
      console.error("Backup failed:", error);
      return Promise.reject(error);
    }
  };
  
  const restoreInitialData = async () => {
    setCars(initialCars);
    setCollections(initialCollections);
    return Promise.resolve();
  };
  
  return {
    cars,
    collections,
    updateCars,
    updateCollections,
    backupData,
    restoreInitialData
  };
}

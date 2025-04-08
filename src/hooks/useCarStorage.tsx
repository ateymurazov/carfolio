
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { useIndexedDBState } from "@/hooks/useIndexedDBState";
import { initialCars, initialCollections } from "@/data/initialCarData";
import { saveBackup, clearAllData } from "@/utils/indexedDBUtils";

export type CarStorageState = {
  cars: Car[];
  collections: Collection[];
};

export function useCarStorage(): CarStorageState & {
  updateCars: (cars: Car[]) => Promise<void>;
  updateCollections: (collections: Collection[]) => Promise<void>;
  backupData: () => Promise<void>;
  restoreInitialData: () => Promise<void>;
  syncWithInitialData: () => Promise<void>;
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
  
  // New function to force synchronization with initial data
  const syncWithInitialData = async () => {
    // Clear IndexedDB to start fresh
    await clearAllData();
    // Set with initial data
    setCars(initialCars);
    setCollections(initialCollections);
    console.log("Synchronized with initial data: ", initialCars.length, "cars and", initialCollections.length, "collections");
    return Promise.resolve();
  };
  
  return {
    cars,
    collections,
    updateCars,
    updateCollections,
    backupData,
    restoreInitialData,
    syncWithInitialData
  };
}


import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { initialCars, initialCollections } from "@/data/initialCarData";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useImageStorage } from "@/hooks/useImageStorage";
import { toast } from "@/components/ui/use-toast";
import { createAndDownloadBackup, createBackupData } from "@/utils/backupUtils";

export type CarStorageState = {
  cars: Car[];
  collections: Collection[];
};

export function useCarStorage(): CarStorageState & {
  updateCars: (cars: Car[]) => void;
  updateCollections: (collections: Collection[]) => void;
  resetToInitialData: () => void;
  backupData: () => void;
} {
  const [cars, setCars] = useLocalStorageState<Car[]>('cars', initialCars);
  const [collections, setCollections] = useLocalStorageState<Collection[]>('collections', initialCollections);
  const { imageStore } = useImageStorage();
  
  // Helper to create and download data backup file
  const backupData = () => {
    try {
      createAndDownloadBackup(cars, collections, imageStore, "car-inventory-backup");
      // Note: createAndDownloadBackup already shows success/failure toast
    } catch (error) {
      console.error("Backup failed:", error);
      toast({
        title: "Backup Failed",
        description: "There was an error creating your backup.",
        variant: "destructive"
      });
    }
  };
  
  const resetToInitialData = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all data to the initial state? This will replace all your current data."
    );
    
    if (confirmReset) {
      // Create automatic backup before resetting
      try {
        // Store current data with timestamp
        const backupData = createBackupData(cars, collections, imageStore);
        const enhancedBackup = {
          ...backupData,
          _autoBackupBeforeReset: true
        };
        
        // Save to a special localStorage key
        localStorage.setItem('autoBackup_beforeReset', JSON.stringify(enhancedBackup));
        
        console.log("Auto-backup created before data reset");
      } catch (e) {
        console.error("Failed to create auto-backup:", e);
      }
      
      // Now reset the data
      setCars(initialCars);
      setCollections(initialCollections);
      
      toast({
        title: "Data Reset",
        description: "All data has been reset to the initial state. A backup was automatically created.",
        variant: "default"
      });
    }
  };
  
  return {
    cars,
    collections,
    updateCars: setCars,
    updateCollections: setCollections,
    resetToInitialData,
    backupData
  };
}

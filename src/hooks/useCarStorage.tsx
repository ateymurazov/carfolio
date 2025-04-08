
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { initialCars, initialCollections } from "@/data/initialCarData";
import { useIndexedDBState } from "@/hooks/useIndexedDBState";
import { toast } from "@/components/ui/use-toast";
import { saveBackup, clearAllData } from "@/utils/indexedDBUtils";

export type CarStorageState = {
  cars: Car[];
  collections: Collection[];
};

export function useCarStorage(): CarStorageState & {
  updateCars: (cars: Car[]) => void;
  updateCollections: (collections: Collection[]) => void;
  backupData: () => void;
  restoreInitialData: () => void;
} {
  const [cars, setCars] = useIndexedDBState<Car[]>('cars', initialCars);
  const [collections, setCollections] = useIndexedDBState<Collection[]>('collections', initialCollections);
  
  // Manual restore function for initial data - ONLY triggered explicitly by user
  const restoreInitialData = async () => {
    try {
      // Create backup of current data before resetting
      await saveBackup(cars, collections);
      
      // Now restore initial data
      setCars(initialCars);
      setCollections(initialCollections);
      
      toast({
        title: "Data Restored",
        description: "Initial demo data has been restored.",
      });
    } catch (error) {
      console.error("Failed to restore initial data:", error);
      toast({
        title: "Restore Failed",
        description: "There was an error restoring the initial data.",
        variant: "destructive"
      });
    }
  };
  
  const backupData = async () => {
    try {
      // Create a backup in IndexedDB
      await saveBackup(cars, collections);
      
      // Create a downloadable backup file as well
      const backup = {
        cars,
        collections,
        timestamp: new Date().toISOString(),
        version: "1.0"
      };
      
      const jsonData = JSON.stringify(backup, null, 2);
      
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `car-inventory-backup-${date}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup Created",
        description: "Your data has been backed up successfully.",
      });
    } catch (error) {
      console.error("Backup failed:", error);
      toast({
        title: "Backup Failed",
        description: "There was an error creating your backup.",
        variant: "destructive"
      });
    }
  };
  
  return {
    cars,
    collections,
    updateCars: (newCars: Car[]) => {
      setCars(newCars);
    },
    updateCollections: (newCollections: Collection[]) => {
      setCollections(newCollections);
    },
    backupData,
    restoreInitialData
  };
}

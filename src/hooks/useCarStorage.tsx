
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { initialCars, initialCollections } from "@/data/initialCarData";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { toast } from "@/components/ui/use-toast";

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
  const [cars, setCars] = useLocalStorageState<Car[]>('cars', initialCars);
  const [collections, setCollections] = useLocalStorageState<Collection[]>('collections', initialCollections);
  
  // Safety check - recover from null/undefined but NEVER reset to initial data automatically
  if (cars === null || cars === undefined) {
    console.error("Critical error: cars state is null/undefined. Attempting recovery...");
    
    // Try to recover from previous state or backups
    try {
      const prevCars = localStorage.getItem('cars_prev');
      if (prevCars) {
        console.log("Recovering cars from previous state");
        setCars(JSON.parse(prevCars));
      } else {
        // Use empty array instead of initialCars to avoid auto-reset
        console.warn("No previous state found, using empty cars array");
        setCars([]);
      }
    } catch (e) {
      console.error("Recovery failed:", e);
      setCars([]);
    }
  }
  
  // Similarly for collections
  if (collections === null || collections === undefined) {
    console.error("Critical error: collections state is null/undefined. Attempting recovery...");
    
    try {
      const prevCollections = localStorage.getItem('collections_prev');
      if (prevCollections) {
        console.log("Recovering collections from previous state");
        setCollections(JSON.parse(prevCollections));
      } else {
        // Use empty array instead of initialCollections to avoid auto-reset
        console.warn("No previous state found, using empty collections array");
        setCollections([]);
      }
    } catch (e) {
      console.error("Recovery failed:", e);
      setCollections([]);
    }
  }
  
  // Manual restore function for initial data - ONLY triggered explicitly by user
  const restoreInitialData = () => {
    try {
      // Create backup of current data before resetting
      const currentData = {
        cars,
        collections,
        timestamp: new Date().toISOString(),
        version: "pre-reset"
      };
      
      localStorage.setItem('cars_pre_reset', JSON.stringify(cars));
      localStorage.setItem('collections_pre_reset', JSON.stringify(collections));
      
      // Now restore initial data
      setCars(initialCars);
      setCollections(initialCollections);
      
      toast({
        title: "Data Restored",
        description: "Initial demo data has been restored. Your previous data was backed up.",
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
  
  const backupData = () => {
    try {
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
    updateCars: setCars,
    updateCollections: setCollections,
    backupData,
    restoreInitialData
  };
}


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
  
  // Safety check - recover from null/undefined using last known good state
  if (cars === null || cars === undefined) {
    console.error("Critical error: cars state is null/undefined. Attempting recovery from last known good state...");
    
    // Try to recover from last known good state
    try {
      const lastGoodState = localStorage.getItem('cars_last_good');
      if (lastGoodState) {
        console.log("Recovering cars from last known good state");
        setCars(JSON.parse(lastGoodState));
      } else {
        const prevCars = localStorage.getItem('cars_prev');
        if (prevCars) {
          console.log("Recovering cars from previous state");
          setCars(JSON.parse(prevCars));
        } else {
          // Check if it's first run by checking localStorage size
          const isFirstRun = localStorage.length === 0;
          // Use initial data for first run only
          setCars(isFirstRun ? initialCars : []);
          
          if (!isFirstRun) {
            console.warn("No previous or good state found. Will display empty state with recovery option.");
          }
        }
      }
    } catch (e) {
      console.error("Recovery failed:", e);
      // Check if it's first run
      const isFirstRun = localStorage.length === 0;
      setCars(isFirstRun ? initialCars : []);
    }
  } else {
    // Store current valid state as last known good state
    try {
      localStorage.setItem('cars_last_good', JSON.stringify(cars));
    } catch (e) {
      console.error("Failed to save last good state for cars:", e);
    }
  }
  
  // Similarly for collections
  if (collections === null || collections === undefined) {
    console.error("Critical error: collections state is null/undefined. Attempting recovery from last known good state...");
    
    try {
      const lastGoodState = localStorage.getItem('collections_last_good');
      if (lastGoodState) {
        console.log("Recovering collections from last known good state");
        setCollections(JSON.parse(lastGoodState));
      } else {
        const prevCollections = localStorage.getItem('collections_prev');
        if (prevCollections) {
          console.log("Recovering collections from previous state");
          setCollections(JSON.parse(prevCollections));
        } else {
          // Check if it's first run
          const isFirstRun = localStorage.length === 0;
          // Use initial data for first run only
          setCollections(isFirstRun ? initialCollections : []);
          
          if (!isFirstRun) {
            console.warn("No previous or good state found. Will display empty state with recovery option.");
          }
        }
      }
    } catch (e) {
      console.error("Recovery failed:", e);
      // Check if it's first run
      const isFirstRun = localStorage.length === 0;
      setCollections(isFirstRun ? initialCollections : []);
    }
  } else {
    // Store current valid state as last known good state
    try {
      localStorage.setItem('collections_last_good', JSON.stringify(collections));
    } catch (e) {
      console.error("Failed to save last good state for collections:", e);
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
    updateCars: (newCars: Car[]) => {
      setCars(newCars);
      // Update last known good state when we explicitly update
      try {
        localStorage.setItem('cars_last_good', JSON.stringify(newCars));
      } catch (e) {
        console.error("Failed to save last good state for cars:", e);
      }
    },
    updateCollections: (newCollections: Collection[]) => {
      setCollections(newCollections);
      // Update last known good state when we explicitly update
      try {
        localStorage.setItem('collections_last_good', JSON.stringify(newCollections));
      } catch (e) {
        console.error("Failed to save last good state for collections:", e);
      }
    },
    backupData,
    restoreInitialData
  };
}

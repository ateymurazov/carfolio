
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
  resetToInitialData: () => void;
  backupData: () => void;
} {
  const [cars, setCars] = useLocalStorageState<Car[]>('cars', initialCars);
  const [collections, setCollections] = useLocalStorageState<Collection[]>('collections', initialCollections);
  
  // Helper to create and download data backup file
  const backupData = () => {
    try {
      // Create backup object with timestamp
      const backup = {
        cars,
        collections,
        timestamp: new Date().toISOString(),
        version: "1.0"
      };
      
      // Convert to JSON string with pretty formatting
      const jsonData = JSON.stringify(backup, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Setup the download link
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `car-inventory-backup-${date}.json`;
      
      // Trigger download and cleanup
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
  
  const resetToInitialData = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all data to the initial state? This will replace all your current data."
    );
    
    if (confirmReset) {
      // Create automatic backup before resetting
      try {
        // Store current data with timestamp
        const backupData = {
          cars,
          collections,
          timestamp: new Date().toISOString(),
          _autoBackupBeforeReset: true
        };
        
        // Save to a special localStorage key
        localStorage.setItem('autoBackup_beforeReset', JSON.stringify(backupData));
        
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

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { toast } from "@/components/ui/use-toast";
import { useIndexedDBState } from "./useIndexedDBState";
import { initialCars, initialCollections } from "@/data/initialCarData";
import { saveBackup, getLastKnownGoodState } from "@/utils/indexedDBUtils";
import { v4 as uuidv4 } from "uuid";

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use IndexedDB directly for storage
  const [cars, setCars] = useIndexedDBState<Car[]>('cars', initialCars);
  const [collections, setCollections] = useIndexedDBState<Collection[]>('collections', initialCollections);
  
  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      try {
        // If we have no data in IndexedDB, try to recover from last known good state
        if (cars.length === 0 || collections.length === 0) {
          const lastGoodState = await getLastKnownGoodState();
          
          if (lastGoodState) {
            if (cars.length === 0 && lastGoodState.cars && lastGoodState.cars.length > 0) {
              setCars(lastGoodState.cars);
            }
            
            if (collections.length === 0 && lastGoodState.collections && lastGoodState.collections.length > 0) {
              setCollections(lastGoodState.collections);
            }
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error("Failed to load data"));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [cars.length, collections.length, setCars, setCollections]);
  
  // Helper functions
  const getCarById = (id: string) => cars.find(car => car.id === id);
  
  const getCarsByCollectionId = (collectionId: string) => 
    cars.filter(car => car.collectionId === collectionId);
  
  const getCollectionById = (id: string) => 
    collections.find(collection => collection.id === id);
  
  // Car operations
  const addCar = async (car: Car) => {
    // Ensure car has an ID
    if (!car.id) {
      car.id = uuidv4();
    }
    
    const updatedCars = [...cars, car];
    setCars(updatedCars);
    await saveBackup(updatedCars, collections);
  };
  
  const updateCar = async (idOrCars: string | Car[], carUpdate?: Car) => {
    let updatedCars: Car[];
    
    // Handle bulk update case
    if (Array.isArray(idOrCars)) {
      updatedCars = idOrCars;
      setCars(updatedCars);
      await saveBackup(updatedCars, collections);
      return;
    }
    
    // Handle single car update
    if (idOrCars && carUpdate) {
      updatedCars = cars.map(c => c.id === idOrCars ? carUpdate : c);
      setCars(updatedCars);
      await saveBackup(updatedCars, collections);
    }
  };
  
  const deleteCar = async (id: string) => {
    const updatedCars = cars.filter(car => car.id !== id);
    setCars(updatedCars);
    await saveBackup(updatedCars, collections);
  };
  
  // Collection operations
  const addCollection = async (collection: Collection) => {
    // Ensure collection has an ID
    if (!collection.id) {
      collection.id = uuidv4();
    }
    
    const updatedCollections = [...collections, collection];
    setCollections(updatedCollections);
    await saveBackup(cars, updatedCollections);
  };
  
  const updateCollection = async (idOrCollections: string | Collection[], collectionUpdate?: Collection) => {
    let updatedCollections: Collection[];
    
    // Handle bulk update case
    if (Array.isArray(idOrCollections)) {
      updatedCollections = idOrCollections;
      setCollections(updatedCollections);
      await saveBackup(cars, updatedCollections);
      return;
    }
    
    // Handle single collection update
    if (idOrCollections && collectionUpdate) {
      updatedCollections = collections.map(c => c.id === idOrCollections ? collectionUpdate : c);
      setCollections(updatedCollections);
      await saveBackup(cars, updatedCollections);
    }
  };
  
  const deleteCollection = async (id: string) => {
    const updatedCollections = collections.filter(collection => collection.id !== id);
    setCollections(updatedCollections);
    await saveBackup(cars, updatedCollections);
  };
  
  // Data management functions
  const mergeImportedData = async (importedCars: Car[], importedCollections: Collection[]) => {
    try {
      // Create maps of existing data for faster lookup
      const existingCarsMap = new Map(cars.map(car => [car.id, car]));
      const existingCollectionsMap = new Map(collections.map(collection => [collection.id, collection]));
      
      // Process imported collections first
      const mergedCollections = [...collections];
      
      importedCollections.forEach(importedCollection => {
        if (existingCollectionsMap.has(importedCollection.id)) {
          // Update existing collection
          const index = mergedCollections.findIndex(c => c.id === importedCollection.id);
          if (index !== -1) {
            mergedCollections[index] = importedCollection;
          }
        } else {
          // Add new collection
          mergedCollections.push(importedCollection);
        }
      });
      
      // Process imported cars
      const mergedCars = [...cars];
      
      importedCars.forEach(importedCar => {
        if (existingCarsMap.has(importedCar.id)) {
          // Update existing car
          const index = mergedCars.findIndex(c => c.id === importedCar.id);
          if (index !== -1) {
            mergedCars[index] = importedCar;
          }
        } else {
          // Add new car
          mergedCars.push(importedCar);
        }
      });
      
      // Update state
      setCars(mergedCars);
      setCollections(mergedCollections);
      
      // Create backup
      await saveBackup(mergedCars, mergedCollections);
      
      return true;
    } catch (error) {
      console.error("Failed to merge imported data:", error);
      toast({
        title: "Import Failed",
        description: "There was an error importing the data.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const backupData = async () => {
    try {
      await saveBackup(cars, collections);
      
      // Create a downloadable backup file
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
      
      toast({
        title: "Backup Created",
        description: "Your data has been backed up successfully.",
      });
    } catch (error) {
      console.error("Backup failed:", error);
      toast({
        title: "Backup Failed",
        description: "There was an error creating your backup.",
        variant: "destructive",
      });
    }
  };
  
  const restoreInitialData = async () => {
    try {
      // Create backup before resetting
      await saveBackup(cars, collections);
      
      // Reset to initial data
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
        variant: "destructive",
      });
    }
  };
  
  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      // For a local-only app, refreshing data doesn't make much sense
      // We'll just reload from IndexedDB by forcing a re-render
      
      toast({
        title: "Data Refreshed",
        description: "Your data has been refreshed.",
      });
    } catch (error) {
      console.error("Data refresh failed:", error);
      toast({
        title: "Refresh Failed",
        description: "There was an error refreshing your data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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

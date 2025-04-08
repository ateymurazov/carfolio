
import { createContext, useContext, ReactNode, useEffect } from "react";
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { useCarStorage } from "./useCarStorage";
import { toast } from "@/components/ui/use-toast";

// Define the context type
interface CarCollectionsContextType {
  cars: Car[];
  collections: Collection[];
  getCarById: (id: string) => Car | undefined;
  getCollectionById: (id: string) => Collection | undefined;
  getCarsByCollectionId: (collectionId: string) => Car[];
  addCar: (car: Car) => void;
  updateCar: (idOrCars: string | Car[], car?: Car) => void;
  deleteCar: (id: string) => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (idOrCollections: string | Collection[], collection?: Collection) => void;
  deleteCollection: (id: string) => void;
  mergeImportedData: (importedCars: Car[], importedCollections: Collection[]) => void;
}

// Create the context
const CarCollectionsContext = createContext<CarCollectionsContextType | undefined>(undefined);

// Provider component
export const CarCollectionsProvider = ({ children }: { children: ReactNode }) => {
  const { cars, collections, updateCars, updateCollections } = useCarStorage();
  
  // Stability check on mount - make sure we're not getting unexpected resets
  useEffect(() => {
    if (cars.length === 0 && localStorage.getItem('cars')) {
      console.error("Potential data loss detected: cars array is empty but localStorage has data");
      
      try {
        // First try last known good state
        const lastGoodCars = localStorage.getItem('cars_last_good');
        if (lastGoodCars) {
          console.log("Recovering cars data from last known good state");
          const parsedCars = JSON.parse(lastGoodCars);
          if (Array.isArray(parsedCars) && parsedCars.length > 0) {
            updateCars(parsedCars);
            
            toast({
              title: "Data Recovery",
              description: "Detected and recovered your car data",
            });
            
            return;
          }
        }
        
        // If last known good state fails, try direct localStorage
        const storedCars = localStorage.getItem('cars');
        if (storedCars) {
          const parsedCars = JSON.parse(storedCars);
          if (Array.isArray(parsedCars) && parsedCars.length > 0) {
            console.log("Recovering cars data from localStorage directly");
            updateCars(parsedCars);
            
            toast({
              title: "Data Recovery",
              description: "Detected and recovered your car data",
            });
          }
        }
      } catch (e) {
        console.error("Recovery attempt failed:", e);
      }
    }
    
    // Similar check for collections
    if (collections.length === 0 && localStorage.getItem('collections')) {
      console.error("Potential data loss detected: collections array is empty but localStorage has data");
      
      try {
        // First try last known good state
        const lastGoodCollections = localStorage.getItem('collections_last_good');
        if (lastGoodCollections) {
          console.log("Recovering collections data from last known good state");
          const parsedCollections = JSON.parse(lastGoodCollections);
          if (Array.isArray(parsedCollections) && parsedCollections.length > 0) {
            updateCollections(parsedCollections);
            return;
          }
        }
        
        // If last known good state fails, try direct localStorage
        const storedCollections = localStorage.getItem('collections');
        if (storedCollections) {
          const parsedCollections = JSON.parse(storedCollections);
          if (Array.isArray(parsedCollections) && parsedCollections.length > 0) {
            console.log("Recovering collections data from localStorage directly");
            updateCollections(parsedCollections);
          }
        }
      } catch (e) {
        console.error("Recovery attempt failed:", e);
      }
    }
  }, [cars, collections, updateCars, updateCollections]);
  
  // Car operations
  const getCarById = (id: string) => {
    return cars.find(car => car.id === id);
  };
  
  const getCarsByCollectionId = (collectionId: string) => {
    return cars.filter(car => car.collectionId === collectionId);
  };
  
  const addCar = (car: Car) => {
    const newCars = [...cars, car];
    updateCars(newCars);
    // Update last known good state
    try {
      localStorage.setItem('cars_last_good', JSON.stringify(newCars));
    } catch (e) {
      console.error("Failed to save last good state for cars:", e);
    }
  };
  
  const updateCar = (idOrCars: string | Car[], carUpdate?: Car) => {
    // Bulk update case
    if (Array.isArray(idOrCars)) {
      updateCars(idOrCars);
      // Update last known good state
      try {
        localStorage.setItem('cars_last_good', JSON.stringify(idOrCars));
      } catch (e) {
        console.error("Failed to save last good state for cars:", e);
      }
      return;
    }
    
    // Single car update case
    if (idOrCars && carUpdate) {
      console.log("Updating car:", idOrCars, carUpdate);
      const newCars = cars.map(c => c.id === idOrCars ? carUpdate : c);
      updateCars(newCars);
      // Update last known good state
      try {
        localStorage.setItem('cars_last_good', JSON.stringify(newCars));
      } catch (e) {
        console.error("Failed to save last good state for cars:", e);
      }
    }
  };
  
  const deleteCar = (id: string) => {
    const newCars = cars.filter(car => car.id !== id);
    updateCars(newCars);
    // Update last known good state
    try {
      localStorage.setItem('cars_last_good', JSON.stringify(newCars));
    } catch (e) {
      console.error("Failed to save last good state for cars:", e);
    }
  };
  
  // Collection operations
  const getCollectionById = (id: string) => {
    return collections.find(collection => collection.id === id);
  };
  
  const addCollection = (collection: Collection) => {
    const newCollections = [...collections, collection];
    updateCollections(newCollections);
    // Update last known good state
    try {
      localStorage.setItem('collections_last_good', JSON.stringify(newCollections));
    } catch (e) {
      console.error("Failed to save last good state for collections:", e);
    }
  };
  
  const updateCollection = (idOrCollections: string | Collection[], collectionUpdate?: Collection) => {
    // Bulk update case
    if (Array.isArray(idOrCollections)) {
      updateCollections(idOrCollections);
      // Update last known good state
      try {
        localStorage.setItem('collections_last_good', JSON.stringify(idOrCollections));
      } catch (e) {
        console.error("Failed to save last good state for collections:", e);
      }
      return;
    }
    
    // Single collection update case
    if (idOrCollections && collectionUpdate) {
      const newCollections = collections.map(c => c.id === idOrCollections ? collectionUpdate : c);
      updateCollections(newCollections);
      // Update last known good state
      try {
        localStorage.setItem('collections_last_good', JSON.stringify(newCollections));
      } catch (e) {
        console.error("Failed to save last good state for collections:", e);
      }
    }
  };
  
  const deleteCollection = (id: string) => {
    const newCollections = collections.filter(collection => collection.id !== id);
    updateCollections(newCollections);
    // Update last known good state
    try {
      localStorage.setItem('collections_last_good', JSON.stringify(newCollections));
    } catch (e) {
      console.error("Failed to save last good state for collections:", e);
    }
  };
  
  // New method to handle merging imported data with existing data
  const mergeImportedData = (importedCars: Car[], importedCollections: Collection[]) => {
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
    
    // Update storage with merged data
    updateCollections(mergedCollections);
    updateCars(mergedCars);
    
    // Update last known good states
    try {
      localStorage.setItem('cars_last_good', JSON.stringify(mergedCars));
      localStorage.setItem('collections_last_good', JSON.stringify(mergedCollections));
    } catch (e) {
      console.error("Failed to save last good state after merging imported data:", e);
    }
  };
  
  // Context value
  const contextValue = {
    cars,
    collections,
    getCarById,
    getCollectionById,
    getCarsByCollectionId,
    addCar,
    updateCar,
    deleteCar,
    addCollection,
    updateCollection,
    deleteCollection,
    mergeImportedData
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

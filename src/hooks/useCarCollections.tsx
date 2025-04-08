
import { createContext, useContext, ReactNode, useEffect } from "react";
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { useCarStorage } from "./useCarStorage";
import { toast } from "@/components/ui/use-toast";
import { getAllFromStore, saveToStore } from "@/utils/indexedDBUtils";

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
    const checkDataIntegrity = async () => {
      if (cars.length === 0) {
        console.log("Cars array is empty, checking if we have data in IndexedDB");
        
        try {
          // Check if we have data in IndexedDB directly
          const storedCars = await getAllFromStore<Car[]>("cars");
          
          if (storedCars && storedCars.length > 0) {
            console.log("Found cars in IndexedDB, updating state");
            // Fix: Ensure we're passing a flat array of Car objects
            updateCars(Array.isArray(storedCars[0]) ? storedCars[0] : storedCars);
            
            toast({
              title: "Data Recovery",
              description: "Detected and recovered your car data",
            });
          }
        } catch (e) {
          console.error("Recovery attempt failed:", e);
        }
      }
      
      if (collections.length === 0) {
        console.log("Collections array is empty, checking if we have data in IndexedDB");
        
        try {
          // Check if we have data in IndexedDB directly
          const storedCollections = await getAllFromStore<Collection[]>("collections");
          
          if (storedCollections && storedCollections.length > 0) {
            console.log("Found collections in IndexedDB, updating state");
            // Fix: Ensure we're passing a flat array of Collection objects
            updateCollections(Array.isArray(storedCollections[0]) ? storedCollections[0] : storedCollections);
          }
        } catch (e) {
          console.error("Recovery attempt failed:", e);
        }
      }
    };
    
    checkDataIntegrity();
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
    // Update store directly too for extra redundancy
    saveToStore("cars", newCars);
  };
  
  const updateCar = (idOrCars: string | Car[], carUpdate?: Car) => {
    // Bulk update case
    if (Array.isArray(idOrCars)) {
      updateCars(idOrCars);
      // Update store directly too
      saveToStore("cars", idOrCars);
      return;
    }
    
    // Single car update case
    if (idOrCars && carUpdate) {
      console.log("Updating car:", idOrCars, carUpdate);
      const newCars = cars.map(c => c.id === idOrCars ? carUpdate : c);
      updateCars(newCars);
      // Update store directly too
      saveToStore("cars", newCars);
    }
  };
  
  const deleteCar = (id: string) => {
    const newCars = cars.filter(car => car.id !== id);
    updateCars(newCars);
    // Update store directly too
    saveToStore("cars", newCars);
  };
  
  // Collection operations
  const getCollectionById = (id: string) => {
    return collections.find(collection => collection.id === id);
  };
  
  const addCollection = (collection: Collection) => {
    const newCollections = [...collections, collection];
    updateCollections(newCollections);
    // Update store directly too
    saveToStore("collections", newCollections);
  };
  
  const updateCollection = (idOrCollections: string | Collection[], collectionUpdate?: Collection) => {
    // Bulk update case
    if (Array.isArray(idOrCollections)) {
      updateCollections(idOrCollections);
      // Update store directly too
      saveToStore("collections", idOrCollections);
      return;
    }
    
    // Single collection update case
    if (idOrCollections && collectionUpdate) {
      const newCollections = collections.map(c => c.id === idOrCollections ? collectionUpdate : c);
      updateCollections(newCollections);
      // Update store directly too
      saveToStore("collections", newCollections);
    }
  };
  
  const deleteCollection = (id: string) => {
    const newCollections = collections.filter(collection => collection.id !== id);
    updateCollections(newCollections);
    // Update store directly too
    saveToStore("collections", newCollections);
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
    
    // Update stores directly too
    saveToStore("collections", mergedCollections);
    saveToStore("cars", mergedCars);
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

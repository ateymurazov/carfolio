
import { createContext, useContext, ReactNode } from "react";
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { useCarStorage } from "./useCarStorage";

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
  
  // Car operations
  const getCarById = (id: string) => {
    return cars.find(car => car.id === id);
  };
  
  const getCarsByCollectionId = (collectionId: string) => {
    return cars.filter(car => car.collectionId === collectionId);
  };
  
  const addCar = (car: Car) => {
    updateCars([...cars, car]);
  };
  
  const updateCar = (idOrCars: string | Car[], carUpdate?: Car) => {
    // Bulk update case
    if (Array.isArray(idOrCars)) {
      updateCars(idOrCars);
      return;
    }
    
    // Single car update case
    if (idOrCars && carUpdate) {
      console.log("Updating car:", idOrCars, carUpdate);
      updateCars(cars.map(c => c.id === idOrCars ? carUpdate : c));
    }
  };
  
  const deleteCar = (id: string) => {
    updateCars(cars.filter(car => car.id !== id));
  };
  
  // Collection operations
  const getCollectionById = (id: string) => {
    return collections.find(collection => collection.id === id);
  };
  
  const addCollection = (collection: Collection) => {
    updateCollections([...collections, collection]);
  };
  
  const updateCollection = (idOrCollections: string | Collection[], collectionUpdate?: Collection) => {
    // Bulk update case
    if (Array.isArray(idOrCollections)) {
      updateCollections(idOrCollections);
      return;
    }
    
    // Single collection update case
    if (idOrCollections && collectionUpdate) {
      updateCollections(collections.map(c => c.id === idOrCollections ? collectionUpdate : c));
    }
  };
  
  const deleteCollection = (id: string) => {
    updateCollections(collections.filter(collection => collection.id !== id));
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

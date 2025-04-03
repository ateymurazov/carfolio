
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
  updateCar: (id: string, car: Car) => void;
  deleteCar: (id: string) => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, collection: Collection) => void;
  deleteCollection: (id: string) => void;
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
  
  const updateCar = (id: string, car: Car) => {
    console.log("Updating car:", id, car);
    updateCars(cars.map(c => c.id === id ? car : c));
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
  
  const updateCollection = (id: string, collection: Collection) => {
    updateCollections(collections.map(c => c.id === id ? collection : c));
  };
  
  const deleteCollection = (id: string) => {
    updateCollections(collections.filter(collection => collection.id !== id));
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
    deleteCollection
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

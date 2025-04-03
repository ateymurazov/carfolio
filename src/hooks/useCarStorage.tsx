
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { initialCars, initialCollections } from "@/data/initialCarData";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";

// Define return type for the hook
export type CarStorageState = {
  cars: Car[];
  collections: Collection[];
};

/**
 * Hook to manage car and collection data persistence
 */
export function useCarStorage(): CarStorageState & {
  updateCars: (cars: Car[]) => void;
  updateCollections: (collections: Collection[]) => void;
} {
  // Use local storage state with the extracted initial data
  const [cars, setCars] = useLocalStorageState<Car[]>('cars', initialCars);
  const [collections, setCollections] = useLocalStorageState<Collection[]>('collections', initialCollections);
  
  return {
    cars,
    collections,
    updateCars: setCars,
    updateCollections: setCollections
  };
}


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
} {
  const [cars, setCars] = useLocalStorageState<Car[]>('cars', initialCars);
  const [collections, setCollections] = useLocalStorageState<Collection[]>('collections', initialCollections);
  
  const resetToInitialData = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all data to the initial state? This will replace all your current data."
    );
    
    if (confirmReset) {
      setCars(initialCars);
      setCollections(initialCollections);
      
      toast({
        title: "Data Reset",
        description: "All data has been reset to the initial state.",
        variant: "default"
      });
    }
  };
  
  return {
    cars,
    collections,
    updateCars: setCars,
    updateCollections: setCollections,
    resetToInitialData
  };
}


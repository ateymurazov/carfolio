
import { useState, useEffect } from "react";
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { carsApi, collectionsApi, backupApi, clearCache } from "@/services/dbService";
import { toast } from "@/components/ui/use-toast";
import { initialCars, initialCollections } from "@/data/initialCarData";
import { useIndexedDBState } from "./useIndexedDBState";

export type DatabaseState = {
  cars: Car[];
  collections: Collection[];
  isLoading: boolean;
  error: Error | null;
};

export function useDatabase() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // We'll still use IndexedDB as a fallback/offline cache
  const [localCars, setLocalCars] = useIndexedDBState<Car[]>('cars', initialCars);
  const [localCollections, setLocalCollections] = useIndexedDBState<Collection[]>('collections', initialCollections);
  
  // Remote data state
  const [cars, setCars] = useState<Car[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  
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
    let isMounted = true;
    
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First try to load from remote database
        if (isOnline) {
          const [remoteCars, remoteCollections] = await Promise.all([
            carsApi.getAll(),
            collectionsApi.getAll()
          ]);
          
          if (isMounted) {
            setCars(remoteCars);
            setCollections(remoteCollections);
            
            // Also update local cache
            setLocalCars(remoteCars);
            setLocalCollections(remoteCollections);
          }
        } else {
          // If offline, use local cache
          setCars(localCars);
          setCollections(localCollections);
          
          toast({
            title: "Offline Mode",
            description: "Working with cached data. Changes will sync when you're back online.",
          });
        }
      } catch (err) {
        console.error("Error loading data:", err);
        
        if (isMounted) {
          // Fallback to local data
          setCars(localCars);
          setCollections(localCollections);
          
          if (err instanceof Error) {
            setError(err);
          } else {
            setError(new Error("Failed to load data"));
          }
          
          toast({
            title: "Connection Error",
            description: "Using local data. Changes may not be saved to the server.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [isOnline, localCars, localCollections, setLocalCars, setLocalCollections]);
  
  // Create operations with sync
  const addCar = async (car: Car) => {
    try {
      // Optimistic update
      const updatedCars = [...cars, car];
      setCars(updatedCars);
      setLocalCars(updatedCars);
      
      if (isOnline) {
        // Persist to remote database
        await carsApi.create(car);
      } else {
        toast({
          title: "Offline Mode",
          description: "Car saved locally. Will sync when you're back online.",
        });
      }
    } catch (error) {
      console.error("Failed to add car:", error);
      toast({
        title: "Error",
        description: "Failed to save car. Your changes may not persist.",
        variant: "destructive",
      });
    }
  };
  
  const updateCar = async (idOrCars: string | Car[], carUpdate?: Car) => {
    try {
      let updatedCars: Car[];
      
      // Handle bulk update case
      if (Array.isArray(idOrCars)) {
        updatedCars = idOrCars;
        setCars(updatedCars);
        setLocalCars(updatedCars);
        
        if (isOnline) {
          // Batch update is more complex - needs server support
          // This is a simplified approach
          await Promise.all(updatedCars.map(car => carsApi.update(car)));
        }
        return;
      }
      
      // Handle single car update
      if (idOrCars && carUpdate) {
        updatedCars = cars.map(c => c.id === idOrCars ? carUpdate : c);
        setCars(updatedCars);
        setLocalCars(updatedCars);
        
        if (isOnline) {
          await carsApi.update(carUpdate);
        }
      }
    } catch (error) {
      console.error("Failed to update car:", error);
      toast({
        title: "Error",
        description: "Failed to update car. Your changes may not persist.",
        variant: "destructive",
      });
    }
  };
  
  const deleteCar = async (id: string) => {
    try {
      // Optimistic delete
      const updatedCars = cars.filter(car => car.id !== id);
      setCars(updatedCars);
      setLocalCars(updatedCars);
      
      if (isOnline) {
        await carsApi.delete(id);
      }
    } catch (error) {
      console.error("Failed to delete car:", error);
      toast({
        title: "Error",
        description: "Failed to delete car. It may reappear when you refresh.",
        variant: "destructive",
      });
    }
  };
  
  // Collection operations
  const addCollection = async (collection: Collection) => {
    try {
      const updatedCollections = [...collections, collection];
      setCollections(updatedCollections);
      setLocalCollections(updatedCollections);
      
      if (isOnline) {
        await collectionsApi.create(collection);
      }
    } catch (error) {
      console.error("Failed to add collection:", error);
      toast({
        title: "Error",
        description: "Failed to save collection. Your changes may not persist.",
        variant: "destructive",
      });
    }
  };
  
  const updateCollection = async (idOrCollections: string | Collection[], collectionUpdate?: Collection) => {
    try {
      let updatedCollections: Collection[];
      
      // Handle bulk update case
      if (Array.isArray(idOrCollections)) {
        updatedCollections = idOrCollections;
        setCollections(updatedCollections);
        setLocalCollections(updatedCollections);
        
        if (isOnline) {
          await Promise.all(updatedCollections.map(coll => collectionsApi.update(coll)));
        }
        return;
      }
      
      // Handle single collection update
      if (idOrCollections && collectionUpdate) {
        updatedCollections = collections.map(c => c.id === idOrCollections ? collectionUpdate : c);
        setCollections(updatedCollections);
        setLocalCollections(updatedCollections);
        
        if (isOnline) {
          await collectionsApi.update(collectionUpdate);
        }
      }
    } catch (error) {
      console.error("Failed to update collection:", error);
      toast({
        title: "Error",
        description: "Failed to update collection. Your changes may not persist.",
        variant: "destructive",
      });
    }
  };
  
  const deleteCollection = async (id: string) => {
    try {
      // Optimistic delete
      const updatedCollections = collections.filter(collection => collection.id !== id);
      setCollections(updatedCollections);
      setLocalCollections(updatedCollections);
      
      if (isOnline) {
        await collectionsApi.delete(id);
      }
    } catch (error) {
      console.error("Failed to delete collection:", error);
      toast({
        title: "Error",
        description: "Failed to delete collection. It may reappear when you refresh.",
        variant: "destructive",
      });
    }
  };
  
  // Backup and restore functions
  const backupData = async () => {
    try {
      if (!isOnline) {
        toast({
          title: "Offline Mode",
          description: "Cannot create remote backup while offline. Local copy saved.",
        });
        return;
      }
      
      await backupApi.createBackup(cars, collections);
      
      // Create a downloadable backup file as well
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
      if (isOnline) {
        await backupApi.createBackup(cars, collections);
      }
      
      // Update both local and remote state
      setCars(initialCars);
      setCollections(initialCollections);
      setLocalCars(initialCars);
      setLocalCollections(initialCollections);
      
      // If online, also update the remote database
      if (isOnline) {
        // Simplified approach - in real app you might need a special API endpoint
        await Promise.all([
          ...initialCars.map(car => carsApi.update(car)),
          ...initialCollections.map(coll => collectionsApi.update(coll))
        ]);
      }
      
      clearCache(); // Clear the memory cache
      
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
      
      // Update both local and remote state
      setCars(mergedCars);
      setCollections(mergedCollections);
      setLocalCars(mergedCars);
      setLocalCollections(mergedCollections);
      
      // If online, also update the remote database
      if (isOnline) {
        await backupApi.importData({
          cars: mergedCars,
          collections: mergedCollections
        });
      }
      
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
  
  // Helper functions for car collections
  const getCarById = (id: string) => cars.find(car => car.id === id);
  const getCarsByCollectionId = (collectionId: string) => cars.filter(car => car.collectionId === collectionId);
  const getCollectionById = (id: string) => collections.find(collection => collection.id === id);
  
  // Reload data from remote source
  const refreshData = async () => {
    try {
      setIsLoading(true);
      clearCache(); // Clear the memory cache
      
      if (isOnline) {
        const [remoteCars, remoteCollections] = await Promise.all([
          carsApi.getAll(),
          collectionsApi.getAll()
        ]);
        
        setCars(remoteCars);
        setCollections(remoteCollections);
        setLocalCars(remoteCars);
        setLocalCollections(remoteCollections);
        
        toast({
          title: "Data Refreshed",
          description: "Your data has been refreshed from the server.",
        });
      } else {
        toast({
          title: "Offline Mode",
          description: "Cannot refresh data while offline.",
          variant: "destructive",
        });
      }
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
  
  return {
    // State
    cars,
    collections,
    isLoading,
    error,
    isOnline,
    
    // Car operations
    getCarById,
    getCarsByCollectionId,
    addCar,
    updateCar,
    deleteCar,
    
    // Collection operations
    getCollectionById,
    addCollection,
    updateCollection,
    deleteCollection,
    
    // Data management
    backupData,
    restoreInitialData,
    mergeImportedData,
    refreshData
  };
}


import { useState, useEffect } from "react";
import { 
  saveToStore,
  getAllFromStore,
  saveLastKnownGoodState,
  getLastKnownGoodState,
  isFirstRun,
  migrateFromLocalStorage
} from "@/utils/indexedDBUtils";

/**
 * A hook to manage state with IndexedDB persistence
 * @param storeName The IndexedDB store name
 * @param initialValue The initial value if nothing is in IndexedDB
 * @returns [state, setState] tuple similar to useState
 */
export function useIndexedDBState<T>(
  storeName: string, 
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize state with data from IndexedDB or initialValue
  const [state, setState] = useState<T>(() => {
    console.log(`Initializing ${storeName} from IndexedDB`);
    // We return initialValue first, then update it after async operations
    return Array.isArray(initialValue) ? [] as unknown as T : initialValue;
  });
  
  // Effect to load data from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        // Check if we need to migrate data from localStorage (first time using IndexedDB)
        const needsMigration = await isFirstRun();
        
        if (needsMigration) {
          console.log("First time using IndexedDB, migrating data from localStorage");
          await migrateFromLocalStorage();
        }
        
        // Try to get data from IndexedDB
        const items = await getAllFromStore<T>(storeName);
        
        if (isMounted) {
          if (items && (Array.isArray(items) ? items.length > 0 : !!items)) {
            console.log(`Found ${storeName} in IndexedDB:`, Array.isArray(items) ? 
              `${items.length} items` : 'value');
            
            if (Array.isArray(items)) {
              setState(items as unknown as T);
            } else if (items[0]) {
              setState(items[0] as unknown as T);
            }
            
            // Save as last known good state
            if (storeName === "cars" || storeName === "collections") {
              const otherStore = storeName === "cars" ? "collections" : "cars";
              const otherItems = await getAllFromStore(otherStore);
              
              if (storeName === "cars") {
                saveLastKnownGoodState(items as any[], otherItems);
              } else {
                saveLastKnownGoodState(otherItems, items as any[]);
              }
            }
            
            return;
          }
        }
        
        // If no data in IndexedDB, try to recover from last known good state
        const lastGoodState = await getLastKnownGoodState();
        if (lastGoodState && isMounted) {
          if (storeName === "cars" && lastGoodState.cars?.length > 0) {
            console.log(`Recovering ${storeName} from last known good state`);
            setState(lastGoodState.cars as unknown as T);
            return;
          } else if (storeName === "collections" && lastGoodState.collections?.length > 0) {
            console.log(`Recovering ${storeName} from last known good state`);
            setState(lastGoodState.collections as unknown as T);
            return;
          }
        }
        
        // If we get here, use initialValue for first installation
        if (isMounted) {
          console.log(`No valid data found for ${storeName}, using initial value`);
          setState(initialValue);
        }
      } catch (error) {
        console.error(`Error initializing ${storeName} from IndexedDB:`, error);
        
        if (isMounted) {
          // Fallback to initialValue
          console.log(`Error recovery: using initial data for ${storeName}`);
          setState(initialValue);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [storeName, initialValue]);
  
  // Save data to IndexedDB whenever it changes
  useEffect(() => {
    if (state === undefined || state === null) return;
    
    console.log(`Saving ${storeName} to IndexedDB`);
    
    const saveData = async () => {
      try {
        const success = await saveToStore(storeName, state);
        
        if (success) {
          console.log(`Successfully saved ${storeName} to IndexedDB:`,
            Array.isArray(state) ? `${(state as any[]).length} items` : 'value');
          
          // Update last known good state
          if (storeName === "cars" || storeName === "collections") {
            const otherStore = storeName === "cars" ? "collections" : "cars";
            const otherItems = await getAllFromStore(otherStore);
            
            if (storeName === "cars") {
              await saveLastKnownGoodState(state as any[], otherItems);
            } else {
              await saveLastKnownGoodState(otherItems, state as any[]);
            }
          }
        } else {
          console.error(`Failed to save ${storeName} to IndexedDB`);
        }
      } catch (error) {
        console.error(`Error saving ${storeName} to IndexedDB:`, error);
      }
    };
    
    saveData();
  }, [state, storeName]);
  
  return [state, setState];
}

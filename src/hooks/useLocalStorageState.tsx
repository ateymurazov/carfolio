
import { useState, useEffect } from "react";
import { saveToLocalStorage, getFromLocalStorage } from "@/utils/localStorageUtils";

/**
 * A hook to manage state with localStorage persistence
 * @param key The localStorage key
 * @param initialValue The initial value if nothing is in localStorage
 * @returns [state, setState] tuple similar to useState
 */
export function useLocalStorageState<T>(
  key: string, 
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize state with data from localStorage or initialValue
  const [state, setState] = useState<T>(() => {
    console.log(`Initializing ${key} from localStorage`);
    
    try {
      // Try to get value from localStorage first
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        const parsedValue = JSON.parse(storedValue);
        console.log(`Found ${key} in localStorage:`, Array.isArray(parsedValue) ? 
          `${parsedValue.length} items` : 'value');
        return parsedValue;
      }
    } catch (e) {
      console.error(`Failed to parse stored ${key}, using initial data`, e);
    }
    
    // If no existing data or parse failed, use initialValue
    console.log(`No existing ${key} found, using initial data`);
    return initialValue;
  });
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (state === undefined || state === null) return;
    
    // Skip storing very large objects that might exceed quota
    const isLikelyTooLarge = (data: any) => {
      try {
        const serialized = JSON.stringify(data);
        return serialized.length > 2000000; // ~2MB
      } catch (e) {
        return true; // If can't serialize, assume too large
      }
    };
    
    if (isLikelyTooLarge(state)) {
      console.warn(`Data for ${key} appears too large for localStorage, skipping save`);
      return;
    }
    
    console.log(`Saving ${key} to localStorage`);
    
    try {
      // Now save the new state
      const success = saveToLocalStorage(key, state);
      if (success) {
        console.log(`Successfully saved ${key} to localStorage:`,
          Array.isArray(state) ? `${state.length} items` : 'value');
      } else {
        console.error(`Failed to save ${key} to localStorage`);
      }
    } catch (error) {
      // If we hit quota, log it but don't crash the app
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [state, key]);
  
  return [state, setState];
}

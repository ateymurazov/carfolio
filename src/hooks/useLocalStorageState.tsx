
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
        try {
          const parsedValue = JSON.parse(storedValue);
          console.log(`Found ${key} in localStorage:`, Array.isArray(parsedValue) ? 
            `${parsedValue.length} items` : 'value');
          
          // Verify the parsed value has the expected structure
          if (parsedValue !== null && typeof parsedValue === typeof initialValue) {
            // Extra validation for arrays
            if (Array.isArray(initialValue) && Array.isArray(parsedValue)) {
              return parsedValue;
            }
            // Extra validation for objects
            else if (
              !Array.isArray(initialValue) && 
              typeof initialValue === 'object' && 
              typeof parsedValue === 'object'
            ) {
              return parsedValue;
            }
            // For primitive types
            else if (typeof initialValue !== 'object') {
              return parsedValue;
            }
          }
          // If validation fails, log it
          console.warn(`Found ${key} in localStorage but it failed validation, using initial data`);
        } catch (parseError) {
          console.error(`Failed to parse stored ${key}, using initial data`, parseError);
          
          // Store corrupted data for recovery attempts
          try {
            localStorage.setItem(`${key}_corrupted`, storedValue);
          } catch (e) {
            // Just log if backup fails
            console.error(`Failed to backup corrupted ${key} data`, e);
          }
        }
      }
    } catch (e) {
      console.error(`Error accessing ${key} from localStorage, using initial data`, e);
    }
    
    // If no existing data, parse failed, or validation failed, use initialValue
    console.log(`Using initial data for ${key}`);
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
      // Backup current data before overwriting
      const currentData = localStorage.getItem(key);
      if (currentData) {
        localStorage.setItem(`${key}_previous`, currentData);
      }
      
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

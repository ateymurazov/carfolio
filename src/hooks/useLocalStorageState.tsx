
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
      console.error(`Failed to parse stored ${key}, attempting recovery`, e);
      
      // Create a backup of the corrupted data for potential recovery
      try {
        const corruptedData = localStorage.getItem(key);
        if (corruptedData) {
          localStorage.setItem(`${key}_corrupted_backup`, corruptedData);
          console.log(`Created backup of corrupted ${key} data`);
        }
      } catch (backupErr) {
        console.error(`Failed to backup corrupted data for ${key}`, backupErr);
      }
      
      // Try to recover from versions or previous backups
      try {
        const versionsKey = `${key}_versions`;
        const versionsData = localStorage.getItem(versionsKey);
        
        if (versionsData) {
          const versions = JSON.parse(versionsData);
          if (versions && Array.isArray(versions) && versions.length > 0) {
            console.log(`Attempting recovery from ${key} version history`);
            const latestVersion = versions[versions.length - 1];
            if (latestVersion && latestVersion.data) {
              const recoveredData = JSON.parse(latestVersion.data);
              return recoveredData;
            }
          }
        }
        
        // Try previous backup
        const prevData = localStorage.getItem(`${key}_prev`);
        if (prevData) {
          console.log(`Recovering from ${key}_prev backup`);
          return JSON.parse(prevData);
        }
      } catch (recoveryErr) {
        console.error(`Recovery attempts for ${key} failed:`, recoveryErr);
      }
    }
    
    // First installation check - use initial data ONLY on fresh install
    const isFirstInstall = localStorage.length === 0;
    
    if (isFirstInstall) {
      console.log(`First-time app use detected. Initializing ${key} with demo data`);
      return initialValue;
    }
    
    // For existing users with data problems, default to empty but structured data
    // instead of potentially destructive demo data
    console.log(`Using empty fallback for ${key} (NOT using demo data)`);
    
    // Return empty data of same type instead of initialValue
    if (Array.isArray(initialValue)) {
      return [] as unknown as T;
    } else if (typeof initialValue === 'object' && initialValue !== null) {
      return {} as T;
    }
    
    // For primitives, return initialValue as safe fallback
    return initialValue;
  });
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (state === undefined || state === null) return;
    
    console.log(`Saving ${key} to localStorage`);
    
    // Create a version backup before saving new data
    try {
      const existingData = localStorage.getItem(key);
      if (existingData) {
        // Store the last 3 versions in a rotating buffer
        const versionsKey = `${key}_versions`;
        let versions = [];
        
        try {
          const storedVersions = localStorage.getItem(versionsKey);
          if (storedVersions) {
            versions = JSON.parse(storedVersions);
          }
        } catch (e) {
          console.error(`Failed to parse versions for ${key}`, e);
        }
        
        // Add timestamp to this version
        const versionWithMeta = {
          data: existingData,
          timestamp: new Date().toISOString()
        };
        
        // Add to versions array, keep only last 3 versions
        versions.push(versionWithMeta);
        if (versions.length > 3) {
          versions = versions.slice(-3);
        }
        
        // Save versions back to localStorage
        localStorage.setItem(versionsKey, JSON.stringify(versions));
      }
    } catch (e) {
      console.error(`Failed to create version backup for ${key}`, e);
    }
    
    // Now save the new state
    const success = saveToLocalStorage(key, state);
    if (success) {
      console.log(`Successfully saved ${key} to localStorage:`,
        Array.isArray(state) ? `${state.length} items` : 'value');
    } else {
      console.error(`Failed to save ${key} to localStorage`);
    }
  }, [state, key]);
  
  return [state, setState];
}

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
        
        // Save as last known good state if parsed successfully
        try {
          localStorage.setItem(`${key}_last_good`, storedValue);
        } catch (e) {
          console.error(`Failed to save last good state for ${key}`, e);
        }
        
        return parsedValue;
      }
    } catch (e) {
      console.error(`Failed to parse stored ${key}, attempting recovery`, e);
      
      // Try to recover from last known good state
      try {
        const lastGoodState = localStorage.getItem(`${key}_last_good`);
        if (lastGoodState) {
          console.log(`Recovering from last known good state for ${key}`);
          return JSON.parse(lastGoodState);
        }
      } catch (lastGoodError) {
        console.error(`Failed to recover from last good state for ${key}`, lastGoodError);
      }
      
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
      
      // Set as last known good state
      try {
        localStorage.setItem(`${key}_last_good`, JSON.stringify(initialValue));
      } catch (e) {
        console.error(`Failed to save initial value as last good state for ${key}`, e);
      }
      
      return initialValue;
    }
    
    console.log(`No valid data found for ${key}, showing empty state with recovery options`);
    
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
    
    // First, attempt to validate if state is good
    const isGoodState = validateState(state);
    
    if (isGoodState) {
      // Store as last known good state - prioritize this over versioning
      try {
        localStorage.setItem(`${key}_last_good`, JSON.stringify(state));
      } catch (e) {
        console.error(`Failed to save last good state for ${key}`, e);
      }
    }
    
    // Try to create version backup, but handle quota issues gracefully
    try {
      // First check if we have enough space for versioning
      // If we're running out of space, skip version history to ensure data saves
      const existingData = localStorage.getItem(key);
      if (existingData) {
        const storageUsage = getStorageUsage();
        // If storage is over 80% full, skip versioning to save space
        if (storageUsage < 0.8) {
          // Store just the last version to save space
          const versionsKey = `${key}_versions`;
          let versions = [];
          
          try {
            const storedVersions = localStorage.getItem(versionsKey);
            if (storedVersions) {
              versions = JSON.parse(storedVersions);
              // Keep only the most recent version to save space
              if (versions.length > 0) {
                versions = [versions[versions.length - 1]];
              }
            }
          } catch (e) {
            console.error(`Failed to parse versions for ${key}`, e);
            // Reset versions array if we can't parse it
            versions = [];
          }
          
          // Add timestamp to this version
          const versionWithMeta = {
            data: existingData,
            timestamp: new Date().toISOString()
          };
          
          // Add to versions array, keep only the most recent version
          versions = [versionWithMeta];
          
          // Try to save versions back to localStorage
          try {
            localStorage.setItem(versionsKey, JSON.stringify(versions));
          } catch (versionSaveError) {
            // If we can't save versions, log but continue
            console.warn(`Skipping version history for ${key} due to storage limits`);
          }
        } else {
          console.warn(`Storage usage high (${Math.round(storageUsage * 100)}%), skipping version history`);
          
          // Try to save just a quick backup
          try {
            localStorage.setItem(`${key}_prev`, existingData);
          } catch (quickBackupError) {
            console.warn(`Could not save quick backup for ${key}, storage may be full`);
          }
        }
      }
    } catch (e) {
      console.error(`Failed to create version backup for ${key}`, e);
      // Continue with the actual data save even if versioning fails
    }
    
    // Now save the new state - this is our top priority
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

/**
 * Validates if state is in a good condition
 * Currently just checks that it's not null/undefined and for arrays, that it's actually an array
 */
function validateState(state: any): boolean {
  if (state === null || state === undefined) {
    return false;
  }
  
  if (Array.isArray(state)) {
    return true;
  }
  
  if (typeof state === 'object') {
    return Object.keys(state).length > 0;
  }
  
  return true;
}

/**
 * Estimate the current localStorage usage as a percentage (0-1)
 */
function getStorageUsage(): number {
  try {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        totalSize += key.length + value.length;
      }
    }
    
    // Average browser localStorage limit is 5-10MB
    // We'll use a conservative 5MB estimate
    const estimatedLimit = 5 * 1024 * 1024; // 5MB in bytes
    return totalSize / estimatedLimit;
  } catch (e) {
    console.error('Error calculating storage usage:', e);
    // Return a moderate value that won't trigger extreme behavior
    return 0.5;
  }
}

/**
 * Utilities for safely working with localStorage
 */

/**
 * Type guard to check if value is eligible for JSON serialization
 */
function isSerializable(value: any): boolean {
  return value !== undefined && 
         value !== null && 
         typeof value !== 'function' && 
         typeof value !== 'symbol';
}

/**
 * Safely retrieves data from localStorage
 * @param key The localStorage key
 * @param fallback Default value if retrieval fails
 * @returns The parsed data or fallback value
 */
export function getFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    console.log(`Attempting to retrieve '${key}' from localStorage`);
    const item = localStorage.getItem(key);
    
    // Only use fallback if item is null/undefined, not if it's an empty array/object
    if (item === null || item === undefined) {
      console.log(`No data found for '${key}', using fallback`);
      return fallback;
    }
    
    const parsed = JSON.parse(item) as T;
    console.log(`Successfully retrieved data for '${key}'`);
    return parsed;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    
    // Try to recover from versions if available
    try {
      const versionsKey = `${key}_versions`;
      const versionsData = localStorage.getItem(versionsKey);
      
      if (versionsData) {
        const versions = JSON.parse(versionsData);
        if (versions && Array.isArray(versions) && versions.length > 0) {
          // Get the most recent version
          const latestVersion = versions[versions.length - 1];
          if (latestVersion && latestVersion.data) {
            console.log(`Recovered ${key} from version backup`);
            const recoveredData = JSON.parse(latestVersion.data);
            return recoveredData;
          }
        }
      }
    } catch (recoveryError) {
      console.error(`Recovery attempt for ${key} failed:`, recoveryError);
    }
    
    return fallback;
  }
}

/**
 * Safely saves data to localStorage
 * @param key The localStorage key
 * @param data The data to save
 * @returns boolean indicating success
 */
export function saveToLocalStorage<T>(key: string, data: T): boolean {
  try {
    // Don't save null or undefined values
    if (data === null || data === undefined) {
      console.warn(`Attempted to save null/undefined to ${key}, skipping`);
      return false;
    }

    // Use a temporary variable to ensure we can stringify before setting
    const serialized = JSON.stringify(data);
    
    // Create a quick backup of the previous value before overwriting
    try {
      const prevValue = localStorage.getItem(key);
      if (prevValue) {
        localStorage.setItem(`${key}_prev`, prevValue);
      }
    } catch (e) {
      // If we can't create a backup due to storage constraints, just log and continue
      console.error(`Failed to create quick backup for ${key}`, e);
      
      // Try to free up space by removing older backups if we hit quota issues
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, attempting to free up space');
        cleanupOldBackups();
      }
    }
    
    // Now try to save the actual data
    try {
      localStorage.setItem(key, serialized);
    } catch (saveError) {
      // If we hit quota issues when saving the main data, take more drastic measures
      if (saveError instanceof DOMException && saveError.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded when saving main data, attempting emergency cleanup');
        // Emergency cleanup - remove all version history, keep only essential data
        cleanupAllVersionHistory();
        
        // Try again after cleanup
        try {
          localStorage.setItem(key, serialized);
        } catch (retryError) {
          console.error(`Failed to save ${key} even after cleanup:`, retryError);
          return false;
        }
      } else {
        console.error(`Error saving ${key} to localStorage:`, saveError);
        return false;
      }
    }
    
    // Verify the data was stored correctly
    const verification = localStorage.getItem(key);
    if (!verification) {
      console.warn(`Storage verification failed for ${key}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    
    // Try to store with more aggressive error handling
    if (error instanceof TypeError && data && typeof data === 'object') {
      try {
        // Handle circular references by creating a safe copy
        const safeData = JSON.parse(JSON.stringify(data));
        localStorage.setItem(key, JSON.stringify(safeData));
        return true;
      } catch (fallbackError) {
        console.error(`Fallback storage attempt failed for ${key}:`, fallbackError);
      }
    }
    
    return false;
  }
}

/**
 * Attempts to free up space by removing non-essential backup data
 */
function cleanupOldBackups(): void {
  try {
    const keys = getLocalStorageKeys();
    
    // First remove all version history
    keys.forEach(key => {
      if (key.includes('_versions')) {
        localStorage.removeItem(key);
      }
    });
    
    // Then remove corrupted backups
    keys.forEach(key => {
      if (key.includes('_corrupted')) {
        localStorage.removeItem(key);
      }
    });
    
    // Keep only the most recent prev backup for each key
    const mainKeys = new Set<string>();
    keys.forEach(key => {
      if (key.includes('_prev')) {
        const mainKey = key.replace('_prev', '');
        mainKeys.add(mainKey);
      }
    });
    
    console.log('Cleaned up old backups to free space');
  } catch (e) {
    console.error('Error during backup cleanup:', e);
  }
}

/**
 * More aggressive cleanup for emergency situations
 * Removes all version history and keeps only essential data
 */
function cleanupAllVersionHistory(): void {
  try {
    const keys = getLocalStorageKeys();
    
    // Remove all backup and version data
    keys.forEach(key => {
      if (key.includes('_versions') || 
          key.includes('_prev') || 
          key.includes('_corrupted') ||
          key.includes('emergency_backup')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('Emergency cleanup: removed all version history and backups');
  } catch (e) {
    console.error('Error during emergency cleanup:', e);
  }
}

/**
 * Clears all stored data in localStorage
 */
export function clearLocalStorage(): void {
  try {
    // Create emergency backup of all data
    const emergencyBackup: Record<string, any> = {};
    const keys = getLocalStorageKeys();
    
    // Only backup actual data keys (not version or temporary keys)
    const dataKeys = keys.filter(k => 
      !k.includes('_versions') && 
      !k.includes('_prev') && 
      !k.includes('_backup') &&
      !k.includes('_corrupted')
    );
    
    // Collect all data
    dataKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          emergencyBackup[key] = data;
        }
      } catch (e) {
        console.error(`Failed to backup ${key}`, e);
      }
    });
    
    // Save emergency backup
    try {
      const backupKey = `emergency_backup_${new Date().toISOString()}`;
      localStorage.setItem(backupKey, JSON.stringify(emergencyBackup));
    } catch (e) {
      console.error('Failed to save emergency backup', e);
    }
    
    localStorage.clear();
    console.log('localStorage has been cleared');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Retrieves all keys stored in localStorage
 */
export function getLocalStorageKeys(): string[] {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  } catch (error) {
    console.error('Error getting localStorage keys:', error);
    return [];
  }
}

/**
 * Inspects the contents of localStorage and returns a summary
 */
export function inspectLocalStorage(): Record<string, any> {
  try {
    const contents: Record<string, any> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            contents[key] = JSON.parse(value);
          }
        } catch (e) {
          contents[key] = "[Error parsing value]";
        }
      }
    }
    
    return contents;
  } catch (error) {
    console.error('Error inspecting localStorage:', error);
    return {};
  }
}

/**
 * Attempts to restore data from an automatic backup
 * @param key The localStorage key to restore
 * @returns boolean indicating success
 */
export function restorePreviousVersion(key: string): boolean {
  try {
    // Check for a previous version
    const prevKey = `${key}_prev`;
    const prevValue = localStorage.getItem(prevKey);
    
    if (prevValue) {
      // Restore the previous value
      localStorage.setItem(key, prevValue);
      console.log(`Restored previous version of ${key}`);
      return true;
    }
    
    // If no direct previous version, try version history
    const versionsKey = `${key}_versions`;
    const versionsData = localStorage.getItem(versionsKey);
    
    if (versionsData) {
      const versions = JSON.parse(versionsData);
      if (versions && Array.isArray(versions) && versions.length > 0) {
        // Get the most recent version
        const latestVersion = versions[versions.length - 1];
        if (latestVersion && latestVersion.data) {
          localStorage.setItem(key, latestVersion.data);
          console.log(`Restored ${key} from version history`);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Error restoring ${key}:`, error);
    return false;
  }
}

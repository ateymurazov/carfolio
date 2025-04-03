
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
    localStorage.setItem(key, serialized);
    
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
 * Clears all stored data in localStorage
 */
export function clearLocalStorage(): void {
  try {
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

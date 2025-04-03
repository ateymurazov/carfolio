
/**
 * Utilities for safely working with localStorage
 */

/**
 * Safely retrieves data from localStorage
 * @param key The localStorage key
 * @param fallback Default value if retrieval fails
 * @returns The parsed data or fallback value
 */
export function getFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
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
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

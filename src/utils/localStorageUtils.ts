
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
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
}

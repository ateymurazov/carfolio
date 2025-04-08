
/**
 * Utilities for working with IndexedDB
 */

const DB_NAME = "carInventoryDB";
const DB_VERSION = 1;
const STORES = {
  CARS: "cars",
  COLLECTIONS: "collections",
  BACKUPS: "backups",
  META: "meta"
};

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Error opening IndexedDB");
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.CARS)) {
        db.createObjectStore(STORES.CARS, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(STORES.COLLECTIONS)) {
        db.createObjectStore(STORES.COLLECTIONS, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(STORES.BACKUPS)) {
        db.createObjectStore(STORES.BACKUPS, { keyPath: "timestamp" });
      }
      
      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META, { keyPath: "key" });
      }
    };
  });
};

// Save data to a specific store
export const saveToStore = async <T>(
  storeName: string, 
  data: T | T[]
): Promise<boolean> => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      
      transaction.oncomplete = () => {
        resolve(true);
      };
      
      transaction.onerror = (event) => {
        console.error(`Error saving to ${storeName}:`, event);
        resolve(false);
      };
      
      // Handle array of items or single item
      if (Array.isArray(data)) {
        // Clear existing data
        store.clear();
        
        // Add each item
        data.forEach((item) => {
          store.add(item);
        });
      } else {
        store.put(data);
      }
    });
  } catch (error) {
    console.error(`Failed to save to ${storeName}:`, error);
    return false;
  }
};

// Get all items from a store
export const getAllFromStore = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result as T[]);
      };
      
      request.onerror = (event) => {
        console.error(`Error getting data from ${storeName}:`, event);
        reject([]);
      };
    });
  } catch (error) {
    console.error(`Failed to get data from ${storeName}:`, error);
    return [];
  }
};

// Save backup
export const saveBackup = async (cars: any[], collections: any[]): Promise<boolean> => {
  try {
    const backup = {
      timestamp: Date.now(),
      cars,
      collections,
      date: new Date().toISOString()
    };
    
    return saveToStore(STORES.BACKUPS, backup);
  } catch (error) {
    console.error("Failed to save backup:", error);
    return false;
  }
};

// Get latest backup
export const getLatestBackup = async (): Promise<{ cars: any[], collections: any[] } | null> => {
  try {
    const backups = await getAllFromStore<any>(STORES.BACKUPS);
    if (backups.length === 0) return null;
    
    // Sort by timestamp descending and return the most recent
    backups.sort((a, b) => b.timestamp - a.timestamp);
    return backups[0];
  } catch (error) {
    console.error("Failed to get latest backup:", error);
    return null;
  }
};

// Save last known good state
export const saveLastKnownGoodState = async (cars: any[], collections: any[]): Promise<boolean> => {
  try {
    const lastGoodState = {
      key: "lastGoodState",
      cars,
      collections,
      timestamp: Date.now()
    };
    
    return saveToStore(STORES.META, lastGoodState);
  } catch (error) {
    console.error("Failed to save last known good state:", error);
    return false;
  }
};

// Get last known good state
export const getLastKnownGoodState = async (): Promise<{ cars: any[], collections: any[] } | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.META, "readonly");
      const store = transaction.objectStore(STORES.META);
      const request = store.get("lastGoodState");
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        reject(null);
      };
    });
  } catch (error) {
    console.error("Failed to get last known good state:", error);
    return null;
  }
};

// Check if this is the first time running the app
export const isFirstRun = async (): Promise<boolean> => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORES.META, "readonly");
      const store = transaction.objectStore(STORES.META);
      const request = store.get("firstRun");
      
      request.onsuccess = () => {
        if (!request.result) {
          // Set first run to false for future checks
          const writeTransaction = db.transaction(STORES.META, "readwrite");
          const writeStore = writeTransaction.objectStore(STORES.META);
          writeStore.put({ key: "firstRun", value: false });
          
          resolve(true);
        } else {
          resolve(false);
        }
      };
      
      request.onerror = () => {
        // Assume it's the first run if we can't determine
        resolve(true);
      };
    });
  } catch (error) {
    console.error("Failed to check if first run:", error);
    return true;
  }
};

// Clear all data
export const clearAllData = async (): Promise<boolean> => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(
        [STORES.CARS, STORES.COLLECTIONS], 
        "readwrite"
      );
      
      transaction.oncomplete = () => {
        resolve(true);
      };
      
      transaction.onerror = () => {
        resolve(false);
      };
      
      transaction.objectStore(STORES.CARS).clear();
      transaction.objectStore(STORES.COLLECTIONS).clear();
    });
  } catch (error) {
    console.error("Failed to clear all data:", error);
    return false;
  }
};

/**
 * Migrates data from localStorage to IndexedDB
 * Used one time when switching from localStorage to IndexedDB
 */
export const migrateFromLocalStorage = async (): Promise<boolean> => {
  try {
    console.log("Attempting to migrate data from localStorage to IndexedDB");
    
    // Try to get data from localStorage
    let carsData = [];
    let collectionsData = [];
    
    try {
      const carsJson = localStorage.getItem("cars");
      if (carsJson) {
        carsData = JSON.parse(carsJson);
        console.log(`Found ${carsData.length} cars in localStorage`);
      }
      
      const collectionsJson = localStorage.getItem("collections");
      if (collectionsJson) {
        collectionsData = JSON.parse(collectionsJson);
        console.log(`Found ${collectionsData.length} collections in localStorage`);
      }
    } catch (e) {
      console.error("Error parsing localStorage data:", e);
      
      // Try to recover from backup in localStorage
      try {
        const carsPrev = localStorage.getItem("cars_prev");
        if (carsPrev) {
          carsData = JSON.parse(carsPrev);
          console.log(`Recovered ${carsData.length} cars from backup`);
        }
        
        const collectionsPrev = localStorage.getItem("collections_prev");
        if (collectionsPrev) {
          collectionsData = JSON.parse(collectionsPrev);
          console.log(`Recovered ${collectionsData.length} collections from backup`);
        }
      } catch (backupError) {
        console.error("Failed to recover from localStorage backup:", backupError);
      }
    }
    
    // Save data to IndexedDB
    if (carsData.length > 0) {
      await saveToStore(STORES.CARS, carsData);
    }
    
    if (collectionsData.length > 0) {
      await saveToStore(STORES.COLLECTIONS, collectionsData);
    }
    
    // If we have both cars and collections, create a backup
    if (carsData.length > 0 && collectionsData.length > 0) {
      await saveBackup(carsData, collectionsData);
      await saveLastKnownGoodState(carsData, collectionsData);
    }
    
    console.log("Migration from localStorage to IndexedDB complete");
    return true;
  } catch (error) {
    console.error("Migration from localStorage to IndexedDB failed:", error);
    return false;
  }
};

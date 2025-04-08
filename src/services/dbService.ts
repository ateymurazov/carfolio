
/**
 * Database Service
 * 
 * This service provides a centralized interface for all database operations,
 * allowing us to easily swap out the underlying implementation if needed.
 */

import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { toast } from "@/components/ui/use-toast";

// A simple in-memory cache to optimize performance
const memoryCache = {
  cars: null as Car[] | null,
  collections: null as Collection[] | null,
  lastFetch: {
    cars: 0,
    collections: 0
  }
};

// Configuration for database requests
const API_URL = "https://car-inventory-db.herokuapp.com/api"; // Replace with your actual API endpoint
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Fetch wrapper with error handling
 */
async function fetchWithErrorHandling(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Fetch error:`, error);
    throw error;
  }
}

/**
 * Cars API Methods
 */
export const carsApi = {
  getAll: async (): Promise<Car[]> => {
    // Check cache first
    const now = Date.now();
    if (
      memoryCache.cars &&
      now - memoryCache.lastFetch.cars < CACHE_TTL
    ) {
      return memoryCache.cars;
    }
    
    try {
      const cars = await fetchWithErrorHandling(`${API_URL}/cars`);
      memoryCache.cars = cars;
      memoryCache.lastFetch.cars = now;
      return cars;
    } catch (error) {
      console.error("Failed to fetch cars:", error);
      // Fallback to cached data if available
      if (memoryCache.cars) {
        toast({
          title: "Network Error",
          description: "Using cached car data. Some information may be outdated.",
          variant: "destructive",
        });
        return memoryCache.cars;
      }
      throw error;
    }
  },
  
  getById: async (id: string): Promise<Car> => {
    // Check cache first
    if (memoryCache.cars) {
      const cachedCar = memoryCache.cars.find(car => car.id === id);
      if (cachedCar) return cachedCar;
    }
    
    return fetchWithErrorHandling(`${API_URL}/cars/${id}`);
  },
  
  create: async (car: Car): Promise<Car> => {
    const result = await fetchWithErrorHandling(`${API_URL}/cars`, {
      method: 'POST',
      body: JSON.stringify(car)
    });
    
    // Update cache
    if (memoryCache.cars) {
      memoryCache.cars.push(result);
    }
    
    return result;
  },
  
  update: async (car: Car): Promise<Car> => {
    const result = await fetchWithErrorHandling(`${API_URL}/cars/${car.id}`, {
      method: 'PUT',
      body: JSON.stringify(car)
    });
    
    // Update cache
    if (memoryCache.cars) {
      const index = memoryCache.cars.findIndex(c => c.id === car.id);
      if (index !== -1) {
        memoryCache.cars[index] = result;
      }
    }
    
    return result;
  },
  
  delete: async (id: string): Promise<void> => {
    await fetchWithErrorHandling(`${API_URL}/cars/${id}`, {
      method: 'DELETE'
    });
    
    // Update cache
    if (memoryCache.cars) {
      memoryCache.cars = memoryCache.cars.filter(car => car.id !== id);
    }
  },
  
  getByCollectionId: async (collectionId: string): Promise<Car[]> => {
    // Check cache first
    if (memoryCache.cars) {
      return memoryCache.cars.filter(car => car.collectionId === collectionId);
    }
    
    return fetchWithErrorHandling(`${API_URL}/collections/${collectionId}/cars`);
  }
};

/**
 * Collections API Methods
 */
export const collectionsApi = {
  getAll: async (): Promise<Collection[]> => {
    // Check cache first
    const now = Date.now();
    if (
      memoryCache.collections &&
      now - memoryCache.lastFetch.collections < CACHE_TTL
    ) {
      return memoryCache.collections;
    }
    
    try {
      const collections = await fetchWithErrorHandling(`${API_URL}/collections`);
      memoryCache.collections = collections;
      memoryCache.lastFetch.collections = now;
      return collections;
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      // Fallback to cached data if available
      if (memoryCache.collections) {
        toast({
          title: "Network Error",
          description: "Using cached collection data. Some information may be outdated.",
          variant: "destructive",
        });
        return memoryCache.collections;
      }
      throw error;
    }
  },
  
  getById: async (id: string): Promise<Collection> => {
    // Check cache first
    if (memoryCache.collections) {
      const cachedCollection = memoryCache.collections.find(collection => collection.id === id);
      if (cachedCollection) return cachedCollection;
    }
    
    return fetchWithErrorHandling(`${API_URL}/collections/${id}`);
  },
  
  create: async (collection: Collection): Promise<Collection> => {
    const result = await fetchWithErrorHandling(`${API_URL}/collections`, {
      method: 'POST',
      body: JSON.stringify(collection)
    });
    
    // Update cache
    if (memoryCache.collections) {
      memoryCache.collections.push(result);
    }
    
    return result;
  },
  
  update: async (collection: Collection): Promise<Collection> => {
    const result = await fetchWithErrorHandling(`${API_URL}/collections/${collection.id}`, {
      method: 'PUT',
      body: JSON.stringify(collection)
    });
    
    // Update cache
    if (memoryCache.collections) {
      const index = memoryCache.collections.findIndex(c => c.id === collection.id);
      if (index !== -1) {
        memoryCache.collections[index] = result;
      }
    }
    
    return result;
  },
  
  delete: async (id: string): Promise<void> => {
    await fetchWithErrorHandling(`${API_URL}/collections/${id}`, {
      method: 'DELETE'
    });
    
    // Update cache
    if (memoryCache.collections) {
      memoryCache.collections = memoryCache.collections.filter(collection => collection.id !== id);
    }
  }
};

/**
 * Backup and Recovery Methods
 */
export const backupApi = {
  createBackup: async (cars: Car[], collections: Collection[]): Promise<{ id: string; timestamp: string }> => {
    return fetchWithErrorHandling(`${API_URL}/backups`, {
      method: 'POST',
      body: JSON.stringify({ cars, collections })
    });
  },
  
  getBackups: async (): Promise<{ id: string; timestamp: string }[]> => {
    return fetchWithErrorHandling(`${API_URL}/backups`);
  },
  
  restoreBackup: async (backupId: string): Promise<{ cars: Car[]; collections: Collection[] }> => {
    return fetchWithErrorHandling(`${API_URL}/backups/${backupId}/restore`, {
      method: 'POST'
    });
  },
  
  // Export and import functions
  exportData: async (): Promise<Blob> => {
    const response = await fetch(`${API_URL}/export`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return response.blob();
  },
  
  importData: async (data: any): Promise<void> => {
    await fetchWithErrorHandling(`${API_URL}/import`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    // Clear cache to force reload
    memoryCache.cars = null;
    memoryCache.collections = null;
  }
};

// Clear cache function for when we need to force a refresh
export const clearCache = () => {
  memoryCache.cars = null;
  memoryCache.collections = null;
  memoryCache.lastFetch.cars = 0;
  memoryCache.lastFetch.collections = 0;
};

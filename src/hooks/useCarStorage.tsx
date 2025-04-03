import { useState, useEffect } from "react";
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { getFromLocalStorage, saveToLocalStorage } from "@/utils/localStorageUtils";

// Initial mock data moved to this file to avoid cluttering main hook
const initialCollections: Collection[] = [
  {
    id: "c1",
    name: "Classic Cars",
    description: "Collection of classic and vintage automobiles",
    clientName: "John Smith",
    created: "2023-01-15",
  },
  {
    id: "c2",
    name: "Sports Cars",
    description: "High-performance sports cars",
    clientName: "Alex Johnson",
    created: "2023-02-20",
  },
  {
    id: "c3",
    name: "Luxury Vehicles",
    description: "Premium luxury automobiles",
    clientName: "Robert Williams",
    created: "2023-03-10",
  },
];

const initialCars: Car[] = [
  {
    id: "car1",
    make: "Ford",
    model: "Mustang",
    year: "1967",
    vin: "7R01C179684",
    exteriorColor: "Candy Apple Red",
    interiorColor: "Black",
    transmission: "Manual",
    condition: "Excellent",
    mileage: 78000,
    notes: "Fully restored classic Mustang with original parts.",
    collectionId: "c1",
    images: [
      "https://images.unsplash.com/photo-1593808737766-d49c17c342c6?q=80&w=1000",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000",
    ],
    status: "Available",
    acquisitionDate: "2022-06-15",
    lastServiceDate: "2023-08-20",
    value: 120000,
  },
  {
    id: "car2",
    make: "Chevrolet",
    model: "Corvette",
    year: "1963",
    vin: "30837S109853",
    exteriorColor: "Blue",
    interiorColor: "White",
    transmission: "Manual",
    condition: "Good",
    mileage: 92000,
    notes: "Split window Corvette Stingray, requires minor restoration.",
    collectionId: "c1",
    images: [
      "https://images.unsplash.com/photo-1549460194-2f4d1add9d31?q=80&w=1000",
      "/placeholder.svg",
    ],
    status: "In Service",
    acquisitionDate: "2021-11-03",
    lastServiceDate: "2023-09-15",
  },
  {
    id: "car3",
    make: "Porsche",
    model: "911 GT3",
    year: "2021",
    vin: "WP0AC2A92MS411732",
    exteriorColor: "Racing Yellow",
    interiorColor: "Black",
    transmission: "PDK",
    condition: "New",
    mileage: 1200,
    notes: "Track-focused sports car with naturally aspirated flat-six engine.",
    collectionId: "c2",
    images: [
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1000",
      "https://images.unsplash.com/photo-1580274437636-1c384e617543?q=80&w=1000",
    ],
    status: "Available",
    acquisitionDate: "2023-01-20",
    lastServiceDate: "2023-10-05",
  },
  {
    id: "car4",
    make: "Ferrari",
    model: "F8 Tributo",
    year: "2020",
    vin: "ZFF92LMX000245332",
    exteriorColor: "Rosso Corsa",
    interiorColor: "Nero",
    transmission: "Automatic",
    condition: "Excellent",
    mileage: 3500,
    notes: "Twin-turbocharged V8 supercar with incredible performance.",
    collectionId: "c2",
    images: [
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000",
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1000",
    ],
    status: "Available",
    acquisitionDate: "2022-09-12",
    lastServiceDate: "2023-07-30",
  },
  {
    id: "car5",
    make: "Rolls-Royce",
    model: "Ghost",
    year: "2022",
    vin: "SCA664L02NCU00123",
    exteriorColor: "Arctic White",
    interiorColor: "Seashell",
    transmission: "Automatic",
    condition: "New",
    mileage: 900,
    notes: "Ultra-luxury sedan with twin-turbo V12 engine.",
    collectionId: "c3",
    images: [
      "https://images.unsplash.com/photo-1563720223523-491ff04651de?q=80&w=1000",
      "https://images.unsplash.com/photo-1555626906-fcf10d6851b4?q=80&w=1000",
    ],
    status: "Available",
    acquisitionDate: "2023-02-28",
  },
  {
    id: "car6",
    make: "Bentley",
    model: "Continental GT",
    year: "2021",
    vin: "SCBDE23W36C678901",
    exteriorColor: "Midnight Emerald",
    interiorColor: "Linen",
    transmission: "Automatic",
    condition: "Excellent",
    mileage: 4800,
    notes: "Grand touring coupe with W12 engine and luxurious interior.",
    collectionId: "c3",
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
    ],
    status: "Available",
    acquisitionDate: "2022-05-10",
    lastServiceDate: "2023-06-18",
  },
];

export type CarStorageState = {
  cars: Car[];
  collections: Collection[];
};

/**
 * Hook to manage car and collection data persistence
 */
export function useCarStorage(): CarStorageState & {
  updateCars: (cars: Car[]) => void;
  updateCollections: (collections: Collection[]) => void;
} {
  // Use a version key to detect fresh installs or updates
  const STORAGE_VERSION = "car-app-v1";
  
  // Initialize state with data from localStorage or initial data
  const [cars, setCars] = useState<Car[]>(() => {
    console.log("Initializing cars from localStorage");
    // Check for existing car data first
    try {
      const existingCars = localStorage.getItem('cars');
      if (existingCars) {
        const parsedCars = JSON.parse(existingCars);
        console.log(`Found ${parsedCars.length} cars in localStorage`);
        return parsedCars;
      }
    } catch (e) {
      console.error("Failed to parse stored cars, using initial data", e);
    }
    
    // If no existing data or parse failed, use initial data
    console.log("No existing cars found, using initial data");
    return initialCars;
  });
  
  const [collections, setCollections] = useState<Collection[]>(() => {
    console.log("Initializing collections from localStorage");
    // Check for existing collections data first
    try {
      const existingCollections = localStorage.getItem('collections');
      if (existingCollections) {
        const parsedCollections = JSON.parse(existingCollections);
        console.log(`Found ${parsedCollections.length} collections in localStorage`);
        return parsedCollections;
      }
    } catch (e) {
      console.error("Failed to parse stored collections, using initial data", e);
    }
    
    // If no existing data or parse failed, use initial data
    console.log("No existing collections found, using initial data");
    return initialCollections;
  });
  
  // Save cars to localStorage whenever they change
  useEffect(() => {
    if (!cars) return; // Don't save if cars is null/undefined
    
    console.log(`Saving ${cars.length} cars to localStorage`);
    const success = saveToLocalStorage('cars', cars);
    if (success) {
      console.log(`Successfully saved ${cars.length} cars to localStorage`);
    } else {
      console.error("Failed to save cars to localStorage");
    }
  }, [cars]);
  
  // Save collections to localStorage whenever they change
  useEffect(() => {
    if (!collections) return; // Don't save if collections is null/undefined
    
    console.log(`Saving ${collections.length} collections to localStorage`);
    const success = saveToLocalStorage('collections', collections);
    if (success) {
      console.log(`Successfully saved ${collections.length} collections to localStorage`);
    } else {
      console.error("Failed to save collections to localStorage");
    }
  }, [collections]);
  
  return {
    cars,
    collections,
    updateCars: setCars,
    updateCollections: setCollections
  };
}

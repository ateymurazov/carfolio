import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";

// Sample mock data
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
      "https://images.unsplash.com/photo-1567784177951-6fa58317e16b?q=80&w=1000",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000",
    ],
    status: "Available",
    acquisitionDate: "2022-06-15",
    lastServiceDate: "2023-08-20",
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
      "https://images.unsplash.com/photo-1596730063938-6eb92b8df895?q=80&w=1000",
      "https://images.unsplash.com/photo-1597007030739-6d2e7172bed5?q=80&w=1000",
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
      "https://images.unsplash.com/photo-1622653959098-a撇",
      "https://images.unsplash.com/photo-1622653959098-a0d5654a2a76?q=80&w=1000",
    ],
    status: "Available",
    acquisitionDate: "2022-05-10",
    lastServiceDate: "2023-06-18",
  },
];

interface CarCollectionsContextType {
  cars: Car[];
  collections: Collection[];
  getCarById: (id: string) => Car | undefined;
  getCollectionById: (id: string) => Collection | undefined;
  getCarsByCollectionId: (collectionId: string) => Car[];
  addCar: (car: Car) => void;
  updateCar: (id: string, car: Car) => void;
  deleteCar: (id: string) => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, collection: Collection) => void;
  deleteCollection: (id: string) => void;
}

const CarCollectionsContext = createContext<CarCollectionsContextType | undefined>(undefined);

export const CarCollectionsProvider = ({ children }: { children: ReactNode }) => {
  const [cars, setCars] = useState<Car[]>(() => {
    const savedCars = localStorage.getItem('cars');
    return savedCars ? JSON.parse(savedCars) : initialCars;
  });
  
  const [collections, setCollections] = useState<Collection[]>(() => {
    const savedCollections = localStorage.getItem('collections');
    return savedCollections ? JSON.parse(savedCollections) : initialCollections;
  });
  
  useEffect(() => {
    localStorage.setItem('cars', JSON.stringify(cars));
  }, [cars]);
  
  useEffect(() => {
    localStorage.setItem('collections', JSON.stringify(collections));
  }, [collections]);
  
  const getCarById = (id: string) => {
    return cars.find(car => car.id === id);
  };
  
  const getCollectionById = (id: string) => {
    return collections.find(collection => collection.id === id);
  };
  
  const getCarsByCollectionId = (collectionId: string) => {
    return cars.filter(car => car.collectionId === collectionId);
  };
  
  const addCar = (car: Car) => {
    setCars(prev => [...prev, car]);
  };
  
  const updateCar = (id: string, car: Car) => {
    setCars(prev => prev.map(c => c.id === id ? car : c));
  };
  
  const deleteCar = (id: string) => {
    setCars(prev => prev.filter(car => car.id !== id));
  };
  
  const addCollection = (collection: Collection) => {
    setCollections(prev => [...prev, collection]);
  };
  
  const updateCollection = (id: string, collection: Collection) => {
    setCollections(prev => prev.map(c => c.id === id ? collection : c));
  };
  
  const deleteCollection = (id: string) => {
    setCollections(prev => prev.filter(collection => collection.id !== id));
  };
  
  return (
    <CarCollectionsContext.Provider value={{
      cars,
      collections,
      getCarById,
      getCollectionById,
      getCarsByCollectionId,
      addCar,
      updateCar,
      deleteCar,
      addCollection,
      updateCollection,
      deleteCollection
    }}>
      {children}
    </CarCollectionsContext.Provider>
  );
};

export const useCarCollections = () => {
  const context = useContext(CarCollectionsContext);
  if (context === undefined) {
    throw new Error('useCarCollections must be used within a CarCollectionsProvider');
  }
  return context;
};

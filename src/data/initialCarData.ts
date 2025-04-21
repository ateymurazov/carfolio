import { Car } from "@/types/car";
import { Collection } from "@/types/collection";

// Initial mock collections data
export const initialCollections: Collection[] = [
  {
    id: "c1",
    name: "European Exotics",
    description: "Premium European sports cars and supercars",
    clientName: "Alexander Wright",
    created: "2023-06-10",
  },
  {
    id: "c2",
    name: "Ultimate Hypercars",
    description: "Cutting-edge performance and engineering marvels",
    clientName: "Victoria Chen",
    created: "2023-09-15",
  },
  {
    id: "c3",
    name: "Luxury Grand Touring",
    description: "Opulent luxury vehicles for refined travel",
    clientName: "Jonathan Bennett",
    created: "2024-01-20",
  }
];

// Initial mock cars data
export const initialCars: Car[] = [
  {
    id: "car1",
    make: "Porsche",
    model: "911 GT3 RS",
    year: "2023",
    vin: "WP0AF2A97PS218402",
    exteriorColor: "GT Silver Metallic",
    interiorColor: "Black/Weissach Red",
    transmission: "7-Speed PDK",
    condition: "New",
    mileage: 248,
    notes: "Weissach Package, lightweight carbon fiber components, Michelin Pilot Sport Cup 2 R tires, 518 horsepower naturally aspirated engine.",
    collectionId: "c2",
    images: [
      "/lovable-uploads/9f0752ca-2169-4395-8c20-3c8141a873a0.png",
      "/lovable-uploads/80178203-11b3-472e-bff9-b0fad0f7924f.png",
      "/lovable-uploads/baeb68de-6685-4ba5-aafb-a30c7d7b2368.png"
    ],
    status: "Available",
    acquisitionDate: "2024-03-15",
    lastServiceDate: "2024-04-01",
    value: 368000,
  },
  {
    id: "car2",
    make: "BMW",
    model: "M5 E34",
    year: "1995",
    vin: "WBSHD91050GD68287",
    exteriorColor: "Silver",
    interiorColor: "Black",
    transmission: "6-Speed Manual",
    condition: "Excellent",
    mileage: 78500,
    notes: "Rare E34 M5, full service history, completely original, BBS wheels.",
    collectionId: "c1",
    images: [
      "/lovable-uploads/af02a3a8-4826-479d-9f17-b19a0f5cd73b.png"
    ],
    status: "Available",
    acquisitionDate: "2023-12-15",
    lastServiceDate: "2024-03-10",
    value: 85000,
  },
  {
    id: "car3",
    make: "Bentley",
    model: "Continental GT Speed",
    year: "2023",
    vin: "SCBCC33A9PC088212",
    exteriorColor: "Onyx Black",
    interiorColor: "Beluga/Cognac",
    transmission: "8-Speed Dual-Clutch",
    condition: "New",
    mileage: 125,
    notes: "First Edition, Naim audio, rotating display, carbon ceramic brakes.",
    collectionId: "c3",
    images: [
      "/lovable-uploads/9c9541e8-52dc-43e3-939c-3777f8b695df.png",
      "/lovable-uploads/0109b8d7-f001-419d-8b87-45a9bf0fc11f.png",
      "/lovable-uploads/1fc6d13b-5d6d-430c-bc60-2ab4f41bccf4.png"
    ],
    status: "Available",
    acquisitionDate: "2024-02-28",
    lastServiceDate: "2024-03-01",
    value: 310000,
  },
  {
    id: "car4",
    make: "BMW",
    model: "M3 GTR",
    year: "2001",
    vin: "WBSBL93481JR104661",
    exteriorColor: "BMW Motorsport Livery",
    interiorColor: "Race spec",
    transmission: "6-Speed Sequential",
    condition: "Excellent",
    mileage: 12450,
    notes: "Authentic BMW Motorsport GTR, full racing history, extremely rare.",
    collectionId: "c2",
    images: [
      "/lovable-uploads/1a104497-ec7a-4891-8625-0dc41bad6a27.png",
      "/lovable-uploads/de086db3-13d1-4f38-9f25-2a608cf98928.png"
    ],
    status: "Museum Display",
    acquisitionDate: "2023-08-22",
    lastServiceDate: "2024-01-15",
    value: 1200000,
  },
  {
    id: "car5",
    make: "BMW",
    model: "M5",
    year: "1991",
    vin: "WBSHD9319MBK05766",
    exteriorColor: "Brilliant Red",
    interiorColor: "Black",
    transmission: "5-Speed Manual",
    condition: "Excellent",
    mileage: 89750,
    notes: "Rare color combination, all original, comprehensive service history.",
    collectionId: "c1",
    images: [
      "/lovable-uploads/74081f62-bbdc-4e4f-825a-ac4169ae640f.png"
    ],
    status: "Available",
    acquisitionDate: "2023-11-10",
    lastServiceDate: "2024-03-05",
    value: 95000,
  }
];

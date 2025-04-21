
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
    make: "BMW",
    model: "M5",
    year: "1995",
    vin: "WP0AF2A97PS218402",
    exteriorColor: "Silver",
    interiorColor: "Red",
    transmission: "6-Speed Manual",
    condition: "Excellent",
    mileage: 78500,
    notes: "Pristine E34 M5, fully restored, custom wheels, sport suspension.",
    collectionId: "c1",
    images: [
      "/lovable-uploads/d1f4df94-c3f5-4de4-918e-dbbe70a793a5.png",
      "/lovable-uploads/32a84c80-01b7-4afa-a060-e2cba55b7d2c.png",
      "/lovable-uploads/de086db3-13d1-4f38-9f25-2a608cf98928.png"
    ],
    status: "Available",
    acquisitionDate: "2024-03-15",
    lastServiceDate: "2024-04-01",
    value: 85000,
  },
  {
    id: "car2",
    make: "Bentley",
    model: "Continental GT",
    year: "2023",
    vin: "WBSHD91050GD68287",
    exteriorColor: "Beluga Black",
    interiorColor: "Linen",
    transmission: "8-Speed Automatic",
    condition: "New",
    mileage: 1250,
    notes: "Speed model with all options, Naim audio, carbon ceramics.",
    collectionId: "c2",
    images: [
      "/lovable-uploads/92cfa8a7-69b5-4107-928b-1bed42174b83.png",
      "/lovable-uploads/1a104497-ec7a-4891-8625-0dc41bad6a27.png"
    ],
    status: "Available",
    acquisitionDate: "2023-12-15",
    lastServiceDate: "2024-03-10",
    value: 285000,
  },
  {
    id: "car3",
    make: "Bentley",
    model: "Continental GTC",
    year: "2024",
    vin: "SCBCC33A9PC088212",
    exteriorColor: "Granite Grey",
    interiorColor: "Cognac",
    transmission: "8-Speed Automatic",
    condition: "New",
    mileage: 125,
    notes: "First Edition, Naim audio, rotating display, carbon ceramic brakes.",
    collectionId: "c3",
    images: [
      "/lovable-uploads/73730fa0-9001-4286-82e9-b2d5d966bf53.png",
      "/lovable-uploads/31d4a65b-9d62-4562-b575-3182b0a90204.png",
      "/lovable-uploads/80178203-11b3-472e-bff9-b0fad0f7924f.png" 
    ],
    status: "Available",
    acquisitionDate: "2024-02-28",
    lastServiceDate: "2024-03-01",
    value: 310000,
  },
  {
    id: "car4",
    make: "Bentley",
    model: "Continental GTC",
    year: "2024",
    vin: "WBSBL93481JR104661",
    exteriorColor: "Midnight Blue",
    interiorColor: "Magnolia",
    transmission: "8-Speed Automatic",
    condition: "New",
    mileage: 250,
    notes: "Mulliner package, 22-inch wheels, diamond quilting, contrast stitching.",
    collectionId: "c2",
    images: [
      "/lovable-uploads/314c55e5-5620-4244-abdc-db39bf433ccd.png",
      "/lovable-uploads/1aca1821-85cb-4cfb-8f4d-a33a8d5ab303.png",
      "/lovable-uploads/42f5f5ce-117e-4a6f-a8fc-775710a0200d.png"
    ],
    status: "Available",
    acquisitionDate: "2024-01-15",
    lastServiceDate: "2024-03-15",
    value: 325000,
  }
];

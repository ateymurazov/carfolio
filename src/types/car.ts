
export interface Car {
  id: string;
  make: string;
  model: string;
  year: string;
  vin: string;
  exteriorColor: string;
  interiorColor: string;
  transmission: string;
  condition: string;
  mileage: number;
  notes: string;
  collectionId: string;
  images?: string[];
  status: string;
  acquisitionDate: string;
  lastServiceDate?: string;
}

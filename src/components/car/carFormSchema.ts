
import { z } from "zod";

export const carFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().regex(/^\d{4}$/, "Year must be a 4-digit number"),
  vin: z.string().min(1, "VIN is required"),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  transmission: z.string().optional(),
  condition: z.string().optional(),
  mileage: z.coerce.number().nonnegative("Mileage must be a positive number"),
  notes: z.string().optional(),
  collectionId: z.string().min(1, "Collection is required"),
  registration: z.string().optional(),
  licensePlate: z.string().optional(),
  numberOfKeys: z.coerce.number().nonnegative().optional(),
  owner: z.string().optional(),
  status: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export type CarFormValues = z.infer<typeof carFormSchema>;

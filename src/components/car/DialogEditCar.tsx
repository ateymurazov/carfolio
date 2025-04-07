
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useCarCollections } from "@/hooks/useCarCollections";
import { Car } from "@/types/car";
import { carFormSchema } from "./carFormSchema";
import { AdditionalInfoFields } from "./AdditionalInfoFields";
import { ImageUploadField } from "./ImageUploadField";
import { DocumentUploadField } from "./DocumentUploadField";
import { BasicInfoFields, IdentificationFields, ColorFields, DetailsFields, MiscFields } from "./CarFormFields";

type FormValues = z.infer<typeof carFormSchema>;

interface DialogEditCarProps {
  car: Car;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DialogEditCar = ({ 
  car, 
  open, 
  onOpenChange 
}: DialogEditCarProps) => {
  const { collections, updateCar } = useCarCollections();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: car.make,
      model: car.model,
      year: car.year,
      vin: car.vin,
      exteriorColor: car.exteriorColor || "",
      interiorColor: car.interiorColor || "",
      transmission: car.transmission || "",
      condition: car.condition || "",
      mileage: car.mileage,
      notes: car.notes || "",
      collectionId: car.collectionId,
      registration: car.registration || "",
      licensePlate: car.licensePlate || "",
      numberOfKeys: car.numberOfKeys || 0,
      owner: car.owner || "",
      status: car.status || "Available",
      value: car.value || 0,
      images: car.images || [],
      documents: car.documents || [],
    },
  });
  
  const onSubmit = (data: FormValues) => {
    try {
      console.log("Form data submitted:", data);
      
      const validDocuments = (data.documents || []).filter(
        doc => doc.name && doc.name.trim() !== "" && 
               doc.url && doc.url.trim() !== ""
      ) as { name: string; url: string }[];
      
      // Create a new car object with the updated data
      const updatedCar: Car = {
        ...car, // Keep original data
        make: data.make,
        model: data.model,
        year: data.year,
        vin: data.vin,
        exteriorColor: data.exteriorColor || "Not specified",
        interiorColor: data.interiorColor || "Not specified",
        transmission: data.transmission || "Not specified",
        condition: data.condition || "Not specified",
        mileage: data.mileage,
        notes: data.notes || "",
        collectionId: data.collectionId,
        status: data.status || "Available",
        registration: data.registration,
        licensePlate: data.licensePlate,
        numberOfKeys: data.numberOfKeys,
        owner: data.owner,
        value: data.value,
        // Make sure we create new arrays to avoid reference issues
        images: Array.isArray(data.images) ? [...data.images] : [],
        documents: validDocuments,
      };
      
      console.log("Updating car with data:", updatedCar);
      
      // Call updateCar with the car ID and the updated car object
      updateCar(car.id, updatedCar);
      
      toast({
        title: "Car updated",
        description: `${data.year} ${data.make} ${data.model} has been updated.`,
        variant: "default",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating car:", error);
      toast({
        title: "Error",
        description: "Failed to update car. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Car</DialogTitle>
          <DialogDescription>
            Update the details for {car.year} {car.make} {car.model}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BasicInfoFields form={form} />
            
            <IdentificationFields form={form} />
            
            <ColorFields form={form} />
            
            <DetailsFields form={form} />
            
            <MiscFields form={form} collections={collections} />
            
            <ImageUploadField form={form} />
            
            <DocumentUploadField form={form} />
            
            <AdditionalInfoFields form={form} />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

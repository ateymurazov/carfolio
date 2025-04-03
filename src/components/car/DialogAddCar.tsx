
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { useCarCollections } from "@/hooks/useCarCollections";
import { carFormSchema, CarFormValues } from "./carFormSchema";
import {
  BasicInfoFields,
  IdentificationFields,
  ColorFields,
  DetailsFields,
  MiscFields
} from "./CarFormFields";
import { AdditionalInfoFields } from "./AdditionalInfoFields";
import { ImageUploadField } from "./ImageUploadField";

interface DialogAddCarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCollectionId?: string;
}

export const DialogAddCar = ({ 
  open, 
  onOpenChange,
  defaultCollectionId 
}: DialogAddCarProps) => {
  const { collections, addCar } = useCarCollections();
  
  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      vin: "",
      exteriorColor: "",
      interiorColor: "",
      transmission: "",
      condition: "",
      mileage: 0,
      notes: "",
      collectionId: defaultCollectionId || (collections.length > 0 ? collections[0].id : ""),
      registration: "",
      licensePlate: "",
      numberOfKeys: 0,
      owner: "",
      images: [],
    },
  });
  
  const onSubmit = (data: CarFormValues) => {
    try {
      addCar({
        id: crypto.randomUUID(),
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
        images: data.images || [],
        status: "Available",
        acquisitionDate: new Date().toISOString().split('T')[0],
        registration: data.registration,
        licensePlate: data.licensePlate,
        numberOfKeys: data.numberOfKeys,
        owner: data.owner,
      });
      
      toast({
        title: "Car added",
        description: `${data.year} ${data.make} ${data.model} has been added to the inventory.`,
      });
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add car. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Car</DialogTitle>
          <DialogDescription>
            Add a new car to your inventory. Fill out the details below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BasicInfoFields form={form} />
            <IdentificationFields form={form} />
            <ColorFields form={form} />
            <DetailsFields form={form} />
            <ImageUploadField form={form} />
            <AdditionalInfoFields form={form} />
            <MiscFields form={form} collections={collections} />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" /> Add Car
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

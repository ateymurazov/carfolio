
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Trash2, Images } from "lucide-react";
import { useCarCollections } from "@/hooks/useCarCollections";
import { CarGallery } from "@/components/car/CarGallery";
import { CarInfoTable } from "@/components/car/CarInfoTable";
import { DialogEditCar } from "@/components/car/DialogEditCar";
import { DialogDeleteCar } from "@/components/car/DialogDeleteCar";
import { toast } from "@/components/ui/use-toast";

const CarDetails = () => {
  const { carId } = useParams<{carId: string}>();
  const navigate = useNavigate();
  const { getCarById, getCollectionById } = useCarCollections();
  
  const [isEditCarDialogOpen, setIsEditCarDialogOpen] = useState(false);
  const [isDeleteCarDialogOpen, setIsDeleteCarDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to force re-render
  
  useEffect(() => {
    // Validate that carId is provided
    if (!carId) {
      console.error("No car ID provided in URL parameters");
      toast({
        title: "Error",
        description: "No car ID provided",
        variant: "destructive"
      });
      navigate("/inventory");
      return;
    }
    
    // Validate that the car exists
    const car = getCarById(carId);
    if (!car) {
      console.error(`Car with ID ${carId} not found`);
      toast({
        title: "Car Not Found",
        description: `We couldn't find a car with ID: ${carId}`,
        variant: "destructive"
      });
      navigate("/inventory");
      return;
    }
    
    // Force a refresh whenever we visit the page to ensure latest data
    setRefreshKey(prev => prev + 1);
  }, [carId, getCarById, navigate]);
  
  // Get car from context
  const car = carId ? getCarById(carId) : null;
  
  // Get collection if car exists
  const collection = car ? getCollectionById(car.collectionId) : null;
  
  // If car is not found, show a message and a button to return to inventory
  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-6">
        <div className="text-center space-y-4">
          <p className="text-xl">Car not found or still loading...</p>
          <Button 
            variant="default" 
            onClick={() => navigate("/inventory")}
          >
            Return to inventory
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6 animate-fade-in" key={refreshKey}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/inventory")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inventory
        </Button>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditCarDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setIsDeleteCarDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {car.year} {car.make} {car.model}
        </h1>
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground">Collection: </div>
          <Button 
            variant="link" 
            className="p-0 h-auto" 
            onClick={() => navigate(`/collections/${car.collectionId}`)}
          >
            {collection?.name || "Unknown"}
          </Button>
        </div>
      </div>
      
      {/* Car Images */}
      <div className="relative">
        <CarGallery car={car} />
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 bg-background/80"
          onClick={() => setIsEditCarDialogOpen(true)}
        >
          <Images className="mr-2 h-4 w-4" /> Manage Images
        </Button>
      </div>
      
      <Separator />
      
      {/* Car Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Details</h2>
          <CarInfoTable car={car} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <div className="p-4 border rounded-md bg-secondary/50">
            {car.notes || "No notes available for this car."}
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      <DialogEditCar 
        open={isEditCarDialogOpen} 
        onOpenChange={setIsEditCarDialogOpen} 
        car={car}
        onSaved={() => setRefreshKey(prev => prev + 1)} // Refresh on save
      />
      
      <DialogDeleteCar 
        open={isDeleteCarDialogOpen} 
        onOpenChange={setIsDeleteCarDialogOpen} 
        carId={car.id}
        onDeleted={() => navigate("/inventory")}
      />
    </div>
  );
};

export default CarDetails;

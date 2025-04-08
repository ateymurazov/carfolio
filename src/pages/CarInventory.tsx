
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCarCollections } from "@/hooks/useCarCollections";
import { CarGrid } from "@/components/car/CarGrid";
import { DialogAddCar } from "@/components/car/DialogAddCar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useCarStorage } from "@/hooks/useCarStorage";

const CarInventory = () => {
  // Initialize state before using context
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<Error | null>(null);
  
  // Get storage directly for restoration capability
  const { restoreInitialData } = useCarStorage();
  
  // Use try/catch to handle potential context errors
  let contextData: ReturnType<typeof useCarCollections> | null = null;
  
  try {
    contextData = useCarCollections();
  } catch (error) {
    console.error("Error accessing car collections context:", error);
    if (error instanceof Error) {
      setErrorState(error);
    } else {
      setErrorState(new Error("Unknown error accessing car collections"));
    }
  }
  
  // Safely extract cars and collections from context
  const cars = contextData?.cars || [];
  const collections = contextData?.collections || [];
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [isAddCarDialogOpen, setIsAddCarDialogOpen] = useState(false);
  
  // Settle loading state after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show error state if context failed
  if (errorState && !isLoading) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Car Inventory</h1>
          <p className="text-red-500">Error loading car data. Please refresh the page or check your connection.</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </div>
    );
  }
  
  // Filter cars based on search term and selected collection
  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.year.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCollection = 
      selectedCollection === "all" || 
      car.collectionId === selectedCollection;
    
    return matchesSearch && matchesCollection;
  });
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Car Inventory</h1>
          <p className="text-muted-foreground">Loading your car inventory...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Car Inventory</h1>
          <p className="text-muted-foreground">Manage and view all cars in your collections.</p>
        </div>
        <Button 
          size="sm"
          className="bg-navy-800 w-full sm:w-auto"
          onClick={() => {
            if (!contextData) {
              toast({
                title: "Error",
                description: "Cannot add cars at this time. Please refresh the page.",
                variant: "destructive"
              });
              return;
            }
            setIsAddCarDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Car
        </Button>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cars..."
            className="w-full pl-8 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select 
          value={selectedCollection} 
          onValueChange={setSelectedCollection}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-white">
            <SelectValue placeholder="All Collections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Collections</SelectItem>
            {collections.map(collection => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Car grid */}
      {filteredCars.length > 0 ? (
        <CarGrid cars={filteredCars} />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-lg font-medium text-center mb-2">No cars found in your inventory</p>
          
          <div className="flex flex-col gap-4 mt-4 items-center">
            {contextData && (
              <Button 
                onClick={() => setIsAddCarDialogOpen(true)} 
                className="bg-navy-800"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Your First Car
              </Button>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <div className="h-px w-16 bg-gray-200"></div>
              <span className="text-sm text-gray-500">or</span>
              <div className="h-px w-16 bg-gray-200"></div>
            </div>
            
            <Button 
              variant="outline"
              onClick={() => {
                if (window.confirm('Are you sure you want to restore the demo data? This is a manual reset.')) {
                  restoreInitialData();
                }
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Restore Demo Data
            </Button>
            
            <p className="text-xs text-gray-500 max-w-md text-center mt-2">
              This will add sample cars and collections to help you get started. 
              Your current data will be backed up.
            </p>
          </div>
        </div>
      )}
      
      {/* Add Car Dialog */}
      {contextData && (
        <DialogAddCar 
          open={isAddCarDialogOpen} 
          onOpenChange={setIsAddCarDialogOpen} 
        />
      )}
    </div>
  );
};

export default CarInventory;

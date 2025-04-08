
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCarCollections } from "@/hooks/useCarCollections";
import { CarGrid } from "@/components/car/CarGrid";
import { DialogAddCar } from "@/components/car/DialogAddCar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const CarInventory = () => {
  // Use try/catch to handle potential context errors
  let contextData: ReturnType<typeof useCarCollections> | null = null;
  
  try {
    contextData = useCarCollections();
  } catch (error) {
    console.error("Error accessing car collections context:", error);
  }
  
  // Safely extract data from context
  const cars = contextData?.cars || [];
  const collections = contextData?.collections || [];
  const isLoading = contextData?.isLoading || false;
  const isOnline = contextData?.isOnline || navigator.onLine;
  const refreshData = contextData?.refreshData;
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [isAddCarDialogOpen, setIsAddCarDialogOpen] = useState(false);
  
  // Show error state if context failed
  if (!contextData) {
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
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-semibold tracking-tight">Car Inventory</h1>
          <div className={`ml-2 text-sm px-2 py-1 rounded-full flex items-center ${isOnline ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {refreshData && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => refreshData()}
              disabled={!isOnline}
              title={isOnline ? "Refresh data from server" : "Cannot refresh while offline"}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
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
      </div>
      
      <p className="text-muted-foreground -mt-4">
        Manage and view all cars in your collections.
        {!isOnline && " Working in offline mode. Changes will sync when you're back online."}
      </p>
      
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
      
      {/* Car grid or Empty State */}
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
            
            <div className="flex flex-col gap-2">
              {contextData.restoreInitialData && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to restore the demo data? This will not affect any existing data you may have.')) {
                      contextData.restoreInitialData();
                    }
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Restore Demo Data
                </Button>
              )}
            </div>
            
            <p className="text-xs text-gray-500 max-w-md text-center mt-2">
              You can restore demo data to help you get started. 
              Any existing data you have will be preserved.
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
}

export default CarInventory;

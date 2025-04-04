
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCarCollections } from "@/hooks/useCarCollections";
import { CarGrid } from "@/components/car/CarGrid";
import { DialogAddCar } from "@/components/car/DialogAddCar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useImageStorage } from "@/hooks/useImageStorage";

const CarInventory = () => {
  const { cars, collections } = useCarCollections();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [isAddCarDialogOpen, setIsAddCarDialogOpen] = useState(false);
  const imageStorage = useImageStorage();
  
  // Preload images to improve initial render
  useEffect(() => {
    const preloadImages = async () => {
      // Get all image IDs from cars
      const imageIds = cars.flatMap(car => car.images || []);
      
      // Deduplicate
      const uniqueImageIds = [...new Set(imageIds)];
      
      console.log(`Preloading ${uniqueImageIds.length} unique images for inventory view`);
      
      // Force loading of images
      uniqueImageIds.forEach(imageId => {
        if (typeof imageId === 'string' && !imageId.startsWith('data:') && !imageId.startsWith('http') && !imageId.startsWith('/')) {
          imageStorage.getImage(imageId);
        }
      });
    };
    
    preloadImages();
  }, [cars, imageStorage]);
  
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
          onClick={() => setIsAddCarDialogOpen(true)}
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
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p>No cars found.</p>
          <Button variant="link" onClick={() => setIsAddCarDialogOpen(true)}>
            Add your first car
          </Button>
        </div>
      )}
      
      {/* Add Car Dialog */}
      <DialogAddCar 
        open={isAddCarDialogOpen} 
        onOpenChange={setIsAddCarDialogOpen} 
      />
    </div>
  );
};

export default CarInventory;


import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCarCollections } from "@/hooks/useCarCollections";
import { CarGrid } from "@/components/car/CarGrid";
import { DialogAddCar } from "@/components/car/DialogAddCar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useImageStorage } from "@/hooks/useImageStorage";
import { toast } from "@/components/ui/use-toast";
import { validateImage } from "@/utils/imageUtils";

const CarInventory = () => {
  const { cars, collections } = useCarCollections();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [isAddCarDialogOpen, setIsAddCarDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imageStorage = useImageStorage();
  
  // Preload images to improve initial render with better error handling
  useEffect(() => {
    let isMounted = true;
    let loadingToastId: any = null;
    
    const preloadImages = async () => {
      // Set a timeout to make sure we show loading state for at least a short time
      // This prevents flickering for fast loads
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 300));
      
      setIsLoading(true);
      
      if (cars.length > 5) {
        loadingToastId = toast({
          title: "Loading car inventory",
          description: "Preparing images, please wait...",
          duration: 3000,
        });
      }
      
      try {
        // Before processing, check if we actually have images
        const allImageIds = cars
          .flatMap(car => car.images || [])
          .filter(Boolean)
          .slice(0, 20); // Limit preloading to first 20 images for performance
        
        if (allImageIds.length === 0) {
          console.log("No images to preload");
          if (isMounted) {
            await minLoadingTime;
            setIsLoading(false);
          }
          return;
        }
        
        // Deduplicate image IDs
        const uniqueImageIds = [...new Set(allImageIds)];
        
        console.log(`Starting image preload for ${uniqueImageIds.length} unique images`);
        
        // Try loading all images in parallel with a limited batch size
        const batchSize = 3;
        for (let i = 0; i < uniqueImageIds.length; i += batchSize) {
          if (!isMounted) break;
          
          const batch = uniqueImageIds.slice(i, i + batchSize);
          
          // Process each image in the batch
          await Promise.allSettled(batch.map(async (imageId) => {
            if (typeof imageId !== 'string') return;
            
            try {
              // Skip external URLs and data URLs
              if (imageId.startsWith('data:') || imageId.startsWith('http') || imageId.startsWith('/')) {
                return;
              }
              
              // Get image URL from storage
              const imageUrl = imageStorage.getImage(imageId);
              
              // Skip validation if image not found
              if (!imageUrl || imageUrl === '/placeholder.svg') {
                console.warn(`Image ${imageId} not found during preload`);
                return;
              }
              
              // Pre-validate image
              await validateImage(imageUrl);
            } catch (error) {
              console.error(`Error preloading image ${imageId}:`, error);
            }
          }));
        }
        
        console.log("Image preload complete");
      } catch (error) {
        console.error("Error during image preload:", error);
      } finally {
        // Set loading to false, but ensure we've shown loading for at least the minimum time
        if (isMounted) {
          await minLoadingTime;
          setIsLoading(false);
        }
      }
    };
    
    preloadImages();
    
    return () => {
      isMounted = false;
    };
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
        <CarGrid cars={filteredCars} isLoading={isLoading} />
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

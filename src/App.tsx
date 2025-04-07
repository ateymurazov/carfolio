
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CarCollectionsProvider } from "./hooks/useCarCollections";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import CarInventory from "./pages/CarInventory";
import CarDetails from "./pages/CarDetails";
import Collections from "./pages/Collections";
import CollectionDetails from "./pages/CollectionDetails";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

// Configure the query client with retry logic to handle intermittent issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Check for data continuity on startup
const checkDataContinuity = () => {
  console.log("Checking data continuity on application startup");
  
  // Check if we have cars and collections data
  const hasCarData = localStorage.getItem('cars') !== null;
  const hasCollectionData = localStorage.getItem('collections') !== null;
  
  if (!hasCarData || !hasCollectionData) {
    console.log("Some data appears to be missing, checking backup options");
    
    // Check for backups
    const carsPrevious = localStorage.getItem('cars_previous');
    const collectionsPrevious = localStorage.getItem('collections_previous');
    
    // Restore from previous if available
    if (!hasCarData && carsPrevious) {
      console.log("Restoring cars from previous backup");
      localStorage.setItem('cars', carsPrevious);
    }
    
    if (!hasCollectionData && collectionsPrevious) {
      console.log("Restoring collections from previous backup");
      localStorage.setItem('collections', collectionsPrevious);
    }
  }
};

const App = () => {
  // Run data continuity check on app initialization
  useEffect(() => {
    checkDataContinuity();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <CarCollectionsProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/inventory" element={<CarInventory />} />
                <Route path="/cars/:carId" element={<CarDetails />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:collectionId" element={<CollectionDetails />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CarCollectionsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

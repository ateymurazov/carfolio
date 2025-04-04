
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

const queryClient = new QueryClient();

const App = () => (
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

export default App;

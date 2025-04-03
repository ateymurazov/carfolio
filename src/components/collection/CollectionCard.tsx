
import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Car } from "lucide-react";
import { Collection } from "@/types/collection";
import { useCarCollections } from "@/hooks/useCarCollections";
import { cn } from "@/lib/utils";

interface CollectionCardProps {
  collection: Collection;
  className?: string;
}

export const CollectionCard = ({ collection, className }: CollectionCardProps) => {
  const navigate = useNavigate();
  const { getCarsByCollectionId } = useCarCollections();
  const cars = getCarsByCollectionId(collection.id);
  
  return (
    <div 
      className={cn(
        "car-card animation-hover cursor-pointer",
        className
      )}
      onClick={() => navigate(`/collections/${collection.id}`)}
    >
      <div className="car-card-content pt-5 pb-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-1">{collection.name}</h3>
          <div className="bg-primary/10 rounded-full p-2 text-primary">
            <BarChart className="h-4 w-4" />
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {collection.description || "No description provided."}
        </p>
        
        <div className="mt-4 flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span>{cars.length} Cars</span>
          </div>
          
          {collection.clientName && (
            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
              Client: {collection.clientName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

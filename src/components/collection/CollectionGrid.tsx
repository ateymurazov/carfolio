
import React from "react";
import { Collection } from "@/types/collection";
import { CollectionCard } from "./CollectionCard";
import { cn } from "@/lib/utils";

interface CollectionGridProps {
  collections: Collection[];
  className?: string;
}

export const CollectionGrid = ({ collections, className }: CollectionGridProps) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {collections.map(collection => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
};

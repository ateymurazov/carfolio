
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useCarCollections } from "@/hooks/useCarCollections";
import { CollectionGrid } from "@/components/collection/CollectionGrid";
import { DialogAddCollection } from "@/components/collection/DialogAddCollection";

const Collections = () => {
  const { collections } = useCarCollections();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCollectionDialogOpen, setIsAddCollectionDialogOpen] = useState(false);
  
  // Filter collections based on search term
  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">Organize your cars into themed collections.</p>
        </div>
        <Button 
          className="w-full sm:w-auto"
          onClick={() => setIsAddCollectionDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Collection
        </Button>
      </div>
      
      {/* Search */}
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search collections..."
          className="w-full pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Collections grid */}
      {filteredCollections.length > 0 ? (
        <CollectionGrid collections={filteredCollections} />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p>No collections found.</p>
          <Button variant="link" onClick={() => setIsAddCollectionDialogOpen(true)}>
            Create your first collection
          </Button>
        </div>
      )}
      
      {/* Add Collection Dialog */}
      <DialogAddCollection 
        open={isAddCollectionDialogOpen} 
        onOpenChange={setIsAddCollectionDialogOpen} 
      />
    </div>
  );
};

export default Collections;

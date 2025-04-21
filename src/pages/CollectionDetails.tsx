import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ArrowLeft, Edit, Trash2, Video } from "lucide-react";
import { useCarCollections } from "@/hooks/useCarCollections";
import { CarGrid } from "@/components/car/CarGrid";
import { DialogAddCar } from "@/components/car/DialogAddCar";
import { DialogEditCollection } from "@/components/collection/DialogEditCollection";
import { DialogDeleteCollection } from "@/components/collection/DialogDeleteCollection";
import { DialogVideoShare } from "@/components/collection/DialogVideoShare";
import { VideoGenerator } from "@/components/collection/VideoGenerator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

const CollectionDetails = () => {
  const { collectionId } = useParams<{collectionId: string}>();
  const navigate = useNavigate();
  const { getCollectionById, getCarsByCollectionId } = useCarCollections();
  
  const collection = getCollectionById(collectionId || "");
  const cars = getCarsByCollectionId(collectionId || "");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCarDialogOpen, setIsAddCarDialogOpen] = useState(false);
  const [isEditCollectionDialogOpen, setIsEditCollectionDialogOpen] = useState(false);
  const [isDeleteCollectionDialogOpen, setIsDeleteCollectionDialogOpen] = useState(false);
  const [isVideoShareDialogOpen, setIsVideoShareDialogOpen] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const filteredCars = cars.filter(car => 
    car.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
    car.model.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleVideoCreated = (url: string) => {
    setVideoUrl(url);
    setIsGeneratingVideo(false);
    setIsVideoShareDialogOpen(true);
  };
  
  const handleVideoShowcase = () => {
    setVideoUrl(null);
    
    if (cars.length > 0) {
      setIsGeneratingVideo(true);
    } else {
      toast({
        title: "No Cars Available",
        description: "Add cars to your collection before creating a video showcase.",
        variant: "destructive"
      });
    }
  };
  
  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p>Collection not found.</p>
        <Button 
          variant="link" 
          onClick={() => navigate("/collections")}
        >
          Return to collections
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/collections")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Collections
        </Button>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditCollectionDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setIsDeleteCollectionDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
          <p className="text-muted-foreground">{collection.description || "No description."}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            className="w-full sm:w-auto"
            onClick={() => setIsAddCarDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Car to Collection
          </Button>
          {cars.length > 0 && (
            <Button 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleVideoShowcase}
            >
              <Video className="mr-2 h-4 w-4" /> Video Showcase
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="stats-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{cars.length}</div>
            <p className="text-sm text-muted-foreground">Cars in collection</p>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{collection.clientName || "N/A"}</div>
            <p className="text-sm text-muted-foreground">Client</p>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{collection.created}</div>
            <p className="text-sm text-muted-foreground">Created date</p>
          </CardContent>
        </Card>
      </div>
      
      {isGeneratingVideo && (
        <div className="mt-4">
          <VideoGenerator 
            cars={cars}
            collectionName={collection.name}
            onVideoCreated={handleVideoCreated}
          />
        </div>
      )}
      
      <Separator />
      
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search cars..."
          className="w-full pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredCars.length > 0 ? (
        <CarGrid cars={filteredCars} />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p>No cars in this collection.</p>
          <Button variant="link" onClick={() => setIsAddCarDialogOpen(true)}>
            Add your first car to this collection
          </Button>
        </div>
      )}
      
      <DialogAddCar 
        open={isAddCarDialogOpen} 
        onOpenChange={setIsAddCarDialogOpen} 
        defaultCollectionId={collectionId}
      />
      
      <DialogEditCollection 
        open={isEditCollectionDialogOpen} 
        onOpenChange={setIsEditCollectionDialogOpen} 
        collection={collection}
      />
      
      <DialogDeleteCollection 
        open={isDeleteCollectionDialogOpen} 
        onOpenChange={setIsDeleteCollectionDialogOpen} 
        collectionId={collection.id}
        onDeleted={() => navigate("/collections")}
      />
      
      <DialogVideoShare
        open={isVideoShareDialogOpen}
        onOpenChange={setIsVideoShareDialogOpen}
        videoUrl={videoUrl}
        collectionName={collection.name}
      />
    </div>
  );
};

export default CollectionDetails;

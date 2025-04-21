
import React, { useState } from "react";
import { Car } from "@/types/car";
import { Loader2 } from "lucide-react";
import { useProcessedCars } from "@/hooks/useProcessedCars";
import { CanvasVideoRenderer } from "./CanvasVideoRenderer";
import { toast } from "@/components/ui/use-toast";

interface VideoGeneratorProps {
  cars: Car[];
  collectionName: string;
  onVideoCreated: (videoUrl: string) => void;
}

export const VideoGenerator = ({ cars, collectionName, onVideoCreated }: VideoGeneratorProps) => {
  const [generating, setGenerating] = useState(true);
  const [progress, setProgress] = useState(0);

  // Prepare cars and fallback images
  const processedCars = useProcessedCars(cars);

  React.useEffect(() => {
    if (cars.length === 0) {
      toast({
        title: "Cannot generate video",
        description: "No cars available in this collection.",
        variant: "destructive",
      });
      setGenerating(false);
    }
  }, [cars.length, toast]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <CanvasVideoRenderer
          processedCars={processedCars}
          collectionName={collectionName}
          onVideoComplete={onVideoCreated}
          setProgress={setProgress}
          setGenerating={setGenerating}
        />
        <div className="flex flex-col items-center gap-2 my-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Generating video: {progress}%</p>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

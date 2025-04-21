
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
  const [error, setError] = useState<string | null>(null);

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
  }, [cars.length]);

  const handleVideoComplete = (url: string) => {
    // Verify URL is valid before passing it up
    if (!url || url === 'blob:') {
      setError("Failed to generate a valid video URL");
      toast({
        title: "Video Generation Failed",
        description: "Failed to create a valid video. Please try again.",
        variant: "destructive"
      });
      setGenerating(false);
      return;
    }
    
    // Create a simple test to check if the URL is accessible
    const videoTest = document.createElement('video');
    videoTest.onloadedmetadata = () => {
      // URL is valid and video is accessible
      onVideoCreated(url);
    };
    
    videoTest.onerror = () => {
      setError("Video resource could not be loaded (404)");
      toast({
        title: "Video URL Error",
        description: "The generated video cannot be accessed. This may be due to browser security restrictions with blob URLs.",
        variant: "destructive"
      });
      // Try to send the URL anyway as some errors might be false positives
      onVideoCreated(url);
    };
    
    videoTest.src = url;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <CanvasVideoRenderer
          processedCars={processedCars}
          collectionName={collectionName}
          onVideoComplete={handleVideoComplete}
          setProgress={setProgress}
          setGenerating={setGenerating}
        />
        <div className="flex flex-col items-center gap-2 my-4">
          {error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Generating video: {progress}%</p>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


import React, { useEffect, useRef, useState } from "react";
import { Car } from "@/types/car";
import { Button } from "@/components/ui/button";
import { Loader2, Share2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface VideoGeneratorProps {
  cars: Car[];
  collectionName: string;
  onVideoCreated: (videoUrl: string) => void;
}

export const VideoGenerator = ({ cars, collectionName, onVideoCreated }: VideoGeneratorProps) => {
  const [generating, setGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Start generating the video immediately when component mounts
  useEffect(() => {
    if (cars.length > 0) {
      generateVideo();
    } else {
      toast({
        title: "Cannot generate video",
        description: "No cars available in this collection.",
        variant: "destructive",
      });
      setGenerating(false);
    }
    // Clean up function
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const generateVideo = async () => {
    if (!canvasRef.current || cars.length === 0) {
      toast({
        title: "Cannot generate video",
        description: "No cars available in this collection.",
        variant: "destructive",
      });
      setGenerating(false);
      return;
    }

    try {
      setGenerating(true);
      setProgress(0);
      chunksRef.current = [];

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast({
          title: "Video Generation Failed",
          description: "Could not get canvas context.",
          variant: "destructive",
        });
        setGenerating(false);
        return;
      }

      // Set canvas size
      canvas.width = 1280;
      canvas.height = 720;

      // Create media stream from canvas with balanced FPS
      const stream = canvas.captureStream(12); // Adjusted from 8 to 12 FPS for better flow
      videoStreamRef.current = stream;

      // Check media recorder support
      if (!window.MediaRecorder) {
        toast({
          title: "Browser Not Supported",
          description: "Your browser doesn't support MediaRecorder API.",
          variant: "destructive",
        });
        setGenerating(false);
        return;
      }

      // Check if webm is supported
      let mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback to video/mp4 if webm is not supported
        mimeType = 'video/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          toast({
            title: "Format Not Supported",
            description: "Your browser doesn't support video recording formats.",
            variant: "destructive",
          });
          setGenerating(false);
          return;
        }
      }

      // Create media recorder with higher bitrate for quality
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        videoBitsPerSecond: 2500000 // Higher bitrate for better quality
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        onVideoCreated(videoUrl);
        setGenerating(false);
      };

      // Start recording
      mediaRecorder.start();

      // Calculate total frames needed
      let totalImages = 0;
      for (const car of cars) {
        totalImages += Math.max(1, car.images?.length || 1); // At least one frame per car
      }
      
      // Set frames per image for balanced speed
      const framesPerImage = 30; // 30 frames at 12fps = 2.5 seconds per image
      const totalFrames = totalImages * framesPerImage;
      
      let frameCount = 0;
      let currentCarIndex = 0;
      let currentImageIndex = 0;

      const drawFrame = async () => {
        if (!ctx || !canvas) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fill background
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Get current car
        const car = cars[currentCarIndex];
        
        // Draw collection title
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(collectionName, canvas.width / 2, 80);

        // Show progress
        setProgress(Math.floor((frameCount / totalFrames) * 100));

        // Draw car information
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${car.make} ${car.model} (${car.year})`, canvas.width / 2, 150);

        // Determine which image to show for this car
        let imageSrc = null;
        if (car.images && car.images.length > 0) {
          imageSrc = car.images[currentImageIndex % car.images.length];
        }

        // Draw car image if available
        if (imageSrc) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = imageSrc;
          
          await new Promise((resolve) => {
            img.onload = () => {
              // Calculate dimensions to maintain aspect ratio and center the image
              const ratio = Math.min(
                (canvas.width - 100) / img.width,
                (canvas.height - 300) / img.height
              );
              const width = img.width * ratio;
              const height = img.height * ratio;
              const x = (canvas.width - width) / 2;
              const y = (canvas.height - height) / 2 + 50;
              
              ctx.drawImage(img, x, y, width, height);
              resolve(null);
            };
            img.onerror = () => {
              // Draw placeholder for missing image
              ctx.fillStyle = "#e2e8f0";
              ctx.fillRect((canvas.width - 400) / 2, (canvas.height - 300) / 2 + 50, 400, 300);
              ctx.fillStyle = "#94a3b8";
              ctx.font = "24px sans-serif";
              ctx.fillText("No image available", canvas.width / 2, canvas.height / 2 + 50);
              resolve(null);
            };
          });
        } else {
          // Draw placeholder for missing image
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect((canvas.width - 400) / 2, (canvas.height - 300) / 2 + 50, 400, 300);
          ctx.fillStyle = "#94a3b8";
          ctx.font = "24px sans-serif";
          ctx.fillText("No image available", canvas.width / 2, canvas.height / 2 + 50);
        }

        // Draw car details
        ctx.fillStyle = "#334155";
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Condition: ${car.condition} | Mileage: ${car.mileage} miles`, canvas.width / 2, canvas.height - 80);

        frameCount++;

        // Check if we need to move to the next image or car
        if (frameCount % framesPerImage === 0) {
          // Time to change image or car
          if (car.images && car.images.length > 0) {
            currentImageIndex++;
            
            // If we've shown all images for this car, move to next car
            if (currentImageIndex >= car.images.length) {
              currentImageIndex = 0;
              currentCarIndex++;
              
              // If we've shown all cars, finish the video
              if (currentCarIndex >= cars.length) {
                currentCarIndex = 0;
              }
            }
          } else {
            // No images for this car, move to next car
            currentCarIndex++;
            currentImageIndex = 0;
            
            // If we've shown all cars, finish the video
            if (currentCarIndex >= cars.length) {
              currentCarIndex = 0;
            }
          }
        }

        // Check if we should continue or stop recording
        if (frameCount < totalFrames) {
          // Use setTimeout with a balanced delay for smooth playback
          setTimeout(() => {
            requestAnimationFrame(drawFrame);
          }, 150); // Adjusted delay for smoother playback
        } else {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
          }
          if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach(track => track.stop());
          }
        }
      };

      // Start animation
      drawFrame();

    } catch (error) {
      console.error("Error generating video:", error);
      setGenerating(false);
      toast({
        title: "Video Generation Failed",
        description: "There was an error creating the video: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <canvas ref={canvasRef} className="hidden" />
        
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

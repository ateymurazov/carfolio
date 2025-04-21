
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

      // Create media stream from canvas - reduce FPS to 15 for slower video
      const stream = canvas.captureStream(15); // Reduced from 30 to 15 FPS
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

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
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

      // Draw frames with car images
      let currentCarIndex = 0;
      // Increase frames per car for slower transitions (4 seconds per car at 15fps = 60 frames)
      const framesPerCar = 60;
      const totalFrames = cars.length * framesPerCar;
      let frameCount = 0;

      const drawFrame = async () => {
        if (!ctx || !canvas) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fill background
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw collection title
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(collectionName, canvas.width / 2, 80);

        // Calculate which car to show
        currentCarIndex = Math.floor((frameCount / totalFrames) * cars.length);
        if (currentCarIndex >= cars.length) currentCarIndex = cars.length - 1;

        const car = cars[currentCarIndex];

        // Show progress
        setProgress(Math.floor((frameCount / totalFrames) * 100));

        // Draw car information
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${car.make} ${car.model} (${car.year})`, canvas.width / 2, 150);

        // Draw car image if available
        if (car.images && car.images.length > 0) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = car.images[0];
          
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

        // Check if we should continue or stop recording
        if (frameCount < totalFrames) {
          // Use setTimeout to slow down frame rate even more
          setTimeout(() => {
            requestAnimationFrame(drawFrame);
          }, 100); // Add a 100ms delay between frames for smoother playback
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

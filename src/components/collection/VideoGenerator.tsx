
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
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const generateVideo = async () => {
    if (!canvasRef.current || cars.length === 0) {
      toast({
        title: "Cannot generate video",
        description: "No cars available in this collection.",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);
      setProgress(0);
      chunksRef.current = [];

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      canvas.width = 1280;
      canvas.height = 720;

      // Create media stream from canvas
      const stream = canvas.captureStream(30); // 30 FPS
      videoStreamRef.current = stream;

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(blob);
        onVideoCreated(videoUrl);
        setGenerating(false);
      };

      // Start recording
      mediaRecorder.start();

      // Draw frames with car images
      let currentCarIndex = 0;
      const totalFrames = cars.length * 60; // 2 seconds per car at 30fps
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
        
        // Draw frame counter for debug purposes
        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`Frame: ${frameCount}/${totalFrames}`, canvas.width - 20, canvas.height - 20);

        frameCount++;

        // Check if we should continue or stop recording
        if (frameCount < totalFrames) {
          requestAnimationFrame(drawFrame);
        } else {
          mediaRecorder.stop();
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
        description: "There was an error creating the video.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <canvas ref={canvasRef} className="hidden" />
        
        {generating ? (
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
        ) : (
          <Button 
            className="flex gap-2 items-center" 
            onClick={generateVideo}
          >
            <Share2 className="h-4 w-4" />
            Create Video Showcase
          </Button>
        )}
      </div>
    </div>
  );
};

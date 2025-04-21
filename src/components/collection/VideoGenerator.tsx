
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

      // Create media stream from canvas with optimized FPS
      const stream = canvas.captureStream(30); // Increased to 30 FPS for smoother video
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
      let mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Try without codecs specification
        mimeType = 'video/webm';
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
      }

      console.log("Using MIME type:", mimeType);

      // Create media recorder with higher bitrate for quality
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        videoBitsPerSecond: 5000000 // Higher bitrate for better quality
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log("Received data chunk of size:", event.data.size);
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length === 0) {
          console.error("No video data chunks collected");
          toast({
            title: "Video Generation Failed",
            description: "No video data was recorded. Please try again.",
            variant: "destructive",
          });
          setGenerating(false);
          return;
        }

        console.log("MediaRecorder stopped. Creating video from", chunksRef.current.length, "chunks");
        
        // Create the video blob
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log("Created video blob of size:", blob.size);
        
        if (blob.size === 0) {
          console.error("Generated video has zero size");
          toast({
            title: "Video Generation Failed",
            description: "The generated video is empty. Please try again.",
            variant: "destructive",
          });
          setGenerating(false);
          return;
        }
        
        const videoUrl = URL.createObjectURL(blob);
        console.log("Video URL created:", videoUrl);
        
        onVideoCreated(videoUrl);
        setGenerating(false);
      };

      // Request data at regular intervals to ensure we get chunks
      mediaRecorder.start(1000);
      console.log("MediaRecorder started");

      // Calculate total frames needed
      let totalImages = 0;
      cars.forEach(car => {
        // Count images for each car (at least 1)
        const imageCount = car.images?.length || 1;
        totalImages += imageCount;
        console.log(`Car ${car.id} has ${imageCount} images`);
      });
      
      // Set frames per image for balanced speed (3 seconds per image)
      const framesPerSecond = 30;
      const secondsPerImage = 3;
      const framesPerImage = framesPerSecond * secondsPerImage;
      const totalFrames = totalImages * framesPerImage;
      
      console.log(`Total images: ${totalImages}, Total frames: ${totalFrames}`);
      
      let frameCount = 0;
      let currentCarIndex = 0;
      let currentImageIndex = 0;

      const renderNextFrame = () => {
        if (!ctx || !canvas) return;
        
        // Get current car
        const car = cars[currentCarIndex];
        if (!car) {
          console.error("Car not found at index", currentCarIndex);
          return;
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw collection title
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(collectionName, canvas.width / 2, 80);
        
        // Show progress
        const progressPercentage = Math.floor((frameCount / totalFrames) * 100);
        setProgress(progressPercentage);
        
        // Draw car information
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${car.make} ${car.model} (${car.year})`, canvas.width / 2, 150);

        // Determine which image to show
        let imageSrc = null;
        const hasImages = car.images && car.images.length > 0;
        
        if (hasImages) {
          imageSrc = car.images[currentImageIndex % car.images.length];
        }
        
        // Draw car image
        return new Promise<void>((resolve) => {
          if (imageSrc) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = imageSrc;
            
            img.onload = () => {
              try {
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
                
                // Draw car details
                ctx.fillStyle = "#334155";
                ctx.font = "24px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(`Condition: ${car.condition} | Mileage: ${car.mileage} miles`, canvas.width / 2, canvas.height - 80);
                
                frameCount++;
                resolve();
              } catch (err) {
                console.error("Error drawing image:", err);
                // Still increment frame and resolve to avoid getting stuck
                frameCount++;
                resolve();
              }
            };
            
            img.onerror = () => {
              console.error("Failed to load image:", imageSrc);
              
              // Draw placeholder for missing image
              ctx.fillStyle = "#e2e8f0";
              ctx.fillRect((canvas.width - 400) / 2, (canvas.height - 300) / 2 + 50, 400, 300);
              ctx.fillStyle = "#94a3b8";
              ctx.font = "24px sans-serif";
              ctx.fillText("No image available", canvas.width / 2, canvas.height / 2 + 50);
              
              // Draw car details
              ctx.fillStyle = "#334155";
              ctx.font = "24px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText(`Condition: ${car.condition} | Mileage: ${car.mileage} miles`, canvas.width / 2, canvas.height - 80);
              
              frameCount++;
              resolve();
            };
          } else {
            // Draw placeholder for missing image
            ctx.fillStyle = "#e2e8f0";
            ctx.fillRect((canvas.width - 400) / 2, (canvas.height - 300) / 2 + 50, 400, 300);
            ctx.fillStyle = "#94a3b8";
            ctx.font = "24px sans-serif";
            ctx.fillText("No image available", canvas.width / 2, canvas.height / 2 + 50);
            
            // Draw car details
            ctx.fillStyle = "#334155";
            ctx.font = "24px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`Condition: ${car.condition} | Mileage: ${car.mileage} miles`, canvas.width / 2, canvas.height - 80);
            
            frameCount++;
            resolve();
          }
        });
      };

      const processFrames = async () => {
        try {
          while (frameCount < totalFrames) {
            // Check if we need to move to the next image or car
            if (frameCount > 0 && frameCount % framesPerImage === 0) {
              // Time to move to the next image or car
              const car = cars[currentCarIndex];
              
              if (car.images && car.images.length > 0) {
                currentImageIndex++;
                
                // If we've shown all images for this car, move to the next car
                if (currentImageIndex >= car.images.length) {
                  currentImageIndex = 0;
                  currentCarIndex++;
                  
                  // If we've shown all cars, finish the video
                  if (currentCarIndex >= cars.length) {
                    break;
                  }
                }
              } else {
                // No images for this car, move to next car
                currentCarIndex++;
                currentImageIndex = 0;
                
                // If we've shown all cars, finish the video
                if (currentCarIndex >= cars.length) {
                  break;
                }
              }
            }
            
            await renderNextFrame();
            
            // Small delay between frames to give browser time to process
            await new Promise(resolve => setTimeout(resolve, 10));
          }
          
          // Finalize the video
          console.log("All frames processed, stopping recording");
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            // Request one final data chunk before stopping
            if (mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.requestData();
            }
            
            // Give a small delay to ensure the last data is processed
            await new Promise(resolve => setTimeout(resolve, 500));
            
            mediaRecorderRef.current.stop();
          }
          
          // Clean up stream tracks
          if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach(track => track.stop());
          }
        } catch (error) {
          console.error("Error in frame processing:", error);
          setGenerating(false);
          toast({
            title: "Video Generation Failed",
            description: "There was an error creating the video: " + (error instanceof Error ? error.message : String(error)),
            variant: "destructive",
          });
        }
      };

      // Start the frame processing
      processFrames();

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

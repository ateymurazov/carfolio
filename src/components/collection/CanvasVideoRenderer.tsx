
import React, { useEffect, useRef } from "react";
import { Car } from "@/types/car";
import { toast } from "@/components/ui/use-toast";

interface CanvasVideoRendererProps {
  processedCars: (Car & { resolvedImages: string[] })[];
  collectionName: string;
  onVideoComplete: (url: string) => void;
  setProgress: (n: number) => void;
  setGenerating: (v: boolean) => void;
  canvasClassName?: string;
}

export const CanvasVideoRenderer = ({
  processedCars,
  collectionName,
  onVideoComplete,
  setProgress,
  setGenerating,
  canvasClassName = "hidden"
}: CanvasVideoRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!canvasRef.current || processedCars.length === 0) {
      setGenerating(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    // Video frame and encoding setup
    const framesPerSecond = 30;
    const secondsPerImage = 3;
    let totalImages = processedCars.reduce((sum, car) => sum + (car.resolvedImages?.length || 1), 0);
    let framesPerImage = framesPerSecond * secondsPerImage;
    let totalFrames = totalImages * framesPerImage;
    let frameCount = 0;
    let currentCarIndex = 0;
    let currentImageIndex = 0;

    // Setup media recording
    const stream = canvas.captureStream(framesPerSecond);
    videoStreamRef.current = stream;
    let mimeType = 'video/webm;codecs=vp8,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

    const mr = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 5000000
    });
    mediaRecorderRef.current = mr;

    mr.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    mr.onstop = () => {
      if (chunksRef.current.length === 0) {
        toast({
          title: "Video Generation Failed",
          description: "No video data was recorded.",
          variant: "destructive"
        });
        setGenerating(false);
        return;
      }
      const blob = new Blob(chunksRef.current, { type: mimeType });
      if (blob.size === 0) {
        toast({
          title: "Video Generation Failed",
          description: "The generated video is empty. Please try again.",
          variant: "destructive"
        });
        setGenerating(false);
        return;
      }
      onVideoComplete(URL.createObjectURL(blob));
      setGenerating(false);
    };
    mr.start(1000);

    // helpers
    function drawPlaceholder(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, car: Car, message: string) {
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect((canvas.width - 400) / 2, (canvas.height - 300) / 2 + 50, 400, 300);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 50);
      ctx.fillStyle = "#334155";
      ctx.font = "24px sans-serif";
      ctx.fillText(
        `Condition: ${car.condition} | Mileage: ${car.mileage} miles`,
        canvas.width / 2,
        canvas.height - 80
      );
    }

    const renderNextFrame = async () => {
      if (!ctx || !canvas) return;
      const car = processedCars[currentCarIndex];

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw collection title
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(collectionName, canvas.width / 2, 80);

      // Progress bar
      const progress = Math.floor((frameCount / totalFrames) * 100);
      setProgress(progress);

      // Draw car information
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText(`${car.make} ${car.model} (${car.year})`, canvas.width / 2, 150);

      // Draw image
      const imageSrc =
        car.resolvedImages && car.resolvedImages.length > 0
          ? car.resolvedImages[currentImageIndex % car.resolvedImages.length]
          : null;

      await new Promise<void>((resolve) => {
        if (imageSrc) {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            try {
              // Maintain aspect and center.
              const ratio = Math.min(
                (canvas.width - 100) / img.width,
                (canvas.height - 300) / img.height
              );
              const width = img.width * ratio;
              const height = img.height * ratio;
              const x = (canvas.width - width) / 2;
              const y = (canvas.height - height) / 2 + 50;
              ctx.drawImage(img, x, y, width, height);

              // Car details.
              ctx.fillStyle = "#334155";
              ctx.font = "24px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText(
                `Condition: ${car.condition} | Mileage: ${car.mileage} miles`,
                canvas.width / 2,
                canvas.height - 80
              );

              frameCount++;
              resolve();
            } catch {
              drawPlaceholder(ctx, canvas, car, "Error loading image");
              frameCount++;
              resolve();
            }
          };
          img.onerror = () => {
            drawPlaceholder(ctx, canvas, car, "Failed to load image");
            frameCount++;
            resolve();
          };
          img.src = imageSrc;
        } else {
          drawPlaceholder(ctx, canvas, car, "No image available");
          frameCount++;
          resolve();
        }
      });
    };

    const processFrames = async () => {
      const processFrame = async () => {
        if (frameCount >= totalFrames) {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            if (mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.requestData();
            }
            await new Promise(res => setTimeout(res, 1000));
            mediaRecorderRef.current.stop();
          }
          if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach(track => track.stop());
          }
          return;
        }

        // Advance to next image/car.
        if (frameCount > 0 && frameCount % framesPerImage === 0) {
          const car = processedCars[currentCarIndex];
          if (car.resolvedImages && car.resolvedImages.length > 0) {
            currentImageIndex++;
            if (currentImageIndex >= car.resolvedImages.length) {
              currentImageIndex = 0;
              currentCarIndex++;
              if (currentCarIndex >= processedCars.length) currentCarIndex = 0;
            }
          } else {
            currentCarIndex++;
            currentImageIndex = 0;
            if (currentCarIndex >= processedCars.length) currentCarIndex = 0;
          }
        }

        await renderNextFrame();
        setTimeout(processFrame, 10);
      };
      processFrame();
    };

    setGenerating(true);
    setProgress(0);
    chunksRef.current = [];
    processFrames();

    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
    // purposely only run on mount
    // eslint-disable-next-line
  }, []);

  return <canvas ref={canvasRef} className={canvasClassName} />;
};

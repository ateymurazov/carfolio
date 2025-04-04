
import React, { useState, useEffect } from "react";
import { useImageStorage } from "@/hooks/useImageStorage";
import { validateImage } from "@/utils/imageUtils";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarImageProps {
  imageId: string;
  alt: string;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  showPlaceholder?: boolean;
  onError?: () => void;
}

export const CarImage = ({ 
  imageId, 
  alt,
  className,
  aspectRatio = "video",
  showPlaceholder = true,
  onError
}: CarImageProps) => {
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const imageStorage = useImageStorage();
  
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    const loadImage = async () => {
      try {
        if (!imageId) {
          if (isMounted) {
            setError(true);
            setIsLoading(false);
          }
          return;
        }
        
        // Get image from storage
        const img = imageStorage.getImage(imageId);
        
        // Validate the image
        const isValid = await validateImage(img);
        
        if (isMounted) {
          if (isValid) {
            setImageUrl(img);
            setError(false);
          } else {
            console.warn(`Invalid image for ID: ${imageId}`);
            setError(true);
            if (onError) onError();
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Error loading image ${imageId}:`, err);
          setError(true);
          setIsLoading(false);
          if (onError) onError();
        }
      }
    };
    
    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [imageId, imageStorage, onError]);
  
  const handleImageError = () => {
    setError(true);
    if (onError) onError();
  };
  
  // Show placeholder if image is in error state
  if (error || !imageUrl) {
    if (!showPlaceholder) return null;
    
    return (
      <div className={cn(
        "flex items-center justify-center bg-gray-100",
        aspectRatio === "video" && "aspect-video",
        aspectRatio === "square" && "aspect-square",
        aspectRatio === "auto" && "h-full w-full",
        className
      )}>
        <ImageOff className="h-8 w-8 text-gray-400" />
      </div>
    );
  }
  
  // Show actual image
  return (
    <img 
      src={imageUrl}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
};

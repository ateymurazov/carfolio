
import React, { useState, useEffect, useRef } from "react";
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
  onLoad?: () => void;
  fallbackSrc?: string;
}

export const CarImage = ({ 
  imageId, 
  alt,
  className,
  aspectRatio = "video",
  showPlaceholder = true,
  onError,
  onLoad,
  fallbackSrc = "/placeholder.svg"
}: CarImageProps) => {
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);
  const imageStorage = useImageStorage();
  const prevImageIdRef = useRef<string | null>(null);
  
  // Reset states when imageId changes
  useEffect(() => {
    let isMounted = true;
    
    // Prevent unnecessary reloads if the imageId hasn't changed
    if (prevImageIdRef.current === imageId) {
      return;
    }
    
    prevImageIdRef.current = imageId;
    
    // Start with fallback image while loading the actual image
    if (isMounted) {
      setImageUrl(fallbackSrc);
      setIsLoading(true);
      setError(false);
    }
    
    const loadImage = async () => {
      // Handle empty imageId case
      if (!imageId || imageId.trim() === '') {
        if (isMounted) {
          console.log("Empty imageId provided");
          setError(true);
          setIsLoading(false);
          if (onError) onError();
        }
        return;
      }
      
      try {
        // Handle direct URLs and data URLs immediately
        if (imageId.startsWith('data:') || imageId.startsWith('http') || imageId.startsWith('/')) {
          if (isMounted) {
            setImageUrl(imageId);
            setIsLoading(false);
            if (onLoad) onLoad();
          }
          return;
        }
        
        // Get image from storage
        const img = imageStorage.getImage(imageId);
        
        if (!img || img === '/placeholder.svg') {
          if (isMounted) {
            console.log(`Image not found for ID: ${imageId}`);
            setError(true);
            setIsLoading(false);
            if (onError) onError();
          }
          return;
        }
        
        // Set the image URL first so we can start showing something
        if (isMounted) {
          setImageUrl(img);
          
          // Simplified validation
          if (img && img !== '/placeholder.svg') {
            if (onLoad) onLoad();
            setIsLoading(false);
          } else {
            setError(true);
            if (onError) onError();
            setIsLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading image:", err);
          setError(true);
          setIsLoading(false);
          if (onError) onError();
        }
      }
    };
    
    // Quick load to prevent delay
    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [imageId, imageStorage, onError, onLoad, fallbackSrc]);
  
  const handleImageLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };
  
  const handleImageError = () => {
    console.log(`Image failed to load: ${imageId}`);
    setError(true);
    setIsLoading(false);
    if (onError) onError();
  };
  
  // Show placeholder if in error state
  if (error) {
    if (!showPlaceholder) return null;
    
    if (fallbackSrc && fallbackSrc !== '/placeholder.svg') {
      return (
        <img 
          src={fallbackSrc}
          alt={alt}
          className={cn(className)}
          onError={() => console.log("Even fallback image failed to load")}
        />
      );
    }
    
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
  
  return (
    <img 
      src={imageUrl}
      alt={alt}
      className={cn(
        className, 
        "transition-opacity duration-200",
        isLoading ? "opacity-30" : "opacity-100"
      )}
      onError={handleImageError}
      onLoad={handleImageLoad}
    />
  );
};

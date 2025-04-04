
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
  
  // Reset states when imageId changes
  useEffect(() => {
    let isMounted = true;
    
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
        }
        
        // Then validate the image in background to ensure it's valid
        try {
          const isValid = await validateImage(img);
          
          if (isMounted) {
            if (!isValid) {
              console.log(`Image validation failed for ID: ${imageId}`);
              setError(true);
              if (onError) onError();
            } else {
              if (onLoad) onLoad();
            }
            
            setIsLoading(false);
          }
        } catch (validationErr) {
          if (isMounted) {
            console.error("Image validation error:", validationErr);
            setError(true);
            setIsLoading(false);
            if (onError) onError();
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
    
    // Use requestAnimationFrame to load image after rendering
    const timerId = requestAnimationFrame(() => {
      loadImage();
    });
    
    return () => {
      window.cancelAnimationFrame(timerId);
      isMounted = false;
    };
  }, [imageId, imageStorage, onError, onLoad, fallbackSrc]);
  
  const handleImageError = () => {
    console.log(`Image failed to load: ${imageId}`);
    setError(true);
    if (onError) onError();
  };
  
  const handleImageLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
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
  
  // Show actual image
  return (
    <img 
      src={imageUrl}
      alt={alt}
      className={cn(className, isLoading && "opacity-70")}
      onError={handleImageError}
      onLoad={handleImageLoad}
    />
  );
};

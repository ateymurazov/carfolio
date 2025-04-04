
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
  fallbackSrc?: string;
}

export const CarImage = ({ 
  imageId, 
  alt,
  className,
  aspectRatio = "video",
  showPlaceholder = true,
  onError,
  fallbackSrc = "/placeholder.svg"
}: CarImageProps) => {
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);
  const imageStorage = useImageStorage();
  
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    // Immediately set fallback as the initial state
    if (fallbackSrc && isMounted) {
      setImageUrl(fallbackSrc);
    }
    
    // Reset error state when imageId changes
    setError(false);
    
    const loadImage = async () => {
      try {
        if (!imageId) {
          if (isMounted) {
            setError(true);
            setIsLoading(false);
            if (onError) onError();
          }
          return;
        }
        
        // Handle direct URLs and data URLs immediately
        if (imageId.startsWith('data:') || imageId.startsWith('http') || imageId.startsWith('/')) {
          if (isMounted) {
            setImageUrl(imageId);
            setError(false);
            setIsLoading(false);
          }
          return;
        }
        
        // Get image from storage
        const img = imageStorage.getImage(imageId);
        
        if (!img || img === '/placeholder.svg') {
          if (isMounted) {
            setError(true);
            setIsLoading(false);
            if (onError) onError();
          }
          return;
        }
        
        // Set the image URL first, then validate
        if (isMounted) {
          setImageUrl(img);
        }
        
        // Validate the image in background
        const isValid = await validateImage(img);
        
        if (isMounted) {
          if (!isValid) {
            setError(true);
            if (onError) onError();
          }
          setIsLoading(false);
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
    
    // Load image immediately but don't cause cascading effects
    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [imageId, imageStorage, onError, fallbackSrc]);
  
  const handleImageError = () => {
    setError(true);
    if (onError) onError();
  };
  
  // Show placeholder if image is in error state
  if (error) {
    if (!showPlaceholder) return null;
    
    if (fallbackSrc) {
      return (
        <img 
          src={fallbackSrc}
          alt={alt}
          className={cn(className)}
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
      className={className}
      onError={handleImageError}
    />
  );
};

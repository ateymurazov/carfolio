
import React, { useState, useEffect } from "react";
import { useImageStorage } from "@/hooks/useImageStorage";
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
  const [imageUrl, setImageUrl] = useState<string>("");
  const [useFallback, setUseFallback] = useState(false);
  const imageStorage = useImageStorage();
  
  // Update image URL when imageId changes
  useEffect(() => {
    let isMounted = true;
    
    // Reset states when imageId changes
    setError(false);
    setUseFallback(false);
    
    if (!imageId || imageId.trim() === '') {
      if (isMounted) {
        setImageUrl("");
      }
      return;
    }
    
    // Handle different image source types
    if (imageId.startsWith('data:') || imageId.startsWith('/')) {
      // Direct data URLs or local paths
      if (isMounted) setImageUrl(imageId);
    } else if (imageId.startsWith('http')) {
      // External URLs
      if (isMounted) {
        setImageUrl(imageId);
        console.log(`Loading external image: ${imageId.substring(0, 50)}...`);
      }
    } else {
      // Image IDs from storage
      try {
        const resolvedUrl = imageStorage.getImage(imageId);
        if (isMounted) setImageUrl(resolvedUrl);
      } catch (err) {
        console.warn(`Failed to get image from storage: ${imageId}`, err);
        if (isMounted) {
          setError(true);
          setImageUrl(fallbackSrc);
        }
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [imageId, imageStorage, fallbackSrc]);
  
  const renderPlaceholder = () => (
    <div className={cn(
      "flex items-center justify-center bg-gray-100",
      aspectRatio === "video" && "aspect-video",
      aspectRatio === "square" && "aspect-square",
      className
    )}>
      <ImageOff className="h-8 w-8 text-gray-400" />
    </div>
  );
  
  const handleImageError = () => {
    console.error(`Image failed to load: ${imageUrl.substring(0, 50)}...`);
    
    if (useFallback) {
      // Already tried fallback, show placeholder
      setError(true);
      if (onError) onError();
    } else if (imageUrl !== fallbackSrc && fallbackSrc) {
      // Try fallback
      setUseFallback(true);
      setImageUrl(fallbackSrc);
    } else {
      // No fallback or fallback failed
      setError(true);
      if (onError) onError();
    }
  };
  
  // Handle empty URL or error cases
  if (!imageUrl || (error && !useFallback)) {
    return showPlaceholder ? renderPlaceholder() : null;
  }
  
  return (
    <img 
      src={imageUrl}
      alt={alt}
      className={cn(className)}
      onError={handleImageError}
      onLoad={() => {
        if (onLoad) onLoad();
      }}
    />
  );
};

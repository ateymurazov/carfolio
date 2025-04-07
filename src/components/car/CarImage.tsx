
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
  const imageStorage = useImageStorage();
  
  // Update image URL when imageId changes
  useEffect(() => {
    let isMounted = true;
    setError(false);
    
    if (!imageId || imageId.trim() === '') {
      if (isMounted) setImageUrl("");
      return;
    }
    
    // Handle external URLs that may fail
    if (imageId.startsWith('http')) {
      console.log(`Loading external image: ${imageId.substring(0, 50)}...`);
      // For external URLs, we'll set the URL but prepare for fallback
      if (isMounted) setImageUrl(imageId);
      return;
    }
    
    // Direct URL handling (data URLs or local files)
    if (imageId.startsWith('/') || imageId.startsWith('data:')) {
      if (isMounted) setImageUrl(imageId);
      return;
    }
    
    // Get from storage for image IDs
    const resolvedUrl = imageStorage.getImage(imageId);
    if (isMounted) setImageUrl(resolvedUrl);
    
    return () => {
      isMounted = false;
    };
  }, [imageId, imageStorage]);
  
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
    setError(true);
    if (onError) onError();
  };
  
  // Handle empty URL or error cases
  if (!imageUrl || error) {
    // Try fallback for external URLs
    if (error && imageUrl.startsWith('http') && fallbackSrc) {
      return (
        <img 
          src={fallbackSrc}
          alt={alt}
          className={cn(className)}
          onLoad={() => {
            if (onLoad) onLoad();
          }}
          onError={() => {
            // If even the fallback fails, show placeholder
            setError(true);
            if (onError) onError();
          }}
        />
      );
    }
    
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

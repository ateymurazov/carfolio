
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
  const [loaded, setLoaded] = useState(false);
  const imageStorage = useImageStorage();
  
  // Direct URL handling
  if (imageId && (imageId.startsWith('http') || imageId.startsWith('/') || imageId.startsWith('data:'))) {
    return (
      <img 
        src={imageId}
        alt={alt}
        className={cn(className)}
        onError={() => {
          setError(true);
          if (onError) onError();
        }}
        onLoad={() => {
          setLoaded(true);
          if (onLoad) onLoad();
        }}
      />
    );
  }
  
  // Empty or invalid ID handling
  if (!imageId || imageId.trim() === '') {
    if (!showPlaceholder) return null;
    
    return (
      <div className={cn(
        "flex items-center justify-center bg-gray-100",
        aspectRatio === "video" && "aspect-video",
        aspectRatio === "square" && "aspect-square",
        className
      )}>
        <ImageOff className="h-8 w-8 text-gray-400" />
      </div>
    );
  }
  
  // Image from storage
  const imageUrl = imageStorage.getImage(imageId);
  
  if (!imageUrl || imageUrl === '/placeholder.svg') {
    if (!showPlaceholder) return null;
    
    return (
      <div className={cn(
        "flex items-center justify-center bg-gray-100",
        aspectRatio === "video" && "aspect-video",
        aspectRatio === "square" && "aspect-square",
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
      className={className}
      onError={() => {
        setError(true);
        if (onError) onError();
      }}
      onLoad={() => {
        setLoaded(true);
        if (onLoad) onLoad();
      }}
    />
  );
};

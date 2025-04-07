
import React, { useState } from "react";
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
  const imageStorage = useImageStorage();
  
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
  
  // Handle empty or invalid ID
  if (!imageId || imageId.trim() === '' || error) {
    return showPlaceholder ? renderPlaceholder() : null;
  }
  
  // If the imageId is already a data URL, use it directly
  if (imageId.startsWith('data:')) {
    return (
      <img 
        src={imageId}
        alt={alt}
        className={className}
        onError={() => {
          setError(true);
          if (onError) onError();
        }}
        onLoad={() => {
          if (onLoad) onLoad();
        }}
      />
    );
  }
  
  // Get image from local storage for IDs
  const imageUrl = imageStorage.getImage(imageId);
  
  if (!imageUrl || imageUrl === '/placeholder.svg') {
    return showPlaceholder ? renderPlaceholder() : null;
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
        if (onLoad) onLoad();
      }}
    />
  );
};

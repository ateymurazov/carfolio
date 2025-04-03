
import { useState } from "react";

export interface ImageGalleryOptions {
  fallbackImage?: string;
}

/**
 * Custom hook for managing image gallery state
 */
export function useImageGallery(
  images: string[],
  options: ImageGalleryOptions = {}
) {
  const { fallbackImage = "/placeholder.svg" } = options;
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  // Filter out images with loading errors
  const validImages = images && images.length > 0
    ? images.filter((_, index) => !imageErrors[index])
    : [];
    
  // Use valid images or fallback
  const displayImages = validImages.length > 0 ? validImages : [fallbackImage];
  
  // Navigation handlers
  const handlePrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };
  
  const handleNext = () => {
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };
  
  // Error handling
  const handleImageError = (index: number) => {
    console.log(`Image error in gallery: index ${index}`);
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
    
    // Reset to first image or placeholder if current image fails
    if (index === currentImageIndex && displayImages.length > 1) {
      setCurrentImageIndex(0);
    }
  };
  
  return {
    currentImageIndex,
    setCurrentImageIndex,
    displayImages,
    handlePrevious,
    handleNext,
    handleImageError
  };
}

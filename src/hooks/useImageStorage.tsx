import { useState, useEffect } from "react";
import { useLocalStorageState } from "./useLocalStorageState";

interface ImageStorageOptions {
  compressionQuality?: number;
  maxWidth?: number;
}

/**
 * Hook for managing persistent image storage
 * This hook specifically focuses on handling images with better persistence and error recovery
 */
export function useImageStorage(options: ImageStorageOptions = {}) {
  const { compressionQuality = 0.7, maxWidth = 1920 } = options;
  
  // Store image data separately from car data to avoid localStorage size limits
  const [imageStore, setImageStore] = useLocalStorageState<Record<string, string>>(
    'carImageStore', 
    {}
  );
  
  // Debug info for development
  useEffect(() => {
    console.log(`Image store initialized with ${Object.keys(imageStore).length} images`);
  }, []);
  
  /**
   * Store an image in the image store
   */
  const storeImage = async (imageData: string): Promise<string> => {
    try {
      // Generate a unique ID for the image
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Optimize the image if it's a data URL
      let optimizedImage = imageData;
      if (imageData.startsWith('data:image')) {
        optimizedImage = await optimizeImage(imageData, compressionQuality, maxWidth);
      }
      
      // Update the image store
      setImageStore(prev => ({
        ...prev,
        [imageId]: optimizedImage
      }));
      
      console.log(`Stored image ${imageId}, size: ${Math.round(optimizedImage.length / 1024)}KB`);
      
      // Return the image ID which can be used to reference the image
      return imageId;
    } catch (error) {
      console.error("Failed to store image:", error);
      return imageData; // Fallback to original image data on error
    }
  };
  
  /**
   * Store multiple images at once
   */
  const storeImages = async (imageDatas: string[]): Promise<string[]> => {
    const imageIds: string[] = [];
    
    for (const imageData of imageDatas) {
      const imageId = await storeImage(imageData);
      imageIds.push(imageId);
    }
    
    return imageIds;
  };
  
  /**
   * Retrieve an image from the image store
   */
  const getImage = (imageId: string): string => {
    // If the imageId is already a data URL, return it directly
    if (imageId.startsWith('data:')) return imageId;
    
    // Otherwise try to retrieve from image store
    return imageStore[imageId] || imageId;
  };
  
  /**
   * Get multiple images at once
   */
  const getImages = (imageIds: string[]): string[] => {
    return imageIds.map(getImage);
  };
  
  /**
   * Remove an image from the image store
   */
  const removeImage = (imageId: string): void => {
    if (!imageStore[imageId]) return;
    
    setImageStore(prev => {
      const updated = { ...prev };
      delete updated[imageId];
      return updated;
    });
  };

  /**
   * Optimize an image for storage
   */
  const optimizeImage = (dataUrl: string, quality: number, maxWidth: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          if (!ctx) {
            resolve(dataUrl); // Fallback if context creation fails
            return;
          }
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // Log compression results
          console.log(`Image optimized: ${Math.round(dataUrl.length / 1024)}KB → ${Math.round(optimizedDataUrl.length / 1024)}KB`);
          
          resolve(optimizedDataUrl);
        };
        
        img.onerror = () => {
          console.warn("Failed to load image for optimization");
          resolve(dataUrl); // Return original on error
        };
        
        img.src = dataUrl;
      } catch (error) {
        console.error("Image optimization failed:", error);
        resolve(dataUrl); // Return original on error
      }
    });
  };
  
  return {
    storeImage,
    storeImages,
    getImage,
    getImages,
    removeImage,
    optimizeImage,
    imageStore
  };
}

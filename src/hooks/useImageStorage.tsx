
import { useState, useEffect } from "react";
import { useLocalStorageState } from "./useLocalStorageState";
import { toast } from "@/components/ui/use-toast";
import { optimizeImage } from "@/utils/imageUtils";

interface ImageStorageOptions {
  compressionQuality?: number;
  maxWidth?: number;
  maxStorageSize?: number; // MB
}

/**
 * Hook for managing persistent image storage
 */
export function useImageStorage(options: ImageStorageOptions = {}) {
  const { compressionQuality = 0.7, maxWidth = 1920, maxStorageSize = 50 } = options;
  
  // Store image data separately from car data to avoid localStorage size limits
  const [imageStore, setImageStore] = useLocalStorageState<Record<string, string>>(
    'carImageStore', 
    {}
  );
  
  // Track storage usage for monitoring
  const [storageUsage, setStorageUsage] = useState({ 
    size: 0, 
    count: 0,
    percentage: 0
  });
  
  // Calculate storage usage on init and when imageStore changes
  useEffect(() => {
    calculateStorageUsage();
  }, [imageStore, maxStorageSize]);
  
  // Calculate current storage usage
  const calculateStorageUsage = () => {
    try {
      // Get total size of images in MB
      let totalSize = 0;
      Object.values(imageStore).forEach(img => {
        totalSize += img.length * 2 / 1024 / 1024; // Approximate size in MB
      });
      
      const count = Object.keys(imageStore).length;
      const percentage = (totalSize / maxStorageSize) * 100;
      
      setStorageUsage({
        size: Math.round(totalSize * 100) / 100,
        count,
        percentage: Math.round(percentage)
      });
      
      console.log(`Image store: ${count} images, ${totalSize.toFixed(2)}MB (${percentage.toFixed(0)}% of limit)`);
      
      // Warn if approaching storage limit
      if (percentage > 80 && percentage < 90) {
        console.warn(`Image storage is at ${percentage.toFixed(0)}% of capacity`);
      } else if (percentage >= 90) {
        toast({
          title: "Storage Warning",
          description: `Image storage is at ${percentage.toFixed(0)}% of capacity. Consider removing unused images.`,
          variant: "destructive",
          duration: 8000
        });
      }
    } catch (error) {
      console.error("Error calculating storage usage:", error);
    }
  };
  
  /**
   * Store an image in the image store
   */
  const storeImage = async (imageData: string): Promise<string> => {
    try {
      // Skip if null/undefined
      if (!imageData) {
        throw new Error("No image data provided");
      }
      
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
      throw error;
    }
  };
  
  /**
   * Store multiple images at once
   */
  const storeImages = async (imageDatas: string[]): Promise<string[]> => {
    if (!imageDatas || !Array.isArray(imageDatas) || imageDatas.length === 0) {
      return [];
    }
    
    // Process images in batches to avoid blocking the UI
    const batchSize = 3;
    const results: string[] = [];
    
    for (let i = 0; i < imageDatas.length; i += batchSize) {
      const batch = imageDatas.slice(i, i + batchSize);
      const batchPromises = batch.filter(Boolean).map(img => storeImage(img));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  };
  
  /**
   * Retrieve an image from the image store
   */
  const getImage = (imageId: string): string => {
    try {
      // Handle invalid inputs
      if (!imageId) {
        console.warn("Empty image ID provided to getImage");
        return '/placeholder.svg';
      }
      
      // If the imageId is already a data URL, return it directly
      if (imageId.startsWith('data:')) return imageId;
      
      // If it's an external URL, return directly
      if (imageId.startsWith('http') || imageId.startsWith('/')) return imageId;
      
      // Otherwise try to retrieve from image store
      const image = imageStore[imageId];
      
      if (!image) {
        console.warn(`Image ${imageId} not found in storage`);
        return '/placeholder.svg'; // Fallback to placeholder
      }
      
      return image;
    } catch (error) {
      console.error(`Error retrieving image ${imageId}:`, error);
      return '/placeholder.svg';
    }
  };
  
  /**
   * Get multiple images at once
   */
  const getImages = (imageIds: string[]): string[] => {
    if (!imageIds || !Array.isArray(imageIds)) return [];
    return imageIds.map(getImage);
  };
  
  /**
   * Remove an image from the image store
   */
  const removeImage = (imageId: string): void => {
    if (!imageId) {
      console.warn("Empty image ID provided to removeImage");
      return;
    }
    
    if (!imageStore[imageId]) {
      console.warn(`Cannot remove image ${imageId}: not found in storage`);
      return;
    }
    
    setImageStore(prev => {
      const updated = { ...prev };
      delete updated[imageId];
      return updated;
    });
    
    console.log(`Removed image ${imageId} from storage`);
  };

  /**
   * Clean up unused images (not referenced by any car)
   */
  const cleanupUnusedImages = (usedImageIds: string[]) => {
    const unusedImages: string[] = [];
    
    // Find unused images
    Object.keys(imageStore).forEach(imageId => {
      if (!usedImageIds.includes(imageId)) {
        unusedImages.push(imageId);
      }
    });
    
    // Remove unused images if any
    if (unusedImages.length > 0) {
      setImageStore(prev => {
        const updated = { ...prev };
        unusedImages.forEach(id => {
          delete updated[id];
        });
        return updated;
      });
      
      console.log(`Cleaned up ${unusedImages.length} unused images`);
      return unusedImages.length;
    }
    
    return 0;
  };
  
  return {
    storeImage,
    storeImages,
    getImage,
    getImages,
    removeImage,
    cleanupUnusedImages,
    imageStore,
    storageUsage
  };
}

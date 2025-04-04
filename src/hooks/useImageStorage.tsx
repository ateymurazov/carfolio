import { useImageStorageCore } from "./useImageStorageCore";
import { optimizeImage } from "@/utils/imageUtils";
import { toast } from "@/components/ui/use-toast";

/**
 * Hook for managing persistent image storage
 */
export function useImageStorage(options = {}) {
  const { imageStore, setImageStore, storageUsage, options: storageOptions } = useImageStorageCore(options);
  
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
        optimizedImage = await optimizeImage(
          imageData, 
          storageOptions.compressionQuality, 
          storageOptions.maxWidth
        );
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

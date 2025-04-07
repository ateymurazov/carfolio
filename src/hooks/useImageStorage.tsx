
import { useImageStorageCore } from "./useImageStorageCore";
import { optimizeImage, validateImage } from "@/utils/imageUtils";
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
        console.warn("No image data provided to storeImage");
        return "";
      }
      
      // Generate a unique ID for the image
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Optimize the image if it's a data URL
      let optimizedImage = imageData;
      if (imageData.startsWith('data:image')) {
        try {
          optimizedImage = await optimizeImage(
            imageData, 
            storageOptions.compressionQuality, 
            storageOptions.maxWidth
          );
        } catch (error) {
          console.warn("Image optimization failed, using original:", error);
          optimizedImage = imageData; // Use original image if optimization fails
        }
      }
      
      // Update the image store with a new object to ensure state update
      setImageStore(prev => ({
        ...prev,
        [imageId]: optimizedImage
      }));
      
      console.log(`Image stored with ID: ${imageId}`);
      
      return imageId;
    } catch (error) {
      console.error("Failed to store image:", error);
      return "";
    }
  };
  
  /**
   * Store multiple images at once
   */
  const storeImages = async (imageDatas: string[]): Promise<string[]> => {
    if (!imageDatas || !Array.isArray(imageDatas) || imageDatas.length === 0) {
      return [];
    }
    
    const results: string[] = [];
    
    for (const img of imageDatas) {
      if (img) {
        try {
          const id = await storeImage(img);
          if (id) results.push(id);
        } catch (err) {
          console.error("Error storing image in batch:", err);
        }
      }
    }
    
    return results;
  };
  
  /**
   * Retrieve an image from the image store
   */
  const getImage = (imageId: string): string => {
    // Handle direct URLs (http, data URL, or local path)
    if (!imageId) {
      console.warn("Empty imageId provided to getImage");
      return fallbackImage();
    }
    
    if (typeof imageId !== 'string') {
      console.warn(`Invalid imageId type: ${typeof imageId}`);
      return fallbackImage();
    }
    
    if (imageId.startsWith('http') || imageId.startsWith('/') || imageId.startsWith('data:')) {
      return imageId;
    }
    
    // Invalid or empty imageId
    if (imageId.trim() === '') {
      console.warn(`Empty imageId string provided`);
      return fallbackImage();
    }
    
    // Try to retrieve from image store
    const image = imageStore[imageId];
    
    if (!image) {
      console.warn(`Image not found in storage: ${imageId}`);
      return fallbackImage();
    }
    
    return image;
  };
  
  const fallbackImage = (): string => {
    return '/placeholder.svg';
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
    if (!imageId || !imageStore[imageId]) {
      return;
    }
    
    setImageStore(prev => {
      const updated = { ...prev };
      delete updated[imageId];
      return updated;
    });
    
    console.log(`Image removed from storage: ${imageId}`);
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
    setImageStore,
    storageUsage
  };
}


import { useLocalStorageState } from "./useLocalStorageState";
import { useStorageUsage } from "./useStorageUsage";
import { optimizeImage } from "@/utils/imageOptimization";

interface ImageStorageOptions {
  compressionQuality?: number;
  maxWidth?: number;
  maxStorageSize?: number; // MB
}

export function useImageStorage(options: ImageStorageOptions = {}) {
  const { 
    compressionQuality = 0.7, 
    maxWidth = 1920, 
    maxStorageSize = 50 
  } = options;
  
  const [imageStore, setImageStore] = useLocalStorageState<Record<string, string>>(
    'carImageStore', 
    {}
  );
  
  const storageUsage = useStorageUsage(imageStore, maxStorageSize);
  
  const storeImage = async (imageData: string): Promise<string> => {
    try {
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      let optimizedImage = imageData;
      if (imageData.startsWith('data:image')) {
        optimizedImage = await optimizeImage(imageData, compressionQuality, maxWidth);
      }
      
      setImageStore(prev => ({
        ...prev,
        [imageId]: optimizedImage
      }));
      
      console.log(`Stored image ${imageId}, size: ${Math.round(optimizedImage.length / 1024)}KB`);
      return imageId;
    } catch (error) {
      console.error("Failed to store image:", error);
      throw error;
    }
  };
  
  const storeImages = async (imageDatas: string[]): Promise<string[]> => {
    const batchSize = 3;
    const results: string[] = [];
    
    for (let i = 0; i < imageDatas.length; i += batchSize) {
      const batch = imageDatas.slice(i, i + batchSize);
      const batchPromises = batch.map(img => storeImage(img));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  };
  
  const getImage = (imageId: string): string => {
    if (!imageId) {
      console.warn("No imageId provided to getImage");
      return '/placeholder.svg';
    }
    
    if (imageId.startsWith('data:')) return imageId;
    
    try {
      const image = imageStore[imageId];
      
      if (!image) {
        console.warn(`Image ${imageId} not found in storage`);
        return '/placeholder.svg';
      }
      
      return image;
    } catch (error) {
      console.error(`Error retrieving image ${imageId}:`, error);
      return '/placeholder.svg';
    }
  };
  
  const getImages = (imageIds: string[]): string[] => {
    if (!imageIds || !Array.isArray(imageIds)) return [];
    
    return imageIds.map(id => {
      try {
        return getImage(id);
      } catch (error) {
        console.error(`Error getting image ${id}:`, error);
        return '/placeholder.svg';
      }
    });
  };
  
  const removeImage = (imageId: string): void => {
    if (!imageId) {
      console.warn("No imageId provided to removeImage");
      return;
    }
    
    if (imageId.startsWith('data:')) {
      console.log("Cannot remove data URL image - not stored in image store");
      return;
    }
    
    if (!imageStore[imageId]) {
      console.warn(`Cannot remove image ${imageId}: not found in storage`);
      return;
    }
    
    try {
      setImageStore(prev => {
        const updated = { ...prev };
        delete updated[imageId];
        return updated;
      });
      
      console.log(`Removed image ${imageId} from storage`);
    } catch (error) {
      console.error(`Error removing image ${imageId}:`, error);
    }
  };
  
  const cleanupUnusedImages = (usedImageIds: string[]) => {
    const unusedImages = Object.keys(imageStore).filter(
      imageId => !usedImageIds.includes(imageId)
    );
    
    if (unusedImages.length > 0) {
      setImageStore(prev => {
        const updated = { ...prev };
        unusedImages.forEach(id => delete updated[id]);
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

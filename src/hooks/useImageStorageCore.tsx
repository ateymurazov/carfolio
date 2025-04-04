
import { useState, useEffect } from "react";
import { useLocalStorageState } from "./useLocalStorageState";
import { toast } from "@/components/ui/use-toast";

interface ImageStorageOptions {
  compressionQuality?: number;
  maxWidth?: number;
  maxStorageSize?: number; // MB
}

/**
 * Core hook for managing persistent image storage
 */
export function useImageStorageCore(options: ImageStorageOptions = {}) {
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
  
  return {
    imageStore, 
    setImageStore,
    storageUsage,
    options: { compressionQuality, maxWidth, maxStorageSize }
  };
}

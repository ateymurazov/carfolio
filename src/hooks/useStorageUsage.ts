
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface StorageUsage {
  size: number;
  count: number;
  percentage: number;
}

export const useStorageUsage = (
  imageStore: Record<string, string>,
  maxStorageSize: number
) => {
  const [storageUsage, setStorageUsage] = useState<StorageUsage>({ 
    size: 0, 
    count: 0,
    percentage: 0
  });

  useEffect(() => {
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
    
    calculateStorageUsage();
  }, [imageStore, maxStorageSize]);

  return storageUsage;
};

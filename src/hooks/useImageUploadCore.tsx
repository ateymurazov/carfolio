
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useImageStorage } from "./useImageStorage";
import { toast } from "@/components/ui/use-toast";

/**
 * Core functionality for the image upload hook
 */
export function useImageUploadCore(form: UseFormReturn<any>, fieldName: string = "images") {
  const [isProcessing, setIsProcessing] = useState(false);
  const imageStorage = useImageStorage();
  
  /**
   * Process files and store them in image storage
   */
  const processFiles = async (files: FileList): Promise<string[]> => {
    const filePromises: Promise<string>[] = [];
    
    // Process each file and create URL
    Array.from(files).forEach(file => {
      const promise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (e.target?.result) {
            const imageUrl = e.target.result.toString();
            
            try {
              // Store the image persistently and get an ID
              const storedImageId = await imageStorage.storeImage(imageUrl);
              resolve(storedImageId);
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = () => reject(new Error("File read error"));
        reader.readAsDataURL(file);
      });
      
      filePromises.push(promise);
    });
    
    // Wait for all images to be processed
    const processedFiles = await Promise.all(filePromises);
    
    // Filter out any undefined/null entries to ensure clean data
    return processedFiles.filter(Boolean);
  };
  
  /**
   * Update form with new image IDs
   */
  const updateFormImages = (imageIds: string[]) => {
    const currentImages = form.getValues(fieldName) || [];
    
    // Filter out any undefined/null entries to ensure clean data
    const allImages = [...currentImages.filter(Boolean), ...imageIds];
    
    form.setValue(fieldName, allImages, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    
    return allImages;
  };
  
  return {
    imageStorage,
    isProcessing,
    setIsProcessing,
    processFiles,
    updateFormImages,
  };
}

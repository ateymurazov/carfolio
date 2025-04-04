
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
    const totalFiles = files.length;
    
    if (totalFiles > 10) {
      toast({
        title: "Too many files",
        description: `Maximum 10 files can be uploaded at once. Processing first 10.`,
        variant: "warning"
      });
    }
    
    // Limit to 10 files to prevent UI freezing
    const filesToProcess = Math.min(totalFiles, 10);
    
    // Process each file and create URL
    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      
      // Skip non-image files
      if (!file.type.startsWith('image/')) {
        console.warn(`Skipping non-image file: ${file.name}`);
        continue;
      }
      
      // Skip files that are too large (10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`Skipping large file: ${file.name} (${Math.round(file.size/1024/1024)}MB)`);
        continue;
      }
      
      const promise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (e.target?.result) {
            const imageUrl = e.target.result.toString();
            
            try {
              // Store the image persistently and get an ID
              const storedImageId = await imageStorage.storeImage(imageUrl);
              console.log(`Successfully stored image: ${storedImageId}`);
              resolve(storedImageId);
            } catch (err) {
              console.error("Failed to store image:", err);
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
    }
    
    // Wait for all images to be processed
    try {
      const processedFiles = await Promise.all(filePromises);
      // Filter out any undefined/null entries to ensure clean data
      return processedFiles.filter(Boolean);
    } catch (error) {
      console.error("Error processing files:", error);
      return [];
    }
  };
  
  /**
   * Update form with new image IDs
   */
  const updateFormImages = (imageIds: string[]) => {
    try {
      const currentImages = form.getValues(fieldName) || [];
      
      // Filter out any undefined/null entries to ensure clean data
      const validCurrentImages = Array.isArray(currentImages) 
        ? currentImages.filter(Boolean) 
        : [];
      
      const allImages = [...validCurrentImages, ...imageIds];
      
      form.setValue(fieldName, allImages, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      
      console.log(`Form updated with ${allImages.length} images`);
      return allImages;
    } catch (error) {
      console.error("Error updating form images:", error);
      return form.getValues(fieldName) || [];
    }
  };
  
  return {
    imageStorage,
    isProcessing,
    setIsProcessing,
    processFiles,
    updateFormImages,
  };
}

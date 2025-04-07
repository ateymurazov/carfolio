
import { useState, useEffect, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { useImageUploadCore } from "./useImageUploadCore";
import { toast } from "@/components/ui/use-toast";

/**
 * Custom hook to manage image uploads and previews
 * @param form React Hook Form instance
 * @param fieldName Form field name for images
 * @returns Image management functions and state
 */
export function useImageUpload(form: UseFormReturn<any>, fieldName: string = "images") {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [syncInProgress, setSyncInProgress] = useState(false);
  
  const { 
    imageStorage, 
    isProcessing, 
    setIsProcessing,
    processFiles,
    updateFormImages
  } = useImageUploadCore(form, fieldName);
  
  // Sync previewUrls with form images when component mounts or changes
  const syncImages = useCallback(async () => {
    if (syncInProgress) return;
    
    try {
      setSyncInProgress(true);
      const currentImages = form.getValues(fieldName) || [];
      
      if (Array.isArray(currentImages) && currentImages.length > 0) {
        // Load images from storage if they're IDs
        const loadedImages = currentImages.filter(Boolean).map(img => {
          // Skip processing if already a data URL
          if (typeof img === 'string') {
            if (img.startsWith('data:')) {
              return img;
            }
            
            // Handle direct URLs
            if (img.startsWith('http') || img.startsWith('/')) {
              return img;
            }
            
            // Load from storage
            return imageStorage.getImage(img);
          }
          return '';
        }).filter(Boolean);
        
        setPreviewUrls(loadedImages);
      } else {
        setPreviewUrls([]);
      }
    } catch (error) {
      console.error("Error syncing images:", error);
    } finally {
      setSyncInProgress(false);
    }
  }, [form, fieldName, imageStorage, syncInProgress]);
  
  useEffect(() => {
    let isMounted = true;
    
    syncImages();
    
    // Watch for changes to the images field
    const subscription = form.watch((value, { name }) => {
      if (name === fieldName && isMounted) {
        // Use a small timeout to batch multiple changes
        setTimeout(() => {
          if (isMounted) {
            syncImages();
          }
        }, 50);
      }
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [form, fieldName, syncImages]);
  
  /**
   * Handle image file selection
   */
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Process the files
      const validFiles = await processFiles(files);
      
      // Update the form with all images
      const allImages = updateFormImages(validFiles);
      
      // Success toast only if files were processed
      if (validFiles.length > 0) {
        toast({
          title: "Images processed",
          description: `Successfully added ${validFiles.length} image${validFiles.length > 1 ? 's' : ''}`,
        });
        
        // Force sync after update
        setTimeout(() => syncImages(), 100);
      }
    } catch (error) {
      console.error("Error processing images:", error);
      toast({
        title: "Error uploading images",
        description: "Some images could not be processed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Remove an image at specified index
   */
  const removeImage = (index: number) => {
    const currentImages = form.getValues(fieldName) || [];
    if (!Array.isArray(currentImages)) {
      console.error(`${fieldName} is not an array`, currentImages);
      return;
    }
    
    // Get the image ID to remove from storage
    const imageToRemove = currentImages[index];
    if (imageToRemove && typeof imageToRemove === 'string' && !imageToRemove.startsWith('data:') && 
        !imageToRemove.startsWith('http') && !imageToRemove.startsWith('/')) {
      // Only remove from imageStorage if it's an ID (not a data URL or direct URL)
      try {
        imageStorage.removeImage(imageToRemove);
      } catch (error) {
        console.error("Error removing image from storage:", error);
      }
    }
    
    const updatedImages = [...currentImages];
    updatedImages.splice(index, 1);
    
    // Update form value
    form.setValue(fieldName, updatedImages, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    
    // Force sync after update for immediate feedback
    setTimeout(() => syncImages(), 50);
    
    toast({
      title: "Image removed",
      description: `Image was successfully removed.`,
      duration: 2000,
    });
  };

  return {
    previewUrls,
    handleImageChange,
    removeImage,
    isProcessing
  };
}

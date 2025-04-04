
import { useState, useEffect } from "react";
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
  const { 
    imageStorage, 
    isProcessing, 
    setIsProcessing,
    processFiles,
    updateFormImages
  } = useImageUploadCore(form, fieldName);
  
  // Sync previewUrls with form images when component mounts or changes
  useEffect(() => {
    let isMounted = true;
    
    const syncImages = async () => {
      try {
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
          
          if (isMounted) {
            setPreviewUrls(loadedImages);
          }
        } else {
          if (isMounted) {
            setPreviewUrls([]);
          }
        }
      } catch (error) {
        console.error("Error syncing images:", error);
      }
    };
    
    syncImages();
    
    // Watch for changes to the images field
    const subscription = form.watch((value, { name }) => {
      if (name === fieldName && isMounted) {
        syncImages();
      }
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [form, fieldName, imageStorage]);
  
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
      
      // Update preview with actual image data for display
      const previewImages = allImages.map(img => 
        typeof img === 'string' && !img.startsWith('data:') && !img.startsWith('http') && !img.startsWith('/')
          ? imageStorage.getImage(img) 
          : img
      ).filter(Boolean);
      
      setPreviewUrls(previewImages);
      
      // Success toast
      if (validFiles.length > 0) {
        toast({
          title: "Images processed",
          description: `Successfully added ${validFiles.length} image${validFiles.length > 1 ? 's' : ''}`,
        });
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
    
    // Update preview URLs
    const previewImages = updatedImages.map(img => 
      typeof img === 'string' && !img.startsWith('data:') && !img.startsWith('http') && !img.startsWith('/')
        ? imageStorage.getImage(img) 
        : img
    ).filter(Boolean);
    
    setPreviewUrls(previewImages);
    
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

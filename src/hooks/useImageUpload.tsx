
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useImageStorage } from "./useImageStorage";
import { toast } from "@/components/ui/use-toast";

/**
 * Custom hook to manage image uploads and previews
 * @param form React Hook Form instance
 * @param fieldName Form field name for images
 * @returns Image management functions and state
 */
export function useImageUpload(form: UseFormReturn<any>, fieldName: string = "images") {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const imageStorage = useImageStorage();
  
  // Sync previewUrls with form images when component mounts
  useEffect(() => {
    const currentImages = form.getValues(fieldName) || [];
    if (Array.isArray(currentImages) && currentImages.length > 0) {
      // Load images from storage if they're IDs
      const loadedImages = currentImages.map(img => 
        typeof img === 'string' && !img.startsWith('data:') 
          ? imageStorage.getImage(img) 
          : img
      );
      setPreviewUrls(loadedImages);
      console.log(`Initialized ${fieldName} with ${loadedImages.length} images`);
    }
  }, [form, fieldName, imageStorage]);
  
  /**
   * Handle image file selection
   */
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Show loading toast for many images
    let loadingToast;
    if (files.length > 3) {
      loadingToast = toast({
        title: "Processing images",
        description: `Optimizing ${files.length} images, please wait...`,
      });
    }
    
    try {
      const currentImages = form.getValues(fieldName) || [];
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
      
      // Update the form with all images
      const allImages = [...currentImages, ...processedFiles];
      form.setValue(fieldName, allImages, {
        shouldValidate: true,
        shouldDirty: true,
      });
      
      // Update preview with actual image data for display
      const previewImages = allImages.map(img => 
        typeof img === 'string' && !img.startsWith('data:') 
          ? imageStorage.getImage(img) 
          : img
      );
      setPreviewUrls(previewImages);
      
      console.log(`Updated ${fieldName} with ${allImages.length} images`, allImages);
      
      // Dismiss loading toast if it exists
      if (loadingToast) {
        toast({
          title: "Images processed",
          description: `Successfully added ${files.length} images`,
        });
      }
    } catch (error) {
      console.error("Error processing images:", error);
      toast({
        title: "Error uploading images",
        description: "Some images could not be processed. Please try again.",
        variant: "destructive"
      });
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
    if (imageToRemove && typeof imageToRemove === 'string' && !imageToRemove.startsWith('data:')) {
      // Only remove from imageStorage if it's an ID (not a data URL)
      imageStorage.removeImage(imageToRemove);
    }
    
    const updatedImages = [...currentImages];
    updatedImages.splice(index, 1);
    
    // Update form value
    form.setValue(fieldName, updatedImages, {
      shouldValidate: true,
      shouldDirty: true,
    });
    
    // Update preview URLs
    const previewImages = updatedImages.map(img => 
      typeof img === 'string' && !img.startsWith('data:') 
        ? imageStorage.getImage(img) 
        : img
    );
    setPreviewUrls(previewImages);
    
    console.log(`Removed image at index ${index}, ${updatedImages.length} remaining`);
    
    toast({
      title: "Image removed",
      description: `Image removed successfully. ${updatedImages.length} remaining.`,
    });
  };

  return {
    previewUrls,
    handleImageChange,
    removeImage
  };
}

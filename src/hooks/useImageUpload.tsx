
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useImageStorage } from "./useImageStorage";

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
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const currentImages = form.getValues(fieldName) || [];
    const processedFiles: string[] = [];
    const totalFiles = files.length;
    
    // Process each file and create URL
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const imageUrl = e.target.result.toString();
          
          // Store the image persistently and get an ID
          const storedImageId = await imageStorage.storeImage(imageUrl);
          processedFiles.push(storedImageId);
          
          // Update preview URLs and form value atomically when all files are processed
          if (processedFiles.length === totalFiles) {
            const allImages = [...currentImages, ...processedFiles];
            
            // Update the form with all images
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
          }
        }
      };
      reader.readAsDataURL(file);
    });
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
  };

  return {
    previewUrls,
    handleImageChange,
    removeImage
  };
}

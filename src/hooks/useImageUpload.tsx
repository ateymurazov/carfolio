
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

/**
 * Custom hook to manage image uploads and previews
 * @param form React Hook Form instance
 * @param fieldName Form field name for images
 * @returns Image management functions and state
 */
export function useImageUpload(form: UseFormReturn<any>, fieldName: string = "images") {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Sync previewUrls with form images when component mounts
  useEffect(() => {
    const currentImages = form.getValues(fieldName) || [];
    if (Array.isArray(currentImages) && currentImages.length > 0) {
      setPreviewUrls(currentImages);
      console.log(`Initialized ${fieldName} with ${currentImages.length} images`);
    }
  }, [form, fieldName]);
  
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
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageUrl = e.target.result.toString();
          processedFiles.push(imageUrl);
          
          // Update preview URLs and form value atomically when all files are processed
          if (processedFiles.length === totalFiles) {
            const allImages = [...currentImages, ...processedFiles];
            
            // Update the form with all images
            form.setValue(fieldName, allImages, {
              shouldValidate: true,
              shouldDirty: true,
            });
            
            // Update preview separately
            setPreviewUrls(allImages);
            
            console.log(`Updated ${fieldName} with ${allImages.length} images`);
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
    
    const updatedImages = [...currentImages];
    updatedImages.splice(index, 1);
    
    // Update form value
    form.setValue(fieldName, updatedImages, {
      shouldValidate: true,
      shouldDirty: true,
    });
    
    // Update preview URLs
    setPreviewUrls(updatedImages);
    
    console.log(`Removed image at index ${index}, ${updatedImages.length} remaining`);
  };

  return {
    previewUrls,
    handleImageChange,
    removeImage
  };
}


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
    setPreviewUrls(currentImages);
  }, [form, fieldName]);
  
  /**
   * Handle image file selection
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const currentImages = form.getValues(fieldName) || [];
    
    // Process each file and create URL
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageUrl = e.target.result.toString();
          
          // Update preview URLs and form value
          setPreviewUrls(prev => {
            const updated = [...prev, imageUrl];
            
            // Update form value with ALL images
            form.setValue(fieldName, [...currentImages, imageUrl], {
              shouldValidate: true,
              shouldDirty: true,
            });
            
            return updated;
          });
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
    const updatedImages = [...currentImages];
    updatedImages.splice(index, 1);
    
    // Update form value
    form.setValue(fieldName, updatedImages, {
      shouldValidate: true,
      shouldDirty: true,
    });
    
    // Update preview URLs
    setPreviewUrls(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  return {
    previewUrls,
    handleImageChange,
    removeImage
  };
}


import React, { useState, useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { ImagePlus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface ImageUploadFieldProps {
  form: UseFormReturn<any>;
}

export const ImageUploadField = ({ form }: ImageUploadFieldProps) => {
  // Initialize previewUrls based on form values
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Sync previewUrls with form.images when the component mounts
  useEffect(() => {
    const currentImages = form.getValues("images") || [];
    setPreviewUrls(currentImages);
  }, [form]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const currentImages = form.getValues("images") || [];
    const newImageUrls: string[] = [];
    
    // Process each file and create URL
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageUrl = e.target.result.toString();
          newImageUrls.push(imageUrl);
          
          // Update preview URLs
          setPreviewUrls(prev => {
            const updated = [...prev, imageUrl];
            
            // Update form value with ALL images
            form.setValue("images", [...currentImages, imageUrl], {
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
  
  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    const updatedImages = [...currentImages];
    updatedImages.splice(index, 1);
    
    // Update form value
    form.setValue("images", updatedImages, {
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
  
  return (
    <FormField
      control={form.control}
      name="images"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Car Images</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(field.value || []).map((url: string, index: number) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-secondary rounded-md overflow-hidden">
                      <img 
                        src={url} 
                        alt={`Car image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log(`Image error for index ${index}, url length: ${url.length}`);
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center aspect-video bg-muted text-muted-foreground rounded-md border-2 border-dashed cursor-pointer hover:bg-muted/80 transition-colors">
                  <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-sm font-medium">Add image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <div className="text-xs text-muted-foreground">
                You can upload multiple images of the car. Click on an image to remove it.
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

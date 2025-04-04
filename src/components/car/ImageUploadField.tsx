
import React, { useCallback } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useImageStorage } from "@/hooks/useImageStorage";
import { toast } from "../ui/use-toast";

interface ImageUploadFieldProps {
  form: UseFormReturn<any>;
}

export const ImageUploadField = ({ form }: ImageUploadFieldProps) => {
  const { handleImageChange, removeImage, previewUrls } = useImageUpload(form, "images");
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = true;
      fileInput.files = e.dataTransfer.files;
      handleImageChange({ target: fileInput } as any);
    }
  }, [handleImageChange]);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleBulkUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      if (e.target.files && e.target.files.length > 0) {
        handleImageChange(e);
        toast({
          title: "Images uploaded",
          description: `${e.target.files.length} image${e.target.files.length > 1 ? 's' : ''} added`,
        });
      }
    };
    input.click();
  }, [handleImageChange]);
  
  return (
    <FormField
      control={form.control}
      name="images"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Car Images</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkUpload}
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Images
                </Button>
              </div>
              
              <div 
                className="border-2 border-dashed rounded-md p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewUrls.map((url: string, index: number) => (
                    <div key={index} className="relative group aspect-video">
                      <div className="w-full h-full bg-secondary rounded-md overflow-hidden">
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
              </div>
              <div className="text-xs text-muted-foreground">
                Drag and drop images here or click to upload. You can upload multiple images at once.
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

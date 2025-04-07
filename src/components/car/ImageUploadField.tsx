
import React, { useCallback, useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "../ui/use-toast";
import { CarImage } from "./CarImage";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  form: UseFormReturn<any>;
}

export const ImageUploadField = ({ form }: ImageUploadFieldProps) => {
  const { handleImageChange, removeImage, previewUrls, isProcessing } = useImageUpload(form, "images");
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
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
    setDragActive(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
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
          title: "Images uploading",
          description: `Processing ${e.target.files.length} image${e.target.files.length > 1 ? 's' : ''}...`,
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
                  disabled={isProcessing}
                >
                  <Upload className="mr-2 h-4 w-4" /> 
                  {isProcessing ? "Processing..." : "Upload Images"}
                </Button>
              </div>
              
              <div 
                className={cn(
                  "border-2 border-dashed rounded-md p-4 bg-muted/30 transition-colors",
                  dragActive ? "border-primary bg-primary/10" : "hover:bg-muted/50",
                  isProcessing ? "opacity-70" : ""
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewUrls.map((url: string, index: number) => (
                    <div key={`preview-${index}-${url.substring(0, 8)}`} className="relative group aspect-video">
                      <div className="w-full h-full bg-secondary rounded-md overflow-hidden">
                        <CarImage 
                          imageId={url}
                          alt={`Car image ${index + 1}`}
                          className="w-full h-full object-cover"
                          fallbackSrc="/placeholder.svg"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <label className={cn(
                    "flex flex-col items-center justify-center aspect-video bg-muted text-muted-foreground rounded-md border-2 border-dashed cursor-pointer transition-colors",
                    isProcessing ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/80"
                  )}>
                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-sm font-medium">
                        {isProcessing ? "Processing..." : "Add image"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isProcessing}
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
}

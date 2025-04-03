
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { ImagePlus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ImageUploadFieldProps {
  form: UseFormReturn<any>;
}

export const ImageUploadField = ({ form }: ImageUploadFieldProps) => {
  const { handleImageChange, removeImage } = useImageUpload(form, "images");
  
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

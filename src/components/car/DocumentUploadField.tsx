
import React, { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { File, Trash2, FileUp } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface DocumentUploadFieldProps {
  form: UseFormReturn<any>;
}

interface Document {
  name: string;
  url: string;
}

export const DocumentUploadField = ({ form }: DocumentUploadFieldProps) => {
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const currentDocs = form.getValues("documents") || [];
    const newDocs: Document[] = [];
    
    // Process each file and create URL
    Array.from(files).forEach(file => {
      // In a real app, we would upload the file to a server and get back a URL
      // Here we'll simulate this by creating a data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          // Create a document object with name and URL
          const doc: Document = {
            name: file.name,
            url: e.target.result.toString()
          };
          
          newDocs.push(doc);
          
          // Update form value
          form.setValue("documents", [...currentDocs, ...newDocs], {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removeDocument = (index: number) => {
    const currentDocs = form.getValues("documents") || [];
    const updatedDocs = [...currentDocs];
    updatedDocs.splice(index, 1);
    
    // Update form value
    form.setValue("documents", updatedDocs, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };
  
  return (
    <FormField
      control={form.control}
      name="documents"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Car Documents</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                {(field.value || []).map((doc: Document, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-md group">
                    <div className="flex items-center gap-2">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium truncate max-w-[200px]">{doc.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeDocument(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="mt-2">
                  <label className="flex items-center justify-center w-full p-3 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      <FileUp className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Upload documents</span>
                    </div>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleDocumentChange}
                    />
                  </label>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Supported formats include PDF, DOC, DOCX, and other document types.
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

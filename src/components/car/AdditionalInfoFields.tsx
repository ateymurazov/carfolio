
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface AdditionalInfoFieldsProps {
  form: UseFormReturn<any>;
}

export const AdditionalInfoFields = ({ form }: AdditionalInfoFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="registration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration</FormLabel>
              <FormControl>
                <Input placeholder="e.g. ABC123456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Plate</FormLabel>
              <FormControl>
                <Input placeholder="e.g. ABC123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="numberOfKeys"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Keys</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g. 2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="owner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Owner</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

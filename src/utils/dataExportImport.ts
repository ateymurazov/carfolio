
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { saveToStore, saveBackup } from "./indexedDBUtils";

export type ExportedData = {
  cars: Car[];
  collections: Collection[];
  exportDate: string;
  version: string;
};

/**
 * Exports car and collection data to a JSON file for download
 */
export function exportDataToJson(cars: Car[], collections: Collection[]): void {
  try {
    // Prepare the data object to be exported
    const exportData: ExportedData = {
      cars,
      collections,
      exportDate: new Date().toISOString(),
      version: "1.0" // Version of the export format, useful for future compatibility
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob with the JSON data
    const blob = new Blob([jsonString], { type: "application/json" });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.download = `car-collection-export-${new Date().toLocaleDateString().replace(/\//g, "-")}.json`;
    
    // Append to the document, trigger click, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Also save to IndexedDB as a backup
    saveBackup(cars, collections);
    
    console.log("Data exported successfully");
  } catch (error) {
    console.error("Failed to export data:", error);
    throw new Error("Failed to export data");
  }
}

/**
 * Validates and parses a JSON file for importing car and collection data
 */
export function parseImportedJson(file: File): Promise<ExportedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error("Failed to read file"));
          return;
        }
        
        const jsonData = JSON.parse(event.target.result as string) as unknown;
        
        // Validate the imported data has the expected structure
        if (!isValidExportData(jsonData)) {
          reject(new Error("Invalid data format in the uploaded file"));
          return;
        }
        
        // Save a backup of the imported data to IndexedDB
        if (jsonData.cars && jsonData.collections) {
          saveToStore("cars", jsonData.cars);
          saveToStore("collections", jsonData.collections);
          saveBackup(jsonData.cars, jsonData.collections);
        }
        
        resolve(jsonData);
      } catch (error) {
        console.error("Error parsing imported JSON:", error);
        reject(new Error("Failed to parse the imported file. Please ensure it's a valid JSON file."));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Type guard to validate the structure of the imported data
 */
function isValidExportData(data: unknown): data is ExportedData {
  if (!data || typeof data !== 'object') return false;
  
  const exportData = data as Partial<ExportedData>;
  
  // Check if required fields exist
  if (!Array.isArray(exportData.cars) || !Array.isArray(exportData.collections)) {
    return false;
  }
  
  // Check if cars have the minimum required fields
  if (exportData.cars.some(car => !car.id || !car.make || !car.model)) {
    return false;
  }
  
  // Check if collections have the minimum required fields
  if (exportData.collections.some(collection => !collection.id || !collection.name)) {
    return false;
  }
  
  return true;
}

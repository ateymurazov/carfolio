
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { toast } from "@/components/ui/use-toast";

export type BackupData = {
  cars: Car[];
  collections: Collection[];
  images: Record<string, string>;
  timestamp: string;
  version: string;
};

/**
 * Creates a comprehensive backup of all application data
 * @param cars Array of car objects
 * @param collections Array of collection objects
 * @param imageStore The image storage object
 * @returns Backup data object containing all application data
 */
export function createBackupData(
  cars: Car[], 
  collections: Collection[],
  imageStore: Record<string, string>
): BackupData {
  return {
    cars,
    collections,
    images: imageStore,
    timestamp: new Date().toISOString(),
    version: "1.0"
  };
}

/**
 * Downloads backup data as a JSON file
 * @param backupData The backup data to download
 * @param fileNamePrefix Prefix for the backup file name
 * @returns boolean indicating success
 */
export function downloadBackupData(
  backupData: BackupData, 
  fileNamePrefix = "car-inventory-backup"
): boolean {
  try {
    // Convert to JSON string with pretty formatting
    const jsonData = JSON.stringify(backupData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Setup the download link
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `${fileNamePrefix}-${date}.json`;
    
    // Trigger download and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Backup download failed:", error);
    return false;
  }
}

/**
 * Creates and downloads a complete backup of application data
 * @param cars Array of car objects
 * @param collections Array of collection objects
 * @param imageStore The image storage object
 * @param fileNamePrefix Optional prefix for the backup file name
 * @returns boolean indicating success
 */
export function createAndDownloadBackup(
  cars: Car[], 
  collections: Collection[],
  imageStore: Record<string, string>,
  fileNamePrefix = "car-inventory-backup"
): boolean {
  try {
    const backupData = createBackupData(cars, collections, imageStore);
    const success = downloadBackupData(backupData, fileNamePrefix);
    
    if (success) {
      toast({
        title: "Backup Created",
        description: "Your data has been backed up successfully.",
      });
      return true;
    } else {
      toast({
        title: "Backup Failed",
        description: "There was an error creating your backup.",
        variant: "destructive"
      });
      return false;
    }
  } catch (error) {
    console.error("Backup failed:", error);
    toast({
      title: "Backup Failed",
      description: "There was an error creating your backup.",
      variant: "destructive"
    });
    return false;
  }
}

/**
 * Validates and parses a backup file
 * @param file The backup file to parse
 * @returns Promise resolving to the parsed backup data
 */
export function parseBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error("Failed to read file"));
          return;
        }
        
        const jsonData = JSON.parse(event.target.result as string) as unknown;
        
        // Validate the backup data has the expected structure
        if (!isValidBackupData(jsonData)) {
          reject(new Error("Invalid data format in the uploaded file"));
          return;
        }
        
        resolve(jsonData);
      } catch (error) {
        console.error("Error parsing backup file:", error);
        reject(new Error("Failed to parse the backup file. Please ensure it's a valid JSON file."));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Type guard to validate the structure of backup data
 */
function isValidBackupData(data: unknown): data is BackupData {
  if (!data || typeof data !== 'object') return false;
  
  const backupData = data as Partial<BackupData>;
  
  // Check if required fields exist
  if (!Array.isArray(backupData.cars) || !Array.isArray(backupData.collections)) {
    return false;
  }
  
  // Check if cars have the minimum required fields
  if (backupData.cars.some(car => !car.id || !car.make || !car.model)) {
    return false;
  }
  
  // Check if collections have the minimum required fields
  if (backupData.collections.some(collection => !collection.id || !collection.name)) {
    return false;
  }
  
  // Check if images are in the expected format (could be empty)
  const imagesObj = backupData.images;
  if (imagesObj !== undefined && (typeof imagesObj !== 'object' || imagesObj === null)) {
    return false;
  }
  
  return true;
}

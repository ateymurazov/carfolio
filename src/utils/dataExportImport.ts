
import { Car } from "@/types/car";
import { Collection } from "@/types/collection";
import { inspectLocalStorage } from "./localStorageUtils";
import { BackupData, createAndDownloadBackup, parseBackupFile } from "./backupUtils";

/**
 * Exports car and collection data to a JSON file for download
 */
export function exportDataToJson(cars: Car[], collections: Collection[], imageStore: Record<string, string>): void {
  createAndDownloadBackup(cars, collections, imageStore, "car-collection-export");
}

/**
 * Validates and parses a JSON file for importing car and collection data
 */
export function parseImportedJson(file: File): Promise<BackupData> {
  return parseBackupFile(file);
}


import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircle, Download, Upload, Database } from "lucide-react";
import { useCarCollections } from "@/hooks/useCarCollections";
import { exportDataToJson, parseImportedJson } from "@/utils/dataExportImport";
import { clearLocalStorage, inspectLocalStorage } from "@/utils/localStorageUtils";
import { useCarStorage } from "@/hooks/useCarStorage";
import { useImageStorage } from "@/hooks/useImageStorage";

const Settings = () => {
  const { cars, collections, mergeImportedData } = useCarCollections();
  const { backupData } = useCarStorage();
  const { imageStore, setImageStore } = useImageStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  // Handle data export
  const handleExportData = () => {
    try {
      exportDataToJson(cars, collections, imageStore);
      toast({
        title: "Data exported successfully",
        description: "Your collection data has been exported to a JSON file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was a problem exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Create a quick backup
  const handleBackupData = () => {
    backupData();
  };

  // Trigger file input click
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection for import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    
    try {
      const importedData = await parseImportedJson(file);
      
      // Ask for confirmation before merging data
      if (window.confirm(
        `This will import ${importedData.cars.length} cars and ${importedData.collections.length} collections. Any existing data with the same IDs will be updated. Do you want to continue?`
      )) {
        // Create automatic backup before import
        backupData();
        
        // Merge imported data with existing data instead of replacing
        mergeImportedData(importedData.cars, importedData.collections);
        
        // Handle image data import if it exists
        if (importedData.images && Object.keys(importedData.images).length > 0) {
          setImageStore(prevImages => ({
            ...prevImages,
            ...importedData.images
          }));
          toast({
            title: "Images imported",
            description: `Imported ${Object.keys(importedData.images).length} images.`,
          });
        }
        
        toast({
          title: "Data imported successfully",
          description: `Merged ${importedData.cars.length} cars and ${importedData.collections.length} collections with your existing data.`,
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import data.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle clearing local storage data
  const handleClearCache = () => {
    if (window.confirm("This will clear all data from the application cache. This action cannot be undone. Are you sure you want to continue?")) {
      // Create automatic backup before clearing
      backupData();
      
      clearLocalStorage();
      toast({
        title: "Cache cleared",
        description: "All cached data has been cleared. A backup file was automatically downloaded.",
      });
      // Need to refresh to reinitialize the app state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences.
        </p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage general application settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                General settings will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Safely manage your car collection data with backup and restore options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Backup & Restore</h4>
                <p className="text-sm text-muted-foreground">
                  Regularly backup your data to prevent accidental loss. All sensitive operations automatically create backups.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  <Button
                    variant="outline" 
                    onClick={handleBackupData}
                    className="flex items-center justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" /> Quick Backup
                  </Button>
                  <Button
                    variant="outline" 
                    onClick={handleExportData}
                    className="flex items-center justify-start"
                  >
                    <Database className="h-4 w-4 mr-2" /> Export Full Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleImportClick}
                    disabled={importing}
                    className="flex items-center justify-start"
                  >
                    <Upload className="h-4 w-4 mr-2" /> {importing ? "Importing..." : "Import Data"}
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".json"
                    style={{ display: 'none' }}
                  />
                </div>
                
                <Alert className="mt-4 bg-blue-50">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Auto-Backup Protection</AlertTitle>
                  <AlertDescription>
                    Your data is automatically backed up before any potentially destructive operation like resetting or clearing cache.
                  </AlertDescription>
                </Alert>
              </div>
              
              <div className="space-y-3 pt-4">
                <h4 className="font-medium">Application Cache</h4>
                <p className="text-sm text-muted-foreground">
                  Manage application cached data.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={handleClearCache}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear Cache
                  </Button>
                </div>
                
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Clearing the cache will remove all locally stored data. A backup will be automatically created before proceeding.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the appearance of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Appearance customization features will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage your notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Notification management features will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

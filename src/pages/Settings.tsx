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
import { InfoIcon, AlertCircle } from "lucide-react";
import { useCarCollections } from "@/hooks/useCarCollections";
import { exportDataToJson, parseImportedJson } from "@/utils/dataExportImport";
import { clearLocalStorage, inspectLocalStorage } from "@/utils/localStorageUtils";

const Settings = () => {
  const { cars, collections, mergeImportedData } = useCarCollections();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  // Handle data export
  const handleExportData = () => {
    try {
      exportDataToJson(cars, collections);
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
        // Merge imported data with existing data instead of replacing
        mergeImportedData(importedData.cars, importedData.collections);
        
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
      clearLocalStorage();
      toast({
        title: "Cache cleared",
        description: "All cached data has been cleared. Please refresh the page.",
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
          <TabsTrigger value="account">Account</TabsTrigger>
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
              <div className="space-y-3">
                <h4 className="font-medium">Data Management</h4>
                <p className="text-sm text-muted-foreground">
                  Export or import your car collection data.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    variant="outline" 
                    onClick={handleExportData}
                  >
                    Export Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleImportClick}
                    disabled={importing}
                  >
                    {importing ? "Importing..." : "Import Data"}
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
                  <AlertTitle>Data Backup Tips</AlertTitle>
                  <AlertDescription>
                    Regularly export your data to prevent accidental loss. Import previously exported files to restore your collections.
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
                  >
                    Clear Cache
                  </Button>
                </div>
                
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Clearing the cache will remove all locally stored data. Make sure to export your data before proceeding.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account details and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Account management features will be available in a future update.
              </p>
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

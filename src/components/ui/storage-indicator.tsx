
import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function StorageUsageIndicator() {
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    // Check for storage warnings in console logs
    const originalConsoleWarn = console.warn;
    
    console.warn = function(...args) {
      const warningMessage = args.join(' ');
      if (warningMessage.includes('Storage usage high')) {
        setShowAlert(true);
      }
      originalConsoleWarn.apply(console, args);
    };
    
    return () => {
      console.warn = originalConsoleWarn;
    };
  }, []);
  
  if (!showAlert) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Storage Warning</AlertTitle>
      <AlertDescription>
        Your browser storage is running low. We've switched to a more robust storage system.
        Your data is safe and being migrated automatically.
      </AlertDescription>
    </Alert>
  );
}


import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Data recovery check before rendering
const attemptDataRecovery = () => {
  // Check for auto-backup data
  const autoBackup = localStorage.getItem('autoBackup_beforeReset');
  
  if (autoBackup) {
    try {
      const backupData = JSON.parse(autoBackup);
      const timestamp = new Date(backupData.timestamp);
      const now = new Date();
      
      // Only use auto-backup if it's recent (less than 24 hours old)
      const isRecent = (now.getTime() - timestamp.getTime()) < (24 * 60 * 60 * 1000);
      
      if (isRecent) {
        console.log("Found recent auto-backup, checking if data recovery is needed");
        
        // Check if we're missing primary data
        const missingCars = !localStorage.getItem('cars');
        const missingCollections = !localStorage.getItem('collections');
        const missingImageStore = !localStorage.getItem('carImageStore');
        
        if (missingCars && backupData.cars) {
          console.log("Recovering cars from auto-backup");
          localStorage.setItem('cars', JSON.stringify(backupData.cars));
        }
        
        if (missingCollections && backupData.collections) {
          console.log("Recovering collections from auto-backup");
          localStorage.setItem('collections', JSON.stringify(backupData.collections));
        }
        
        if (missingImageStore && backupData.images) {
          console.log("Recovering image store from auto-backup");
          localStorage.setItem('carImageStore', JSON.stringify(backupData.images));
        }
      }
    } catch (e) {
      console.error("Failed to process auto-backup:", e);
    }
  }
};

// Run recovery attempt before rendering the app
attemptDataRecovery();

createRoot(document.getElementById("root")!).render(<App />);

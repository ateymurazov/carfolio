
import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface NetworkStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  showToast?: boolean;
}

export function NetworkStatusIndicator({ 
  className = "", 
  showLabel = true,
  showToast = true
}: NetworkStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (showToast) {
        toast({
          title: "You're back online",
          description: "Your changes will now sync with the server."
        });
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      if (showToast) {
        toast({
          title: "You're offline",
          description: "Working with local data. Changes will sync when you're back online.",
          variant: "destructive"
        });
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`flex items-center rounded-full px-2 py-1 ${
        isOnline ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            {showLabel && <span className="ml-1 text-xs">Online</span>}
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            {showLabel && <span className="ml-1 text-xs">Offline</span>}
          </>
        )}
      </div>
    </div>
  );
}

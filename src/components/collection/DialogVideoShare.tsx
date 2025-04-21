
import React, { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Facebook, Twitter, Instagram, Youtube, Download, Play, Pause } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DialogVideoShareProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string | null;
  collectionName: string;
}

export const DialogVideoShare = ({ 
  open, 
  onOpenChange, 
  videoUrl, 
  collectionName 
}: DialogVideoShareProps) => {
  const [copying, setCopying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Reset video loaded state when dialog opens/closes or videoUrl changes
  useEffect(() => {
    if (open && videoUrl) {
      setVideoLoaded(false);
      setVideoError(null);
      console.log("Video URL received:", videoUrl);
    }
  }, [open, videoUrl]);
  
  // Handle download of video
  const handleDownload = () => {
    if (!videoUrl) {
      toast({
        title: "No Video Available",
        description: "Generate a video first before downloading.",
        variant: "destructive"
      });
      return;
    }
    
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${collectionName.replace(/\s+/g, '-').toLowerCase()}-showcase.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Video Downloaded",
      description: "The video showcase has been downloaded to your device."
    });
  };
  
  // Handle copy of link
  const handleCopyLink = async () => {
    if (!videoUrl) {
      toast({
        title: "No Video Available",
        description: "Generate a video first before copying its link.",
        variant: "destructive"
      });
      return;
    }
    
    setCopying(true);
    try {
      await navigator.clipboard.writeText(videoUrl);
      toast({
        title: "Link Copied",
        description: "Video link copied to clipboard."
      });
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast({
        title: "Copy Failed",
        description: "Could not copy the link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCopying(false);
    }
  };
  
  // Handle social media shares
  const handleShare = (platform: string) => {
    if (!videoUrl) {
      toast({
        title: "No Video Available",
        description: "Generate a video first before sharing.",
        variant: "destructive"
      });
      return;
    }
    
    // For demonstration purposes, we'll open a new window simulating the share
    const text = encodeURIComponent(`Check out my ${collectionName} car collection showcase!`);
    let shareUrl = '';
    
    switch (platform.toLowerCase()) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`;
        break;
      case 'instagram':
        // Instagram doesn't have a web sharing API, this is just for demo
        toast({
          title: "Instagram Sharing",
          description: "Instagram requires a mobile app for sharing videos.",
          variant: "default"
        });
        return;
      case 'youtube':
        toast({
          title: "YouTube Upload",
          description: "In a production app, this would launch a YouTube upload dialog.",
          variant: "default"
        });
        return;
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };
  
  // Handle video load event
  const handleVideoLoad = () => {
    console.log("Video loaded successfully");
    setVideoLoaded(true);
    setVideoError(null);
  };
  
  // Handle video error
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video failed to load:", e);
    
    const videoElement = e.currentTarget;
    const errorMessage = videoElement.error 
      ? `Error: ${videoElement.error.code} - ${videoElement.error.message}` 
      : "Failed to load video";
      
    setErrorDetails(errorMessage);
    setVideoError("Failed to load video. Please try regenerating it.");
    setVideoLoaded(false);
    setShowErrorDialog(true);
  };
  
  // Handle retrying video load
  const handleRetry = () => {
    if (videoRef.current && videoUrl) {
      setIsRetrying(true);
      setVideoError(null);
      
      // Force reload the video element
      const video = videoRef.current;
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.src = videoUrl;
      video.play()
        .then(() => {
          console.log("Video playback started after retry");
        })
        .catch(err => {
          console.error("Error starting playback after retry:", err);
        })
        .finally(() => {
          setIsRetrying(false);
        });
    }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Video Showcase: {collectionName}</DialogTitle>
            <DialogDescription>
              Share this video showcase of your collection on social media or download it.
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-6 flex flex-col items-center">
            {videoUrl ? (
              <div className="w-full relative">
                {!videoLoaded && !videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 z-10 rounded-md">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="text-sm">Loading video...</p>
                    </div>
                  </div>
                )}
                
                {videoError && !isRetrying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 z-10 rounded-md">
                    <div className="text-center p-6">
                      <p className="text-destructive font-medium">{videoError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={handleRetry}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
                
                {isRetrying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 z-10 rounded-md">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="text-sm">Reloading video...</p>
                    </div>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  key={`video-${videoUrl}-${isRetrying ? 'retry' : 'initial'}`}
                  src={videoUrl}
                  controls
                  className="w-full h-auto max-h-[500px] rounded-md object-contain border border-border bg-black"
                  onLoadedData={handleVideoLoad}
                  onError={handleVideoError}
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                  style={{ display: videoError && !isRetrying ? 'none' : 'block' }}
                >
                  Your browser does not support HTML5 video.
                </video>
                
                {videoLoaded && (
                  <div className="bg-muted/30 rounded p-2 mt-2">
                    <p className="text-sm text-foreground font-medium text-center">
                      Video shows all available images for each car
                    </p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      Use the video controls to adjust speed, pause, or replay sections
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-[300px] bg-secondary flex flex-col items-center justify-center rounded-md">
                <p className="text-muted-foreground">No video available</p>
                <p className="text-sm text-muted-foreground mt-2">Click the "Video Showcase" button to generate a video</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="video-link" className="text-sm font-medium">
                Video Link
              </label>
              <div className="flex gap-2">
                <Input
                  id="video-link"
                  value={videoUrl || ''}
                  readOnly
                  className="flex-1"
                  placeholder="Video URL will appear here after generation"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleCopyLink}
                  disabled={!videoUrl || copying}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Share to Social Media
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('Facebook')}
                  disabled={!videoUrl}
                  className="gap-2"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('Twitter')}
                  disabled={!videoUrl}
                  className="gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('Instagram')}
                  disabled={!videoUrl}
                  className="gap-2"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('YouTube')}
                  disabled={!videoUrl}
                  className="gap-2"
                >
                  <Youtube className="h-4 w-4" />
                  YouTube
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              variant="secondary" 
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button 
              onClick={handleDownload}
              disabled={!videoUrl}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Video Playback Error</AlertDialogTitle>
            <AlertDialogDescription>
              There was a problem playing the video. This could be due to browser compatibility issues or the video format.
              <div className="mt-2 p-2 bg-muted rounded text-xs font-mono overflow-auto max-h-[100px]">
                {errorDetails}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowErrorDialog(false);
              handleRetry();
            }}>
              Retry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

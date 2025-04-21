
import React, { useState } from "react";
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
import { Copy, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
  
  // Handle download of video
  const handleDownload = () => {
    if (!videoUrl) return;
    
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
    if (!videoUrl) return;
    
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
    if (!videoUrl) return;
    
    // In a real app, you would implement proper sharing functionality
    // For now, we'll simulate it with a toast
    toast({
      title: `Share to ${platform}`,
      description: `In a production app, this would share to ${platform}.`,
      variant: "default"
    });
    
    // For demonstration purposes, we'll open a new window simulating the share
    // In a real implementation, you would use proper sharing APIs
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Video Showcase: {collectionName}</DialogTitle>
          <DialogDescription>
            Share this video showcase of your collection on social media or download it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 flex flex-col items-center">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="w-full max-h-[400px] rounded-md"
            />
          ) : (
            <div className="w-full h-[300px] bg-secondary flex items-center justify-center rounded-md">
              No video available
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
        
        <DialogFooter>
          <Button 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button 
            onClick={handleDownload}
            disabled={!videoUrl}
          >
            Download Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

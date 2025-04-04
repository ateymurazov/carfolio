
/**
 * Image utility functions for handling and processing images
 */

/**
 * Optimizes an image by resizing and compressing it
 * @param dataUrl The original image as a data URL
 * @param quality The compression quality (0-1)
 * @param maxWidth The maximum width to resize to
 * @returns A promise resolving to the optimized data URL
 */
export const optimizeImage = (dataUrl: string, quality: number = 0.7, maxWidth: number = 1920): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // If not a data URL, return as is
      if (!dataUrl.startsWith('data:')) {
        resolve(dataUrl);
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        if (!ctx) {
          console.warn("Failed to get canvas context for image optimization");
          resolve(dataUrl); // Fallback if context creation fails
          return;
        }
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Use a safe quality value
        const safeQuality = Math.max(0.5, Math.min(0.9, quality));
        
        // Try to get optimized URL, but handle errors
        try {
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', safeQuality);
          resolve(optimizedDataUrl);
        } catch (err) {
          console.warn("Error creating data URL:", err);
          resolve(dataUrl); // Return original on error
        }
      };
      
      img.onerror = () => {
        console.warn("Failed to load image for optimization");
        resolve(dataUrl); // Return original on error
      };
      
      img.src = dataUrl;
    } catch (error) {
      console.error("Image optimization failed:", error);
      resolve(dataUrl); // Return original on error
    }
  });
};

/**
 * Checks if an image URL is valid
 * @param imageUrl The URL or data URL of the image to check
 * @returns A promise resolving to boolean indicating if the image is valid
 */
export const validateImage = (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Quick check for empty URLs
    if (!imageUrl) {
      resolve(false);
      return;
    }
    
    // Placeholder is valid by definition
    if (imageUrl === '/placeholder.svg') {
      resolve(true);
      return;
    }
    
    // For data URLs, consider them valid
    if (imageUrl.startsWith('data:image/')) {
      resolve(true);
      return;
    }
    
    // For http URLs, do a simple check
    if (imageUrl.startsWith('http')) {
      resolve(true);
      return;
    }
    
    // For everything else, assume valid
    resolve(true);
  });
};

/**
 * Preloads an image to ensure it's in the browser cache
 * @param imageUrl The URL to preload
 * @returns A promise that resolves when the image is loaded
 */
export const preloadImage = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      reject(new Error("No image URL provided"));
      return;
    }
    
    // For data URLs, resolve immediately
    if (imageUrl.startsWith('data:')) {
      resolve(imageUrl);
      return;
    }
    
    // For placeholder, resolve immediately
    if (imageUrl === '/placeholder.svg') {
      resolve(imageUrl);
      return;
    }
    
    // For other URLs, try to load
    const img = new Image();
    img.onload = () => {
      resolve(imageUrl);
    };
    img.onerror = () => {
      resolve('/placeholder.svg'); // Fallback to placeholder
    };
    img.src = imageUrl;
  });
};

/**
 * Gets a fallback image URL
 * @returns A placeholder image URL
 */
export const getFallbackImage = (): string => {
  return '/placeholder.svg';
};

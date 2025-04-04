
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
  return new Promise((resolve) => {
    // If not a data URL, return as is
    if (!dataUrl || !dataUrl.startsWith('data:')) {
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
        resolve(dataUrl); // Fallback if context creation fails
        return;
      }
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Use a safe quality value
      const safeQuality = Math.max(0.5, Math.min(0.9, quality));
      
      try {
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', safeQuality);
        resolve(optimizedDataUrl);
      } catch (err) {
        console.warn("Image optimization failed:", err);
        resolve(dataUrl); // Return original on error
      }
    };
    
    img.onerror = () => {
      console.warn("Image failed to load for optimization:", dataUrl.substring(0, 50) + "...");
      resolve('/placeholder.svg');
    };
    img.src = dataUrl;
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
    if (!imageUrl || typeof imageUrl !== 'string') {
      resolve(false);
      return;
    }
    
    // For data URLs or placeholder, consider them valid
    if (imageUrl === '/placeholder.svg' || imageUrl.startsWith('data:image/')) {
      resolve(true);
      return;
    }
    
    // For http URLs, test with an Image object
    if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
      const testImage = new Image();
      testImage.onload = () => resolve(true);
      testImage.onerror = () => resolve(false);
      testImage.src = imageUrl;
      return;
    }
    
    // For everything else, assume invalid
    resolve(false);
  });
};

/**
 * Preloads an image to ensure it's in the browser cache
 * @param imageUrl The URL to preload
 * @returns A promise that resolves when the image is loaded
 */
export const preloadImage = (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      resolve('/placeholder.svg');
      return;
    }
    
    if (imageUrl === '/placeholder.svg' || imageUrl.startsWith('data:')) {
      resolve(imageUrl);
      return;
    }

    if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
      const img = new Image();
      img.onload = () => resolve(imageUrl);
      img.onerror = () => resolve('/placeholder.svg');
      img.src = imageUrl;
      return;
    }
    
    // Resolve with placeholder for invalid inputs
    resolve('/placeholder.svg');
  });
};

/**
 * Gets a fallback image URL
 * @returns A placeholder image URL
 */
export const getFallbackImage = (): string => {
  return '/placeholder.svg';
};

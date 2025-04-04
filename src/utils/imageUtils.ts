
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
        resolve(dataUrl); // Return original on error
      }
    };
    
    img.onerror = () => resolve(dataUrl); // Return original on error
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
    
    // For http URLs, consider them valid
    if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
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
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve('/placeholder.svg');
      return;
    }
    
    // For data URLs or placeholders, resolve immediately
    if (imageUrl.startsWith('data:') || imageUrl === '/placeholder.svg' || 
        imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
      resolve(imageUrl);
      return;
    }
    
    // Resolve with the original URL
    resolve(imageUrl);
  });
};

/**
 * Gets a fallback image URL
 * @returns A placeholder image URL
 */
export const getFallbackImage = (): string => {
  return '/placeholder.svg';
};


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
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Log compression results
        const originalSize = Math.round(dataUrl.length / 1024);
        const optimizedSize = Math.round(optimizedDataUrl.length / 1024);
        const savingsPercent = Math.round((1 - (optimizedSize / originalSize)) * 100);
        
        console.log(`Image optimized: ${originalSize}KB → ${optimizedSize}KB (${savingsPercent}% smaller)`);
        
        resolve(optimizedDataUrl);
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
 * Checks if an image URL is valid and loads successfully
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
    
    // Set a shorter timeout to prevent hanging on invalid URLs
    const timeoutId = setTimeout(() => {
      console.warn("Image validation timed out:", imageUrl.substring(0, 50) + "...");
      resolve(false);
    }, 3000);
    
    const img = new Image();
    
    img.onload = () => {
      clearTimeout(timeoutId);
      // Verify image has actual dimensions
      const isValid = img.width > 0 && img.height > 0;
      resolve(isValid);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      console.warn("Image validation failed for:", imageUrl.substring(0, 50) + "...");
      resolve(false);
    };
    
    img.src = imageUrl;
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
    
    // Set timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn("Image preload timed out:", imageUrl.substring(0, 50) + "...");
      reject(new Error(`Preload timed out: ${imageUrl.substring(0, 50)}...`));
    }, 3000);
    
    const img = new Image();
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(imageUrl);
    };
    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to preload image: ${imageUrl.substring(0, 50)}...`));
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

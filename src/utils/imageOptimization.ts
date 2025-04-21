
/**
 * Image optimization utilities
 */

/**
 * Optimize an image by resizing and compressing it
 */
export const optimizeImage = (dataUrl: string, quality: number, maxWidth: number): Promise<string> => {
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

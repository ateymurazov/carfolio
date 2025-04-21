
import { useImageStorage } from "@/hooks/useImageStorage";
import { Car } from "@/types/car";

export function useProcessedCars(cars: Car[]) {
  const imageStorage = useImageStorage();

  // Hardcoded fallback demo images
  const sampleImageUrls = [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=80",
    "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&q=80",
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80"
  ];

  return cars.map((car, index) => {
    // Debug the original images array
    console.log(`Processing images for car ${car.id}:`, car.images);
    
    // Use car images if they exist and are retrievable, fall back to sample images
    let resolvedImages: string[] = [];
    if (car.images && car.images.length > 0) {
      resolvedImages = car.images.map(imgId => {
        if (typeof imgId === 'string') {
          // For debugging
          console.log(`Processing image path for car ${car.id}: ${imgId}`);
          
          // FIXED: Handle lovable-uploads paths properly
          if (imgId.includes('lovable-uploads')) {
            // Make sure the path starts with a slash and the full path is preserved
            const formattedPath = imgId.startsWith('/') ? imgId : `/${imgId}`;
            console.log(`Using lovable-uploads path: ${formattedPath}`);
            return formattedPath;
          }
          
          // Handle other URL types
          if (imgId.startsWith('data:') || 
              imgId.startsWith('http') || 
              imgId.startsWith('/') ||
              imgId.startsWith('./')) {
            return imgId;
          }
          
          // Try to get from image storage
          try {
            const img = imageStorage.getImage(imgId);
            console.log(`Retrieved image ${imgId} from storage: ${img.substring(0, 30)}...`);
            if (img === '/placeholder.svg') {
              // fallback to sample
              return sampleImageUrls[index % sampleImageUrls.length];
            }
            return img;
          } catch (error) {
            console.error(`Error retrieving image ${imgId}:`, error);
            return sampleImageUrls[index % sampleImageUrls.length];
          }
        }
        return sampleImageUrls[index % sampleImageUrls.length];
      });
    }
    
    // If no images were resolved, use sample images
    if (resolvedImages.length === 0) {
      resolvedImages = [sampleImageUrls[index % sampleImageUrls.length]];
    }
    
    // Log the resolved images for debugging
    console.log(`Car ${car.id} resolved images:`, resolvedImages);
    
    return {
      ...car,
      resolvedImages,
    };
  });
}

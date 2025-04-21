
import { useImageStorage } from "@/hooks/useImageStorage";
import { Car } from "@/types/car";

export function useProcessedCars(cars: Car[]) {
  const imageStorage = useImageStorage();

  return cars.map((car) => {
    // Debug the original images array
    console.log(`Processing images for car ${car.id}:`, car.images);
    
    // Use car images if they exist and are retrievable
    let resolvedImages: string[] = [];
    if (car.images && car.images.length > 0) {
      resolvedImages = car.images.map(imgId => {
        if (typeof imgId === 'string') {
          // For debugging
          console.log(`Processing image path for car ${car.id}: ${imgId}`);
          
          // Handle lovable-uploads paths properly
          if (imgId.includes('lovable-uploads')) {
            // Make sure the path starts with a slash and the full path is preserved
            const formattedPath = imgId.startsWith('/') ? imgId : `/${imgId}`;
            console.log(`Using lovable-uploads path: ${formattedPath}`);
            return formattedPath;
          }
          
          // Handle other URL types - only local paths or data URLs
          if (imgId.startsWith('data:') || imgId.startsWith('/')) {
            return imgId;
          }
          
          // Try to get from image storage if it's not a URL
          try {
            const img = imageStorage.getImage(imgId);
            console.log(`Retrieved image ${imgId} from storage: ${img.substring(0, 30)}...`);
            return img;
          } catch (error) {
            console.error(`Error retrieving image ${imgId}:`, error);
            return '/placeholder.svg';
          }
        }
        return '/placeholder.svg';
      });
    }
    
    // If no images were resolved, use placeholder
    if (resolvedImages.length === 0) {
      resolvedImages = ['/placeholder.svg'];
    }
    
    // Log the resolved images for debugging
    console.log(`Car ${car.id} resolved images:`, resolvedImages);
    
    return {
      ...car,
      resolvedImages,
    };
  });
}


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
          
          // Handle lovable-uploads paths directly
          if (imgId.includes('lovable-uploads')) {
            return imgId.startsWith('/') ? imgId : `/${imgId}`;
          }
          
          // Handle absolute URLs (including external URLs) directly
          if (imgId.startsWith('http') || imgId.startsWith('https') || 
              imgId.startsWith('data:') || imgId.startsWith('/')) {
            return imgId;
          }
          
          // Try to get from image storage if it's a storage ID
          try {
            const img = imageStorage.getImage(imgId);
            if (img && img !== '/placeholder.svg') {
              return img;
            } else {
              console.warn(`Image ${imgId} not found in storage or returned placeholder`);
              return '/placeholder.svg';
            }
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

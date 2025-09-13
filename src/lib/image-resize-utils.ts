/**
 * Image resize utilities for handling large images
 * Provides fallbacks and progressive sizing for memory-constrained devices
 */

export interface ResizeOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  maxFileSize?: number; // Max file size in bytes
  maxMemoryUsage?: number; // Max memory usage in bytes
}

export interface ResizeResult {
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  memoryUsed: number;
}

/**
 * Calculate optimal dimensions to fit within memory constraints
 */
export function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maxMemoryUsage: number = 200 * 1024 * 1024 // 200MB default
): { width: number; height: number; scaleFactor: number } {
  // Calculate memory requirement for original size
  const originalMemory = originalWidth * originalHeight * 4; // 4 bytes per pixel (RGBA)

  // Calculate scale factor based on max dimensions
  const dimensionScaleFactor = Math.min(
    maxWidth / originalWidth,
    maxHeight / originalHeight,
    1 // Never scale up
  );

  // Calculate scale factor based on memory constraints
  const memoryScaleFactor =
    originalMemory > maxMemoryUsage
      ? Math.sqrt(maxMemoryUsage / originalMemory)
      : 1;

  // Use the more restrictive scale factor
  const scaleFactor = Math.min(dimensionScaleFactor, memoryScaleFactor);

  const newWidth = Math.floor(originalWidth * scaleFactor);
  const newHeight = Math.floor(originalHeight * scaleFactor);

  return {
    width: newWidth,
    height: newHeight,
    scaleFactor,
  };
}

/**
 * Progressively resize image if initial attempt fails
 */
export async function progressiveResize(
  file: File,
  options: ResizeOptions
): Promise<ResizeResult> {
  const {
    maxWidth,
    maxHeight,
    quality,
    maxMemoryUsage = 200 * 1024 * 1024,
  } = options;

  // Try different scale factors if initial resize fails
  const scaleFactors = [1.0, 0.8, 0.6, 0.4, 0.3];

  for (const factor of scaleFactors) {
    try {
      const adjustedMaxWidth = Math.floor(maxWidth * factor);
      const adjustedMaxHeight = Math.floor(maxHeight * factor);

      const result = await resizeImageSafely(file, {
        maxWidth: adjustedMaxWidth,
        maxHeight: adjustedMaxHeight,
        quality: quality * factor, // Reduce quality for smaller scales
        maxMemoryUsage,
      });

      return result;
    } catch (error) {
      console.warn(`Resize attempt failed with scale factor ${factor}:`, error);

      // If this is the last attempt, throw the error
      if (factor === scaleFactors[scaleFactors.length - 1]) {
        throw new Error(
          `Unable to resize image: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  throw new Error('All resize attempts failed');
}

/**
 * Resize image with memory safety checks
 */
export async function resizeImageSafely(
  file: File,
  options: ResizeOptions
): Promise<ResizeResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate optimal dimensions
        const { width, height, scaleFactor } = calculateOptimalDimensions(
          img.width,
          img.height,
          options.maxWidth,
          options.maxHeight,
          options.maxMemoryUsage
        );

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', options.quality);

        // Calculate sizes
        const originalSize = file.size;
        const compressedSize = Math.round(
          ((dataUrl.length - 'data:image/jpeg;base64,'.length) * 3) / 4
        );
        const memoryUsed = width * height * 4;

        // Log compression info
        console.log(
          `📸 Image resized: ${img.width}x${img.height} → ${width}x${height} (${scaleFactor.toFixed(2)}x scale)`
        );

        resolve({
          dataUrl,
          width,
          height,
          originalSize,
          compressedSize,
          compressionRatio: originalSize / compressedSize,
          memoryUsed,
        });

        // Cleanup
        img.src = '';
        canvas.width = 0;
        canvas.height = 0;
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Convert file to data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        img.src = result;
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Check if image dimensions are within safe limits
 */
export function isImageSafe(
  width: number,
  height: number,
  maxMemoryUsage: number = 200 * 1024 * 1024
): boolean {
  const estimatedMemory = width * height * 4;
  return estimatedMemory <= maxMemoryUsage;
}

/**
 * Get recommended resize settings based on device capabilities
 */
export function getRecommendedResizeSettings(
  deviceMemory: number = 4,
  isLowEndDevice: boolean = false
): ResizeOptions {
  if (isLowEndDevice || deviceMemory < 2) {
    return {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.7,
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    };
  } else if (deviceMemory < 4) {
    return {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    };
  } else {
    return {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.85,
      maxMemoryUsage: 200 * 1024 * 1024, // 200MB
    };
  }
}

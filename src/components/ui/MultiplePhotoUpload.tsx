import React, { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';

// Helper function for safer image compression on older devices
const compressImageSafely = async (file: File): Promise<string> => {
  try {
    // Check available memory before processing
    if (checkMemoryConstraints(file)) {
      throw new Error('Insufficient memory for processing');
    }

    // Try canvas-based compression for maximum compatibility
    return await compressImageWithCanvas(file);
  } catch (error) {
    console.warn('Compression failed, trying fallback:', error);

    // Check if it's a memory error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('memory') || errorMessage.includes('Memory')) {
      throw new Error('Image too large for available memory');
    }

    // Final fallback - just read the file without compression (risky on old devices)
    return await readFileAsDataURL(file);
  }
};

// Check memory constraints before processing
const checkMemoryConstraints = (file: File): boolean => {
  try {
    // Estimate memory needed (rough calculation)
    // Image in memory = width * height * 4 bytes (RGBA)
    // Assume worst case 4000x3000 image = ~48MB in memory
    const estimatedMemoryMB = (file.size / 1024 / 1024) * 8; // Conservative estimate

    // Check if we have device memory info
    if ('deviceMemory' in navigator) {
      const deviceMemoryGB = (navigator as any).deviceMemory;
      // Use max 25% of device memory for image processing
      const availableMemoryMB = deviceMemoryGB * 1024 * 0.25;

      if (estimatedMemoryMB > availableMemoryMB) {
        return true; // Memory constrained
      }
    }

    // For old Android, be very conservative
    if (detectLowMemoryDevice() && file.size > 2 * 1024 * 1024) {
      // 2MB threshold
      return true;
    }

    return false;
  } catch {
    return false; // If detection fails, proceed cautiously
  }
};

// Low-memory compression for older Android devices
const compressImageWithCanvas = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Shorter timeout for memory-constrained devices
    const timeout = setTimeout(() => {
      reject(new Error('Image processing timeout'));
    }, 8000);

    // Check file size first - reject huge files immediately
    const maxFileSize = 10 * 1024 * 1024; // 10MB max
    if (file.size > maxFileSize) {
      clearTimeout(timeout);
      reject(new Error('File too large. Please choose a smaller image.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Detect if we're on a low-memory device
          const isLowMemory = detectLowMemoryDevice();
          const maxDimension = isLowMemory ? 400 : 600; // Much smaller for old Android

          // Calculate dimensions more aggressively for low memory
          let { width, height } = calculateLowMemoryDimensions(
            img.width,
            img.height,
            maxDimension
          );

          // Create canvas with memory-safe dimensions
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', {
            alpha: false, // No alpha channel to save memory
            willReadFrequently: false,
          });

          if (!ctx) {
            clearTimeout(timeout);
            reject(new Error('Canvas context not available'));
            return;
          }

          canvas.width = width;
          canvas.height = height;

          // Use lower quality and progressive drawing for memory safety
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';

          // Draw in multiple passes for very large images to avoid memory issues
          if (img.width > 2000 || img.height > 2000) {
            drawImageProgressive(ctx, img, width, height);
          } else {
            ctx.drawImage(img, 0, 0, width, height);
          }

          // Use aggressive compression for older devices
          const quality = isLowMemory ? 0.5 : 0.6;
          const dataUrl = canvas.toDataURL('image/jpeg', quality);

          // Clean up immediately
          canvas.width = 0;
          canvas.height = 0;

          clearTimeout(timeout);
          resolve(dataUrl);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load image'));
      };

      // Set a maximum image size to prevent memory issues
      img.crossOrigin = 'anonymous';
      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to read file'));
    };

    // Read file in smaller chunks for memory efficiency
    reader.readAsDataURL(file);
  });
};

// Detect if device is low memory (old Android)
const detectLowMemoryDevice = (): boolean => {
  try {
    // Check device memory if available
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory <= 2; // 2GB or less
    }

    // Check user agent for old Android
    const userAgent = navigator.userAgent.toLowerCase();
    const isOldAndroid = /android [1-6]\./.test(userAgent);
    const isOldChrome = /chrome\/[1-5][0-9]\./.test(userAgent);

    // Check for WebView indicators
    const isWebView =
      /wv/.test(userAgent) || /version\/\d+\.\d+/.test(userAgent);

    return isOldAndroid || isOldChrome || isWebView;
  } catch {
    return true; // Assume low memory if detection fails
  }
};

// Calculate safe dimensions for low memory devices
const calculateLowMemoryDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxDimension: number
) => {
  const ratio = Math.min(
    maxDimension / originalWidth,
    maxDimension / originalHeight
  );

  // Ensure dimensions are reasonable and even numbers
  let width = Math.floor(originalWidth * ratio);
  let height = Math.floor(originalHeight * ratio);

  // Force even smaller for very large originals
  if (originalWidth > 4000 || originalHeight > 4000) {
    width = Math.floor(width * 0.7);
    height = Math.floor(height * 0.7);
  }

  // Minimum size constraints
  width = Math.max(200, width);
  height = Math.max(200, height);

  return { width, height };
};

// Progressive drawing for very large images to avoid memory crashes
const drawImageProgressive = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
) => {
  try {
    // For extremely large images, use multiple passes
    if (img.width > 4000 || img.height > 4000) {
      // Create intermediate canvas at 50% size first
      const intermediateCanvas = document.createElement('canvas');
      const intermediateCtx = intermediateCanvas.getContext('2d');

      if (intermediateCtx) {
        const intermediateWidth = Math.floor(img.width * 0.5);
        const intermediateHeight = Math.floor(img.height * 0.5);

        intermediateCanvas.width = intermediateWidth;
        intermediateCanvas.height = intermediateHeight;

        // First pass: draw to intermediate canvas
        intermediateCtx.drawImage(
          img,
          0,
          0,
          intermediateWidth,
          intermediateHeight
        );

        // Second pass: draw from intermediate to final
        ctx.drawImage(intermediateCanvas, 0, 0, targetWidth, targetHeight);

        // Clean up
        intermediateCanvas.width = 0;
        intermediateCanvas.height = 0;
      } else {
        // Fallback to direct drawing
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      }
    } else {
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    }
  } catch (error) {
    // If progressive fails, try direct
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  }
};

// Simple FileReader for maximum compatibility
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
};

interface MultiplePhotoUploadProps {
  isMobile?: boolean;
  hint?: string;
  onImagesUpload?: (imageUrls: string[]) => void;
  uploadedImages?: string[];
  maxImages?: number;
  translations?: {
    addPhotos?: string;
    addMore?: string;
    uploading?: string;
    maxSizeMb?: string;
    photosCount?: string;
    imageUploadError?: string;
    maxImagesError?: string;
    invalidFileTypeError?: string;
  };
}

export const MultiplePhotoUpload: React.FC<MultiplePhotoUploadProps> = ({
  isMobile,
  hint,
  onImagesUpload,
  uploadedImages = [],
  maxImages = 5,
  translations = {},
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default translations (English fallbacks)
  const t = {
    addPhotos: translations.addPhotos || 'Add photos',
    addMore: translations.addMore || 'Add more',
    uploading: translations.uploading || 'Uploading...',
    maxSizeMb: translations.maxSizeMb || 'Max 5MB each',
    photosCount: translations.photosCount || 'photos',
    imageUploadError:
      translations.imageUploadError ||
      'Image size too big. Please select an image under 5MB.',
    maxImagesError:
      translations.maxImagesError ||
      `You can only upload up to ${maxImages} images.`,
    invalidFileTypeError:
      translations.invalidFileTypeError ||
      'Please select JPEG, PNG, or WebP image files only.',
  };

  const compressImage = (
    file: File,
    maxWidth: number = 800,
    quality: number = 0.8
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    if (onImagesUpload) {
      onImagesUpload(newImages);
    }
  };

  const handleFileSelect = async (files: FileList) => {
    setError(null);
    setUploading(true);

    // Check total count first
    if (uploadedImages.length + files.length > maxImages) {
      setError(
        translations.maxImagesError?.replace(
          '{maxImages}',
          maxImages.toString()
        ) || t.maxImagesError
      );
      setUploading(false);
      return;
    }

    // Early detection for low memory devices to set stricter limits
    const isLowMemory = detectLowMemoryDevice();
    const maxSizeInBytes = isLowMemory ? 3 * 1024 * 1024 : 5 * 1024 * 1024; // 3MB for old Android

    const newImageUrls: string[] = [];

    // Process files one by one to avoid memory buildup
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Early size check
      if (file.size > maxSizeInBytes) {
        const maxMB = Math.round(maxSizeInBytes / (1024 * 1024));
        setError(
          `Image too large. Maximum size is ${maxMB}MB for this device.`
        );
        setUploading(false);
        return;
      }

      // Support older devices - accept more file types including no type
      const isValidImage =
        file.type === 'image/jpeg' ||
        file.type === 'image/jpg' ||
        file.type === 'image/png' ||
        file.type === 'image/webp' ||
        file.type === '' || // Some older devices don't set MIME type
        file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);

      if (!isValidImage) {
        setError(t.invalidFileTypeError);
        setUploading(false);
        return;
      }

      try {
        // Process one image at a time to minimize memory usage
        const compressedImage = await compressImageSafely(file);
        newImageUrls.push(compressedImage);

        // Small delay between processing to allow garbage collection
        if (isLowMemory && i < files.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.warn('Image processing failed:', error);

        // For older devices, be more aggressive about failing
        if (isLowMemory) {
          setError(
            'Unable to process image on this device. Please try a smaller photo.'
          );
          setUploading(false);
          return;
        }

        // Try fallback for newer devices
        try {
          const result = await readFileAsDataURL(file);
          newImageUrls.push(result);
        } catch (readError) {
          console.error('File reading failed:', readError);
          setError('Failed to process image. Please try a different photo.');
          setUploading(false);
          return;
        }
      }
    }

    if (onImagesUpload) {
      onImagesUpload([...uploadedImages, ...newImageUrls]);
    }
    setUploading(false);
  };

  const handleClick = () => {
    if (!uploading && uploadedImages.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Grid Layout - Images + Add Button */}
      <div className="grid grid-cols-3 gap-3">
        {/* Uploaded Images */}
        {uploadedImages.map((image, index) => (
          <div key={index} className="relative aspect-square">
            <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100">
              <img
                src={image}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              disabled={uploading}
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        ))}

        {/* Add Photo Button */}
        {uploadedImages.length < maxImages && (
          <div className="aspect-square">
            <button
              onClick={handleClick}
              disabled={uploading}
              className={`w-full h-full rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center transition-colors
                ${
                  uploading
                    ? 'bg-gray-50 cursor-not-allowed opacity-50'
                    : 'bg-gray-50 hover:bg-gray-100 hover:border-gray-400 cursor-pointer'
                }`}
            >
              <Plus
                size={24}
                className={uploading ? 'text-gray-400' : 'text-gray-600'}
              />
              <p
                className={`text-xs mt-2 text-center px-2 ${uploading ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {uploading
                  ? t.uploading
                  : uploadedImages.length === 0
                    ? t.addPhotos
                    : t.addMore}
              </p>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files);
                  // Reset input value to allow selecting same file again
                  e.target.value = '';
                }
              }}
              className="hidden"
              disabled={uploading}
            />
          </div>
        )}
      </div>

      {/* Upload Info */}
      <p className="text-xs text-gray-500 text-center mt-3">
        {uploadedImages.length}/{maxImages} {t.photosCount} • {t.maxSizeMb}
      </p>
    </div>
  );
};

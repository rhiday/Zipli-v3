'use client';

import { toast } from '@/hooks/use-toast';

export interface ImageCompressionConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  maxSizeBytes: number;
}

const DEFAULT_CONFIG: ImageCompressionConfig = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
};

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class ImageUploadError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export async function compressImage(
  file: File,
  config: Partial<ImageCompressionConfig> = {}
): Promise<File> {
  const { maxWidth, maxHeight, quality, maxSizeBytes } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Validate file size
  if (file.size > maxSizeBytes) {
    throw new ImageUploadError(
      `File too large. Maximum size is ${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB`,
      'FILE_TOO_LARGE'
    );
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new ImageUploadError('File must be an image', 'INVALID_FILE_TYPE');
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx!.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                new ImageUploadError('Compression failed', 'COMPRESSION_FAILED')
              );
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      } catch (error) {
        reject(
          new ImageUploadError('Compression failed', 'COMPRESSION_FAILED')
        );
      }
    };

    img.onerror = () => {
      reject(new ImageUploadError('Invalid image file', 'INVALID_IMAGE'));
    };

    img.src = URL.createObjectURL(file);
  });
}

export async function uploadWithProgress(
  file: File,
  uploadFn: (file: File) => Promise<any>,
  onProgress?: (progress: UploadProgress) => void
): Promise<any> {
  try {
    // Show compression toast for large files
    if (file.size > 1024 * 1024) {
      // 1MB
      toast({
        title: 'Compressing image...',
        description: 'Optimizing for faster upload',
        variant: 'info',
      });
    }

    // Compress image
    const compressedFile = await compressImage(file);

    // Calculate compression savings
    const savedBytes = file.size - compressedFile.size;
    if (savedBytes > 0) {
      const savedPercent = Math.round((savedBytes / file.size) * 100);
      toast({
        title: 'Image compressed',
        description: `Reduced size by ${savedPercent}% for faster upload`,
        variant: 'success',
      });
    }

    // Start upload with progress simulation
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress < 90) {
        onProgress?.({
          loaded: progress,
          total: 100,
          percentage: Math.round(progress),
        });
      }
    }, 200);

    try {
      const result = await uploadFn(compressedFile);

      clearInterval(progressInterval);
      onProgress?.({ loaded: 100, total: 100, percentage: 100 });

      return result;
    } catch (uploadError) {
      clearInterval(progressInterval);
      throw uploadError;
    }
  } catch (error) {
    if (error instanceof ImageUploadError) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'error',
      });
    } else {
      toast({
        title: 'Upload failed',
        description: 'Please try again with a smaller image',
        variant: 'error',
      });
    }
    throw error;
  }
}

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxSize = DEFAULT_CONFIG.maxSizeBytes;
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a JPEG, PNG, WebP, or GIF image',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Image must be smaller than ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
    };
  }

  return { valid: true };
}

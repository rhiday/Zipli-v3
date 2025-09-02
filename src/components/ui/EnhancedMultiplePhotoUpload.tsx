/**
 * Enhanced MultiplePhotoUpload component with progressive compression and memory management
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, X, Camera, Image } from 'lucide-react';
import { PhotoActionSheet } from './PhotoActionSheet';
import { imageCompressor, CompressionResult } from '@/lib/image-compression';
import {
  deviceCapabilities,
  DeviceCapabilities,
} from '@/lib/device-capabilities';
import { useCommonTranslation } from '@/hooks/useTranslations';

interface EnhancedMultiplePhotoUploadProps {
  isMobile?: boolean;
  hint?: string;
  onImagesUpload?: (
    imageUrls: string[],
    compressionInfo?: CompressionResult[]
  ) => void;
  uploadedImages?: string[];
  maxImages?: number;
  maxSizeBytes?: number;
  onError?: (error: string) => void;
  onProgress?: (progress: number, current: number, total: number) => void;
  disabled?: boolean;
}

export const EnhancedMultiplePhotoUpload: React.FC<
  EnhancedMultiplePhotoUploadProps
> = ({
  isMobile,
  hint,
  onImagesUpload,
  uploadedImages = [],
  maxImages = 5,
  maxSizeBytes,
  onError,
  onProgress,
  disabled = false,
}) => {
  const { t } = useCommonTranslation();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceCapabilities | null>(null);
  const [compressionResults, setCompressionResults] = useState<
    CompressionResult[]
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Initialize device capabilities
  useEffect(() => {
    const initializeDevice = async () => {
      try {
        const capabilities = await deviceCapabilities.detect();
        setDeviceInfo(capabilities);
      } catch (error) {
        console.error('Failed to detect device capabilities:', error);
      }
    };

    initializeDevice();
  }, []);

  // Cleanup function for memory management
  const cleanup = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleRemoveImage = useCallback(
    (index: number) => {
      const newImages = uploadedImages.filter((_, i) => i !== index);
      const newCompressionResults = compressionResults.filter(
        (_, i) => i !== index
      );

      setCompressionResults(newCompressionResults);

      if (onImagesUpload) {
        onImagesUpload(newImages, newCompressionResults);
      }
    },
    [uploadedImages, compressionResults, onImagesUpload]
  );

  const processFiles = useCallback(
    async (files: FileList) => {
      const effectiveMaxSize =
        maxSizeBytes || deviceInfo?.maxImageSize || 5 * 1024 * 1024;
      setError(null);
      setUploading(true);

      // Check total images limit
      if (uploadedImages.length + files.length > maxImages) {
        const error =
          t('maxImagesError')?.replace('{maxImages}', maxImages.toString()) ||
          `You can only upload up to ${maxImages} images.`;
        setError(error);
        setUploading(false);
        if (onError) onError(error);
        return;
      }

      try {
        // Get compression settings
        const compressionOptions = deviceInfo?.recommendedCompression || {
          maxWidth: 800,
          quality: 0.8,
          useWorker: true,
        };

        // Process images progressively (one at a time to manage memory)
        const results = await imageCompressor.compressMultiple(
          Array.from(files),
          compressionOptions,
          onProgress
        );

        // Update state with new images
        const newImageUrls = results.map((result) => result.dataUrl);
        const allImages = [...uploadedImages, ...newImageUrls];
        const allCompressionResults = [...compressionResults, ...results];

        setCompressionResults(allCompressionResults);

        if (onImagesUpload) {
          onImagesUpload(allImages, allCompressionResults);
        }

        // Log results in development
        if (process.env.NODE_ENV === 'development') {
          console.log('📸 Multiple Image Compression Results:', {
            processedImages: results.length,
            totalSavings: results.reduce(
              (sum, r) => sum + (r.originalSize - r.compressedSize),
              0
            ),
            averageCompressionRatio: (
              results.reduce((sum, r) => sum + r.compressionRatio, 0) /
              results.length
            ).toFixed(2),
          });
        }
      } catch (error) {
        console.error('Multiple image compression failed:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to process images';
        setError(errorMessage);
        if (onError) onError(errorMessage);
      } finally {
        setUploading(false);
        cleanup();
      }
    },
    [
      maxSizeBytes,
      deviceInfo,
      uploadedImages,
      maxImages,
      compressionResults,
      t,
      onError,
      onProgress,
      onImagesUpload,
      cleanup,
    ]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles]
  );

  const handleClick = useCallback(() => {
    if (disabled || uploading || uploadedImages.length >= maxImages) return;

    // If mobile and camera is available, show action sheet
    if ((isMobile || deviceInfo?.isMobile) && deviceInfo?.hasCamera) {
      setShowActionSheet(true);
    } else {
      // Fallback to file picker
      fileInputRef.current?.click();
    }
  }, [
    disabled,
    uploading,
    uploadedImages.length,
    maxImages,
    isMobile,
    deviceInfo,
  ]);

  const handleCameraSelect = useCallback(() => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  }, []);

  const handleGallerySelect = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const getButtonText = () => {
    if (uploading) {
      return t('uploading') || 'Uploading...';
    }
    if (uploadedImages.length === 0) {
      return t('addPhotos') || 'Add photos';
    }
    return t('addMore') || 'Add more';
  };

  const isAddButtonDisabled =
    disabled || uploading || uploadedImages.length >= maxImages;

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
          <div key={`${image}-${index}`} className="relative aspect-square">
            <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100">
              <img
                src={image}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || disabled}
              aria-label={`Remove photo ${index + 1}`}
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
              disabled={isAddButtonDisabled}
              className={`w-full h-full rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center transition-colors
                ${
                  isAddButtonDisabled
                    ? 'bg-gray-50 cursor-not-allowed opacity-50'
                    : 'bg-gray-50 hover:bg-gray-100 hover:border-gray-400 cursor-pointer'
                }`}
              aria-label="Add new photo"
            >
              {uploading ? (
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Plus
                  size={24}
                  className={
                    isAddButtonDisabled ? 'text-gray-400' : 'text-gray-600'
                  }
                />
              )}
              <p
                className={`text-xs mt-2 text-center px-2 ${
                  isAddButtonDisabled ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {getButtonText()}
              </p>
            </button>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isAddButtonDisabled}
            />

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isAddButtonDisabled}
            />
          </div>
        )}
      </div>

      {/* Upload Info */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-500">
          {uploadedImages.length}/{maxImages} {t('photosCount') || 'photos'}
        </p>
        <p className="text-xs text-gray-500">
          {t('maxFileSize') || 'Max'}:{' '}
          {maxSizeBytes
            ? `${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB`
            : deviceInfo
              ? `${(deviceInfo.maxImageSize / 1024 / 1024).toFixed(1)}MB`
              : '5MB'}
        </p>
      </div>


      {/* Photo Action Sheet */}
      <PhotoActionSheet
        open={showActionSheet}
        onOpenChange={setShowActionSheet}
        onCameraSelect={handleCameraSelect}
        onGallerySelect={handleGallerySelect}
        showCameraOption={deviceInfo?.hasCamera ?? true}
        showGalleryOption={true}
      />
    </div>
  );
};

export default EnhancedMultiplePhotoUpload;

/**
 * Enhanced PhotoUpload component with camera/gallery selection, memory management, and performance optimizations
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PhotoActionSheet } from './PhotoActionSheet';
import { imageCompressor, CompressionResult } from '@/lib/image-compression';
import {
  deviceCapabilities,
  DeviceCapabilities,
} from '@/lib/device-capabilities';
import { useCommonTranslation } from '@/hooks/useTranslations';
import { isIOS } from '@/lib/device-utils';

interface EnhancedPhotoUploadProps {
  isMobile?: boolean;
  hint?: string;
  onImageUpload?: (
    imageUrl: string,
    compressionInfo?: CompressionResult
  ) => void;
  uploadedImage?: string | null;
  maxSizeBytes?: number;
  onError?: (error: string) => void;
  onCompressionStart?: () => void;
  onCompressionEnd?: () => void;
  disabled?: boolean;
}

export const EnhancedPhotoUpload: React.FC<EnhancedPhotoUploadProps> = ({
  isMobile,
  hint,
  onImageUpload,
  uploadedImage,
  maxSizeBytes,
  onError,
  onCompressionStart,
  onCompressionEnd,
  disabled = false,
}) => {
  const { t } = useCommonTranslation();
  const [hovered, setHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceCapabilities | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Initialize device capabilities
  useEffect(() => {
    const initializeDevice = async () => {
      try {
        const capabilities = await deviceCapabilities.detect();
        setDeviceInfo(capabilities);

        // Log capabilities in development
        if (process.env.NODE_ENV === 'development') {
          deviceCapabilities.logCapabilities();
        }
      } catch (error) {
        console.error('Failed to detect device capabilities:', error);
      }
    };

    initializeDevice();
  }, []);

  // Cleanup function for memory management
  const cleanup = useCallback(() => {
    // Clean up any pending compressions
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

  const handleRemoveImage = useCallback(() => {
    setImageError(false);
    cleanup();
    if (onImageUpload) {
      onImageUpload('');
    }
  }, [onImageUpload, cleanup]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      if (!file) return;

      const effectiveMaxSize =
        maxSizeBytes || deviceInfo?.maxImageSize || 5 * 1024 * 1024;

      // Validate file size
      if (file.size > effectiveMaxSize) {
        const maxSizeMB = (effectiveMaxSize / 1024 / 1024).toFixed(1);
        const error =
          t('imageUploadError') || `File size must be less than ${maxSizeMB}MB`;
        if (onError) {
          onError(error);
        } else {
          alert(error);
        }
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        const error =
          t('invalidFileTypeError') ||
          'Please select a JPEG, PNG, or WebP image file';
        if (onError) {
          onError(error);
        } else {
          alert(error);
        }
        return;
      }

      setIsProcessing(true);
      onCompressionStart?.();

      try {
        // Get adaptive compression settings
        const compressionOptions = deviceInfo?.recommendedCompression || {
          maxWidth: 800,
          quality: 0.8,
          useWorker: true,
        };

        // Compress image
        const result = await imageCompressor.compressImage(
          file,
          compressionOptions
        );

        setImageError(false);
        if (onImageUpload) {
          onImageUpload(result.dataUrl, result);
        }

        // Log compression results in development
        if (process.env.NODE_ENV === 'development') {
          console.log('📸 Image Compression Results:', {
            originalSize: `${(result.originalSize / 1024 / 1024).toFixed(2)}MB`,
            compressedSize: `${(result.compressedSize / 1024 / 1024).toFixed(2)}MB`,
            compressionRatio: `${result.compressionRatio.toFixed(2)}x`,
            settings: compressionOptions,
          });
        }
      } catch (error) {
        console.error('Image compression failed:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to process image';
        if (onError) {
          onError(errorMessage);
        } else {
          alert(errorMessage);
        }
      } finally {
        setIsProcessing(false);
        onCompressionEnd?.();
        cleanup();
      }
    },
    [
      maxSizeBytes,
      deviceInfo,
      t,
      onError,
      onCompressionStart,
      onCompressionEnd,
      onImageUpload,
      cleanup,
    ]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleClick = useCallback(() => {
    if (disabled || isProcessing) return;

    // On iOS devices, skip our custom modal and use native picker directly
    // This avoids the double-modal issue where users see both our modal and iOS modal
    if (isIOS()) {
      fileInputRef.current?.click();
      return;
    }

    // For non-iOS mobile devices with camera, show our custom action sheet
    if ((isMobile || deviceInfo?.isMobile) && deviceInfo?.hasCamera) {
      setShowActionSheet(true);
    } else {
      // Fallback to file picker for desktop
      fileInputRef.current?.click();
    }
  }, [disabled, isProcessing, isMobile, deviceInfo]);

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

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (disabled || isProcessing) return;
      e.preventDefault();
      setHovered(true);
    },
    [disabled, isProcessing]
  );

  const handleDragLeave = useCallback(() => {
    setHovered(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (disabled || isProcessing) return;
      e.preventDefault();
      setHovered(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [disabled, isProcessing, processFile]
  );

  const getStatusText = () => {
    if (isProcessing) {
      return t('uploading') || 'Processing...';
    }
    if (isMobile || deviceInfo?.isMobile) {
      if (deviceInfo?.hasCamera) {
        return (
          t('tapToTakePhotoOrChoose') || 'Tap to take photo or choose file'
        );
      } else {
        return t('tapToChooseFile') || 'Tap to choose file';
      }
    }
    return t('dragDropOrClick') || 'Drag & drop or click to choose files';
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 w-full">
        <div className="w-full">
          <div className="flex flex-col gap-[13px] w-full">
            <div className={isMobile ? 'h-[100px] w-full' : 'h-[140px] w-full'}>
              {uploadedImage ? (
                // Image Preview State
                <div className="flex items-center justify-start w-full h-full bg-white rounded-xl border border-dashed border-[rgba(2,29,19,0.36)] pl-4">
                  <div className="relative w-24 h-24">
                    {imageError ? (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={uploadedImage}
                        alt="Uploaded preview"
                        className="w-full h-full object-cover rounded-lg"
                        onError={handleImageError}
                      />
                    )}
                    <button
                      onClick={handleRemoveImage}
                      disabled={disabled || isProcessing}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 3L3 9M3 3L9 9"
                          stroke="#024209"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                // Upload State
                <div
                  className={`flex flex-col gap-3.5 w-full h-full bg-white rounded-xl relative transition-colors cursor-pointer
                    ${hovered ? 'bg-[#eafcd6] border-[#a6f175]' : ''}
                    ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onMouseEnter={() =>
                    !disabled && !isProcessing && setHovered(true)
                  }
                  onMouseLeave={() => setHovered(false)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleClick}
                  tabIndex={disabled || isProcessing ? -1 : 0}
                  onFocus={() => !disabled && !isProcessing && setHovered(true)}
                  onBlur={() => setHovered(false)}
                  role="button"
                  aria-disabled={disabled || isProcessing}
                >
                  <div
                    className={`absolute inset-0 border border-dashed pointer-events-none rounded-xl transition-colors ${hovered ? 'border-[#a6f175]' : 'border-[rgba(2,29,19,0.36)]'}`}
                  />
                  <div className="flex flex-col items-center justify-center w-full h-full px-4 py-3.5">
                    <div
                      className={
                        isMobile ? 'w-[22px] h-[22px]' : 'w-[26px] h-[26px]'
                      }
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full border-2 border-primary border-t-transparent w-full h-full" />
                      ) : (
                        <svg
                          className="block w-full h-full"
                          fill="none"
                          viewBox="0 0 26 26"
                        >
                          <path
                            d="M23.7714 16.7154L21.631 14.5751C21.5571 14.5011 21.5158 14.4689 21.4928 14.454L21.4614 14.4342C20.7997 14.0259 19.9439 14.0718 19.3271 14.5653L15.3928 17.7129C14.0035 18.8241 12.0545 18.9089 10.5742 17.922L9.81765 17.4177C9.12842 16.9583 8.21946 17.0113 7.58881 17.5444L2.41217 22.721C2.71245 23.3425 3.34972 23.7714 4.08573 23.7714H21.9143C22.94 23.7714 23.7714 22.94 23.7714 21.9143V16.7154ZM10.4 8.54288C10.4 7.5172 9.56858 6.68573 8.54288 6.68572C7.5172 6.68572 6.68572 7.5172 6.68572 8.54288C6.68573 9.56858 7.5172 10.4 8.54288 10.4C9.56858 10.4 10.4 9.56858 10.4 8.54288ZM23.7714 4.08573C23.7714 3.07607 22.9658 2.25461 21.9622 2.22918L21.9143 2.22857H4.08573C3.06006 2.22857 2.22857 3.06006 2.22857 4.08573V19.7529L6.04283 15.9387L6.06951 15.9129C6.07854 15.9045 6.08771 15.8962 6.09702 15.888L6.12971 15.8597C7.51795 14.6705 9.52987 14.5475 11.0537 15.5634L11.8102 16.0676L11.842 16.0883C12.5107 16.5149 13.379 16.4699 14.0007 15.9726L17.9349 12.8251L17.9673 12.7994C19.3332 11.729 21.2161 11.6442 22.6663 12.5593L22.7008 12.5813L22.7404 12.6074C22.9348 12.7382 23.0905 12.8828 23.2073 12.9998L23.7714 13.5639V4.08573ZM12.6286 8.54288C12.6286 10.7994 10.7994 12.6286 8.54288 12.6286C6.28641 12.6286 4.45715 10.7994 4.45715 8.54288C4.45715 6.2864 6.2864 4.45715 8.54288 4.45715C10.7994 4.45715 12.6286 6.28641 12.6286 8.54288ZM26 21.9143C26 24.1708 24.1708 26 21.9143 26H4.08573C2.07291 26 0.401945 24.5455 0.0627221 22.6304L0.0549744 22.5851C0.0187493 22.3662 8.39414e-07 22.1421 0 21.9143V4.08573C0 1.82925 1.82925 0 4.08573 0H21.9143L21.9671 0.000348214C24.1993 0.0286246 26 1.84689 26 4.08573V21.9143Z"
                            fill="#024209"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="font-manrope text-[#021d13] text-[14px] text-center opacity-70 w-[146px]">
                      {getStatusText()}
                    </div>
                    {hint && !isProcessing && (
                      <div className="mt-2 flex items-center gap-2 text-[#021d13] text-xs font-manrope opacity-60">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="8" cy="8" r="8" fill="#a6f175" />
                          <path
                            d="M8 4V8"
                            stroke="#024209"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <circle cx="8" cy="11" r="1" fill="#024209" />
                        </svg>
                        <span>{hint}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
                disabled={disabled || isProcessing}
              />

              {/* Hidden camera input */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
                disabled={disabled || isProcessing}
              />
            </div>
          </div>
        </div>

        {/* File info */}
        <div className="w-full flex flex-row items-center justify-between text-[#021d13] text-[14px] font-manrope opacity-70">
          <div>
            {t('supportedFormats') || 'Supported formats: JPG, PNG, WebP'}
          </div>
          <div>
            {t('maxFileSize') || 'Max'}:{' '}
            {maxSizeBytes
              ? `${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB`
              : deviceInfo
                ? `${(deviceInfo.maxImageSize / 1024 / 1024).toFixed(1)}MB`
                : '5MB'}
          </div>
        </div>
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

export default EnhancedPhotoUpload;

'use client';

/**
 * Test page for Enhanced Photo Upload components
 * Remove this file before production deployment
 */

import React, { useState } from 'react';
import { EnhancedPhotoUpload } from '@/components/ui/EnhancedPhotoUpload';
import { EnhancedMultiplePhotoUpload } from '@/components/ui/EnhancedMultiplePhotoUpload';
import { CompressionResult } from '@/lib/image-compression';
import { deviceCapabilities } from '@/lib/device-capabilities';

export default function TestEnhancedUploadPage() {
  const [singleImage, setSingleImage] = useState<string | null>(null);
  const [multipleImages, setMultipleImages] = useState<string[]>([]);
  const [singleCompressionInfo, setSingleCompressionInfo] =
    useState<CompressionResult | null>(null);
  const [multipleCompressionInfo, setMultipleCompressionInfo] = useState<
    CompressionResult[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    progress: number;
    current: number;
    total: number;
  } | null>(null);

  const handleSingleUpload = (
    imageUrl: string,
    compressionInfo?: CompressionResult
  ) => {
    setSingleImage(imageUrl);
    setSingleCompressionInfo(compressionInfo || null);
  };

  const handleMultipleUpload = (
    imageUrls: string[],
    compressionInfo?: CompressionResult[]
  ) => {
    setMultipleImages(imageUrls);
    setMultipleCompressionInfo(compressionInfo || []);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  const handleProgress = (prog: number, current: number, total: number) => {
    setProgress({ progress: prog, current, total });
    if (prog === 100) {
      setTimeout(() => setProgress(null), 1000);
    }
  };

  const logDeviceCapabilities = async () => {
    await deviceCapabilities.detect();
    deviceCapabilities.logCapabilities();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Enhanced Photo Upload Test
            </h1>
            <p className="text-gray-600 mb-4">
              Test page for the enhanced photo upload components with
              camera/gallery selection, Web Worker compression, and device-aware
              optimizations.
            </p>
            <button
              onClick={logDeviceCapabilities}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Log Device Capabilities
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {progress && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-600 mb-2">
                Processing image {progress.current} of {progress.total}
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Single Photo Upload */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Single Photo Upload
              </h2>

              <EnhancedPhotoUpload
                isMobile={false}
                hint="Test the camera/gallery selection"
                onImageUpload={handleSingleUpload}
                uploadedImage={singleImage}
                onError={handleError}
                onCompressionStart={() =>
                  console.log('Single compression started')
                }
                onCompressionEnd={() => console.log('Single compression ended')}
              />

              {singleImage && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Upload Result:
                  </h3>
                  <p className="text-sm text-gray-600">
                    Image uploaded successfully!
                  </p>

                  {singleCompressionInfo && (
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        <strong>Original:</strong>{' '}
                        {(
                          singleCompressionInfo.originalSize /
                          1024 /
                          1024
                        ).toFixed(2)}
                        MB
                      </p>
                      <p>
                        <strong>Compressed:</strong>{' '}
                        {(
                          singleCompressionInfo.compressedSize /
                          1024 /
                          1024
                        ).toFixed(2)}
                        MB
                      </p>
                      <p>
                        <strong>Ratio:</strong>{' '}
                        {singleCompressionInfo.compressionRatio.toFixed(2)}x
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Multiple Photo Upload */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Multiple Photo Upload
              </h2>

              <EnhancedMultiplePhotoUpload
                isMobile={false}
                hint="Test progressive compression"
                onImagesUpload={handleMultipleUpload}
                uploadedImages={multipleImages}
                maxImages={3}
                onError={handleError}
                onProgress={handleProgress}
              />

              {multipleImages.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Upload Results:
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {multipleImages.length} images uploaded successfully!
                  </p>

                  {multipleCompressionInfo.length > 0 && (
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Total Original:</strong>{' '}
                        {(
                          multipleCompressionInfo.reduce(
                            (sum, info) => sum + info.originalSize,
                            0
                          ) /
                          1024 /
                          1024
                        ).toFixed(2)}
                        MB
                      </p>
                      <p>
                        <strong>Total Compressed:</strong>{' '}
                        {(
                          multipleCompressionInfo.reduce(
                            (sum, info) => sum + info.compressedSize,
                            0
                          ) /
                          1024 /
                          1024
                        ).toFixed(2)}
                        MB
                      </p>
                      <p>
                        <strong>Total Saved:</strong>{' '}
                        {(
                          multipleCompressionInfo.reduce(
                            (sum, info) =>
                              sum + (info.originalSize - info.compressedSize),
                            0
                          ) /
                          1024 /
                          1024
                        ).toFixed(2)}
                        MB
                      </p>
                      <p>
                        <strong>Avg Ratio:</strong>{' '}
                        {(
                          multipleCompressionInfo.reduce(
                            (sum, info) => sum + info.compressionRatio,
                            0
                          ) / multipleCompressionInfo.length
                        ).toFixed(2)}
                        x
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Performance Notes */}
          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">
              Performance Testing Notes:
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>
                • Check browser console for device capability detection logs
              </li>
              <li>
                • Test on different device types (mobile, tablet, desktop)
              </li>
              <li>• Try different image sizes to see adaptive compression</li>
              <li>• Monitor memory usage in DevTools during compression</li>
              <li>• Test camera access on mobile devices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

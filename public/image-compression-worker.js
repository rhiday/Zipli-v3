/**
 * Web Worker for image compression
 * Runs image compression off the main thread to prevent UI blocking
 */

self.onmessage = async function (e) {
  const { imageData, options, id } = e.data;
  const {
    maxWidth = 800,
    quality = 0.8,
    maxMemoryUsage = 50 * 1024 * 1024,
  } = options;

  try {
    // Create canvas and context in worker
    const canvas = new OffscreenCanvas(1, 1);
    const ctx = canvas.getContext('2d');

    // Create image bitmap from data
    const blob = await fetch(imageData).then((r) => r.blob());
    const bitmap = await createImageBitmap(blob);

    // Check memory usage before processing
    const estimatedMemory = bitmap.width * bitmap.height * 4; // 4 bytes per pixel (RGBA)
    if (estimatedMemory > maxMemoryUsage) {
      throw new Error('Image too large for available memory');
    }

    // Calculate new dimensions
    const ratio = Math.min(maxWidth / bitmap.width, maxWidth / bitmap.height);
    const newWidth = Math.floor(bitmap.width * ratio);
    const newHeight = Math.floor(bitmap.height * ratio);

    // Resize canvas
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Draw and compress image
    ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);

    // Convert to blob
    const compressedBlob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: quality,
    });

    // Convert blob to data URL
    const reader = new FileReader();
    reader.onload = function () {
      // Send result back to main thread
      self.postMessage({
        success: true,
        id: id,
        result: reader.result,
        originalSize: blob.size,
        compressedSize: compressedBlob.size,
        compressionRatio: (blob.size / compressedBlob.size).toFixed(2),
      });
    };

    reader.onerror = function () {
      self.postMessage({
        success: false,
        id: id,
        error: 'Failed to read compressed image',
      });
    };

    reader.readAsDataURL(compressedBlob);

    // Clean up
    bitmap.close();
  } catch (error) {
    self.postMessage({
      success: false,
      id: id,
      error: error.message,
    });
  }
};

// Handle worker errors
self.onerror = function (error) {
  self.postMessage({
    success: false,
    error: `Worker error: ${error.message}`,
  });
};

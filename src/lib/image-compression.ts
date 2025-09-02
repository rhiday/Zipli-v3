/**
 * Image compression utilities with Web Worker support and memory management
 */

interface CompressionOptions {
  maxWidth?: number;
  quality?: number;
  maxMemoryUsage?: number;
  useWorker?: boolean;
}

interface CompressionResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

interface WorkerMessage {
  success: boolean;
  id: string;
  result?: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: string;
  error?: string;
}

class ImageCompressor {
  private worker: Worker | null = null;
  private workerPromises: Map<string, { resolve: Function; reject: Function }> =
    new Map();
  private isWorkerSupported: boolean = false;

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker() {
    if (
      typeof window !== 'undefined' &&
      'Worker' in window &&
      'OffscreenCanvas' in window
    ) {
      try {
        this.worker = new Worker('/image-compression-worker.js');
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
        this.worker.onerror = this.handleWorkerError.bind(this);
        this.isWorkerSupported = true;
      } catch (error) {
        console.warn(
          'Web Worker not supported, falling back to main thread compression'
        );
        this.isWorkerSupported = false;
      }
    }
  }

  private handleWorkerMessage(e: MessageEvent<WorkerMessage>) {
    const {
      success,
      id,
      result,
      originalSize,
      compressedSize,
      compressionRatio,
      error,
    } = e.data;
    const promise = this.workerPromises.get(id);

    if (promise) {
      if (success && result) {
        promise.resolve({
          dataUrl: result,
          originalSize: originalSize || 0,
          compressedSize: compressedSize || 0,
          compressionRatio: parseFloat(compressionRatio || '1'),
        });
      } else {
        promise.reject(new Error(error || 'Compression failed'));
      }
      this.workerPromises.delete(id);
    }
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('Worker error:', error);
    // Reject all pending promises
    this.workerPromises.forEach(({ reject }) => {
      reject(new Error('Worker crashed'));
    });
    this.workerPromises.clear();
  }

  /**
   * Compress image using Web Worker (non-blocking) or fallback to main thread
   */
  async compressImage(
    file: File,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const {
      maxWidth = 800,
      quality = 0.8,
      maxMemoryUsage = 50 * 1024 * 1024, // 50MB
      useWorker = true,
    } = options;

    // Use worker if supported and requested
    if (this.isWorkerSupported && useWorker && this.worker) {
      return this.compressWithWorker(file, {
        maxWidth,
        quality,
        maxMemoryUsage,
      });
    }

    // Fallback to main thread compression
    return this.compressOnMainThread(file, { maxWidth, quality });
  }

  private async compressWithWorker(
    file: File,
    options: CompressionOptions
  ): Promise<CompressionResult> {
    const id = Math.random().toString(36).substr(2, 9);
    const imageData = await this.fileToDataUrl(file);

    return new Promise((resolve, reject) => {
      this.workerPromises.set(id, { resolve, reject });

      // Set timeout for worker response
      setTimeout(() => {
        if (this.workerPromises.has(id)) {
          this.workerPromises.delete(id);
          reject(new Error('Compression timeout'));
        }
      }, 30000); // 30 second timeout

      this.worker?.postMessage({
        imageData,
        options,
        id,
      });
    });
  }

  private async compressOnMainThread(
    file: File,
    options: CompressionOptions
  ): Promise<CompressionResult> {
    const { maxWidth = 800, quality = 0.8 } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;

          // Draw and compress
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          // Calculate sizes (approximate)
          const originalSize = file.size;
          const compressedSize = Math.round(
            ((compressedDataUrl.length - 'data:image/jpeg;base64,'.length) *
              3) /
              4
          );

          resolve({
            dataUrl: compressedDataUrl,
            originalSize,
            compressedSize,
            compressionRatio: originalSize / compressedSize,
          });

          // Clean up
          img.src = '';
          canvas.width = 0;
          canvas.height = 0;
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));

      // Convert file to data URL
      this.fileToDataUrl(file)
        .then((dataUrl) => {
          img.src = dataUrl;
        })
        .catch(reject);
    });
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compress multiple images progressively (one at a time to manage memory)
   */
  async compressMultiple(
    files: File[],
    options: CompressionOptions = {},
    onProgress?: (progress: number, current: number, total: number) => void
  ): Promise<CompressionResult[]> {
    const results: CompressionResult[] = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const result = await this.compressImage(file, options);
        results.push(result);

        if (onProgress) {
          onProgress(((i + 1) / total) * 100, i + 1, total);
        }
      } catch (error) {
        console.error(`Failed to compress image ${i + 1}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Get device-appropriate compression settings
   */
  getAdaptiveSettings(): CompressionOptions {
    if (typeof window === 'undefined') {
      return { maxWidth: 800, quality: 0.8 };
    }

    // Check available memory (if supported)
    const memory = (navigator as any).deviceMemory || 4; // Default to 4GB if not available
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType || 'unknown';

    // Adaptive settings based on device capabilities
    if (memory <= 2) {
      // Low-end device
      return {
        maxWidth: 600,
        quality: 0.6,
        maxMemoryUsage: 20 * 1024 * 1024, // 20MB
        useWorker: false, // Use main thread to avoid worker overhead
      };
    } else if (memory <= 4) {
      // Mid-range device
      return {
        maxWidth: 800,
        quality: 0.7,
        maxMemoryUsage: 40 * 1024 * 1024, // 40MB
        useWorker: true,
      };
    } else {
      // High-end device
      return {
        maxWidth: 1200,
        quality: 0.8,
        maxMemoryUsage: 80 * 1024 * 1024, // 80MB
        useWorker: true,
      };
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.workerPromises.clear();
  }
}

// Export singleton instance
export const imageCompressor = new ImageCompressor();

// Export types
export type { CompressionOptions, CompressionResult };

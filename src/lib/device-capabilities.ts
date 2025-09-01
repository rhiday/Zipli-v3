/**
 * Device capabilities detection and performance optimization
 */

export interface DeviceCapabilities {
  isMobile: boolean;
  isLowEndDevice: boolean;
  hasCamera: boolean;
  supportsGetUserMedia: boolean;
  memory: number; // GB
  connectionType: string;
  maxImageSize: number; // bytes
  recommendedCompression: {
    maxWidth: number;
    quality: number;
    useWorker: boolean;
  };
}

class DeviceCapabilityDetector {
  private capabilities: DeviceCapabilities | null = null;

  /**
   * Detect and cache device capabilities
   */
  async detect(): Promise<DeviceCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    const capabilities: DeviceCapabilities = {
      isMobile: this.detectMobile(),
      isLowEndDevice: this.detectLowEndDevice(),
      hasCamera: await this.detectCamera(),
      supportsGetUserMedia: this.detectGetUserMedia(),
      memory: this.getDeviceMemory(),
      connectionType: this.getConnectionType(),
      maxImageSize: this.getMaxImageSize(),
      recommendedCompression: this.getRecommendedCompression(),
    };

    // Cache the result
    this.capabilities = capabilities;
    return capabilities;
  }

  /**
   * Detect mobile device
   */
  private detectMobile(): boolean {
    if (typeof window === 'undefined') return false;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      'android',
      'webos',
      'iphone',
      'ipad',
      'ipod',
      'blackberry',
      'windows phone',
    ];

    return (
      mobileKeywords.some((keyword) => userAgent.includes(keyword)) ||
      window.innerWidth <= 768 ||
      'ontouchstart' in window
    );
  }

  /**
   * Detect low-end device based on various factors
   */
  private detectLowEndDevice(): boolean {
    if (typeof window === 'undefined') return false;

    const memory = (navigator as any).deviceMemory || 4;
    const connection = (navigator as any).connection;
    const cores = navigator.hardwareConcurrency || 4;

    // Consider low-end if:
    // - Less than 2GB RAM
    // - Less than 2 CPU cores
    // - Slow network connection
    // - Very small screen
    const isLowMemory = memory < 2;
    const isLowCPU = cores < 2;
    const isSlowConnection =
      connection?.effectiveType === '2g' ||
      connection?.effectiveType === 'slow-2g';
    const isSmallScreen = window.innerWidth < 400;

    return isLowMemory || (isLowCPU && (isSlowConnection || isSmallScreen));
  }

  /**
   * Detect camera availability
   */
  private async detectCamera(): Promise<boolean> {
    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      return false;
    }

    try {
      // Try to enumerate devices to check for camera
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((device) => device.kind === 'videoinput');
    } catch (error) {
      console.warn('Failed to detect camera:', error);
      return false;
    }
  }

  /**
   * Detect getUserMedia support
   */
  private detectGetUserMedia(): boolean {
    if (typeof window === 'undefined') return false;

    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Get device memory in GB
   */
  private getDeviceMemory(): number {
    if (typeof window === 'undefined') return 4;
    return (navigator as any).deviceMemory || 4; // Default to 4GB
  }

  /**
   * Get connection type
   */
  private getConnectionType(): string {
    if (typeof window === 'undefined') return 'unknown';

    const connection = (navigator as any).connection;
    return connection?.effectiveType || 'unknown';
  }

  /**
   * Get maximum recommended image size based on device
   */
  private getMaxImageSize(): number {
    const memory = this.getDeviceMemory();
    const isMobile = this.detectMobile();

    if (memory < 2 || this.detectLowEndDevice()) {
      return 2 * 1024 * 1024; // 2MB for low-end devices
    } else if (memory < 4 || isMobile) {
      return 5 * 1024 * 1024; // 5MB for mid-range devices
    } else {
      return 10 * 1024 * 1024; // 10MB for high-end devices
    }
  }

  /**
   * Get recommended compression settings
   */
  private getRecommendedCompression() {
    const memory = this.getDeviceMemory();
    const isLowEnd = this.detectLowEndDevice();
    const isMobile = this.detectMobile();

    if (isLowEnd || memory < 2) {
      return {
        maxWidth: 600,
        quality: 0.6,
        useWorker: false, // Avoid worker overhead on low-end devices
      };
    } else if (memory < 4 || isMobile) {
      return {
        maxWidth: 800,
        quality: 0.7,
        useWorker: true,
      };
    } else {
      return {
        maxWidth: 1200,
        quality: 0.8,
        useWorker: true,
      };
    }
  }

  /**
   * Check if feature is supported
   */
  isFeatureSupported(feature: string): boolean {
    switch (feature) {
      case 'webworker':
        return typeof Worker !== 'undefined';
      case 'offscreencanvas':
        return typeof OffscreenCanvas !== 'undefined';
      case 'camera':
        return this.supportsGetUserMedia();
      case 'touch':
        return 'ontouchstart' in window;
      case 'devicememory':
        return 'deviceMemory' in navigator;
      case 'networkinfo':
        return 'connection' in navigator;
      default:
        return false;
    }
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.detectLowEndDevice()) {
      recommendations.push('Use smaller image sizes and lower quality');
      recommendations.push('Disable animations and transitions');
      recommendations.push('Process images one at a time');
    }

    if (
      this.getConnectionType() === '2g' ||
      this.getConnectionType() === 'slow-2g'
    ) {
      recommendations.push('Compress images more aggressively');
      recommendations.push('Consider offline-first approach');
    }

    if (this.getDeviceMemory() < 2) {
      recommendations.push('Avoid Web Workers due to memory constraints');
      recommendations.push('Clear image data immediately after processing');
    }

    return recommendations;
  }

  /**
   * Log device capabilities for debugging
   */
  logCapabilities() {
    if (!this.capabilities) {
      console.warn(
        'Device capabilities not detected yet. Call detect() first.'
      );
      return;
    }

    console.group('🔧 Device Capabilities');
    console.log('Mobile:', this.capabilities.isMobile);
    console.log('Low-end device:', this.capabilities.isLowEndDevice);
    console.log('Has camera:', this.capabilities.hasCamera);
    console.log(
      'Supports getUserMedia:',
      this.capabilities.supportsGetUserMedia
    );
    console.log('Memory:', `${this.capabilities.memory}GB`);
    console.log('Connection:', this.capabilities.connectionType);
    console.log(
      'Max image size:',
      `${(this.capabilities.maxImageSize / 1024 / 1024).toFixed(1)}MB`
    );
    console.log(
      'Recommended compression:',
      this.capabilities.recommendedCompression
    );

    const recommendations = this.getPerformanceRecommendations();
    if (recommendations.length > 0) {
      console.log('Performance recommendations:', recommendations);
    }

    console.groupEnd();
  }

  /**
   * Reset cached capabilities (useful for testing)
   */
  reset() {
    this.capabilities = null;
  }
}

// Export singleton instance
export const deviceCapabilities = new DeviceCapabilityDetector();

// Export types
export type { DeviceCapabilities };

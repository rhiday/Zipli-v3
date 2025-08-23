/**
 * Performance monitoring utilities for tracking mobile performance
 */

interface PerformanceMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  TTI?: number; // Time to Interactive
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observer: PerformanceObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObserver();
    }
  }

  private initializeObserver() {
    try {
      // Observe paint timing
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.FCP = Math.round(entry.startTime);
            }
          }

          if (entry.entryType === 'largest-contentful-paint') {
            this.metrics.LCP = Math.round(entry.startTime);
          }

          if (entry.entryType === 'first-input' && 'processingStart' in entry) {
            const firstInput = entry as any;
            this.metrics.FID = Math.round(
              firstInput.processingStart - firstInput.startTime
            );
          }

          if (
            entry.entryType === 'layout-shift' &&
            !(entry as any).hadRecentInput
          ) {
            this.metrics.CLS = (this.metrics.CLS || 0) + (entry as any).value;
          }
        }
      });

      // Observe different performance metrics
      if (this.observer.observe) {
        this.observer.observe({
          entryTypes: [
            'paint',
            'largest-contentful-paint',
            'first-input',
            'layout-shift',
          ],
        });
      }
    } catch (e) {
      console.warn('Performance monitoring not available');
    }
  }

  // Get Time to First Byte
  getTTFB(): number | undefined {
    if (
      typeof window !== 'undefined' &&
      window.performance &&
      window.performance.timing
    ) {
      const { responseStart, requestStart } = window.performance.timing;
      if (responseStart && requestStart) {
        return responseStart - requestStart;
      }
    }
    return undefined;
  }

  // Check if running on mobile
  isMobile(): boolean {
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
      window.innerWidth <= 768
    );
  }

  // Get connection type
  getConnectionType(): string {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  // Log performance metrics
  logMetrics() {
    const isMobile = this.isMobile();
    const connectionType = this.getConnectionType();

    console.group(
      `📊 Performance Metrics (${isMobile ? 'Mobile' : 'Desktop'} - ${connectionType})`
    );
    console.log('First Contentful Paint (FCP):', this.metrics.FCP, 'ms');
    console.log('Largest Contentful Paint (LCP):', this.metrics.LCP, 'ms');
    console.log('First Input Delay (FID):', this.metrics.FID, 'ms');
    console.log('Cumulative Layout Shift (CLS):', this.metrics.CLS?.toFixed(3));
    console.log('Time to First Byte (TTFB):', this.getTTFB(), 'ms');
    console.groupEnd();

    // Performance recommendations
    if (isMobile) {
      this.logMobileRecommendations();
    }
  }

  private logMobileRecommendations() {
    const recommendations = [];

    if (this.metrics.LCP && this.metrics.LCP > 2500) {
      recommendations.push(
        '⚠️ LCP is above 2.5s - Consider optimizing images and fonts'
      );
    }

    if (this.metrics.FID && this.metrics.FID > 100) {
      recommendations.push(
        '⚠️ FID is above 100ms - Reduce JavaScript execution time'
      );
    }

    if (this.metrics.CLS && this.metrics.CLS > 0.1) {
      recommendations.push(
        '⚠️ CLS is above 0.1 - Add size attributes to images and videos'
      );
    }

    if (recommendations.length > 0) {
      console.group('💡 Mobile Performance Recommendations');
      recommendations.forEach((rec) => console.log(rec));
      console.groupEnd();
    }
  }

  // Get all metrics
  getMetrics(): PerformanceMetrics & {
    isMobile: boolean;
    connectionType: string;
  } {
    return {
      ...this.metrics,
      TTFB: this.getTTFB(),
      isMobile: this.isMobile(),
      connectionType: this.getConnectionType(),
    };
  }

  // Clean up observer
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Export singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export const getPerformanceMonitor = (): PerformanceMonitor => {
  if (!performanceMonitor && typeof window !== 'undefined') {
    performanceMonitor = new PerformanceMonitor();

    // Log metrics when page is fully loaded
    if (document.readyState === 'complete') {
      setTimeout(() => performanceMonitor?.logMetrics(), 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => performanceMonitor?.logMetrics(), 1000);
      });
    }
  }

  return performanceMonitor || new PerformanceMonitor();
};

export default PerformanceMonitor;

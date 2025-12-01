/**
 * Performance Monitoring Utility
 * Tracks key metrics without external dependencies
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.enabled = import.meta.env.MODE !== 'production';
  }

  /**
   * Start timing an operation
   */
  startTimer(label) {
    if (!this.enabled) return;
    this.metrics.set(label, performance.now());
  }

  /**
   * End timing and log result
   */
  endTimer(label) {
    if (!this.enabled) return;
    const start = this.metrics.get(label);
    if (start) {
      const duration = performance.now() - start;
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      this.metrics.delete(label);
      return duration;
    }
  }

  /**
   * Measure function execution time
   */
  async measure(label, fn) {
    this.startTimer(label);
    try {
      const result = await fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }

  /**
   * Get current memory usage (if available)
   * Note: performance.memory is non-standard (Chrome only)
   */
  getMemoryUsage() {
    // @ts-ignore - performance.memory is non-standard
    if (performance.memory) {
      // @ts-ignore
      const mem = performance.memory;
      return {
        used: (mem.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        total: (mem.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        limit: (mem.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
      };
    }
    return null;
  }

  /**
   * Log performance summary
   */
  logSummary() {
    if (!this.enabled) return;
    
    console.group('📊 Performance Summary');
    
    // Navigation timing
    if (performance.timing) {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
      
      console.log(`Page Load: ${loadTime}ms`);
      console.log(`DOM Ready: ${domReady}ms`);
    }
    
    // Memory usage
    const memory = this.getMemoryUsage();
    if (memory) {
      console.log(`Memory: ${memory.used} / ${memory.limit}`);
    }
    
    console.groupEnd();
  }
}

export const perfMonitor = new PerformanceMonitor();

// Auto-log summary after page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => perfMonitor.logSummary(), 1000);
  });
}

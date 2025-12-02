/**
 * =============================================================================
 * PERFORMANCE MONITORING SERVICE
 * =============================================================================
 * Real-time performance tracking for surgical simulations and UI
 * 
 * Features:
 * - Frame rate monitoring (target: 60 FPS)
 * - Memory usage tracking
 * - API response time measurement
 * - Page load metrics
 * - Custom metric tracking
 * - Performance alerts
 * =============================================================================
 */

// =============================================================================
// TYPES
// =============================================================================

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface FrameRateStats {
  current: number;
  average: number;
  min: number;
  max: number;
  samples: number;
}

export interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
}

export interface PerformanceReport {
  timestamp: number;
  frameRate: FrameRateStats;
  memory: MemoryStats | null;
  customMetrics: Map<string, PerformanceMetric>;
  alerts: PerformanceAlert[];
}

export interface PerformanceAlert {
  metric: string;
  level: 'warning' | 'critical';
  value: number;
  threshold: number;
  timestamp: number;
  message: string;
}

type AlertCallback = (alert: PerformanceAlert) => void;

// =============================================================================
// PERFORMANCE MONITOR CLASS
// =============================================================================

class PerformanceMonitor {
  private isRunning: boolean = false;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private frameRates: number[] = [];
  private maxSamples: number = 60;
  private animationFrameId: number | null = null;
  private customMetrics: Map<string, PerformanceMetric> = new Map();
  private alerts: PerformanceAlert[] = [];
  private alertCallbacks: AlertCallback[] = [];
  private apiTimings: Map<string, number[]> = new Map();

  // Thresholds
  private readonly FPS_WARNING = 55;
  private readonly FPS_CRITICAL = 30;
  private readonly MEMORY_WARNING = 0.7; // 70%
  private readonly MEMORY_CRITICAL = 0.9; // 90%
  private readonly API_WARNING_MS = 500;
  private readonly API_CRITICAL_MS = 2000;

  // ==========================================================================
  // FRAME RATE MONITORING
  // ==========================================================================

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.measureFrame();
    console.log('[Performance] Monitoring started');
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log('[Performance] Monitoring stopped');
  }

  private measureFrame(): void {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    if (delta > 0) {
      const fps = 1000 / delta;
      this.frameRates.push(fps);
      
      // Keep only recent samples
      if (this.frameRates.length > this.maxSamples) {
        this.frameRates.shift();
      }

      // Check for FPS alerts
      if (fps < this.FPS_CRITICAL) {
        this.createAlert('frameRate', 'critical', fps, this.FPS_CRITICAL, 
          `Critical: Frame rate dropped to ${fps.toFixed(1)} FPS`);
      } else if (fps < this.FPS_WARNING) {
        this.createAlert('frameRate', 'warning', fps, this.FPS_WARNING,
          `Warning: Frame rate at ${fps.toFixed(1)} FPS`);
      }
    }

    this.frameCount++;
    this.animationFrameId = requestAnimationFrame(() => this.measureFrame());
  }

  getFrameRateStats(): FrameRateStats {
    if (this.frameRates.length === 0) {
      return { current: 0, average: 0, min: 0, max: 0, samples: 0 };
    }

    const current = this.frameRates[this.frameRates.length - 1];
    const sum = this.frameRates.reduce((a, b) => a + b, 0);
    const average = sum / this.frameRates.length;
    const min = Math.min(...this.frameRates);
    const max = Math.max(...this.frameRates);

    return {
      current: Math.round(current),
      average: Math.round(average),
      min: Math.round(min),
      max: Math.round(max),
      samples: this.frameRates.length
    };
  }

  // ==========================================================================
  // MEMORY MONITORING
  // ==========================================================================

  getMemoryStats(): MemoryStats | null {
    // @ts-expect-error - performance.memory is non-standard but available in Chrome
    const memory = performance.memory;
    if (!memory) return null;

    const stats: MemoryStats = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: memory.usedJSHeapSize / memory.jsHeapSizeLimit
    };

    // Check for memory alerts
    if (stats.usagePercentage > this.MEMORY_CRITICAL) {
      this.createAlert('memory', 'critical', stats.usagePercentage * 100, this.MEMORY_CRITICAL * 100,
        `Critical: Memory usage at ${(stats.usagePercentage * 100).toFixed(1)}%`);
    } else if (stats.usagePercentage > this.MEMORY_WARNING) {
      this.createAlert('memory', 'warning', stats.usagePercentage * 100, this.MEMORY_WARNING * 100,
        `Warning: Memory usage at ${(stats.usagePercentage * 100).toFixed(1)}%`);
    }

    return stats;
  }

  // ==========================================================================
  // API TIMING
  // ==========================================================================

  startApiCall(endpoint: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      
      if (!this.apiTimings.has(endpoint)) {
        this.apiTimings.set(endpoint, []);
      }
      
      const timings = this.apiTimings.get(endpoint)!;
      timings.push(duration);
      
      // Keep only last 100 timings per endpoint
      if (timings.length > 100) {
        timings.shift();
      }

      // Check for API alerts
      if (duration > this.API_CRITICAL_MS) {
        this.createAlert('api', 'critical', duration, this.API_CRITICAL_MS,
          `Critical: API call to ${endpoint} took ${duration.toFixed(0)}ms`);
      } else if (duration > this.API_WARNING_MS) {
        this.createAlert('api', 'warning', duration, this.API_WARNING_MS,
          `Warning: API call to ${endpoint} took ${duration.toFixed(0)}ms`);
      }

      return duration;
    };
  }

  getApiStats(endpoint: string): { average: number; min: number; max: number; count: number } | null {
    const timings = this.apiTimings.get(endpoint);
    if (!timings || timings.length === 0) return null;

    return {
      average: timings.reduce((a, b) => a + b, 0) / timings.length,
      min: Math.min(...timings),
      max: Math.max(...timings),
      count: timings.length
    };
  }

  // ==========================================================================
  // CUSTOM METRICS
  // ==========================================================================

  track(name: string, value: number, unit: string = '', threshold?: { warning: number; critical: number }): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      threshold
    };

    this.customMetrics.set(name, metric);

    // Check thresholds
    if (threshold) {
      if (value >= threshold.critical) {
        this.createAlert(name, 'critical', value, threshold.critical,
          `Critical: ${name} at ${value}${unit}`);
      } else if (value >= threshold.warning) {
        this.createAlert(name, 'warning', value, threshold.warning,
          `Warning: ${name} at ${value}${unit}`);
      }
    }
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.customMetrics.get(name);
  }

  // ==========================================================================
  // PAGE LOAD METRICS
  // ==========================================================================

  getPageLoadMetrics(): Record<string, number> | null {
    if (typeof window === 'undefined' || !window.performance) return null;

    const timing = performance.timing;
    if (!timing) return null;

    return {
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcpConnection: timing.connectEnd - timing.connectStart,
      serverResponse: timing.responseEnd - timing.requestStart,
      domParsing: timing.domInteractive - timing.responseEnd,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      fullPageLoad: timing.loadEventEnd - timing.navigationStart
    };
  }

  // ==========================================================================
  // ALERTS
  // ==========================================================================

  private createAlert(metric: string, level: 'warning' | 'critical', value: number, threshold: number, message: string): void {
    // Debounce alerts - don't create same alert within 5 seconds
    const recentAlert = this.alerts.find(a => 
      a.metric === metric && 
      a.level === level && 
      Date.now() - a.timestamp < 5000
    );
    
    if (recentAlert) return;

    const alert: PerformanceAlert = {
      metric,
      level,
      value,
      threshold,
      timestamp: Date.now(),
      message
    };

    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    // Notify callbacks
    this.alertCallbacks.forEach(cb => cb(alert));

    // Log to console
    if (level === 'critical') {
      console.error(`[Performance] ${message}`);
    } else {
      console.warn(`[Performance] ${message}`);
    }
  }

  onAlert(callback: AlertCallback): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  getAlerts(since?: number): PerformanceAlert[] {
    if (since) {
      return this.alerts.filter(a => a.timestamp >= since);
    }
    return [...this.alerts];
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  // ==========================================================================
  // REPORTING
  // ==========================================================================

  getReport(): PerformanceReport {
    return {
      timestamp: Date.now(),
      frameRate: this.getFrameRateStats(),
      memory: this.getMemoryStats(),
      customMetrics: new Map(this.customMetrics),
      alerts: this.getAlerts(Date.now() - 60000) // Last minute
    };
  }

  // ==========================================================================
  // SIMULATION-SPECIFIC TRACKING
  // ==========================================================================

  trackSimulationFrame(simId: string, frameTime: number): void {
    this.track(`sim_${simId}_frameTime`, frameTime, 'ms', {
      warning: 20, // 50 FPS
      critical: 33 // 30 FPS
    });
  }

  trackCanvasRender(canvasId: string, renderTime: number): void {
    this.track(`canvas_${canvasId}_render`, renderTime, 'ms', {
      warning: 16, // 60 FPS target
      critical: 33
    });
  }

  // ==========================================================================
  // UTILITY
  // ==========================================================================

  reset(): void {
    this.frameRates = [];
    this.customMetrics.clear();
    this.apiTimings.clear();
    this.alerts = [];
    this.frameCount = 0;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const performanceMonitor = new PerformanceMonitor();

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  return fn().finally(() => {
    const duration = performance.now() - start;
    performanceMonitor.track(name, duration, 'ms');
  });
}

export function measureSync<T>(name: string, fn: () => T): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    const duration = performance.now() - start;
    performanceMonitor.track(name, duration, 'ms');
  }
}

// Auto-start in browser environment
if (typeof window !== 'undefined') {
  // Start monitoring after page load
  if (document.readyState === 'complete') {
    performanceMonitor.start();
  } else {
    window.addEventListener('load', () => {
      performanceMonitor.start();
    });
  }

  // Stop when page is hidden to save resources
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      performanceMonitor.stop();
    } else {
      performanceMonitor.start();
    }
  });
}

export default performanceMonitor;

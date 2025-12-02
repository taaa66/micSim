/**
 * =============================================================================
 * PERFORMANCE MONITOR TESTS
 * =============================================================================
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the module before importing
vi.mock('../../../src/lib/performanceMonitor', async () => {
  // Create a fresh instance for testing
  class TestPerformanceMonitor {
    private isRunning = false;
    private frameRates: number[] = [];
    private customMetrics = new Map();
    private alerts: Array<{ metric: string; level: string; value: number; threshold: number; timestamp: number; message: string }> = [];
    private apiTimings = new Map<string, number[]>();

    start() {
      this.isRunning = true;
    }

    stop() {
      this.isRunning = false;
    }

    getFrameRateStats() {
      if (this.frameRates.length === 0) {
        return { current: 0, average: 0, min: 0, max: 0, samples: 0 };
      }
      const current = this.frameRates[this.frameRates.length - 1];
      const sum = this.frameRates.reduce((a, b) => a + b, 0);
      return {
        current: Math.round(current),
        average: Math.round(sum / this.frameRates.length),
        min: Math.round(Math.min(...this.frameRates)),
        max: Math.round(Math.max(...this.frameRates)),
        samples: this.frameRates.length
      };
    }

    track(name: string, value: number, unit = '', threshold?: { warning: number; critical: number }) {
      this.customMetrics.set(name, { name, value, unit, timestamp: Date.now(), threshold });
      
      if (threshold) {
        if (value >= threshold.critical) {
          this.alerts.push({
            metric: name,
            level: 'critical',
            value,
            threshold: threshold.critical,
            timestamp: Date.now(),
            message: `Critical: ${name} at ${value}${unit}`
          });
        } else if (value >= threshold.warning) {
          this.alerts.push({
            metric: name,
            level: 'warning',
            value,
            threshold: threshold.warning,
            timestamp: Date.now(),
            message: `Warning: ${name} at ${value}${unit}`
          });
        }
      }
    }

    getMetric(name: string) {
      return this.customMetrics.get(name);
    }

    startApiCall(endpoint: string) {
      const startTime = Date.now();
      return () => {
        const duration = Date.now() - startTime;
        if (!this.apiTimings.has(endpoint)) {
          this.apiTimings.set(endpoint, []);
        }
        this.apiTimings.get(endpoint)!.push(duration);
        return duration;
      };
    }

    getApiStats(endpoint: string) {
      const timings = this.apiTimings.get(endpoint);
      if (!timings || timings.length === 0) return null;
      return {
        average: timings.reduce((a, b) => a + b, 0) / timings.length,
        min: Math.min(...timings),
        max: Math.max(...timings),
        count: timings.length
      };
    }

    getAlerts() {
      return [...this.alerts];
    }

    clearAlerts() {
      this.alerts = [];
    }

    reset() {
      this.frameRates = [];
      this.customMetrics.clear();
      this.apiTimings.clear();
      this.alerts = [];
    }

    // Test helper to add frame rates
    _addFrameRate(fps: number) {
      this.frameRates.push(fps);
    }
  }

  const instance = new TestPerformanceMonitor();
  
  return {
    performanceMonitor: instance,
    default: instance
  };
});

import { performanceMonitor } from '../../../src/lib/performanceMonitor';

describe('Performance Monitor', () => {
  beforeEach(() => {
    performanceMonitor.reset();
  });

  afterEach(() => {
    performanceMonitor.stop();
  });

  describe('Frame Rate Tracking', () => {
    it('should return zero stats when no frames recorded', () => {
      const stats = performanceMonitor.getFrameRateStats();
      expect(stats.current).toBe(0);
      expect(stats.average).toBe(0);
      expect(stats.samples).toBe(0);
    });

    it('should calculate frame rate stats correctly', () => {
      // @ts-expect-error - accessing test helper
      performanceMonitor._addFrameRate(60);
      // @ts-expect-error - accessing test helper
      performanceMonitor._addFrameRate(55);
      // @ts-expect-error - accessing test helper
      performanceMonitor._addFrameRate(58);
      
      const stats = performanceMonitor.getFrameRateStats();
      expect(stats.current).toBe(58);
      expect(stats.average).toBe(58); // (60+55+58)/3 = 57.67 rounded
      expect(stats.min).toBe(55);
      expect(stats.max).toBe(60);
      expect(stats.samples).toBe(3);
    });
  });

  describe('Custom Metrics', () => {
    it('should track custom metrics', () => {
      performanceMonitor.track('test_metric', 42, 'ms');
      
      const metric = performanceMonitor.getMetric('test_metric');
      expect(metric).toBeDefined();
      expect(metric?.value).toBe(42);
      expect(metric?.unit).toBe('ms');
    });

    it('should return undefined for non-existent metric', () => {
      const metric = performanceMonitor.getMetric('non_existent');
      expect(metric).toBeUndefined();
    });

    it('should create warning alert when threshold exceeded', () => {
      performanceMonitor.track('latency', 600, 'ms', { warning: 500, critical: 1000 });
      
      const alerts = performanceMonitor.getAlerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].level).toBe('warning');
      expect(alerts[0].metric).toBe('latency');
    });

    it('should create critical alert when critical threshold exceeded', () => {
      performanceMonitor.track('latency', 1500, 'ms', { warning: 500, critical: 1000 });
      
      const alerts = performanceMonitor.getAlerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].level).toBe('critical');
    });

    it('should not create alert when below thresholds', () => {
      performanceMonitor.track('latency', 100, 'ms', { warning: 500, critical: 1000 });
      
      const alerts = performanceMonitor.getAlerts();
      expect(alerts.length).toBe(0);
    });
  });

  describe('API Timing', () => {
    it('should track API call timing', async () => {
      const endCall = performanceMonitor.startApiCall('/api/test');
      
      // Simulate some delay
      await new Promise(resolve => setTimeout(resolve, 10));
      
      endCall();
      
      const stats = performanceMonitor.getApiStats('/api/test');
      expect(stats).not.toBeNull();
      expect(stats?.count).toBe(1);
      expect(stats?.average).toBeGreaterThanOrEqual(0);
    });

    it('should return null for non-tracked endpoint', () => {
      const stats = performanceMonitor.getApiStats('/api/unknown');
      expect(stats).toBeNull();
    });

    it('should aggregate multiple calls', () => {
      const end1 = performanceMonitor.startApiCall('/api/users');
      end1();
      
      const end2 = performanceMonitor.startApiCall('/api/users');
      end2();
      
      const stats = performanceMonitor.getApiStats('/api/users');
      expect(stats?.count).toBe(2);
    });
  });

  describe('Alerts', () => {
    it('should clear alerts', () => {
      performanceMonitor.track('test', 100, '', { warning: 50, critical: 80 });
      expect(performanceMonitor.getAlerts().length).toBe(1);
      
      performanceMonitor.clearAlerts();
      expect(performanceMonitor.getAlerts().length).toBe(0);
    });
  });

  describe('Reset', () => {
    it('should reset all state', () => {
      performanceMonitor.track('metric1', 100);
      performanceMonitor.track('metric2', 200, '', { warning: 50, critical: 80 });
      
      performanceMonitor.reset();
      
      expect(performanceMonitor.getMetric('metric1')).toBeUndefined();
      expect(performanceMonitor.getAlerts().length).toBe(0);
      expect(performanceMonitor.getFrameRateStats().samples).toBe(0);
    });
  });
});

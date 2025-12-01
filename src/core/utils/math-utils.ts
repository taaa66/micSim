/**
 * =============================================================================
 * MATH UTILITIES (V14.0)
 * =============================================================================
 * Pure mathematical functions for calculations across the application.
 * =============================================================================
 */

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Calculate the distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Calculate angle between two points in degrees
 */
export function angleDegrees(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Round to specified decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate the average of an array of numbers
 */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = average(values);
  const squareDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(average(squareDiffs));
}

/**
 * Normalize a value from one range to another
 */
export function normalize(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number = 0,
  toMax: number = 1
): number {
  const normalized = (value - fromMin) / (fromMax - fromMin);
  return toMin + normalized * (toMax - toMin);
}

/**
 * Calculate velocity from two points with timestamps
 */
export function calculateVelocity(
  x1: number, y1: number, t1: number,
  x2: number, y2: number, t2: number
): number {
  const dist = distance(x1, y1, x2, y2);
  const dt = t2 - t1;
  return dt > 0 ? dist / dt : 0;
}

/**
 * Apply Gaussian smoothing to a value array
 */
export function gaussianSmooth(values: number[], windowSize: number = 5): number[] {
  const result: number[] = [];
  const half = Math.floor(windowSize / 2);
  
  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    let count = 0;
    
    for (let j = -half; j <= half; j++) {
      const idx = i + j;
      if (idx >= 0 && idx < values.length) {
        const weight = Math.exp(-(j * j) / (2 * half * half));
        sum += values[idx] * weight;
        count += weight;
      }
    }
    
    result.push(sum / count);
  }
  
  return result;
}

/**
 * Calculate percentile from array
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return lerp(sorted[lower], sorted[upper], index - lower);
}

/**
 * =============================================================================
 * TIMING UTILITIES (V14.0)
 * =============================================================================
 * Shared kinetic timing constants and animation utilities.
 * DCS Trace Line must complete in < 250ms (V12.0 requirement).
 * =============================================================================
 */

import { KINETIC } from '../constants';

/**
 * Timing presets for kinetic animations
 */
export const TIMING_PRESETS = {
  // Ultra-fast for micro-interactions
  INSTANT: 50,
  
  // Fast feedback (button presses, hovers)
  FAST: KINETIC.TRANSITION_FAST,
  
  // Standard transitions
  NORMAL: KINETIC.TRANSITION_NORMAL,
  
  // Deliberate, noticeable transitions
  SLOW: KINETIC.TRANSITION_SLOW,
  
  // DCS Trace Line (V12.0 - MUST be under 250ms)
  TRACE_LINE: KINETIC.TRACE_LINE_MAX_MS,
  
  // Elastic/bouncy animations
  ELASTIC: KINETIC.ELASTIC_DURATION
} as const;

/**
 * Easing function presets
 */
export const EASING_PRESETS = {
  // Standard out-cubic for most transitions
  OUT_CUBIC: KINETIC.EASE_OUT_CUBIC,
  
  // Elastic for playful animations
  OUT_ELASTIC: KINETIC.EASE_OUT_ELASTIC,
  
  // Smooth in-out for continuous animations
  IN_OUT: KINETIC.EASE_IN_OUT,
  
  // Linear for progress indicators
  LINEAR: 'linear',
  
  // Sharp ease for snappy feedback
  SHARP: 'cubic-bezier(0.4, 0, 0.2, 1)'
} as const;

/**
 * Frame timing utilities
 */
export const FRAME = {
  // Target frame time at 60fps
  TIME_MS: KINETIC.FRAME_TIME_MS,
  
  // Target FPS
  RATE: KINETIC.TARGET_FPS,
  
  // Calculate frames for a duration
  count: (durationMs: number): number => {
    return Math.ceil(durationMs / KINETIC.FRAME_TIME_MS);
  },
  
  // Calculate duration for frame count
  duration: (frames: number): number => {
    return frames * KINETIC.FRAME_TIME_MS;
  }
} as const;

/**
 * Delay execution with a promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute callback after next frame
 */
export function nextFrame(callback: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}

/**
 * Create a timing-safe animation runner
 * Ensures animations don't exceed the DCS 250ms requirement
 */
export function createTimedAnimation(
  maxDuration: number = TIMING_PRESETS.TRACE_LINE
): {
  start: () => void;
  end: () => number;
  isWithinLimit: () => boolean;
} {
  let startTime = 0;
  let endTime = 0;
  
  return {
    start: () => {
      startTime = performance.now();
    },
    end: () => {
      endTime = performance.now();
      return endTime - startTime;
    },
    isWithinLimit: () => {
      return (endTime - startTime) <= maxDuration;
    }
  };
}

/**
 * Performance measurement for kinetic elements
 */
export function measureAnimationPerformance(
  name: string,
  callback: () => void | Promise<void>
): Promise<{ duration: number; passed: boolean }> {
  return new Promise(async (resolve) => {
    const start = performance.now();
    
    await callback();
    
    const duration = performance.now() - start;
    const passed = duration <= TIMING_PRESETS.TRACE_LINE;
    
    if (!passed) {
      console.warn(
        `[KINETIC WARNING] Animation "${name}" took ${duration.toFixed(2)}ms, ` +
        `exceeding the ${TIMING_PRESETS.TRACE_LINE}ms limit.`
      );
    }
    
    resolve({ duration, passed });
  });
}

/**
 * Create staggered animation delays for list items
 */
export function staggerDelays(
  count: number,
  baseDelay: number = 50,
  maxDelay: number = 500
): number[] {
  return Array.from({ length: count }, (_, i) => {
    return Math.min(i * baseDelay, maxDelay);
  });
}

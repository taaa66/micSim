/**
 * =============================================================================
 * DOM UTILITIES (V14.0)
 * =============================================================================
 * Pure DOM manipulation utilities for performance and consistency.
 * =============================================================================
 */

import { KINETIC, VIEWPORT } from '../constants';

/**
 * Apply GPU acceleration to an element
 */
export function applyGPUAcceleration(element: HTMLElement): void {
  element.style.transform = KINETIC.GPU_TRANSFORM;
  element.style.willChange = KINETIC.WILL_CHANGE_TRANSFORM;
}

/**
 * Remove GPU acceleration from an element
 */
export function removeGPUAcceleration(element: HTMLElement): void {
  element.style.transform = '';
  element.style.willChange = 'auto';
}

/**
 * Check if viewport meets zero-scroll mandate
 */
export function checkZeroScrollCompliance(): boolean {
  const { documentElement } = document;
  const viewportHeight = window.innerHeight;
  const scrollHeight = documentElement.scrollHeight;
  
  return scrollHeight <= viewportHeight;
}

/**
 * Get safe area insets for iOS
 */
export function getSafeAreaInsets(): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--safe-area-top') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--safe-area-bottom') || '0', 10),
    left: parseInt(style.getPropertyValue('--safe-area-left') || '0', 10),
    right: parseInt(style.getPropertyValue('--safe-area-right') || '0', 10)
  };
}

/**
 * Check if device is tablet (iPad-like)
 */
export function isTabletDevice(): boolean {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isPortrait = height > width;
  
  // Target iPad dimensions (768x1024)
  if (isPortrait) {
    return width >= 700 && width <= 900 && height >= 900 && height <= 1200;
  }
  return height >= 700 && height <= 900 && width >= 900 && width <= 1200;
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request animation frame with timing
 */
export function rafLoop(
  callback: (deltaTime: number) => boolean | void
): () => void {
  let lastTime = performance.now();
  let running = true;
  
  function loop(currentTime: number) {
    if (!running) return;
    
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    const shouldContinue = callback(deltaTime);
    
    if (shouldContinue !== false) {
      requestAnimationFrame(loop);
    }
  }
  
  requestAnimationFrame(loop);
  
  return () => {
    running = false;
  };
}

/**
 * Measure element dimensions safely
 */
export function measureElement(element: HTMLElement): DOMRect {
  return element.getBoundingClientRect();
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

/**
 * Create high-performance CSS transition
 */
export function createTransition(
  properties: string[],
  duration: number = KINETIC.TRANSITION_NORMAL,
  easing: string = KINETIC.EASE_OUT_CUBIC
): string {
  return properties
    .map(prop => `${prop} ${duration}ms ${easing}`)
    .join(', ');
}

/**
 * =============================================================================
 * ACCESSIBILITY SERVICE
 * =============================================================================
 * Utilities for improving accessibility (a11y) across the application
 * =============================================================================
 */

import { writable, get } from 'svelte/store';

// =============================================================================
// TYPES
// =============================================================================

export interface A11yPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'x-large';
  screenReaderMode: boolean;
}

// =============================================================================
// STORES
// =============================================================================

const defaultPreferences: A11yPreferences = {
  reduceMotion: false,
  highContrast: false,
  fontSize: 'normal',
  screenReaderMode: false
};

export const a11yPreferences = writable<A11yPreferences>(defaultPreferences);

// =============================================================================
// SYSTEM PREFERENCE DETECTION
// =============================================================================

/**
 * Detect system preference for reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detect system preference for high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * Detect system preference for dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// =============================================================================
// PREFERENCE MANAGEMENT
// =============================================================================

/**
 * Initialize preferences from system and localStorage
 */
export function initA11yPreferences(): void {
  if (typeof window === 'undefined') return;
  
  // Load from localStorage
  const stored = localStorage.getItem('a11y-preferences');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      a11yPreferences.set({ ...defaultPreferences, ...parsed });
    } catch {
      console.warn('Failed to parse a11y preferences');
    }
  } else {
    // Use system preferences
    a11yPreferences.update(prefs => ({
      ...prefs,
      reduceMotion: prefersReducedMotion(),
      highContrast: prefersHighContrast()
    }));
  }
  
  // Apply preferences
  applyPreferences(get(a11yPreferences));
  
  // Listen for system changes
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (!localStorage.getItem('a11y-preferences')) {
      a11yPreferences.update(prefs => ({ ...prefs, reduceMotion: e.matches }));
    }
  });
}

/**
 * Save preferences to localStorage
 */
export function saveA11yPreferences(prefs: Partial<A11yPreferences>): void {
  a11yPreferences.update(current => {
    const updated = { ...current, ...prefs };
    localStorage.setItem('a11y-preferences', JSON.stringify(updated));
    applyPreferences(updated);
    return updated;
  });
}

/**
 * Apply preferences to document
 */
function applyPreferences(prefs: A11yPreferences): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Reduced motion
  root.classList.toggle('reduce-motion', prefs.reduceMotion);
  
  // High contrast
  root.classList.toggle('high-contrast', prefs.highContrast);
  
  // Font size
  root.classList.remove('font-normal', 'font-large', 'font-x-large');
  root.classList.add(`font-${prefs.fontSize}`);
  
  // Screen reader mode
  root.classList.toggle('sr-mode', prefs.screenReaderMode);
}

// =============================================================================
// FOCUS MANAGEMENT
// =============================================================================

/**
 * Trap focus within an element
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');
  
  const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }
  
  container.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();
  
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Restore focus to element after action
 */
export function restoreFocus(element: HTMLElement | null): void {
  if (element && typeof element.focus === 'function') {
    // Use setTimeout to ensure DOM updates are complete
    setTimeout(() => element.focus(), 0);
  }
}

// =============================================================================
// ANNOUNCEMENTS
// =============================================================================

let liveRegion: HTMLElement | null = null;

/**
 * Initialize live region for screen reader announcements
 */
export function initLiveRegion(): void {
  if (typeof document === 'undefined') return;
  if (liveRegion) return;
  
  liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
  
  document.body.appendChild(liveRegion);
}

/**
 * Announce message to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (!liveRegion) {
    initLiveRegion();
  }
  
  if (liveRegion) {
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = '';
    
    // Use setTimeout to ensure the change is detected
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = message;
      }
    }, 100);
  }
}

// =============================================================================
// SKIP LINKS
// =============================================================================

/**
 * Create skip link for keyboard navigation
 */
export function createSkipLink(targetId: string, text: string = 'דלג לתוכן הראשי'): HTMLElement {
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.className = 'skip-link';
  link.textContent = text;
  
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
  
  return link;
}

// =============================================================================
// ARIA HELPERS
// =============================================================================

/**
 * Generate unique ID for ARIA relationships
 */
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Set up ARIA describedby relationship
 */
export function describeBy(element: HTMLElement, description: string): () => void {
  const id = generateAriaId('desc');
  
  const descElement = document.createElement('span');
  descElement.id = id;
  descElement.className = 'sr-only';
  descElement.textContent = description;
  
  element.setAttribute('aria-describedby', id);
  element.appendChild(descElement);
  
  return () => {
    element.removeAttribute('aria-describedby');
    descElement.remove();
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  a11yPreferences,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
  initA11yPreferences,
  saveA11yPreferences,
  trapFocus,
  restoreFocus,
  initLiveRegion,
  announce,
  createSkipLink,
  generateAriaId,
  describeBy
};

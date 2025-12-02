/**
 * =============================================================================
 * TOAST STORE
 * =============================================================================
 * Manages toast notifications globally
 * =============================================================================
 */

import { writable, derived } from 'svelte/store';

// =============================================================================
// TYPES
// =============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  dismissible: boolean;
  timestamp: number;
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  dismissible?: boolean;
}

// =============================================================================
// STORE
// =============================================================================

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 5;

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);
  
  function generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  function add(message: string, options: ToastOptions = {}): string {
    const id = generateId();
    const toast: Toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration ?? DEFAULT_DURATION,
      dismissible: options.dismissible ?? true,
      timestamp: Date.now()
    };
    
    update(toasts => {
      // Remove oldest if at max
      const newToasts = toasts.length >= MAX_TOASTS 
        ? toasts.slice(1) 
        : toasts;
      return [...newToasts, toast];
    });
    
    // Auto-remove after duration
    if (toast.duration > 0) {
      setTimeout(() => remove(id), toast.duration);
    }
    
    return id;
  }
  
  function remove(id: string): void {
    update(toasts => toasts.filter(t => t.id !== id));
  }
  
  function clear(): void {
    update(() => []);
  }
  
  // Convenience methods
  function success(message: string, duration?: number): string {
    return add(message, { type: 'success', duration });
  }
  
  function error(message: string, duration?: number): string {
    return add(message, { type: 'error', duration: duration ?? 6000 });
  }
  
  function warning(message: string, duration?: number): string {
    return add(message, { type: 'warning', duration });
  }
  
  function info(message: string, duration?: number): string {
    return add(message, { type: 'info', duration });
  }
  
  return {
    subscribe,
    add,
    remove,
    clear,
    success,
    error,
    warning,
    info
  };
}

export const toasts = createToastStore();

// =============================================================================
// DERIVED STORES
// =============================================================================

export const hasToasts = derived(toasts, $toasts => $toasts.length > 0);
export const toastCount = derived(toasts, $toasts => $toasts.length);

// =============================================================================
// EXPORTS
// =============================================================================

export default toasts;

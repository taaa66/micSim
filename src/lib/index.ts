/**
 * =============================================================================
 * LIB INDEX
 * =============================================================================
 * Central export for all library utilities
 * =============================================================================
 */

// Audit Logging
export { audit, type AuditAction, type AuditLogEntry } from './auditLog';

// Performance Monitoring
export { performanceMonitor } from './performanceMonitor';

// Data Export (GDPR)
export { exportUserData, downloadUserData, downloadUserDataCSV } from './dataExport';

// Lazy Loading
export { 
  lazyLoad, 
  preloadOnIdle, 
  preloadOnVisible,
  lazySimComponents,
  lazyGameComponents
} from './lazyLoad';

// Keyboard Shortcuts
export {
  registerShortcut,
  unregisterShortcut,
  setShortcutEnabled,
  setScope,
  initKeyboardShortcuts,
  getShortcuts,
  formatShortcut,
  registerDefaultShortcuts
} from './keyboardShortcuts';

// Accessibility
export {
  a11yPreferences,
  prefersReducedMotion,
  prefersHighContrast,
  initA11yPreferences,
  saveA11yPreferences,
  trapFocus,
  restoreFocus,
  announce,
  generateAriaId
} from './accessibility';

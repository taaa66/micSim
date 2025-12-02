/**
 * =============================================================================
 * KEYBOARD SHORTCUTS SERVICE
 * =============================================================================
 * Global keyboard shortcut management for accessibility and power users
 * =============================================================================
 */

import { writable, get } from 'svelte/store';

// =============================================================================
// TYPES
// =============================================================================

export interface Shortcut {
  id: string;
  keys: string[];
  description: string;
  descriptionHe?: string;
  action: () => void;
  enabled: boolean;
  scope?: string;
  preventDefault?: boolean;
}

export interface ShortcutGroup {
  name: string;
  nameHe?: string;
  shortcuts: Shortcut[];
}

// =============================================================================
// STORE
// =============================================================================

const shortcuts = writable<Map<string, Shortcut>>(new Map());
const activeScope = writable<string>('global');
const isEnabled = writable<boolean>(true);

// =============================================================================
// KEY PARSING
// =============================================================================

function normalizeKey(key: string): string {
  const keyMap: Record<string, string> = {
    'ctrl': 'control',
    'cmd': 'meta',
    'command': 'meta',
    'opt': 'alt',
    'option': 'alt',
    'esc': 'escape',
    'del': 'delete',
    'ins': 'insert',
    'pgup': 'pageup',
    'pgdn': 'pagedown',
    'up': 'arrowup',
    'down': 'arrowdown',
    'left': 'arrowleft',
    'right': 'arrowright',
    ' ': 'space'
  };
  
  return keyMap[key.toLowerCase()] || key.toLowerCase();
}

function parseShortcut(shortcut: string): string[] {
  return shortcut
    .split('+')
    .map(k => k.trim())
    .map(normalizeKey)
    .sort();
}

function getActiveKeys(event: KeyboardEvent): string[] {
  const keys: string[] = [];
  
  if (event.ctrlKey) keys.push('control');
  if (event.metaKey) keys.push('meta');
  if (event.altKey) keys.push('alt');
  if (event.shiftKey) keys.push('shift');
  
  const key = normalizeKey(event.key);
  if (!['control', 'meta', 'alt', 'shift'].includes(key)) {
    keys.push(key);
  }
  
  return keys.sort();
}

function keysMatch(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((key, i) => key === b[i]);
}

// =============================================================================
// SHORTCUT MANAGEMENT
// =============================================================================

/**
 * Register a keyboard shortcut
 */
export function registerShortcut(
  id: string,
  keys: string | string[],
  description: string,
  action: () => void,
  options: {
    descriptionHe?: string;
    scope?: string;
    enabled?: boolean;
    preventDefault?: boolean;
  } = {}
): () => void {
  const keyArray = Array.isArray(keys) ? keys : [keys];
  const parsedKeys = keyArray.map(parseShortcut);
  
  const shortcut: Shortcut = {
    id,
    keys: parsedKeys.flat(),
    description,
    descriptionHe: options.descriptionHe,
    action,
    enabled: options.enabled ?? true,
    scope: options.scope || 'global',
    preventDefault: options.preventDefault ?? true
  };
  
  shortcuts.update(map => {
    map.set(id, shortcut);
    return map;
  });
  
  // Return unregister function
  return () => unregisterShortcut(id);
}

/**
 * Unregister a keyboard shortcut
 */
export function unregisterShortcut(id: string): void {
  shortcuts.update(map => {
    map.delete(id);
    return map;
  });
}

/**
 * Enable/disable a specific shortcut
 */
export function setShortcutEnabled(id: string, enabled: boolean): void {
  shortcuts.update(map => {
    const shortcut = map.get(id);
    if (shortcut) {
      shortcut.enabled = enabled;
    }
    return map;
  });
}

/**
 * Set the active scope
 */
export function setScope(scope: string): void {
  activeScope.set(scope);
}

/**
 * Enable/disable all shortcuts
 */
export function setEnabled(enabled: boolean): void {
  isEnabled.set(enabled);
}

// =============================================================================
// EVENT HANDLER
// =============================================================================

function handleKeyDown(event: KeyboardEvent): void {
  // Skip if disabled
  if (!get(isEnabled)) return;
  
  // Skip if in input/textarea
  const target = event.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    // Allow Escape in inputs
    if (event.key !== 'Escape') return;
  }
  
  const activeKeys = getActiveKeys(event);
  const currentScope = get(activeScope);
  const shortcutMap = get(shortcuts);
  
  for (const shortcut of shortcutMap.values()) {
    if (!shortcut.enabled) continue;
    if (shortcut.scope !== 'global' && shortcut.scope !== currentScope) continue;
    
    const parsedKeys = parseShortcut(shortcut.keys.join('+'));
    if (keysMatch(activeKeys, parsedKeys)) {
      if (shortcut.preventDefault) {
        event.preventDefault();
      }
      shortcut.action();
      return;
    }
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

let initialized = false;

export function initKeyboardShortcuts(): () => void {
  if (initialized) return () => {};
  
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
    initialized = true;
  }
  
  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyDown);
      initialized = false;
    }
  };
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get all registered shortcuts
 */
export function getShortcuts(): Shortcut[] {
  return Array.from(get(shortcuts).values());
}

/**
 * Get shortcuts grouped by scope
 */
export function getShortcutGroups(): ShortcutGroup[] {
  const shortcutList = getShortcuts();
  const groups = new Map<string, Shortcut[]>();
  
  for (const shortcut of shortcutList) {
    const scope = shortcut.scope || 'global';
    if (!groups.has(scope)) {
      groups.set(scope, []);
    }
    groups.get(scope)!.push(shortcut);
  }
  
  return Array.from(groups.entries()).map(([name, shortcuts]) => ({
    name,
    shortcuts
  }));
}

/**
 * Format shortcut keys for display
 */
export function formatShortcut(keys: string[]): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
  
  const keySymbols: Record<string, string> = {
    control: isMac ? '⌃' : 'Ctrl',
    meta: isMac ? '⌘' : 'Win',
    alt: isMac ? '⌥' : 'Alt',
    shift: '⇧',
    escape: 'Esc',
    enter: '↵',
    space: 'Space',
    arrowup: '↑',
    arrowdown: '↓',
    arrowleft: '←',
    arrowright: '→',
    backspace: '⌫',
    delete: '⌦',
    tab: '⇥'
  };
  
  return keys
    .map(k => keySymbols[k] || k.toUpperCase())
    .join(isMac ? '' : '+');
}

// =============================================================================
// DEFAULT SHORTCUTS
// =============================================================================

export function registerDefaultShortcuts(handlers: {
  goToDashboard?: () => void;
  goBack?: () => void;
  openHelp?: () => void;
  openSettings?: () => void;
  openAnalytics?: () => void;
  toggleFullscreen?: () => void;
}): () => void {
  const unsubscribers: (() => void)[] = [];
  
  if (handlers.goToDashboard) {
    unsubscribers.push(
      registerShortcut('go-dashboard', 'ctrl+h', 'Go to Dashboard', handlers.goToDashboard, {
        descriptionHe: 'חזור לדשבורד'
      })
    );
  }
  
  if (handlers.goBack) {
    unsubscribers.push(
      registerShortcut('go-back', 'escape', 'Go Back', handlers.goBack, {
        descriptionHe: 'חזור אחורה'
      })
    );
  }
  
  if (handlers.openHelp) {
    unsubscribers.push(
      registerShortcut('open-help', 'shift+?', 'Open Help', handlers.openHelp, {
        descriptionHe: 'פתח עזרה'
      })
    );
  }
  
  if (handlers.openSettings) {
    unsubscribers.push(
      registerShortcut('open-settings', 'ctrl+,', 'Open Settings', handlers.openSettings, {
        descriptionHe: 'פתח הגדרות'
      })
    );
  }
  
  if (handlers.openAnalytics) {
    unsubscribers.push(
      registerShortcut('open-analytics', 'ctrl+a', 'Open Analytics', handlers.openAnalytics, {
        descriptionHe: 'פתח אנליטיקס'
      })
    );
  }
  
  if (handlers.toggleFullscreen) {
    unsubscribers.push(
      registerShortcut('toggle-fullscreen', 'f11', 'Toggle Fullscreen', handlers.toggleFullscreen, {
        descriptionHe: 'מסך מלא'
      })
    );
  }
  
  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  shortcuts,
  activeScope,
  isEnabled
};

export default {
  registerShortcut,
  unregisterShortcut,
  setShortcutEnabled,
  setScope,
  setEnabled,
  initKeyboardShortcuts,
  getShortcuts,
  getShortcutGroups,
  formatShortcut,
  registerDefaultShortcuts
};

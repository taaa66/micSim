/**
 * =============================================================================
 * NAVIGATION STORE
 * =============================================================================
 * Centralized navigation state management
 * =============================================================================
 */

import { writable, derived } from 'svelte/store';

// =============================================================================
// TYPES
// =============================================================================

export type ViewName = 
  | 'dashboard'
  | 'sim'
  | 'core-games'
  | 'game'
  | 'okap-hub'
  | 'okap-game'
  | 'analytics'
  | 'rota'
  | 'settings'
  | 'profile';

export interface NavigationState {
  currentView: ViewName;
  previousView: ViewName | null;
  history: ViewName[];
  params: Record<string, unknown>;
}

export interface BreadcrumbItem {
  label: string;
  view: ViewName;
  icon?: string;
}

// =============================================================================
// STORES
// =============================================================================

const initialState: NavigationState = {
  currentView: 'dashboard',
  previousView: null,
  history: ['dashboard'],
  params: {}
};

export const navigationState = writable<NavigationState>(initialState);

// =============================================================================
// DERIVED STORES
// =============================================================================

export const currentView = derived(navigationState, $state => $state.currentView);

export const previousView = derived(navigationState, $state => $state.previousView);

export const navigationParams = derived(navigationState, $state => $state.params);

export const canGoBack = derived(navigationState, $state => $state.history.length > 1);

export const breadcrumbs = derived(navigationState, $state => {
  const crumbs: BreadcrumbItem[] = [];
  
  // Always start with dashboard
  crumbs.push({ label: 'Dashboard', view: 'dashboard', icon: '🏠' });
  
  // Add intermediate views based on current view
  switch ($state.currentView) {
    case 'sim':
      crumbs.push({ label: 'Simulation', view: 'sim', icon: '🎯' });
      break;
    case 'core-games':
      crumbs.push({ label: 'Core Games', view: 'core-games', icon: '🎮' });
      break;
    case 'game':
      crumbs.push({ label: 'Core Games', view: 'core-games', icon: '🎮' });
      crumbs.push({ label: 'Game', view: 'game', icon: '🕹️' });
      break;
    case 'okap-hub':
      crumbs.push({ label: 'OKAP Prep', view: 'okap-hub', icon: '📚' });
      break;
    case 'okap-game':
      crumbs.push({ label: 'OKAP Prep', view: 'okap-hub', icon: '📚' });
      crumbs.push({ label: 'Game', view: 'okap-game', icon: '🧠' });
      break;
    case 'analytics':
      crumbs.push({ label: 'Analytics', view: 'analytics', icon: '📊' });
      break;
    case 'rota':
      crumbs.push({ label: 'My Shifts', view: 'rota', icon: '📅' });
      break;
    case 'settings':
      crumbs.push({ label: 'Settings', view: 'settings', icon: '⚙️' });
      break;
    case 'profile':
      crumbs.push({ label: 'Profile', view: 'profile', icon: '👤' });
      break;
  }
  
  return crumbs;
});

// =============================================================================
// ACTIONS
// =============================================================================

export function navigateTo(view: ViewName, params: Record<string, unknown> = {}): void {
  navigationState.update($state => ({
    currentView: view,
    previousView: $state.currentView,
    history: [...$state.history, view].slice(-20), // Keep last 20 entries
    params
  }));
}

export function goBack(): void {
  navigationState.update($state => {
    if ($state.history.length <= 1) {
      return { ...$state, currentView: 'dashboard', params: {} };
    }
    
    const newHistory = $state.history.slice(0, -1);
    const previousView = newHistory[newHistory.length - 1];
    
    return {
      currentView: previousView,
      previousView: $state.currentView,
      history: newHistory,
      params: {}
    };
  });
}

export function goToDashboard(): void {
  navigationState.set({
    currentView: 'dashboard',
    previousView: null,
    history: ['dashboard'],
    params: {}
  });
}

export function setParams(params: Record<string, unknown>): void {
  navigationState.update($state => ({
    ...$state,
    params: { ...$state.params, ...params }
  }));
}

export function clearParams(): void {
  navigationState.update($state => ({
    ...$state,
    params: {}
  }));
}

// =============================================================================
// CONVENIENCE NAVIGATION FUNCTIONS
// =============================================================================

export const navigate = {
  dashboard: () => navigateTo('dashboard'),
  simulation: (simId?: string) => navigateTo('sim', simId ? { simId } : {}),
  coreGames: () => navigateTo('core-games'),
  game: (gameId: string) => navigateTo('game', { gameId }),
  okapHub: () => navigateTo('okap-hub'),
  okapGame: (gameId: string) => navigateTo('okap-game', { gameId }),
  analytics: () => navigateTo('analytics'),
  rota: () => navigateTo('rota'),
  settings: () => navigateTo('settings'),
  profile: () => navigateTo('profile'),
  back: goBack
};

export default {
  navigationState,
  currentView,
  previousView,
  navigationParams,
  canGoBack,
  breadcrumbs,
  navigateTo,
  goBack,
  goToDashboard,
  setParams,
  clearParams,
  navigate
};

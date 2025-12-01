/**
 * =============================================================================
 * OPHTHALMIC SIMULATOR - GLOBAL STATE MANAGEMENT (V14.0)
 * =============================================================================
 * Svelte stores for application-wide state management.
 * =============================================================================
 */

import { writable, derived, readable } from 'svelte/store';
import type { 
  IModuleData, 
  ISurgeonProfile, 
  IApexRanking,
  IAllocationData,
  ICoreGameScore,
  IMotorControlRanking
} from '../../core/models';

// =============================================================================
// CURRENT USER STATE
// =============================================================================

export const currentUser = writable<ISurgeonProfile | null>(null);

export const isAuthenticated = derived(
  currentUser,
  $user => $user !== null
);

// =============================================================================
// MODULE CONTEXT STATE
// =============================================================================

export const currentModuleContext = writable<IModuleData | null>(null);

export const allModules = writable<IModuleData[]>([]);

export const completedModules = derived(
  allModules,
  $modules => $modules.filter(m => m.completed)
);

export const overallMastery = derived(
  allModules,
  $modules => {
    if ($modules.length === 0) return 0;
    const total = $modules.reduce((sum, m) => sum + m.mastery, 0);
    return Math.round(total / $modules.length);
  }
);

// =============================================================================
// APEX LEAGUE STATE
// =============================================================================

export const apexRankings = writable<IApexRanking[]>([]);

export const allocationData = writable<IAllocationData | null>(null);

export const currentUserRank = derived(
  [apexRankings, currentUser],
  ([$rankings, $user]) => {
    if (!$user) return null;
    return $rankings.find(r => r.surgeon.id === $user.id) || null;
  }
);

// =============================================================================
// CORE GAMES STATE (Gamification V14.0)
// =============================================================================

export const motorControlRankings = writable<IMotorControlRanking[]>([]);

export const recentGameScores = writable<ICoreGameScore<Record<string, number | boolean>>[]>([]);

export const bestGameScores = writable<{
  'tremor-shield': ICoreGameScore<Record<string, number | boolean>> | null;
  'vector-race': ICoreGameScore<Record<string, number | boolean>> | null;
  'nano-grip': ICoreGameScore<Record<string, number | boolean>> | null;
}>({
  'tremor-shield': null,
  'vector-race': null,
  'nano-grip': null
});

export const totalMotorScore = derived(
  bestGameScores,
  $scores => {
    let total = 0;
    if ($scores['tremor-shield']) total += $scores['tremor-shield'].overall;
    if ($scores['vector-race']) total += $scores['vector-race'].overall;
    if ($scores['nano-grip']) total += $scores['nano-grip'].overall;
    return total;
  }
);

// =============================================================================
// UI STATE
// =============================================================================

export const currentView = writable<'dashboard' | 'sim' | 'core-games' | 'game' | 'reports'>('dashboard');

export const selectedSimulation = writable<IModuleData | null>(null);

export const selectedGame = writable<string | null>(null);

export const apexPanelOpen = writable<boolean>(true);

export const isLoading = writable<boolean>(false);

export const notifications = writable<Array<{
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}>>([]);

// =============================================================================
// SYSTEM STATUS
// =============================================================================

export const systemStatus = readable<'NOMINAL' | 'WARNING' | 'ERROR'>('NOMINAL', (set) => {
  // Could be connected to health check endpoint
  const interval = setInterval(() => {
    // Placeholder for actual health check
    set('NOMINAL');
  }, 30000);

  return () => clearInterval(interval);
});

export const networkLatency = writable<number>(38);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Add a notification to the queue
 */
export function addNotification(
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  duration = 5000
) {
  const id = `notif-${Date.now()}`;
  notifications.update(n => [...n, { id, type, message, duration }]);
  
  if (duration > 0) {
    setTimeout(() => {
      notifications.update(n => n.filter(notif => notif.id !== id));
    }, duration);
  }
  
  return id;
}

/**
 * Remove a notification by ID
 */
export function removeNotification(id: string) {
  notifications.update(n => n.filter(notif => notif.id !== id));
}

/**
 * Update a game score and check for new best
 */
export function submitGameScore(score: ICoreGameScore<Record<string, number | boolean>>) {
  recentGameScores.update(scores => [score, ...scores.slice(0, 9)]);
  
  bestGameScores.update(best => {
    const gameId = score.gameId as keyof typeof best;
    if (!best[gameId] || score.overall > best[gameId]!.overall) {
      return { ...best, [gameId]: score };
    }
    return best;
  });
}

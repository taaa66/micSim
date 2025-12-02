/**
 * =============================================================================
 * USER STORE
 * =============================================================================
 * Centralized user state management with derived stores
 * =============================================================================
 */

import { writable, derived, get } from 'svelte/store';

// =============================================================================
// TYPES
// =============================================================================

export type UserRole = 'guest' | 'trainee' | 'supervisor' | 'admin';

export interface UserStats {
  practice_count: number;
  total_score: number;
  best_score: number;
  last_activity: string | null;
  simulations_completed: number;
  okap_games_completed: number;
  streak_days: number;
  achievements: string[];
}

export interface UserProfile {
  uid: string;
  idNumber: string;
  doctorNumber?: string;
  fullName: string;
  specialty: string;
  role: UserRole;
  createdAt: string;
  stats: UserStats;
  preferences?: {
    theme: 'dark' | 'light' | 'system';
    notifications: boolean;
    soundEffects: boolean;
  };
}

// =============================================================================
// STORES
// =============================================================================

// Core user store
export const user = writable<UserProfile | null>(null);

// Loading state
export const isUserLoading = writable<boolean>(true);

// Error state
export const userError = writable<string | null>(null);

// =============================================================================
// DERIVED STORES
// =============================================================================

// Is user authenticated
export const isAuthenticated = derived(user, $user => $user !== null);

// User's role
export const userRole = derived(user, $user => $user?.role || 'guest');

// User's display name
export const displayName = derived(user, $user => {
  if (!$user) return 'Guest';
  return $user.fullName || 'User';
});

// Is user admin
export const isAdmin = derived(userRole, $role => $role === 'admin');

// Is user supervisor or higher
export const isSupervisor = derived(userRole, $role => 
  $role === 'supervisor' || $role === 'admin'
);

// User's stats
export const userStats = derived(user, $user => $user?.stats || {
  practice_count: 0,
  total_score: 0,
  best_score: 0,
  last_activity: null,
  simulations_completed: 0,
  okap_games_completed: 0,
  streak_days: 0,
  achievements: []
});

// User's level based on practice count
export const userLevel = derived(userStats, $stats => {
  const count = $stats.practice_count;
  if (count >= 500) return { level: 10, title: 'Master Surgeon', color: '#ffd700' };
  if (count >= 300) return { level: 9, title: 'Expert', color: '#c0c0c0' };
  if (count >= 200) return { level: 8, title: 'Advanced', color: '#cd7f32' };
  if (count >= 150) return { level: 7, title: 'Proficient', color: '#0fb89f' };
  if (count >= 100) return { level: 6, title: 'Skilled', color: '#3b82f6' };
  if (count >= 70) return { level: 5, title: 'Competent', color: '#8b5cf6' };
  if (count >= 50) return { level: 4, title: 'Intermediate', color: '#ec4899' };
  if (count >= 30) return { level: 3, title: 'Developing', color: '#f59e0b' };
  if (count >= 15) return { level: 2, title: 'Beginner', color: '#10b981' };
  return { level: 1, title: 'Novice', color: '#6b7280' };
});

// Progress to next level
export const levelProgress = derived(userStats, $stats => {
  const count = $stats.practice_count;
  const thresholds = [0, 15, 30, 50, 70, 100, 150, 200, 300, 500, Infinity];
  
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (count < thresholds[i + 1]) {
      const current = count - thresholds[i];
      const needed = thresholds[i + 1] - thresholds[i];
      return {
        current,
        needed,
        percentage: Math.round((current / needed) * 100)
      };
    }
  }
  return { current: 0, needed: 0, percentage: 100 };
});

// =============================================================================
// ACTIONS
// =============================================================================

export function setUser(profile: UserProfile | null): void {
  user.set(profile);
  isUserLoading.set(false);
  userError.set(null);
}

export function clearUser(): void {
  user.set(null);
  isUserLoading.set(false);
}

export function setUserLoading(loading: boolean): void {
  isUserLoading.set(loading);
}

export function setUserError(error: string | null): void {
  userError.set(error);
  isUserLoading.set(false);
}

export function updateUserStats(updates: Partial<UserStats>): void {
  user.update($user => {
    if (!$user) return $user;
    return {
      ...$user,
      stats: {
        ...$user.stats,
        ...updates,
        last_activity: new Date().toISOString()
      }
    };
  });
}

export function incrementPracticeCount(): void {
  user.update($user => {
    if (!$user) return $user;
    return {
      ...$user,
      stats: {
        ...$user.stats,
        practice_count: $user.stats.practice_count + 1,
        last_activity: new Date().toISOString()
      }
    };
  });
}

export function addAchievement(achievementId: string): void {
  user.update($user => {
    if (!$user) return $user;
    if ($user.stats.achievements.includes(achievementId)) return $user;
    return {
      ...$user,
      stats: {
        ...$user.stats,
        achievements: [...$user.stats.achievements, achievementId]
      }
    };
  });
}

// =============================================================================
// SELECTORS
// =============================================================================

export function getCurrentUser(): UserProfile | null {
  return get(user);
}

export function getUserId(): string | null {
  return get(user)?.uid || null;
}

export function hasRole(role: UserRole): boolean {
  return get(userRole) === role;
}

export function hasMinRole(minRole: UserRole): boolean {
  const roleHierarchy: UserRole[] = ['guest', 'trainee', 'supervisor', 'admin'];
  const currentRole = get(userRole);
  return roleHierarchy.indexOf(currentRole) >= roleHierarchy.indexOf(minRole);
}

export default {
  user,
  isUserLoading,
  userError,
  isAuthenticated,
  userRole,
  displayName,
  isAdmin,
  isSupervisor,
  userStats,
  userLevel,
  levelProgress,
  setUser,
  clearUser,
  setUserLoading,
  setUserError,
  updateUserStats,
  incrementPracticeCount,
  addAchievement,
  getCurrentUser,
  getUserId,
  hasRole,
  hasMinRole
};

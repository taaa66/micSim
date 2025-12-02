/**
 * =============================================================================
 * STREAK & LEVEL STORE
 * =============================================================================
 * Manages daily streaks and user leveling system
 * =============================================================================
 */

import { writable, derived, get } from 'svelte/store';
import { incrementProgress } from './achievements';

// =============================================================================
// TYPES
// =============================================================================

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  totalDaysActive: number;
  weeklyActivity: boolean[]; // Last 7 days
}

export interface LevelData {
  level: number;
  currentXP: number;
  totalXP: number;
  title: string;
  titleHe: string;
}

// =============================================================================
// LEVEL CONFIGURATION
// =============================================================================

const LEVEL_TITLES = [
  { level: 1, title: 'Novice', titleHe: 'מתחיל', xpRequired: 0 },
  { level: 2, title: 'Apprentice', titleHe: 'חניך', xpRequired: 100 },
  { level: 3, title: 'Student', titleHe: 'סטודנט', xpRequired: 300 },
  { level: 4, title: 'Practitioner', titleHe: 'מתרגל', xpRequired: 600 },
  { level: 5, title: 'Skilled', titleHe: 'מיומן', xpRequired: 1000 },
  { level: 6, title: 'Proficient', titleHe: 'בקיא', xpRequired: 1500 },
  { level: 7, title: 'Expert', titleHe: 'מומחה', xpRequired: 2200 },
  { level: 8, title: 'Master', titleHe: 'מאסטר', xpRequired: 3000 },
  { level: 9, title: 'Grandmaster', titleHe: 'גרנדמאסטר', xpRequired: 4000 },
  { level: 10, title: 'Legend', titleHe: 'אגדה', xpRequired: 5500 },
  { level: 11, title: 'Virtuoso', titleHe: 'וירטואוז', xpRequired: 7500 },
  { level: 12, title: 'Surgeon Elite', titleHe: 'מנתח עילית', xpRequired: 10000 }
];

// =============================================================================
// STORES
// =============================================================================

const defaultStreak: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  totalDaysActive: 0,
  weeklyActivity: [false, false, false, false, false, false, false]
};

const defaultLevel: LevelData = {
  level: 1,
  currentXP: 0,
  totalXP: 0,
  title: 'Novice',
  titleHe: 'מתחיל'
};

export const streakData = writable<StreakData>(defaultStreak);
export const levelData = writable<LevelData>(defaultLevel);

// =============================================================================
// DERIVED STORES
// =============================================================================

export const currentStreak = derived(streakData, $s => $s.currentStreak);
export const longestStreak = derived(streakData, $s => $s.longestStreak);
export const weeklyActivity = derived(streakData, $s => $s.weeklyActivity);

export const currentLevel = derived(levelData, $l => $l.level);
export const currentXP = derived(levelData, $l => $l.currentXP);
export const levelTitle = derived(levelData, $l => $l.titleHe);

export const xpToNextLevel = derived(levelData, $l => {
  const nextLevel = LEVEL_TITLES.find(lt => lt.level === $l.level + 1);
  if (!nextLevel) return 0;
  const currentLevelData = LEVEL_TITLES.find(lt => lt.level === $l.level);
  return nextLevel.xpRequired - (currentLevelData?.xpRequired || 0);
});

export const xpProgress = derived([levelData, xpToNextLevel], ([$l, $next]) => {
  if ($next === 0) return 100;
  return Math.min(100, ($l.currentXP / $next) * 100);
});

// =============================================================================
// FUNCTIONS
// =============================================================================

/**
 * Initialize from localStorage
 */
export function initStreakAndLevel(): void {
  if (typeof localStorage === 'undefined') return;
  
  // Load streak
  const storedStreak = localStorage.getItem('streak-data');
  if (storedStreak) {
    try {
      streakData.set(JSON.parse(storedStreak));
    } catch {
      console.warn('Failed to parse streak data');
    }
  }
  
  // Load level
  const storedLevel = localStorage.getItem('level-data');
  if (storedLevel) {
    try {
      levelData.set(JSON.parse(storedLevel));
    } catch {
      console.warn('Failed to parse level data');
    }
  }
  
  // Check if streak should be reset
  checkStreakContinuity();
}

/**
 * Save to localStorage
 */
function save(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('streak-data', JSON.stringify(get(streakData)));
  localStorage.setItem('level-data', JSON.stringify(get(levelData)));
}

/**
 * Get today's date string
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if streak should continue or reset
 */
function checkStreakContinuity(): void {
  const data = get(streakData);
  if (!data.lastActivityDate) return;
  
  const today = new Date(getTodayString());
  const lastActivity = new Date(data.lastActivityDate);
  const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) {
    // Streak broken
    streakData.update(s => ({
      ...s,
      currentStreak: 0,
      weeklyActivity: [false, false, false, false, false, false, false]
    }));
    save();
  }
}

/**
 * Record activity for today
 */
export function recordDailyActivity(): { streakIncreased: boolean; newStreak: number } {
  const today = getTodayString();
  const data = get(streakData);
  
  // Already recorded today
  if (data.lastActivityDate === today) {
    return { streakIncreased: false, newStreak: data.currentStreak };
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];
  
  let newStreak = 1;
  if (data.lastActivityDate === yesterdayString) {
    // Continue streak
    newStreak = data.currentStreak + 1;
  }
  
  // Update weekly activity
  const newWeekly = [...data.weeklyActivity.slice(1), true];
  
  streakData.update(s => ({
    ...s,
    currentStreak: newStreak,
    longestStreak: Math.max(s.longestStreak, newStreak),
    lastActivityDate: today,
    totalDaysActive: s.totalDaysActive + 1,
    weeklyActivity: newWeekly
  }));
  
  // Track achievements
  incrementProgress('daily_streak', newStreak);
  
  save();
  return { streakIncreased: true, newStreak };
}

/**
 * Add XP and check for level up
 */
export function addXP(amount: number): { leveledUp: boolean; newLevel: number; xpGained: number } {
  const data = get(levelData);
  const newTotalXP = data.totalXP + amount;
  
  // Find new level
  let newLevel = 1;
  let newTitle = LEVEL_TITLES[0];
  
  for (const lt of LEVEL_TITLES) {
    if (newTotalXP >= lt.xpRequired) {
      newLevel = lt.level;
      newTitle = lt;
    }
  }
  
  // Calculate XP within current level
  const currentLevelXP = newTitle.xpRequired;
  const nextLevelData = LEVEL_TITLES.find(lt => lt.level === newLevel + 1);
  const xpInLevel = newTotalXP - currentLevelXP;
  
  const leveledUp = newLevel > data.level;
  
  levelData.set({
    level: newLevel,
    currentXP: xpInLevel,
    totalXP: newTotalXP,
    title: newTitle.title,
    titleHe: newTitle.titleHe
  });
  
  save();
  
  return { leveledUp, newLevel, xpGained: amount };
}

/**
 * Get XP required for a specific level
 */
export function getXPForLevel(level: number): number {
  const levelInfo = LEVEL_TITLES.find(lt => lt.level === level);
  return levelInfo?.xpRequired || 0;
}

/**
 * Get level info
 */
export function getLevelInfo(level: number): typeof LEVEL_TITLES[0] | undefined {
  return LEVEL_TITLES.find(lt => lt.level === level);
}

// =============================================================================
// EXPORTS
// =============================================================================

export { LEVEL_TITLES };

export default {
  initStreakAndLevel,
  recordDailyActivity,
  addXP,
  getXPForLevel,
  getLevelInfo
};

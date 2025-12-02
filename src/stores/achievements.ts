/**
 * =============================================================================
 * ACHIEVEMENTS STORE
 * =============================================================================
 * Manages user achievements and unlocks
 * =============================================================================
 */

import { writable, derived, get } from 'svelte/store';

// =============================================================================
// TYPES
// =============================================================================

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
  icon: string;
  rarity: AchievementRarity;
  xp: number;
  category: 'simulation' | 'game' | 'learning' | 'streak' | 'mastery' | 'social';
  condition: {
    type: 'count' | 'score' | 'streak' | 'time' | 'special';
    target: number;
    metric?: string;
  };
  secret?: boolean;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: Date;
  progress?: number;
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
}

// =============================================================================
// ACHIEVEMENT DEFINITIONS
// =============================================================================

export const ACHIEVEMENTS: Achievement[] = [
  // Simulation achievements
  {
    id: 'first-sim',
    title: 'First Steps',
    titleHe: 'צעדים ראשונים',
    description: 'Complete your first simulation',
    descriptionHe: 'השלם את הסימולציה הראשונה שלך',
    icon: '🎯',
    rarity: 'common',
    xp: 50,
    category: 'simulation',
    condition: { type: 'count', target: 1, metric: 'simulations_completed' }
  },
  {
    id: 'sim-10',
    title: 'Getting Serious',
    titleHe: 'מתחילים ברצינות',
    description: 'Complete 10 simulations',
    descriptionHe: 'השלם 10 סימולציות',
    icon: '💪',
    rarity: 'common',
    xp: 100,
    category: 'simulation',
    condition: { type: 'count', target: 10, metric: 'simulations_completed' }
  },
  {
    id: 'sim-50',
    title: 'Dedicated Surgeon',
    titleHe: 'מנתח מסור',
    description: 'Complete 50 simulations',
    descriptionHe: 'השלם 50 סימולציות',
    icon: '🏅',
    rarity: 'rare',
    xp: 250,
    category: 'simulation',
    condition: { type: 'count', target: 50, metric: 'simulations_completed' }
  },
  {
    id: 'sim-100',
    title: 'Simulation Master',
    titleHe: 'מאסטר סימולציות',
    description: 'Complete 100 simulations',
    descriptionHe: 'השלם 100 סימולציות',
    icon: '👑',
    rarity: 'epic',
    xp: 500,
    category: 'simulation',
    condition: { type: 'count', target: 100, metric: 'simulations_completed' }
  },
  
  // Score achievements
  {
    id: 'perfect-score',
    title: 'Perfection',
    titleHe: 'מושלמות',
    description: 'Achieve a perfect 100% score',
    descriptionHe: 'השג ציון מושלם של 100%',
    icon: '💯',
    rarity: 'rare',
    xp: 200,
    category: 'mastery',
    condition: { type: 'score', target: 100, metric: 'max_score' }
  },
  {
    id: 'high-scorer',
    title: 'High Scorer',
    titleHe: 'מקצוען',
    description: 'Score above 90% five times',
    descriptionHe: 'השג ציון מעל 90% חמש פעמים',
    icon: '⭐',
    rarity: 'rare',
    xp: 150,
    category: 'mastery',
    condition: { type: 'count', target: 5, metric: 'scores_above_90' }
  },
  
  // Streak achievements
  {
    id: 'streak-3',
    title: 'On Fire',
    titleHe: 'בוער',
    description: 'Practice 3 days in a row',
    descriptionHe: 'תרגל 3 ימים ברציפות',
    icon: '🔥',
    rarity: 'common',
    xp: 75,
    category: 'streak',
    condition: { type: 'streak', target: 3, metric: 'daily_streak' }
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    titleHe: 'לוחם שבועי',
    description: 'Practice 7 days in a row',
    descriptionHe: 'תרגל 7 ימים ברציפות',
    icon: '💎',
    rarity: 'rare',
    xp: 200,
    category: 'streak',
    condition: { type: 'streak', target: 7, metric: 'daily_streak' }
  },
  {
    id: 'streak-30',
    title: 'Unstoppable',
    titleHe: 'בלתי ניתן לעצירה',
    description: 'Practice 30 days in a row',
    descriptionHe: 'תרגל 30 ימים ברציפות',
    icon: '🏆',
    rarity: 'legendary',
    xp: 1000,
    category: 'streak',
    condition: { type: 'streak', target: 30, metric: 'daily_streak' }
  },
  
  // Game achievements
  {
    id: 'game-master',
    title: 'Game Master',
    titleHe: 'מאסטר משחקים',
    description: 'Win 25 games',
    descriptionHe: 'נצח ב-25 משחקים',
    icon: '🎮',
    rarity: 'rare',
    xp: 200,
    category: 'game',
    condition: { type: 'count', target: 25, metric: 'games_won' }
  },
  
  // Learning achievements
  {
    id: 'okap-starter',
    title: 'Knowledge Seeker',
    titleHe: 'מחפש ידע',
    description: 'Complete 10 OKAP questions',
    descriptionHe: 'ענה על 10 שאלות OKAP',
    icon: '📚',
    rarity: 'common',
    xp: 50,
    category: 'learning',
    condition: { type: 'count', target: 10, metric: 'okap_questions' }
  },
  {
    id: 'okap-expert',
    title: 'OKAP Expert',
    titleHe: 'מומחה OKAP',
    description: 'Answer 100 OKAP questions correctly',
    descriptionHe: 'ענה נכון על 100 שאלות OKAP',
    icon: '🎓',
    rarity: 'epic',
    xp: 400,
    category: 'learning',
    condition: { type: 'count', target: 100, metric: 'okap_correct' }
  },
  
  // Special/Secret achievements
  {
    id: 'night-owl',
    title: 'Night Owl',
    titleHe: 'ינשוף לילה',
    description: 'Practice after midnight',
    descriptionHe: 'תרגל אחרי חצות',
    icon: '🦉',
    rarity: 'rare',
    xp: 100,
    category: 'mastery',
    condition: { type: 'special', target: 1, metric: 'night_practice' },
    secret: true
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    titleHe: 'ציפור מוקדמת',
    description: 'Practice before 6 AM',
    descriptionHe: 'תרגל לפני 6 בבוקר',
    icon: '🌅',
    rarity: 'rare',
    xp: 100,
    category: 'mastery',
    condition: { type: 'special', target: 1, metric: 'early_practice' },
    secret: true
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    titleHe: 'שד מהירות',
    description: 'Complete a simulation in under 30 seconds',
    descriptionHe: 'השלם סימולציה בפחות מ-30 שניות',
    icon: '⚡',
    rarity: 'epic',
    xp: 300,
    category: 'mastery',
    condition: { type: 'time', target: 30, metric: 'fastest_completion' },
    secret: true
  }
];

// =============================================================================
// STORES
// =============================================================================

const unlockedAchievements = writable<UnlockedAchievement[]>([]);
const achievementProgress = writable<Map<string, number>>(new Map());
const pendingNotifications = writable<Achievement[]>([]);

// =============================================================================
// DERIVED STORES
// =============================================================================

export const totalXP = derived(unlockedAchievements, $unlocked => {
  return $unlocked.reduce((sum, u) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === u.achievementId);
    return sum + (achievement?.xp || 0);
  }, 0);
});

export const unlockedCount = derived(unlockedAchievements, $unlocked => $unlocked.length);

export const achievementsByCategory = derived(unlockedAchievements, $unlocked => {
  const categories: Record<string, number> = {};
  
  for (const u of $unlocked) {
    const achievement = ACHIEVEMENTS.find(a => a.id === u.achievementId);
    if (achievement) {
      categories[achievement.category] = (categories[achievement.category] || 0) + 1;
    }
  }
  
  return categories;
});

// =============================================================================
// FUNCTIONS
// =============================================================================

/**
 * Initialize achievements from storage
 */
export function initAchievements(): void {
  if (typeof localStorage === 'undefined') return;
  
  const stored = localStorage.getItem('achievements');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      unlockedAchievements.set(parsed.map((u: UnlockedAchievement) => ({
        ...u,
        unlockedAt: new Date(u.unlockedAt)
      })));
    } catch {
      console.warn('Failed to parse achievements');
    }
  }
  
  const progress = localStorage.getItem('achievement-progress');
  if (progress) {
    try {
      achievementProgress.set(new Map(JSON.parse(progress)));
    } catch {
      console.warn('Failed to parse achievement progress');
    }
  }
}

/**
 * Save achievements to storage
 */
function saveAchievements(): void {
  if (typeof localStorage === 'undefined') return;
  
  localStorage.setItem('achievements', JSON.stringify(get(unlockedAchievements)));
  localStorage.setItem('achievement-progress', JSON.stringify([...get(achievementProgress)]));
}

/**
 * Check if achievement is unlocked
 */
export function isUnlocked(achievementId: string): boolean {
  return get(unlockedAchievements).some(u => u.achievementId === achievementId);
}

/**
 * Unlock an achievement
 */
export function unlockAchievement(achievementId: string): Achievement | null {
  if (isUnlocked(achievementId)) return null;
  
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return null;
  
  unlockedAchievements.update(list => [
    ...list,
    { achievementId, unlockedAt: new Date() }
  ]);
  
  pendingNotifications.update(list => [...list, achievement]);
  saveAchievements();
  
  return achievement;
}

/**
 * Update progress for an achievement
 */
export function updateProgress(metric: string, value: number): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  
  achievementProgress.update(progress => {
    progress.set(metric, value);
    return progress;
  });
  
  // Check all achievements that use this metric
  for (const achievement of ACHIEVEMENTS) {
    if (achievement.condition.metric === metric && !isUnlocked(achievement.id)) {
      const current = get(achievementProgress).get(metric) || 0;
      
      if (current >= achievement.condition.target) {
        const unlocked = unlockAchievement(achievement.id);
        if (unlocked) newlyUnlocked.push(unlocked);
      }
    }
  }
  
  saveAchievements();
  return newlyUnlocked;
}

/**
 * Increment progress for a metric
 */
export function incrementProgress(metric: string, amount: number = 1): Achievement[] {
  const current = get(achievementProgress).get(metric) || 0;
  return updateProgress(metric, current + amount);
}

/**
 * Get next pending notification
 */
export function getNextNotification(): Achievement | null {
  const pending = get(pendingNotifications);
  if (pending.length === 0) return null;
  
  const next = pending[0];
  pendingNotifications.update(list => list.slice(1));
  return next;
}

/**
 * Get achievement progress
 */
export function getProgress(achievementId: string): AchievementProgress | null {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return null;
  
  const current = get(achievementProgress).get(achievement.condition.metric || '') || 0;
  
  return {
    achievementId,
    current,
    target: achievement.condition.target
  };
}

/**
 * Check for time-based achievements
 */
export function checkTimeAchievements(): void {
  const hour = new Date().getHours();
  
  if (hour >= 0 && hour < 5) {
    incrementProgress('night_practice', 1);
  }
  
  if (hour >= 4 && hour < 6) {
    incrementProgress('early_practice', 1);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  unlockedAchievements,
  achievementProgress,
  pendingNotifications
};

export default {
  initAchievements,
  isUnlocked,
  unlockAchievement,
  updateProgress,
  incrementProgress,
  getNextNotification,
  getProgress,
  checkTimeAchievements
};

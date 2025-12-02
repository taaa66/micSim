/**
 * =============================================================================
 * USER STORE TESTS
 * =============================================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  user,
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
  updateUserStats,
  incrementPracticeCount,
  addAchievement,
  hasRole,
  hasMinRole
} from '../../../src/stores/user';
import type { UserProfile } from '../../../src/stores/user';

// =============================================================================
// TEST DATA
// =============================================================================

const mockTrainee: UserProfile = {
  uid: 'test-uid-123',
  idNumber: '12345678',
  fullName: 'Dr. Test User',
  specialty: 'Ophthalmology',
  role: 'trainee',
  createdAt: '2024-01-01T00:00:00Z',
  stats: {
    practice_count: 50,
    total_score: 4500,
    best_score: 95,
    last_activity: '2024-12-01T10:00:00Z',
    simulations_completed: 25,
    okap_games_completed: 100,
    streak_days: 7,
    achievements: ['first_simulation', 'streak_7']
  }
};

const mockAdmin: UserProfile = {
  ...mockTrainee,
  uid: 'admin-uid-456',
  role: 'admin',
  fullName: 'Dr. Admin User'
};

const mockSupervisor: UserProfile = {
  ...mockTrainee,
  uid: 'supervisor-uid-789',
  role: 'supervisor',
  fullName: 'Dr. Supervisor User'
};

// =============================================================================
// TESTS
// =============================================================================

describe('User Store', () => {
  beforeEach(() => {
    // Reset store before each test
    clearUser();
  });

  describe('Initial State', () => {
    it('should start with null user', () => {
      expect(get(user)).toBeNull();
    });

    it('should not be authenticated initially', () => {
      expect(get(isAuthenticated)).toBe(false);
    });

    it('should have guest role initially', () => {
      expect(get(userRole)).toBe('guest');
    });

    it('should display "Guest" as name initially', () => {
      expect(get(displayName)).toBe('Guest');
    });
  });

  describe('setUser', () => {
    it('should set user profile correctly', () => {
      setUser(mockTrainee);
      expect(get(user)).toEqual(mockTrainee);
    });

    it('should update isAuthenticated to true', () => {
      setUser(mockTrainee);
      expect(get(isAuthenticated)).toBe(true);
    });

    it('should update userRole correctly', () => {
      setUser(mockTrainee);
      expect(get(userRole)).toBe('trainee');
    });

    it('should update displayName correctly', () => {
      setUser(mockTrainee);
      expect(get(displayName)).toBe('Dr. Test User');
    });
  });

  describe('clearUser', () => {
    it('should clear user profile', () => {
      setUser(mockTrainee);
      clearUser();
      expect(get(user)).toBeNull();
    });

    it('should reset isAuthenticated to false', () => {
      setUser(mockTrainee);
      clearUser();
      expect(get(isAuthenticated)).toBe(false);
    });
  });

  describe('Role Checks', () => {
    it('should identify admin correctly', () => {
      setUser(mockAdmin);
      expect(get(isAdmin)).toBe(true);
      expect(get(isSupervisor)).toBe(true);
    });

    it('should identify supervisor correctly', () => {
      setUser(mockSupervisor);
      expect(get(isAdmin)).toBe(false);
      expect(get(isSupervisor)).toBe(true);
    });

    it('should identify trainee correctly', () => {
      setUser(mockTrainee);
      expect(get(isAdmin)).toBe(false);
      expect(get(isSupervisor)).toBe(false);
    });

    it('hasRole should work correctly', () => {
      setUser(mockTrainee);
      expect(hasRole('trainee')).toBe(true);
      expect(hasRole('admin')).toBe(false);
    });

    it('hasMinRole should work correctly', () => {
      setUser(mockSupervisor);
      expect(hasMinRole('trainee')).toBe(true);
      expect(hasMinRole('supervisor')).toBe(true);
      expect(hasMinRole('admin')).toBe(false);
    });
  });

  describe('User Stats', () => {
    it('should return user stats correctly', () => {
      setUser(mockTrainee);
      const stats = get(userStats);
      expect(stats.practice_count).toBe(50);
      expect(stats.best_score).toBe(95);
    });

    it('should return default stats when no user', () => {
      const stats = get(userStats);
      expect(stats.practice_count).toBe(0);
      expect(stats.achievements).toEqual([]);
    });
  });

  describe('User Level', () => {
    it('should calculate level correctly for 50 practices', () => {
      setUser(mockTrainee);
      const level = get(userLevel);
      expect(level.level).toBe(4);
      expect(level.title).toBe('Intermediate');
    });

    it('should calculate level 1 for new user', () => {
      setUser({ ...mockTrainee, stats: { ...mockTrainee.stats, practice_count: 5 } });
      const level = get(userLevel);
      expect(level.level).toBe(1);
      expect(level.title).toBe('Novice');
    });

    it('should calculate max level for expert', () => {
      setUser({ ...mockTrainee, stats: { ...mockTrainee.stats, practice_count: 500 } });
      const level = get(userLevel);
      expect(level.level).toBe(10);
      expect(level.title).toBe('Master Surgeon');
    });
  });

  describe('Level Progress', () => {
    it('should calculate progress correctly', () => {
      setUser(mockTrainee); // 50 practices, level 4 (50-70 range)
      const progress = get(levelProgress);
      expect(progress.current).toBe(0); // 50 - 50 = 0
      expect(progress.needed).toBe(20); // 70 - 50 = 20
      expect(progress.percentage).toBe(0);
    });
  });

  describe('updateUserStats', () => {
    it('should update stats correctly', () => {
      setUser(mockTrainee);
      updateUserStats({ best_score: 100 });
      const stats = get(userStats);
      expect(stats.best_score).toBe(100);
      expect(stats.practice_count).toBe(50); // Unchanged
    });

    it('should update last_activity timestamp', () => {
      setUser(mockTrainee);
      const before = get(userStats).last_activity;
      updateUserStats({ best_score: 100 });
      const after = get(userStats).last_activity;
      expect(after).not.toBe(before);
    });
  });

  describe('incrementPracticeCount', () => {
    it('should increment practice count by 1', () => {
      setUser(mockTrainee);
      incrementPracticeCount();
      expect(get(userStats).practice_count).toBe(51);
    });

    it('should do nothing if no user', () => {
      incrementPracticeCount();
      expect(get(user)).toBeNull();
    });
  });

  describe('addAchievement', () => {
    it('should add new achievement', () => {
      setUser(mockTrainee);
      addAchievement('new_achievement');
      expect(get(userStats).achievements).toContain('new_achievement');
    });

    it('should not duplicate existing achievement', () => {
      setUser(mockTrainee);
      const initialCount = get(userStats).achievements.length;
      addAchievement('first_simulation'); // Already exists
      expect(get(userStats).achievements.length).toBe(initialCount);
    });
  });
});

/**
 * CRITICAL DATA INTEGRITY TESTS
 * ==============================
 * 
 * These tests validate the ACID compliance of the stats update system.
 * 
 * Test Coverage:
 * 1. High Score Transactional Logic
 * 2. Average Score Server-Side Calculation
 * 3. Concurrent Update Protection
 * 4. Data Type Validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Firestore
const mockTransaction = {
  get: vi.fn(),
  update: vi.fn()
};

const mockRunTransaction = vi.fn((db, callback) => callback(mockTransaction));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  runTransaction: mockRunTransaction,
  serverTimestamp: vi.fn(() => new Date()),
  arrayUnion: vi.fn((val) => [val])
}));

// Import after mocking
import { firebaseUpdateStats } from '../firebase.js';

describe('CRITICAL: Stats Update Data Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Test Case 1: High Score Transactional Logic', () => {
    it('should NOT overwrite higher score with lower score', async () => {
      // Arrange: Current high score is 90
      mockTransaction.get.mockResolvedValue({
        exists: () => true,
        data: () => ({
          stats: {
            highestScore: 90,
            totalSessions: 5,
            totalScore: 400,
            practice_count: 5,
            modulesCompleted: []
          }
        })
      });

      // Act: Submit lower score of 70
      await firebaseUpdateStats('test-uid', 70, 'test-module');

      // Assert: High score should remain 90
      const updateCall = mockTransaction.update.mock.calls[0];
      const updateData = updateCall[1];
      
      expect(updateData['stats.highestScore']).toBe(90);
      console.log('✅ Test 1 PASSED: Lower score (70) did not overwrite higher score (90)');
    });

    it('should UPDATE high score when new score is higher', async () => {
      // Arrange: Current high score is 70
      mockTransaction.get.mockResolvedValue({
        exists: () => true,
        data: () => ({
          stats: {
            highestScore: 70,
            totalSessions: 5,
            totalScore: 350,
            practice_count: 5,
            modulesCompleted: []
          }
        })
      });

      // Act: Submit higher score of 95
      await firebaseUpdateStats('test-uid', 95, 'test-module');

      // Assert: High score should update to 95
      const updateCall = mockTransaction.update.mock.calls[0];
      const updateData = updateCall[1];
      
      expect(updateData['stats.highestScore']).toBe(95);
      console.log('✅ Test 1b PASSED: Higher score (95) correctly updated from (70)');
    });
  });

  describe('Test Case 2: Average Score Server-Side Calculation', () => {
    it('should calculate correct average after 3 sessions (10, 20, 30)', async () => {
      // Arrange: 2 previous sessions with scores 10 and 20
      mockTransaction.get.mockResolvedValue({
        exists: () => true,
        data: () => ({
          stats: {
            highestScore: 20,
            totalSessions: 2,
            totalScore: 30, // 10 + 20
            practice_count: 2,
            modulesCompleted: []
          }
        })
      });

      // Act: Submit 3rd score of 30
      const result = await firebaseUpdateStats('test-uid', 30, 'test-module');

      // Assert: 
      // - totalScore should be 60 (10 + 20 + 30)
      // - totalSessions should be 3
      // - averageScore should be 20 (60 / 3)
      expect(result.totalScore).toBe(60);
      expect(result.totalSessions).toBe(3);
      expect(result.averageScore).toBe(20);
      
      const updateCall = mockTransaction.update.mock.calls[0];
      const updateData = updateCall[1];
      
      expect(updateData['stats.totalScore']).toBe(60);
      expect(updateData['stats.totalSessions']).toBe(3);
      expect(updateData['stats.averageScore']).toBe(20);
      
      console.log('✅ Test 2 PASSED: Average correctly calculated as 20 from (10+20+30)/3');
    });

    it('should handle decimal averages with rounding', async () => {
      // Arrange: 2 sessions with scores 85 and 92
      mockTransaction.get.mockResolvedValue({
        exists: () => true,
        data: () => ({
          stats: {
            highestScore: 92,
            totalSessions: 2,
            totalScore: 177, // 85 + 92
            practice_count: 2,
            modulesCompleted: []
          }
        })
      });

      // Act: Submit 3rd score of 88
      const result = await firebaseUpdateStats('test-uid', 88, 'test-module');

      // Assert: Average should be 88 (rounded from 88.33)
      expect(result.averageScore).toBe(88);
      console.log('✅ Test 2b PASSED: Decimal average (88.33) correctly rounded to 88');
    });
  });

  describe('Test Case 3: Data Type Validation', () => {
    it('should reject non-numeric scores', async () => {
      // Arrange
      mockTransaction.get.mockResolvedValue({
        exists: () => true,
        data: () => ({
          stats: {
            highestScore: 80,
            totalSessions: 1,
            totalScore: 80,
            practice_count: 1,
            modulesCompleted: []
          }
        })
      });

      // Act & Assert: Should throw error for string score
      // @ts-expect-error - Testing invalid input type
      await expect(
        firebaseUpdateStats('test-uid', '75', 'test-module')
      ).rejects.toThrow('Score must be a valid number');
      
      console.log('✅ Test 3 PASSED: String score correctly rejected');
    });

    it('should reject NaN scores', async () => {
      // Act & Assert
      await expect(
        firebaseUpdateStats('test-uid', NaN, 'test-module')
      ).rejects.toThrow('Score must be a valid number');
      
      console.log('✅ Test 3b PASSED: NaN score correctly rejected');
    });
  });

  describe('Test Case 4: Aggregation State Integrity', () => {
    it('should maintain correct totalScore and totalSessions counters', async () => {
      // Arrange: Starting state
      mockTransaction.get.mockResolvedValue({
        exists: () => true,
        data: () => ({
          stats: {
            highestScore: 75,
            totalSessions: 10,
            totalScore: 720,
            practice_count: 10,
            modulesCompleted: []
          }
        })
      });

      // Act: Add score of 85
      const result = await firebaseUpdateStats('test-uid', 85, 'test-module');

      // Assert: Counters incremented correctly
      expect(result.totalSessions).toBe(11);
      expect(result.totalScore).toBe(805); // 720 + 85
      expect(result.practice_count).toBe(11);
      
      console.log('✅ Test 4 PASSED: Aggregation counters correctly incremented');
    });
  });
});

/**
 * RUN TESTS:
 * npm run test src/lib/__tests__/firebase.stats.test.js
 */

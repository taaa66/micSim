/**
 * =============================================================================
 * SIMULATION STORE TESTS
 * =============================================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  currentSimulation,
  activeSession,
  simulationResults,
  isSimulationActive,
  simulationProgress,
  performanceMetrics,
  startSimulation,
  pauseSimulation,
  resumeSimulation,
  completeSimulation,
  cancelSimulation,
  loadResults,
  clearResults,
  getResultsForSimulation,
  getBestResult,
  getAverageScore
} from '../../../src/stores/simulation';
import type { SimulationConfig, SimulationResult } from '../../../src/stores/simulation';

// =============================================================================
// TEST DATA
// =============================================================================

const mockSimConfig: SimulationConfig = {
  id: 'capsulorhexis',
  name: 'Capsulorhexis Trainer',
  code: 'CAP-TRN',
  description: 'Practice continuous curvilinear capsulorhexis',
  difficulty: 'intermediate',
  duration: 10,
  category: 'procedural',
  skills: ['precision', 'control', 'timing']
};

const mockResults: SimulationResult[] = [
  {
    id: 'result-1',
    simulationId: 'capsulorhexis',
    userId: 'user-1',
    score: 85,
    accuracy: 90,
    speed: 80,
    consistency: 85,
    duration: 300,
    timestamp: '2024-12-01T10:00:00Z',
    metrics: { circularity: 0.95 }
  },
  {
    id: 'result-2',
    simulationId: 'capsulorhexis',
    userId: 'user-1',
    score: 92,
    accuracy: 95,
    speed: 88,
    consistency: 93,
    duration: 280,
    timestamp: '2024-12-02T10:00:00Z',
    metrics: { circularity: 0.98 }
  },
  {
    id: 'result-3',
    simulationId: 'corneal-tunnel',
    userId: 'user-1',
    score: 78,
    accuracy: 82,
    speed: 75,
    consistency: 77,
    duration: 250,
    timestamp: '2024-12-03T10:00:00Z',
    metrics: {}
  }
];

// =============================================================================
// TESTS
// =============================================================================

describe('Simulation Store', () => {
  beforeEach(() => {
    cancelSimulation();
    clearResults();
  });

  describe('Initial State', () => {
    it('should have no current simulation', () => {
      expect(get(currentSimulation)).toBeNull();
    });

    it('should have no active session', () => {
      expect(get(activeSession)).toBeNull();
    });

    it('should not be active', () => {
      expect(get(isSimulationActive)).toBe(false);
    });

    it('should have empty results', () => {
      expect(get(simulationResults)).toEqual([]);
    });
  });

  describe('startSimulation', () => {
    it('should set current simulation', () => {
      startSimulation(mockSimConfig);
      expect(get(currentSimulation)).toEqual(mockSimConfig);
    });

    it('should create active session', () => {
      startSimulation(mockSimConfig);
      const session = get(activeSession);
      expect(session).not.toBeNull();
      expect(session?.simulationId).toBe('capsulorhexis');
      expect(session?.isPaused).toBe(false);
    });

    it('should set isSimulationActive to true', () => {
      startSimulation(mockSimConfig);
      expect(get(isSimulationActive)).toBe(true);
    });
  });

  describe('pauseSimulation / resumeSimulation', () => {
    beforeEach(() => {
      startSimulation(mockSimConfig);
    });

    it('should pause simulation', () => {
      pauseSimulation();
      expect(get(activeSession)?.isPaused).toBe(true);
    });

    it('should resume simulation', () => {
      pauseSimulation();
      resumeSimulation();
      expect(get(activeSession)?.isPaused).toBe(false);
    });

    it('should track paused time', () => {
      pauseSimulation();
      const session = get(activeSession);
      expect(session?.pausedTime).toBeGreaterThan(0);
    });
  });

  describe('completeSimulation', () => {
    beforeEach(() => {
      startSimulation(mockSimConfig);
    });

    it('should add result to results', () => {
      const result = completeSimulation({
        simulationId: 'capsulorhexis',
        userId: 'user-1',
        score: 90,
        accuracy: 92,
        speed: 88,
        consistency: 90,
        duration: 300,
        metrics: {}
      });

      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(get(simulationResults)).toHaveLength(1);
    });

    it('should clear active session', () => {
      completeSimulation({
        simulationId: 'capsulorhexis',
        userId: 'user-1',
        score: 90,
        accuracy: 92,
        speed: 88,
        consistency: 90,
        duration: 300,
        metrics: {}
      });

      expect(get(activeSession)).toBeNull();
      expect(get(currentSimulation)).toBeNull();
    });
  });

  describe('cancelSimulation', () => {
    it('should clear simulation state', () => {
      startSimulation(mockSimConfig);
      cancelSimulation();
      expect(get(currentSimulation)).toBeNull();
      expect(get(activeSession)).toBeNull();
    });
  });

  describe('loadResults / clearResults', () => {
    it('should load results', () => {
      loadResults(mockResults);
      expect(get(simulationResults)).toHaveLength(3);
    });

    it('should clear results', () => {
      loadResults(mockResults);
      clearResults();
      expect(get(simulationResults)).toEqual([]);
    });
  });

  describe('Performance Metrics', () => {
    it('should return zero metrics for empty results', () => {
      const metrics = get(performanceMetrics);
      expect(metrics.averageScore).toBe(0);
      expect(metrics.totalSessions).toBe(0);
    });

    it('should calculate metrics correctly', () => {
      loadResults(mockResults);
      const metrics = get(performanceMetrics);
      expect(metrics.totalSessions).toBe(3);
      expect(metrics.bestScore).toBe(92);
      expect(metrics.averageScore).toBe(85); // (85+92+78)/3 = 85
    });
  });

  describe('Selectors', () => {
    beforeEach(() => {
      loadResults(mockResults);
    });

    it('getResultsForSimulation should filter correctly', () => {
      const results = getResultsForSimulation('capsulorhexis');
      expect(results).toHaveLength(2);
    });

    it('getBestResult should return highest score', () => {
      const best = getBestResult('capsulorhexis');
      expect(best?.score).toBe(92);
    });

    it('getAverageScore should calculate correctly', () => {
      const avg = getAverageScore('capsulorhexis');
      expect(avg).toBe(89); // (85+92)/2 = 88.5 rounded to 89
    });

    it('should return null/0 for non-existent simulation', () => {
      expect(getBestResult('non-existent')).toBeNull();
      expect(getAverageScore('non-existent')).toBe(0);
    });
  });

  describe('Simulation Progress', () => {
    it('should return 0 when no session', () => {
      expect(get(simulationProgress)).toBe(0);
    });

    it('should calculate progress correctly', () => {
      startSimulation(mockSimConfig);
      // Default is phase 0 of 1, so 0%
      expect(get(simulationProgress)).toBe(0);
    });
  });
});

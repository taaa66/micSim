/**
 * =============================================================================
 * SIMULATION STORE
 * =============================================================================
 * State management for surgical simulations
 * =============================================================================
 */

import { writable, derived, get } from 'svelte/store';

// =============================================================================
// TYPES
// =============================================================================

export interface SimulationConfig {
  id: string;
  name: string;
  code: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // minutes
  category: 'motor' | 'cognitive' | 'procedural';
  skills: string[];
  prerequisites?: string[];
}

export interface SimulationResult {
  id: string;
  simulationId: string;
  userId: string;
  score: number;
  accuracy: number;
  speed: number;
  consistency: number;
  duration: number; // seconds
  timestamp: string;
  metrics: Record<string, number>;
  feedback?: string[];
}

export interface SimulationSession {
  simulationId: string;
  startTime: number;
  pausedTime: number;
  isPaused: boolean;
  currentPhase: number;
  totalPhases: number;
  metrics: Record<string, number>;
}

// =============================================================================
// STORES
// =============================================================================

// Current simulation being played
export const currentSimulation = writable<SimulationConfig | null>(null);

// Active session
export const activeSession = writable<SimulationSession | null>(null);

// Historical results
export const simulationResults = writable<SimulationResult[]>([]);

// Loading state
export const isSimulationLoading = writable<boolean>(false);

// =============================================================================
// DERIVED STORES
// =============================================================================

// Is simulation active
export const isSimulationActive = derived(activeSession, $session => $session !== null);

// Current simulation progress
export const simulationProgress = derived(activeSession, $session => {
  if (!$session) return 0;
  return Math.round(($session.currentPhase / $session.totalPhases) * 100);
});

// Elapsed time in current session
export const elapsedTime = derived(activeSession, $session => {
  if (!$session) return 0;
  if ($session.isPaused) return $session.pausedTime;
  return Date.now() - $session.startTime + $session.pausedTime;
});

// Performance metrics for current simulation
export const performanceMetrics = derived(simulationResults, $results => {
  if ($results.length === 0) {
    return {
      averageScore: 0,
      bestScore: 0,
      totalSessions: 0,
      averageAccuracy: 0,
      improvement: 0
    };
  }

  const scores = $results.map(r => r.score);
  const accuracies = $results.map(r => r.accuracy);
  
  // Calculate improvement (last 5 vs first 5)
  let improvement = 0;
  if ($results.length >= 10) {
    const first5Avg = scores.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    const last5Avg = scores.slice(-5).reduce((a, b) => a + b, 0) / 5;
    improvement = Math.round(((last5Avg - first5Avg) / first5Avg) * 100);
  }

  return {
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    bestScore: Math.max(...scores),
    totalSessions: $results.length,
    averageAccuracy: Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length),
    improvement
  };
});

// Results grouped by simulation
export const resultsBySimulation = derived(simulationResults, $results => {
  const grouped = new Map<string, SimulationResult[]>();
  
  for (const result of $results) {
    const existing = grouped.get(result.simulationId) || [];
    existing.push(result);
    grouped.set(result.simulationId, existing);
  }
  
  return grouped;
});

// Recent results (last 10)
export const recentResults = derived(simulationResults, $results => 
  [...$results].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 10)
);

// =============================================================================
// ACTIONS
// =============================================================================

export function startSimulation(config: SimulationConfig): void {
  currentSimulation.set(config);
  activeSession.set({
    simulationId: config.id,
    startTime: Date.now(),
    pausedTime: 0,
    isPaused: false,
    currentPhase: 0,
    totalPhases: 1,
    metrics: {}
  });
  isSimulationLoading.set(false);
}

export function pauseSimulation(): void {
  activeSession.update($session => {
    if (!$session || $session.isPaused) return $session;
    return {
      ...$session,
      isPaused: true,
      pausedTime: Date.now() - $session.startTime + $session.pausedTime
    };
  });
}

export function resumeSimulation(): void {
  activeSession.update($session => {
    if (!$session || !$session.isPaused) return $session;
    return {
      ...$session,
      isPaused: false,
      startTime: Date.now()
    };
  });
}

export function updateSessionMetrics(metrics: Record<string, number>): void {
  activeSession.update($session => {
    if (!$session) return $session;
    return {
      ...$session,
      metrics: { ...$session.metrics, ...metrics }
    };
  });
}

export function advancePhase(): void {
  activeSession.update($session => {
    if (!$session) return $session;
    return {
      ...$session,
      currentPhase: Math.min($session.currentPhase + 1, $session.totalPhases)
    };
  });
}

export function completeSimulation(result: Omit<SimulationResult, 'id' | 'timestamp'>): SimulationResult {
  const fullResult: SimulationResult = {
    ...result,
    id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };

  simulationResults.update($results => [...$results, fullResult]);
  
  // Clear active session
  activeSession.set(null);
  currentSimulation.set(null);

  return fullResult;
}

export function cancelSimulation(): void {
  activeSession.set(null);
  currentSimulation.set(null);
}

export function loadResults(results: SimulationResult[]): void {
  simulationResults.set(results);
}

export function clearResults(): void {
  simulationResults.set([]);
}

// =============================================================================
// SELECTORS
// =============================================================================

export function getResultsForSimulation(simulationId: string): SimulationResult[] {
  const grouped = get(resultsBySimulation);
  return grouped.get(simulationId) || [];
}

export function getBestResult(simulationId: string): SimulationResult | null {
  const results = getResultsForSimulation(simulationId);
  if (results.length === 0) return null;
  return results.reduce((best, current) => 
    current.score > best.score ? current : best
  );
}

export function getAverageScore(simulationId: string): number {
  const results = getResultsForSimulation(simulationId);
  if (results.length === 0) return 0;
  return Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
}

export default {
  currentSimulation,
  activeSession,
  simulationResults,
  isSimulationLoading,
  isSimulationActive,
  simulationProgress,
  elapsedTime,
  performanceMetrics,
  resultsBySimulation,
  recentResults,
  startSimulation,
  pauseSimulation,
  resumeSimulation,
  updateSessionMetrics,
  advancePhase,
  completeSimulation,
  cancelSimulation,
  loadResults,
  clearResults,
  getResultsForSimulation,
  getBestResult,
  getAverageScore
};

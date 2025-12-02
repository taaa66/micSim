/**
 * =============================================================================
 * SPACED REPETITION SERVICE
 * =============================================================================
 * Implements SM-2 algorithm for optimal learning intervals
 * Tracks question performance and schedules reviews
 * =============================================================================
 */

export interface QuestionPerformance {
  questionId: string;
  gameId: string;
  easeFactor: number;      // 1.3 - 2.5, starts at 2.5
  interval: number;        // Days until next review
  repetitions: number;     // Consecutive correct answers
  nextReview: Date;
  lastReview: Date | null;
  history: AnswerRecord[];
}

export interface AnswerRecord {
  timestamp: Date;
  correct: boolean;
  responseTimeMs: number;
  quality: number;         // 0-5 rating based on performance
}

export interface StudySession {
  gameId: string;
  questionsReviewed: string[];
  correctCount: number;
  totalCount: number;
  averageResponseTime: number;
  timestamp: Date;
}

// SM-2 Algorithm Constants
const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;
const INITIAL_INTERVAL = 1;
const SECOND_INTERVAL = 6;

/**
 * Calculate quality rating (0-5) based on response
 */
export function calculateQuality(correct: boolean, responseTimeMs: number, maxTimeMs: number = 15000): number {
  if (!correct) {
    return responseTimeMs < maxTimeMs * 0.5 ? 1 : 0; // Quick wrong vs slow wrong
  }
  
  const timeRatio = responseTimeMs / maxTimeMs;
  
  if (timeRatio < 0.2) return 5;      // Very fast correct
  if (timeRatio < 0.4) return 4;      // Fast correct
  if (timeRatio < 0.6) return 3;      // Normal correct
  if (timeRatio < 0.8) return 2;      // Slow correct (hesitation)
  return 2;                            // Very slow but correct
}

/**
 * Update question performance using SM-2 algorithm
 */
export function updatePerformance(
  current: QuestionPerformance | null,
  questionId: string,
  gameId: string,
  correct: boolean,
  responseTimeMs: number
): QuestionPerformance {
  const quality = calculateQuality(correct, responseTimeMs);
  const now = new Date();
  
  // Initialize if new question
  if (!current) {
    current = {
      questionId,
      gameId,
      easeFactor: DEFAULT_EASE_FACTOR,
      interval: 0,
      repetitions: 0,
      nextReview: now,
      lastReview: null,
      history: []
    };
  }
  
  // Add to history
  const record: AnswerRecord = {
    timestamp: now,
    correct,
    responseTimeMs,
    quality
  };
  
  const history = [...current.history, record].slice(-20); // Keep last 20
  
  // SM-2 Algorithm
  let { easeFactor, interval, repetitions } = current;
  
  if (quality >= 3) {
    // Correct answer
    if (repetitions === 0) {
      interval = INITIAL_INTERVAL;
    } else if (repetitions === 1) {
      interval = SECOND_INTERVAL;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    // Incorrect answer - reset
    repetitions = 0;
    interval = INITIAL_INTERVAL;
  }
  
  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);
  
  // Calculate next review date
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + interval);
  
  return {
    questionId,
    gameId,
    easeFactor,
    interval,
    repetitions,
    nextReview,
    lastReview: now,
    history
  };
}

/**
 * Get questions due for review
 */
export function getDueQuestions(
  performances: QuestionPerformance[],
  gameId?: string
): QuestionPerformance[] {
  const now = new Date();
  
  return performances
    .filter(p => {
      if (gameId && p.gameId !== gameId) return false;
      return p.nextReview <= now;
    })
    .sort((a, b) => {
      // Prioritize: overdue > low ease factor > older
      const aOverdue = now.getTime() - a.nextReview.getTime();
      const bOverdue = now.getTime() - b.nextReview.getTime();
      
      if (Math.abs(aOverdue - bOverdue) > 86400000) { // More than 1 day difference
        return bOverdue - aOverdue;
      }
      
      if (Math.abs(a.easeFactor - b.easeFactor) > 0.2) {
        return a.easeFactor - b.easeFactor; // Lower ease = harder = priority
      }
      
      return (a.lastReview?.getTime() || 0) - (b.lastReview?.getTime() || 0);
    });
}

/**
 * Get weak areas (questions with low ease factor or many wrong answers)
 */
export function getWeakAreas(
  performances: QuestionPerformance[],
  threshold: number = 2.0
): QuestionPerformance[] {
  return performances
    .filter(p => p.easeFactor < threshold || p.repetitions < 2)
    .sort((a, b) => a.easeFactor - b.easeFactor);
}

/**
 * Calculate mastery level for a game
 */
export function calculateMastery(performances: QuestionPerformance[], gameId: string): {
  level: 'novice' | 'learning' | 'proficient' | 'expert' | 'master';
  percentage: number;
  totalQuestions: number;
  masteredQuestions: number;
} {
  const gamePerformances = performances.filter(p => p.gameId === gameId);
  const totalQuestions = gamePerformances.length;
  
  if (totalQuestions === 0) {
    return { level: 'novice', percentage: 0, totalQuestions: 0, masteredQuestions: 0 };
  }
  
  // Mastered = ease factor >= 2.3 AND at least 3 correct repetitions
  const masteredQuestions = gamePerformances.filter(
    p => p.easeFactor >= 2.3 && p.repetitions >= 3
  ).length;
  
  const percentage = (masteredQuestions / totalQuestions) * 100;
  
  let level: 'novice' | 'learning' | 'proficient' | 'expert' | 'master';
  if (percentage >= 90) level = 'master';
  else if (percentage >= 70) level = 'expert';
  else if (percentage >= 50) level = 'proficient';
  else if (percentage >= 20) level = 'learning';
  else level = 'novice';
  
  return { level, percentage, totalQuestions, masteredQuestions };
}

/**
 * Get study recommendations
 */
export function getStudyRecommendations(
  performances: QuestionPerformance[],
  recentSessions: StudySession[]
): {
  recommendedGames: string[];
  focusAreas: string[];
  estimatedStudyTime: number;
  streak: number;
} {
  const dueQuestions = getDueQuestions(performances);
  const weakAreas = getWeakAreas(performances);
  
  // Count due questions per game
  const gamesDue = new Map<string, number>();
  dueQuestions.forEach(q => {
    gamesDue.set(q.gameId, (gamesDue.get(q.gameId) || 0) + 1);
  });
  
  // Sort games by due count
  const recommendedGames = Array.from(gamesDue.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([gameId]) => gameId);
  
  // Get focus areas (games with weak questions)
  const weakGameCounts = new Map<string, number>();
  weakAreas.forEach(q => {
    weakGameCounts.set(q.gameId, (weakGameCounts.get(q.gameId) || 0) + 1);
  });
  
  const focusAreas = Array.from(weakGameCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([gameId]) => gameId);
  
  // Estimate study time (15 seconds per question + overhead)
  const estimatedStudyTime = Math.ceil(dueQuestions.length * 20 / 60); // minutes
  
  // Calculate streak (consecutive days with sessions)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let checkDate = new Date(today);
  
  while (true) {
    const hasSession = recentSessions.some(s => {
      const sessionDate = new Date(s.timestamp);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === checkDate.getTime();
    });
    
    if (!hasSession && checkDate < today) break;
    if (hasSession) streak++;
    
    checkDate.setDate(checkDate.getDate() - 1);
    if (streak > 365) break; // Safety limit
  }
  
  return {
    recommendedGames,
    focusAreas,
    estimatedStudyTime,
    streak
  };
}

/**
 * Local storage helpers
 */
const STORAGE_KEY = 'ophthalmosim_spaced_repetition';

export function savePerformances(performances: QuestionPerformance[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(performances));
  } catch (e) {
    console.error('Failed to save spaced repetition data:', e);
  }
}

export function loadPerformances(): QuestionPerformance[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    // Convert date strings back to Date objects
    return parsed.map((p: any) => ({
      ...p,
      nextReview: new Date(p.nextReview),
      lastReview: p.lastReview ? new Date(p.lastReview) : null,
      history: p.history.map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp)
      }))
    }));
  } catch (e) {
    console.error('Failed to load spaced repetition data:', e);
    return [];
  }
}

const SESSIONS_KEY = 'ophthalmosim_study_sessions';

export function saveSessions(sessions: StudySession[]): void {
  try {
    // Keep last 100 sessions
    const toSave = sessions.slice(-100);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save study sessions:', e);
  }
}

export function loadSessions(): StudySession[] {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.map((s: any) => ({
      ...s,
      timestamp: new Date(s.timestamp)
    }));
  } catch (e) {
    console.error('Failed to load study sessions:', e);
    return [];
  }
}

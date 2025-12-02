/**
 * =============================================================================
 * AI COACHING SERVICE - Real-time Intelligent Feedback System
 * =============================================================================
 * Provides AI-powered coaching for microsurgery simulation training:
 * - Real-time feedback during practice
 * - Personalized recommendations based on performance patterns
 * - Error prediction using pattern recognition
 * - Adaptive difficulty adjustment
 * =============================================================================
 */

import { writable, derived, get } from 'svelte/store';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface IPointerMetrics {
  x: number;
  y: number;
  pressure: number;
  velocity: number;
  tiltX: number;
  tiltY: number;
  timestamp: number;
}

export interface IPerformancePattern {
  type: 'tremor' | 'speed' | 'pressure' | 'accuracy' | 'consistency';
  severity: 'low' | 'medium' | 'high';
  frequency: number;
  lastOccurrence: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ICoachingFeedback {
  id: string;
  type: 'tip' | 'warning' | 'encouragement' | 'correction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  messageHe: string; // Hebrew translation
  category: 'tremor' | 'speed' | 'pressure' | 'path' | 'technique' | 'general';
  timestamp: number;
  dismissed: boolean;
}

export interface IRecommendation {
  id: string;
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
  priority: number; // 1-10
  category: 'exercise' | 'technique' | 'rest' | 'difficulty' | 'focus';
  actionable: boolean;
  targetMetric?: string;
}

export interface IErrorPrediction {
  type: string;
  probability: number; // 0-1
  timeToOccurrence: number; // ms
  preventionTip: string;
  preventionTipHe: string;
}

export interface IDifficultyLevel {
  level: number; // 1-10
  name: string;
  nameHe: string;
  tolerances: {
    pathDeviation: number;
    tremorThreshold: number;
    speedRange: [number, number];
    pressureRange: [number, number];
    timeLimit: number;
  };
}

export interface ISessionAnalytics {
  sessionId: string;
  moduleId: string;
  startTime: number;
  metrics: {
    avgTremor: number;
    avgSpeed: number;
    avgPressure: number;
    pathAccuracy: number;
    consistency: number;
  };
  patterns: IPerformancePattern[];
  feedbackHistory: ICoachingFeedback[];
  difficultyProgression: number[];
}

// =============================================================================
// COACHING FEEDBACK TEMPLATES
// =============================================================================

const FEEDBACK_TEMPLATES: Record<string, { en: string; he: string }[]> = {
  tremor_high: [
    { en: "High tremor detected. Try relaxing your grip and breathing steadily.", he: "זוהה רעד גבוה. נסה להרפות את האחיזה ולנשום באופן יציב." },
    { en: "Your hand is shaking. Rest your wrist on the surface for stability.", he: "היד שלך רועדת. הנח את פרק כף היד על המשטח ליציבות." },
    { en: "Tremor increasing. Consider taking a short break.", he: "הרעד מתגבר. שקול לקחת הפסקה קצרה." }
  ],
  tremor_improving: [
    { en: "Great improvement! Your tremor control is getting better.", he: "שיפור מצוין! השליטה ברעד משתפרת." },
    { en: "Steadier hands detected. Keep up the good work!", he: "ידיים יציבות יותר. המשך כך!" }
  ],
  speed_too_fast: [
    { en: "Slow down. Precision is more important than speed.", he: "האט. דיוק חשוב יותר ממהירות." },
    { en: "Moving too quickly. Surgical precision requires patience.", he: "תנועה מהירה מדי. דיוק כירורגי דורש סבלנות." }
  ],
  speed_too_slow: [
    { en: "You can move a bit faster while maintaining control.", he: "אתה יכול לנוע קצת יותר מהר תוך שמירה על שליטה." },
    { en: "Good control, but try to increase your pace slightly.", he: "שליטה טובה, אבל נסה להגביר קצת את הקצב." }
  ],
  speed_optimal: [
    { en: "Excellent pace! Maintaining optimal speed.", he: "קצב מצוין! שומר על מהירות אופטימלית." }
  ],
  pressure_inconsistent: [
    { en: "Pressure varies too much. Try to maintain consistent force.", he: "הלחץ משתנה מדי. נסה לשמור על כוח עקבי." },
    { en: "Uneven pressure detected. Focus on steady application.", he: "זוהה לחץ לא אחיד. התמקד ביישום יציב." }
  ],
  pressure_optimal: [
    { en: "Perfect pressure control!", he: "שליטה מושלמת בלחץ!" }
  ],
  path_deviation: [
    { en: "Drifting from target path. Refocus on the guide line.", he: "סוטה מהמסלול. התמקד מחדש בקו המנחה." },
    { en: "Path accuracy dropping. Small corrections needed.", he: "דיוק המסלול יורד. נדרשים תיקונים קטנים." }
  ],
  path_excellent: [
    { en: "Excellent path following! Surgical precision achieved.", he: "מעקב מסלול מצוין! הושג דיוק כירורגי." }
  ],
  fatigue_detected: [
    { en: "Signs of fatigue detected. Consider a 2-minute break.", he: "זוהו סימני עייפות. שקול הפסקה של 2 דקות." },
    { en: "Performance declining - you may be getting tired.", he: "הביצועים יורדים - ייתכן שאתה מתעייף." }
  ],
  encouragement: [
    { en: "You're doing great! Keep practicing.", he: "אתה מצליח! המשך להתאמן." },
    { en: "Excellent progress this session!", he: "התקדמות מצוינת באימון הזה!" },
    { en: "Your skills are improving noticeably.", he: "הכישורים שלך משתפרים באופן ניכר." }
  ],
  milestone: [
    { en: "New personal best achieved!", he: "שיא אישי חדש הושג!" },
    { en: "You've mastered this difficulty level!", he: "שלטת ברמת קושי זו!" }
  ]
};

// =============================================================================
// DIFFICULTY LEVELS
// =============================================================================

export const DIFFICULTY_LEVELS: IDifficultyLevel[] = [
  {
    level: 1,
    name: "Beginner",
    nameHe: "מתחיל",
    tolerances: {
      pathDeviation: 30,
      tremorThreshold: 8,
      speedRange: [0.05, 0.8],
      pressureRange: [0.2, 0.9],
      timeLimit: 120000
    }
  },
  {
    level: 2,
    name: "Novice",
    nameHe: "טירון",
    tolerances: {
      pathDeviation: 25,
      tremorThreshold: 7,
      speedRange: [0.08, 0.7],
      pressureRange: [0.25, 0.85],
      timeLimit: 100000
    }
  },
  {
    level: 3,
    name: "Intermediate",
    nameHe: "בינוני",
    tolerances: {
      pathDeviation: 20,
      tremorThreshold: 6,
      speedRange: [0.1, 0.6],
      pressureRange: [0.3, 0.8],
      timeLimit: 80000
    }
  },
  {
    level: 4,
    name: "Advanced",
    nameHe: "מתקדם",
    tolerances: {
      pathDeviation: 15,
      tremorThreshold: 5,
      speedRange: [0.12, 0.55],
      pressureRange: [0.35, 0.75],
      timeLimit: 70000
    }
  },
  {
    level: 5,
    name: "Proficient",
    nameHe: "מיומן",
    tolerances: {
      pathDeviation: 12,
      tremorThreshold: 4.5,
      speedRange: [0.15, 0.5],
      pressureRange: [0.38, 0.72],
      timeLimit: 60000
    }
  },
  {
    level: 6,
    name: "Expert",
    nameHe: "מומחה",
    tolerances: {
      pathDeviation: 10,
      tremorThreshold: 4,
      speedRange: [0.18, 0.45],
      pressureRange: [0.4, 0.7],
      timeLimit: 55000
    }
  },
  {
    level: 7,
    name: "Master",
    nameHe: "אמן",
    tolerances: {
      pathDeviation: 8,
      tremorThreshold: 3.5,
      speedRange: [0.2, 0.42],
      pressureRange: [0.42, 0.68],
      timeLimit: 50000
    }
  },
  {
    level: 8,
    name: "Specialist",
    nameHe: "מתמחה",
    tolerances: {
      pathDeviation: 6,
      tremorThreshold: 3,
      speedRange: [0.22, 0.4],
      pressureRange: [0.44, 0.66],
      timeLimit: 45000
    }
  },
  {
    level: 9,
    name: "Surgeon",
    nameHe: "מנתח",
    tolerances: {
      pathDeviation: 5,
      tremorThreshold: 2.5,
      speedRange: [0.24, 0.38],
      pressureRange: [0.46, 0.64],
      timeLimit: 40000
    }
  },
  {
    level: 10,
    name: "Virtuoso",
    nameHe: "וירטואוז",
    tolerances: {
      pathDeviation: 4,
      tremorThreshold: 2,
      speedRange: [0.26, 0.36],
      pressureRange: [0.48, 0.62],
      timeLimit: 35000
    }
  }
];

// =============================================================================
// AI COACHING SERVICE CLASS
// =============================================================================

export class AICoachingService {
  // Stores
  private currentFeedback = writable<ICoachingFeedback[]>([]);
  private recommendations = writable<IRecommendation[]>([]);
  private errorPredictions = writable<IErrorPrediction[]>([]);
  private currentDifficulty = writable<IDifficultyLevel>(DIFFICULTY_LEVELS[2]);
  private sessionAnalytics = writable<ISessionAnalytics | null>(null);
  
  // Internal state
  private metricsBuffer: IPointerMetrics[] = [];
  private patternHistory: IPerformancePattern[] = [];
  private feedbackCooldowns: Map<string, number> = new Map();
  private sessionStartTime: number = 0;
  private lastAnalysisTime: number = 0;
  private consecutiveSuccesses: number = 0;
  private consecutiveFailures: number = 0;
  
  // Configuration
  private readonly BUFFER_SIZE = 100;
  private readonly ANALYSIS_INTERVAL = 500; // ms
  private readonly FEEDBACK_COOLDOWN = 5000; // ms between same feedback type
  private readonly PATTERN_WINDOW = 30; // samples for pattern detection
  
  // =============================================================================
  // PUBLIC STORES (for Svelte components)
  // =============================================================================
  
  get feedback$() { return { subscribe: this.currentFeedback.subscribe }; }
  get recommendations$() { return { subscribe: this.recommendations.subscribe }; }
  get predictions$() { return { subscribe: this.errorPredictions.subscribe }; }
  get difficulty$() { return { subscribe: this.currentDifficulty.subscribe }; }
  get analytics$() { return { subscribe: this.sessionAnalytics.subscribe }; }
  
  // =============================================================================
  // SESSION MANAGEMENT
  // =============================================================================
  
  startSession(moduleId: string): void {
    this.sessionStartTime = performance.now();
    this.metricsBuffer = [];
    this.patternHistory = [];
    this.feedbackCooldowns.clear();
    this.lastAnalysisTime = 0;
    
    this.sessionAnalytics.set({
      sessionId: `session_${Date.now()}`,
      moduleId,
      startTime: this.sessionStartTime,
      metrics: {
        avgTremor: 0,
        avgSpeed: 0,
        avgPressure: 0,
        pathAccuracy: 0,
        consistency: 0
      },
      patterns: [],
      feedbackHistory: [],
      difficultyProgression: [get(this.currentDifficulty).level]
    });
    
    this.currentFeedback.set([]);
    this.recommendations.set([]);
    this.errorPredictions.set([]);
  }
  
  endSession(): ISessionAnalytics | null {
    const analytics = get(this.sessionAnalytics);
    if (analytics) {
      // Generate final recommendations
      this.generateSessionRecommendations();
    }
    return analytics;
  }
  
  // =============================================================================
  // REAL-TIME METRICS PROCESSING
  // =============================================================================
  
  processMetrics(metrics: IPointerMetrics): void {
    // Add to buffer
    this.metricsBuffer.push(metrics);
    if (this.metricsBuffer.length > this.BUFFER_SIZE) {
      this.metricsBuffer.shift();
    }
    
    // Throttle analysis
    const now = performance.now();
    if (now - this.lastAnalysisTime >= this.ANALYSIS_INTERVAL) {
      this.lastAnalysisTime = now;
      this.analyzePerformance();
    }
  }
  
  // =============================================================================
  // PERFORMANCE ANALYSIS
  // =============================================================================
  
  private analyzePerformance(): void {
    if (this.metricsBuffer.length < 10) return;
    
    const recentMetrics = this.metricsBuffer.slice(-this.PATTERN_WINDOW);
    const difficulty = get(this.currentDifficulty);
    
    // Calculate current metrics
    const tremorLevel = this.calculateTremorLevel(recentMetrics);
    const avgSpeed = this.calculateAverageSpeed(recentMetrics);
    const avgPressure = this.calculateAveragePressure(recentMetrics);
    const consistency = this.calculateConsistency(recentMetrics);
    
    // Update session analytics
    this.updateSessionMetrics(tremorLevel, avgSpeed, avgPressure, consistency);
    
    // Detect patterns and generate feedback
    this.detectPatterns(tremorLevel, avgSpeed, avgPressure, consistency, difficulty);
    
    // Predict potential errors
    this.predictErrors(recentMetrics, difficulty);
    
    // Check for difficulty adjustment
    this.evaluateDifficultyAdjustment();
  }
  
  private calculateTremorLevel(metrics: IPointerMetrics[]): number {
    if (metrics.length < 3) return 0;
    
    let totalTremor = 0;
    for (let i = 2; i < metrics.length; i++) {
      // Calculate deviation from smoothed path
      const smoothedX = (metrics[i-2].x + metrics[i-1].x + metrics[i].x) / 3;
      const smoothedY = (metrics[i-2].y + metrics[i-1].y + metrics[i].y) / 3;
      const deviation = Math.hypot(metrics[i].x - smoothedX, metrics[i].y - smoothedY);
      totalTremor += deviation;
    }
    
    return totalTremor / (metrics.length - 2);
  }
  
  private calculateAverageSpeed(metrics: IPointerMetrics[]): number {
    if (metrics.length < 2) return 0;
    return metrics.reduce((sum, m) => sum + m.velocity, 0) / metrics.length;
  }
  
  private calculateAveragePressure(metrics: IPointerMetrics[]): number {
    return metrics.reduce((sum, m) => sum + m.pressure, 0) / metrics.length;
  }
  
  private calculateConsistency(metrics: IPointerMetrics[]): number {
    if (metrics.length < 5) return 100;
    
    // Calculate variance in speed and pressure
    const speeds = metrics.map(m => m.velocity);
    const pressures = metrics.map(m => m.pressure);
    
    const speedVariance = this.variance(speeds);
    const pressureVariance = this.variance(pressures);
    
    // Lower variance = higher consistency
    const consistencyScore = Math.max(0, 100 - (speedVariance * 100 + pressureVariance * 200));
    return consistencyScore;
  }
  
  private variance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }
  
  // =============================================================================
  // PATTERN DETECTION
  // =============================================================================
  
  private detectPatterns(
    tremor: number,
    speed: number,
    pressure: number,
    consistency: number,
    difficulty: IDifficultyLevel
  ): void {
    const now = performance.now();
    
    // Tremor patterns
    if (tremor > difficulty.tolerances.tremorThreshold * 1.5) {
      this.addPattern('tremor', 'high', now);
      this.generateFeedback('tremor_high', 'warning', 'high', 'tremor');
    } else if (tremor < difficulty.tolerances.tremorThreshold * 0.5) {
      const tremorPattern = this.patternHistory.find(p => p.type === 'tremor');
      if (tremorPattern && tremorPattern.severity === 'high') {
        this.generateFeedback('tremor_improving', 'encouragement', 'medium', 'tremor');
      }
    }
    
    // Speed patterns
    const [minSpeed, maxSpeed] = difficulty.tolerances.speedRange;
    if (speed > maxSpeed * 1.3) {
      this.addPattern('speed', 'high', now);
      this.generateFeedback('speed_too_fast', 'correction', 'high', 'speed');
    } else if (speed < minSpeed * 0.7 && speed > 0) {
      this.addPattern('speed', 'low', now);
      this.generateFeedback('speed_too_slow', 'tip', 'low', 'speed');
    } else if (speed >= minSpeed && speed <= maxSpeed) {
      this.generateFeedback('speed_optimal', 'encouragement', 'low', 'speed');
    }
    
    // Pressure patterns
    const [minPressure, maxPressure] = difficulty.tolerances.pressureRange;
    const pressureVariance = this.calculatePressureVariance();
    if (pressureVariance > 0.1) {
      this.addPattern('pressure', 'medium', now);
      this.generateFeedback('pressure_inconsistent', 'correction', 'medium', 'pressure');
    } else if (pressure >= minPressure && pressure <= maxPressure && pressureVariance < 0.05) {
      this.generateFeedback('pressure_optimal', 'encouragement', 'low', 'pressure');
    }
    
    // Fatigue detection (declining consistency over time)
    if (this.detectFatigue()) {
      this.generateFeedback('fatigue_detected', 'warning', 'high', 'general');
    }
  }
  
  private calculatePressureVariance(): number {
    const pressures = this.metricsBuffer.slice(-20).map(m => m.pressure);
    return this.variance(pressures);
  }
  
  private detectFatigue(): boolean {
    // Check if performance has been declining over the last 30 seconds
    const sessionDuration = performance.now() - this.sessionStartTime;
    if (sessionDuration < 30000) return false;
    
    const recentPatterns = this.patternHistory.filter(
      p => p.lastOccurrence > performance.now() - 30000
    );
    
    const decliningPatterns = recentPatterns.filter(p => p.trend === 'declining');
    return decliningPatterns.length >= 2;
  }
  
  private addPattern(type: IPerformancePattern['type'], severity: IPerformancePattern['severity'], timestamp: number): void {
    const existing = this.patternHistory.find(p => p.type === type);
    
    if (existing) {
      const trend = existing.severity === severity ? 'stable' :
                    (severity === 'high' && existing.severity !== 'high') ? 'declining' : 'improving';
      existing.severity = severity;
      existing.frequency++;
      existing.lastOccurrence = timestamp;
      existing.trend = trend;
    } else {
      this.patternHistory.push({
        type,
        severity,
        frequency: 1,
        lastOccurrence: timestamp,
        trend: 'stable'
      });
    }
  }
  
  // =============================================================================
  // FEEDBACK GENERATION
  // =============================================================================
  
  private generateFeedback(
    templateKey: string,
    type: ICoachingFeedback['type'],
    priority: ICoachingFeedback['priority'],
    category: ICoachingFeedback['category']
  ): void {
    const now = performance.now();
    
    // Check cooldown
    const lastFeedback = this.feedbackCooldowns.get(templateKey);
    if (lastFeedback && now - lastFeedback < this.FEEDBACK_COOLDOWN) {
      return;
    }
    
    const templates = FEEDBACK_TEMPLATES[templateKey];
    if (!templates || templates.length === 0) return;
    
    // Select random template
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const feedback: ICoachingFeedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      priority,
      message: template.en,
      messageHe: template.he,
      category,
      timestamp: now,
      dismissed: false
    };
    
    // Update stores
    this.currentFeedback.update(list => {
      // Keep only recent, non-dismissed feedback
      const filtered = list.filter(f => !f.dismissed && now - f.timestamp < 10000);
      return [...filtered, feedback].slice(-5); // Max 5 active feedbacks
    });
    
    // Update cooldown
    this.feedbackCooldowns.set(templateKey, now);
    
    // Add to session history
    this.sessionAnalytics.update(analytics => {
      if (analytics) {
        analytics.feedbackHistory.push(feedback);
      }
      return analytics;
    });
  }
  
  dismissFeedback(feedbackId: string): void {
    this.currentFeedback.update(list =>
      list.map(f => f.id === feedbackId ? { ...f, dismissed: true } : f)
    );
  }
  
  // =============================================================================
  // ERROR PREDICTION
  // =============================================================================
  
  private predictErrors(metrics: IPointerMetrics[], difficulty: IDifficultyLevel): void {
    const predictions: IErrorPrediction[] = [];
    
    // Predict tremor-based failure
    const tremorTrend = this.calculateTremorTrend();
    if (tremorTrend > 0.5) {
      const timeToThreshold = this.estimateTimeToThreshold(
        this.calculateTremorLevel(metrics),
        difficulty.tolerances.tremorThreshold,
        tremorTrend
      );
      
      if (timeToThreshold < 10000) {
        predictions.push({
          type: 'tremor_failure',
          probability: Math.min(0.9, tremorTrend),
          timeToOccurrence: timeToThreshold,
          preventionTip: "Slow down and stabilize your hand position",
          preventionTipHe: "האט והייצב את מיקום היד"
        });
      }
    }
    
    // Predict path deviation
    const deviationTrend = this.calculateDeviationTrend();
    if (deviationTrend > 0.3) {
      predictions.push({
        type: 'path_deviation',
        probability: Math.min(0.8, deviationTrend),
        timeToOccurrence: 5000,
        preventionTip: "Focus on the guide line and make smaller corrections",
        preventionTipHe: "התמקד בקו המנחה ובצע תיקונים קטנים יותר"
      });
    }
    
    // Predict speed-related issues
    const speedTrend = this.calculateSpeedTrend();
    if (Math.abs(speedTrend) > 0.4) {
      predictions.push({
        type: speedTrend > 0 ? 'speed_too_high' : 'speed_too_low',
        probability: Math.min(0.7, Math.abs(speedTrend)),
        timeToOccurrence: 3000,
        preventionTip: speedTrend > 0 ? "Gradually reduce speed" : "Maintain steady movement",
        preventionTipHe: speedTrend > 0 ? "הפחת מהירות בהדרגה" : "שמור על תנועה יציבה"
      });
    }
    
    this.errorPredictions.set(predictions);
  }
  
  private calculateTremorTrend(): number {
    if (this.metricsBuffer.length < 20) return 0;
    
    const firstHalf = this.metricsBuffer.slice(0, Math.floor(this.metricsBuffer.length / 2));
    const secondHalf = this.metricsBuffer.slice(Math.floor(this.metricsBuffer.length / 2));
    
    const firstTremor = this.calculateTremorLevel(firstHalf);
    const secondTremor = this.calculateTremorLevel(secondHalf);
    
    return (secondTremor - firstTremor) / Math.max(firstTremor, 0.1);
  }
  
  private calculateDeviationTrend(): number {
    // Simplified - would need path data for full implementation
    return 0;
  }
  
  private calculateSpeedTrend(): number {
    if (this.metricsBuffer.length < 20) return 0;
    
    const firstHalf = this.metricsBuffer.slice(0, Math.floor(this.metricsBuffer.length / 2));
    const secondHalf = this.metricsBuffer.slice(Math.floor(this.metricsBuffer.length / 2));
    
    const firstSpeed = this.calculateAverageSpeed(firstHalf);
    const secondSpeed = this.calculateAverageSpeed(secondHalf);
    
    return (secondSpeed - firstSpeed) / Math.max(firstSpeed, 0.01);
  }
  
  private estimateTimeToThreshold(current: number, threshold: number, trend: number): number {
    if (trend <= 0) return Infinity;
    const remaining = threshold - current;
    return (remaining / trend) * 1000;
  }
  
  // =============================================================================
  // ADAPTIVE DIFFICULTY
  // =============================================================================
  
  private evaluateDifficultyAdjustment(): void {
    const analytics = get(this.sessionAnalytics);
    if (!analytics) return;
    
    const sessionDuration = performance.now() - this.sessionStartTime;
    if (sessionDuration < 20000) return; // Wait at least 20 seconds
    
    const currentLevel = get(this.currentDifficulty);
    const metrics = analytics.metrics;
    
    // Check for level up
    if (this.shouldLevelUp(metrics, currentLevel)) {
      this.consecutiveSuccesses++;
      this.consecutiveFailures = 0;
      
      if (this.consecutiveSuccesses >= 3 && currentLevel.level < 10) {
        this.adjustDifficulty(currentLevel.level + 1);
        this.consecutiveSuccesses = 0;
        this.generateFeedback('milestone', 'encouragement', 'high', 'general');
      }
    }
    // Check for level down
    else if (this.shouldLevelDown(metrics, currentLevel)) {
      this.consecutiveFailures++;
      this.consecutiveSuccesses = 0;
      
      if (this.consecutiveFailures >= 3 && currentLevel.level > 1) {
        this.adjustDifficulty(currentLevel.level - 1);
        this.consecutiveFailures = 0;
      }
    }
  }
  
  private shouldLevelUp(metrics: ISessionAnalytics['metrics'], difficulty: IDifficultyLevel): boolean {
    return (
      metrics.avgTremor < difficulty.tolerances.tremorThreshold * 0.6 &&
      metrics.consistency > 80 &&
      metrics.pathAccuracy > 85
    );
  }
  
  private shouldLevelDown(metrics: ISessionAnalytics['metrics'], difficulty: IDifficultyLevel): boolean {
    return (
      metrics.avgTremor > difficulty.tolerances.tremorThreshold * 1.5 ||
      metrics.consistency < 40 ||
      metrics.pathAccuracy < 50
    );
  }
  
  adjustDifficulty(level: number): void {
    const newDifficulty = DIFFICULTY_LEVELS.find(d => d.level === level);
    if (newDifficulty) {
      this.currentDifficulty.set(newDifficulty);
      
      this.sessionAnalytics.update(analytics => {
        if (analytics) {
          analytics.difficultyProgression.push(level);
        }
        return analytics;
      });
    }
  }
  
  setDifficulty(level: number): void {
    this.adjustDifficulty(level);
    this.consecutiveSuccesses = 0;
    this.consecutiveFailures = 0;
  }
  
  // =============================================================================
  // RECOMMENDATIONS
  // =============================================================================
  
  private generateSessionRecommendations(): void {
    const analytics = get(this.sessionAnalytics);
    if (!analytics) return;
    
    const recommendations: IRecommendation[] = [];
    const { metrics, patterns } = analytics;
    
    // Tremor-based recommendations
    const tremorPattern = patterns.find(p => p.type === 'tremor');
    if (tremorPattern && tremorPattern.severity === 'high') {
      recommendations.push({
        id: 'rec_tremor_exercise',
        title: "Tremor Control Exercise",
        titleHe: "תרגיל שליטה ברעד",
        description: "Practice the Tremor Shield game for 5 minutes daily to improve hand stability.",
        descriptionHe: "תרגל את משחק מגן הרעד 5 דקות ביום לשיפור יציבות היד.",
        priority: 9,
        category: 'exercise',
        actionable: true,
        targetMetric: 'tremor'
      });
    }
    
    // Speed-based recommendations
    if (metrics.consistency < 60) {
      recommendations.push({
        id: 'rec_speed_consistency',
        title: "Speed Consistency Training",
        titleHe: "אימון עקביות מהירות",
        description: "Focus on maintaining a steady pace. Try the metronome-guided exercises.",
        descriptionHe: "התמקד בשמירה על קצב יציב. נסה את התרגילים המונחים במטרונום.",
        priority: 7,
        category: 'technique',
        actionable: true,
        targetMetric: 'speed'
      });
    }
    
    // Rest recommendation if fatigue detected
    const fatiguePattern = patterns.find(p => p.trend === 'declining');
    if (fatiguePattern) {
      recommendations.push({
        id: 'rec_rest',
        title: "Rest Period Recommended",
        titleHe: "מומלצת הפסקה",
        description: "Take a 15-minute break before your next session to maintain peak performance.",
        descriptionHe: "קח הפסקה של 15 דקות לפני האימון הבא לשמירה על ביצועים מיטביים.",
        priority: 8,
        category: 'rest',
        actionable: true
      });
    }
    
    // Difficulty recommendation
    const currentLevel = get(this.currentDifficulty);
    if (metrics.pathAccuracy > 90 && metrics.consistency > 85) {
      recommendations.push({
        id: 'rec_increase_difficulty',
        title: "Ready for Higher Difficulty",
        titleHe: "מוכן לרמת קושי גבוהה יותר",
        description: `Consider advancing to ${DIFFICULTY_LEVELS[currentLevel.level]?.name || 'next'} level.`,
        descriptionHe: `שקול להתקדם לרמת ${DIFFICULTY_LEVELS[currentLevel.level]?.nameHe || 'הבאה'}.`,
        priority: 6,
        category: 'difficulty',
        actionable: true
      });
    }
    
    // Sort by priority
    recommendations.sort((a, b) => b.priority - a.priority);
    this.recommendations.set(recommendations);
  }
  
  // =============================================================================
  // SESSION METRICS UPDATE
  // =============================================================================
  
  private updateSessionMetrics(
    tremor: number,
    speed: number,
    pressure: number,
    consistency: number
  ): void {
    this.sessionAnalytics.update(analytics => {
      if (analytics) {
        // Running average
        const weight = 0.1;
        analytics.metrics.avgTremor = analytics.metrics.avgTremor * (1 - weight) + tremor * weight;
        analytics.metrics.avgSpeed = analytics.metrics.avgSpeed * (1 - weight) + speed * weight;
        analytics.metrics.avgPressure = analytics.metrics.avgPressure * (1 - weight) + pressure * weight;
        analytics.metrics.consistency = analytics.metrics.consistency * (1 - weight) + consistency * weight;
        analytics.patterns = [...this.patternHistory];
      }
      return analytics;
    });
  }
  
  updatePathAccuracy(accuracy: number): void {
    this.sessionAnalytics.update(analytics => {
      if (analytics) {
        analytics.metrics.pathAccuracy = accuracy;
      }
      return analytics;
    });
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const aiCoach = new AICoachingService();

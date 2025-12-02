/**
 * =============================================================================
 * OPHTHALMIC SIMULATOR - CORE DATA MODELS (V14.0)
 * =============================================================================
 * IMMUTABILITY ZONE: These interfaces define the application's data contracts.
 * Changes here require architectural review.
 * =============================================================================
 */

// =============================================================================
// MODULE DATA MODELS
// =============================================================================

export interface IModuleMetric {
  label: string;
  value: number;
  unit?: string;
}

export interface IModuleData {
  id: string;
  num: number;
  name: string;
  code: string;
  goal: string;
  metrics: IModuleMetric[];
  mastery: number;
  completed: boolean;
  core?: boolean;
  skills: string[];
  prevents: string[];
}

export interface IModuleProgress {
  moduleId: string;
  sessionsCompleted: number;
  totalTime: number;
  bestScore: number;
  lastAttempt: Date;
  masteryHistory: number[];
}

// =============================================================================
// SURGEON & USER MODELS
// =============================================================================

export interface ISurgeonProfile {
  id: string;
  name: string;
  title: string;
  specialty: string;
  institution: string;
  avatarUrl?: string;
  certifications: string[];
  joinDate: Date;
}

export interface ISurgeonStats {
  odRank: number;
  totalScore: number;
  accuracyRate: number;
  sessionsCompleted: number;
  streak: number;
  badges: IBadge[];
}

export interface IBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: Date;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// =============================================================================
// APEX LEAGUE MODELS
// =============================================================================

export interface IApexRanking {
  rank: number;
  surgeon: ISurgeonProfile;
  stats: ISurgeonStats;
  trend: 'up' | 'down' | 'stable';
  previousRank: number;
}

export interface IAllocationVote {
  odId: string;
  odName: string;
  votes: number;
  percentage: number;
}

export interface IAllocationData {
  currentDuty: string;
  assignedTo: string;
  votes: IAllocationVote[];
  deadline: Date;
  status: 'voting' | 'finalized' | 'pending';
}

// =============================================================================
// CORE GAMES MODELS (Gamification V14.0)
// =============================================================================

export interface ICoreGameScore<T = Record<string, number | boolean>> {
  gameId: string;
  overall: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  metrics: T;
  timestamp: Date;
  duration: number;
}

export interface ITremorShieldScore extends ICoreGameScore {
  gameId: 'tremor-shield';
  metrics: {
    avgTremor: number;
    minTremor: number;
    maxCombo: number;
    stableTimePercent: number;
    platinumAchieved: boolean;
    shieldIntegrity: number;
  };
}

export interface IVectorRaceScore extends ICoreGameScore {
  gameId: 'vector-race';
  metrics: {
    time: number;
    perfectPercent: number;
    maxCombo: number;
    wallHits: number;
    speedBoosts: number;
    sonicBoom: boolean;
    health: number;
  };
}

export interface INanoGripScore extends ICoreGameScore {
  gameId: 'nano-grip';
  metrics: {
    gripAccuracy: number;
    virusesDefeated: number;
    virusesLost: number;
    zonesCompromised: number;
    maxCombo: number;
    goldGrip: boolean;
  };
}

export interface IMotorControlRanking {
  rank: number;
  surgeon: ISurgeonProfile;
  tremorScore: number;
  vectorScore: number;
  gripScore: number;
  totalScore: number;
}

// =============================================================================
// SIMULATION SESSION MODELS
// =============================================================================

export interface IPointerData {
  x: number;
  y: number;
  pressure: number;
  tiltX: number;
  tiltY: number;
  pointerType: string;
  timestamp: number;
}

export interface ISessionData {
  sessionId: string;
  moduleId: string;
  startTime: Date;
  endTime?: Date;
  rawPoints: IPointerData[];
  smoothedPoints: IPointerData[];
  velocities: number[];
  tremorResiduals: number[];
  score?: number;
  grade?: string;
}

// =============================================================================
// KINETIC UI MODELS (V12.0)
// =============================================================================

export interface ITraceLineConfig {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  color: string;
  width: number;
}

export interface IAnimationConfig {
  fps: number;
  gpuAcceleration: boolean;
  easing: string;
  duration: number;
}

// =============================================================================
// API RESPONSE MODELS
// =============================================================================

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: Date;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// =============================================================================
// AI COACHING MODELS (V15.0)
// =============================================================================

export interface IAICoachingFeedback {
  id: string;
  type: 'tip' | 'warning' | 'encouragement' | 'correction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  messageHe: string;
  category: 'tremor' | 'speed' | 'pressure' | 'path' | 'technique' | 'general';
  timestamp: number;
  dismissed: boolean;
}

export interface IAIRecommendation {
  id: string;
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
  priority: number;
  category: 'exercise' | 'technique' | 'rest' | 'difficulty' | 'focus';
  actionable: boolean;
  targetMetric?: string;
}

export interface IAIErrorPrediction {
  type: string;
  probability: number;
  timeToOccurrence: number;
  preventionTip: string;
  preventionTipHe: string;
}

export interface IAIDifficultyLevel {
  level: number;
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

export interface IAIPerformancePattern {
  type: 'tremor' | 'speed' | 'pressure' | 'accuracy' | 'consistency';
  severity: 'low' | 'medium' | 'high';
  frequency: number;
  lastOccurrence: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface IAISessionAnalytics {
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
  patterns: IAIPerformancePattern[];
  feedbackHistory: IAICoachingFeedback[];
  difficultyProgression: number[];
}

// =============================================================================
// HAPTIC FEEDBACK MODELS (V15.0)
// =============================================================================

export interface IStylusState {
  isConnected: boolean;
  type: 'apple-pencil' | 'stylus' | 'touch' | 'mouse' | 'unknown';
  pressure: number;
  tiltX: number;
  tiltY: number;
  azimuth: number;
  altitude: number;
  twist: number;
  isEraser: boolean;
  supportsForce: boolean;
  supportsTilt: boolean;
  supportsAzimuth: boolean;
}

export interface IForceProfile {
  id: string;
  name: string;
  nameHe: string;
  baseResistance: number;
  elasticity: number;
  viscosity: number;
  breakThreshold: number;
  healRate: number;
}

export interface ITextureProfile {
  id: string;
  name: string;
  nameHe: string;
  roughness: number;
  granularity: number;
  amplitude: number;
  pattern: 'smooth' | 'bumpy' | 'fibrous' | 'granular' | 'layered';
}

export interface IVibrationPattern {
  id: string;
  name: string;
  pattern: number[];
  intensity: number;
  frequency: number;
}

export interface IForceFeedbackState {
  currentForce: number;
  targetForce: number;
  deformation: number;
  isBreaking: boolean;
  isBroken: boolean;
  direction: { x: number; y: number };
}

export interface IHapticEvent {
  type: 'force' | 'texture' | 'vibration' | 'impact';
  intensity: number;
  duration: number;
  pattern?: IVibrationPattern;
  force?: IForceProfile;
  texture?: ITextureProfile;
  position: { x: number; y: number };
  timestamp: number;
}

export interface IHapticCapabilities {
  supportsVibration: boolean;
  supportsForceTouch: boolean;
  supportsPressure: boolean;
  supportsTilt: boolean;
  supportsAzimuth: boolean;
  maxVibrationDuration: number;
  vibrationPatternSupport: boolean;
}

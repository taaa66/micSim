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

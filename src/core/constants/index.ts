/**
 * =============================================================================
 * OPHTHALMIC SIMULATOR - CORE CONSTANTS (V14.0)
 * =============================================================================
 * IMMUTABILITY ZONE: Unchanging values used throughout the application.
 * These values should NEVER be modified at runtime.
 * =============================================================================
 */

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',

  // Surgeon profiles
  SURGEON_PROFILE: '/surgeons/:id',
  SURGEON_STATS: '/surgeons/:id/stats',
  SURGEON_PROGRESS: '/surgeons/:id/progress',

  // Apex League
  APEX_RANKINGS: '/apex/rankings',
  APEX_ALLOCATION: '/apex/allocation',
  APEX_VOTE: '/apex/vote',

  // Modules
  MODULES_LIST: '/modules',
  MODULE_DETAIL: '/modules/:id',
  MODULE_SESSION: '/modules/:id/session',

  // Core Games
  GAMES_LEADERBOARD: '/games/leaderboard',
  GAMES_SUBMIT_SCORE: '/games/:gameId/score',
  GAMES_HISTORY: '/games/history',

  // WebSocket
  WS_REALTIME: '/ws/realtime'
} as const;

// =============================================================================
// COLOR PALETTE (V13.0 CSS Manifest)
// =============================================================================

export const COLORS = {
  // Primary palette
  PRIMARY: '#0fb89f',
  PRIMARY_BRIGHT: '#34d399',
  PRIMARY_DARK: '#0a7c6d',

  // Background
  BG_DARK: '#040d10',
  BG_MEDIUM: '#0a1a1f',
  BG_LIGHT: '#1a2a2e',

  // Text
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: '#e0f5f0',
  TEXT_MUTED: '#7aa8a0',
  TEXT_DIM: '#5a7a80',

  // Accent colors
  GOLD: '#d4af37',
  GOLD_LIGHT: '#fbbf24',
  AMBER: '#f59e0b',
  RED: '#f87171',
  RED_DARK: '#dc2626',
  BLUE: '#60a5fa',
  PURPLE: '#a855f7',

  // Status colors
  SUCCESS: '#34d399',
  WARNING: '#fbbf24',
  ERROR: '#f87171',
  INFO: '#60a5fa',

  // Grade colors
  GRADE_S: '#E5E4E2', // Platinum
  GRADE_A: '#fbbf24', // Gold
  GRADE_B: '#34d399', // Green
  GRADE_C: '#60a5fa', // Blue
  GRADE_D: '#f87171', // Red
  GRADE_F: '#ef4444'  // Dark Red
} as const;

// =============================================================================
// KINETIC UI CONSTANTS (V12.0)
// =============================================================================

export const KINETIC = {
  // Animation timing
  TRACE_LINE_MAX_MS: 250,
  TRANSITION_FAST: 150,
  TRANSITION_NORMAL: 300,
  TRANSITION_SLOW: 500,
  ELASTIC_DURATION: 400,

  // Frame rates
  TARGET_FPS: 60,
  FRAME_TIME_MS: 16.67,

  // Easing functions (CSS)
  EASE_OUT_CUBIC: 'cubic-bezier(0.33, 1, 0.68, 1)',
  EASE_OUT_ELASTIC: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.65, 0, 0.35, 1)',

  // GPU acceleration
  GPU_TRANSFORM: 'translateZ(0)',
  WILL_CHANGE_TRANSFORM: 'transform',
  WILL_CHANGE_OPACITY: 'opacity'
} as const;

// =============================================================================
// MODULE CONFIGURATION
// =============================================================================

export const MODULE_CONFIG = {
  // Total modules in the system
  TOTAL_MODULES: 11,

  // Radial layout
  RADIUS_VW: 35,
  CARD_SIZE_VW: 12,
  START_ANGLE: -90,

  // Mastery thresholds
  MASTERY_BRONZE: 50,
  MASTERY_SILVER: 75,
  MASTERY_GOLD: 90,
  MASTERY_PLATINUM: 98,

  // Session limits
  MAX_SESSION_DURATION_MS: 300000, // 5 minutes
  MIN_SESSION_DURATION_MS: 10000   // 10 seconds
} as const;

// =============================================================================
// CORE GAMES CONFIGURATION (Gamification V14.0)
// =============================================================================

export const CORE_GAMES = {
  TREMOR_SHIELD: {
    ID: 'tremor-shield',
    NAME: 'THE TREMOR SHIELD',
    CODE: 'TRM-SHD',
    DURATION_MS: 30000,
    TREMOR_THRESHOLD_MICRON: 50,
    PLATINUM_LOCK_DURATION_MS: 5000,
    PIXEL_TO_MICRON: 2.5
  },

  VECTOR_RACE: {
    ID: 'vector-race',
    NAME: 'THE VECTOR RACE',
    CODE: 'VEC-RCE',
    TRACK_LENGTH: 100,
    IDEAL_ANGLE_TOLERANCE: 2,
    WALL_TOLERANCE: 5,
    SPEED_BASE: 0.3,
    SPEED_BOOST: 0.15
  },

  NANO_GRIP: {
    ID: 'nano-grip',
    NAME: 'NANO-GRIP GAUNTLET',
    CODE: 'NAN-GRP',
    DURATION_MS: 45000,
    GRIP_ZONES: 3,
    VIRUS_SPAWN_INTERVAL_MS: 2000,
    VIRUS_ATTACK_DURATION_MS: 3000,
    GRIP_TOLERANCE_PX: 30
  }
} as const;

// =============================================================================
// APEX LEAGUE CONFIGURATION
// =============================================================================

export const APEX_CONFIG = {
  // Ranking tiers
  TIERS: {
    APEX_ELITE: { min: 1, max: 3, color: '#E5E4E2' },
    DIAMOND: { min: 4, max: 10, color: '#60a5fa' },
    GOLD: { min: 11, max: 25, color: '#fbbf24' },
    SILVER: { min: 26, max: 50, color: '#9ca3af' },
    BRONZE: { min: 51, max: 100, color: '#b87333' }
  },

  // Refresh intervals
  RANKINGS_REFRESH_MS: 30000,
  ALLOCATION_REFRESH_MS: 10000,

  // Voting
  VOTE_DEADLINE_HOURS: 24,
  MIN_VOTES_REQUIRED: 5
} as const;

// =============================================================================
// VIEWPORT & RESPONSIVE BREAKPOINTS
// =============================================================================

export const BREAKPOINTS = {
  MOBILE_MAX: 768,
  TABLET_MAX: 1024,
  DESKTOP_MIN: 1025,
  LARGE_DESKTOP_MIN: 1440
} as const;

// =============================================================================
// ZERO-SCROLL MANDATE (V10.0)
// =============================================================================

export const VIEWPORT = {
  // Target viewport for zero-scroll
  TARGET_WIDTH: 768,
  TARGET_HEIGHT: 1024,

  // Safe area insets (iOS)
  SAFE_AREA_TOP: 'env(safe-area-inset-top)',
  SAFE_AREA_BOTTOM: 'env(safe-area-inset-bottom)',
  SAFE_AREA_LEFT: 'env(safe-area-inset-left)',
  SAFE_AREA_RIGHT: 'env(safe-area-inset-right)'
} as const;

// =============================================================================
// SCORING ENGINE CONSTANTS
// =============================================================================

export const SCORING = {
  // Tremor calculation
  SMOOTHING_WINDOW: 5,
  VELOCITY_THRESHOLD: 0.1,

  // Grade thresholds
  GRADE_S_MIN: 95,
  GRADE_A_MIN: 85,
  GRADE_B_MIN: 70,
  GRADE_C_MIN: 50,
  GRADE_D_MIN: 30,

  // Combo multipliers
  COMBO_TIER_1: 30,  // 1.5x
  COMBO_TIER_2: 60,  // 2.0x
  COMBO_TIER_3: 100, // 2.5x
  COMBO_TIER_4: 150  // 3.0x
} as const;

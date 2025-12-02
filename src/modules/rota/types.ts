/**
 * =============================================================================
 * ROTA MANAGEMENT SYSTEM - TYPE DEFINITIONS
 * =============================================================================
 * Complete TypeScript interfaces for the scheduling system
 * =============================================================================
 */

// =============================================================================
// USER & ROLE TYPES
// =============================================================================

export type UserRole = 'trainee' | 'supervisor' | 'admin';
export type SeniorityLevel = 'PGY1' | 'PGY2' | 'PGY3' | 'PGY4' | 'Fellow' | 'Attending' | 'Consultant';

export interface RotaUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  seniority: SeniorityLevel;
  department: string;
  
  // Contract requirements
  mandatoryShiftsPerMonth: number;
  maxShiftsPerMonth: number;
  minRestHours: number; // Minimum hours between shifts
  
  // Certifications & limitations
  certifications: string[];
  limitations: string[];
  
  // Pre-approved leave
  approvedLeave: DateRange[];
  
  // Historical data for equity
  historicalShifts: ShiftHistory[];
  
  // Fairness metrics
  fairnessScore: number;
  weekendShiftCount6Months: number;
  holidayShiftCount6Months: number;
  totalShiftCount6Months: number;
}

export interface DateRange {
  start: Date;
  end: Date;
  reason?: string;
}

export interface ShiftHistory {
  shiftId: string;
  date: Date;
  shiftType: ShiftType;
  wasWeekend: boolean;
  wasHoliday: boolean;
}

// =============================================================================
// SHIFT TYPES
// =============================================================================

export type ShiftType = 
  | 'general_oncall'      // General On-Call
  | 'senior_backup'       // Senior Backup
  | 'clinic_duty'         // Clinic Duty
  | 'or_assist'           // Operating Room Assist
  | 'emergency_cover'     // Emergency Coverage
  | 'weekend_oncall'      // Weekend On-Call
  | 'night_shift'         // Night Shift
  | 'holiday_cover';      // Holiday Coverage

export interface ShiftTypeConfig {
  id: ShiftType;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  duration: number; // hours
  requiresBackup: boolean;
  requiredCertifications: string[];
  allowedSeniority: SeniorityLevel[];
  minRestAfter: number; // hours
  weight: number; // For fairness calculation (higher = more burden)
}

export const SHIFT_TYPES: Record<ShiftType, ShiftTypeConfig> = {
  general_oncall: {
    id: 'general_oncall',
    name: 'General On-Call',
    shortName: 'On-Call',
    color: '#3b82f6',
    icon: '📞',
    duration: 12,
    requiresBackup: true,
    requiredCertifications: [],
    allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
    minRestAfter: 10,
    weight: 1.0
  },
  senior_backup: {
    id: 'senior_backup',
    name: 'Senior Backup',
    shortName: 'Backup',
    color: '#8b5cf6',
    icon: '🛡️',
    duration: 12,
    requiresBackup: false,
    requiredCertifications: ['senior_qualified'],
    allowedSeniority: ['PGY4', 'Fellow', 'Attending', 'Consultant'],
    minRestAfter: 10,
    weight: 0.8
  },
  clinic_duty: {
    id: 'clinic_duty',
    name: 'Clinic Duty',
    shortName: 'Clinic',
    color: '#10b981',
    icon: '🏥',
    duration: 8,
    requiresBackup: false,
    requiredCertifications: [],
    allowedSeniority: ['PGY1', 'PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
    minRestAfter: 8,
    weight: 0.5
  },
  or_assist: {
    id: 'or_assist',
    name: 'OR Assist',
    shortName: 'OR',
    color: '#f59e0b',
    icon: '🔬',
    duration: 10,
    requiresBackup: false,
    requiredCertifications: ['or_trained'],
    allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
    minRestAfter: 10,
    weight: 0.7
  },
  emergency_cover: {
    id: 'emergency_cover',
    name: 'Emergency Cover',
    shortName: 'ER',
    color: '#ef4444',
    icon: '🚨',
    duration: 12,
    requiresBackup: true,
    requiredCertifications: ['emergency_trained'],
    allowedSeniority: ['PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
    minRestAfter: 12,
    weight: 1.2
  },
  weekend_oncall: {
    id: 'weekend_oncall',
    name: 'Weekend On-Call',
    shortName: 'Wknd',
    color: '#6366f1',
    icon: '📅',
    duration: 24,
    requiresBackup: true,
    requiredCertifications: [],
    allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
    minRestAfter: 12,
    weight: 1.5
  },
  night_shift: {
    id: 'night_shift',
    name: 'Night Shift',
    shortName: 'Night',
    color: '#1e3a5f',
    icon: '🌙',
    duration: 12,
    requiresBackup: true,
    requiredCertifications: [],
    allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
    minRestAfter: 12,
    weight: 1.3
  },
  holiday_cover: {
    id: 'holiday_cover',
    name: 'Holiday Cover',
    shortName: 'Holiday',
    color: '#ec4899',
    icon: '🎄',
    duration: 24,
    requiresBackup: true,
    requiredCertifications: [],
    allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
    minRestAfter: 12,
    weight: 2.0
  }
};

// =============================================================================
// PREFERENCE TYPES
// =============================================================================

export type PreferenceLevel = 'must_have' | 'highly_preferred' | 'indifferent' | 'must_avoid';

export interface ShiftPreference {
  id: string;
  userId: string;
  month: number; // 1-12
  year: number;
  
  // Date-specific preferences
  datePreferences: DatePreference[];
  
  // Day-of-week preferences
  dayPreferences: DayPreference[];
  
  // Shift type preferences
  shiftTypePreferences: ShiftTypePreference[];
  
  // General notes
  notes: string;
  
  submittedAt: Date;
  lastModified: Date;
}

export interface DatePreference {
  date: Date;
  preference: PreferenceLevel;
  reason?: string;
}

export interface DayPreference {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  preference: PreferenceLevel;
  reason?: string;
}

export interface ShiftTypePreference {
  shiftType: ShiftType;
  preference: PreferenceLevel;
  reason?: string;
}

// =============================================================================
// SCHEDULE & ASSIGNMENT TYPES
// =============================================================================

export interface RotaSchedule {
  id: string;
  month: number;
  year: number;
  department: string;
  
  // Status
  status: 'draft' | 'published' | 'archived';
  
  // Assignments
  assignments: ShiftAssignment[];
  
  // Generation metadata
  generatedAt: Date;
  generatedBy: string; // 'system' or admin userId
  generationLog: GenerationLogEntry[];
  
  // Metrics
  fairnessMetrics: FairnessMetrics;
  preferenceMetrics: PreferenceMetrics;
  
  // Satisfaction tracking
  satisfactionScores: SatisfactionScore[];
}

export interface ShiftAssignment {
  id: string;
  date: Date;
  shiftType: ShiftType;
  
  // Assigned users
  primaryUserId: string;
  backupUserId?: string;
  
  // Status
  status: 'assigned' | 'confirmed' | 'swapped' | 'cancelled';
  
  // Swap tracking
  originalUserId?: string;
  swapHistory: SwapRecord[];
  
  // Assignment reasoning
  assignmentReason: string;
  preferenceScore: number; // How well this matches user preference
  equityScore: number; // How fair this assignment is
}

export interface SwapRecord {
  id: string;
  timestamp: Date;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedBy?: string; // 'system' or admin userId
}

// =============================================================================
// SWAP MARKETPLACE TYPES
// =============================================================================

export interface SwapListing {
  id: string;
  assignmentId: string;
  userId: string;
  userName: string;
  
  // Shift details
  date: Date;
  shiftType: ShiftType;
  
  // Listing details
  listedAt: Date;
  expiresAt: Date;
  reason?: string;
  
  // Preferences for swap
  preferredDates?: Date[];
  willingToSwapFor?: ShiftType[];
  
  // Status
  status: 'available' | 'pending' | 'completed' | 'expired' | 'cancelled';
  
  // Interested parties
  interestedUsers: SwapInterest[];
}

export interface SwapInterest {
  userId: string;
  userName: string;
  offeredAssignmentId?: string;
  offeredDate?: Date;
  offeredShiftType?: ShiftType;
  message?: string;
  submittedAt: Date;
}

export interface SwapValidation {
  isValid: boolean;
  errors: SwapValidationError[];
  warnings: SwapValidationWarning[];
}

export interface SwapValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface SwapValidationWarning {
  code: string;
  message: string;
}

// =============================================================================
// METRICS & LOGGING TYPES
// =============================================================================

export interface FairnessMetrics {
  overallScore: number; // 0-100
  
  // Per-user metrics
  userMetrics: UserFairnessMetric[];
  
  // Aggregate metrics
  shiftVariance: number;
  weekendVariance: number;
  holidayVariance: number;
  nightShiftVariance: number;
}

export interface UserFairnessMetric {
  userId: string;
  userName: string;
  
  // Counts
  totalShifts: number;
  weekendShifts: number;
  holidayShifts: number;
  nightShifts: number;
  
  // Scores
  fairnessScore: number;
  deviationFromAverage: number;
  
  // Historical comparison
  comparedTo6MonthAverage: number;
}

export interface PreferenceMetrics {
  overallFulfillment: number; // 0-100
  
  mustHaveFulfilled: number;
  mustHaveTotal: number;
  
  highlyPreferredFulfilled: number;
  highlyPreferredTotal: number;
  
  mustAvoidViolations: number;
  mustAvoidTotal: number;
  
  // Per-user breakdown
  userPreferenceScores: UserPreferenceScore[];
}

export interface UserPreferenceScore {
  userId: string;
  userName: string;
  fulfillmentScore: number;
  mustHavesMet: number;
  mustHavesTotal: number;
  mustAvoidsViolated: number;
}

export interface GenerationLogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'decision' | 'constraint';
  message: string;
  details?: Record<string, any>;
}

export interface SatisfactionScore {
  userId: string;
  score: number; // 1-5
  feedback?: string;
  submittedAt: Date;
}

// =============================================================================
// API TYPES
// =============================================================================

export interface RotaAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: Date;
    requestId: string;
  };
}

export interface GenerateScheduleRequest {
  month: number;
  year: number;
  department: string;
  options?: {
    prioritizeEquity?: boolean; // Default true
    prioritizePreferences?: boolean;
    allowOvertime?: boolean;
    maxIterations?: number;
  };
}

export interface SubmitPreferencesRequest {
  userId: string;
  month: number;
  year: number;
  datePreferences: DatePreference[];
  dayPreferences: DayPreference[];
  shiftTypePreferences: ShiftTypePreference[];
  notes?: string;
}

export interface RequestSwapRequest {
  assignmentId: string;
  userId: string;
  reason?: string;
  preferredDates?: Date[];
  willingToSwapFor?: ShiftType[];
}

export interface AcceptSwapRequest {
  listingId: string;
  acceptingUserId: string;
  offeredAssignmentId?: string;
  message?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const PREFERENCE_WEIGHTS: Record<PreferenceLevel, number> = {
  must_have: 100,
  highly_preferred: 75,
  indifferent: 0,
  must_avoid: -100
};

export const PREFERENCE_COLORS: Record<PreferenceLevel, string> = {
  must_have: '#10b981',
  highly_preferred: '#3b82f6',
  indifferent: '#6b7280',
  must_avoid: '#ef4444'
};

export const PREFERENCE_LABELS: Record<PreferenceLevel, string> = {
  must_have: 'Must Have',
  highly_preferred: 'Highly Preferred',
  indifferent: 'Indifferent',
  must_avoid: 'Must Avoid'
};

export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const HOLIDAYS_2025: Date[] = [
  new Date('2025-01-01'), // New Year
  new Date('2025-04-13'), // Passover
  new Date('2025-04-19'), // Passover End
  new Date('2025-05-01'), // Labor Day
  new Date('2025-06-02'), // Shavuot
  new Date('2025-09-23'), // Rosh Hashanah
  new Date('2025-10-02'), // Yom Kippur
  new Date('2025-10-07'), // Sukkot
  new Date('2025-12-25'), // Christmas
];

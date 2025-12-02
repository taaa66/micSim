/**
 * =============================================================================
 * FIREBASE TYPE DECLARATIONS
 * =============================================================================
 * TypeScript declarations for firebase.js
 * =============================================================================
 */

import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// =============================================================================
// USER TYPES
// =============================================================================

export interface UserStats {
  totalSessions: number;
  totalScore: number;
  averageScore: number;
  highestScore: number;
  practice_count: number;
  modulesCompleted: string[];
  lastActive: string | null;
}

export interface UserProfile {
  uid: string;
  idNumber: string;
  fullName: string;
  specialty: string;
  createdAt: string;
  stats: UserStats;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

export interface UserProgress {
  practice_count: number;
  totalSessions: number;
  totalScore: number;
  averageScore: number;
  highestScore: number;
  modulesCompleted: string[];
  lastActive: string | null;
}

export interface LeaderboardEntry {
  id: string;
  fullName: string;
  specialty: string;
  highestScore: number;
  averageScore: number;
  totalSessions: number;
  modulesCompleted: number;
}

// =============================================================================
// FUNCTION DECLARATIONS
// =============================================================================

/**
 * Check if Firebase is properly configured and available
 */
export function isFirebaseAvailable(): boolean;

/**
 * Register a new user
 * @param idNumber - User ID number (תעודת זהות)
 * @param doctorNumber - Doctor number (password)
 * @param fullName - User's full name
 * @param specialty - Medical specialty
 */
export function firebaseRegister(
  idNumber: string,
  doctorNumber: string,
  fullName: string,
  specialty?: string
): Promise<AuthResult>;

/**
 * Sign in existing user
 * @param idNumber - User ID number
 * @param doctorNumber - Doctor number (password)
 */
export function firebaseLogin(
  idNumber: string,
  doctorNumber: string
): Promise<AuthResult>;

/**
 * Sign out current user
 */
export function firebaseLogout(): Promise<void>;

/**
 * Listen to auth state changes
 * @param callback - Function called when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthChange(
  callback: (user: UserProfile | null) => void
): () => void;

/**
 * Update user stats using Firestore transactions
 * @param uid - User ID
 * @param score - New score
 * @param moduleId - Module identifier
 */
export function firebaseUpdateStats(
  uid: string,
  score: number,
  moduleId?: string
): Promise<UserStats | null>;

/**
 * Increment practice count atomically
 * @param uid - User ID
 */
export function incrementPracticeCount(uid: string): Promise<number | null>;

/**
 * Get user progress data
 * @param uid - User ID
 */
export function getUserProgress(uid: string): Promise<UserProgress | null>;

/**
 * Get leaderboard
 * @param limitCount - Maximum number of entries
 */
export function firebaseGetLeaderboard(limitCount?: number): Promise<LeaderboardEntry[]>;

// =============================================================================
// EXPORTS
// =============================================================================

export const auth: Auth | null;
export const db: Firestore | null;

/**
 * =============================================================================
 * AUDIT LOGGING SERVICE
 * =============================================================================
 * Comprehensive audit logging for security and compliance (HIPAA/GDPR)
 * 
 * Features:
 * - Automatic logging of all sensitive operations
 * - User action tracking
 * - Data access logging
 * - Security event monitoring
 * - Offline queue with sync
 * =============================================================================
 */

import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

// =============================================================================
// TYPES
// =============================================================================

export type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'REGISTER'
  | 'PASSWORD_RESET'
  | 'PROFILE_UPDATE'
  | 'PROFILE_VIEW'
  | 'SIMULATION_START'
  | 'SIMULATION_COMPLETE'
  | 'OKAP_GAME_START'
  | 'OKAP_GAME_COMPLETE'
  | 'SCHEDULE_VIEW'
  | 'SCHEDULE_CREATE'
  | 'SCHEDULE_UPDATE'
  | 'SWAP_REQUEST'
  | 'SWAP_ACCEPT'
  | 'SWAP_REJECT'
  | 'PREFERENCE_UPDATE'
  | 'DATA_EXPORT'
  | 'ADMIN_ACTION'
  | 'SECURITY_ALERT'
  | 'ERROR';

export type AuditSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface AuditLogEntry {
  id?: string;
  timestamp: Timestamp | ReturnType<typeof serverTimestamp>;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  action: AuditAction;
  severity: AuditSeverity;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
}

// =============================================================================
// OFFLINE QUEUE
// =============================================================================

const OFFLINE_QUEUE_KEY = 'ophthalmosim_audit_queue';

function getOfflineQueue(): AuditLogEntry[] {
  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToOfflineQueue(entry: AuditLogEntry): void {
  try {
    const queue = getOfflineQueue();
    queue.push(entry);
    // Keep only last 100 entries to prevent storage overflow
    if (queue.length > 100) {
      queue.shift();
    }
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save audit log to offline queue:', error);
  }
}

function clearOfflineQueue(): void {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

// =============================================================================
// CORE LOGGING FUNCTION
// =============================================================================

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return sessionId;
}

export async function logAuditEvent(
  action: AuditAction,
  resource: string,
  details: Record<string, unknown> = {},
  options: {
    resourceId?: string;
    severity?: AuditSeverity;
    success?: boolean;
    errorMessage?: string;
  } = {}
): Promise<void> {
  const user = auth.currentUser;
  
  const entry: AuditLogEntry = {
    timestamp: serverTimestamp(),
    userId: user?.uid || null,
    userEmail: user?.email || null,
    userRole: null, // Will be populated from user profile if needed
    action,
    severity: options.severity || getSeverityForAction(action),
    resource,
    resourceId: options.resourceId,
    details: sanitizeDetails(details),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    sessionId: getSessionId(),
    success: options.success ?? true,
    errorMessage: options.errorMessage
  };

  // Try to write to Firestore
  try {
    if (db) {
      await addDoc(collection(db, 'audit_logs'), entry);
    }
  } catch (error) {
    // If offline or error, save to local queue
    console.warn('Failed to write audit log to Firestore, saving to offline queue:', error);
    saveToOfflineQueue({
      ...entry,
      timestamp: Timestamp.now()
    });
  }

  // Also log to console in development
  if (import.meta.env.DEV) {
    console.log(`[AUDIT] ${entry.severity} - ${action}:`, {
      resource,
      resourceId: options.resourceId,
      success: entry.success,
      details
    });
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getSeverityForAction(action: AuditAction): AuditSeverity {
  const severityMap: Record<AuditAction, AuditSeverity> = {
    LOGIN: 'INFO',
    LOGOUT: 'INFO',
    LOGIN_FAILED: 'WARNING',
    REGISTER: 'INFO',
    PASSWORD_RESET: 'WARNING',
    PROFILE_UPDATE: 'INFO',
    PROFILE_VIEW: 'INFO',
    SIMULATION_START: 'INFO',
    SIMULATION_COMPLETE: 'INFO',
    OKAP_GAME_START: 'INFO',
    OKAP_GAME_COMPLETE: 'INFO',
    SCHEDULE_VIEW: 'INFO',
    SCHEDULE_CREATE: 'INFO',
    SCHEDULE_UPDATE: 'INFO',
    SWAP_REQUEST: 'INFO',
    SWAP_ACCEPT: 'INFO',
    SWAP_REJECT: 'INFO',
    PREFERENCE_UPDATE: 'INFO',
    DATA_EXPORT: 'WARNING',
    ADMIN_ACTION: 'WARNING',
    SECURITY_ALERT: 'CRITICAL',
    ERROR: 'ERROR'
  };
  return severityMap[action] || 'INFO';
}

function sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'];
  
  for (const [key, value] of Object.entries(details)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeDetails(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// =============================================================================
// SYNC OFFLINE QUEUE
// =============================================================================

export async function syncOfflineAuditLogs(): Promise<number> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  let synced = 0;
  const failed: AuditLogEntry[] = [];

  for (const entry of queue) {
    try {
      if (db) {
        await addDoc(collection(db, 'audit_logs'), {
          ...entry,
          syncedAt: serverTimestamp(),
          wasOffline: true
        });
        synced++;
      }
    } catch {
      failed.push(entry);
    }
  }

  // Keep failed entries in queue
  if (failed.length > 0) {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failed));
  } else {
    clearOfflineQueue();
  }

  return synced;
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export const audit = {
  // Authentication
  login: (success: boolean, details: Record<string, unknown> = {}) =>
    logAuditEvent(success ? 'LOGIN' : 'LOGIN_FAILED', 'auth', details, { success }),
  
  logout: () =>
    logAuditEvent('LOGOUT', 'auth'),
  
  register: (details: Record<string, unknown> = {}) =>
    logAuditEvent('REGISTER', 'auth', details),
  
  // Profile
  profileView: (userId: string) =>
    logAuditEvent('PROFILE_VIEW', 'user', { targetUserId: userId }, { resourceId: userId }),
  
  profileUpdate: (userId: string, changes: Record<string, unknown>) =>
    logAuditEvent('PROFILE_UPDATE', 'user', { changes }, { resourceId: userId }),
  
  // Simulations
  simulationStart: (simId: string, simName: string) =>
    logAuditEvent('SIMULATION_START', 'simulation', { simName }, { resourceId: simId }),
  
  simulationComplete: (simId: string, score: number, duration: number) =>
    logAuditEvent('SIMULATION_COMPLETE', 'simulation', { score, duration }, { resourceId: simId }),
  
  // OKAP Games
  okapStart: (gameId: string, gameName: string) =>
    logAuditEvent('OKAP_GAME_START', 'okap', { gameName }, { resourceId: gameId }),
  
  okapComplete: (gameId: string, score: number, accuracy: number) =>
    logAuditEvent('OKAP_GAME_COMPLETE', 'okap', { score, accuracy }, { resourceId: gameId }),
  
  // Scheduling
  scheduleView: (scheduleId: string) =>
    logAuditEvent('SCHEDULE_VIEW', 'schedule', {}, { resourceId: scheduleId }),
  
  scheduleCreate: (month: number, year: number) =>
    logAuditEvent('SCHEDULE_CREATE', 'schedule', { month, year }),
  
  // Swaps
  swapRequest: (assignmentId: string) =>
    logAuditEvent('SWAP_REQUEST', 'swap', {}, { resourceId: assignmentId }),
  
  swapAccept: (listingId: string) =>
    logAuditEvent('SWAP_ACCEPT', 'swap', {}, { resourceId: listingId }),
  
  // Security
  securityAlert: (alertType: string, details: Record<string, unknown>) =>
    logAuditEvent('SECURITY_ALERT', 'security', { alertType, ...details }, { severity: 'CRITICAL' }),
  
  // Errors
  error: (errorType: string, errorMessage: string, details: Record<string, unknown> = {}) =>
    logAuditEvent('ERROR', errorType, details, { success: false, errorMessage, severity: 'ERROR' }),
  
  // Admin
  adminAction: (action: string, details: Record<string, unknown>) =>
    logAuditEvent('ADMIN_ACTION', 'admin', { action, ...details }, { severity: 'WARNING' })
};

// =============================================================================
// AUTO-SYNC ON ONLINE
// =============================================================================

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOfflineAuditLogs().then(count => {
      if (count > 0) {
        console.log(`[AUDIT] Synced ${count} offline audit logs`);
      }
    });
  });
}

export default audit;

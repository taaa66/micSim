/**
 * Authentication Store V2.0
 * =========================
 * Secure auth system with Firebase support and local fallback
 * 
 * Features:
 * - Firebase Authentication (when configured)
 * - Secure password hashing for local fallback
 * - No plain-text passwords stored
 * - Automatic mode detection
 */
import { writable, derived, get } from 'svelte/store';
import { hashPassword, verifyPassword, generateSalt } from './crypto.js';
import { 
  isFirebaseAvailable, 
  firebaseRegister, 
  firebaseLogin, 
  firebaseLogout,
  firebaseUpdateStats,
  firebaseGetLeaderboard,
  onAuthChange,
  getUserProgress,
  incrementPracticeCount
} from './firebase.js';

// Storage keys
const USERS_KEY = 'ophthalmo_users_v2';
const CURRENT_USER_KEY = 'ophthalmo_current_user_v2';
const AUTH_MODE_KEY = 'ophthalmo_auth_mode';

// Determine auth mode
const useFirebase = isFirebaseAvailable();
console.log(`🔐 Auth mode: ${useFirebase ? 'Firebase' : 'Local (secure)'}`);

// ============================================================================
// LOCAL STORAGE FUNCTIONS (Secure with hashing)
// ============================================================================

function loadUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadCurrentUser() {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveCurrentUser(user) {
  if (user) {
    // Never save password hash to current user session
    const safeUser = { ...user };
    delete safeUser.passwordHash;
    delete safeUser.salt;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Users database (in-memory + localStorage)
let usersDB = loadUsers();

// ============================================================================
// STORES
// ============================================================================

// Current user store
export const currentUser = writable(loadCurrentUser());

// Is logged in derived store
export const isLoggedIn = derived(currentUser, $user => !!$user);

// Auth mode store
export const authMode = writable(useFirebase ? 'firebase' : 'local');

// Loading state for initial data fetch
export const isLoading = writable(true);

// User progress store (persistent data from Firebase)
export const userProgress = writable({
  practice_count: 0,
  totalSessions: 0,
  totalScore: 0,
  averageScore: 0,
  highestScore: 0,
  modulesCompleted: [],
  lastActive: null
});

// Subscribe to save current user (local mode only)
currentUser.subscribe(user => {
  if (!useFirebase) {
    saveCurrentUser(user);
  }
});

// Firebase auth state listener with progress loading
if (useFirebase) {
  onAuthChange(async (user) => {
    isLoading.set(true);
    
    if (user && user.uid) {
      try {
        // Fetch user progress from Firebase
        const progress = await getUserProgress(user.uid);
        if (progress) {
          userProgress.set(progress);
          // Merge progress into user object
          user.stats = progress;
        }
        currentUser.set(user);
        console.log('✅ User and progress loaded:', user.fullName, progress);
      } catch (error) {
        console.error('❌ Error loading user progress:', error);
        currentUser.set(user);
      }
    } else {
      currentUser.set(null);
      userProgress.set({
        practice_count: 0,
        totalSessions: 0,
        totalScore: 0,
        averageScore: 0,
        highestScore: 0,
        modulesCompleted: [],
        lastActive: null
      });
    }
    
    isLoading.set(false);
  });
} else {
  isLoading.set(false);
}

// ============================================================================
// REGISTRATION
// ============================================================================

/**
 * Register a new user
 * @param {string} idNumber - תעודת זהות (5-9 digits)
 * @param {string} doctorNumber - מספר רופא (password, min 6 chars)
 * @param {string} fullName - שם מלא
 * @param {string} specialty - התמחות (optional)
 */
export async function register(idNumber, doctorNumber, fullName, specialty = '') {
  // Validate ID number
  const cleanId = idNumber.replace(/\D/g, '');
  if (cleanId.length < 5 || cleanId.length > 9) {
    return { success: false, error: 'תעודת זהות חייבת להכיל 5-9 ספרות' };
  }

  // Validate doctor number (Firebase requires min 6 chars)
  if (!doctorNumber || doctorNumber.length < 6) {
    return { success: false, error: 'מספר רופא חייב להכיל לפחות 6 תווים' };
  }

  // Validate name
  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: 'נא להזין שם מלא' };
  }

  // Use Firebase if available
  if (useFirebase) {
    return await firebaseRegister(cleanId, doctorNumber, fullName.trim(), specialty.trim());
  }

  // Local mode with secure hashing
  if (usersDB[cleanId]) {
    return { success: false, error: 'משתמש קיים במערכת' };
  }

  // Generate salt and hash password
  const salt = generateSalt();
  const passwordHash = await hashPassword(doctorNumber, salt);

  // Create user (NO plain-text password stored)
  const user = {
    id: cleanId,
    salt: salt,
    passwordHash: passwordHash,
    fullName: fullName.trim(),
    specialty: specialty.trim() || 'רופא עיניים',
    createdAt: new Date().toISOString(),
    stats: {
      totalSessions: 0,
      totalScore: 0,
      averageScore: 0,
      highestScore: 0,
      modulesCompleted: [],
      lastActive: new Date().toISOString()
    }
  };

  // Save to DB
  usersDB[cleanId] = user;
  saveUsers(usersDB);

  // Create safe user object for session (without credentials)
  const safeUser = {
    id: user.id,
    fullName: user.fullName,
    specialty: user.specialty,
    createdAt: user.createdAt,
    stats: user.stats
  };

  // Auto login
  currentUser.set(safeUser);

  return { success: true, user: safeUser };
}

// ============================================================================
// LOGIN
// ============================================================================

/**
 * Login user
 * @param {string} idNumber - תעודת זהות
 * @param {string} doctorNumber - מספר רופא
 */
export async function login(idNumber, doctorNumber) {
  const cleanId = idNumber.replace(/\D/g, '');

  // Use Firebase if available
  if (useFirebase) {
    return await firebaseLogin(cleanId, doctorNumber);
  }

  // Local mode with secure verification
  const user = usersDB[cleanId];
  if (!user) {
    return { success: false, error: 'משתמש לא נמצא' };
  }

  // Verify password hash
  const isValid = await verifyPassword(doctorNumber, user.salt, user.passwordHash);
  if (!isValid) {
    return { success: false, error: 'מספר רופא שגוי' };
  }

  // Update last active
  user.stats.lastActive = new Date().toISOString();
  usersDB[cleanId] = user;
  saveUsers(usersDB);

  // Create safe user object for session
  const safeUser = {
    id: user.id,
    fullName: user.fullName,
    specialty: user.specialty,
    createdAt: user.createdAt,
    stats: user.stats
  };

  currentUser.set(safeUser);
  return { success: true, user: safeUser };
}

// ============================================================================
// LOGOUT
// ============================================================================

/**
 * Logout current user
 */
export async function logout() {
  if (useFirebase) {
    await firebaseLogout();
  }
  currentUser.set(null);
}

// ============================================================================
// STATS UPDATE
// ============================================================================

/**
 * Update user stats after completing a session
 * Uses atomic increment on Firebase to prevent race conditions
 */
export async function updateUserStats(score, moduleId) {
  const user = get(currentUser);
  if (!user) return null;

  if (useFirebase && user.uid) {
    try {
      const newStats = await firebaseUpdateStats(user.uid, score, moduleId);
      if (newStats) {
        // Update both stores atomically
        currentUser.update(u => ({ ...u, stats: newStats }));
        userProgress.set(newStats);
        console.log('✅ Stats synced to Firebase:', newStats);
      }
      return newStats;
    } catch (error) {
      console.error('❌ Failed to update stats:', error);
      return null;
    }
  }

  // Local mode
  let updatedStats = null;
  currentUser.update(u => {
    if (!u) return null;

    const stats = { ...u.stats };
    stats.totalSessions = (stats.totalSessions || 0) + 1;
    stats.totalScore = (stats.totalScore || 0) + score;
    stats.averageScore = Math.round(stats.totalScore / stats.totalSessions);
    stats.highestScore = Math.max(stats.highestScore || 0, score);
    stats.practice_count = (stats.practice_count || 0) + 1;
    stats.lastActive = new Date().toISOString();

    if (moduleId && !(stats.modulesCompleted || []).includes(moduleId)) {
      stats.modulesCompleted = [...(stats.modulesCompleted || []), moduleId];
    }

    // Update in DB
    if (usersDB[u.id]) {
      usersDB[u.id].stats = stats;
      saveUsers(usersDB);
    }

    updatedStats = stats;
    return { ...u, stats };
  });

  // Update progress store for local mode
  if (updatedStats) {
    userProgress.set(updatedStats);
  }
  
  return updatedStats;
}

/**
 * Get current practice count
 */
export function getPracticeCount() {
  const user = get(currentUser);
  return user?.stats?.practice_count || get(userProgress).practice_count || 0;
}

// ============================================================================
// LEADERBOARD
// ============================================================================

/**
 * Get all users for leaderboard (sorted by highest score)
 */
export async function getLeaderboard() {
  if (useFirebase) {
    return await firebaseGetLeaderboard();
  }

  // Local mode
  return Object.values(usersDB)
    .map(u => ({
      id: u.id,
      fullName: u.fullName,
      specialty: u.specialty,
      highestScore: u.stats?.highestScore || 0,
      averageScore: u.stats?.averageScore || 0,
      totalSessions: u.stats?.totalSessions || 0,
      modulesCompleted: u.stats?.modulesCompleted?.length || 0
    }))
    .sort((a, b) => b.highestScore - a.highestScore);
}

// ============================================================================
// DERIVED STORES
// ============================================================================

/**
 * Get display name for current user
 */
export const displayName = derived(currentUser, $user => {
  if (!$user) return 'אורח';
  return $user.fullName || `Dr. ${$user.id?.slice(-4) || '????'}`;
});

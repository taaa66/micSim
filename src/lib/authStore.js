/**
 * Authentication Store
 * Simple auth system using ID (תעודת זהות) and Doctor Number (מספר רופא)
 */
import { writable, derived } from 'svelte/store';

// Storage keys
const USERS_KEY = 'ophthalmo_users';
const CURRENT_USER_KEY = 'ophthalmo_current_user';

// Load users from localStorage
function loadUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// Save users to localStorage
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Load current user from localStorage
function loadCurrentUser() {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Users database (in-memory + localStorage)
let usersDB = loadUsers();

// Current user store
export const currentUser = writable(loadCurrentUser());

// Is logged in derived store
export const isLoggedIn = derived(currentUser, $user => !!$user);

// Subscribe to save current user
currentUser.subscribe(user => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
});

/**
 * Register a new user
 * @param {string} idNumber - תעודת זהות (9 digits)
 * @param {string} doctorNumber - מספר רופא (password)
 * @param {string} fullName - שם מלא
 * @param {string} specialty - התמחות (optional)
 */
export function register(idNumber, doctorNumber, fullName, specialty = '') {
  // Validate ID number (9 digits)
  const cleanId = idNumber.replace(/\D/g, '');
  if (cleanId.length < 5 || cleanId.length > 9) {
    return { success: false, error: 'תעודת זהות חייבת להכיל 5-9 ספרות' };
  }

  // Check if user exists
  if (usersDB[cleanId]) {
    return { success: false, error: 'משתמש קיים במערכת' };
  }

  // Validate doctor number
  if (!doctorNumber || doctorNumber.length < 4) {
    return { success: false, error: 'מספר רופא חייב להכיל לפחות 4 תווים' };
  }

  // Validate name
  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: 'נא להזין שם מלא' };
  }

  // Create user
  const user = {
    id: cleanId,
    doctorNumber: doctorNumber,
    fullName: fullName.trim(),
    specialty: specialty.trim() || 'רופא עיניים',
    createdAt: new Date().toISOString(),
    stats: {
      totalSessions: 0,
      totalScore: 0,
      averageScore: 0,
      highestScore: 0,
      modulesCompleted: [],
      lastActive: null
    }
  };

  // Save to DB
  usersDB[cleanId] = user;
  saveUsers(usersDB);

  // Auto login
  currentUser.set(user);

  return { success: true, user };
}

/**
 * Login user
 * @param {string} idNumber - תעודת זהות
 * @param {string} doctorNumber - מספר רופא
 */
export function login(idNumber, doctorNumber) {
  const cleanId = idNumber.replace(/\D/g, '');

  // Find user
  const user = usersDB[cleanId];
  if (!user) {
    return { success: false, error: 'משתמש לא נמצא' };
  }

  // Check password
  if (user.doctorNumber !== doctorNumber) {
    return { success: false, error: 'מספר רופא שגוי' };
  }

  // Update last active
  user.stats.lastActive = new Date().toISOString();
  usersDB[cleanId] = user;
  saveUsers(usersDB);

  // Set current user
  currentUser.set(user);

  return { success: true, user };
}

/**
 * Logout current user
 */
export function logout() {
  currentUser.set(null);
}

/**
 * Update user stats after completing a session
 */
export function updateUserStats(score, moduleId) {
  currentUser.update(user => {
    if (!user) return null;

    user.stats.totalSessions += 1;
    user.stats.totalScore += score;
    user.stats.averageScore = Math.round(user.stats.totalScore / user.stats.totalSessions);
    user.stats.highestScore = Math.max(user.stats.highestScore, score);
    user.stats.lastActive = new Date().toISOString();

    if (moduleId && !user.stats.modulesCompleted.includes(moduleId)) {
      user.stats.modulesCompleted.push(moduleId);
    }

    // Save to DB
    usersDB[user.id] = user;
    saveUsers(usersDB);

    return user;
  });
}

/**
 * Get all users for leaderboard (sorted by highest score)
 */
export function getLeaderboard() {
  return Object.values(usersDB)
    .map(u => ({
      id: u.id,
      fullName: u.fullName,
      specialty: u.specialty,
      highestScore: u.stats.highestScore,
      averageScore: u.stats.averageScore,
      totalSessions: u.stats.totalSessions,
      modulesCompleted: u.stats.modulesCompleted.length
    }))
    .sort((a, b) => b.highestScore - a.highestScore);
}

/**
 * Get display name for current user
 */
export const displayName = derived(currentUser, $user => {
  if (!$user) return 'אורח';
  return $user.fullName || `Dr. ${$user.id.slice(-4)}`;
});

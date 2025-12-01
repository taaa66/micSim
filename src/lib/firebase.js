/**
 * Firebase Configuration
 * =======================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (or use existing)
 * 3. Enable Authentication > Sign-in method > Email/Password
 * 4. Enable Firestore Database
 * 5. Copy your config from Project Settings > General > Your apps > Web app
 * 6. Replace the firebaseConfig below with your values
 * 
 * SECURITY NOTE:
 * - These keys are safe to expose in client-side code
 * - Firebase uses Security Rules to protect data
 * - Never put sensitive data in Firestore without proper rules
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  increment,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';

// Firebase configuration - MicroSim Project
const firebaseConfig = {
  apiKey: "AIzaSyCjayCaQybHMevNzUNjdNv5Q54DPFa95e8",
  authDomain: "microsim-c670b.firebaseapp.com",
  projectId: "microsim-c670b",
  storageBucket: "microsim-c670b.firebasestorage.app",
  messagingSenderId: "622906420676",
  appId: "1:622906420676:web:47bfe822eabfb8338f8891",
  measurementId: "G-Z55HG8CPRL"
};

// Check if Firebase is configured
const isFirebaseConfigured = !firebaseConfig.apiKey.includes('PLACEHOLDER');

// Initialize Firebase (only if configured)
let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
} else {
  console.warn('⚠️ Firebase not configured - using local storage fallback');
}

/**
 * Check if Firebase is available
 */
export function isFirebaseAvailable() {
  return isFirebaseConfigured && auth !== null && db !== null;
}

/**
 * Create a new user account
 * @param {string} idNumber - User ID number (תעודת זהות)
 * @param {string} doctorNumber - Doctor number (password)
 * @param {string} fullName - User's full name
 * @param {string} specialty - Medical specialty
 */
export async function firebaseRegister(idNumber, doctorNumber, fullName, specialty) {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase not configured');
  }

  // Create pseudo-email from ID number
  const email = `${idNumber}@ophthalmo.sim`;
  
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, doctorNumber);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, { displayName: fullName });
    
    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      idNumber: idNumber,
      fullName: fullName,
      specialty: specialty || 'רופא עיניים',
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
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    return { success: true, user: userProfile };
  } catch (error) {
    console.error('Registration error:', error);
    
    // Translate Firebase errors to Hebrew
    const errorMessages = {
      'auth/email-already-in-use': 'משתמש קיים במערכת',
      'auth/weak-password': 'מספר רופא חייב להכיל לפחות 6 תווים',
      'auth/invalid-email': 'תעודת זהות לא תקינה'
    };
    
    return { 
      success: false, 
      error: errorMessages[error.code] || 'שגיאה ברישום. נסה שוב.' 
    };
  }
}

/**
 * Sign in existing user
 */
export async function firebaseLogin(idNumber, doctorNumber) {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase not configured');
  }

  const email = `${idNumber}@ophthalmo.sim`;
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, doctorNumber);
    const user = userCredential.user;
    
    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const profile = userDoc.data();
      
      // Update last active
      await updateDoc(doc(db, 'users', user.uid), {
        'stats.lastActive': new Date().toISOString()
      });
      
      return { success: true, user: profile };
    } else {
      // Create profile if missing
      const profile = {
        uid: user.uid,
        idNumber: idNumber,
        fullName: user.displayName || 'משתמש',
        specialty: 'רופא עיניים',
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
      
      await setDoc(doc(db, 'users', user.uid), profile);
      return { success: true, user: profile };
    }
  } catch (error) {
    console.error('Login error:', error);
    
    const errorMessages = {
      'auth/user-not-found': 'משתמש לא נמצא',
      'auth/wrong-password': 'מספר רופא שגוי',
      'auth/invalid-credential': 'פרטי התחברות שגויים',
      'auth/too-many-requests': 'יותר מדי ניסיונות. נסה שוב מאוחר יותר.'
    };
    
    return { 
      success: false, 
      error: errorMessages[error.code] || 'שגיאה בהתחברות. נסה שוב.' 
    };
  }
}

/**
 * Sign out current user
 */
export async function firebaseLogout() {
  if (!isFirebaseAvailable()) return;
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback) {
  if (!isFirebaseAvailable()) {
    callback(null);
    return () => {};
  }
  
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      callback(userDoc.exists() ? userDoc.data() : null);
    } else {
      callback(null);
    }
  });
}

/**
 * Update user stats using ATOMIC operations
 * This prevents race conditions when multiple updates happen simultaneously
 */
export async function firebaseUpdateStats(uid, score, moduleId) {
  if (!isFirebaseAvailable()) return null;
  
  try {
    const userRef = doc(db, 'users', uid);
    
    // First, get current highest score to compare
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.error('User document not found:', uid);
      return null;
    }
    
    const currentData = userDoc.data();
    const currentHighest = currentData.stats?.highestScore || 0;
    const currentTotal = currentData.stats?.totalSessions || 0;
    const currentTotalScore = currentData.stats?.totalScore || 0;
    
    // Build atomic update object
    const updateData = {
      'stats.totalSessions': increment(1),
      'stats.totalScore': increment(score),
      'stats.lastActive': serverTimestamp(),
      'stats.practice_count': increment(1) // Explicit practice count
    };
    
    // Update highest score only if new score is higher
    if (score > currentHighest) {
      updateData['stats.highestScore'] = score;
    }
    
    // Add module to completed list atomically (arrayUnion prevents duplicates)
    if (moduleId) {
      updateData['stats.modulesCompleted'] = arrayUnion(moduleId);
    }
    
    // Perform atomic update
    await updateDoc(userRef, updateData);
    
    // Calculate new values for return
    const newTotalSessions = currentTotal + 1;
    const newTotalScore = currentTotalScore + score;
    const newAverageScore = Math.round(newTotalScore / newTotalSessions);
    const newHighestScore = Math.max(currentHighest, score);
    
    // Fetch updated modules list
    const updatedDoc = await getDoc(userRef);
    const updatedData = updatedDoc.data();
    
    console.log('✅ Stats updated successfully:', { uid, score, moduleId });
    
    return {
      totalSessions: newTotalSessions,
      totalScore: newTotalScore,
      averageScore: newAverageScore,
      highestScore: newHighestScore,
      practice_count: (currentData.stats?.practice_count || 0) + 1,
      modulesCompleted: updatedData.stats?.modulesCompleted || [],
      lastActive: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Update stats error:', error);
    throw error; // Re-throw for caller to handle
  }
}

/**
 * Increment practice count atomically
 * Called after each completed practice session
 */
export async function incrementPracticeCount(uid) {
  if (!isFirebaseAvailable()) return null;
  
  try {
    const userRef = doc(db, 'users', uid);
    
    await updateDoc(userRef, {
      'stats.practice_count': increment(1),
      'stats.lastActive': serverTimestamp()
    });
    
    // Fetch and return new count
    const userDoc = await getDoc(userRef);
    const newCount = userDoc.data()?.stats?.practice_count || 0;
    
    console.log('✅ Practice count incremented:', newCount);
    return newCount;
  } catch (error) {
    console.error('❌ Increment practice count error:', error);
    throw error;
  }
}

/**
 * Get user progress data
 * Called on login/session load to restore state
 */
export async function getUserProgress(uid) {
  if (!isFirebaseAvailable()) return null;
  
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('Creating new user progress document');
      // Initialize new user with default progress
      const defaultProgress = {
        practice_count: 0,
        totalSessions: 0,
        totalScore: 0,
        averageScore: 0,
        highestScore: 0,
        modulesCompleted: [],
        lastActive: serverTimestamp()
      };
      
      await updateDoc(userRef, { stats: defaultProgress });
      return defaultProgress;
    }
    
    const stats = userDoc.data().stats || {};
    console.log('✅ User progress loaded:', stats);
    
    return {
      practice_count: stats.practice_count || 0,
      totalSessions: stats.totalSessions || 0,
      totalScore: stats.totalScore || 0,
      averageScore: stats.averageScore || 0,
      highestScore: stats.highestScore || 0,
      modulesCompleted: stats.modulesCompleted || [],
      lastActive: stats.lastActive
    };
  } catch (error) {
    console.error('❌ Get user progress error:', error);
    throw error;
  }
}

/**
 * Get leaderboard
 */
export async function firebaseGetLeaderboard(limitCount = 20) {
  if (!isFirebaseAvailable()) return [];
  
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('stats.highestScore', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.idNumber,
        fullName: data.fullName,
        specialty: data.specialty,
        highestScore: data.stats?.highestScore || 0,
        averageScore: data.stats?.averageScore || 0,
        totalSessions: data.stats?.totalSessions || 0,
        modulesCompleted: data.stats?.modulesCompleted?.length || 0
      };
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return [];
  }
}

// Export auth and db for direct access if needed
export { auth, db };

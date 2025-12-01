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
  getDocs
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
 * Update user stats
 */
export async function firebaseUpdateStats(uid, score, moduleId) {
  if (!isFirebaseAvailable()) return;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return;
    
    const data = userDoc.data();
    const stats = data.stats || {};
    
    const newTotalSessions = (stats.totalSessions || 0) + 1;
    const newTotalScore = (stats.totalScore || 0) + score;
    const newAverageScore = Math.round(newTotalScore / newTotalSessions);
    const newHighestScore = Math.max(stats.highestScore || 0, score);
    
    let modulesCompleted = stats.modulesCompleted || [];
    if (moduleId && !modulesCompleted.includes(moduleId)) {
      modulesCompleted = [...modulesCompleted, moduleId];
    }
    
    await updateDoc(doc(db, 'users', uid), {
      'stats.totalSessions': newTotalSessions,
      'stats.totalScore': newTotalScore,
      'stats.averageScore': newAverageScore,
      'stats.highestScore': newHighestScore,
      'stats.modulesCompleted': modulesCompleted,
      'stats.lastActive': new Date().toISOString()
    });
    
    return {
      totalSessions: newTotalSessions,
      totalScore: newTotalScore,
      averageScore: newAverageScore,
      highestScore: newHighestScore,
      modulesCompleted,
      lastActive: new Date().toISOString()
    };
  } catch (error) {
    console.error('Update stats error:', error);
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

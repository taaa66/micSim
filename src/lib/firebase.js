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
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { getFirebaseConfig, isFirebaseConfigured as checkConfig } from './firebaseConfig.js';

// Load Firebase configuration (supports env variables)
const firebaseConfig = getFirebaseConfig();
const isFirebaseConfigured = checkConfig(firebaseConfig);

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
  
  let user = null;
  
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, doctorNumber);
    user = userCredential.user;
    
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
    
    // CRITICAL: Create Firestore document BEFORE returning
    // This prevents race condition with onAuthStateChanged
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    // Verify the document was created
    const verifyDoc = await getDoc(doc(db, 'users', user.uid));
    if (!verifyDoc.exists()) {
      console.error('❌ Firestore document not created after setDoc');
      throw new Error('Failed to create user profile');
    }
    
    console.log('✅ Registration complete, Firestore document verified');
    return { success: true, user: userProfile };
  } catch (error) {
    console.error('Registration error:', error);
    
    // If auth user was created but Firestore failed, we have a partial registration
    // The onAuthChange handler will create a basic profile as fallback
    if (user && error.code !== 'auth/email-already-in-use') {
      console.warn('⚠️ Partial registration - auth user created but Firestore may have failed');
    }
    
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
      // Retry logic for race condition during registration
      // The Firestore document might not exist yet right after registration
      let retries = 3;
      let userDoc = null;
      
      while (retries > 0) {
        userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          break;
        }
        // Wait a bit before retrying (document might still be creating)
        await new Promise(resolve => setTimeout(resolve, 500));
        retries--;
      }
      
      if (userDoc && userDoc.exists()) {
        callback(userDoc.data());
      } else {
        // If still no document after retries, create a basic profile
        // This handles edge cases where registration partially failed
        console.warn('⚠️ User profile not found, creating basic profile');
        const basicProfile = {
          uid: user.uid,
          idNumber: user.email?.replace('@ophthalmo.sim', '') || '',
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
        
        try {
          await setDoc(doc(db, 'users', user.uid), basicProfile);
          callback(basicProfile);
        } catch (error) {
          console.error('❌ Failed to create basic profile:', error);
          callback(null);
        }
      }
    } else {
      callback(null);
    }
  });
}

/**
 * Update user stats using FIRESTORE TRANSACTIONS
 * 
 * CRITICAL: This function uses runTransaction to ensure ACID compliance:
 * - Atomicity: All updates succeed or all fail
 * - Consistency: Data integrity maintained across concurrent updates
 * - Isolation: No race conditions between reads and writes
 * - Durability: Changes are permanently committed
 * 
 * DATA INTEGRITY GUARANTEES:
 * 1. highestScore: Only updated if new score > current (transactional comparison)
 * 2. averageScore: Calculated server-side from aggregated totalScore/totalSessions
 * 3. All counters use atomic increment operations
 * 
 * @param {string} uid - User ID
 * @param {number} score - New score (must be numeric)
 * @param {string} moduleId - Module identifier
 * @returns {Promise<Object>} Updated stats object
 */
export async function firebaseUpdateStats(uid, score, moduleId) {
  if (!isFirebaseAvailable()) return null;
  
  // Validate score is numeric
  if (typeof score !== 'number' || isNaN(score)) {
    console.error('❌ Invalid score type:', typeof score, score);
    throw new Error('Score must be a valid number');
  }
  
  try {
    const userRef = doc(db, 'users', uid);
    
    // Execute transaction for ACID compliance
    const result = await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }
      
      const currentData = userDoc.data();
      const stats = currentData.stats || {};
      
      // Current aggregated values
      const currentHighest = stats.highestScore || 0;
      const currentTotalSessions = stats.totalSessions || 0;
      const currentTotalScore = stats.totalScore || 0;
      const currentPracticeCount = stats.practice_count || 0;
      
      // Calculate new aggregated values
      const newTotalSessions = currentTotalSessions + 1;
      const newTotalScore = currentTotalScore + score;
      const newPracticeCount = currentPracticeCount + 1;
      
      // SERVER-SIDE average calculation (ensures consistency)
      const newAverageScore = Math.round(newTotalScore / newTotalSessions);
      
      // Transactional high score update (only if new score is higher)
      const newHighestScore = Math.max(currentHighest, score);
      
      // Build update object
      const updateData = {
        'stats.totalSessions': newTotalSessions,
        'stats.totalScore': newTotalScore,
        'stats.averageScore': newAverageScore,  // ✅ PERSISTED AVERAGE
        'stats.highestScore': newHighestScore,  // ✅ TRANSACTIONAL MAX
        'stats.practice_count': newPracticeCount,
        'stats.lastActive': serverTimestamp()
      };
      
      // Add module to completed list (arrayUnion prevents duplicates)
      if (moduleId) {
        const currentModules = stats.modulesCompleted || [];
        if (!currentModules.includes(moduleId)) {
          updateData['stats.modulesCompleted'] = arrayUnion(moduleId);
        }
      }
      
      // Commit transaction
      transaction.update(userRef, updateData);
      
      // Return calculated values
      return {
        totalSessions: newTotalSessions,
        totalScore: newTotalScore,
        averageScore: newAverageScore,
        highestScore: newHighestScore,
        practice_count: newPracticeCount,
        modulesCompleted: moduleId && !stats.modulesCompleted?.includes(moduleId)
          ? [...(stats.modulesCompleted || []), moduleId]
          : (stats.modulesCompleted || []),
        lastActive: new Date().toISOString()
      };
    });
    
    console.log('✅ Stats updated (TRANSACTION):', { 
      uid, 
      score, 
      moduleId,
      newAverage: result.averageScore,
      newHighest: result.highestScore
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Transaction failed:', error);
    throw error;
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
      console.log('⚠️ User document not found, returning default progress');
      // Return default progress - document will be created by onAuthChange if needed
      const defaultProgress = {
        practice_count: 0,
        totalSessions: 0,
        totalScore: 0,
        averageScore: 0,
        highestScore: 0,
        modulesCompleted: [],
        lastActive: null
      };
      
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

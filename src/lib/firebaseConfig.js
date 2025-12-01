/**
 * Firebase Configuration Loader
 * Supports environment variables with fallback to hardcoded values
 */

export function getFirebaseConfig() {
  // Try environment variables first (for production/CI)
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };
  }
  
  // Fallback to hardcoded config (development)
  return {
    apiKey: "AIzaSyCjayCaQybHMevNzUNjdNv5Q54DPFa95e8",
    authDomain: "microsim-c670b.firebaseapp.com",
    projectId: "microsim-c670b",
    storageBucket: "microsim-c670b.firebasestorage.app",
    messagingSenderId: "622906420676",
    appId: "1:622906420676:web:47bfe822eabfb8338f8891",
    measurementId: "G-Z55HG8CPRL"
  };
}

export function isFirebaseConfigured(config) {
  return config.apiKey && !config.apiKey.includes('PLACEHOLDER');
}

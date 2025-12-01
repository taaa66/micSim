# 🔐 Firebase Setup Guide for Ophthalmic Simulator

## Overview

This guide will help you set up Firebase for secure authentication and data storage.
The application works in two modes:

1. **Firebase Mode** (Recommended) - Secure cloud-based authentication
2. **Local Mode** (Fallback) - Encrypted local storage for development/demo

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages                         │
│                  (Static Hosting)                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Firebase Authentication                    │
│  • Handles login/registration                          │
│  • Manages sessions                                    │
│  • Protects with Security Rules                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Firestore Database                     │
│  • Stores user profiles                                │
│  • Stores scores and stats                             │
│  • Protected by Security Rules                         │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it (e.g., "ophthalmo-sim")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Click "Email/Password"
5. Enable "Email/Password" (first toggle)
6. Click "Save"

## Step 3: Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Select **Start in production mode**
4. Choose a location (preferably close to your users)
5. Click "Enable"

## Step 4: Set Security Rules

Go to **Firestore Database > Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Users can only read/write their own document
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      
      // Never allow delete (data preservation)
      allow delete: if false;
    }
    
    // Leaderboard - anyone authenticated can read
    match /users/{userId} {
      allow read: if request.auth != null;
    }
    
    // Block all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Click "Publish" to apply the rules.

## Step 5: Get Your Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>) to add a web app
4. Name it (e.g., "ophthalmo-web")
5. Copy the `firebaseConfig` object

## Step 6: Update Your Code

Edit `src/lib/firebase.js` and replace the placeholder config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Security Notes

### ✅ What's Safe

- **API Key in code**: Firebase API keys are meant to be public. They identify your project but don't grant access. Security Rules protect your data.
- **User data**: Each user can only access their own data (enforced by Security Rules).
- **Passwords**: Never stored in plain text. Firebase handles hashing securely.

### ⚠️ What to Avoid

- Never put admin credentials in client code
- Never disable Security Rules in production
- Don't store sensitive medical data without HIPAA compliance

### 🔒 Additional Security (Optional)

1. **Restrict API Key**: In Google Cloud Console, restrict the API key to only your domain
2. **Enable App Check**: Adds device verification
3. **Set up monitoring**: Enable Firebase alerts for suspicious activity

## Testing

After setup, verify:

1. Registration creates a user in Firebase Console > Authentication
2. User data appears in Firestore > users collection
3. Can't access other users' data (test with browser console)

## Troubleshooting

### "Firebase not configured" warning
- Check that `firebaseConfig` doesn't contain "PLACEHOLDER"
- Verify all config values are correct

### "Permission denied" error
- Check Security Rules are published
- Verify user is authenticated before accessing data

### "Email already in use"
- User with that ID already exists
- Use login instead of register

## Local Mode (No Firebase)

If Firebase is not configured, the app automatically falls back to local mode:

- Passwords are hashed with PBKDF2-SHA256
- Data stored in encrypted localStorage
- Works offline
- Data is device-specific (not synced)

This mode is suitable for:
- Development and testing
- Demos without cloud setup
- Offline use cases

---

## Support

For issues or questions, check the [GitHub repository](https://github.com/taaa66/micSim).

// app/lib/firebase/config.ts
// Firebase Client SDK for Phone Authentication (browser-side)

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase only once
let app: FirebaseApp
let auth: Auth

function getFirebaseApp() {
  if (!app) {
    const existingApps = getApps()
    if (existingApps.length > 0) {
      app = existingApps[0]
    } else {
      app = initializeApp(firebaseConfig)
    }
  }
  return app
}

function getFirebaseAuth() {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
  }
  return auth
}

export {
  getFirebaseApp,
  getFirebaseAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
}

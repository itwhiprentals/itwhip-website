// app/lib/firebase/admin.ts
// Firebase Admin SDK for server-side phone verification

import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'

let adminApp: App | undefined
let adminAuth: Auth | undefined

function getAdminApp(): App {
  if (!adminApp) {
    const existingApps = getApps()

    if (existingApps.length > 0) {
      adminApp = existingApps[0]
    } else {
      // Check if we have service account credentials
      const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
      const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

      if (projectId && clientEmail && privateKey) {
        // Initialize with service account
        adminApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        })
      } else if (projectId) {
        // Initialize with just project ID (for environments with default credentials)
        adminApp = initializeApp({
          projectId,
        })
      } else {
        throw new Error('Firebase Admin SDK requires FIREBASE_ADMIN_PROJECT_ID at minimum')
      }
    }
  }

  return adminApp
}

function getAdminAuth(): Auth {
  if (!adminAuth) {
    adminAuth = getAuth(getAdminApp())
  }
  return adminAuth
}

/**
 * Verify a Firebase ID token and return the decoded token
 * @param idToken - The Firebase ID token from client-side authentication
 * @returns The decoded token with phone_number claim
 */
export async function verifyPhoneToken(idToken: string) {
  const auth = getAdminAuth()

  try {
    const decodedToken = await auth.verifyIdToken(idToken)

    // Ensure the token has a phone number
    if (!decodedToken.phone_number) {
      throw new Error('Token does not contain a verified phone number')
    }

    return {
      uid: decodedToken.uid,
      phoneNumber: decodedToken.phone_number,
    }
  } catch (error) {
    console.error('[Firebase Admin] Token verification failed:', error)
    throw error
  }
}

export { getAdminApp, getAdminAuth }

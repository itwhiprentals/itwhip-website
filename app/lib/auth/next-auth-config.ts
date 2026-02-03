// app/lib/auth/next-auth-config.ts
// NextAuth.js configuration for OAuth (Google + Apple)

import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import { DeferredPrismaAdapter } from './deferred-prisma-adapter'
import { prisma } from '@/app/lib/database/prisma'
import { SignJWT, importPKCS8 } from 'jose'

// JWT secrets for issuing tokens compatible with existing system
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'
)

// JWT secret for pending link tokens (10-min expiry)
const LINK_TOKEN_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'
)

// Generate Apple client secret dynamically
async function generateAppleClientSecret(): Promise<string> {
  const teamId = process.env.APPLE_TEAM_ID!
  const clientId = process.env.APPLE_CLIENT_ID!
  const keyId = process.env.APPLE_KEY_ID!
  const privateKey = process.env.APPLE_PRIVATE_KEY!

  const now = Math.floor(Date.now() / 1000)
  const expiry = now + 86400 * 180 // 180 days

  const key = await importPKCS8(privateKey, 'ES256')

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuedAt(now)
    .setExpirationTime(expiry)
    .setAudience('https://appleid.apple.com')
    .setIssuer(teamId)
    .setSubject(clientId)
    .sign(key)

  return jwt
}

// Generate JWT tokens compatible with existing auth system
async function generateCustomJWT(userId: string, email: string, name: string | null) {
  const now = Math.floor(Date.now() / 1000)

  const accessToken = await new SignJWT({
    userId,
    email,
    name,
    role: 'CLAIMED',
    userType: 'guest'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 15 * 60) // 15 minutes
    .setIssuer('itwhip')
    .setAudience('itwhip-guest')
    .sign(GUEST_JWT_SECRET)

  const refreshToken = await new SignJWT({
    userId,
    type: 'refresh'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 7 * 24 * 60 * 60) // 7 days
    .setIssuer('itwhip')
    .sign(GUEST_JWT_SECRET)

  return { accessToken, refreshToken }
}

// Extend JWT type for pending OAuth data
declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string
    provider?: string
    // Pending OAuth data (not yet in database - user hasn't completed profile)
    pendingOAuth?: {
      email: string
      name: string | null
      image: string | null
      provider: string
      providerAccountId: string
      access_token?: string
      refresh_token?: string
      expires_at?: number
      token_type?: string
      scope?: string
      id_token?: string
    }
    // Flag to indicate profile is not yet created
    isProfileComplete?: boolean
  }
}

// Extend User type for pending flag
declare module 'next-auth' {
  interface User {
    isPending?: boolean
  }
}

// Build auth options
async function buildAuthOptions(): Promise<NextAuthOptions> {
  // Generate Apple client secret
  let appleClientSecret = ''
  try {
    if (process.env.APPLE_PRIVATE_KEY) {
      appleClientSecret = await generateAppleClientSecret()
    }
  } catch (error) {
    console.error('Failed to generate Apple client secret:', error)
  }

  return {
    adapter: DeferredPrismaAdapter(prisma) as any,

    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true, // Allow linking OAuth to existing email accounts
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code'
          }
        }
      }),
      ...(appleClientSecret ? [
        AppleProvider({
          clientId: process.env.APPLE_CLIENT_ID!,
          clientSecret: appleClientSecret,
        })
      ] : []),
    ],

    callbacks: {
      async signIn({ user, account }) {
        if (!user.email) {
          console.error('OAuth sign-in failed: No email provided')
          return false
        }

        // ========================================================================
        // RULE 1: Reject Apple "Hide My Email" (private relay)
        // ========================================================================
        if (user.email.endsWith('@privaterelay.appleid.com')) {
          console.warn(`[NextAuth] Rejected private relay email: ${user.email}`)
          return '/auth/login?error=hidden-email'
        }

        // ========================================================================
        // SECURITY GUARD: Prevent OAuth account linking to different user
        // ========================================================================
        if (account && user.id && !user.id.startsWith('pending_')) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { email: true }
            })

            if (dbUser && dbUser.email !== user.email) {
              console.error('[NextAuth] SECURITY BLOCK: OAuth email mismatch!', {
                oauthEmail: user.email,
                dbEmail: dbUser.email,
                userId: user.id,
                provider: account.provider
              })
              return '/auth/login?error=account-mismatch'
            }

            // ==================================================================
            // RULE 2: Require verification before linking NEW provider
            // ==================================================================
            const existingAccount = await prisma.account.findFirst({
              where: { userId: user.id, provider: account.provider }
            })

            if (!existingAccount) {
              console.log(`[NextAuth] Provider ${account.provider} not linked to user ${user.id} — requiring verification`)
              const pendingToken = await new SignJWT({
                userId: user.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                id_token: account.id_token,
              })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('10m')
                .sign(LINK_TOKEN_SECRET)

              return `/auth/verify-link?token=${pendingToken}`
            }
          } catch (error) {
            console.error('[NextAuth] Error checking provider link:', error)
          }
        }

        return true
      },

      async jwt({ token, user, account }) {
        // Initial sign in
        if (user && account) {
          // Check if this is a pending (new OAuth) user from DeferredPrismaAdapter
          const isPending = (user as any).isPending || user.id.startsWith('pending_')

          if (isPending) {
            // NEW USER: Store OAuth data in token for later user creation
            console.log(`[NextAuth JWT] Pending user detected - storing OAuth data in token`)
            token.pendingOAuth = {
              email: user.email!,
              name: user.name || null,
              image: user.image || null,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token
            }
            token.isProfileComplete = false
            // Don't set userId - user doesn't exist in DB yet
            token.userId = undefined
          } else {
            // EXISTING USER: Normal flow
            console.log(`[NextAuth JWT] Existing user detected - normal flow`)
            token.userId = user.id
            token.isProfileComplete = true
          }

          token.email = user.email
          token.name = user.name
          token.provider = account.provider
        }

        return token
      },

      async session({ session, token }) {
        if (session.user && token) {
          // Use userId if set, otherwise fall back to sub (NextAuth's default user identifier)
          const userId = token.userId || token.sub
          ;(session.user as any).id = userId
          ;(session.user as any).provider = token.provider
          // Include pending OAuth data and profile completion status
          ;(session.user as any).isProfileComplete = token.isProfileComplete ?? true
          ;(session.user as any).pendingOAuth = token.pendingOAuth
        }
        return session
      },

      async redirect({ url, baseUrl }) {
        // After OAuth sign-in, redirect through oauth-redirect to set custom JWT cookies
        // Check if this is a callback URL (successful OAuth)
        if (url.includes('/api/auth/callback')) {
          // Redirect to oauth-redirect to set custom JWT tokens
          return `${baseUrl}/api/auth/oauth-redirect?roleHint=guest`
        }
        if (url.startsWith(baseUrl)) {
          return url
        }
        return `${baseUrl}/api/auth/oauth-redirect?roleHint=guest`
      }
    },

    events: {
      // Note: createUser event will fire but with pending_xxx ID for new users
      // We ignore it since we'll create the real user in complete-profile
      async signIn({ user, account, isNewUser }) {
        const isPending = user.id.startsWith('pending_')
        console.log(`OAuth sign-in: ${user.email} via ${account?.provider}${isPending ? ' (pending - needs phone)' : isNewUser ? ' (new user)' : ' (returning user)'}`)
      }
    },

    pages: {
      signIn: '/auth/login',
      error: '/auth/login',
    },

    session: {
      strategy: 'jwt',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },

    // Fix Apple PKCE cookie issue - form_post requires SameSite=None
    cookies: {
      pkceCodeVerifier: {
        name: 'next-auth.pkce.code_verifier',
        options: {
          httpOnly: true,
          sameSite: 'none',
          path: '/',
          secure: true,
        },
      },
    },

    debug: process.env.NODE_ENV === 'development',
  }
}

// Cache the auth options
let cachedAuthOptions: NextAuthOptions | null = null

export async function getAuthOptions(): Promise<NextAuthOptions> {
  if (!cachedAuthOptions) {
    cachedAuthOptions = await buildAuthOptions()
  }
  return cachedAuthOptions
}

// For static export (used by NextAuth handler)
// We need a synchronous version for initial setup
export const authOptions: NextAuthOptions = {
  adapter: DeferredPrismaAdapter(prisma) as any,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true, // Allow linking OAuth to existing email accounts
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        console.error('OAuth sign-in failed: No email provided')
        return false
      }

      // RULE 1: Reject Apple "Hide My Email" (private relay)
      if (user.email.endsWith('@privaterelay.appleid.com')) {
        console.warn(`[NextAuth] Rejected private relay email: ${user.email}`)
        return '/auth/login?error=hidden-email'
      }

      if (account && user.id && !user.id.startsWith('pending_')) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { email: true }
          })

          if (dbUser && dbUser.email !== user.email) {
            console.error('[NextAuth] SECURITY BLOCK: OAuth email mismatch!', {
              oauthEmail: user.email,
              dbEmail: dbUser.email,
              userId: user.id,
              provider: account.provider
            })
            return '/auth/login?error=account-mismatch'
          }

          // RULE 2: Require verification before linking NEW provider
          const existingAccount = await prisma.account.findFirst({
            where: { userId: user.id, provider: account.provider }
          })

          if (!existingAccount) {
            console.log(`[NextAuth] Provider ${account.provider} not linked to user ${user.id} — requiring verification`)
            const pendingToken = await new SignJWT({
              userId: user.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              id_token: account.id_token,
            })
              .setProtectedHeader({ alg: 'HS256' })
              .setExpirationTime('10m')
              .sign(LINK_TOKEN_SECRET)

            return `/auth/verify-link?token=${pendingToken}`
          }
        } catch (error) {
          console.error('[NextAuth] Error checking provider link:', error)
        }
      }

      return true
    },

    async jwt({ token, user, account }) {
      if (user && account) {
        const isPending = (user as any).isPending || user.id.startsWith('pending_')

        if (isPending) {
          console.log(`[NextAuth JWT] Pending user detected - storing OAuth data in token`)
          token.pendingOAuth = {
            email: user.email!,
            name: user.name || null,
            image: user.image || null,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token
          }
          token.isProfileComplete = false
          token.userId = undefined
        } else {
          console.log(`[NextAuth JWT] Existing user detected - normal flow`)
          token.userId = user.id
          token.isProfileComplete = true
        }

        token.email = user.email
        token.name = user.name
        token.provider = account.provider
      }

      return token
    },

    async session({ session, token }) {
      if (session.user && token) {
        const userId = token.userId || token.sub
        ;(session.user as any).id = userId
        ;(session.user as any).provider = token.provider
        ;(session.user as any).isProfileComplete = token.isProfileComplete ?? true
        ;(session.user as any).pendingOAuth = token.pendingOAuth
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.includes('/api/auth/callback')) {
        return `${baseUrl}/api/auth/oauth-redirect?roleHint=guest`
      }
      if (url.startsWith(baseUrl)) {
        return url
      }
      return `${baseUrl}/api/auth/oauth-redirect?roleHint=guest`
    }
  },

  events: {
    // Note: createUser event will fire but with pending_xxx ID for new users
    // We ignore it since we'll create the real user in complete-profile
    async signIn({ user, account, isNewUser }) {
      const isPending = user.id.startsWith('pending_')
      console.log(`OAuth sign-in: ${user.email} via ${account?.provider}${isPending ? ' (pending - needs phone)' : isNewUser ? ' (new user)' : ' (returning user)'}`)
    }
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },

  // Fix Apple PKCE cookie issue - form_post requires SameSite=None
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
  },

  debug: process.env.NODE_ENV === 'development',
}

// Export helper to generate custom tokens after OAuth sign-in
export { generateCustomJWT, generateAppleClientSecret }

// app/lib/auth/next-auth-config.ts
// NextAuth.js configuration for OAuth (Google + Apple)

import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/app/lib/database/prisma'
import { SignJWT, importPKCS8 } from 'jose'

// JWT secrets for issuing tokens compatible with existing system
const GUEST_JWT_SECRET = new TextEncoder().encode(
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

// Extend JWT type
declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string
    provider?: string
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
    adapter: PrismaAdapter(prisma) as any,

    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
        // Allow sign in
        if (!user.email) {
          console.error('OAuth sign-in failed: No email provided')
          return false
        }

        try {
          // Check if user exists with this email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true }
          })

          if (existingUser) {
            // Check if this OAuth account is already linked
            const existingAccount = existingUser.accounts.find(
              (acc: { provider: string }) => acc.provider === account?.provider
            )

            if (!existingAccount && account) {
              // Link new OAuth provider to existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state as string | undefined,
                }
              })
            }

            // Update user info if needed
            if (!existingUser.name && user.name) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  name: user.name,
                  emailVerified: true // OAuth emails are verified
                }
              })
            }

            // Ensure user is marked as email verified
            if (!existingUser.emailVerified) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { emailVerified: true }
              })
            }
          }

          return true
        } catch (error) {
          console.error('OAuth signIn callback error:', error)
          return false
        }
      },

      async jwt({ token, user, account }) {
        // Initial sign in
        if (user) {
          token.userId = user.id
          token.email = user.email
          token.name = user.name
          token.provider = account?.provider
        }

        return token
      },

      async session({ session, token }) {
        if (session.user && token) {
          (session.user as any).id = token.userId
          (session.user as any).provider = token.provider
        }
        return session
      },

      async redirect({ url, baseUrl }) {
        // After OAuth sign-in, redirect to profile or dashboard
        if (url.startsWith(baseUrl)) {
          return url
        }
        return `${baseUrl}/profile`
      }
    },

    events: {
      async createUser({ user }) {
        // When a new user is created via OAuth, set up their profile
        try {
          if (user.email) {
            // Update user role
            await prisma.user.update({
              where: { id: user.id },
              data: {
                role: 'CLAIMED',
                emailVerified: true
              }
            })

            // Check if ReviewerProfile exists
            const existingProfile = await prisma.reviewerProfile.findUnique({
              where: { userId: user.id }
            })

            if (!existingProfile) {
              // Create ReviewerProfile for guest
              await prisma.reviewerProfile.create({
                data: {
                  userId: user.id,
                  email: user.email,
                  name: user.name || '',
                  memberSince: new Date(),
                  city: '',
                  state: '',
                  zipCode: '',
                  emailVerified: true
                }
              })
            }
          }
        } catch (error) {
          console.error('Error in createUser event:', error)
        }
      },

      async signIn({ user, account, isNewUser }) {
        console.log(`OAuth sign-in: ${user.email} via ${account?.provider}${isNewUser ? ' (new user)' : ''}`)
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
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
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
        return false
      }

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true }
        })

        if (existingUser) {
          const existingAccount = existingUser.accounts.find(
            (acc: { provider: string }) => acc.provider === account?.provider
          )

          if (!existingAccount && account) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state as string | undefined,
              }
            })
          }

          if (!existingUser.emailVerified) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: true }
            })
          }
        }

        return true
      } catch (error) {
        console.error('OAuth signIn callback error:', error)
        return false
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.provider = account?.provider
      }
      return token
    },

    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.userId
        (session.user as any).provider = token.provider
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url
      }
      return `${baseUrl}/profile`
    }
  },

  events: {
    async createUser({ user }) {
      try {
        if (user.email) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              role: 'CLAIMED',
              emailVerified: true
            }
          })

          const existingProfile = await prisma.reviewerProfile.findUnique({
            where: { userId: user.id }
          })

          if (!existingProfile) {
            await prisma.reviewerProfile.create({
              data: {
                userId: user.id,
                email: user.email,
                name: user.name || '',
                memberSince: new Date(),
                city: '',
                state: '',
                zipCode: '',
                emailVerified: true
              }
            })
          }
        }
      } catch (error) {
        console.error('Error in createUser event:', error)
      }
    },

    async signIn({ user, account, isNewUser }) {
      console.log(`OAuth sign-in: ${user.email} via ${account?.provider}${isNewUser ? ' (new user)' : ''}`)
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

  debug: process.env.NODE_ENV === 'development',
}

// Export helper to generate custom tokens after OAuth sign-in
export { generateCustomJWT, generateAppleClientSecret }

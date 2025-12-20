// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/app/lib/auth/next-auth-config'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'
)

// Create NextAuth handler
const handler = NextAuth(authOptions)

// Wrap the handler to set custom JWT cookies after OAuth callback
async function wrappedHandler(req: NextRequest) {
  const response = await handler(req as any, {} as any)

  // Check if this is a callback completion (successful OAuth)
  if (req.nextUrl.pathname.includes('/callback') && response instanceof Response) {
    // Get the session to check if user is authenticated
    try {
      // Check if redirecting to profile/dashboard (success indicator)
      const location = response.headers.get('location')
      if (location && (location.includes('/profile') || location.includes('/dashboard'))) {
        // Extract session info from the response cookies
        const sessionToken = response.headers.get('set-cookie')?.match(/next-auth\.session-token=([^;]+)/)?.[1]

        if (sessionToken) {
          // Get user from session
          const { getServerSession } = await import('next-auth')
          // We'll set custom cookies in a middleware or client-side instead
        }
      }
    } catch (error) {
      console.error('Error setting custom JWT after OAuth:', error)
    }
  }

  return response
}

export { handler as GET, handler as POST }

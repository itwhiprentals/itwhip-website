// app/api/auth/oauth-redirect/route.ts
// OAuth redirect handler for role-based routing after authentication

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth/next-auth-config'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roleHint = searchParams.get('roleHint') // 'guest' or 'host'
    const returnTo = searchParams.get('returnTo')

    // Get the authenticated session
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      // Not authenticated, redirect to login
      console.log('[OAuth Redirect] No session, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const email = session.user.email
    const userId = (session.user as any).id

    console.log(`[OAuth Redirect] User authenticated: ${email}, roleHint: ${roleHint}`)

    // Check if user has host profile
    const hostProfile = await prisma.hostProfile.findFirst({
      where: {
        OR: [
          { userId: userId },
          { email: email }
        ]
      },
      select: {
        id: true,
        status: true,
        userId: true
      }
    })

    // Check if user has guest/reviewer profile
    const guestProfile = await prisma.reviewerProfile.findUnique({
      where: { userId: userId },
      select: {
        id: true,
        userId: true
      }
    })

    console.log(`[OAuth Redirect] Host profile: ${hostProfile ? 'exists' : 'none'}, Guest profile: ${guestProfile ? 'exists' : 'none'}`)

    // Determine redirect based on roleHint and existing profiles
    if (roleHint === 'host') {
      // User came from host auth pages
      if (hostProfile) {
        // User has host profile, check status
        if (hostProfile.status === 'APPROVED') {
          console.log('[OAuth Redirect] Redirecting to host dashboard')
          return NextResponse.redirect(new URL('/host/dashboard', request.url))
        } else if (hostProfile.status === 'PENDING') {
          console.log('[OAuth Redirect] Host pending, redirecting to login with message')
          return NextResponse.redirect(new URL('/host/login?status=pending', request.url))
        } else if (hostProfile.status === 'REJECTED') {
          console.log('[OAuth Redirect] Host rejected, redirecting to login with message')
          return NextResponse.redirect(new URL('/host/login?status=rejected', request.url))
        } else if (hostProfile.status === 'SUSPENDED') {
          console.log('[OAuth Redirect] Host suspended, redirecting to login with message')
          return NextResponse.redirect(new URL('/host/login?status=suspended', request.url))
        }
      }

      // No host profile, redirect to host signup to complete registration
      console.log('[OAuth Redirect] No host profile, redirecting to host signup')
      return NextResponse.redirect(new URL('/host/signup?oauth=true', request.url))
    }

    if (roleHint === 'guest') {
      // User came from guest auth pages
      if (guestProfile) {
        // User has guest profile, redirect to profile/dashboard
        const redirectUrl = returnTo || '/profile'
        console.log(`[OAuth Redirect] Redirecting to guest profile: ${redirectUrl}`)
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }

      // Create guest profile if it doesn't exist (shouldn't happen normally as NextAuth handles this)
      if (!guestProfile && userId) {
        try {
          await prisma.reviewerProfile.create({
            data: {
              userId: userId,
              email: email,
              name: session.user.name || '',
              memberSince: new Date(),
              city: '',
              state: '',
              zipCode: '',
              emailVerified: true
            }
          })
          console.log('[OAuth Redirect] Created guest profile')
        } catch (err) {
          // Profile might already exist with different userId
          console.error('[OAuth Redirect] Failed to create guest profile:', err)
        }
      }

      const redirectUrl = returnTo || '/profile'
      console.log(`[OAuth Redirect] Redirecting to: ${redirectUrl}`)
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // No roleHint - determine best redirect based on existing profiles
    // Priority: If user has approved host profile, go to host dashboard
    //           Otherwise, go to guest profile
    if (hostProfile?.status === 'APPROVED') {
      console.log('[OAuth Redirect] No roleHint, user is approved host, redirecting to host dashboard')
      return NextResponse.redirect(new URL('/host/dashboard', request.url))
    }

    // Default to guest profile
    const redirectUrl = returnTo || '/profile'
    console.log(`[OAuth Redirect] No roleHint, defaulting to: ${redirectUrl}`)
    return NextResponse.redirect(new URL(redirectUrl, request.url))

  } catch (error) {
    console.error('[OAuth Redirect] Error:', error)
    // On error, redirect to home
    return NextResponse.redirect(new URL('/', request.url))
  }
}

// app/api/host/check-slug/route.ts
// API for checking if a fleet manager slug is available

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json({
        available: false,
        reason: 'Invalid characters'
      })
    }

    if (slug.length < 3) {
      return NextResponse.json({
        available: false,
        reason: 'Too short'
      })
    }

    // Reserved slugs
    const reservedSlugs = [
      'admin', 'api', 'app', 'auth', 'blog', 'contact', 'dashboard',
      'docs', 'fleet', 'help', 'host', 'login', 'logout', 'partner',
      'profile', 'register', 'settings', 'signup', 'support', 'terms',
      'privacy', 'about', 'home', 'search', 'cars', 'vehicles', 'bookings',
      'earnings', 'messages', 'notifications', 'itwhip', 'www', 'mail'
    ]

    if (reservedSlugs.includes(slug)) {
      return NextResponse.json({
        available: false,
        reason: 'Reserved'
      })
    }

    // Get current user's host profile
    const currentHost = await prisma.rentalHost.findUnique({
      where: { email: user.email },
      select: { id: true }
    })

    // Check if slug exists (excluding current user)
    const existingSlug = await prisma.rentalHost.findFirst({
      where: {
        hostManagerSlug: slug,
        ...(currentHost ? { id: { not: currentHost.id } } : {})
      }
    })

    return NextResponse.json({
      available: !existingSlug,
      slug
    })
  } catch (error) {
    console.error('Error checking slug:', error)
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    )
  }
}

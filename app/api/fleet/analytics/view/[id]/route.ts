// app/api/fleet/analytics/view/[id]/route.ts
// Get detailed information about a specific page view

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'View ID is required' },
        { status: 400 }
      )
    }

    const view = await prisma.pageView.findUnique({
      where: { id },
      select: {
        id: true,
        path: true,
        referrer: true,
        queryParams: true,
        sessionId: true,
        visitorId: true,
        userAgent: true,
        device: true,
        browser: true,
        browserVer: true,
        os: true,
        country: true,
        region: true,
        city: true,
        loadTime: true,
        timestamp: true
      }
    })

    if (!view) {
      return NextResponse.json(
        { error: 'View not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: view
    })

  } catch (error) {
    console.error('[Analytics] View detail error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch view details' },
      { status: 500 }
    )
  }
}

// app/api/fleet/analytics/recent/route.ts
// Paginated recent page views API for analytics

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const range = searchParams.get('range') || '7d'
    const device = searchParams.get('device') || null
    const country = searchParams.get('country') || null
    const search = searchParams.get('search') || null

    // Calculate offset
    const offset = (page - 1) * limit

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (range) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Build where clause
    const where: any = {
      timestamp: { gte: startDate },
      eventType: 'pageview'
    }

    // Apply filters
    if (device) {
      where.device = device
    }

    if (country) {
      where.country = country
    }

    if (search) {
      where.path = { contains: search, mode: 'insensitive' }
    }

    // Get total count for pagination
    const totalCount = await prisma.pageView.count({ where })

    // Get paginated views
    const views = await prisma.pageView.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        path: true,
        country: true,
        city: true,
        device: true,
        browser: true,
        timestamp: true
      }
    })

    // Format views
    const formattedViews = views.map(v => ({
      id: v.id,
      path: v.path,
      location: v.city && v.country ? `${v.city}, ${v.country}` : (v.country || 'Unknown'),
      device: v.device,
      browser: v.browser,
      timestamp: v.timestamp
    }))

    // Get available filters (unique values)
    const [devices, countries] = await Promise.all([
      prisma.pageView.groupBy({
        by: ['device'],
        where: { timestamp: { gte: startDate }, device: { not: null } },
        _count: { device: true },
        orderBy: { _count: { device: 'desc' } },
        take: 10
      }),
      prisma.pageView.groupBy({
        by: ['country'],
        where: { timestamp: { gte: startDate }, country: { not: null } },
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
        take: 20
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        views: formattedViews,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: offset + limit < totalCount
        },
        filters: {
          devices: devices.map(d => ({ value: d.device, count: d._count.device })),
          countries: countries.map(c => ({ value: c.country, count: c._count.country }))
        }
      }
    })

  } catch (error) {
    console.error('[Analytics] Recent views error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent views' },
      { status: 500 }
    )
  }
}

// app/fleet/api/notifications/search-users/route.ts
// Search hosts + guests for notification targeting

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    if (key !== FLEET_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const q = request.nextUrl.searchParams.get('q')?.trim()
    if (!q || q.length < 2) return NextResponse.json({ users: [] })

    const search = { contains: q, mode: 'insensitive' as const }

    const [guests, hosts] = await Promise.all([
      prisma.user.findMany({
        where: { OR: [{ name: search }, { email: search }], isActive: true },
        select: { id: true, name: true, email: true },
        take: 5,
      }),
      prisma.rentalHost.findMany({
        where: { OR: [{ name: search }, { email: search }] },
        select: { userId: true, name: true, email: true },
        take: 5,
      }),
    ])

    const results = [
      ...guests.map(g => ({ id: g.id, name: g.name || g.email, email: g.email, role: 'guest' as const })),
      ...hosts.filter(h => h.userId).map(h => ({ id: h.userId, name: h.name || h.email, email: h.email, role: 'host' as const })),
    ]

    // Deduplicate by id
    const seen = new Set<string>()
    const unique = results.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true })

    return NextResponse.json({ users: unique.slice(0, 10) })
  } catch (error) {
    console.error('[Fleet Notifications] Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

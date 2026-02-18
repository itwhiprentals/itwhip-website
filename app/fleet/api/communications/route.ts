// app/fleet/api/communications/route.ts
// Fleet admin API for SMS and Call logs with pagination + filters

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = process.env.FLEET_API_KEY || 'phoenix-fleet-2847'

function verifyFleetKey(request: NextRequest): boolean {
  const key = request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

export async function GET(request: NextRequest) {
  if (!verifyFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const tab = searchParams.get('tab') || 'sms'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
  const type = searchParams.get('type') || undefined
  const status = searchParams.get('status') || undefined
  const search = searchParams.get('search') || undefined
  const skip = (page - 1) * limit

  try {
    if (tab === 'sms') {
      const where: any = {}
      if (type) where.type = type
      if (status) where.status = status
      if (search) {
        where.OR = [
          { to: { contains: search } },
          { from: { contains: search } },
          { body: { contains: search } },
        ]
      }

      const [logs, total] = await Promise.all([
        prisma.smsLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            booking: {
              select: { bookingCode: true },
            },
          },
        }),
        prisma.smsLog.count({ where }),
      ])

      // Get stats
      const [totalSms, delivered, failed, inbound] = await Promise.all([
        prisma.smsLog.count(),
        prisma.smsLog.count({ where: { status: 'delivered' } }),
        prisma.smsLog.count({ where: { status: 'failed' } }),
        prisma.smsLog.count({ where: { type: 'INBOUND' } }),
      ])

      return NextResponse.json({
        success: true,
        logs: logs.map(log => ({
          ...log,
          bookingCode: log.booking?.bookingCode || null,
          body: log.body.length > 200 ? log.body.substring(0, 200) + '...' : log.body,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: { totalSms, delivered, failed, inbound },
      })
    }

    if (tab === 'calls') {
      const where: any = {}
      if (status) where.status = status
      if (search) {
        where.OR = [
          { from: { contains: search } },
          { to: { contains: search } },
          { transcription: { contains: search } },
        ]
      }

      const [logs, total] = await Promise.all([
        prisma.callLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            booking: {
              select: { bookingCode: true },
            },
          },
        }),
        prisma.callLog.count({ where }),
      ])

      // Get stats
      const [totalCalls, withVoicemail, avgDuration] = await Promise.all([
        prisma.callLog.count(),
        prisma.callLog.count({ where: { recordingUrl: { not: null } } }),
        prisma.callLog.aggregate({ _avg: { duration: true } }),
      ])

      return NextResponse.json({
        success: true,
        logs: logs.map(log => ({
          ...log,
          bookingCode: log.booking?.bookingCode || null,
          transcription: log.transcription
            ? (log.transcription.length > 200 ? log.transcription.substring(0, 200) + '...' : log.transcription)
            : null,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalCalls,
          withVoicemail,
          avgDuration: Math.round(avgDuration._avg.duration || 0),
        },
      })
    }

    return NextResponse.json({ error: 'Invalid tab' }, { status: 400 })
  } catch (error) {
    console.error('[Fleet Communications] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}

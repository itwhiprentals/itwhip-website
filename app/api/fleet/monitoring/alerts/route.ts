// app/api/fleet/monitoring/alerts/route.ts
// Alert management API - acknowledge, resolve, create alerts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

// Get alerts with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // active, acknowledged, resolved, all
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    const alerts = await prisma.monitoringAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length
    })

  } catch (error) {
    console.error('[Alerts API] GET Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

// Create a new alert (for testing or manual alerts)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, severity, title, message, source, metadata } = body

    if (!type || !severity || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, severity, title, message' },
        { status: 400 }
      )
    }

    const alert = await prisma.monitoringAlert.create({
      data: {
        type,
        severity,
        title,
        message,
        source: source || 'manual',
        metadata: metadata || {},
        status: 'active'
      }
    })

    return NextResponse.json({
      success: true,
      alert
    })

  } catch (error) {
    console.error('[Alerts API] POST Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

// Update alert (acknowledge, resolve)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, userId } = body

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, action' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'acknowledge':
        updateData = {
          status: 'acknowledged',
          acknowledgedAt: new Date(),
          acknowledgedBy: userId || 'fleet-admin'
        }
        break

      case 'resolve':
        updateData = {
          status: 'resolved',
          resolvedAt: new Date(),
          resolvedBy: userId || 'fleet-admin'
        }
        break

      case 'false_positive':
        updateData = {
          status: 'false_positive',
          resolvedAt: new Date(),
          resolvedBy: userId || 'fleet-admin'
        }
        break

      case 'reopen':
        updateData = {
          status: 'active',
          acknowledgedAt: null,
          acknowledgedBy: null,
          resolvedAt: null,
          resolvedBy: null
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: acknowledge, resolve, false_positive, reopen' },
          { status: 400 }
        )
    }

    const alert = await prisma.monitoringAlert.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      alert
    })

  } catch (error) {
    console.error('[Alerts API] PATCH Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}

// Delete alert
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing alert id' },
        { status: 400 }
      )
    }

    await prisma.monitoringAlert.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Alert deleted'
    })

  } catch (error) {
    console.error('[Alerts API] DELETE Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}

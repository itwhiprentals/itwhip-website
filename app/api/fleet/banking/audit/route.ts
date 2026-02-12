// app/api/fleet/banking/audit/route.ts
// Platform-wide Stripe Payment Intents audit trail

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/app/lib/stripe/client'

const FLEET_KEY = 'phoenix-fleet-2847'

function validateFleetKey(request: NextRequest): boolean {
  const key = request.headers.get('x-fleet-key') ||
              request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

export async function GET(request: NextRequest) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const days = parseInt(searchParams.get('days') || '30')
    const search = searchParams.get('search') || ''
    const startingAfter = searchParams.get('starting_after') || undefined

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startTimestamp = Math.floor(startDate.getTime() / 1000)

    // Fetch payment intents from Stripe (platform-wide)
    const listParams: any = {
      limit: 100,
      created: { gte: startTimestamp },
      expand: ['data.latest_charge'],
    }

    if (startingAfter) {
      listParams.starting_after = startingAfter
    }

    const paymentIntents = await stripe.paymentIntents.list(listParams)

    // Transform each payment intent
    const intents = paymentIntents.data.map(pi => {
      const charge = pi.latest_charge && typeof pi.latest_charge === 'object' ? pi.latest_charge : null
      const riskScore = (charge as any)?.outcome?.risk_score || null
      const riskLevel = (charge as any)?.outcome?.risk_level || null
      const radarRule = (charge as any)?.outcome?.rule || null

      return {
        id: pi.id,
        amount: pi.amount / 100,
        currency: pi.currency,
        status: pi.status,
        captureMethod: pi.capture_method,
        created: new Date(pi.created * 1000).toISOString(),
        canceledAt: pi.canceled_at ? new Date(pi.canceled_at * 1000).toISOString() : null,
        cancellationReason: pi.cancellation_reason,
        description: pi.description,
        customerId: typeof pi.customer === 'string' ? pi.customer : (pi.customer as any)?.id || null,
        paymentMethod: pi.payment_method && typeof pi.payment_method === 'object' ? {
          id: pi.payment_method.id,
          brand: (pi.payment_method as any).card?.brand || null,
          last4: (pi.payment_method as any).card?.last4 || null,
        } : pi.payment_method ? { id: pi.payment_method as string, brand: null, last4: null } : null,
        risk: riskScore !== null ? {
          score: riskScore,
          level: riskLevel,
          rule: radarRule?.id || null,
          action: radarRule?.action || null,
        } : null,
        metadata: pi.metadata || {},
        statusLabel: pi.status === 'requires_capture' ? 'Authorized'
          : pi.status === 'requires_action' ? 'Requires 3DS'
          : pi.status === 'requires_payment_method' ? 'Failed'
          : pi.status === 'canceled' ? 'Canceled'
          : pi.status === 'succeeded' ? 'Captured'
          : pi.status === 'processing' ? 'Processing'
          : pi.status,
        isActionable: pi.status === 'requires_capture',
      }
    })

    // Filter by status if specified
    const filtered = status === 'all' ? intents : intents.filter(pi => {
      if (status === 'authorized') return pi.status === 'requires_capture'
      if (status === 'captured') return pi.status === 'succeeded'
      if (status === 'canceled') return pi.status === 'canceled'
      if (status === 'failed') return pi.status === 'requires_payment_method' || pi.status === 'requires_action'
      return true
    })

    // Filter by search (PI ID)
    const results = search
      ? filtered.filter(pi => pi.id.toLowerCase().includes(search.toLowerCase()) || (pi.description || '').toLowerCase().includes(search.toLowerCase()))
      : filtered

    // Compute summary from ALL intents (before status filter)
    const summary = {
      total: intents.length,
      authorized: intents.filter(pi => pi.status === 'requires_capture').length,
      captured: intents.filter(pi => pi.status === 'succeeded').length,
      canceled: intents.filter(pi => pi.status === 'canceled').length,
      failed: intents.filter(pi => pi.status === 'requires_payment_method' || pi.status === 'requires_action').length,
      processing: intents.filter(pi => pi.status === 'processing').length,
      totalAuthorized: intents.filter(pi => pi.status === 'requires_capture').reduce((sum, pi) => sum + pi.amount, 0),
      totalCaptured: intents.filter(pi => pi.status === 'succeeded').reduce((sum, pi) => sum + pi.amount, 0),
      totalCanceled: intents.filter(pi => pi.status === 'canceled').reduce((sum, pi) => sum + pi.amount, 0),
    }

    return NextResponse.json({
      success: true,
      intents: results,
      summary,
      hasMore: paymentIntents.has_more,
      lastId: paymentIntents.data.length > 0 ? paymentIntents.data[paymentIntents.data.length - 1].id : null,
    })
  } catch (error) {
    console.error('[Fleet Banking Audit] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment intents' }, { status: 500 })
  }
}

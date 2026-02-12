// app/api/fleet/business-approvals/route.ts
// Fleet Business Host Approval Management API

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

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
    const status = searchParams.get('status') || 'all' // all, PENDING, APPROVED, REJECTED
    const search = searchParams.get('search') || ''

    const where: any = {
      isBusinessHost: true,
      businessApprovalStatus: { not: 'NONE' }
    }

    if (status !== 'all') {
      where.businessApprovalStatus = status
    }

    if (search) {
      where.OR = [
        { partnerCompanyName: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { partnerSlug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const hosts = await prisma.rentalHost.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        partnerCompanyName: true,
        businessName: true,
        partnerSlug: true,
        partnerLogo: true,
        profilePhoto: true,
        taxId: true,
        taxIdProvided: true,
        isBusinessHost: true,
        businessApprovalStatus: true,
        businessSubmittedAt: true,
        businessApprovedAt: true,
        businessApprovedBy: true,
        businessRejectedReason: true,
        emailVerified: true,
        phoneVerified: true,
        approvalStatus: true,
        enableRideshare: true,
        enableRentals: true,
        createdAt: true,
        _count: {
          select: {
            cars: { where: { isActive: true } }
          }
        }
      },
      orderBy: [
        { businessSubmittedAt: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Count by status
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.rentalHost.count({ where: { isBusinessHost: true, businessApprovalStatus: 'PENDING' } }),
      prisma.rentalHost.count({ where: { isBusinessHost: true, businessApprovalStatus: 'APPROVED' } }),
      prisma.rentalHost.count({ where: { isBusinessHost: true, businessApprovalStatus: 'REJECTED' } }),
    ])

    return NextResponse.json({
      success: true,
      hosts: hosts.map(h => ({
        ...h,
        companyName: h.partnerCompanyName || h.businessName || h.name,
        logo: h.partnerLogo || h.profilePhoto || null,
        activeVehicleCount: h._count.cars,
      })),
      counts: { pending: pendingCount, approved: approvedCount, rejected: rejectedCount },
      pendingCount,
    })
  } catch (error) {
    console.error('[Fleet Business Approvals] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch business approvals' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { hostId, action, reason } = body

    if (!hostId || !action) {
      return NextResponse.json({ error: 'hostId and action are required' }, { status: 400 })
    }

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        businessApprovalStatus: true,
        isBusinessHost: true,
      }
    })

    if (!host) {
      return NextResponse.json({ error: 'Host not found' }, { status: 404 })
    }

    if (action === 'approve') {
      await prisma.rentalHost.update({
        where: { id: hostId },
        data: {
          businessApprovalStatus: 'APPROVED',
          businessApprovedAt: new Date(),
          businessApprovedBy: 'fleet-admin',
          businessRejectedReason: null,
          approvalStatus: 'APPROVED',
        }
      })

      console.log(`[Fleet Business] Approved business host: ${host.name} (${host.email})`)

      return NextResponse.json({ success: true, status: 'APPROVED' })
    }

    if (action === 'reject') {
      if (!reason) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
      }

      await prisma.rentalHost.update({
        where: { id: hostId },
        data: {
          businessApprovalStatus: 'REJECTED',
          businessRejectedReason: reason,
          businessApprovedAt: null,
          businessApprovedBy: null,
        }
      })

      console.log(`[Fleet Business] Rejected business host: ${host.name} (${host.email}) — ${reason}`)

      return NextResponse.json({ success: true, status: 'REJECTED' })
    }

    if (action === 'revoke') {
      await prisma.rentalHost.update({
        where: { id: hostId },
        data: {
          businessApprovalStatus: 'NONE',
          businessApprovedAt: null,
          businessApprovedBy: null,
          businessRejectedReason: null,
        }
      })

      console.log(`[Fleet Business] Revoked business status: ${host.name} (${host.email})`)

      return NextResponse.json({ success: true, status: 'NONE' })
    }

    return NextResponse.json({ error: 'Invalid action. Use: approve, reject, revoke' }, { status: 400 })
  } catch (error) {
    console.error('[Fleet Business Approvals] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update business approval' }, { status: 500 })
  }
}

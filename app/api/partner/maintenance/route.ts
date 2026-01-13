// app/api/partner/maintenance/route.ts
// Partner Maintenance Management API

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  // Accept both partner_token AND hostAccessToken for unified portal
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    // Allow all host types since we've unified the portals
    if (!partner) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    const filter = searchParams.get('filter') || 'all' // all, due_soon, overdue

    // Get partner's vehicles
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true, make: true, model: true, year: true, currentMileage: true }
    })
    const vehicleIds = vehicles.map(v => v.id)
    const vehicleMap = new Map(vehicles.map(v => [v.id, v]))

    // Build where clause
    const where: any = {
      carId: { in: vehicleIds }
    }
    if (vehicleId) {
      where.carId = vehicleId
    }

    // Get all maintenance records
    const records = await prisma.vehicleServiceRecord.findMany({
      where,
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            currentMileage: true,
            photos: {
              select: {
                url: true
              },
              orderBy: [{ isHero: 'desc' }, { order: 'asc' }],
              take: 1
            }
          }
        }
      },
      orderBy: { serviceDate: 'desc' }
    })

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Format records with due status
    let formattedRecords = records.map(record => {
      const car = record.car
      const currentMileage = car?.currentMileage || 0

      // Determine due status
      let dueStatus: 'ok' | 'due_soon' | 'overdue' = 'ok'

      if (record.nextServiceDue) {
        if (new Date(record.nextServiceDue) < now) {
          dueStatus = 'overdue'
        } else if (new Date(record.nextServiceDue) < thirtyDaysFromNow) {
          dueStatus = 'due_soon'
        }
      }

      if (record.nextServiceMileage && currentMileage >= record.nextServiceMileage) {
        dueStatus = 'overdue'
      } else if (record.nextServiceMileage && currentMileage >= record.nextServiceMileage - 500) {
        dueStatus = dueStatus === 'overdue' ? 'overdue' : 'due_soon'
      }

      return {
        id: record.id,
        carId: record.carId,
        vehicleName: car ? `${car.year} ${car.make} ${car.model}` : 'Unknown',
        vehiclePhoto: car?.photos?.[0]?.url || null,
        serviceType: record.serviceType,
        serviceDate: record.serviceDate.toISOString(),
        mileageAtService: record.mileageAtService,
        nextServiceDue: record.nextServiceDue?.toISOString() || null,
        nextServiceMileage: record.nextServiceMileage,
        shopName: record.shopName,
        shopAddress: record.shopAddress,
        technicianName: record.technicianName,
        invoiceNumber: record.invoiceNumber,
        receiptUrl: record.receiptUrl,
        itemsServiced: record.itemsServiced,
        costTotal: record.costTotal,
        notes: record.notes,
        dueStatus,
        currentMileage
      }
    })

    // Apply filter
    if (filter === 'due_soon') {
      formattedRecords = formattedRecords.filter(r => r.dueStatus === 'due_soon')
    } else if (filter === 'overdue') {
      formattedRecords = formattedRecords.filter(r => r.dueStatus === 'overdue')
    }

    // Calculate stats
    const allRecordsForStats = records.map(record => {
      const car = vehicleMap.get(record.carId)
      const currentMileage = car?.currentMileage || 0

      let dueStatus: 'ok' | 'due_soon' | 'overdue' = 'ok'

      if (record.nextServiceDue) {
        if (new Date(record.nextServiceDue) < now) {
          dueStatus = 'overdue'
        } else if (new Date(record.nextServiceDue) < thirtyDaysFromNow) {
          dueStatus = 'due_soon'
        }
      }

      if (record.nextServiceMileage && currentMileage >= record.nextServiceMileage) {
        dueStatus = 'overdue'
      } else if (record.nextServiceMileage && currentMileage >= record.nextServiceMileage - 500) {
        dueStatus = dueStatus === 'overdue' ? 'overdue' : 'due_soon'
      }

      return { ...record, dueStatus }
    })

    const stats = {
      total: records.length,
      overdue: allRecordsForStats.filter(r => r.dueStatus === 'overdue').length,
      dueSoon: allRecordsForStats.filter(r => r.dueStatus === 'due_soon').length,
      upToDate: allRecordsForStats.filter(r => r.dueStatus === 'ok').length,
      totalCost: records.reduce((sum, r) => sum + (r.costTotal || 0), 0)
    }

    return NextResponse.json({
      success: true,
      records: formattedRecords,
      stats,
      vehicles: vehicles.map(v => ({
        id: v.id,
        name: `${v.year} ${v.make} ${v.model}`
      }))
    })

  } catch (error) {
    console.error('[Partner Maintenance] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch maintenance records' }, { status: 500 })
  }
}

// POST - Create new maintenance record
export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      carId,
      serviceType,
      serviceDate,
      mileageAtService,
      nextServiceDue,
      nextServiceMileage,
      shopName,
      shopAddress,
      technicianName,
      invoiceNumber,
      receiptUrl,
      itemsServiced,
      costTotal,
      notes
    } = body

    // Validate required fields
    if (!carId || !serviceType || !serviceDate || !mileageAtService || !shopName || !shopAddress || !receiptUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: carId, serviceType, serviceDate, mileageAtService, shopName, shopAddress, receiptUrl' },
        { status: 400 }
      )
    }

    // Verify car belongs to partner
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: partner.id
      }
    })

    if (!car) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Create maintenance record
    const record = await prisma.vehicleServiceRecord.create({
      data: {
        carId,
        serviceType,
        serviceDate: new Date(serviceDate),
        mileageAtService: parseInt(mileageAtService),
        nextServiceDue: nextServiceDue ? new Date(nextServiceDue) : null,
        nextServiceMileage: nextServiceMileage ? parseInt(nextServiceMileage) : null,
        shopName,
        shopAddress,
        technicianName: technicianName || null,
        invoiceNumber: invoiceNumber || null,
        receiptUrl,
        itemsServiced: itemsServiced || [],
        costTotal: parseFloat(costTotal) || 0,
        notes: notes || null,
        addedBy: partner.id,
        addedByType: 'PARTNER'
      }
    })

    // Update vehicle's current mileage if provided mileage is higher
    if (mileageAtService > (car.currentMileage || 0)) {
      await prisma.rentalCar.update({
        where: { id: carId },
        data: { currentMileage: parseInt(mileageAtService) }
      })
    }

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        serviceType: record.serviceType,
        serviceDate: record.serviceDate.toISOString()
      },
      message: 'Maintenance record created successfully'
    })

  } catch (error) {
    console.error('[Partner Maintenance] Create error:', error)
    return NextResponse.json({ error: 'Failed to create maintenance record' }, { status: 500 })
  }
}

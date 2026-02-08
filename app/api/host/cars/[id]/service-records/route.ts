// app/api/host/cars/[id]/service-records/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params

    console.log('🔧 ===== FETCHING SERVICE RECORDS FOR CAR:', carId, '=====')

    // Fetch vehicle
    const vehicle = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        currentMileage: true,
        lastOilChange: true,
        nextOilChangeDue: true,
        lastInspection: true,
        nextInspectionDue: true,
        serviceOverdue: true,
        inspectionExpired: true
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Fetch service records WITHOUT include (no relation exists!)
    const serviceRecords = await prisma.vehicleServiceRecord.findMany({
      where: { carId },
      orderBy: { serviceDate: 'desc' }
    })

    console.log(`📊 Found ${serviceRecords.length} service records`)

    // Get unique host IDs from addedBy string field
    const hostIds = [...new Set(
      serviceRecords
        .map(r => r.addedBy)
        .filter(id => id && id !== 'FLEET' && id !== 'SYSTEM')
    )]

    // Fetch hosts separately
    const hosts = await prisma.rentalHost.findMany({
      where: { id: { in: hostIds as string[] } },
      select: { id: true, name: true, email: true }
    })

    // Create host lookup map
    const hostMap = hosts.reduce((acc, host) => {
      acc[host.id] = host
      return acc
    }, {} as Record<string, { id: string; name: string; email: string }>)

    // Calculate statistics
    const totalCost = serviceRecords.reduce((sum, record) => sum + (record.costTotal || 0), 0)
    const serviceTypes = serviceRecords.reduce((acc, record) => {
      acc[record.serviceType] = (acc[record.serviceType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const now = new Date()
    const overdueServices: string[] = []

    if (vehicle.nextOilChangeDue && new Date(vehicle.nextOilChangeDue) < now) {
      overdueServices.push('Oil Change')
    }
    if (vehicle.nextInspectionDue && new Date(vehicle.nextInspectionDue) < now) {
      overdueServices.push('State Inspection')
    }

    const costByType = serviceRecords.reduce((acc, record) => {
      if (!acc[record.serviceType]) {
        acc[record.serviceType] = { total: 0, count: 0 }
      }
      acc[record.serviceType].total += record.costTotal || 0
      acc[record.serviceType].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    const averageCostByType = Object.entries(costByType).map(([type, data]) => ({
      type,
      averageCost: data.count > 0 ? Math.round(data.total / data.count) : 0,
      count: data.count
    }))

    const lastServiceDate = serviceRecords.length > 0 ? serviceRecords[0].serviceDate : null
    const daysSinceLastService = lastServiceDate
      ? Math.floor((now.getTime() - new Date(lastServiceDate).getTime()) / (1000 * 60 * 60 * 24))
      : null

    const upcomingServices = []
    
    if (vehicle.nextOilChangeDue) {
      const daysUntil = Math.ceil((new Date(vehicle.nextOilChangeDue).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      upcomingServices.push({
        type: 'Oil Change',
        dueDate: vehicle.nextOilChangeDue,
        daysUntil,
        isOverdue: daysUntil < 0,
        lastPerformed: vehicle.lastOilChange
      })
    }

    if (vehicle.nextInspectionDue) {
      const daysUntil = Math.ceil((new Date(vehicle.nextInspectionDue).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      upcomingServices.push({
        type: 'State Inspection',
        dueDate: vehicle.nextInspectionDue,
        daysUntil,
        isOverdue: daysUntil < 0,
        lastPerformed: vehicle.lastInspection
      })
    }

    const verifiedCount = serviceRecords.filter(r => r.verifiedByFleet).length
    const pendingCount = serviceRecords.filter(r => !r.verifiedByFleet).length

    // Format records with host names
    const formattedRecords = serviceRecords.map(record => {
      let addedByName = 'Unknown'
      let addedByType = 'UNKNOWN'
      
      if (!record.addedBy || record.addedBy === 'FLEET') {
        addedByName = 'Fleet Admin'
        addedByType = 'FLEET'
      } else if (record.addedBy === 'SYSTEM') {
        addedByName = 'System'
        addedByType = 'SYSTEM'
      } else if (hostMap[record.addedBy]) {
        addedByName = hostMap[record.addedBy].name
        addedByType = 'HOST'
      }

      return {
        id: record.id,
        serviceType: record.serviceType,
        serviceDate: record.serviceDate.toISOString(),
        description: (record as any).description,
        cost: record.costTotal,
        mileage: record.mileageAtService,
        performedBy: record.shopName,
        receiptUrl: record.receiptUrl,
        notes: record.notes,
        fleetVerified: record.verifiedByFleet,
        verifiedBy: record.verifiedBy,
        verifiedAt: record.verifiedAt?.toISOString() || null,
        addedBy: {
          type: addedByType,
          name: addedByName,
          id: record.addedBy
        },
        createdAt: record.createdAt.toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        currentMileage: vehicle.currentMileage,
        serviceOverdue: vehicle.serviceOverdue,
        inspectionExpired: vehicle.inspectionExpired
      },
      serviceRecords: formattedRecords,
      statistics: {
        totalRecords: serviceRecords.length,
        totalCost,
        verifiedCount,
        pendingCount,
        serviceTypeBreakdown: serviceTypes,
        averageCostByType,
        daysSinceLastService,
        overdueServices,
        upcomingServices
      }
    })

  } catch (error) {
    console.error('❌ Error fetching service records:', error)
    return NextResponse.json({ error: 'Failed to fetch service records' }, { status: 500 })
  }
}
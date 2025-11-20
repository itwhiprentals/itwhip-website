// app/api/host/cars/[id]/service/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { validateServiceRecord, formatValidationErrors } from '@/app/lib/service/service-validation'
import { calculateNextServiceDue } from '@/app/lib/service/calculate-next-service-due'
import { ServiceType } from '@prisma/client'

/**
 * GET /api/host/cars/[id]/service
 * List all service records for a vehicle
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const hostId = request.headers.get('x-host-id')

    if (!hostId) {
      return NextResponse.json(
        { error: 'Unauthorized - Host ID required' },
        { status: 401 }
      )
    }

    // Verify host owns this car
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: hostId
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found or access denied' },
        { status: 404 }
      )
    }

    // Fetch all service records for this car
    const serviceRecords = await prisma.vehicleServiceRecord.findMany({
      where: {
        carId: carId
      },
      orderBy: {
        serviceDate: 'desc'
      }
    })

    return NextResponse.json({
      serviceRecords,
      count: serviceRecords.length
    })
  } catch (error) {
    console.error('Error fetching service records:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/host/cars/[id]/service
 * Create a new service record
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const hostId = request.headers.get('x-host-id')

    if (!hostId) {
      return NextResponse.json(
        { error: 'Unauthorized - Host ID required' },
        { status: 401 }
      )
    }

    // Verify host owns this car
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: hostId
      },
      include: {
        serviceRecords: {
          orderBy: {
            serviceDate: 'desc'
          },
          take: 1
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found or access denied' },
        { status: 404 }
      )
    }

    // Check if car has active claim
    const activeClaim = await prisma.claim.findFirst({
      where: {
        carId: carId,
        status: {
          in: ['PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED']
        }
      }
    })

    if (activeClaim) {
      return NextResponse.json(
        { 
          error: 'Cannot add service records while vehicle has an active claim',
          reason: 'ACTIVE_CLAIM'
        },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Get previous service mileage for validation
    const previousServiceMileage = car.serviceRecords[0]?.mileageAtService || 0

    // Validate service record
    const validation = validateServiceRecord(
      body,
      car.currentMileage || undefined,
      previousServiceMileage
    )

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors,
          message: formatValidationErrors(validation.errors)
        },
        { status: 400 }
      )
    }

    // Calculate next service due if not provided manually
    let nextServiceDue = body.nextServiceDue
    let nextServiceMileage = body.nextServiceMileage

    if (!nextServiceDue && !nextServiceMileage) {
      const calculated = calculateNextServiceDue(
        body.serviceType as ServiceType,
        body.serviceDate,
        body.mileageAtService
      )
      nextServiceDue = calculated.nextServiceDue
      nextServiceMileage = calculated.nextServiceMileage
    }

    // Create service record
    const serviceRecord = await prisma.vehicleServiceRecord.create({
      data: {
        carId: carId,
        serviceType: body.serviceType as ServiceType,
        serviceDate: new Date(body.serviceDate),
        mileageAtService: parseInt(body.mileageAtService),
        nextServiceDue: nextServiceDue ? new Date(nextServiceDue) : null,
        nextServiceMileage: nextServiceMileage ? parseInt(nextServiceMileage) : null,
        shopName: body.shopName,
        shopAddress: body.shopAddress,
        technicianName: body.technicianName || null,
        invoiceNumber: body.invoiceNumber || null,
        receiptUrl: body.receiptUrl,
        inspectionReportUrl: body.inspectionReportUrl || null,
        itemsServiced: body.itemsServiced || [],
        costTotal: parseFloat(body.costTotal),
        notes: body.notes || null,
        verifiedByFleet: false
      }
    })

    // Update car's lastOdometerCheck and currentMileage if this is the most recent service
    const mostRecentService = await prisma.vehicleServiceRecord.findFirst({
      where: { carId },
      orderBy: { serviceDate: 'desc' }
    })

    if (mostRecentService && mostRecentService.id === serviceRecord.id) {
      await prisma.rentalCar.update({
        where: { id: carId },
        data: {
          lastOdometerCheck: serviceRecord.serviceDate,
          currentMileage: serviceRecord.mileageAtService
        }
      })
    }

    // Recalculate ESG scores for this vehicle
    try {
      const { calculateVehicleESG } = await import('@/app/lib/esg/calculate-vehicle-esg')
      const esgScores = await calculateVehicleESG(carId)
      
      await prisma.rentalCar.update({
        where: { id: carId },
        data: {
          esgScore: esgScores.esgScore,
          esgSafetyScore: esgScores.esgSafetyScore,
          esgEnvironmentalScore: esgScores.esgEnvironmentalScore,
          esgMaintenanceScore: esgScores.esgMaintenanceScore,
          esgLastCalculated: new Date()
        }
      })
    } catch (esgError) {
      console.error('Failed to recalculate ESG scores:', esgError)
      // Don't fail the request if ESG calculation fails
    }

    // Log activity
    console.log(`✅ Service record created: ${serviceRecord.id} for car ${carId} by host ${hostId}`)

    return NextResponse.json(
      {
        serviceRecord,
        message: 'Service record created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Error creating service record:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'A service record with these details already exists' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
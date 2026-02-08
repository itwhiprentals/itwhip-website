// app/api/host/cars/[id]/service/[serviceId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { validateServiceRecord } from '@/app/lib/service/service-validation'
import { calculateNextServiceDue } from '@/app/lib/service/calculate-next-service-due'
import { ServiceType } from '@prisma/client'

/**
 * GET /api/host/cars/:id/service/:serviceId
 * Get a single service record
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  try {
    const { id: carId, serviceId } = await params
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

    // Fetch service record
    const serviceRecord = await prisma.vehicleServiceRecord.findFirst({
      where: {
        id: serviceId,
        carId: carId
      }
    })

    if (!serviceRecord) {
      return NextResponse.json(
        { error: 'Service record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ serviceRecord })
  } catch (error) {
    console.error('Error fetching service record:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/host/cars/:id/service/:serviceId
 * Update a service record
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  try {
    const { id: carId, serviceId } = await params
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
        VehicleServiceRecord: {
          orderBy: {
            serviceDate: 'desc'
          },
          take: 2 // Get last 2 to find previous service
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found or access denied' },
        { status: 404 }
      )
    }

    // Fetch existing service record
    const existingRecord = await prisma.vehicleServiceRecord.findFirst({
      where: {
        id: serviceId,
        carId: carId
      }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Service record not found' },
        { status: 404 }
      )
    }

    // Check if record is verified by fleet
    if (existingRecord.verifiedByFleet) {
      return NextResponse.json(
        { 
          error: 'Cannot edit verified service records',
          reason: 'VERIFIED_BY_FLEET'
        },
        { status: 403 }
      )
    }

    // Check if car has active claim
    const activeClaim = await (prisma.claim.findFirst as any)({
      where: {
        booking: { carId: carId },
        status: {
          in: ['PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED']
        }
      }
    })

    if (activeClaim) {
      return NextResponse.json(
        { 
          error: 'Cannot edit service records while vehicle has an active claim',
          reason: 'ACTIVE_CLAIM'
        },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Get previous service mileage for validation (excluding current record)
    const carAny: any = car
    const previousServiceMileage = (carAny.VehicleServiceRecord || [])
      .filter((s: any) => s.id !== serviceId)
      .sort((a: any, b: any) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())[0]
      ?.mileageAtService || 0

    // Validate updated data
    const validation = validateServiceRecord(
      body,
      car.currentMileage || undefined,
      previousServiceMileage
    )

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    // Recalculate next service due if service type, date, or mileage changed
    let nextServiceDue: any = body.nextServiceDue
    let nextServiceMileage: any = body.nextServiceMileage

    if (
      body.serviceType !== existingRecord.serviceType ||
      body.serviceDate !== existingRecord.serviceDate.toISOString().split('T')[0] ||
      body.mileageAtService !== existingRecord.mileageAtService
    ) {
      if (!nextServiceDue && !nextServiceMileage) {
        const calculated = calculateNextServiceDue(
          body.serviceType as ServiceType,
          body.serviceDate,
          body.mileageAtService
        )
        nextServiceDue = calculated.nextServiceDue
        nextServiceMileage = calculated.nextServiceMileage
      }
    }

    // Update service record
    const updatedRecord = await prisma.vehicleServiceRecord.update({
      where: { id: serviceId },
      data: {
        serviceType: body.serviceType as ServiceType,
        serviceDate: new Date(body.serviceDate),
        mileageAtService: parseInt(body.mileageAtService),
        nextServiceDue: nextServiceDue ? new Date(nextServiceDue) : existingRecord.nextServiceDue,
        nextServiceMileage: nextServiceMileage ? parseInt(nextServiceMileage) : existingRecord.nextServiceMileage,
        shopName: body.shopName,
        shopAddress: body.shopAddress,
        technicianName: body.technicianName || null,
        invoiceNumber: body.invoiceNumber || null,
        receiptUrl: body.receiptUrl || existingRecord.receiptUrl,
        inspectionReportUrl: body.inspectionReportUrl || existingRecord.inspectionReportUrl,
        itemsServiced: body.itemsServiced || existingRecord.itemsServiced,
        costTotal: parseFloat(body.costTotal),
        notes: body.notes || null
      }
    })

    // Update car's lastOdometerCheck and currentMileage if this is the most recent service
    const mostRecentService = await prisma.vehicleServiceRecord.findFirst({
      where: { carId },
      orderBy: { serviceDate: 'desc' }
    })

    if (mostRecentService && mostRecentService.id === serviceId) {
      await prisma.rentalCar.update({
        where: { id: carId },
        data: {
          lastOdometerCheck: updatedRecord.serviceDate,
          currentMileage: updatedRecord.mileageAtService
        }
      })
    }

    // Recalculate ESG scores
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
    console.log(`✅ Service record updated: ${serviceId} for car ${carId} by host ${hostId}`)

    return NextResponse.json({
      serviceRecord: updatedRecord,
      message: 'Service record updated successfully'
    })
  } catch (error) {
    console.error('❌ Error updating service record:', error)
    
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

/**
 * DELETE /api/host/cars/:id/service/:serviceId
 * Delete a service record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  try {
    const { id: carId, serviceId } = await params
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

    // Fetch existing service record
    const existingRecord = await prisma.vehicleServiceRecord.findFirst({
      where: {
        id: serviceId,
        carId: carId
      }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Service record not found' },
        { status: 404 }
      )
    }

    // Check if record is verified by fleet
    if (existingRecord.verifiedByFleet) {
      return NextResponse.json(
        { 
          error: 'Cannot delete verified service records. Contact fleet administrator.',
          reason: 'VERIFIED_BY_FLEET'
        },
        { status: 403 }
      )
    }

    // Check if car has active claim
    const activeClaim = await (prisma.claim.findFirst as any)({
      where: {
        booking: { carId: carId },
        status: {
          in: ['PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED']
        }
      }
    })

    if (activeClaim) {
      return NextResponse.json(
        { 
          error: 'Cannot delete service records while vehicle has an active claim',
          reason: 'ACTIVE_CLAIM'
        },
        { status: 403 }
      )
    }

    // Delete service record
    await prisma.vehicleServiceRecord.delete({
      where: { id: serviceId }
    })

    // Update car's lastOdometerCheck if we deleted the most recent service
    const remainingServices = await prisma.vehicleServiceRecord.findMany({
      where: { carId },
      orderBy: { serviceDate: 'desc' },
      take: 1
    })

    if (remainingServices.length > 0) {
      await prisma.rentalCar.update({
        where: { id: carId },
        data: {
          lastOdometerCheck: remainingServices[0].serviceDate,
          currentMileage: remainingServices[0].mileageAtService
        }
      })
    } else {
      // No services left, clear last odometer check
      await prisma.rentalCar.update({
        where: { id: carId },
        data: {
          lastOdometerCheck: null
        }
      })
    }

    // Recalculate ESG scores
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
    console.log(`🗑️ Service record deleted: ${serviceId} for car ${carId} by host ${hostId}`)

    return NextResponse.json({
      message: 'Service record deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting service record:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
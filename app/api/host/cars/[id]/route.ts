// app/api/host/cars/[id]/route.ts - ENHANCED WITH ACTIVITY LOGGING

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  
  if (!hostId) {
    return null
  }

  const host = await prisma.rentalHost.findUnique({
    where: { id: hostId },
    select: {
      id: true,
      name: true,
      email: true,
      approvalStatus: true,
      canEditCalendar: true,
      minDailyRate: true,
      maxDailyRate: true,
      // Insurance fields
      insuranceActive: true,
      insuranceType: true,
      insurancePolicyNumber: true,
      hostInsuranceProvider: true,
      hostInsuranceStatus: true,
      hostInsuranceExpires: true,
      commercialInsuranceActive: true,
      commercialInsuranceProvider: true,
      commercialInsuranceStatus: true,
      commercialInsuranceExpires: true,
      p2pInsuranceActive: true,
      p2pInsuranceProvider: true,
      p2pInsuranceStatus: true,
      p2pInsuranceExpires: true,
    }
  })

  return host
}

// Helper to check for active claims
async function checkActiveClaims(carId: string) {
  const activeClaims = await prisma.claim.findMany({
    where: {
      booking: {
        carId: carId
      },
      status: {
        in: ['PENDING', 'UNDER_REVIEW']
      }
    },
    include: {
      booking: {
        select: {
          bookingCode: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return {
    hasActiveClaims: activeClaims.length > 0,
    claimCount: activeClaims.length,
    claims: activeClaims,
    mostRecentClaim: activeClaims[0] || null
  }
}

// Helper to track field changes (with proper Date comparison)
function detectChanges(oldData: any, newData: any, fields: string[]) {
  const changes: {
    updated: string[]
    oldValues: Record<string, any>
    newValues: Record<string, any>
  } = {
    updated: [],
    oldValues: {},
    newValues: {}
  }

  for (const field of fields) {
    if (newData[field] !== undefined) {
      const oldVal = oldData[field]
      const newVal = newData[field]
      
      // Handle Date comparison properly
      let changed = false
      if (newVal instanceof Date && oldVal instanceof Date) {
        changed = newVal.getTime() !== oldVal.getTime()
      } else if (newVal instanceof Date || oldVal instanceof Date) {
        changed = true
      } else {
        changed = oldVal !== newVal
      }
      
      if (changed) {
        changes.updated.push(field)
        changes.oldValues[field] = oldVal
        changes.newValues[field] = newVal
      }
    }
  }

  return changes
}

// Helper to create detailed activity log
async function logVehicleActivity(params: {
  carId: string
  hostId: string
  hostName: string
  action: string
  category: string
  changes?: {
    updated: string[]
    oldValues: Record<string, any>
    newValues: Record<string, any>
  }
  metadata?: Record<string, any>
}) {
  const { carId, hostId, hostName, action, category, changes, metadata } = params

  const highSeverityActions = ['VEHICLE_DELETED', 'UPDATE_PRICING', 'VEHICLE_ACTIVATED', 'VEHICLE_DEACTIVATED']
  const severity = highSeverityActions.includes(action) ? 'HIGH' : 'INFO'

  try {
    await prisma.activityLog.create({
      data: {
        entityType: 'CAR',
        entityId: carId,
        hostId: hostId,
        action: action,
        category: category,
        severity: severity,
        oldValue: changes?.oldValues ? JSON.stringify(changes.oldValues) : null,
        newValue: changes?.newValues ? JSON.stringify(changes.newValues) : null,
        metadata: metadata ? JSON.stringify({
          ...metadata,
          hostName,
          timestamp: new Date().toISOString()
        }) : JSON.stringify({
          hostName,
          timestamp: new Date().toISOString()
        }),
        createdAt: new Date()
      }
    })
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}

// GET - Fetch single car details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔍 Fetching car:', carId, 'for host:', host.id)

    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    const [photos, bookings, availability, reviews, claimInfo] = await Promise.all([
      prisma.rentalCarPhoto.findMany({
        where: { carId },
        orderBy: { order: 'asc' }
      }),
      prisma.rentalBooking.findMany({
        where: {
          carId,
          status: {
            in: ['CONFIRMED', 'ACTIVE']
          },
          startDate: {
            gte: new Date()
          }
        },
        select: {
          id: true,
          startDate: true,
          endDate: true
        }
      }),
      prisma.rentalAvailability.findMany({
        where: {
          carId,
          date: {
            gte: new Date()
          }
        },
        orderBy: {
          date: 'asc'
        }
      }),
      prisma.rentalReview.findMany({
        where: { carId },
        select: {
          rating: true
        }
      }),
      checkActiveClaims(carId)
    ])

    const avgRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0

    const features = car.features ? JSON.parse(car.features as string) : []
    const rules = car.rules ? JSON.parse(car.rules as string) : []

    return NextResponse.json({
      success: true,
      car: JSON.parse(JSON.stringify({
        ...car,
        features,
        rules,
        photos,
        bookings,
        availability,
        reviews,
        avgRating: parseFloat(avgRating.toFixed(1)),
        upcomingBookings: bookings.length,
        hasActiveClaim: claimInfo.hasActiveClaims,
        activeClaimCount: claimInfo.claimCount,
        activeClaim: claimInfo.mostRecentClaim ? {
          id: claimInfo.mostRecentClaim.id,
          type: claimInfo.mostRecentClaim.type,
          status: claimInfo.mostRecentClaim.status,
          createdAt: claimInfo.mostRecentClaim.createdAt.toISOString(),
          bookingCode: claimInfo.mostRecentClaim.booking.bookingCode
        } : null,
        // Host approval status for locking availability options
        hostApprovalStatus: host.approvalStatus,
        // Host-level insurance
        hostInsurance: {
          insuranceActive: host.insuranceActive,
          insuranceType: host.insuranceType,
          insurancePolicyNumber: host.insurancePolicyNumber,
          hostInsuranceProvider: host.hostInsuranceProvider,
          hostInsuranceStatus: host.hostInsuranceStatus,
          hostInsuranceExpires: host.hostInsuranceExpires?.toISOString() || null,
          commercialInsuranceActive: host.commercialInsuranceActive,
          commercialInsuranceProvider: host.commercialInsuranceProvider,
          commercialInsuranceStatus: host.commercialInsuranceStatus,
          commercialInsuranceExpires: host.commercialInsuranceExpires?.toISOString() || null,
          p2pInsuranceActive: host.p2pInsuranceActive,
          p2pInsuranceProvider: host.p2pInsuranceProvider,
          p2pInsuranceStatus: host.p2pInsuranceStatus,
          p2pInsuranceExpires: host.p2pInsuranceExpires?.toISOString() || null,
        }
      }))
    })

  } catch (error) {
    console.error('❌ Error fetching car:', error)
    return NextResponse.json(
      { error: 'Failed to fetch car details' },
      { status: 500 }
    )
  }
}

// PUT - Update car details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (host.approvalStatus === 'REJECTED') {
      return NextResponse.json(
        { error: 'Your host application has been rejected' },
        { status: 403 }
      )
    }

    if (host.approvalStatus === 'APPROVED' && !host.canEditCalendar) {
      return NextResponse.json(
        { error: 'You do not have permission to edit cars' },
        { status: 403 }
      )
    }

    const claimInfo = await checkActiveClaims(carId)
    
    if (claimInfo.hasActiveClaims) {
      return NextResponse.json({
        error: 'Cannot modify vehicle while claim is active',
        reason: 'ACTIVE_CLAIM',
        claimCount: claimInfo.claimCount,
        activeClaim: {
          id: claimInfo.mostRecentClaim!.id,
          type: claimInfo.mostRecentClaim!.type,
          status: claimInfo.mostRecentClaim!.status,
          bookingCode: claimInfo.mostRecentClaim!.booking.bookingCode
        }
      }, { status: 403 })
    }

    const body = await request.json()

    const existingCar = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id
      }
    })

    if (!existingCar) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    // Server-side validation: Reject changes to locked fields for approved vehicles
    const isCarApproved = existingCar.status === 'APPROVED'
    if (isCarApproved) {
      const lockedFields = ['make', 'model', 'year', 'color', 'vin', 'licensePlate', 'registrationState']
      const attemptedLockedChanges: string[] = []

      for (const field of lockedFields) {
        if (body[field] !== undefined && body[field] !== (existingCar as any)[field]) {
          attemptedLockedChanges.push(field)
        }
      }

      if (attemptedLockedChanges.length > 0) {
        return NextResponse.json({
          error: 'Cannot modify locked fields after vehicle approval',
          reason: 'FIELDS_LOCKED',
          lockedFields: attemptedLockedChanges,
          message: `The following fields cannot be changed after vehicle approval: ${attemptedLockedChanges.join(', ')}. Contact support if you need to make changes.`
        }, { status: 403 })
      }
    }

    let activationNote: string | null = null
    if (host.approvalStatus !== 'APPROVED') {
      if (body.isActive === true) {
        console.log('📋 PENDING host tried to activate car - silently keeping inactive')
        activationNote = 'Your listing has been saved! It will go live once your account is approved.'
      }
      body.isActive = false
    }

    if (body.dailyRate !== undefined) {
      if (host.minDailyRate !== null && host.minDailyRate !== undefined && 
          body.dailyRate < host.minDailyRate) {
        return NextResponse.json(
          { error: `Daily rate cannot be less than $${host.minDailyRate}` },
          { status: 400 }
        )
      }
      if (host.maxDailyRate !== null && host.maxDailyRate !== undefined && 
          body.dailyRate > host.maxDailyRate) {
        return NextResponse.json(
          { error: `Daily rate cannot exceed $${host.maxDailyRate}` },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    // Car details
    if (body.make !== undefined) updateData.make = body.make
    if (body.model !== undefined) updateData.model = body.model
    if (body.year !== undefined) updateData.year = body.year
    if (body.trim !== undefined) updateData.trim = body.trim
    if (body.color !== undefined) updateData.color = body.color
    if (body.licensePlate !== undefined) updateData.licensePlate = body.licensePlate
    if (body.vin !== undefined) updateData.vin = body.vin
    if (body.description !== undefined) updateData.description = body.description
    
    // Specifications
    if (body.carType !== undefined) updateData.carType = body.carType
    if (body.seats !== undefined) updateData.seats = body.seats
    if (body.doors !== undefined) updateData.doors = body.doors
    if (body.transmission !== undefined) updateData.transmission = body.transmission
    if (body.fuelType !== undefined) updateData.fuelType = body.fuelType
    if (body.mpgCity !== undefined) updateData.mpgCity = body.mpgCity
    if (body.mpgHighway !== undefined) updateData.mpgHighway = body.mpgHighway
    if (body.currentMileage !== undefined) updateData.currentMileage = body.currentMileage
    
    // Pricing
    if (body.dailyRate !== undefined) updateData.dailyRate = body.dailyRate
    if (body.weeklyRate !== undefined) updateData.weeklyRate = body.weeklyRate
    if (body.monthlyRate !== undefined) updateData.monthlyRate = body.monthlyRate
    if (body.weeklyDiscount !== undefined) updateData.weeklyDiscount = body.weeklyDiscount
    if (body.monthlyDiscount !== undefined) updateData.monthlyDiscount = body.monthlyDiscount
    
    // Delivery fees
    if (body.airportFee !== undefined) updateData.airportFee = body.airportFee
    if (body.hotelFee !== undefined) updateData.hotelFee = body.hotelFee
    if (body.homeFee !== undefined) updateData.homeFee = body.homeFee
    if (body.deliveryRadius !== undefined) updateData.deliveryRadius = body.deliveryRadius
    if (body.freeDeliveryRadius !== undefined) updateData.freeDeliveryRadius = body.freeDeliveryRadius
    if (body.deliveryInstructions !== undefined) updateData.deliveryInstructions = body.deliveryInstructions
    
    // Features and rules
    if (body.features !== undefined) {
      updateData.features = JSON.stringify(body.features)
    }
    if (body.rules !== undefined) {
      updateData.rules = JSON.stringify(body.rules)
    }
    
    // Location
    if (body.address !== undefined) updateData.address = body.address
    if (body.city !== undefined) updateData.city = body.city
    if (body.state !== undefined) updateData.state = body.state
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode
    if (body.latitude !== undefined) updateData.latitude = body.latitude
    if (body.longitude !== undefined) updateData.longitude = body.longitude
    
    // Delivery options
    if (body.airportPickup !== undefined) updateData.airportPickup = body.airportPickup
    if (body.hotelDelivery !== undefined) updateData.hotelDelivery = body.hotelDelivery
    if (body.homeDelivery !== undefined) updateData.homeDelivery = body.homeDelivery
    
    // Handle isActive
    if (body.isActive !== undefined) {
      if (host.approvalStatus === 'APPROVED') {
        updateData.isActive = body.isActive
      } else {
        updateData.isActive = false
      }
    }
    
    // Availability settings
    if (body.instantBook !== undefined) updateData.instantBook = body.instantBook
    if (body.advanceNotice !== undefined) updateData.advanceNotice = body.advanceNotice
    if (body.minTripDuration !== undefined) updateData.minTripDuration = body.minTripDuration
    if (body.maxTripDuration !== undefined) updateData.maxTripDuration = body.maxTripDuration
    
    // Trip settings
    if (body.bufferTime !== undefined) updateData.bufferTime = body.bufferTime
    if (body.cancellationPolicy !== undefined) updateData.cancellationPolicy = body.cancellationPolicy
    if (body.checkInTime !== undefined) updateData.checkInTime = body.checkInTime
    if (body.checkOutTime !== undefined) updateData.checkOutTime = body.checkOutTime
    
    // Mileage settings
    if (body.mileageDaily !== undefined) updateData.mileageDaily = body.mileageDaily
    if (body.mileageWeekly !== undefined) updateData.mileageWeekly = body.mileageWeekly
    if (body.mileageMonthly !== undefined) updateData.mileageMonthly = body.mileageMonthly
    if (body.mileageOverageFee !== undefined) updateData.mileageOverageFee = body.mileageOverageFee
    
    // Insurance
    if (body.insuranceIncluded !== undefined) updateData.insuranceIncluded = body.insuranceIncluded
    if (body.insuranceDaily !== undefined) updateData.insuranceDaily = body.insuranceDaily
    
    // Registration date
    if (body.registrationExpiryDate !== undefined) {
      if (!body.registrationExpiryDate) {
        updateData.registrationExpiryDate = null
      } else {
        const d = new Date(body.registrationExpiryDate)
        if (!Number.isNaN(d.getTime())) {
          updateData.registrationExpiryDate = d
        } else {
          return NextResponse.json(
            { error: 'Invalid registration expiry date format' },
            { status: 400 }
          )
        }
      }
    }
    
    if (body.registrationState !== undefined) updateData.registrationState = body.registrationState
    if (body.titleStatus !== undefined) updateData.titleStatus = body.titleStatus
    if (body.registeredOwner !== undefined) updateData.registeredOwner = body.registeredOwner
    if (body.estimatedValue !== undefined) updateData.estimatedValue = body.estimatedValue
    if (body.annualMileage !== undefined) updateData.annualMileage = body.annualMileage
    if (body.primaryUse !== undefined) updateData.primaryUse = body.primaryUse
    
    // Garage Location
    if (body.garageAddress !== undefined) updateData.garageAddress = body.garageAddress
    if (body.garageCity !== undefined) updateData.garageCity = body.garageCity
    if (body.garageState !== undefined) updateData.garageState = body.garageState
    if (body.garageZip !== undefined) updateData.garageZip = body.garageZip
    
    // Lien Information
    if (body.hasLien !== undefined) updateData.hasLien = body.hasLien
    if (body.lienholderName !== undefined) updateData.lienholderName = body.lienholderName
    if (body.lienholderAddress !== undefined) updateData.lienholderAddress = body.lienholderAddress
    
    // Safety Features
    if (body.hasAlarm !== undefined) updateData.hasAlarm = body.hasAlarm
    if (body.hasTracking !== undefined) updateData.hasTracking = body.hasTracking
    if (body.hasImmobilizer !== undefined) updateData.hasImmobilizer = body.hasImmobilizer
    
    // Modifications
    if (body.isModified !== undefined) updateData.isModified = body.isModified
    if (body.modifications !== undefined) updateData.modifications = body.modifications

    console.log('🔧 Update data:', JSON.stringify(updateData, null, 2))
    
    // Activity Logging - Pricing Changes
    const pricingFields = ['dailyRate', 'weeklyRate', 'monthlyRate', 'weeklyDiscount', 'monthlyDiscount']
    const pricingChanges = detectChanges(existingCar, updateData, pricingFields)
    if (pricingChanges.updated.length > 0) {
      await logVehicleActivity({
        carId,
        hostId: host.id,
        hostName: host.name || host.email,
        action: 'UPDATE_PRICING',
        category: 'VEHICLE',
        changes: pricingChanges,
        metadata: {
          fields: pricingChanges.updated,
          priceChange: updateData.dailyRate !== undefined ? updateData.dailyRate - existingCar.dailyRate : 0
        }
      })
    }

    // Activity Logging - Availability Changes
    const availabilityFields = ['instantBook', 'advanceNotice', 'minTripDuration', 'maxTripDuration']
    const availabilityChanges = detectChanges(existingCar, updateData, availabilityFields)
    if (availabilityChanges.updated.length > 0) {
      await logVehicleActivity({
        carId,
        hostId: host.id,
        hostName: host.name || host.email,
        action: 'UPDATE_AVAILABILITY',
        category: 'VEHICLE',
        changes: availabilityChanges,
        metadata: { fields: availabilityChanges.updated }
      })
    }

    // Activity Logging - Delivery Changes
    const deliveryFields = ['airportPickup', 'hotelDelivery', 'homeDelivery', 'airportFee', 'hotelFee', 'homeFee', 'deliveryRadius']
    const deliveryChanges = detectChanges(existingCar, updateData, deliveryFields)
    if (deliveryChanges.updated.length > 0) {
      await logVehicleActivity({
        carId,
        hostId: host.id,
        hostName: host.name || host.email,
        action: 'UPDATE_DELIVERY',
        category: 'VEHICLE',
        changes: deliveryChanges,
        metadata: { fields: deliveryChanges.updated }
      })
    }

    // Activity Logging - Features Changes
    if (body.features !== undefined) {
      const oldFeatures = existingCar.features ? JSON.parse(existingCar.features as string) : []
      const newFeatures = body.features
      const added = newFeatures.filter((f: string) => !oldFeatures.includes(f))
      const removed = oldFeatures.filter((f: string) => !newFeatures.includes(f))
      
      if (added.length > 0 || removed.length > 0) {
        await logVehicleActivity({
          carId,
          hostId: host.id,
          hostName: host.name || host.email,
          action: 'UPDATE_FEATURES',
          category: 'VEHICLE',
          changes: {
            updated: ['features'],
            oldValues: { features: oldFeatures },
            newValues: { features: newFeatures }
          },
          metadata: { added, removed }
        })
      }
    }

    // Activity Logging - Registration Changes
    const registrationFields = ['registrationState', 'registrationExpiryDate', 'titleStatus', 'registeredOwner', 'vin', 'licensePlate']
    const registrationChanges = detectChanges(existingCar, updateData, registrationFields)
    if (registrationChanges.updated.length > 0) {
      await logVehicleActivity({
        carId,
        hostId: host.id,
        hostName: host.name || host.email,
        action: 'UPDATE_REGISTRATION',
        category: 'DOCUMENT',
        changes: registrationChanges,
        metadata: { fields: registrationChanges.updated }
      })
    }

    // Activity Logging - Description Changes
    if (body.description !== undefined && existingCar.description !== body.description) {
      await logVehicleActivity({
        carId,
        hostId: host.id,
        hostName: host.name || host.email,
        action: 'UPDATE_DESCRIPTION',
        category: 'VEHICLE',
        changes: {
          updated: ['description'],
          oldValues: { description: existingCar.description },
          newValues: { description: body.description }
        },
        metadata: { 
          oldLength: existingCar.description?.length || 0,
          newLength: body.description?.length || 0
        }
      })
    }

    // Update car
    const updatedCar = await prisma.rentalCar.update({
      where: { id: carId },
      data: updateData
    })

    // Fetch photos
    const photos = await prisma.rentalCarPhoto.findMany({
      where: { carId },
      orderBy: { order: 'asc' }
    })

    const features = updatedCar.features ? JSON.parse(updatedCar.features as string) : []
    const rules = updatedCar.rules ? JSON.parse(updatedCar.rules as string) : []

    const serializedCar = {
      ...updatedCar,
      registrationExpiryDate: updatedCar.registrationExpiryDate?.toISOString() || null,
      insuranceExpiryDate: updatedCar.insuranceExpiryDate?.toISOString() || null,
      createdAt: updatedCar.createdAt.toISOString(),
      updatedAt: updatedCar.updatedAt.toISOString(),
      features,
      rules,
      photos
    }

    return NextResponse.json({
      success: true,
      car: serializedCar,
      message: activationNote || 'Car details updated successfully!',
      pendingActivation: host.approvalStatus !== 'APPROVED'
    })

  } catch (error) {
    console.error('Error updating car:', error)
    return NextResponse.json(
      { error: 'Failed to update car' },
      { status: 500 }
    )
  }
}

// PATCH - Toggle car active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (host.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { 
          error: 'Your account must be approved to activate vehicles',
          message: 'Complete your listing now - it will go live once approved!',
          approvalStatus: host.approvalStatus
        },
        { status: 403 }
      )
    }

    if (!host.canEditCalendar) {
      return NextResponse.json(
        { error: 'You do not have permission to activate/deactivate vehicles' },
        { status: 403 }
      )
    }

    const { isActive } = await request.json()

    if (isActive === true) {
      const claimInfo = await checkActiveClaims(carId)
      
      if (claimInfo.hasActiveClaims) {
        return NextResponse.json({
          error: 'Cannot activate vehicle with active claim',
          reason: 'ACTIVE_CLAIM',
          message: 'Vehicle cannot be activated while a claim is pending.',
          claimCount: claimInfo.claimCount,
          activeClaim: {
            id: claimInfo.mostRecentClaim!.id,
            type: claimInfo.mostRecentClaim!.type,
            status: claimInfo.mostRecentClaim!.status,
            bookingCode: claimInfo.mostRecentClaim!.booking.bookingCode
          }
        }, { status: 403 })
      }
    }

    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id
      },
      include: {
        bookings: {
          where: {
            status: 'CONFIRMED',
            startDate: {
              gte: new Date()
            }
          }
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    if (!isActive && car.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot deactivate car with active bookings' },
        { status: 400 }
      )
    }

    const updatedCar = await prisma.rentalCar.update({
      where: { id: carId },
      data: { isActive }
    })

    await logVehicleActivity({
      carId,
      hostId: host.id,
      hostName: host.name || host.email,
      action: isActive ? 'VEHICLE_ACTIVATED' : 'VEHICLE_DEACTIVATED',
      category: 'VEHICLE',
      metadata: {
        carInfo: `${car.year} ${car.make} ${car.model}`
      }
    })

    if (!isActive) {
      await prisma.adminNotification.create({
        data: {
          type: 'CAR_DEACTIVATED',
          title: 'Car Deactivated',
          message: `Host ${host.name || host.email} deactivated car: ${car.year} ${car.make} ${car.model}`,
          priority: 'LOW',
          status: 'UNREAD',
          relatedId: carId,
          relatedType: 'CAR'
        }
      })
    }

    return NextResponse.json({
      success: true,
      car: updatedCar
    })

  } catch (error) {
    console.error('Error toggling car status:', error)
    return NextResponse.json(
      { error: 'Failed to update car status' },
      { status: 500 }
    )
  }
}

// DELETE - Delete car
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const claimInfo = await checkActiveClaims(carId)
    
    if (claimInfo.hasActiveClaims) {
      return NextResponse.json({
        error: 'Cannot delete vehicle with active claim',
        reason: 'ACTIVE_CLAIM',
        message: 'Vehicle cannot be deleted while a claim is pending.',
        claimCount: claimInfo.claimCount
      }, { status: 403 })
    }

    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId: host.id
      },
      include: {
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'ACTIVE']
            }
          }
        },
        photos: true
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    if (car.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete car with active bookings' },
        { status: 400 }
      )
    }

    const historicalBookings = await prisma.rentalBooking.count({
      where: {
        carId,
        status: { in: ['COMPLETED', 'CANCELLED', 'EXPIRED', 'NO_SHOW'] }
      }
    })

    if (historicalBookings > 0) {
      await prisma.rentalCar.update({
        where: { id: carId },
        data: { 
          isActive: false,
          updatedAt: new Date()
        }
      })

      await logVehicleActivity({
        carId,
        hostId: host.id,
        hostName: host.name || host.email,
        action: 'VEHICLE_DEACTIVATED',
        category: 'VEHICLE',
        metadata: {
          reason: 'soft_delete_has_history',
          historicalBookings
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Car deactivated (has booking history)'
      })
    }

    // Hard delete
    await prisma.rentalCarPhoto.deleteMany({
      where: { carId }
    })

    await prisma.rentalAvailability.deleteMany({
      where: { carId }
    })

    await prisma.rentalReview.deleteMany({
      where: { carId }
    })

    await prisma.rentalCar.delete({
      where: { id: carId }
    })

    await logVehicleActivity({
      carId,
      hostId: host.id,
      hostName: host.name || host.email,
      action: 'VEHICLE_DELETED',
      category: 'VEHICLE',
      metadata: {
        carInfo: `${car.year} ${car.make} ${car.model}`,
        reason: 'hard_delete_no_history'
      }
    })

    await prisma.adminNotification.create({
      data: {
        type: 'CAR_DELETED',
        title: 'Car Deleted',
        message: `Host ${host.name || host.email} deleted car: ${car.year} ${car.make} ${car.model}`,
        priority: 'MEDIUM',
        status: 'UNREAD',
        relatedId: carId,
        relatedType: 'CAR',
        metadata: {
          hostId: host.id,
          carDetails: {
            make: car.make,
            model: car.model,
            year: car.year
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Car deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting car:', error)
    return NextResponse.json(
      { error: 'Failed to delete car' },
      { status: 500 }
    )
  }
}
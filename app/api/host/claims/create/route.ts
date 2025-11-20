// app/api/host/claims/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendClaimFiledNotifications } from '@/app/lib/services/claimEmailService'
import { handleClaimFiled } from '@/app/lib/esg/event-hooks'

// POST /api/host/claims/create - Create insurance claim with FNOL data
export async function POST(request: NextRequest) {
  try {
    // Get host info from middleware headers
    const hostId = request.headers.get('x-host-id')
    const isApproved = request.headers.get('x-host-approved') === 'true'

    if (!hostId) {
      return NextResponse.json(
        { error: 'Unauthorized - Host ID not found' },
        { status: 401 }
      )
    }

    // Check if host is approved
    if (!isApproved) {
      return NextResponse.json(
        { 
          error: 'Only approved hosts can file insurance claims',
          action: 'create_insurance_claim',
          requiresApproval: true
        },
        { status: 403 }
      )
    }

    // ============================================================================
    // 🔒 COMPLIANCE: Extract Request Context for Audit Trail
    // ============================================================================
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || request.headers.get('x-real-ip') 
      || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Parse request body
    const body = await request.json()
    const {
      bookingId,
      type,
      description,
      incidentDate,
      estimatedCost,
      damagePhotos,
      deactivateVehicle, // ⚠️ DEPRECATED: Keep for backward compatibility but ignore
      carId,
      incidentLocation,
      fnolData
    } = body

    // ============================================================================
    // BASIC VALIDATIONS
    // ============================================================================
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    if (!type || !['ACCIDENT', 'THEFT', 'VANDALISM', 'CLEANING', 'MECHANICAL', 'WEATHER', 'OTHER'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid claim type. Must be: ACCIDENT, THEFT, VANDALISM, CLEANING, MECHANICAL, WEATHER, or OTHER' },
        { status: 400 }
      )
    }

    if (!description || description.trim().length < 20) {
      return NextResponse.json(
        { error: 'Description must be at least 20 characters' },
        { status: 400 }
      )
    }

    if (!incidentDate) {
      return NextResponse.json(
        { error: 'Incident date is required' },
        { status: 400 }
      )
    }

    // ============================================================================
    // INCIDENT LOCATION VALIDATIONS
    // ============================================================================
    
    if (!incidentLocation) {
      return NextResponse.json(
        { error: 'Incident location is required' },
        { status: 400 }
      )
    }

    if (!incidentLocation.address || !incidentLocation.address.trim()) {
      return NextResponse.json(
        { error: 'Incident address is required' },
        { status: 400 }
      )
    }

    if (!incidentLocation.city || !incidentLocation.city.trim()) {
      return NextResponse.json(
        { error: 'Incident city is required' },
        { status: 400 }
      )
    }

    if (!incidentLocation.state) {
      return NextResponse.json(
        { error: 'Incident state is required' },
        { status: 400 }
      )
    }

    if (!incidentLocation.zipCode || !incidentLocation.zipCode.trim()) {
      return NextResponse.json(
        { error: 'Incident ZIP code is required' },
        { status: 400 }
      )
    }

    // Validate ZIP code format
    if (!/^\d{5}(-\d{4})?$/.test(incidentLocation.zipCode)) {
      return NextResponse.json(
        { error: 'Invalid ZIP code format' },
        { status: 400 }
      )
    }

    // ============================================================================
    // FNOL DATA VALIDATIONS
    // ============================================================================
    
    if (!fnolData) {
      return NextResponse.json(
        { error: 'FNOL data is required. Please complete all incident details.' },
        { status: 400 }
      )
    }

    // Vehicle Condition Validations
    if (fnolData.odometerAtIncident === undefined || fnolData.odometerAtIncident === null) {
      return NextResponse.json(
        { error: 'Odometer reading at incident is required' },
        { status: 400 }
      )
    }

    if (typeof fnolData.odometerAtIncident !== 'number' || fnolData.odometerAtIncident < 0) {
      return NextResponse.json(
        { error: 'Odometer reading must be a positive number' },
        { status: 400 }
      )
    }

    if (typeof fnolData.vehicleDrivable !== 'boolean') {
      return NextResponse.json(
        { error: 'Vehicle drivable status is required' },
        { status: 400 }
      )
    }

    if (!fnolData.vehicleDrivable && (!fnolData.vehicleLocation || !fnolData.vehicleLocation.trim())) {
      return NextResponse.json(
        { error: 'Vehicle location is required when vehicle is not drivable' },
        { status: 400 }
      )
    }

    // Incident Conditions Validations
    if (!fnolData.weatherConditions || !fnolData.weatherConditions.trim()) {
      return NextResponse.json(
        { error: 'Weather conditions are required' },
        { status: 400 }
      )
    }

    if (!fnolData.roadConditions || !fnolData.roadConditions.trim()) {
      return NextResponse.json(
        { error: 'Road conditions are required' },
        { status: 400 }
      )
    }

    // Police Report Validations
    if (typeof fnolData.wasPoliceContacted !== 'boolean') {
      return NextResponse.json(
        { error: 'Police contact status is required' },
        { status: 400 }
      )
    }

    if (fnolData.wasPoliceContacted && (!fnolData.policeDepartment || !fnolData.policeDepartment.trim())) {
      return NextResponse.json(
        { error: 'Police department name is required when police were contacted' },
        { status: 400 }
      )
    }

    // Witnesses Validation
    if (!Array.isArray(fnolData.witnesses)) {
      return NextResponse.json(
        { error: 'Witnesses must be an array' },
        { status: 400 }
      )
    }

    // Other Party Validations
    if (typeof fnolData.otherPartyInvolved !== 'boolean') {
      return NextResponse.json(
        { error: 'Other party involvement status is required' },
        { status: 400 }
      )
    }

    if (fnolData.otherPartyInvolved) {
      if (!fnolData.otherParty || !fnolData.otherParty.driver || !fnolData.otherParty.driver.name || !fnolData.otherParty.driver.name.trim()) {
        return NextResponse.json(
          { error: 'Other driver name is required when another party is involved' },
          { status: 400 }
        )
      }
    }

    // Injuries Validations
    if (typeof fnolData.wereInjuries !== 'boolean') {
      return NextResponse.json(
        { error: 'Injury status is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(fnolData.injuries)) {
      return NextResponse.json(
        { error: 'Injuries must be an array' },
        { status: 400 }
      )
    }

    if (fnolData.wereInjuries && fnolData.injuries.length === 0) {
      return NextResponse.json(
        { error: 'At least one injury must be documented when injuries occurred' },
        { status: 400 }
      )
    }

    // Validate injury details if injuries exist
    if (fnolData.wereInjuries && fnolData.injuries.length > 0) {
      for (let i = 0; i < fnolData.injuries.length; i++) {
        const injury = fnolData.injuries[i]
        if (!injury.person || !injury.person.trim()) {
          return NextResponse.json(
            { error: `Injury ${i + 1}: Person injured is required` },
            { status: 400 }
          )
        }
        if (!injury.description || !injury.description.trim()) {
          return NextResponse.json(
            { error: `Injury ${i + 1}: Description is required` },
            { status: 400 }
          )
        }
        if (!injury.severity) {
          return NextResponse.json(
            { error: `Injury ${i + 1}: Severity is required` },
            { status: 400 }
          )
        }
      }
    }

    // ============================================================================
    // CHECK FOR DUPLICATE CLAIM
    // ============================================================================
    
    const existingClaim = await prisma.claim.findFirst({
      where: {
        bookingId,
        hostId
      },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true
      }
    })

    if (existingClaim) {
      return NextResponse.json(
        { 
          error: 'A claim already exists for this booking. You cannot file multiple claims for the same trip.',
          errorCode: 'DUPLICATE_CLAIM',
          existingClaim: {
            id: existingClaim.id,
            type: existingClaim.type,
            status: existingClaim.status,
            filedAt: existingClaim.createdAt.toISOString(),
            viewUrl: `/host/claims/${existingClaim.id}`
          }
        },
        { status: 400 }
      )
    }

    // ============================================================================
    // VERIFY BOOKING AND PERMISSIONS
    // ============================================================================
    
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
            rules: true,
            isActive: true,
            fuelType: true
          }
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewerProfile: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        insurancePolicy: {
          select: {
            id: true,
            tier: true,
            deductible: true,
            collisionCoverage: true,
            providerId: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify host owns this booking
    if (booking.hostId !== hostId) {
      return NextResponse.json(
        { error: 'You do not own this booking. Cannot file a claim for another host\'s booking.' },
        { status: 403 }
      )
    }

    // Check if booking has insurance policy
    if (!booking.insurancePolicy) {
      return NextResponse.json(
        { error: 'This booking does not have an insurance policy. Claims can only be filed for bookings with active insurance coverage.' },
        { status: 400 }
      )
    }

    // Get host info with earnings tier
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        userId: true,
        earningsTier: true,
        commercialInsuranceActive: true,
        p2pInsuranceActive: true,
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // ============================================================================
    // CREATE THE INSURANCE CLAIM WITH FNOL DATA
    // ============================================================================
    
    let claim
    try {
      claim = await prisma.claim.create({
        data: {
          bookingId,
          hostId,
          policyId: booking.insurancePolicy.id,
          type,
          description: description.trim(),
          incidentDate: new Date(incidentDate),
          estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
          damagePhotos: damagePhotos || [],
          status: 'PENDING',
          reportedBy: host.name || 'Host',
          guestAtFault: ['ACCIDENT', 'VANDALISM', 'CLEANING'].includes(type),
          deductible: booking.insurancePolicy.deductible,
          
          // Incident Location Fields
          incidentAddress: incidentLocation.address.trim(),
          incidentCity: incidentLocation.city.trim(),
          incidentState: incidentLocation.state,
          incidentZip: incidentLocation.zipCode.trim(),
          incidentDescription: incidentLocation.description?.trim() || null,
          
          // FNOL DATA - Vehicle Condition
          odometerAtIncident: fnolData.odometerAtIncident,
          vehicleDrivable: fnolData.vehicleDrivable,
          vehicleLocation: fnolData.vehicleLocation?.trim() || null,
          
          // FNOL DATA - Incident Conditions
          weatherConditions: fnolData.weatherConditions.trim(),
          weatherDescription: fnolData.weatherDescription?.trim() || null,
          roadConditions: fnolData.roadConditions.trim(),
          roadDescription: fnolData.roadDescription?.trim() || null,
          estimatedSpeed: fnolData.estimatedSpeed || null,
          trafficConditions: fnolData.trafficConditions?.trim() || null,
          
          // FNOL DATA - Police Report
          wasPoliceContacted: fnolData.wasPoliceContacted,
          policeDepartment: fnolData.policeDepartment?.trim() || null,
          officerName: fnolData.officerName?.trim() || null,
          officerBadge: fnolData.officerBadge?.trim() || null,
          policeReportNumber: fnolData.policeReportNumber?.trim() || null,
          policeReportFiled: fnolData.policeReportFiled || false,
          policeReportDate: fnolData.policeReportDate ? new Date(fnolData.policeReportDate) : null,
          
          // FNOL DATA - Witnesses (JSON)
          witnesses: fnolData.witnesses || [],
          
          // FNOL DATA - Other Party (JSON)
          otherPartyInvolved: fnolData.otherPartyInvolved,
          otherParty: fnolData.otherPartyInvolved ? fnolData.otherParty : null,
          
          // FNOL DATA - Injuries (JSON)
          wereInjuries: fnolData.wereInjuries,
          injuries: fnolData.wereInjuries ? fnolData.injuries : []
        }
      })
    } catch (createError: any) {
      console.error('Error creating insurance claim:', createError)
      
      // Handle duplicate claim error with helpful message
      if (createError.code === 'P2002') {
        // Check if the duplicate is on bookingId + hostId
        if (createError.meta?.target?.includes('bookingId') || 
            createError.meta?.target?.includes('hostId')) {
          
          // Find the existing claim to provide details
          const duplicateClaim = await prisma.claim.findFirst({
            where: { bookingId, hostId },
            select: {
              id: true,
              type: true,
              status: true,
              createdAt: true
            }
          })
          
          return NextResponse.json(
            { 
              error: 'A claim already exists for this booking. You cannot file multiple claims for the same trip.',
              errorCode: 'DUPLICATE_CLAIM',
              existingClaim: duplicateClaim ? {
                id: duplicateClaim.id,
                type: duplicateClaim.type,
                status: duplicateClaim.status,
                filedAt: duplicateClaim.createdAt.toISOString(),
                viewUrl: `/host/claims/${duplicateClaim.id}`
              } : null,
              hint: 'If you need to add more information to an existing claim, please contact support or use the claims messaging feature.'
            },
            { status: 400 }
          )
        }
      }
      
      // Re-throw for generic error handling
      throw createError
    }

    // ============================================================================
    // 🔒 COMPLIANCE AUDIT LOG: CLAIM FILED
    // ============================================================================
    try {
      await prisma.auditLog.create({
        data: {
          category: 'COMPLIANCE',
          eventType: 'CLAIM_FILED',
          severity: 'CRITICAL',
          userId: hostId,
          ipAddress,
          userAgent,
          action: 'CREATE_INSURANCE_CLAIM',
          resource: 'CLAIM',
          resourceId: claim.id,
          amount: claim.estimatedCost,
          currency: 'USD'
        }
      })
      console.log('✅ AuditLog: Claim filed recorded')
    } catch (auditError) {
      console.error('❌ AuditLog failed (non-critical):', auditError)
      // Don't fail claim creation if audit fails
    }

    // ============================================================================
    // TRIGGER ESG EVENT - CLAIM FILED
    // ============================================================================
    
    try {
      await handleClaimFiled(hostId, {
        claimId: claim.id,
        bookingId: booking.id,
        carId: booking.car!.id,
        claimType: type,
        estimatedCost: claim.estimatedCost,
        incidentDate: claim.incidentDate,
        description: description.trim(),
      })
    } catch (esgError) {
      // Don't fail the claim if ESG update fails
      console.error('❌ ESG event failed (non-critical):', esgError)
    }

    // ============================================================================
    // SEND EMAILS WITH FNOL SUMMARY
    // ============================================================================
    
    try {
      // Get insurance provider info
      const insuranceProvider = await prisma.insuranceProvider.findFirst({
        where: { id: booking.insurancePolicy.providerId },
        select: { name: true }
      })
      
      // Determine host earnings tier
      const earningsTier = host.commercialInsuranceActive 
        ? '90% (Commercial Insurance)' 
        : host.p2pInsuranceActive 
        ? '75% (P2P Insurance)' 
        : '40% (Platform Only)'
      
      // Create FNOL summary for emails
      const fnolSummary = {
        hasComprehensiveReport: true,
        odometerReading: fnolData.odometerAtIncident,
        vehicleDrivable: fnolData.vehicleDrivable,
        weatherConditions: fnolData.weatherConditions,
        roadConditions: fnolData.roadConditions,
        policeReportFiled: fnolData.wasPoliceContacted,
        policeDepartment: fnolData.policeDepartment,
        policeReportNumber: fnolData.policeReportNumber,
        witnessCount: fnolData.witnesses.length,
        otherPartyInvolved: fnolData.otherPartyInvolved,
        injuriesReported: fnolData.wereInjuries,
        injuryCount: fnolData.injuries.length,
        incidentLocation: `${incidentLocation.city}, ${incidentLocation.state}`
      }
      
      // Send emails to host and fleet
      const emailResults = await sendClaimFiledNotifications({
        claimId: claim.id,
        bookingCode: booking.bookingCode,
        hostName: host.name || 'Host',
        hostEmail: host.email,
        carDetails: booking.car 
          ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
          : 'Vehicle',
        incidentDate: claim.incidentDate.toISOString(),
        estimatedCost: claim.estimatedCost,
        claimType: type,
        vehicleDeactivated: true,
        guestName: booking.reviewerProfile?.name || booking.renter?.name || booking.guestName || 'Guest',
        insuranceProvider: insuranceProvider?.name || 'Platform Insurance',
        earningsTier: earningsTier,
        fnolSummary: fnolSummary
      })
      
      console.log('📧 Claim filed emails sent:', {
        claimId: claim.id,
        hostEmailSent: emailResults.hostEmailSent,
        fleetEmailSent: emailResults.fleetEmailSent,
        fnolIncluded: true,
        errors: emailResults.errors,
      })
      
      // Log email results to activity
      if (emailResults.errors.length > 0) {
        console.warn('⚠️ Some emails failed to send:', emailResults.errors)
      }
    } catch (emailError) {
      // Don't fail the claim creation if emails fail
      console.error('❌ Error sending claim emails:', emailError)
    }

    // ============================================================================
    // ✅ AUTOMATIC VEHICLE DEACTIVATION WITH INTERNAL SUSPENSION MESSAGE
    // ============================================================================
    
    if (booking.car) {
      try {
        console.log('🚗 Deactivating vehicle automatically for claim:', {
          carId: booking.car.id,
          claimId: claim.id,
          claimType: type
        })
        
        // Parse existing rules if they exist
        const existingRules = booking.car.rules ? JSON.parse(booking.car.rules as string) : {}
        
        // 🔒 INTERNAL ONLY: Suspension message for host/admin (NOT shown to guests)
        const internalSuspensionMessage = `Insurance claim filed: ${type} - Vehicle offline pending review`
        
        // Update car to deactivated status
        await prisma.rentalCar.update({
          where: { id: booking.car.id },
          data: {
            isActive: false,
            rules: JSON.stringify({
              ...existingRules,
              deactivationReason: 'INSURANCE_CLAIM',
              claimType: type,
              deactivatedAt: new Date().toISOString(),
              deactivatedBy: hostId,
              claimId: claim.id,
              previousActiveStatus: booking.car.isActive,
              suspensionMessage: internalSuspensionMessage // INTERNAL ONLY
            })
          }
        })

        console.log('✅ Vehicle deactivated successfully:', {
          carId: booking.car.id,
          previousStatus: booking.car.isActive,
          newStatus: false
        })

        // 🔒 COMPLIANCE AUDIT LOG: VEHICLE DEACTIVATED
        try {
          await prisma.auditLog.create({
            data: {
              category: 'COMPLIANCE',
              eventType: 'VEHICLE_DEACTIVATED_CLAIM',
              severity: 'HIGH',
              userId: hostId,
              ipAddress,
              userAgent,
              action: 'DEACTIVATE_VEHICLE',
              resource: 'RENTAL_CAR',
              resourceId: booking.car.id
            }
          })
          console.log('✅ AuditLog: Vehicle deactivation recorded')
        } catch (auditError) {
          console.error('❌ AuditLog failed (non-critical):', auditError)
        }

        // Activity log (internal operations tracking)
        await prisma.activityLog.create({
          data: {
            userId: host.userId || hostId,
            action: 'vehicle_deactivated_for_claim',
            entityType: 'car',
            entityId: booking.car.id,
            metadata: {
              carId: booking.car.id,
              claimId: claim.id,
              claimType: type,
              reason: `Vehicle automatically deactivated due to ${type.toLowerCase()} claim`,
              deactivatedAt: new Date().toISOString(),
              automatic: true
            }
          }
        })
      } catch (deactivateError) {
        console.error('❌ Error deactivating vehicle:', deactivateError)
        // Don't fail the claim creation if deactivation fails
      }
    } else {
      console.warn('⚠️ No car associated with booking - skipping deactivation')
    }

    // ============================================================================
    // CREATE NOTIFICATIONS
    // ============================================================================
    
    // Create host notification
    await prisma.hostNotification.create({
      data: {
        hostId,
        type: 'CLAIM_FILED',
        category: 'claim',
        subject: 'Insurance Claim Submitted',
        message: `Your ${type.toLowerCase()} claim for booking ${booking.bookingCode} has been submitted with comprehensive incident details. We'll notify you within 24-48 hours. The vehicle has been automatically deactivated to prevent new bookings during the claims process.`,
        status: 'PENDING',
        priority: 'HIGH',
        actionUrl: `/host/claims/${claim.id}`,
        actionLabel: 'View Claim'
      }
    })

    // Create admin notification for Fleet
    await prisma.adminNotification.create({
      data: {
        type: 'NEW_INSURANCE_CLAIM',
        title: 'New Insurance Claim Requires Review',
        message: `Host ${host.name} filed a ${type} claim for booking ${booking.bookingCode} with complete FNOL report. ${fnolData.wasPoliceContacted ? '🚨 Police report filed.' : ''} ${fnolData.wereInjuries ? `⚠️ ${fnolData.injuries.length} injury/injuries reported.` : ''} Estimated cost: $${claim.estimatedCost.toFixed(2)}. Vehicle automatically deactivated.`,
        priority: fnolData.wereInjuries || fnolData.wasPoliceContacted ? 'URGENT' : 'HIGH',
        status: 'UNREAD',
        actionRequired: true,
        actionUrl: `/fleet/claims/${claim.id}`,
        relatedId: claim.id,
        relatedType: 'insurance_claim',
        metadata: {
          claimId: claim.id,
          bookingId,
          bookingCode: booking.bookingCode,
          hostId,
          hostName: host.name,
          claimType: type,
          estimatedCost: claim.estimatedCost,
          vehicleDeactivated: true,
          carId: booking.car?.id,
          incidentLocation: {
            address: claim.incidentAddress,
            city: claim.incidentCity,
            state: claim.incidentState,
            zip: claim.incidentZip
          },
          fnolData: {
            comprehensiveReport: true,
            odometerReading: claim.odometerAtIncident,
            vehicleDrivable: claim.vehicleDrivable,
            policeContacted: claim.wasPoliceContacted,
            policeReportNumber: claim.policeReportNumber,
            witnessCount: fnolData.witnesses.length,
            otherPartyInvolved: claim.otherPartyInvolved,
            injuriesReported: claim.wereInjuries,
            injuryCount: fnolData.injuries.length
          }
        }
      }
    })

    // If guest has a reviewer profile, create a notification for them
    if (booking.reviewerProfile) {
      await prisma.appealNotification.create({
        data: {
          guestId: booking.reviewerProfile.id,
          appealId: claim.id,
          type: 'CLAIM_PENDING',
          message: `A claim has been filed for your booking ${booking.bookingCode}. The claim is under review and you will be notified of the decision within 24-48 hours.`,
          seen: false,
          createdAt: new Date()
        }
      })

      // Create a more detailed guest profile status entry
      const existingStatus = await prisma.guestProfileStatus.findUnique({
        where: { guestId: booking.reviewerProfile.id }
      })

      if (!existingStatus) {
        await prisma.guestProfileStatus.create({
          data: {
            guestId: booking.reviewerProfile.id,
            accountStatus: 'PENDING_CLAIM',
            activeWarningCount: 0,
            activeSuspensions: 0,
            activeRestrictions: ['PENDING_CLAIM_REVIEW'],
            statusHistory: JSON.stringify([{
              date: new Date().toISOString(),
              status: 'PENDING_CLAIM',
              reason: `Claim filed for booking ${booking.bookingCode}`,
              claimId: claim.id
            }]),
            restrictionHistory: JSON.stringify([]),
            notificationHistory: JSON.stringify([{
              date: new Date().toISOString(),
              type: 'CLAIM_PENDING',
              claimId: claim.id
            }])
          }
        })
      } else {
        // Update existing status
        const statusHistory = JSON.parse(existingStatus.statusHistory as string || '[]')
        const notificationHistory = JSON.parse(existingStatus.notificationHistory as string || '[]')
        
        statusHistory.push({
          date: new Date().toISOString(),
          status: 'PENDING_CLAIM',
          reason: `Claim filed for booking ${booking.bookingCode}`,
          claimId: claim.id
        })

        notificationHistory.push({
          date: new Date().toISOString(),
          type: 'CLAIM_PENDING',
          claimId: claim.id
        })

        await prisma.guestProfileStatus.update({
          where: { guestId: booking.reviewerProfile.id },
          data: {
            accountStatus: 'PENDING_CLAIM',
            activeRestrictions: [...(existingStatus.activeRestrictions || []), 'PENDING_CLAIM_REVIEW'],
            statusHistory: JSON.stringify(statusHistory),
            notificationHistory: JSON.stringify(notificationHistory),
            lastNotificationAt: new Date()
          }
        })
      }
    }

    // ============================================================================
    // LOG ACTIVITY WITH FNOL SUMMARY (INTERNAL OPERATIONS)
    // ============================================================================
    
    await prisma.activityLog.create({
      data: {
        userId: host.userId || hostId,
        action: 'insurance_claim_filed',
        entityType: 'claim',
        entityId: claim.id,
        metadata: {
          claimId: claim.id,
          bookingId,
          bookingCode: booking.bookingCode,
          claimType: type,
          estimatedCost: claim.estimatedCost,
          incidentDate: claim.incidentDate.toISOString(),
          vehicleDeactivated: true,
          guestNotified: !!booking.reviewerProfile,
          incidentLocation: {
            address: claim.incidentAddress,
            city: claim.incidentCity,
            state: claim.incidentState,
            zip: claim.incidentZip
          },
          fnolData: {
            comprehensiveReportFiled: true,
            odometerReading: claim.odometerAtIncident,
            vehicleDrivable: claim.vehicleDrivable,
            weatherConditions: claim.weatherConditions,
            roadConditions: claim.roadConditions,
            policeContacted: claim.wasPoliceContacted,
            policeDepartment: claim.policeDepartment,
            policeReportNumber: claim.policeReportNumber,
            witnessCount: fnolData.witnesses.length,
            otherPartyInvolved: claim.otherPartyInvolved,
            injuriesReported: claim.wereInjuries,
            injuryCount: fnolData.injuries.length,
            estimatedSpeed: claim.estimatedSpeed
          }
        }
      }
    })

    // ============================================================================
    // FORMAT AND RETURN RESPONSE
    // ============================================================================
    
    const formattedClaim = {
      id: claim.id,
      bookingId: claim.bookingId,
      type: claim.type,
      status: claim.status,
      estimatedCost: claim.estimatedCost,
      deductible: claim.deductible,
      incidentDate: claim.incidentDate.toISOString(),
      createdAt: claim.createdAt.toISOString(),
      vehicleDeactivated: true,
      
      // Incident Location
      incidentLocation: {
        address: claim.incidentAddress,
        city: claim.incidentCity,
        state: claim.incidentState,
        zipCode: claim.incidentZip,
        description: claim.incidentDescription
      },
      
      // FNOL Data in Response
      fnolData: {
        odometerAtIncident: claim.odometerAtIncident,
        vehicleDrivable: claim.vehicleDrivable,
        vehicleLocation: claim.vehicleLocation,
        weatherConditions: claim.weatherConditions,
        weatherDescription: claim.weatherDescription,
        roadConditions: claim.roadConditions,
        roadDescription: claim.roadDescription,
        estimatedSpeed: claim.estimatedSpeed,
        trafficConditions: claim.trafficConditions,
        wasPoliceContacted: claim.wasPoliceContacted,
        policeDepartment: claim.policeDepartment,
        officerName: claim.officerName,
        officerBadge: claim.officerBadge,
        policeReportNumber: claim.policeReportNumber,
        policeReportFiled: claim.policeReportFiled,
        policeReportDate: claim.policeReportDate ? claim.policeReportDate.toISOString() : null,
        witnesses: claim.witnesses,
        otherPartyInvolved: claim.otherPartyInvolved,
        otherParty: claim.otherParty,
        wereInjuries: claim.wereInjuries,
        injuries: claim.injuries
      },
      
      booking: {
        bookingCode: booking.bookingCode,
        car: booking.car ? {
          id: booking.car.id,
          displayName: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
          licensePlate: booking.car.licensePlate,
          isNowActive: false
        } : null,
        guest: booking.reviewerProfile ? {
          name: booking.reviewerProfile.name,
          email: booking.reviewerProfile.email,
          notified: true
        } : booking.renter ? {
          name: booking.renter.name,
          email: booking.renter.email,
          notified: false
        } : booking.guestName ? {
          name: booking.guestName,
          email: booking.guestEmail || 'N/A',
          notified: false
        } : null,
        insurancePolicy: {
          tier: booking.insurancePolicy.tier,
          deductible: booking.insurancePolicy.deductible,
          coverage: booking.insurancePolicy.collisionCoverage
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Insurance claim submitted successfully with comprehensive incident report. We will review your claim within 24-48 hours and notify you of the decision. The vehicle has been automatically deactivated and will not accept new bookings until the claim is resolved and repairs are verified.`,
      claim: formattedClaim
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating insurance claim:', error)
    
    // Catch-all for any unexpected Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: 'A claim already exists for this booking. Database constraint prevented duplicate claim creation.',
          errorCode: 'DUPLICATE_CLAIM_DATABASE',
          hint: 'Please refresh the page and check your existing claims.'
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create insurance claim. Please try again.',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error.message,
          code: error.code 
        })
      },
      { status: 500 }
    )
  }
}
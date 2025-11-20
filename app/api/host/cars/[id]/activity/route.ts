// app/api/host/cars/[id]/activity/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit

    // Filters
    const category = searchParams.get('category')
    const severity = searchParams.get('severity')

    console.log('📊 ===== FETCHING UNIFIED ACTIVITY TIMELINE FOR CAR:', carId, '=====')
    console.log('Filters:', { category, severity, page, limit })

    // =====================================================
    // VERIFY VEHICLE EXISTS & GET HOST INFO
    // =====================================================
    const vehicle = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        hostId: true,
        createdAt: true,
        currentMileage: true,
        registrationExpiryDate: true,
        vin: true,
        registrationState: true,
        titleStatus: true,
        // Get host info including insurance
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            insuranceType: true,
            revenueSplit: true,
            earningsTier: true
          }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    console.log('🚗 Vehicle:', `${vehicle.year} ${vehicle.make} ${vehicle.model}`)
    console.log('👤 Host:', vehicle.host?.name)
    console.log('💼 Insurance:', vehicle.host?.insuranceType, '-', vehicle.host?.revenueSplit + '%')

    // =====================================================
    // PHASE 1: FETCH ALL DATA SOURCES (9 SOURCES)
    // =====================================================

    console.log('📥 Fetching data from all sources...')

    const [
      activityLogs,
      bookings,
      serviceRecords,
      claims,
      payouts,
      photos,
      claimPhotos
    ] = await Promise.all([
      // 1. Activity Logs (vehicle edits, system events)
      prisma.activityLog.findMany({
        where: {
          entityType: 'CAR',
          entityId: carId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // 2. Bookings (all trips for this car)
      prisma.rentalBooking.findMany({
        where: { carId },
        include: {
          renter: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          reviewerProfile: {
            select: {
              id: true,
              name: true,
              email: true,
              city: true,
              state: true
            }
          },
          insurancePolicy: {
            select: {
              id: true,
              tier: true,
              deductible: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // 3. Service Records (maintenance history)
      prisma.vehicleServiceRecord.findMany({
        where: { carId },
        orderBy: { serviceDate: 'desc' }
      }),

      // 4. Claims (through bookings)
      prisma.claim.findMany({
        where: {
          booking: {
            carId
          }
        },
        include: {
          booking: {
            select: {
              id: true,
              bookingCode: true,
              renter: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          policy: {
            select: {
              id: true,
              policyNumber: true,
              tier: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // 5. Payouts (earnings from bookings)
      prisma.hostPayout.findMany({
        where: {
          booking: {
            carId
          }
        },
        include: {
          booking: {
            select: {
              id: true,
              bookingCode: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // 6. Photos (with metadata)
      prisma.rentalCarPhoto.findMany({
        where: { carId },
        orderBy: { createdAt: 'desc' }
      }),

      // 7. Claim Photos (for photo count in claims)
      prisma.claimDamagePhoto.findMany({
        where: {
          claim: {
            booking: {
              carId
            }
          }
        },
        select: {
          claimId: true,
          uploadedAt: true,
          uploadedBy: true
        }
      })
    ])

    console.log('✅ Data fetched:')
    console.log('  - ActivityLogs:', activityLogs.length)
    console.log('  - Bookings:', bookings.length)
    console.log('  - Service Records:', serviceRecords.length)
    console.log('  - Claims:', claims.length)
    console.log('  - Payouts:', payouts.length)
    console.log('  - Photos:', photos.length)
    console.log('  - Claim Damage Photos:', claimPhotos.length)

    // =====================================================
    // PHASE 2: GET USER ATTRIBUTION DATA
    // =====================================================

    const adminIds = [...new Set(activityLogs.map(a => a.adminId).filter(Boolean))]
    const hostIds = [...new Set([
      ...activityLogs.map(a => a.hostId).filter(Boolean),
      vehicle.hostId
    ])]

    const [admins, hosts] = await Promise.all([
      adminIds.length > 0
        ? prisma.user.findMany({
            where: { id: { in: adminIds } },
            select: { id: true, name: true, email: true, role: true }
          })
        : [],
      hostIds.length > 0
        ? prisma.rentalHost.findMany({
            where: { id: { in: hostIds } },
            select: { id: true, name: true, email: true }
          })
        : []
    ])

    const adminMap = admins.reduce((acc, admin) => {
      acc[admin.id] = admin
      return acc
    }, {} as Record<string, any>)

    const hostMap = hosts.reduce((acc, host) => {
      acc[host.id] = host
      return acc
    }, {} as Record<string, any>)

    const hostDetails = vehicle.host || hostMap[vehicle.hostId]
    const hostName = hostDetails?.name || 'Host'

    // Group claim photos by claimId for counting
    const claimPhotoCount = claimPhotos.reduce((acc, photo) => {
      acc[photo.claimId] = (acc[photo.claimId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // =====================================================
    // PHASE 3: TRANSFORM TO UNIFIED TIMELINE
    // =====================================================

    const timeline: any[] = []

    // =====================================================
    // 1. VEHICLE CREATION EVENT (ALWAYS FIRST)
    // =====================================================
    timeline.push({
      id: `vehicle-created-${vehicle.id}`,
      type: 'VEHICLE',
      category: 'VEHICLE',
      action: 'VEHICLE_CREATED',
      description: `Vehicle added to fleet`,
      performedBy: hostName,
      performedByType: 'HOST',
      severity: 'INFO',
      metadata: {
        vehicleId: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin
      },
      timestamp: vehicle.createdAt,
      createdAt: vehicle.createdAt.toISOString()
    })

    // =====================================================
    // 2. DOCUMENT EVENTS (VIN, Registration, Insurance)
    // =====================================================
    if (vehicle.vin) {
      timeline.push({
        id: `document-vin-${vehicle.id}`,
        type: 'DOCUMENT',
        category: 'DOCUMENT',
        action: 'VIN_ADDED',
        description: `VIN added: ${vehicle.vin.substring(0, 10)}...${vehicle.vin.slice(-4)}`,
        performedBy: hostName,
        performedByType: 'HOST',
        severity: 'INFO',
        metadata: {
          vin: vehicle.vin
        },
        timestamp: vehicle.createdAt,
        createdAt: vehicle.createdAt.toISOString()
      })
    }

    if (vehicle.registrationState) {
      timeline.push({
        id: `document-registration-${vehicle.id}`,
        type: 'DOCUMENT',
        category: 'DOCUMENT',
        action: 'REGISTRATION_UPLOADED',
        description: `Registration uploaded (${vehicle.registrationState})`,
        performedBy: hostName,
        performedByType: 'HOST',
        severity: 'INFO',
        metadata: {
          state: vehicle.registrationState,
          expiryDate: vehicle.registrationExpiryDate?.toISOString()
        },
        timestamp: vehicle.createdAt,
        createdAt: vehicle.createdAt.toISOString()
      })
    }

    if (vehicle.titleStatus) {
      timeline.push({
        id: `document-title-${vehicle.id}`,
        type: 'DOCUMENT',
        category: 'DOCUMENT',
        action: 'TITLE_STATUS_SET',
        description: `Title status: ${vehicle.titleStatus}`,
        performedBy: hostName,
        performedByType: 'HOST',
        severity: 'INFO',
        metadata: {
          titleStatus: vehicle.titleStatus
        },
        timestamp: vehicle.createdAt,
        createdAt: vehicle.createdAt.toISOString()
      })
    }

    // Insurance Type from Host
    if (vehicle.host?.insuranceType && vehicle.host.insuranceType !== 'none') {
      const tierMap: Record<string, string> = {
        'none': 'Platform Only (40%)',
        'p2p': 'P2P Insurance (75%)',
        'commercial': 'Commercial Insurance (90%)'
      }
      
      timeline.push({
        id: `document-insurance-${vehicle.id}`,
        type: 'DOCUMENT',
        category: 'DOCUMENT',
        action: 'INSURANCE_TYPE_SELECTED',
        description: `Insurance type selected: ${tierMap[vehicle.host.insuranceType] || vehicle.host.insuranceType}`,
        performedBy: hostName,
        performedByType: 'HOST',
        severity: 'INFO',
        metadata: {
          insuranceType: vehicle.host.insuranceType,
          revenueSplit: vehicle.host.revenueSplit,
          earningsTier: vehicle.host.earningsTier
        },
        timestamp: vehicle.createdAt,
        createdAt: vehicle.createdAt.toISOString()
      })
    }

    // =====================================================
    // 3. PHOTO EVENTS
    // =====================================================
    
    // Group photos by date for summary
    const photosByDate = photos.reduce((acc, photo) => {
      const date = photo.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(photo)
      return acc
    }, {} as Record<string, any[]>)

    // Add photo summary events
    Object.entries(photosByDate).forEach(([date, datePhotos]) => {
      if (datePhotos.length > 1) {
        const firstPhoto = datePhotos[0]
        const uploadedBy = firstPhoto.uploadedBy ? 
          (hostMap[firstPhoto.uploadedBy]?.name || 'Host') : 
          hostName

        timeline.push({
          id: `photo-summary-${date}`,
          type: 'PHOTO',
          category: 'PHOTO',
          action: 'PHOTOS_UPLOADED',
          description: `${datePhotos.length} photos uploaded`,
          performedBy: uploadedBy,
          performedByType: firstPhoto.uploadedByType || 'HOST',
          severity: 'INFO',
          metadata: {
            photoCount: datePhotos.length,
            date,
            hasGPS: datePhotos.some(p => p.gpsLatitude && p.gpsLongitude)
          },
          timestamp: firstPhoto.createdAt,
          createdAt: firstPhoto.createdAt.toISOString()
        })
      }
    })

    // Individual photo events (for single uploads or hero changes)
    photos.forEach(photo => {
      if (photo.isHero) {
        const uploadedBy = photo.uploadedBy ? 
          (hostMap[photo.uploadedBy]?.name || 'Host') : 
          hostName

        timeline.push({
          id: `photo-hero-${photo.id}`,
          type: 'PHOTO',
          category: 'PHOTO',
          action: 'HERO_PHOTO_SET',
          description: `Hero image set`,
          performedBy: uploadedBy,
          performedByType: photo.uploadedByType || 'HOST',
          severity: 'INFO',
          metadata: {
            photoId: photo.id,
            url: photo.url,
            hasGPS: !!(photo.gpsLatitude && photo.gpsLongitude)
          },
          timestamp: photo.createdAt,
          createdAt: photo.createdAt.toISOString()
        })
      }
    })

    // =====================================================
    // 4. ACTIVITY LOG EVENTS
    // =====================================================
    activityLogs.forEach(log => {
      let performedBy = 'System'
      let performedByType = 'SYSTEM'

      if (log.adminId && adminMap[log.adminId]) {
        performedBy = adminMap[log.adminId].name || adminMap[log.adminId].email
        performedByType = 'ADMIN'
      } else if (log.hostId && hostMap[log.hostId]) {
        performedBy = hostMap[log.hostId].name || hostMap[log.hostId].email
        performedByType = 'HOST'
      } else if (log.user) {
        performedBy = log.user.name || log.user.email || 'User'
        performedByType = 'USER'
      }

      timeline.push({
        id: `activity-${log.id}`,
        type: 'ACTIVITY_LOG',
        category: log.category || 'VEHICLE',
        action: log.action,
        description: getActivityDescription(log),
        performedBy,
        performedByType,
        severity: log.severity || 'INFO',
        metadata: log.metadata,
        oldValue: log.oldValue,
        newValue: log.newValue,
        timestamp: log.createdAt,
        createdAt: log.createdAt.toISOString()
      })
    })

    // =====================================================
    // 5. SERVICE EVENTS
    // =====================================================
    serviceRecords.forEach(service => {
      const addedBy = service.addedByName || 
                      (service.addedBy ? (hostMap[service.addedBy]?.name || 'Host') : hostName)
      
      timeline.push({
        id: `service-${service.id}`,
        type: 'SERVICE',
        category: 'SERVICE',
        action: 'SERVICE_COMPLETED',
        description: `${service.serviceType.replace(/_/g, ' ')} completed - $${service.costTotal}`,
        performedBy: addedBy,
        performedByType: service.addedByType || 'HOST',
        severity: 'INFO',
        metadata: {
          serviceId: service.id,
          serviceType: service.serviceType,
          mileageAtService: service.mileageAtService,
          shopName: service.shopName,
          cost: Number(service.costTotal),
          nextServiceDue: service.nextServiceDue?.toISOString(),
          nextServiceMileage: service.nextServiceMileage,
          verifiedByFleet: service.verifiedByFleet,
          itemsServiced: service.itemsServiced
        },
        timestamp: service.serviceDate,
        createdAt: service.serviceDate.toISOString()
      })

      // Verification event
      if (service.verifiedByFleet && service.verifiedAt) {
        timeline.push({
          id: `service-verified-${service.id}`,
          type: 'SERVICE',
          category: 'SERVICE',
          action: 'SERVICE_VERIFIED',
          description: `Service record verified by fleet admin`,
          performedBy: service.verifiedByName || 'Fleet Admin',
          performedByType: 'ADMIN',
          severity: 'INFO',
          metadata: {
            serviceId: service.id,
            serviceType: service.serviceType
          },
          timestamp: service.verifiedAt,
          createdAt: service.verifiedAt.toISOString()
        })
      }
    })

    // =====================================================
    // 6. BOOKING EVENTS (TRIPS)
    // =====================================================
    bookings.forEach(booking => {
      const guestName = booking.renter?.name || 
                        booking.reviewerProfile?.name || 
                        booking.guestName || 
                        'Guest'

      // Booking Confirmed
      timeline.push({
        id: `booking-confirmed-${booking.id}`,
        type: 'BOOKING',
        category: 'BOOKING',
        action: 'BOOKING_CONFIRMED',
        description: `Booking confirmed: ${booking.bookingCode}`,
        performedBy: guestName,
        performedByType: 'GUEST',
        severity: 'INFO',
        metadata: {
          bookingCode: booking.bookingCode,
          bookingId: booking.id,
          guestName,
          guestEmail: booking.renter?.email || booking.guestEmail,
          startDate: booking.startDate.toISOString(),
          endDate: booking.endDate.toISOString(),
          numberOfDays: booking.numberOfDays,
          totalAmount: Number(booking.totalAmount),
          status: booking.status,
          insuranceTier: booking.insuranceTier
        },
        timestamp: booking.createdAt,
        createdAt: booking.createdAt.toISOString()
      })

      // Trip Started
      if (booking.tripStatus === 'ACTIVE' || booking.status === 'COMPLETED') {
        const tripStartDate = booking.checkInTime || booking.startDate
        
        timeline.push({
          id: `booking-started-${booking.id}`,
          type: 'BOOKING',
          category: 'BOOKING',
          action: 'TRIP_STARTED',
          description: `Trip started: ${booking.bookingCode}${
            booking.checkInOdometer ? 
            ` - Odometer: ${booking.checkInOdometer.toLocaleString()} mi` : 
            ''
          }${
            booking.checkInFuelLevel ? 
            ` - Fuel: ${booking.checkInFuelLevel}` : 
            ''
          }`,
          performedBy: 'System',
          performedByType: 'SYSTEM',
          severity: 'INFO',
          metadata: {
            bookingCode: booking.bookingCode,
            bookingId: booking.id,
            checkInOdometer: booking.checkInOdometer,
            checkInFuelLevel: booking.checkInFuelLevel,
            checkInTime: booking.checkInTime?.toISOString(),
            guestName
          },
          timestamp: tripStartDate,
          createdAt: tripStartDate.toISOString()
        })
      }

      // Trip Completed
      if (booking.status === 'COMPLETED') {
        const tripEndDate = booking.checkOutTime || booking.endDate
        const mileageDriven = booking.checkOutOdometer && booking.checkInOdometer 
          ? booking.checkOutOdometer - booking.checkInOdometer 
          : 0

        timeline.push({
          id: `booking-completed-${booking.id}`,
          type: 'BOOKING',
          category: 'BOOKING',
          action: 'TRIP_COMPLETED',
          description: `Trip completed: ${booking.bookingCode}${
            mileageDriven > 0 ? 
            ` (+${mileageDriven.toLocaleString()} miles)` : 
            ''
          }`,
          performedBy: 'System',
          performedByType: 'SYSTEM',
          severity: 'INFO',
          metadata: {
            bookingCode: booking.bookingCode,
            bookingId: booking.id,
            checkInOdometer: booking.checkInOdometer,
            checkOutOdometer: booking.checkOutOdometer,
            checkInFuelLevel: booking.checkInFuelLevel,
            checkOutFuelLevel: booking.checkOutFuelLevel,
            mileageDriven,
            checkOutTime: booking.checkOutTime?.toISOString(),
            guestName
          },
          timestamp: tripEndDate,
          createdAt: tripEndDate.toISOString()
        })
      }

      // Review Received
      if (booking.reviewerProfile) {
        // Note: We'd need the actual Review model for rating/comment
        // For now, we show that a review was submitted
        timeline.push({
          id: `review-${booking.id}`,
          type: 'REVIEW',
          category: 'REVIEW',
          action: 'REVIEW_RECEIVED',
          description: `Review received from ${booking.reviewerProfile.name}`,
          performedBy: booking.reviewerProfile.name,
          performedByType: 'GUEST',
          severity: 'INFO',
          metadata: {
            bookingCode: booking.bookingCode,
            reviewerId: booking.reviewerProfile.id,
            reviewerName: booking.reviewerProfile.name,
            reviewerCity: booking.reviewerProfile.city,
            reviewerState: booking.reviewerProfile.state
          },
          timestamp: booking.updatedAt,
          createdAt: booking.updatedAt.toISOString()
        })
      }
    })

    // =====================================================
    // 7. PAYOUT EVENTS
    // =====================================================
    payouts.forEach(payout => {
      const amount = Number(payout.amount)
      
      timeline.push({
        id: `payout-${payout.id}`,
        type: 'PAYOUT',
        category: 'PAYOUT',
        action: 'PAYOUT_PROCESSED',
        description: `Payout processed: $${amount.toFixed(2)}${
          payout.booking ? ` (${payout.booking.bookingCode})` : ''
        }`,
        performedBy: 'System',
        performedByType: 'SYSTEM',
        severity: 'INFO',
        metadata: {
          payoutId: payout.id,
          bookingCode: payout.booking?.bookingCode,
          bookingId: payout.bookingId,
          amount,
          status: payout.status,
          stripeTransferId: payout.stripeTransferId,
          processedAt: payout.processedAt?.toISOString()
        },
        timestamp: payout.processedAt || payout.createdAt,
        createdAt: (payout.processedAt || payout.createdAt).toISOString()
      })
    })

    // =====================================================
    // 8. CLAIM EVENTS
    // =====================================================
    claims.forEach(claim => {
      const photoCount = claimPhotoCount[claim.id] || 0

      // Claim Filed
      timeline.push({
        id: `claim-filed-${claim.id}`,
        type: 'CLAIM',
        category: 'CLAIM',
        action: 'CLAIM_FILED',
        description: `Claim filed: ${claim.type} - $${claim.estimatedCost || 0} estimated`,
        performedBy: hostName,
        performedByType: 'HOST',
        severity: 'WARNING',
        metadata: {
          claimId: claim.id,
          claimType: claim.type,
          bookingCode: claim.booking?.bookingCode,
          estimatedCost: Number(claim.estimatedCost || 0),
          status: claim.status,
          incidentDate: claim.incidentDate?.toISOString(),
          damagePhotos: photoCount,
          description: claim.description
        },
        timestamp: claim.createdAt,
        createdAt: claim.createdAt.toISOString()
      })

      // Damage Photos Uploaded (if any)
      if (photoCount > 0) {
        const firstPhotoUpload = claimPhotos.find(p => p.claimId === claim.id)
        if (firstPhotoUpload) {
          timeline.push({
            id: `claim-photos-${claim.id}`,
            type: 'CLAIM',
            category: 'CLAIM',
            action: 'CLAIM_PHOTOS_UPLOADED',
            description: `${photoCount} damage photo${photoCount > 1 ? 's' : ''} uploaded`,
            performedBy: firstPhotoUpload.uploadedBy === 'HOST' ? hostName : 'Guest',
            performedByType: firstPhotoUpload.uploadedBy as any,
            severity: 'INFO',
            metadata: {
              claimId: claim.id,
              photoCount
            },
            timestamp: firstPhotoUpload.uploadedAt,
            createdAt: firstPhotoUpload.uploadedAt.toISOString()
          })
        }
      }

      // Claim Reviewed
      if (claim.reviewedAt) {
        const action = claim.status === 'APPROVED' ? 'CLAIM_APPROVED' : 
                       claim.status === 'DENIED' ? 'CLAIM_DENIED' : 'CLAIM_REVIEWED'
        
        timeline.push({
          id: `claim-reviewed-${claim.id}`,
          type: 'CLAIM',
          category: 'CLAIM',
          action,
          description: claim.status === 'APPROVED' 
            ? `Claim approved: $${claim.approvedAmount || 0}`
            : claim.status === 'DENIED'
            ? `Claim denied`
            : `Claim reviewed`,
          performedBy: claim.reviewedBy || 'Fleet Admin',
          performedByType: 'ADMIN',
          severity: claim.status === 'APPROVED' ? 'INFO' : 'WARNING',
          metadata: {
            claimId: claim.id,
            status: claim.status,
            approvedAmount: claim.approvedAmount ? Number(claim.approvedAmount) : null,
            deductible: claim.deductible ? Number(claim.deductible) : null,
            reviewNotes: claim.reviewNotes
          },
          timestamp: claim.reviewedAt,
          createdAt: claim.reviewedAt.toISOString()
        })
      }

      // Claim Paid
      if (claim.paidAt) {
        const netPayout = claim.approvedAmount 
          ? Number(claim.approvedAmount) - Number(claim.deductible || 0)
          : 0

        timeline.push({
          id: `claim-paid-${claim.id}`,
          type: 'CLAIM',
          category: 'CLAIM',
          action: 'CLAIM_PAID',
          description: `Claim payout processed: $${netPayout.toFixed(2)}`,
          performedBy: 'System',
          performedByType: 'SYSTEM',
          severity: 'INFO',
          metadata: {
            claimId: claim.id,
            approvedAmount: claim.approvedAmount ? Number(claim.approvedAmount) : null,
            deductible: claim.deductible ? Number(claim.deductible) : null,
            netPayout
          },
          timestamp: claim.paidAt,
          createdAt: claim.paidAt.toISOString()
        })
      }
    })

    // =====================================================
    // 9. COMPLIANCE EVENTS (CALCULATED)
    // =====================================================
    if (vehicle.registrationExpiryDate) {
      const expiryDate = new Date(vehicle.registrationExpiryDate)
      const now = new Date()
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry <= 60 && daysUntilExpiry > 0) {
        timeline.push({
          id: `compliance-registration-expiry`,
          type: 'COMPLIANCE',
          category: 'COMPLIANCE',
          action: 'REGISTRATION_EXPIRY_WARNING',
          description: `Registration expires in ${daysUntilExpiry} days`,
          performedBy: 'System',
          performedByType: 'SYSTEM',
          severity: daysUntilExpiry <= 30 ? 'WARNING' : daysUntilExpiry <= 14 ? 'ERROR' : 'INFO',
          metadata: {
            expiryDate: vehicle.registrationExpiryDate.toISOString(),
            daysUntilExpiry,
            registrationState: vehicle.registrationState
          },
          timestamp: now,
          createdAt: now.toISOString()
        })
      } else if (daysUntilExpiry <= 0) {
        timeline.push({
          id: `compliance-registration-expired`,
          type: 'COMPLIANCE',
          category: 'COMPLIANCE',
          action: 'REGISTRATION_EXPIRED',
          description: `Registration expired ${Math.abs(daysUntilExpiry)} days ago`,
          performedBy: 'System',
          performedByType: 'SYSTEM',
          severity: 'CRITICAL',
          metadata: {
            expiryDate: vehicle.registrationExpiryDate.toISOString(),
            daysExpired: Math.abs(daysUntilExpiry),
            registrationState: vehicle.registrationState
          },
          timestamp: now,
          createdAt: now.toISOString()
        })
      }
    }

    // =====================================================
    // PHASE 4: SORT, FILTER, PAGINATE
    // =====================================================

    // Sort by timestamp (newest first)
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    console.log('📊 Total timeline events:', timeline.length)

    // Apply category filter
    let filteredTimeline = timeline
    if (category) {
      filteredTimeline = timeline.filter(event => event.category === category)
      console.log(`🔍 Filtered by category "${category}":`, filteredTimeline.length)
    }

    // Apply severity filter
    if (severity) {
      filteredTimeline = filteredTimeline.filter(event => event.severity === severity)
      console.log(`🔍 Filtered by severity "${severity}":`, filteredTimeline.length)
    }

    // Apply pagination
    const paginatedTimeline = filteredTimeline.slice(skip, skip + limit)

    // =====================================================
    // PHASE 5: CALCULATE STATISTICS
    // =====================================================

    const categoryBreakdown = timeline.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const severityBreakdown = timeline.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // =====================================================
    // PHASE 6: RETURN RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        displayName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        vin: vehicle.vin,
        currentMileage: vehicle.currentMileage,
        host: {
          id: vehicle.host?.id,
          name: vehicle.host?.name,
          insuranceType: vehicle.host?.insuranceType,
          revenueSplit: vehicle.host?.revenueSplit,
          earningsTier: vehicle.host?.earningsTier
        }
      },
      timeline: paginatedTimeline,
      pagination: {
        page,
        limit,
        total: filteredTimeline.length,
        totalPages: Math.ceil(filteredTimeline.length / limit),
        hasMore: skip + paginatedTimeline.length < filteredTimeline.length
      },
      statistics: {
        totalEvents: timeline.length,
        categoryBreakdown,
        severityBreakdown,
        dataSources: {
          activityLogs: activityLogs.length,
          bookings: bookings.length,
          serviceRecords: serviceRecords.length,
          claims: claims.length,
          payouts: payouts.length,
          photos: photos.length,
          vehicleDocuments: 4 // VIN, Registration, Title, Insurance
        }
      }
    })

  } catch (error) {
    console.error('❌ Error fetching unified activity timeline:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch activity timeline',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// =====================================================
// HELPER FUNCTION: ACTIVITY DESCRIPTIONS
// =====================================================

function getActivityDescription(activity: any): string {
  const action = activity.action
  const metadata = activity.metadata || {}

  switch (action) {
    case 'CREATE_CAR':
      return 'Vehicle added to platform'
    case 'UPDATE_CAR':
      return 'Vehicle details updated'
    case 'DEACTIVATE_CAR':
      return 'Vehicle deactivated'
    case 'ACTIVATE_CAR':
      return 'Vehicle activated'
    case 'UPLOAD_PHOTO':
      return `Uploaded ${metadata.photoCount || 1} photo(s)`
    case 'DELETE_PHOTO':
      return 'Deleted vehicle photo'
    case 'SET_HERO_PHOTO':
      return 'Set main photo'
    case 'VERIFY_VIN':
      return 'VIN verified'
    case 'VERIFY_REGISTRATION':
      return 'Registration verified'
    case 'VERIFY_INSURANCE':
      return 'Insurance verified'
    case 'VERIFY_TITLE':
      return 'Title verified'
    case 'ADD_SERVICE_RECORD':
      return `Added service record: ${metadata.serviceType || 'maintenance'}`
    case 'UPDATE_PRICING':
      return 'Updated pricing'
    case 'CLAIM_FILED':
      return `Claim filed: ${metadata.claimType || 'incident'}`
    case 'CLAIM_VEHICLE_DEACTIVATED':
      return 'Vehicle deactivated due to claim'
    case 'CLAIM_VEHICLE_REACTIVATED':
      return 'Vehicle reactivated after claim resolution'
    default:
      return action.replace(/_/g, ' ').toLowerCase()
  }
}
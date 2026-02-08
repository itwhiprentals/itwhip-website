// app/api/fleet/claims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

// GET /api/fleet/claims - List all claims with filters (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Filters
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const hostId = searchParams.get('hostId');
    const bookingId = searchParams.get('bookingId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (hostId) where.hostId = hostId;
    if (bookingId) where.bookingId = bookingId;

    // Get claims with relations - ENHANCED to include insurance hierarchy
    const [claims, total] = await Promise.all([
      (prisma.claim.findMany as any)({
        where,
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              // Include tier information for insurance hierarchy
              earningsTier: true,
              commercialInsuranceStatus: true,
              commercialInsuranceProvider: true,
              commercialPolicyNumber: true,
              p2pInsuranceStatus: true,
              p2pInsuranceProvider: true,
              p2pPolicyNumber: true
            }
          },
          booking: {
            select: {
              id: true,
              bookingCode: true,
              startDate: true,
              endDate: true,
              guestName: true,
              guestEmail: true,
              // Include deposit information
              securityDeposit: true,
              depositHeld: true,
              depositRefunded: true,
              depositUsedForClaim: true,
              // Include guest insurance if linked
              reviewerProfile: {
                select: {
                  insuranceProvider: true,
                  insuranceVerified: true,
                  policyNumber: true,
                  expiryDate: true
                }
              }
            }
          },
          InsurancePolicy: {
            select: {
              id: true,
              tier: true,
              policyNumber: true,
              liabilityCoverage: true,
              collisionCoverage: true,
              deductible: true,
              totalPremium: true,
              InsuranceProvider: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              }
            }
          }
        },
        orderBy: [
          { status: 'asc' }, // Pending first
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }) as any[],
      prisma.claim.count({ where })
    ]);

    // Process claims to add insurance hierarchy information
    const processedClaims = claims.map(claim => {
      // Determine primary insurance based on host tier
      const hostTier = claim.host.earningsTier;
      let primaryInsurance = 'PLATFORM';
      let primaryProvider = claim.InsurancePolicy?.InsuranceProvider?.name || 'Unknown';
      let primaryPolicy = claim.InsurancePolicy?.policyNumber || null;
      
      if (hostTier === 'PREMIUM' && claim.host.commercialInsuranceStatus === 'ACTIVE') {
        primaryInsurance = 'HOST_COMMERCIAL';
        primaryProvider = claim.host.commercialInsuranceProvider || 'Commercial Provider';
        primaryPolicy = claim.host.commercialPolicyNumber;
      } else if (hostTier === 'STANDARD' && claim.host.p2pInsuranceStatus === 'ACTIVE') {
        primaryInsurance = 'HOST_P2P';
        primaryProvider = claim.host.p2pInsuranceProvider || 'P2P Provider';
        primaryPolicy = claim.host.p2pPolicyNumber;
      }

      // Determine guest insurance status
      const guestHasInsurance = claim.booking.reviewerProfile?.insuranceVerified === true;
      const guestInsuranceValid = guestHasInsurance && 
        claim.booking.reviewerProfile?.expiryDate && 
        new Date(claim.booking.reviewerProfile.expiryDate) > new Date();

      // Calculate actual deductible responsibility
      const depositHeld = claim.booking.depositHeld || 0;
      const platformDeductible = claim.InsurancePolicy?.deductible || 1000;
      
      // Determine who pays deductible based on primary insurance
      let deductiblePayer = 'GUEST';
      let deductibleAmount = platformDeductible;
      
      if (primaryInsurance === 'HOST_COMMERCIAL' || primaryInsurance === 'HOST_P2P') {
        // Host insurance is primary, their deductible applies
        deductibleAmount = 500; // Typical commercial/P2P deductible
      }

      const guestResponsibility = Math.max(0, deductibleAmount - depositHeld);

      return {
        ...claim,
        insuranceHierarchy: {
          primary: {
            type: primaryInsurance,
            provider: primaryProvider,
            policyNumber: primaryPolicy,
            status: primaryInsurance !== 'PLATFORM' ? 'ACTIVE' : 'N/A'
          },
          secondary: {
            type: 'PLATFORM',
            provider: claim.InsurancePolicy?.InsuranceProvider?.name || 'Tint',
            tier: claim.InsurancePolicy?.tier || 'UNKNOWN',
            coverage: {
              liability: claim.InsurancePolicy?.liabilityCoverage || 0,
              collision: claim.InsurancePolicy?.collisionCoverage || 0,
              deductible: claim.InsurancePolicy?.deductible || 0
            },
            premium: claim.InsurancePolicy?.totalPremium || 0
          },
          tertiary: guestHasInsurance ? {
            type: 'GUEST_PERSONAL',
            provider: claim.booking.reviewerProfile?.insuranceProvider || 'Unknown',
            policyNumber: claim.booking.reviewerProfile?.policyNumber || null,
            verified: guestInsuranceValid,
            depositReduction: guestInsuranceValid ? '50%' : '0%'
          } : null
        },
        deductibleDetails: {
          primaryDeductible: deductibleAmount,
          depositHeld,
          guestResponsibility,
          coveredByDeposit: Math.min(depositHeld, deductibleAmount),
          payer: deductiblePayer
        },
        hostEarnings: {
          tier: hostTier,
          percentage: hostTier === 'PREMIUM' ? 90 : hostTier === 'STANDARD' ? 75 : 40,
          insuranceRole: hostTier === 'BASIC' ? 'Platform Primary' : 'Host Primary'
        }
      };
    });

    return NextResponse.json({
      claims: processedClaims,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}

// POST /api/fleet/claims - Create a new claim
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingId,
      hostId,
      type,
      description,
      incidentDate,
      damagePhotos,
      estimatedCost,
      reportedBy
    } = body;

    // Validate required fields
    if (!bookingId || !hostId || !type || !description || !incidentDate || !estimatedCost) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get booking with insurance policy and host details
    const booking = await (prisma.rentalBooking.findUnique as any)({
      where: { id: bookingId },
      include: {
        InsurancePolicy: true,
        host: {
          select: {
            earningsTier: true,
            commercialInsuranceStatus: true,
            p2pInsuranceStatus: true
          }
        },
        reviewerProfile: {
          select: {
            insuranceVerified: true,
            insuranceProvider: true
          }
        }
      }
    }) as any;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (!booking.InsurancePolicy) {
      return NextResponse.json(
        { error: 'No insurance policy found for this booking' },
        { status: 400 }
      );
    }

    // Determine primary payer based on host tier
    const hostTier = booking.host.earningsTier;
    let primaryPayer = 'PLATFORM_INSURANCE';
    let actualDeductible = booking.InsurancePolicy.deductible;

    if (hostTier === 'PREMIUM' && booking.host.commercialInsuranceStatus === 'ACTIVE') {
      primaryPayer = 'HOST_COMMERCIAL_INSURANCE';
      actualDeductible = 500; // Commercial insurance typical deductible
    } else if (hostTier === 'STANDARD' && booking.host.p2pInsuranceStatus === 'ACTIVE') {
      primaryPayer = 'HOST_P2P_INSURANCE';
      actualDeductible = 500; // P2P insurance typical deductible
    }

    // Create the claim with insurance hierarchy metadata
    const claim = await (prisma.claim.create as any)({
      data: {
        bookingId,
        hostId,
        policyId: booking.InsurancePolicy.id,
        type,
        description,
        incidentDate: new Date(incidentDate),
        damagePhotos: damagePhotos || {},
        estimatedCost,
        reportedBy,
        status: 'PENDING',
        deductible: actualDeductible,
        // Store insurance hierarchy in metadata
        overrideHistory: {
          primaryPayer,
          hostTier,
          guestHasInsurance: booking.reviewerProfile?.insuranceVerified || false,
          depositHeld: booking.depositHeld || 0,
          createdAt: new Date().toISOString()
        }
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        booking: {
          select: {
            bookingCode: true,
            guestName: true,
            guestEmail: true
          }
        },
        InsurancePolicy: {
          select: {
            tier: true,
            InsuranceProvider: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Create audit log for claim creation
    await (prisma.auditLog.create as any)({
      data: {
        category: 'FINANCIAL',
        eventType: 'CLAIM_CREATED',
        severity: 'INFO',
        userId: reportedBy,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'CREATE_CLAIM',
        resource: 'Claim',
        resourceId: claim.id,
        amount: estimatedCost,
        details: {
          bookingId,
          hostId,
          claimType: type,
          primaryPayer,
          hostTier,
          estimatedCost,
          deductible: actualDeductible
        },
        hash: '', // You might want to generate a hash
        previousHash: null
      }
    });

    return NextResponse.json({
      claim,
      insuranceDetails: {
        primaryPayer,
        hostTier,
        deductible: actualDeductible,
        depositAvailable: booking.depositHeld || 0,
        guestResponsibility: Math.max(0, actualDeductible - (booking.depositHeld || 0))
      }
    });

  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json(
      { error: 'Failed to create claim' },
      { status: 500 }
    );
  }
}
// app/api/host/bookings/[id]/insurance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using its properties (Next.js 15 requirement)
    const { id } = await params;
    
    const booking = await prisma.rentalBooking.findUnique({
      where: { id },
      include: {
        car: true,
        host: {
          select: {
            earningsTier: true,
            commercialInsuranceStatus: true,
            commercialInsuranceProvider: true,
            commercialPolicyNumber: true,
            p2pInsuranceStatus: true,
            p2pInsuranceProvider: true,
            p2pPolicyNumber: true
          }
        },
        InsurancePolicy: {
          include: {
            InsuranceProvider: true
          }
        },
        reviewerProfile: {
          select: {
            insuranceProvider: true,
            insuranceVerified: true,
            policyNumber: true
          }
        }
      }
    }) as any;

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Determine insurance hierarchy
    const hostTier = booking.host.earningsTier || 'BASIC';
    let primaryInsurance = {
      type: 'PLATFORM',
      provider: booking.InsurancePolicy?.InsuranceProvider?.name || 'Tint',
      policyNumber: booking.InsurancePolicy?.policyNumber || null,
      status: 'ACTIVE'
    };

    if (hostTier === 'PREMIUM' && booking.host.commercialInsuranceStatus === 'ACTIVE') {
      primaryInsurance = {
        type: 'HOST_COMMERCIAL',
        provider: booking.host.commercialInsuranceProvider || 'Commercial Provider',
        policyNumber: booking.host.commercialPolicyNumber || null,
        status: 'ACTIVE'
      };
    } else if (hostTier === 'STANDARD' && booking.host.p2pInsuranceStatus === 'ACTIVE') {
      primaryInsurance = {
        type: 'HOST_P2P',
        provider: booking.host.p2pInsuranceProvider || 'P2P Provider',
        policyNumber: booking.host.p2pPolicyNumber || null,
        status: 'ACTIVE'
      };
    }

    const deductibleAmount = primaryInsurance.type === 'PLATFORM' 
      ? (booking.InsurancePolicy?.deductible || 1000)
      : 500; // Host insurance typically has $500 deductible

    const response = {
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        guestName: booking.guestName,
        startDate: booking.startDate,
        endDate: booking.endDate,
        securityDeposit: booking.securityDeposit || 0,
        depositHeld: booking.depositHeld || 0,
        car: booking.car
      },
      insuranceHierarchy: {
        primary: primaryInsurance,
        secondary: {
          type: 'PLATFORM',
          provider: booking.InsurancePolicy?.InsuranceProvider?.name || 'Tint',
          tier: booking.InsurancePolicy?.tier || 'UNKNOWN',
          coverage: {
            liability: booking.InsurancePolicy?.liabilityCoverage || 750000,
            collision: booking.InsurancePolicy?.collisionCoverage || 0,
            deductible: booking.InsurancePolicy?.deductible || 1000
          },
          premium: booking.InsurancePolicy?.totalPremium || 0
        },
        tertiary: booking.reviewerProfile?.insuranceVerified ? {
          type: 'GUEST_PERSONAL',
          provider: booking.reviewerProfile.insuranceProvider || 'Unknown',
          policyNumber: booking.reviewerProfile.policyNumber || null,
          verified: true,
          depositReduction: '50%'
        } : null
      },
      deductibleDetails: {
        primaryDeductible: deductibleAmount,
        depositHeld: booking.depositHeld || 0,
        guestResponsibility: Math.max(0, deductibleAmount - (booking.depositHeld || 0)),
        coveredByDeposit: Math.min(booking.depositHeld || 0, deductibleAmount)
      },
      hostEarnings: {
        tier: hostTier,
        percentage: hostTier === 'PREMIUM' ? 90 : hostTier === 'STANDARD' ? 75 : 40,
        insuranceRole: hostTier === 'BASIC' ? 'Platform Primary' : 'Host Primary'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching insurance details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance details' },
      { status: 500 }
    );
  }
}
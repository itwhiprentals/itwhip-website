// app/api/host/insurance/provider/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get the host's assigned provider
    const hostResponse = await fetch(`${request.nextUrl.origin}/api/host/profile`, {
      headers: request.headers
    });
    
    if (!hostResponse.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hostData = await hostResponse.json();
    const hostProfile = hostData.profile;

    if (!hostProfile?.insuranceProviderId) {
      return NextResponse.json({ error: 'No insurance provider assigned' }, { status: 404 });
    }

    // Fetch the provider details including rates and coverage
    const provider = await prisma.insuranceProvider.findUnique({
      where: { id: hostProfile.insuranceProviderId },
      include: {
        rates: {
          where: { isActive: true },
          orderBy: { tier: 'asc' }
        },
        policies: {
          where: {
            bookingId: null // Template policies
          },
          orderBy: { tier: 'asc' }
        }
      } as any
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json({
      provider,
      hostTier: hostProfile.earningsTier || 'BASIC',
      policyNumber: hostProfile.insurancePolicyNumber
    });

  } catch (error) {
    console.error('Error fetching provider details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider details' },
      { status: 500 }
    );
  }
}
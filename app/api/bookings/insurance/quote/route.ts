// app/api/bookings/insurance/quote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

// POST /api/bookings/insurance/quote - Calculate insurance quote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      carId,
      vehicleValue,
      startDate,
      endDate,
      tier
    } = body;

    // Validation
    if (!vehicleValue || !startDate || !endDate || !tier) {
      return NextResponse.json(
        { error: 'vehicleValue, startDate, endDate, and tier are required' },
        { status: 400 }
      );
    }

    if (!['MINIMUM', 'BASIC', 'PREMIUM', 'LUXURY'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be MINIMUM, BASIC, PREMIUM, or LUXURY' },
        { status: 400 }
      );
    }

    // Get primary insurance provider (Tint)
    const provider = await prisma.insuranceProvider.findFirst({
      where: {
        isPrimary: true,
        isActive: true
      }
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'No active insurance provider found' },
        { status: 500 }
      );
    }

    // Calculate trip duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (days < 1) {
      return NextResponse.json(
        { error: 'Invalid date range' },
        { status: 400 }
      );
    }

    // Determine pricing bracket based on vehicle value
    const pricingRules = provider.pricingRules as any;
    let pricingBracket: any;

    if (vehicleValue < 25000) {
      pricingBracket = pricingRules.under25k;
    } else if (vehicleValue < 50000) {
      pricingBracket = pricingRules['25to50k'];
    } else if (vehicleValue < 100000) {
      pricingBracket = pricingRules['50to100k'];
    } else {
      pricingBracket = pricingRules.over100k;
    }

    // Get daily premium for selected tier
    const dailyPremium = pricingBracket[tier] || 0;
    const totalPremium = dailyPremium * days;

    // Calculate platform revenue (30% of premium)
    const platformRevenue = totalPremium * provider.revenueShare;

    // Get coverage details from provider
    const coverageTiers = provider.coverageTiers as any;
    const coverageDetails = coverageTiers[tier];

    // Calculate increased deposit for MINIMUM tier
    let increasedDeposit = null;
    if (tier === 'MINIMUM') {
      // Deposit ranges from $2,500 to $1M based on vehicle value
      if (vehicleValue < 25000) {
        increasedDeposit = 2500;
      } else if (vehicleValue < 50000) {
        increasedDeposit = 5000;
      } else if (vehicleValue < 100000) {
        increasedDeposit = 10000;
      } else {
        increasedDeposit = Math.min(vehicleValue * 0.2, 1000000); // 20% of value, max $1M
      }
    }

    // Build quote response
    const quote = {
      tier,
      vehicleValue,
      days,
      dailyPremium,
      totalPremium,
      platformRevenue,
      increasedDeposit,
      coverage: {
        liability: coverageDetails.liability,
        collision: coverageDetails.collision === 'vehicle_value' 
          ? vehicleValue 
          : coverageDetails.collision,
        deductible: coverageDetails.deductible,
        description: coverageDetails.description
      },
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.type
      },
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    return NextResponse.json({
      quote
    });

  } catch (error) {
    console.error('Error calculating insurance quote:', error);
    return NextResponse.json(
      { error: 'Failed to calculate insurance quote' },
      { status: 500 }
    );
  }
}
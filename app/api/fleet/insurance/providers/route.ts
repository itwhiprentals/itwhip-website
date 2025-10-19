// app/api/fleet/insurance/providers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/database/prisma';

// GET /api/fleet/insurance/providers - List all insurance providers
export async function GET(request: NextRequest) {
  try {
    // Verify fleet access - check URL key OR header key
    const searchParams = request.nextUrl.searchParams;
    const urlKey = searchParams.get('key');
    const headerKey = request.headers.get('x-fleet-key');
    
    const phoenixKey = 'phoenix-fleet-2847';
    
    if (urlKey !== phoenixKey && headerKey !== phoenixKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const activeOnly = searchParams.get('activeOnly') === 'true';

    const providers = await prisma.insuranceProvider.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [
        { isPrimary: 'desc' },
        { isActive: 'desc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        isPrimary: true,
        revenueShare: true,
        coverageTiers: true,
        pricingRules: true,
        contractStart: true,
        contractEnd: true,
        createdAt: true,
        _count: {
          select: {
            policies: true
          }
        }
      }
    });

    return NextResponse.json({
      providers,
      total: providers.length
    });

  } catch (error) {
    console.error('Error fetching insurance providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance providers' },
      { status: 500 }
    );
  }
}

// POST /api/fleet/insurance/providers - Create new insurance provider
export async function POST(request: NextRequest) {
  try {
    // Verify fleet access - check URL key OR header key
    const searchParams = request.nextUrl.searchParams;
    const urlKey = searchParams.get('key');
    const headerKey = request.headers.get('x-fleet-key');
    
    const phoenixKey = 'phoenix-fleet-2847';
    
    if (urlKey !== phoenixKey && headerKey !== phoenixKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      type,
      isActive,
      isPrimary,
      revenueShare,
      coverageTiers,
      pricingRules,
      apiKey,
      apiEndpoint,
      webhookUrl,
      contractStart,
      contractEnd,
      contractTerms
    } = body;

    // Validation
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    if (!['EMBEDDED', 'TRADITIONAL'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid provider type' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existing = await prisma.insuranceProvider.findFirst({
      where: { name }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Provider with this name already exists' },
        { status: 409 }
      );
    }

    // If setting as primary, unset other primary providers
    if (isPrimary) {
      await prisma.insuranceProvider.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false }
      });
    }

    // Create provider
    const provider = await prisma.insuranceProvider.create({
      data: {
        name,
        type,
        isActive: isActive ?? true,
        isPrimary: isPrimary ?? false,
        revenueShare: revenueShare ?? 0.30,
        coverageTiers: coverageTiers || {},
        pricingRules: pricingRules || {},
        apiKey,
        apiEndpoint,
        webhookUrl,
        contractStart: contractStart ? new Date(contractStart) : null,
        contractEnd: contractEnd ? new Date(contractEnd) : null,
        contractTerms
      }
    });

    return NextResponse.json({
      message: 'Insurance provider created successfully',
      provider
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating insurance provider:', error);
    return NextResponse.json(
      { error: 'Failed to create insurance provider' },
      { status: 500 }
    );
  }
}
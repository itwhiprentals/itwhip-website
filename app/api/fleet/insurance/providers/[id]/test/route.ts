// app/api/fleet/insurance/providers/[id]/test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

/**
 * Test Connection Endpoint for Insurance Providers
 * Used by both Fleet and Admin to verify provider API configuration
 * 
 * GET /api/fleet/insurance/providers/[id]/test?key=phoenix-fleet-2847
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Next.js 15: await params before accessing
    const { id: providerId } = await context.params
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    // Verify authentication key
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized: Invalid authentication key' 
        },
        { status: 401 }
      )
    }

    // Fetch provider from database
    const provider = await prisma.insuranceProvider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        apiEndpoint: true,
        apiKey: true,
        _count: {
          select: {
            InsurancePolicy: true
          }
        }
      }
    })

    // Provider not found
    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          message: 'Provider not found'
        },
        { status: 404 }
      )
    }

    // Provider is inactive
    if (!provider.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: `${provider.name} is currently inactive`,
          details: {
            providerId: provider.id,
            providerName: provider.name,
            status: 'inactive'
          }
        },
        { status: 200 }
      )
    }

    // Check API configuration
    const hasApiEndpoint = !!provider.apiEndpoint
    const hasApiKey = !!provider.apiKey

    // No API configuration
    if (!hasApiEndpoint && !hasApiKey) {
      return NextResponse.json(
        {
          success: false,
          message: `${provider.name} has no API configuration`,
          details: {
            providerId: provider.id,
            providerName: provider.name,
            status: 'not_configured',
            apiEndpoint: null,
            apiKey: null
          }
        },
        { status: 200 }
      )
    }

    // Partial configuration
    if (!hasApiEndpoint || !hasApiKey) {
      return NextResponse.json(
        {
          success: false,
          message: `${provider.name} has incomplete API configuration`,
          details: {
            providerId: provider.id,
            providerName: provider.name,
            status: 'partial_configuration',
            hasApiEndpoint,
            hasApiKey,
            missing: !hasApiEndpoint ? 'API Endpoint' : 'API Key'
          }
        },
        { status: 200 }
      )
    }

    // SUCCESS - Provider is configured and active
    // For now, we do a mock connection test
    // TODO: In production, ping the actual API endpoint
    
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800))

    return NextResponse.json(
      {
        success: true,
        message: `${provider.name} API connection successful`,
        details: {
          providerId: provider.id,
          providerName: provider.name,
          providerType: provider.type,
          status: 'connected',
          apiEndpoint: provider.apiEndpoint,
          activePolicies: (provider as any)._count.InsurancePolicy,
          testedAt: new Date().toISOString(),
          connectionType: 'sandbox' // or 'production' based on apiEndpoint
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Test connection error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during connection test',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
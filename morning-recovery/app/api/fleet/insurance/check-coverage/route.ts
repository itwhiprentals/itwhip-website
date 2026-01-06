// app/api/fleet/insurance/check-coverage/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma';
import {
  isVehicleEligibleForProvider,
  findEligibleProviders,
  getPrimaryProvider,
  getVehicleCoverageWarnings
} from '@/lib/insurance-utils'

/**
 * POST /api/fleet/insurance/check-coverage
 * Check if a vehicle is eligible for insurance coverage
 * 
 * Body:
 * {
 *   carId?: string           // Optional: existing car ID
 *   make: string            // Vehicle make
 *   model: string           // Vehicle model
 *   value: number           // Vehicle value
 *   providerId?: string     // Optional: check specific provider
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { carId, make, model, value, providerId } = body

    // Validation
    if (!make || !model) {
      return NextResponse.json(
        { error: 'Make and model are required' },
        { status: 400 }
      )
    }

    const vehicleValue = value || 0

    // Get all active providers or specific provider
    const providers = providerId
      ? await prisma.insuranceProvider.findMany({
          where: { id: providerId }
        })
      : await prisma.insuranceProvider.findMany({
          where: { isActive: true },
          orderBy: [
            { isPrimary: 'desc' },
            { name: 'asc' }
          ]
        })

    if (providers.length === 0) {
      return NextResponse.json(
        {
          error: 'No insurance providers found',
          eligible: false,
          providers: [],
          warnings: ['No active insurance providers in system']
        },
        { status: 404 }
      )
    }

    const vehicle = { make, model, value: vehicleValue }

    // Find eligible providers
    const eligibleProviders = findEligibleProviders(vehicle, providers)

    // Get primary provider
    const primaryProvider = getPrimaryProvider(vehicle, providers)

    // Get coverage warnings
    const warnings = getVehicleCoverageWarnings(vehicle, providers)

    // Check specific provider if requested
    let specificProviderCheck = null
    if (providerId && providers.length > 0) {
      specificProviderCheck = isVehicleEligibleForProvider(vehicle, providers[0])
    }

    // If checking existing car, get override if exists
    let hasOverride = false
    let overrideProvider = null
    if (carId) {
      const override = await prisma.vehicleInsuranceOverride.findFirst({
        where: { carId },
        include: { provider: true }
      })
      
      if (override) {
        hasOverride = true
        overrideProvider = override.provider
      }
    }

    return NextResponse.json({
      eligible: eligibleProviders.length > 0 || hasOverride,
      vehicle: {
        make,
        model,
        value: vehicleValue
      },
      eligibleProviders: eligibleProviders.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        isPrimary: p.isPrimary,
        coverageNotes: p.coverageNotes
      })),
      primaryProvider: primaryProvider ? {
        id: primaryProvider.id,
        name: primaryProvider.name,
        type: primaryProvider.type
      } : null,
      warnings,
      hasOverride,
      overrideProvider: overrideProvider ? {
        id: overrideProvider.id,
        name: overrideProvider.name,
        reason: 'Manual override active'
      } : null,
      specificProviderCheck,
      canPublish: eligibleProviders.length > 0 || hasOverride,
      recommendedAction: eligibleProviders.length === 0 && !hasOverride
        ? 'Add manual insurance override or update provider coverage rules'
        : null
    })

  } catch (error) {
    console.error('Coverage check error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check coverage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/fleet/insurance/check-coverage?carId=xxx
 * Check coverage for existing car
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const carId = searchParams.get('carId')

    if (!carId) {
      return NextResponse.json(
        { error: 'carId is required' },
        { status: 400 }
      )
    }

    // Get car details
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    // Check coverage using POST logic
    const vehicle = {
      make: car.make,
      model: car.model,
      value: car.dailyRate * 365 // Estimate value from daily rate
    }

    const providers = await prisma.insuranceProvider.findMany({
      where: { isActive: true },
      orderBy: [
        { isPrimary: 'desc' },
        { name: 'asc' }
      ]
    })

    const eligibleProviders = findEligibleProviders(vehicle, providers)
    const primaryProvider = getPrimaryProvider(vehicle, providers)
    const warnings = getVehicleCoverageWarnings(vehicle, providers)

    // Check for override
    const override = await prisma.vehicleInsuranceOverride.findFirst({
      where: { carId },
      include: { provider: true }
    })

    return NextResponse.json({
      car: {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        estimatedValue: car.dailyRate * 365
      },
      eligible: eligibleProviders.length > 0 || !!override,
      eligibleProviders: eligibleProviders.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        isPrimary: p.isPrimary
      })),
      primaryProvider: primaryProvider ? {
        id: primaryProvider.id,
        name: primaryProvider.name,
        type: primaryProvider.type
      } : null,
      warnings,
      hasOverride: !!override,
      overrideProvider: override ? {
        id: override.provider.id,
        name: override.provider.name,
        reason: override.reason,
        overriddenBy: override.overriddenBy,
        createdAt: override.createdAt
      } : null,
      canPublish: eligibleProviders.length > 0 || !!override
    })

  } catch (error) {
    console.error('Coverage check error:', error)
    return NextResponse.json(
      { error: 'Failed to check coverage' },
      { status: 500 }
    )
  }
}
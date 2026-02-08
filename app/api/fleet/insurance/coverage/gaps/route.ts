// app/api/fleet/insurance/coverage/gaps/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

/**
 * GET /api/fleet/insurance/coverage/gaps
 * Find all vehicles without valid insurance coverage
 * OPTIMIZED: Fetches all data upfront to avoid N+1 queries
 * 
 * Query params:
 * - key: phoenix-fleet-2847 (required)
 * - includeInactive: boolean (include inactive cars)
 */
export async function GET(req: NextRequest) {
  try {
    // Auth check
    const { searchParams } = new URL(req.url)
    const urlKey = searchParams.get('key')
    const headerKey = req.headers.get('x-fleet-key')
    
    const phoenixKey = 'phoenix-fleet-2847'
    
    if (urlKey !== phoenixKey && headerKey !== phoenixKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const includeInactive = searchParams.get('includeInactive') === 'true'

    // ✅ OPTIMIZATION 1: Fetch all providers once
    const providers = await prisma.insuranceProvider.findMany({
      where: { isActive: true }
    })

    if (providers.length === 0) {
      return NextResponse.json({
        error: 'No active insurance providers configured',
        totalGaps: 0,
        gaps: [],
        criticalIssue: true,
        recommendations: ['Add at least one active insurance provider to the system']
      })
    }

    // ✅ OPTIMIZATION 2: Create provider lookup map
    const providerMap = new Map(providers.map(p => [p.id, p]))

    // ✅ OPTIMIZATION 3: Fetch all cars with host info in one query
    const cars = await prisma.rentalCar.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            insuranceProviderId: true,
            insuranceProvider: {
              select: {
                id: true,
                name: true,
                type: true,
                isActive: true,
                vehicleValueMin: true,
                vehicleValueMax: true,
                excludedMakes: true,
                excludedModels: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // ✅ OPTIMIZATION 4: Fetch all overrides once
    const overrides = await prisma.vehicleInsuranceOverride.findMany({
      where: {
        carId: {
          in: cars.map(c => c.id)
        }
      },
      include: { insuranceProvider: true }
    })

    // Create override lookup map
    const overrideMap = new Map(overrides.map(o => [o.carId, o]))

    // ✅ OPTIMIZATION 5: Check coverage in-memory (no more queries!)
    const gaps: any[] = []
    const covered: any[] = []

    for (const car of cars) {
      const override = overrideMap.get(car.id)
      
      // Check coverage using in-memory logic
      const coverageResult = checkVehicleCoverageInMemory(car, providers)
      const hasValidCoverage = coverageResult.hasCoverage || !!override

      const carData = {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        dailyRate: car.dailyRate,
        estimatedValue: car.estimatedValue || car.dailyRate * 365 * 0.15,
        isActive: car.isActive,
        host: car.host,
        
        // Coverage info
        hasCoverage: coverageResult.hasCoverage,
        coverageSource: coverageResult.coverageSource,
        coverageProvider: coverageResult.provider,
        eligibleProviders: coverageResult.eligibleProviders || [],
        warnings: coverageResult.warnings,
        
        // Override info
        hasOverride: !!override,
        override: override ? {
          provider: {
            id: (override as any).insuranceProvider?.id ?? override.providerId,
            name: (override as any).insuranceProvider?.name ?? 'Unknown'
          },
          reason: override.reason,
          overriddenBy: override.overriddenBy
        } : null
      }

      if (!hasValidCoverage) {
        gaps.push(carData)
      } else {
        covered.push(carData)
      }
    }

    // Categorize gaps
    const hostGaps = gaps.filter(g => 
      g.coverageSource === 'NONE' && 
      g.warnings.includes('Host has no assigned insurance provider')
    )
    
    const vehicleRuleGaps = gaps.filter(g => 
      g.coverageSource === 'NONE' && 
      g.warnings.includes('Vehicle does not match any provider rules')
    )
    
    const criticalGaps = gaps.filter(g => g.isActive && !g.hasOverride)
    const warningGaps = gaps.filter(g => !g.isActive || g.hasOverride)

    return NextResponse.json({
      summary: {
        totalVehicles: cars.length,
        totalCovered: covered.length,
        totalGaps: gaps.length,
        criticalGaps: criticalGaps.length,
        warningGaps: warningGaps.length,
        hostGaps: hostGaps.length,
        vehicleRuleGaps: vehicleRuleGaps.length,
        activeProviders: providers.length
      },
      
      hostGaps: hostGaps.map(g => ({
        ...g,
        gapType: 'HOST_NO_INSURANCE',
        recommendation: `Assign insurance provider to host: ${g.host.name}`
      })),
      
      vehicleRuleGaps: vehicleRuleGaps.map(g => ({
        ...g,
        gapType: 'VEHICLE_EXCLUDED',
        recommendation: g.host?.insuranceProvider 
          ? `Vehicle excluded from ${g.host.insuranceProvider.name}. Add override or adjust provider rules.`
          : 'Assign insurance provider to host or add override'
      })),
      
      criticalGaps,
      warningGaps,
      allGaps: gaps,
      
      providers: providers.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        vehicleValueMin: p.vehicleValueMin,
        vehicleValueMax: p.vehicleValueMax,
        excludedMakes: p.excludedMakes,
        excludedModels: p.excludedModels
      })),
      
      recommendations: generateRecommendations(gaps, providers, hostGaps, vehicleRuleGaps)
    })

  } catch (error) {
    console.error('Coverage gaps detection error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to detect coverage gaps',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * ✅ NEW: Check coverage in-memory (no database queries!)
 */
function checkVehicleCoverageInMemory(car: any, providers: any[]) {
  const warnings: string[] = []
  const eligibleProviders: any[] = []

  // Priority 1: Check host-assigned insurance
  if (car.host?.insuranceProvider) {
    const provider = car.host.insuranceProvider
    
    // Check if vehicle matches provider rules
    const estimatedValue = car.estimatedValue || car.dailyRate * 365 * 0.15
    
    // Check value range
    if (provider.vehicleValueMin && estimatedValue < provider.vehicleValueMin) {
      warnings.push(`Vehicle value ($${estimatedValue.toFixed(0)}) below provider minimum ($${provider.vehicleValueMin})`)
    } else if (provider.vehicleValueMax && estimatedValue > provider.vehicleValueMax) {
      warnings.push(`Vehicle value ($${estimatedValue.toFixed(0)}) above provider maximum ($${provider.vehicleValueMax})`)
    }
    
    // Check excluded makes
    if (provider.excludedMakes?.includes(car.make)) {
      warnings.push(`Make '${car.make}' is excluded by provider`)
    }
    
    // Check excluded models
    if (provider.excludedModels?.includes(car.model)) {
      warnings.push(`Model '${car.model}' is excluded by provider`)
    }
    
    // If no warnings, host provider covers this vehicle
    if (warnings.length === 0) {
      return {
        hasCoverage: true,
        coverageSource: 'HOST_INSURANCE',
        provider: {
          id: provider.id,
          name: provider.name,
          type: provider.type
        },
        warnings: [],
        eligibleProviders: [provider]
      }
    }
  } else {
    warnings.push('Host has no assigned insurance provider')
  }

  // Priority 2: Check all providers for matches (fallback)
  for (const provider of providers) {
    const estimatedValue = car.estimatedValue || car.dailyRate * 365 * 0.15
    
    const meetsValueRange = 
      (!provider.vehicleValueMin || estimatedValue >= provider.vehicleValueMin) &&
      (!provider.vehicleValueMax || estimatedValue <= provider.vehicleValueMax)
    
    const notExcludedMake = !provider.excludedMakes?.includes(car.make)
    const notExcludedModel = !provider.excludedModels?.includes(car.model)
    
    if (meetsValueRange && notExcludedMake && notExcludedModel) {
      eligibleProviders.push(provider)
    }
  }

  if (eligibleProviders.length > 0) {
    warnings.push('Vehicle does not match any provider rules')
  }

  return {
    hasCoverage: false,
    coverageSource: 'NONE',
    provider: null,
    warnings,
    eligibleProviders
  }
}

/**
 * Generate recommendations to fix coverage gaps
 */
function generateRecommendations(
  gaps: any[], 
  providers: any[],
  hostGaps: any[],
  vehicleRuleGaps: any[]
): string[] {
  const recommendations: string[] = []

  if (gaps.length === 0) {
    return ['✅ All vehicles have valid insurance coverage']
  }

  if (hostGaps.length > 0) {
    const uniqueHosts = new Set(hostGaps.map(g => g.host.id))
    recommendations.push(
      `🔴 CRITICAL: ${uniqueHosts.size} host(s) have no insurance assigned. Assign insurance to these hosts to cover ${hostGaps.length} vehicle(s).`
    )
    
    const hostNames = Array.from(new Set(hostGaps.map(g => g.host.name)))
    if (hostNames.length <= 5) {
      recommendations.push(`   Hosts needing insurance: ${hostNames.join(', ')}`)
    }
  }

  if (vehicleRuleGaps.length > 0) {
    recommendations.push(
      `⚠️ ${vehicleRuleGaps.length} vehicle(s) excluded by provider rules. Options: adjust provider coverage rules, add manual overrides, or assign different provider to host.`
    )
  }

  const highValueGaps = gaps.filter(g => g.estimatedValue > 75000)
  const lowValueGaps = gaps.filter(g => g.estimatedValue < 25000)
  const specificMakes = new Set(gaps.map(g => g.make))

  if (highValueGaps.length > 0) {
    recommendations.push(
      `💰 ${highValueGaps.length} high-value vehicles (>$75k) lack coverage. Consider adding a luxury/exotic insurance provider.`
    )
  }

  if (lowValueGaps.length > 0) {
    recommendations.push(
      `💵 ${lowValueGaps.length} economy vehicles (<$25k) lack coverage. Expand existing provider's coverage range.`
    )
  }

  if (specificMakes.size > 0 && specificMakes.size <= 5) {
    const makes = Array.from(specificMakes).join(', ')
    recommendations.push(
      `🚗 Vehicles from ${makes} are not covered. Review excluded makes in provider settings.`
    )
  }

  if (providers.length === 1) {
    recommendations.push(
      `📋 Only one insurance provider active. Add a backup provider for redundancy.`
    )
  }

  recommendations.push(
    `🔧 Quick fixes: (1) Assign insurance to hosts without coverage, (2) Add manual overrides for excluded vehicles, (3) Adjust provider rules.`
  )

  return recommendations
}
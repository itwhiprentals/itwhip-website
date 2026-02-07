// app/api/fleet/insurance/providers/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

// Validation helper functions
function validateCoverageTiers(tiers: any) {
  if (!Array.isArray(tiers) || tiers.length === 0) {
    return { valid: false, errors: ['Coverage tiers must be a non-empty array'] }
  }
  
  const errors: string[] = []
  tiers.forEach((tier: any, index: number) => {
    if (!tier.tier) errors.push(`Tier ${index + 1}: Name is required`)
    if (!tier.deductible || tier.deductible < 0) errors.push(`Tier ${index + 1}: Valid deductible required`)
    if (!tier.liabilityCoverage || tier.liabilityCoverage < 0) errors.push(`Tier ${index + 1}: Valid liability coverage required`)
  })
  
  return { valid: errors.length === 0, errors }
}

function validatePricingRules(rules: any) {
  if (!Array.isArray(rules) || rules.length === 0) {
    return { valid: false, errors: ['Pricing rules must be a non-empty array'] }
  }
  
  const errors: string[] = []
  rules.forEach((rule: any, index: number) => {
    if (!rule.tier) errors.push(`Rule ${index + 1}: Tier name is required`)
    if (!rule.dailyRate || rule.dailyRate < 0) errors.push(`Rule ${index + 1}: Valid daily rate required`)
  })
  
  return { valid: errors.length === 0, errors }
}

function validateVehicleRules(rules: any) {
  if (!rules) return { valid: true, errors: [] }
  
  const errors: string[] = []
  
  // Validate categories
  if (rules.categories) {
    Object.entries(rules.categories).forEach(([category, config]: [string, any]) => {
      if (config.multiplier && (config.multiplier < 0.1 || config.multiplier > 10)) {
        errors.push(`${category}: Multiplier must be between 0.1 and 10`)
      }
      if (config.minValue && config.maxValue && config.minValue > config.maxValue) {
        errors.push(`${category}: Min value cannot exceed max value`)
      }
    })
  }
  
  // Validate risk levels
  if (rules.riskLevels) {
    Object.entries(rules.riskLevels).forEach(([level, config]: [string, any]) => {
      if (config.multiplier && (config.multiplier < 0.1 || config.multiplier > 10)) {
        errors.push(`${level}: Multiplier must be between 0.1 and 10`)
      }
    })
  }
  
  // Validate value range
  if (rules.valueRange) {
    if (rules.valueRange.min < 0) errors.push('Minimum value cannot be negative')
    if (rules.valueRange.max < rules.valueRange.min) {
      errors.push('Maximum value must be greater than minimum value')
    }
  }
  
  // Validate age limit
  if (rules.vehicleAgeLimit && (rules.vehicleAgeLimit < 1 || rules.vehicleAgeLimit > 50)) {
    errors.push('Vehicle age limit must be between 1 and 50 years')
  }
  
  return { valid: errors.length === 0, errors }
}

/**
 * GET /api/fleet/insurance/providers/[id]
 * Get single provider details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const provider = await prisma.insuranceProvider.findUnique({
      where: { id: id },
      include: {
        policies: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            booking: {
              select: {
                bookingCode: true,
                startDate: true,
                endDate: true
              }
            }
          }
        },
        rateHistory: {
          take: 20,
          orderBy: { createdAt: 'desc' }
        },
        vehicleOverrides: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            car: {
              select: {
                make: true,
                model: true,
                year: true,
                id: true
              }
            }
          }
        },
        _count: {
          select: {
            policies: true,
            rateHistory: true,
            vehicleOverrides: true
          }
        }
      }
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(provider)

  } catch (error) {
    console.error('Provider fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch provider' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/fleet/insurance/providers/[id]
 * Update provider details including vehicle rules
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const {
      name,
      type,
      isActive,
      isPrimary,
      coverageTiers,
      pricingRules,
      vehicleRules, // NEW: Vehicle classification rules
      vehicleValueMin,
      vehicleValueMax,
      excludedMakes,
      excludedModels,
      coverageNotes,
      contactEmail,
      contactPhone,
      apiEndpoint,
      apiEndpointPlaceholder,
      apiKey,
      webhookUrl,
      revenueShare,
      contractStart,
      contractEnd,
      contractTerms
    } = body

    // Validate coverage tiers if provided
    if (coverageTiers) {
      const validation = validateCoverageTiers(coverageTiers)
      if (!validation.valid) {
        return NextResponse.json(
          { 
            error: 'Invalid coverage tiers configuration',
            details: validation.errors
          },
          { status: 400 }
        )
      }
    }

    // Validate pricing rules if provided
    if (pricingRules) {
      const validation = validatePricingRules(pricingRules)
      if (!validation.valid) {
        return NextResponse.json(
          { 
            error: 'Invalid pricing rules configuration',
            details: validation.errors
          },
          { status: 400 }
        )
      }
    }

    // Validate vehicle rules if provided
    if (vehicleRules) {
      const validation = validateVehicleRules(vehicleRules)
      if (!validation.valid) {
        return NextResponse.json(
          { 
            error: 'Invalid vehicle rules configuration',
            details: validation.errors
          },
          { status: 400 }
        )
      }
    }

    // If setting as primary, unset other primary providers
    if (isPrimary === true) {
      await prisma.insuranceProvider.updateMany({
        where: { 
          id: { not: id },
          isPrimary: true
        },
        data: { isPrimary: false }
      })
    }

    // Update provider
    const provider = await prisma.insuranceProvider.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(isActive !== undefined && { isActive }),
        ...(isPrimary !== undefined && { isPrimary }),
        ...(coverageTiers && { coverageTiers }),
        ...(pricingRules && { pricingRules }),
        ...(vehicleRules !== undefined && { vehicleRules }), // Store vehicle rules as JSON
        ...(vehicleValueMin !== undefined && { vehicleValueMin }),
        ...(vehicleValueMax !== undefined && { vehicleValueMax }),
        ...(excludedMakes && { excludedMakes }),
        ...(excludedModels && { excludedModels }),
        ...(coverageNotes !== undefined && { coverageNotes }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(apiEndpoint !== undefined && { apiEndpoint }),
        ...(apiEndpointPlaceholder !== undefined && { apiEndpointPlaceholder }),
        ...(apiKey !== undefined && { apiKey }),
        ...(webhookUrl !== undefined && { webhookUrl }),
        ...(revenueShare !== undefined && { revenueShare }),
        ...(contractStart !== undefined && { 
          contractStart: contractStart ? new Date(contractStart) : null 
        }),
        ...(contractEnd !== undefined && { 
          contractEnd: contractEnd ? new Date(contractEnd) : null 
        }),
        ...(contractTerms !== undefined && { contractTerms })
      }
    })

    // If vehicle rules were updated, check if any cars need re-evaluation
    if (vehicleRules) {
      await reevaluateVehicleEligibility(id)
    }

    // Log the update
    await prisma.adminActivityLog.create({
      data: {
        adminId: 'SYSTEM', // Replace with actual admin ID from auth
        action: 'UPDATE_PROVIDER',
        targetId: id,
        targetType: 'InsuranceProvider',
        details: {
          updatedFields: Object.keys(body),
          vehicleRulesUpdated: !!vehicleRules
        }
      }
    })

    return NextResponse.json({
      success: true,
      provider
    })

  } catch (error) {
    console.error('Provider update error:', error)
    return NextResponse.json(
      { error: 'Failed to update provider' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/fleet/insurance/providers/[id]
 * Delete provider (soft delete by setting inactive)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if provider has active policies
    const activePolicies = await prisma.insurancePolicy.count({
      where: {
        providerId: id,
        status: 'ACTIVE'
      }
    })

    if (activePolicies > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete provider with active policies',
          activePolicies
        },
        { status: 400 }
      )
    }

    // Soft delete by setting inactive
    const provider = await prisma.insuranceProvider.update({
      where: { id: id },
      data: { 
        isActive: false,
        isPrimary: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Provider deactivated successfully',
      provider
    })

  } catch (error) {
    console.error('Provider delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete provider' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to re-evaluate vehicle eligibility after rules change
 */
async function reevaluateVehicleEligibility(providerId: string) {
  try {
    // Get all active cars
    const cars = await prisma.rentalCar.findMany({
      where: {
        isActive: true
      },
      include: {
        classification: true
      }
    })
    
    // Import eligibility checker
    const { checkVehicleEligibility } = await import('@/app/lib/insurance/eligibility-engine')
    
    let needsReviewCount = 0
    let ineligibleCount = 0
    
    for (const car of cars) {
      const eligibility = await checkVehicleEligibility(car, providerId)
      
      // Update car insurance status based on new rules
      await prisma.rentalCar.update({
        where: { id: car.id },
        data: {
          insuranceEligible: eligibility.eligible,
          requiresManualUnderwriting: eligibility.requiresManualReview,
          insuranceNotes: eligibility.reason
        }
      })
      
      if (!eligibility.eligible) ineligibleCount++
      if (eligibility.requiresManualReview) needsReviewCount++
    }
    
    // Create notification if cars need review
    if (needsReviewCount > 0 || ineligibleCount > 0) {
      await prisma.adminNotification.create({
        data: {
          type: 'INSURANCE_RULES_IMPACT',
          title: 'Vehicle Insurance Status Changed',
          message: `Rule changes affected ${ineligibleCount} ineligible and ${needsReviewCount} needing review`,
          priority: 'MEDIUM',
          status: 'UNREAD',
          relatedId: providerId,
          relatedType: 'provider',
          actionRequired: needsReviewCount > 0,
          metadata: {
            providerId,
            ineligibleCount,
            needsReviewCount,
            totalCarsChecked: cars.length
          }
        }
      })
    }
    
  } catch (error) {
    console.error('Failed to re-evaluate vehicle eligibility:', error)
  }
}
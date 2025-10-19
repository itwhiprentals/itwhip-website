// app/api/fleet/insurance/providers/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { validateCoverageTiers, validatePricingRules } from '@/lib/insurance-utils'

/**
 * GET /api/fleet/insurance/providers/[id]
 * Get single provider details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const provider = await prisma.insuranceProvider.findUnique({
      where: { id: params.id },
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
          orderBy: { createdAt: 'desc' }
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
 * Update provider details
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const {
      name,
      type,
      isActive,
      isPrimary,
      coverageTiers,
      pricingRules,
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

    // If setting as primary, unset other primary providers
    if (isPrimary === true) {
      await prisma.insuranceProvider.updateMany({
        where: { 
          id: { not: params.id },
          isPrimary: true
        },
        data: { isPrimary: false }
      })
    }

    // Update provider
    const provider = await prisma.insuranceProvider.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(isActive !== undefined && { isActive }),
        ...(isPrimary !== undefined && { isPrimary }),
        ...(coverageTiers && { coverageTiers }),
        ...(pricingRules && { pricingRules }),
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
  { params }: { params: { id: string } }
) {
  try {
    // Check if provider has active policies
    const activePolicies = await prisma.insurancePolicy.count({
      where: {
        providerId: params.id,
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
      where: { id: params.id },
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
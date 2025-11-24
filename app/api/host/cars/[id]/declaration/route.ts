// app/api/host/cars/[id]/declaration/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { getDeclarationConfig, DECLARATION_CONFIGS } from '@/app/lib/constants/declarations'
import { sendEmail } from '@/app/lib/email/sender'
import type { DeclarationType } from '@/app/types/compliance'

/**
 * PATCH /api/host/cars/[id]/declaration
 * 
 * Updates the vehicle's usage declaration (primaryUse field)
 * 
 * CRITICAL: This does NOT change earnings tier (revenueSplit)
 * Earnings tier is based on insurance level, not declaration
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: carId } = await params
  const hostId = request.headers.get('x-host-id')

  if (!hostId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { declaration } = body

    // Validate declaration type
    if (!declaration || !['Rental', 'Personal', 'Business'].includes(declaration)) {
      return NextResponse.json(
        { error: 'Invalid declaration type. Must be: Rental, Personal, or Business' },
        { status: 400 }
      )
    }

    // Verify car ownership
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Vehicle not found or access denied' },
        { status: 404 }
      )
    }

    // Check if declaration actually changed
    if (car.primaryUse === declaration) {
      return NextResponse.json({
        success: true,
        message: 'Declaration unchanged',
        data: {
          carId: car.id,
          declaration: car.primaryUse,
          earningsTier: car.revenueSplit
        }
      })
    }

    const oldDeclaration = car.primaryUse || 'Rental'
    const oldConfig = getDeclarationConfig(oldDeclaration as DeclarationType)
    const newConfig = getDeclarationConfig(declaration as DeclarationType)

    // Update the vehicle's declaration
    const updatedCar = await prisma.rentalCar.update({
      where: { id: carId },
      data: {
        primaryUse: declaration
        // ✅ CRITICAL: We do NOT update revenueSplit here
        // Revenue split is based on insuranceType, not declaration
      }
    })

    // Log the activity
    try {
      await prisma.activityLog.create({
        data: {
          entityType: 'CAR',
          entityId: carId,
          hostId,
          action: 'DECLARATION_UPDATED',
          category: 'VEHICLE',
          severity: 'INFO',
          description: `Usage declaration changed from "${oldConfig.label}" to "${newConfig.label}"`,
          oldValue: {
            declaration: oldDeclaration,
            label: oldConfig.label,
            maxGap: oldConfig.maxGap
          },
          newValue: {
            declaration,
            label: newConfig.label,
            maxGap: newConfig.maxGap
          },
          metadata: {
            oldAllowedGap: oldConfig.maxGap,
            newAllowedGap: newConfig.maxGap,
            earningsTier: car.revenueSplit,
            insuranceType: car.insuranceType,
            note: 'Earnings tier unchanged - based on insurance level'
          }
        }
      })
    } catch (logError) {
      console.error('Failed to log declaration change:', logError)
      // Continue even if logging fails
    }

    // Send confirmation email to host
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Declaration Updated</h2>
          <p>Hi ${car.host.firstName},</p>
          
          <p>Your vehicle declaration has been updated:</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Vehicle:</strong> ${car.year} ${car.make} ${car.model}</p>
            <p><strong>Old Declaration:</strong> ${oldConfig.label} (${oldConfig.maxGap} miles allowed)</p>
            <p><strong>New Declaration:</strong> ${newConfig.label} (${newConfig.maxGap} miles allowed)</p>
          </div>

          <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>⚠️ Important:</strong></p>
            <p>${newConfig.insuranceNote}</p>
            <p><strong>Tax Implication:</strong> ${newConfig.taxImplication}</p>
            <p><strong>Claim Impact:</strong> ${newConfig.claimImpact}</p>
          </div>

          <p><strong>Your Earnings Tier:</strong> ${car.revenueSplit}%</p>
          <p style="color: #6B7280; font-size: 14px;">
            <em>Note: Your earnings tier is based on your insurance level and remains unchanged.</em>
          </p>

          <p>If you have any questions, please contact support.</p>
          
          <p>Best regards,<br>The ItWhip Team</p>
        </div>
      `

      await sendEmail({
        to: car.host.email,
        subject: `Declaration Updated: ${car.year} ${car.make} ${car.model}`,
        html: emailHtml
      })
    } catch (emailError) {
      console.error('Failed to send declaration update email:', emailError)
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Declaration updated successfully',
      data: {
        carId: updatedCar.id,
        declaration: updatedCar.primaryUse,
        declarationLabel: newConfig.label,
        allowedGap: newConfig.maxGap,
        earningsTier: updatedCar.revenueSplit,
        insuranceType: updatedCar.insuranceType,
        note: 'Earnings tier unchanged - based on insurance level'
      }
    })

  } catch (error) {
    console.error('Failed to update declaration:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update declaration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/host/cars/[id]/declaration
 * 
 * Get current declaration and compliance info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: carId } = await params
  const hostId = request.headers.get('x-host-id')

  if (!hostId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  try {
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: carId,
        hostId
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        primaryUse: true,
        revenueSplit: true,
        insuranceType: true,
        totalTrips: true
      }
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    const declaration = (car.primaryUse || 'Rental') as DeclarationType
    const config = getDeclarationConfig(declaration)

    return NextResponse.json({
      success: true,
      data: {
        carId: car.id,
        vehicle: `${car.year} ${car.make} ${car.model}`,
        declaration: {
          type: declaration,
          label: config.label,
          maxGap: config.maxGap,
          criticalGap: config.criticalGap,
          description: config.description,
          insuranceNote: config.insuranceNote,
          taxImplication: config.taxImplication,
          claimImpact: config.claimImpact
        },
        earningsTier: {
          percentage: car.revenueSplit,
          insuranceType: car.insuranceType
        },
        totalTrips: car.totalTrips,
        availableDeclarations: Object.keys(DECLARATION_CONFIGS).map(key => {
          const cfg = DECLARATION_CONFIGS[key as DeclarationType]
          return {
            value: key,
            label: cfg.label,
            maxGap: cfg.maxGap,
            description: cfg.description
          }
        })
      }
    })

  } catch (error) {
    console.error('Failed to fetch declaration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch declaration' },
      { status: 500 }
    )
  }
}
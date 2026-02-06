// app/api/bookings/verify-dl/route.ts
// AI-powered driver's license verification endpoint
// Used during booking to verify DL before Stripe verification
// POST /api/bookings/verify-dl

import { NextRequest, NextResponse } from 'next/server'
import { quickVerifyDriverLicense, compareNames, validateAge } from '@/app/lib/booking/ai/license-analyzer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { frontImageUrl, backImageUrl, expectedName, expectedDob } = body

    // Validate required fields
    if (!frontImageUrl) {
      return NextResponse.json(
        { error: 'Front image URL is required' },
        { status: 400 }
      )
    }

    // Verify the driver's license using Claude Vision
    const result = await quickVerifyDriverLicense(frontImageUrl, backImageUrl)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        validation: result.validation,
      }, { status: 400 })
    }

    // Additional validation checks
    const validationResults = {
      licenseValid: result.validation.isValid,
      licenseExpired: result.validation.isExpired,
      confidence: result.confidence,
      redFlags: result.validation.redFlags,
      nameMatch: false,
      ageValid: false,
    }

    // Check name match if provided
    if (expectedName && result.data?.fullName) {
      validationResults.nameMatch = compareNames(result.data.fullName, expectedName)
      if (!validationResults.nameMatch) {
        validationResults.redFlags.push('Name on license does not match booking name')
      }
    }

    // Check age if DOB extracted
    // If DOB is not extracted, skip age check (don't fail, let other checks determine)
    if (result.data?.dateOfBirth) {
      validationResults.ageValid = validateAge(result.data.dateOfBirth, 18)
      if (!validationResults.ageValid) {
        validationResults.redFlags.push('Driver must be at least 18 years old')
      }
    } else {
      // If DOB not extracted, don't fail on age - assume valid for now
      // Full Stripe verification will catch underage users later
      validationResults.ageValid = true
    }

    // Determine overall pass/fail
    const quickVerifyPassed =
      result.confidence >= 70 &&
      !result.validation.isExpired &&
      result.validation.redFlags.length === 0 &&
      validationResults.redFlags.length === 0 &&
      (expectedName ? validationResults.nameMatch : true) &&
      validationResults.ageValid

    return NextResponse.json({
      success: true,
      quickVerifyPassed,
      requiresFullVerification: true, // Always require Stripe during onboarding
      confidence: result.confidence,
      data: result.data,
      validation: {
        ...result.validation,
        nameMatch: validationResults.nameMatch,
        ageValid: validationResults.ageValid,
        allRedFlags: validationResults.redFlags,
      },
      recommendation: quickVerifyPassed
        ? 'Proceed with booking. Full Stripe verification required during onboarding.'
        : 'Manual review recommended. Consider requesting additional documents.',
    })
  } catch (error) {
    console.error('[API] DL verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

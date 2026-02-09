// app/api/bookings/verify-dl/route.ts
// AI-powered driver's license verification endpoint
// Claude is the FIRST verification — guests book without accounts, no Stripe data yet.
// POST /api/bookings/verify-dl

import { NextRequest, NextResponse } from 'next/server'
import {
  quickVerifyDriverLicense,
  compareNames,
  validateAge,
  type NameComparisonResult,
} from '@/app/lib/booking/ai/license-analyzer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { frontImageUrl, backImageUrl, expectedName, expectedDob, stateHint } = body

    if (!frontImageUrl) {
      return NextResponse.json(
        { error: 'Front image URL is required' },
        { status: 400 }
      )
    }

    // Verify the driver's license using Claude Vision
    const result = await quickVerifyDriverLicense(frontImageUrl, backImageUrl, {
      stateHint,
      expectedName,
    })

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        validation: result.validation,
      }, { status: 400 })
    }

    // Track critical flags separately from informational
    const criticalFlags = [...(result.validation.criticalFlags || [])]
    const informationalFlags = [...(result.validation.informationalFlags || [])]

    // Name comparison with detailed reporting
    let nameComparison: NameComparisonResult | null = null
    let nameMatch = true

    if (expectedName && result.data?.fullName) {
      nameComparison = compareNames(result.data.fullName, expectedName)
      nameMatch = nameComparison.match
      if (!nameMatch) {
        // Name mismatch is critical — but now we show what was parsed
        criticalFlags.push(
          `Name mismatch: DL shows "${result.data.fullName}" (parsed as ${nameComparison.dlParsed.first} ${nameComparison.dlParsed.last}), ` +
          `booking name is "${expectedName}" (parsed as ${nameComparison.bookingParsed.first} ${nameComparison.bookingParsed.last})`
        )
      }
    }

    // Age validation
    let ageValid = true
    if (result.data?.dateOfBirth) {
      ageValid = validateAge(result.data.dateOfBirth, 18)
      if (!ageValid) {
        criticalFlags.push('Driver must be at least 18 years old')
      }
    }

    // Pass/fail based on CRITICAL flags only (not informational)
    const quickVerifyPassed =
      result.confidence >= 70 &&
      !result.validation.isExpired &&
      criticalFlags.length === 0 &&
      (expectedName ? nameMatch : true) &&
      ageValid

    return NextResponse.json({
      success: true,
      quickVerifyPassed,
      requiresFullVerification: true,
      confidence: result.confidence,
      data: result.data,
      // Full analysis detail for admin dashboard
      extractedFields: result.extractedFields,
      securityFeatures: result.securityFeatures,
      photoQuality: result.photoQuality,
      stateSpecificChecks: result.stateSpecificChecks,
      // Validation results
      validation: {
        isExpired: result.validation.isExpired,
        isValid: result.validation.isValid,
        nameMatch,
        nameComparison,
        ageValid,
        criticalFlags,
        informationalFlags,
        // Backward-compatible: combined list for legacy consumers
        allRedFlags: [...criticalFlags, ...informationalFlags],
        redFlags: criticalFlags, // Only critical flags in the legacy field
      },
      model: result.model,
      recommendation: quickVerifyPassed
        ? 'Proceed with booking. Full Stripe verification required during onboarding.'
        : criticalFlags.length > 0
          ? 'Manual review recommended. Critical issues detected.'
          : 'Proceed with caution. Minor quality issues noted.',
    })
  } catch (error) {
    console.error('[API] DL verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

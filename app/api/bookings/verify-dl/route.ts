// app/api/bookings/verify-dl/route.ts
// AI-powered driver's license verification endpoint
// Claude is the FIRST verification — guests book without accounts, no Stripe data yet.
// POST /api/bookings/verify-dl

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import {
  quickVerifyDriverLicense,
  compareNames,
  validateAge,
  type NameComparisonResult,
} from '@/app/lib/booking/ai/license-analyzer'
import { decodeAndValidateBarcode } from '@/app/lib/booking/ai/barcode-validator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { frontImageUrl, backImageUrl, expectedName, expectedDob, stateHint, bookingId, guestEmail } = body

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

    // Server-side barcode cross-validation (if back image provided)
    let barcodeValidation = null
    if (backImageUrl && result.data) {
      try {
        barcodeValidation = await decodeAndValidateBarcode(backImageUrl, {
          fullName: result.data.fullName,
          dateOfBirth: result.data.dateOfBirth,
          licenseNumber: result.data.licenseNumber,
          state: result.data.stateOrCountry,
        })
        // Merge barcode mismatches as critical flags
        if (barcodeValidation.mismatches.length > 0) {
          criticalFlags.push(...barcodeValidation.mismatches)
        }
        // Merge notes as informational
        if (barcodeValidation.notes.length > 0) {
          informationalFlags.push(...barcodeValidation.notes)
        }
        console.log(`[DL Verify] Barcode validation: decoded=${barcodeValidation.decoded}, mismatches=${barcodeValidation.mismatches.length}`)
      } catch (barcodeErr) {
        console.error('[DL Verify] Barcode validation error (non-blocking):', barcodeErr)
        informationalFlags.push('Barcode cross-validation could not be performed')
      }
    }

    // Pass/fail based on CRITICAL flags only (not informational)
    const quickVerifyPassed =
      result.confidence >= 70 &&
      !result.validation.isExpired &&
      criticalFlags.length === 0 &&
      (expectedName ? nameMatch : true) &&
      ageValid

    const responseData = {
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
      barcodeValidation: barcodeValidation ? {
        decoded: barcodeValidation.decoded,
        data: barcodeValidation.barcodeData || null,
        mismatches: barcodeValidation.mismatches,
      } : null,
      recommendation: quickVerifyPassed
        ? 'Proceed with booking. Full Stripe verification required during onboarding.'
        : criticalFlags.length > 0
          ? 'Manual review recommended. Critical issues detected.'
          : 'Proceed with caution. Minor quality issues noted.',
    }

    // Store AI verification results to DB if bookingId is provided
    if (bookingId) {
      try {
        await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: {
            aiVerificationResult: JSON.parse(JSON.stringify(responseData)),
            aiVerificationScore: result.confidence,
            aiVerificationAt: new Date(),
            aiVerificationModel: result.model || 'claude-sonnet-4-5',
          }
        })
        console.log(`[DL Verify] Stored AI results for booking ${bookingId} — score: ${result.confidence}, passed: ${quickVerifyPassed}`)
      } catch (dbErr) {
        console.error(`[DL Verify] Failed to store results for booking ${bookingId}:`, dbErr)
      }
    }

    // Log EVERY verification attempt (pass and fail) for fleet dashboard visibility
    try {
      const recommendation = quickVerifyPassed ? 'APPROVE' : criticalFlags.length > 0 ? 'REJECT' : 'REVIEW'
      await prisma.dLVerificationLog.create({
        data: {
          guestEmail: guestEmail || null,
          guestName: expectedName || result.data?.fullName || null,
          frontImageUrl,
          backImageUrl: backImageUrl || null,
          passed: quickVerifyPassed,
          score: result.confidence,
          recommendation,
          result: JSON.parse(JSON.stringify(responseData)),
          criticalFlags: criticalFlags.length > 0 ? criticalFlags : undefined,
          infoFlags: informationalFlags.length > 0 ? informationalFlags : undefined,
          extractedName: result.data?.fullName || null,
          extractedState: result.data?.stateOrCountry || null,
          model: result.model || 'claude-sonnet-4-5',
          bookingId: bookingId || null,
        },
      })
      console.log(`[DL Verify] Logged verification: ${quickVerifyPassed ? 'PASS' : 'FAIL'} | ${result.data?.fullName || 'unknown'} | score: ${result.confidence}`)
    } catch (logErr) {
      console.error('[DL Verify] Failed to log verification attempt:', logErr)
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('[API] DL verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

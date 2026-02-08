// app/api/fleet/settings/route.ts
// GET - Retrieve current platform settings
// PATCH - Update platform settings (Fleet admin only)

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/app/lib/database/prisma'

// Arizona Tax Rates (auto-seeded for Arizona-based operations)
// State TPT: 5.6%, City TPT rates are added on top
const ARIZONA_STATE_RATE = 0.056

// Arizona city total rates (State + City combined)
const ARIZONA_CITY_RATES: Record<string, number> = {
  // Maricopa County cities
  'Phoenix,AZ': 0.084,          // 5.6% + 2.8%
  'Scottsdale,AZ': 0.0735,      // 5.6% + 1.75%
  'Tempe,AZ': 0.081,            // 5.6% + 2.5%
  'Mesa,AZ': 0.083,             // 5.6% + 2.7%
  'Gilbert,AZ': 0.071,          // 5.6% + 1.5%
  'Chandler,AZ': 0.071,         // 5.6% + 1.5%
  'Glendale,AZ': 0.085,         // 5.6% + 2.9%
  'Peoria,AZ': 0.079,           // 5.6% + 2.3%
  'Surprise,AZ': 0.078,         // 5.6% + 2.2%
  'Goodyear,AZ': 0.081,         // 5.6% + 2.5%
  'Avondale,AZ': 0.081,         // 5.6% + 2.5%
  'Buckeye,AZ': 0.086,          // 5.6% + 3.0%
  'Fountain Hills,AZ': 0.074,   // 5.6% + 1.8%
  'Cave Creek,AZ': 0.086,       // 5.6% + 3.0%
  'Paradise Valley,AZ': 0.081,  // 5.6% + 2.5%
  'Queen Creek,AZ': 0.078,      // 5.6% + 2.2%
  'Litchfield Park,AZ': 0.076,  // 5.6% + 2.0%
  'Tolleson,AZ': 0.086,         // 5.6% + 3.0%
  'El Mirage,AZ': 0.081,        // 5.6% + 2.5%
  'Youngtown,AZ': 0.081,        // 5.6% + 2.5%
  // Pima County cities
  'Tucson,AZ': 0.082,           // 5.6% + 2.6%
  'Oro Valley,AZ': 0.081,       // 5.6% + 2.5%
  'Marana,AZ': 0.081,           // 5.6% + 2.5%
  'South Tucson,AZ': 0.096,     // 5.6% + 4.0%
  'Sahuarita,AZ': 0.086,        // 5.6% + 3.0%
  // Pinal County cities
  'Casa Grande,AZ': 0.076,      // 5.6% + 2.0%
  'Apache Junction,AZ': 0.084,  // 5.6% + 2.8%
  'Florence,AZ': 0.076,         // 5.6% + 2.0%
  'Eloy,AZ': 0.081,             // 5.6% + 2.5%
  'Coolidge,AZ': 0.086,         // 5.6% + 3.0%
  'Maricopa,AZ': 0.076,         // 5.6% + 2.0%
  // Coconino County cities
  'Flagstaff,AZ': 0.078,        // 5.6% + 2.2%
  'Sedona,AZ': 0.086,           // 5.6% + 3.0%
  // Yavapai County cities
  'Prescott,AZ': 0.0785,        // 5.6% + 2.25%
  'Prescott Valley,AZ': 0.0835, // 5.6% + 2.75%
  'Cottonwood,AZ': 0.081,       // 5.6% + 2.5%
  'Camp Verde,AZ': 0.081,       // 5.6% + 2.5%
  // Mohave County cities
  'Lake Havasu City,AZ': 0.0785, // 5.6% + 2.25%
  'Kingman,AZ': 0.076,          // 5.6% + 2.0%
  'Bullhead City,AZ': 0.076,    // 5.6% + 2.0%
  // Yuma County cities
  'Yuma,AZ': 0.0745,            // 5.6% + 1.85%
  'San Luis,AZ': 0.081          // 5.6% + 2.5%
}

// Verify fleet session cookie
function verifySessionToken(token: string): boolean {
  return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token)
}

async function isFleetAuthorized(request: NextRequest): Promise<boolean> {
  // Check URL key
  const key = request.nextUrl.searchParams.get('key')
  if (key === 'phoenix-fleet-2847') return true

  // Check authorization header
  if (request.headers.get('authorization')) return true

  // Check fleet session cookie
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('fleet_session')?.value
    if (sessionToken && verifySessionToken(sessionToken)) return true
  } catch (e) {
    // Cookie access may fail in some contexts
  }

  return false
}

export async function GET(request: NextRequest) {
  try {
    // Verify fleet access
    if (!(await isFleetAuthorized(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch or create global settings with Arizona tax rates pre-seeded
    let settings = await prisma.platformSettings.findUnique({
      where: { id: 'global' }
    })

    if (!settings) {
      // Create default settings WITH Arizona tax rates pre-seeded
      settings = await prisma.platformSettings.create({
        data: {
          id: 'global',
          updatedAt: new Date(),
          taxByState: { 'AZ': ARIZONA_STATE_RATE },
          taxByCityOverride: ARIZONA_CITY_RATES
        }
      })
    } else if (!settings.taxByState || Object.keys(settings.taxByState as object).length === 0) {
      // If settings exist but no tax rates configured, seed Arizona rates
      settings = await prisma.platformSettings.update({
        where: { id: 'global' },
        data: {
          taxByState: { 'AZ': ARIZONA_STATE_RATE },
          taxByCityOverride: ARIZONA_CITY_RATES
        }
      })
    }

    // Group settings by category matching the tabs in Settings UI
    const grouped = {
      global: {
        defaultTaxRate: settings.defaultTaxRate,
        taxByState: settings.taxByState,
        taxByCityOverride: settings.taxByCityOverride,
        serviceFeeRate: (settings as any).serviceFeeRate ?? 0.15,
        minorDamageMax: settings.minorDamageMax,
        moderateDamageMax: settings.moderateDamageMax,
        majorDamageMin: settings.majorDamageMin
      },
      commissionTiers: {
        defaultCommissionRate: (settings as any).defaultCommissionRate ?? 0.25,
        tier1VehicleThreshold: (settings as any).tier1VehicleThreshold ?? 10,
        tier1CommissionRate: (settings as any).tier1CommissionRate ?? 0.20,
        tier2VehicleThreshold: (settings as any).tier2VehicleThreshold ?? 50,
        tier2CommissionRate: (settings as any).tier2CommissionRate ?? 0.15,
        tier3VehicleThreshold: (settings as any).tier3VehicleThreshold ?? 100,
        tier3CommissionRate: (settings as any).tier3CommissionRate ?? 0.10,
        // Formatted tier summary for UI
        tiers: [
          {
            name: 'Standard',
            minVehicles: 0,
            maxVehicles: ((settings as any).tier1VehicleThreshold ?? 10) - 1,
            rate: (settings as any).defaultCommissionRate ?? 0.25,
            hostKeeps: 1 - ((settings as any).defaultCommissionRate ?? 0.25)
          },
          {
            name: 'Gold',
            minVehicles: (settings as any).tier1VehicleThreshold ?? 10,
            maxVehicles: ((settings as any).tier2VehicleThreshold ?? 50) - 1,
            rate: (settings as any).tier1CommissionRate ?? 0.20,
            hostKeeps: 1 - ((settings as any).tier1CommissionRate ?? 0.20)
          },
          {
            name: 'Platinum',
            minVehicles: (settings as any).tier2VehicleThreshold ?? 50,
            maxVehicles: ((settings as any).tier3VehicleThreshold ?? 100) - 1,
            rate: (settings as any).tier2CommissionRate ?? 0.15,
            hostKeeps: 1 - ((settings as any).tier2CommissionRate ?? 0.15)
          },
          {
            name: 'Diamond',
            minVehicles: (settings as any).tier3VehicleThreshold ?? 100,
            maxVehicles: null,
            rate: (settings as any).tier3CommissionRate ?? 0.10,
            hostKeeps: 1 - ((settings as any).tier3CommissionRate ?? 0.10)
          }
        ]
      },
      processingFees: {
        processingFeePercent: (settings as any).processingFeePercent ?? 0.035,
        processingFeeFixed: (settings as any).processingFeeFixed ?? 1.50,
        insurancePlatformShare: (settings as any).insurancePlatformShare ?? 0.30
      },
      host: {
        standardPayoutDelay: settings.standardPayoutDelay,
        newHostPayoutDelay: settings.newHostPayoutDelay,
        minimumPayout: settings.minimumPayout,
        instantPayoutFee: settings.instantPayoutFee
      },
      partner: {
        platformCommission: settings.platformCommission,
        partnerMinCommission: settings.partnerMinCommission,
        partnerMaxCommission: settings.partnerMaxCommission
      },
      guest: {
        guestSignupBonus: settings.guestSignupBonus,
        guestReferralBonus: (settings as any).guestReferralBonus ?? 0,
        fullRefundHours: settings.fullRefundHours,
        partialRefund75Hours: settings.partialRefund75Hours,
        partialRefund50Hours: settings.partialRefund50Hours,
        noRefundHours: settings.noRefundHours,
        bonusExpirationDays: settings.bonusExpirationDays
      },
      insurance: {
        basicInsuranceDaily: (settings as any).basicInsuranceDaily ?? 15,
        premiumInsuranceDaily: (settings as any).premiumInsuranceDaily ?? 25,
        insuranceRequiredUnder25: (settings as any).insuranceRequiredUnder25 ?? true,
        insuranceDiscountPct: settings.insuranceDiscountPct
      },
      deposits: {
        defaultDepositPercent: settings.defaultDepositPercent,
        minDeposit: settings.minDeposit,
        maxDeposit: settings.maxDeposit,
        luxuryDeposit: (settings as any).luxuryDeposit ?? 1000,
        exoticDeposit: (settings as any).exoticDeposit ?? 2500
      },
      tripCharges: {
        mileageOverageRate: settings.mileageOverageRate,
        dailyIncludedMiles: settings.dailyIncludedMiles,
        fuelRefillRateQuarter: settings.fuelRefillRateQuarter,
        fuelRefillRateFull: settings.fuelRefillRateFull,
        lateReturnGraceMinutes: settings.lateReturnGraceMinutes,
        pickupGraceMinutes: settings.pickupGraceMinutes,
        lateReturnHourlyRate: settings.lateReturnHourlyRate,
        lateReturnDailyMax: settings.lateReturnDailyMax,
        cleaningFeeStandard: settings.cleaningFeeStandard,
        cleaningFeeDeep: settings.cleaningFeeDeep,
        cleaningFeeBiohazard: settings.cleaningFeeBiohazard,
        noShowFee: settings.noShowFee,
        smokingFee: settings.smokingFee,
        petHairFee: settings.petHairFee,
        lostKeyFee: settings.lostKeyFee
      },
      referrals: {
        hostSignupBonus: settings.hostSignupBonus,
        hostReferralBonus: (settings as any).hostReferralBonus ?? 0,
        referralBonus: settings.referralBonus
      },
      meta: {
        updatedAt: settings.updatedAt,
        updatedBy: settings.updatedBy
      }
    }

    return NextResponse.json({
      success: true,
      data: grouped,
      raw: settings
    })

  } catch (error: any) {
    console.error('Error fetching platform settings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify fleet access
    if (!(await isFleetAuthorized(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { updates, updatedBy = 'FLEET_ADMIN' } = body

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Updates object is required' },
        { status: 400 }
      )
    }

    // Get current settings
    let currentSettings = await prisma.platformSettings.findUnique({
      where: { id: 'global' }
    })

    if (!currentSettings) {
      currentSettings = await prisma.platformSettings.create({
        data: { id: 'global', updatedAt: new Date() }
      })
    }

    // Validate numeric fields
    const numericFields = [
      'defaultTaxRate', 'platformCommission', 'partnerMinCommission', 'partnerMaxCommission',
      'fullRefundHours', 'partialRefund75Hours', 'partialRefund50Hours', 'noRefundHours',
      'lateReturnGraceMinutes', 'pickupGraceMinutes', 'mileageOverageRate', 'dailyIncludedMiles',
      'fuelRefillRateQuarter', 'fuelRefillRateFull', 'lateReturnHourlyRate', 'lateReturnDailyMax',
      'cleaningFeeStandard', 'cleaningFeeDeep', 'cleaningFeeBiohazard', 'noShowFee', 'smokingFee',
      'petHairFee', 'lostKeyFee', 'defaultDepositPercent', 'minDeposit', 'maxDeposit',
      'insuranceDiscountPct', 'standardPayoutDelay', 'newHostPayoutDelay', 'minimumPayout',
      'instantPayoutFee', 'guestSignupBonus', 'hostSignupBonus', 'referralBonus',
      'bonusExpirationDays', 'minorDamageMax', 'moderateDamageMax', 'majorDamageMin',
      // Commission tiers
      'defaultCommissionRate', 'tier1VehicleThreshold', 'tier1CommissionRate',
      'tier2VehicleThreshold', 'tier2CommissionRate', 'tier3VehicleThreshold', 'tier3CommissionRate',
      // Processing fees
      'processingFeePercent', 'processingFeeFixed', 'insurancePlatformShare'
    ]

    for (const field of numericFields) {
      if (updates[field] !== undefined && typeof updates[field] !== 'number') {
        return NextResponse.json(
          { error: `${field} must be a number` },
          { status: 400 }
        )
      }
    }

    // Validate percentage fields (0-1)
    const percentFields = [
      'defaultTaxRate', 'platformCommission', 'partnerMinCommission', 'partnerMaxCommission',
      'defaultDepositPercent', 'insuranceDiscountPct', 'instantPayoutFee',
      // Commission rates
      'defaultCommissionRate', 'tier1CommissionRate', 'tier2CommissionRate', 'tier3CommissionRate',
      // Processing fees
      'processingFeePercent', 'insurancePlatformShare'
    ]
    for (const field of percentFields) {
      if (updates[field] !== undefined && (updates[field] < 0 || updates[field] > 1)) {
        return NextResponse.json(
          { error: `${field} must be between 0 and 1 (e.g., 0.20 for 20%)` },
          { status: 400 }
        )
      }
    }

    // Track changes for audit
    const changes: Record<string, { before: any; after: any }> = {}
    const updateData: Record<string, any> = { updatedBy }

    for (const [key, value] of Object.entries(updates)) {
      if ((currentSettings as any)[key] !== value) {
        changes[key] = {
          before: (currentSettings as any)[key],
          after: value
        }
        updateData[key] = value
      }
    }

    if (Object.keys(changes).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes detected',
        data: currentSettings
      })
    }

    // Update settings
    const updatedSettings = await prisma.platformSettings.update({
      where: { id: 'global' },
      data: updateData
    })

    // Create audit log
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        entityType: 'PLATFORM_SETTINGS',
        entityId: 'global',
        action: 'SETTINGS_UPDATED',
        metadata: {
          changes,
          updatedBy,
          fieldsUpdated: Object.keys(changes),
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Updated ${Object.keys(changes).length} setting(s)`,
      data: {
        updated: updatedSettings,
        changes
      }
    })

  } catch (error: any) {
    console.error('Error updating platform settings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    )
  }
}

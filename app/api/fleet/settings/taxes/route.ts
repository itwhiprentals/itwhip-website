// app/api/fleet/settings/taxes/route.ts
// GET - Get tax configuration by state/city
// PUT - Update tax rates for states/cities

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Common US state abbreviations for validation
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
]

export async function GET(request: NextRequest) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Optional filters
    const state = request.nextUrl.searchParams.get('state')?.toUpperCase()
    const city = request.nextUrl.searchParams.get('city')

    // Fetch settings
    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'global' },
      select: {
        defaultTaxRate: true,
        taxByState: true,
        taxByCityOverride: true
      }
    })

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          defaultRate: 0.10,
          stateRates: {},
          cityOverrides: {}
        }
      })
    }

    const stateRates = (settings.taxByState as Record<string, number>) || {}
    const cityOverrides = (settings.taxByCityOverride as Record<string, number>) || {}

    // Filter by state if provided
    if (state) {
      const filteredStates: Record<string, number> = {}
      const filteredCities: Record<string, number> = {}

      if (stateRates[state]) {
        filteredStates[state] = stateRates[state]
      }

      // Filter city overrides for this state
      for (const [key, rate] of Object.entries(cityOverrides)) {
        if (key.endsWith(`,${state}`)) {
          filteredCities[key] = rate
        }
      }

      // If city is also provided, further filter
      if (city) {
        const cityKey = `${city},${state}`
        const specificCities: Record<string, number> = {}
        if (cityOverrides[cityKey]) {
          specificCities[cityKey] = cityOverrides[cityKey]
        }

        return NextResponse.json({
          success: true,
          data: {
            query: { state, city },
            defaultRate: settings.defaultTaxRate,
            stateRate: stateRates[state] || null,
            cityRate: cityOverrides[cityKey] || null,
            effectiveRate: cityOverrides[cityKey] || stateRates[state] || settings.defaultTaxRate
          }
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          query: { state },
          defaultRate: settings.defaultTaxRate,
          stateRates: filteredStates,
          cityOverrides: filteredCities,
          effectiveStateRate: stateRates[state] || settings.defaultTaxRate
        }
      })
    }

    // Return all tax configuration
    return NextResponse.json({
      success: true,
      data: {
        defaultRate: settings.defaultTaxRate,
        stateRates,
        cityOverrides,
        statesConfigured: Object.keys(stateRates),
        citiesConfigured: Object.keys(cityOverrides)
      }
    })

  } catch (error: any) {
    console.error('Error fetching tax configuration:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tax configuration' },
      { status: 500 }
    )
  }
}

// POST - Bulk import tax rates (from arizona-taxes or custom data)
export async function POST(request: NextRequest) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { preset, stateRates, cityRates, updatedBy = 'FLEET_ADMIN' } = body

    // Fetch or create settings
    let settings = await prisma.platformSettings.findUnique({
      where: { id: 'global' }
    })

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { id: 'global', updatedAt: new Date() }
      })
    }

    let newStateRates: Record<string, number> = (settings.taxByState as Record<string, number>) || {}
    let newCityRates: Record<string, number> = (settings.taxByCityOverride as Record<string, number>) || {}

    // If using Arizona preset, import all Arizona city taxes
    if (preset === 'arizona') {
      // Arizona state TPT rate
      newStateRates['AZ'] = 0.056

      // Arizona city TPT rates (these are city-only rates, total = state + city)
      const ARIZONA_CITY_TPT: Record<string, number> = {
        // Maricopa County cities
        'Phoenix,AZ': 0.028,
        'Scottsdale,AZ': 0.0175,
        'Tempe,AZ': 0.025,
        'Mesa,AZ': 0.027,
        'Gilbert,AZ': 0.015,
        'Chandler,AZ': 0.015,
        'Glendale,AZ': 0.029,
        'Peoria,AZ': 0.023,
        'Surprise,AZ': 0.022,
        'Goodyear,AZ': 0.025,
        'Avondale,AZ': 0.025,
        'Buckeye,AZ': 0.03,
        'Fountain Hills,AZ': 0.018,
        'Cave Creek,AZ': 0.03,
        'Paradise Valley,AZ': 0.025,
        'Queen Creek,AZ': 0.022,
        'Litchfield Park,AZ': 0.02,
        'Tolleson,AZ': 0.03,
        'El Mirage,AZ': 0.025,
        'Youngtown,AZ': 0.025,
        // Pima County cities
        'Tucson,AZ': 0.026,
        'Oro Valley,AZ': 0.025,
        'Marana,AZ': 0.025,
        'South Tucson,AZ': 0.04,
        'Sahuarita,AZ': 0.03,
        // Pinal County cities
        'Casa Grande,AZ': 0.02,
        'Apache Junction,AZ': 0.028,
        'Florence,AZ': 0.02,
        'Eloy,AZ': 0.025,
        'Coolidge,AZ': 0.03,
        'Maricopa,AZ': 0.02,
        // Coconino County cities
        'Flagstaff,AZ': 0.022,
        'Sedona,AZ': 0.03,
        // Yavapai County cities
        'Prescott,AZ': 0.0225,
        'Prescott Valley,AZ': 0.0275,
        'Cottonwood,AZ': 0.025,
        'Camp Verde,AZ': 0.025,
        // Mohave County cities
        'Lake Havasu City,AZ': 0.0225,
        'Kingman,AZ': 0.02,
        'Bullhead City,AZ': 0.02,
        // Yuma County cities
        'Yuma,AZ': 0.0185,
        'San Luis,AZ': 0.025
      }

      // Merge Arizona city rates (state + city = total rate)
      for (const [cityKey, cityRate] of Object.entries(ARIZONA_CITY_TPT)) {
        // Store TOTAL rate (state TPT + city TPT)
        newCityRates[cityKey] = 0.056 + cityRate
      }

      // Update settings
      const updatedSettings = await prisma.platformSettings.update({
        where: { id: 'global' },
        data: {
          taxByState: newStateRates,
          taxByCityOverride: newCityRates,
          updatedBy
        }
      })

      // Create audit log
      await prisma.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          entityType: 'PLATFORM_SETTINGS',
          entityId: 'global',
          action: 'TAX_RATES_BULK_IMPORTED',
          metadata: {
            preset: 'arizona',
            statesAdded: 1,
            citiesAdded: Object.keys(ARIZONA_CITY_TPT).length,
            updatedBy,
            timestamp: new Date().toISOString()
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: `Imported Arizona tax rates: 1 state rate, ${Object.keys(ARIZONA_CITY_TPT).length} city rates`,
        data: {
          stateRates: newStateRates,
          cityOverrides: newCityRates,
          citiesCount: Object.keys(newCityRates).length
        }
      })
    }

    // Custom bulk import
    if (stateRates && typeof stateRates === 'object') {
      for (const [state, rate] of Object.entries(stateRates)) {
        if (typeof rate === 'number' && rate >= 0 && rate <= 0.5) {
          newStateRates[state.toUpperCase()] = rate
        }
      }
    }

    if (cityRates && typeof cityRates === 'object') {
      for (const [cityKey, rate] of Object.entries(cityRates)) {
        if (typeof rate === 'number' && rate >= 0 && rate <= 0.5) {
          newCityRates[cityKey] = rate
        }
      }
    }

    // Update settings
    const updatedSettings = await prisma.platformSettings.update({
      where: { id: 'global' },
      data: {
        taxByState: newStateRates,
        taxByCityOverride: newCityRates,
        updatedBy
      }
    })

    // Create audit log
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        entityType: 'PLATFORM_SETTINGS',
        entityId: 'global',
        action: 'TAX_RATES_BULK_IMPORTED',
        metadata: {
          statesUpdated: stateRates ? Object.keys(stateRates).length : 0,
          citiesUpdated: cityRates ? Object.keys(cityRates).length : 0,
          updatedBy,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Imported tax rates successfully`,
      data: {
        stateRates: newStateRates,
        cityOverrides: newCityRates
      }
    })

  } catch (error: any) {
    console.error('Error bulk importing tax rates:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to import tax rates' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, state, city, rate, updatedBy = 'FLEET_ADMIN' } = body

    // Validate action
    const validActions = ['set_default', 'set_state', 'set_city', 'remove_state', 'remove_city']
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate rate for set actions
    if (['set_default', 'set_state', 'set_city'].includes(action)) {
      if (rate === undefined || typeof rate !== 'number' || rate < 0 || rate > 0.5) {
        return NextResponse.json(
          { error: 'Rate must be a number between 0 and 0.5 (e.g., 0.056 for 5.6%)' },
          { status: 400 }
        )
      }
    }

    // Validate state for state-related actions
    if (['set_state', 'remove_state', 'set_city', 'remove_city'].includes(action)) {
      if (!state || !US_STATES.includes(state.toUpperCase())) {
        return NextResponse.json(
          { error: 'Valid US state abbreviation is required' },
          { status: 400 }
        )
      }
    }

    // Validate city for city-related actions
    if (['set_city', 'remove_city'].includes(action)) {
      if (!city || city.trim().length === 0) {
        return NextResponse.json(
          { error: 'City name is required' },
          { status: 400 }
        )
      }
    }

    // Fetch current settings
    let settings = await prisma.platformSettings.findUnique({
      where: { id: 'global' }
    })

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { id: 'global', updatedAt: new Date() }
      })
    }

    const stateRates = (settings.taxByState as Record<string, number>) || {}
    const cityOverrides = (settings.taxByCityOverride as Record<string, number>) || {}
    let updateData: Record<string, any> = { updatedBy }
    let changeDescription = ''

    switch (action) {
      case 'set_default':
        updateData.defaultTaxRate = rate
        changeDescription = `Set default tax rate to ${(rate * 100).toFixed(2)}%`
        break

      case 'set_state':
        const upperState = state.toUpperCase()
        stateRates[upperState] = rate
        updateData.taxByState = stateRates
        changeDescription = `Set ${upperState} state tax rate to ${(rate * 100).toFixed(2)}%`
        break

      case 'remove_state':
        const stateToRemove = state.toUpperCase()
        if (stateRates[stateToRemove]) {
          delete stateRates[stateToRemove]
          updateData.taxByState = stateRates
          changeDescription = `Removed ${stateToRemove} state tax rate`
        } else {
          return NextResponse.json(
            { error: `No tax rate configured for state ${stateToRemove}` },
            { status: 400 }
          )
        }
        break

      case 'set_city':
        const cityKey = `${city},${state.toUpperCase()}`
        cityOverrides[cityKey] = rate
        updateData.taxByCityOverride = cityOverrides
        changeDescription = `Set ${city}, ${state.toUpperCase()} city tax rate to ${(rate * 100).toFixed(2)}%`
        break

      case 'remove_city':
        const cityKeyToRemove = `${city},${state.toUpperCase()}`
        if (cityOverrides[cityKeyToRemove]) {
          delete cityOverrides[cityKeyToRemove]
          updateData.taxByCityOverride = cityOverrides
          changeDescription = `Removed ${city}, ${state.toUpperCase()} city tax rate`
        } else {
          return NextResponse.json(
            { error: `No tax rate configured for ${city}, ${state.toUpperCase()}` },
            { status: 400 }
          )
        }
        break
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
        action: 'TAX_RATE_UPDATED',
        metadata: {
          taxAction: action,
          state: state?.toUpperCase(),
          city,
          rate,
          changeDescription,
          updatedBy,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: changeDescription,
      data: {
        defaultRate: updatedSettings.defaultTaxRate,
        stateRates: updatedSettings.taxByState,
        cityOverrides: updatedSettings.taxByCityOverride
      }
    })

  } catch (error: any) {
    console.error('Error updating tax configuration:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update tax configuration' },
      { status: 500 }
    )
  }
}

// Helper function to calculate effective tax rate for a location
export function getEffectiveTaxRate(
  city: string | null,
  state: string,
  settings: {
    defaultTaxRate: number
    taxByState: Record<string, number> | null
    taxByCityOverride: Record<string, number> | null
  }
): number {
  const stateRates = settings.taxByState || {}
  const cityOverrides = settings.taxByCityOverride || {}

  // Check for city-specific rate first
  if (city) {
    const cityKey = `${city},${state.toUpperCase()}`
    if (cityOverrides[cityKey] !== undefined) {
      return cityOverrides[cityKey]
    }
  }

  // Fall back to state rate
  if (stateRates[state.toUpperCase()] !== undefined) {
    return stateRates[state.toUpperCase()]
  }

  // Fall back to default
  return settings.defaultTaxRate
}

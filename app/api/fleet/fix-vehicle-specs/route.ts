// app/api/fleet/fix-vehicle-specs/route.ts
// One-time script to fix vehicle specs in the database using the vehicle specs lookup

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { getVehicleSpecData } from '@/app/lib/utils/vehicleSpec'

// Manual corrections for known problematic entries
const MANUAL_CORRECTIONS: Record<string, { transmission?: string; seats?: number; fuelType?: string }> = {
  // Prius models - all use CVT, hybrid fuel
  'Prius': { transmission: 'CVT', fuelType: 'HYBRID' },
  'Prius Prime': { transmission: 'CVT', seats: 4, fuelType: 'PLUGIN_HYBRID' },
  'Prius Prime (PHEV)': { transmission: 'CVT', seats: 4, fuelType: 'PLUGIN_HYBRID' },
  'Prius Prime PHEV': { transmission: 'CVT', seats: 4, fuelType: 'PLUGIN_HYBRID' },

  // Nissan CVT models
  'Sentra': { transmission: 'CVT' },
  'Altima': { transmission: 'CVT' },
  'Versa': { transmission: 'CVT' },
  'Rogue': { transmission: 'CVT' },
  'Kicks': { transmission: 'CVT' },

  // Honda CVT models
  'Civic': { transmission: 'CVT' },
  'Accord': { transmission: 'CVT' },
  'CR-V': { transmission: 'CVT' },
  'HR-V': { transmission: 'CVT' },

  // Toyota CVT models (hybrids mostly)
  'Camry Hybrid': { transmission: 'CVT', fuelType: 'HYBRID' },
  'Corolla Hybrid': { transmission: 'CVT', fuelType: 'HYBRID' },
  'RAV4 Hybrid': { transmission: 'CVT', fuelType: 'HYBRID' },
}

// Map lowercase fuel types to uppercase enum values
function normalizeFuelType(fuelType: string | null): string {
  if (!fuelType) return 'REGULAR'

  const lower = fuelType.toLowerCase()
  if (lower.includes('plug-in') || lower.includes('plugin') || lower.includes('phev')) return 'PLUGIN_HYBRID'
  if (lower.includes('hybrid')) return 'HYBRID'
  if (lower.includes('electric')) return 'ELECTRIC'
  if (lower.includes('diesel')) return 'DIESEL'
  if (lower.includes('premium')) return 'PREMIUM'
  return 'REGULAR'
}

// Map transmission types
function normalizeTransmission(transmission: string | null): string {
  if (!transmission) return 'AUTOMATIC'

  const lower = transmission.toLowerCase()
  if (lower === 'cvt') return 'CVT'
  if (lower === 'manual') return 'MANUAL'
  if (lower.includes('semi')) return 'SEMI_AUTOMATIC'
  return 'AUTOMATIC'
}

export async function GET(request: NextRequest) {
  // Security check - only allow with admin key
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== 'phoenix-fleet-2847') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dryRun = searchParams.get('dry') === 'true'

  try {
    // Get all cars
    const cars = await prisma.rentalCar.findMany({
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        transmission: true,
        seats: true,
        fuelType: true
      }
    })

    const updates: Array<{
      id: string
      make: string
      model: string
      year: number
      before: { transmission: string | null; seats: number | null; fuelType: string | null }
      after: { transmission: string; seats: number; fuelType: string }
      changes: string[]
    }> = []

    for (const car of cars) {
      // Check for manual corrections first
      const modelKey = car.model
      const manualFix = MANUAL_CORRECTIONS[modelKey]

      // Get specs from the lookup database
      const specs = getVehicleSpecData(car.make, car.model, String(car.year))

      // Determine correct values
      let correctTransmission = car.transmission
      let correctSeats = car.seats
      let correctFuelType = car.fuelType

      // Apply manual corrections (highest priority)
      if (manualFix) {
        if (manualFix.transmission) correctTransmission = manualFix.transmission
        if (manualFix.seats) correctSeats = manualFix.seats
        if (manualFix.fuelType) correctFuelType = manualFix.fuelType
      }
      // Apply specs lookup
      else if (specs) {
        // Always use specs seats if available (fix wrong values in database)
        if (specs.seats) correctSeats = specs.seats
        if (specs.fuelType) correctFuelType = normalizeFuelType(specs.fuelType)
      }

      // Normalize current values for comparison
      const normalizedCurrentTrans = normalizeTransmission(car.transmission)
      const normalizedNewTrans = normalizeTransmission(correctTransmission)
      const normalizedCurrentFuel = car.fuelType?.toUpperCase() || 'REGULAR'
      const normalizedNewFuel = correctFuelType?.toUpperCase() || 'REGULAR'

      // Check if we need to fix anything
      const changes: string[] = []

      // Fix obvious errors (manual when it should be CVT/automatic)
      if (car.transmission?.toLowerCase() === 'manual' &&
          (normalizedNewTrans === 'CVT' || normalizedNewTrans === 'AUTOMATIC')) {
        changes.push(`transmission: ${car.transmission} -> ${normalizedNewTrans}`)
        correctTransmission = normalizedNewTrans
      }

      // Fix seats if different from specs database
      if (correctSeats && car.seats !== correctSeats) {
        changes.push(`seats: ${car.seats || 'null'} -> ${correctSeats}`)
      }

      // Fix fuel type if electric when should be hybrid/plug-in
      if (normalizedCurrentFuel === 'ELECTRIC' &&
          (normalizedNewFuel === 'HYBRID' || normalizedNewFuel === 'PLUGIN_HYBRID')) {
        changes.push(`fuelType: ${car.fuelType} -> ${normalizedNewFuel}`)
        correctFuelType = normalizedNewFuel
      }

      if (changes.length > 0) {
        updates.push({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          before: {
            transmission: car.transmission,
            seats: car.seats,
            fuelType: car.fuelType
          },
          after: {
            transmission: correctTransmission || 'AUTOMATIC',
            seats: correctSeats || 5,
            fuelType: correctFuelType || 'REGULAR'
          },
          changes
        })
      }
    }

    // If not dry run, apply the updates
    if (!dryRun && updates.length > 0) {
      for (const update of updates) {
        // Only update fields that actually changed
        const updateData: { transmission?: string; seats?: number; fuelType?: string } = {}

        for (const change of update.changes) {
          if (change.startsWith('transmission:')) {
            updateData.transmission = update.after.transmission
          } else if (change.startsWith('seats:')) {
            updateData.seats = update.after.seats
          } else if (change.startsWith('fuelType:')) {
            updateData.fuelType = update.after.fuelType
          }
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.rentalCar.update({
            where: { id: update.id },
            data: updateData
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      totalCars: cars.length,
      carsToFix: updates.length,
      updates: updates.map(u => ({
        car: `${u.year} ${u.make} ${u.model}`,
        changes: u.changes,
        before: u.before,
        after: u.after
      }))
    })

  } catch (error) {
    console.error('[FIX VEHICLE SPECS] Error:', error)
    return NextResponse.json({
      error: 'Failed to fix vehicle specs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

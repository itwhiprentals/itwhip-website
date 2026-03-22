// app/lib/trip/tripStepDetector.ts
// Pure function — detects which wizard step the server is at based on DB fields.
// IDENTICAL logic to mobile: ItWhipApp/src/utils/tripStepDetector.ts

export interface TripStepState {
  step: number
  photos: Record<string, string> | null
  odometer: number | null
  fuel: string | null
}

function parsePhotos(raw: any): Record<string, string> | null {
  if (!raw) return null
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return null
  }
}

export function detectTripStep(booking: any, type: 'start' | 'end'): TripStepState {
  if (type === 'start') {
    const photos = parsePhotos(booking.inspectionPhotosStart)
    const odometer = booking.startMileage ?? null
    const fuel = booking.fuelLevelStart ?? null

    if (booking.handoffStatus !== 'HANDOFF_COMPLETE' && booking.handoffStatus !== 'BYPASSED')
      return { step: 0, photos: null, odometer: null, fuel: null }
    if (!photos || Object.keys(photos).length === 0)
      return { step: 1, photos: null, odometer, fuel }
    if (odometer === null)
      return { step: 2, photos, odometer: null, fuel }
    if (fuel === null)
      return { step: 3, photos, odometer, fuel: null }
    return { step: 4, photos, odometer, fuel }
  }

  const photos = parsePhotos(booking.inspectionPhotosEnd)
  const odometer = booking.endMileage ?? null
  const fuel = booking.fuelLevelEnd ?? null

  if (!photos || Object.keys(photos).length === 0)
    return { step: 0, photos: null, odometer, fuel }
  if (odometer === null)
    return { step: 1, photos, odometer: null, fuel }
  if (fuel === null)
    return { step: 2, photos, odometer, fuel: null }
  // Steps 3+ (Charges, Disputes, Confirm) tracked via endTripWizardStep
  const wizardStep = Number(booking.endTripWizardStep)
  if (wizardStep > 3 && !isNaN(wizardStep))
    return { step: wizardStep, photos, odometer, fuel }
  return { step: 3, photos, odometer, fuel }
}

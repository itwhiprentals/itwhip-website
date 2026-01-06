// app/lib/utils/vin-decoder.ts
// NHTSA vPIC API VIN Decoder - FREE, No API Key Required
// API: https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{VIN}?format=json

export interface VINDecodeResult {
  make: string
  model: string
  year: string
  bodyClass: string
  doors: string
  driveType: string
  fuelType: string
  engineCylinders: string
  engineHP: string
  transmission: string
  vehicleType: string
  trim: string
  errorCode: string
  errorText: string
}

export async function decodeVIN(vin: string): Promise<VINDecodeResult | null> {
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`
    )
    const data = await response.json()
    const result = data.Results[0]

    // Check for errors (ErrorCode "0" means success)
    if (result.ErrorCode !== '0' && result.ErrorCode !== '') {
      console.warn('VIN decode warning:', result.ErrorText)
    }

    return {
      make: result.Make || '',
      model: result.Model || '',
      year: result.ModelYear || '',
      bodyClass: result.BodyClass || '',
      doors: result.Doors || '',
      driveType: result.DriveType || '',
      fuelType: result.FuelTypePrimary || '',
      engineCylinders: result.EngineCylinders || '',
      engineHP: result.EngineHP || '',
      transmission: result.TransmissionStyle || '',
      vehicleType: result.VehicleType || '',
      trim: result.Trim || '',
      errorCode: result.ErrorCode || '',
      errorText: result.ErrorText || '',
    }
  } catch (error) {
    console.error('VIN decode error:', error)
    return null
  }
}

export function isValidVIN(vin: string): boolean {
  // VIN must be 17 characters, no I, O, or Q
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i
  return vinRegex.test(vin)
}

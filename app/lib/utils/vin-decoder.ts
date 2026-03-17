// app/lib/utils/vin-decoder.ts
// NHTSA vPIC API VIN Decoder - FREE, No API Key Required
// API: https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{VIN}?format=json

export interface VINDecodeResult {
  make: string
  model: string
  year: string
  trim: string
  bodyClass: string
  vehicleType: string
  doors: string
  seats: string
  driveType: string
  fuelType: string
  electrificationLevel: string
  engineCylinders: string
  engineHP: string
  engineDisplacement: string
  transmission: string
  transmissionSpeeds: string
  plantCity: string
  plantState: string
  plantCountry: string
  manufacturer: string
  gvwr: string
  wheelBase: string
  steeringLocation: string
  note: string
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
      trim: result.Trim || '',
      bodyClass: result.BodyClass || '',
      vehicleType: result.VehicleType || '',
      doors: result.Doors || '',
      seats: result.Seats || '',
      driveType: result.DriveType || '',
      fuelType: result.FuelTypePrimary || '',
      electrificationLevel: result.ElectrificationLevel || '',
      engineCylinders: result.EngineCylinders || '',
      engineHP: result.EngineHP || '',
      engineDisplacement: result.DisplacementL || '',
      transmission: result.TransmissionStyle || '',
      transmissionSpeeds: result.TransmissionSpeeds || '',
      plantCity: result.PlantCity || '',
      plantState: result.PlantState || '',
      plantCountry: result.PlantCountry || '',
      manufacturer: result.Manufacturer || '',
      gvwr: result.GVWR || '',
      wheelBase: result.WheelBaseShort || '',
      steeringLocation: result.SteeringLocation || '',
      note: result.Note || '',
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

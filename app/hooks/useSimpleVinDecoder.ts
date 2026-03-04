// app/hooks/useSimpleVinDecoder.ts
// Self-contained VIN decoder hook for recruitment/add-car flows
// Unlike useVinDecoder (host car edit), this doesn't require model/trim dropdown setters

import { useState, useCallback, useEffect, useRef } from 'react'
import { decodeVIN, isValidVIN } from '@/app/lib/utils/vin-decoder'
import { mapBodyClassToCarType } from '@/app/lib/data/vehicle-features'

export interface VehicleInfo {
  vin: string
  make: string
  model: string
  year: number
  trim: string
  doors: number
  transmission: string
  fuelType: string
  driveType: string
  carType: string
  bodyClass: string
  engineCylinders: string
  engineHP: string
  vehicleType: string
}

const DEFAULT_VEHICLE: VehicleInfo = {
  vin: '', make: '', model: '', year: new Date().getFullYear(),
  trim: '', doors: 4, transmission: 'automatic', fuelType: 'gas',
  driveType: '', carType: 'midsize', bodyClass: '',
  engineCylinders: '', engineHP: '', vehicleType: ''
}

interface UseSimpleVinDecoderProps {
  t: (key: string, values?: Record<string, any>) => string
}

export function useSimpleVinDecoder({ t }: UseSimpleVinDecoderProps) {
  const [vin, setVin] = useState('')
  const [vinDecoding, setVinDecoding] = useState(false)
  const [vinError, setVinError] = useState('')
  const [vinDecoded, setVinDecoded] = useState(false)
  const [decodedFields, setDecodedFields] = useState<string[]>([])
  const [showVinScanner, setShowVinScanner] = useState(false)
  const [vehicle, setVehicle] = useState<VehicleInfo>({ ...DEFAULT_VEHICLE })
  const decodeTriggered = useRef(false)

  // Eligibility
  const [eligible, setEligible] = useState<boolean | null>(null)
  const [eligibilityBlockers, setEligibilityBlockers] = useState<string[]>([])
  const [eligibilityWarnings, setEligibilityWarnings] = useState<string[]>([])

  // Auto-decode when VIN reaches 17 valid chars
  useEffect(() => {
    if (vin.length === 17 && isValidVIN(vin) && !vinDecoded && !vinDecoding && !decodeTriggered.current) {
      decodeTriggered.current = true
      handleVinDecode(vin)
    }
    if (vin.length < 17) {
      decodeTriggered.current = false
    }
  }, [vin, vinDecoded, vinDecoding])

  const handleVinDecode = useCallback(async (vinValue: string) => {
    setVinDecoding(true)
    setVinError('')
    setVinDecoded(false)
    setDecodedFields([])
    setEligible(null)

    try {
      const result = await decodeVIN(vinValue)

      if (result && result.make) {
        const fields: string[] = ['make', 'model', 'year']
        const info: Partial<VehicleInfo> = {
          vin: vinValue,
          make: result.make,
          model: result.model || '',
          year: parseInt(result.year) || new Date().getFullYear()
        }

        if (result.trim) { info.trim = result.trim; fields.push('trim') }
        if (result.doors) {
          let d = parseInt(result.doors) || 4
          if (d === 5) d = 4
          if (d === 3) d = 2
          info.doors = d; fields.push('doors')
        }
        if (result.transmission) {
          info.transmission = result.transmission.toLowerCase().includes('automatic') ? 'automatic' : 'manual'
          fields.push('transmission')
        }
        if (result.fuelType) {
          const fl = result.fuelType.toLowerCase()
          if (fl.includes('electric')) info.fuelType = 'electric'
          else if (fl.includes('hybrid')) info.fuelType = 'hybrid'
          else if (fl.includes('diesel')) info.fuelType = 'diesel'
          else info.fuelType = 'gas'
          fields.push('fuelType')
        }
        if (result.bodyClass) {
          info.bodyClass = result.bodyClass
          const mapped = mapBodyClassToCarType(result.bodyClass, result.make, result.model)
          if (mapped) { info.carType = mapped.toLowerCase(); fields.push('carType') }
          fields.push('bodyClass')
        }
        if (result.driveType) {
          const dl = result.driveType.toLowerCase()
          if (dl.includes('all') || dl.includes('awd')) info.driveType = 'AWD'
          else if (dl.includes('front') || dl.includes('fwd')) info.driveType = 'FWD'
          else if (dl.includes('rear') || dl.includes('rwd')) info.driveType = 'RWD'
          else if (dl.includes('4x4') || dl.includes('4wd')) info.driveType = '4WD'
          else info.driveType = result.driveType.toUpperCase()
          fields.push('driveType')
        }
        if (result.engineCylinders) {
          info.engineCylinders = result.engineCylinders
          fields.push('engineCylinders')
        }
        if (result.engineHP) {
          info.engineHP = result.engineHP
          fields.push('engineHP')
        }
        if (result.vehicleType) {
          info.vehicleType = result.vehicleType
          fields.push('vehicleType')
        }

        setVehicle(prev => ({ ...prev, ...info }))
        setDecodedFields(fields)
        setVinDecoded(true)

        // Check eligibility
        const yr = parseInt(result.year) || new Date().getFullYear()
        const age = new Date().getFullYear() - yr
        const blockers: string[] = []
        const warnings: string[] = []
        if (age > 12) blockers.push(t('addVehicleAgeTooOld', { age }))
        if (age > 8 && age <= 12) warnings.push(t('addOlderVehicleWarning'))
        setEligible(blockers.length === 0)
        setEligibilityBlockers(blockers)
        setEligibilityWarnings(warnings)
      } else {
        setVinError(t('addVinCouldNotDecode'))
      }
    } catch {
      setVinError(t('addVinFailedDecode'))
    } finally {
      setVinDecoding(false)
    }
  }, [t])

  // Handle VIN input change — resets decode state if modified
  const handleVinChange = (value: string) => {
    const v = value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17)
    setVin(v)
    setVinError('')
    if (vinDecoded) {
      setVinDecoded(false)
      setDecodedFields([])
      setEligible(null)
      decodeTriggered.current = false
    }
  }

  // Manual decode trigger (button click)
  const triggerDecode = () => {
    if (vin.length === 17 && isValidVIN(vin)) {
      decodeTriggered.current = true
      handleVinDecode(vin)
    }
  }

  return {
    vin, handleVinChange, triggerDecode,
    vinDecoding, vinError, vinDecoded,
    decodedFields, vehicle,
    showVinScanner, setShowVinScanner,
    eligible, eligibilityBlockers, eligibilityWarnings,
  }
}

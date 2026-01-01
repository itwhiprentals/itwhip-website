// app/host/cars/[id]/edit/hooks/useVinDecoder.ts
import { useState, useCallback } from 'react'
import { decodeVIN, isValidVIN } from '@/app/lib/utils/vin-decoder'
import {
  getAllMakes,
  getModelsByMake,
  getTrimsByModel
} from '@/app/lib/data/vehicles'
import { mapBodyClassToCarType } from '@/app/lib/data/vehicle-features'
import type { CarFormData } from '../types'

interface UseVinDecoderProps {
  formData: CarFormData
  setFormData: React.Dispatch<React.SetStateAction<CarFormData>>
  setAvailableModels: React.Dispatch<React.SetStateAction<string[]>>
  setAvailableTrims: React.Dispatch<React.SetStateAction<string[]>>
}

interface UseVinDecoderReturn {
  vinDecoding: boolean
  vinError: string
  vinDecoded: boolean
  vinDecodedFields: string[]
  setVinDecoded: React.Dispatch<React.SetStateAction<boolean>>
  setVinError: React.Dispatch<React.SetStateAction<string>>
  setVinDecodedFields: React.Dispatch<React.SetStateAction<string[]>>
  handleVinDecode: () => Promise<void>
}

// Helper function to convert text to Title Case
const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper function to find best matching make from our database (NHTSA returns UPPERCASE)
const findMatchingMake = (decodedMake: string): string => {
  const allMakes = getAllMakes()
  const normalizedDecoded = decodedMake.toUpperCase()
  const exactMatch = allMakes.find(make => make.toUpperCase() === normalizedDecoded)
  if (exactMatch) return exactMatch
  return toTitleCase(decodedMake)
}

// Helper function to find best matching model from our database
const findMatchingModel = (make: string, decodedModel: string): string => {
  const models = getModelsByMake(make)
  const normalizedDecoded = decodedModel.toUpperCase()
  const exactMatch = models.find(model => model.toUpperCase() === normalizedDecoded)
  if (exactMatch) return exactMatch
  return toTitleCase(decodedModel)
}

/**
 * Hook to handle VIN decoding functionality
 * Decodes VIN using NHTSA API and populates form fields
 */
export function useVinDecoder({
  formData,
  setFormData,
  setAvailableModels,
  setAvailableTrims
}: UseVinDecoderProps): UseVinDecoderReturn {
  const [vinDecoding, setVinDecoding] = useState(false)
  const [vinError, setVinError] = useState('')
  const [vinDecoded, setVinDecoded] = useState(false)
  const [vinDecodedFields, setVinDecodedFields] = useState<string[]>([])

  const handleVinDecode = useCallback(async () => {
    const vin = formData.vin?.trim()
    if (!vin || vin.length !== 17) {
      setVinError('VIN must be 17 characters')
      return
    }

    if (!isValidVIN(vin)) {
      setVinError('Invalid VIN format (no I, O, or Q)')
      return
    }

    setVinDecoding(true)
    setVinError('')

    try {
      const result = await decodeVIN(vin)

      if (result && result.make) {
        // Normalize make/model to match our dropdown values (NHTSA returns UPPERCASE)
        const normalizedMake = findMatchingMake(result.make)
        const normalizedModel = result.model ? findMatchingModel(normalizedMake, result.model) : ''
        const normalizedTrim = result.trim ? toTitleCase(result.trim) : ''

        // Update dropdowns with normalized make
        const models = getModelsByMake(normalizedMake)
        setAvailableModels(models)

        // Track which fields were decoded
        const decodedFields: string[] = ['make', 'model', 'year']

        // Build updated form data with all available VIN-decoded fields
        const updates: Partial<CarFormData> = {
          make: normalizedMake,
          model: normalizedModel || formData.model,
          year: parseInt(result.year) || formData.year,
        }

        // Add trim if available
        if (result.trim) {
          updates.trim = normalizedTrim
          decodedFields.push('trim')
        }

        // Add doors if available
        if (result.doors) {
          updates.doors = parseInt(result.doors) || formData.doors
          decodedFields.push('doors')
        }

        // Add transmission if available
        if (result.transmission) {
          updates.transmission = result.transmission.toLowerCase().includes('automatic') ? 'automatic' : 'manual'
          decodedFields.push('transmission')
        }

        // Add fuel type if available
        if (result.fuelType) {
          const fuelLower = result.fuelType.toLowerCase()
          if (fuelLower.includes('electric')) updates.fuelType = 'electric'
          else if (fuelLower.includes('hybrid')) updates.fuelType = 'hybrid'
          else if (fuelLower.includes('diesel')) updates.fuelType = 'diesel'
          else updates.fuelType = 'gas'
          decodedFields.push('fuelType')
        }

        // Map body class to car type
        if (result.bodyClass) {
          const mappedType = mapBodyClassToCarType(result.bodyClass, normalizedMake, normalizedModel)
          if (mappedType) {
            updates.carType = mappedType.toLowerCase()
            decodedFields.push('carType')
          }
        }

        // Add drive type if available (AWD, FWD, RWD, 4WD)
        if (result.driveType) {
          const driveLower = result.driveType.toLowerCase()
          if (driveLower.includes('all') || driveLower.includes('awd')) updates.driveType = 'AWD'
          else if (driveLower.includes('front') || driveLower.includes('fwd')) updates.driveType = 'FWD'
          else if (driveLower.includes('rear') || driveLower.includes('rwd')) updates.driveType = 'RWD'
          else if (driveLower.includes('4x4') || driveLower.includes('4wd') || driveLower.includes('four')) updates.driveType = '4WD'
          else updates.driveType = result.driveType.toUpperCase()
          decodedFields.push('driveType')
        }

        // Update form data
        setFormData(prev => ({
          ...prev,
          ...updates
        }))

        // Update trims if all fields available
        if (normalizedMake && normalizedModel && result.year) {
          setAvailableTrims(getTrimsByModel(normalizedMake, normalizedModel, result.year))
        }

        setVinDecodedFields(decodedFields)
        setVinDecoded(true)
      } else {
        setVinError('Could not decode VIN')
      }
    } catch (error) {
      setVinError('VIN decode failed')
    } finally {
      setVinDecoding(false)
    }
  }, [formData.vin, formData.model, formData.year, formData.doors, setFormData, setAvailableModels, setAvailableTrims])

  return {
    vinDecoding,
    vinError,
    vinDecoded,
    vinDecodedFields,
    setVinDecoded,
    setVinError,
    setVinDecodedFields,
    handleVinDecode
  }
}

export default useVinDecoder

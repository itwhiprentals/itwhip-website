// app/components/host/CarInformationForm.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import {
  IoCarSportOutline,
  IoChevronDownOutline,
  IoLocationOutline,
  IoColorPaletteOutline,
  IoPeopleOutline,
  IoEnterOutline,
  IoCheckmarkCircle,
  IoSearchOutline
} from 'react-icons/io5'
import { getAllMakes, getModelsByMake, getYears, getPopularMakes, getTrimsByModel } from '@/app/lib/data/vehicles'
import { getCarColorHex } from '@/app/lib/constants/carColors'
import { getVehicleSpecData, VehicleSpecData } from '@/app/lib/utils/vehicleSpec'
import { getVehicleClass, formatFuelTypeBadge } from '@/app/lib/utils/vehicleClassification'
import VehicleBadge from '@/app/components/VehicleBadge'
import { decodeVIN, isValidVIN } from '@/app/lib/utils/vin-decoder'
import AddressAutocomplete, { AddressResult } from '@/app/components/shared/AddressAutocomplete'

// US States - Arizona first, then alphabetical
const US_STATES = [
  { value: 'AZ', label: 'Arizona' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'Washington D.C.' }
]

// Standard car colors
const CAR_COLORS = [
  { value: 'Black', label: 'Black' },
  { value: 'White', label: 'White' },
  { value: 'Silver', label: 'Silver' },
  { value: 'Gray', label: 'Gray' },
  { value: 'Red', label: 'Red' },
  { value: 'Blue', label: 'Blue' },
  { value: 'Navy', label: 'Navy Blue' },
  { value: 'Brown', label: 'Brown' },
  { value: 'Beige', label: 'Beige' },
  { value: 'Green', label: 'Green' },
  { value: 'Gold', label: 'Gold' },
  { value: 'Orange', label: 'Orange' },
  { value: 'Yellow', label: 'Yellow' },
  { value: 'Purple', label: 'Purple' },
  { value: 'Burgundy', label: 'Burgundy' },
  { value: 'Champagne', label: 'Champagne' },
  { value: 'Pearl White', label: 'Pearl White' },
  { value: 'Midnight Blue', label: 'Midnight Blue' },
  { value: 'Other', label: 'Other' }
]

export interface CarData {
  vin: string
  make: string
  model: string
  year: string
  color: string
  trim: string
  // VIN-decoded vehicle specs (auto-filled, prevents manual errors)
  fuelType: string      // electric, gas, hybrid, diesel
  doors: string         // number of doors
  bodyClass: string     // Sedan, SUV, Pickup, etc. (maps to carType)
  transmission: string  // automatic, manual, CVT
  driveType: string     // AWD, FWD, RWD, 4WD
  // Location
  address: string
  city: string
  state: string
  zipCode: string
}

export interface CarInformationFormProps {
  carData: CarData
  onCarDataChange: (data: Partial<CarData>) => void
  onValidationChange?: (isValid: boolean) => void
  showLocationFields?: boolean
  className?: string
}

export default function CarInformationForm({
  carData,
  onCarDataChange,
  onValidationChange,
  showLocationFields = true,
  className = ''
}: CarInformationFormProps) {
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [availableTrims, setAvailableTrims] = useState<string[]>([])
  const [vehicleSpec, setVehicleSpec] = useState<VehicleSpecData>({
    seats: null,
    doors: null,
    carType: null,
    fuelType: null
  })

  // VIN decode state
  const [vinDecoding, setVinDecoding] = useState(false)
  const [vinDecoded, setVinDecoded] = useState(false)
  const [vinError, setVinError] = useState('')

  // Ref to track vinDecoded immediately (avoid race conditions with state)
  const vinDecodedRef = useRef(false)

  const allMakes = getAllMakes()
  const popularMakes = getPopularMakes()
  const years = getYears()

  // Helper function to convert text to Title Case
  const toTitleCase = (str: string): string => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Helper function to find best matching make from our database
  const findMatchingMake = (decodedMake: string): string => {
    const normalizedDecoded = decodedMake.toUpperCase()
    // Check exact match first (case-insensitive)
    const exactMatch = allMakes.find(make => make.toUpperCase() === normalizedDecoded)
    if (exactMatch) return exactMatch
    // If no match, return title-cased version
    return toTitleCase(decodedMake)
  }

  // Helper function to find best matching model from our database
  const findMatchingModel = (make: string, decodedModel: string): string => {
    const models = getModelsByMake(make)
    const normalizedDecoded = decodedModel.toUpperCase()
    // Check exact match first (case-insensitive)
    const exactMatch = models.find(model => model.toUpperCase() === normalizedDecoded)
    if (exactMatch) return exactMatch
    // If no match, return title-cased version
    return toTitleCase(decodedModel)
  }

  // Handle VIN decode
  const handleVinDecode = async () => {
    const vin = carData.vin?.trim()
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
        // IMPORTANT: Set ref FIRST (immediate) to prevent useEffect from resetting values
        vinDecodedRef.current = true
        setVinDecoded(true)

        // Normalize make/model to match our dropdown values (NHTSA returns UPPERCASE)
        const normalizedMake = findMatchingMake(result.make)
        const normalizedModel = result.model ? findMatchingModel(normalizedMake, result.model) : ''
        const normalizedTrim = result.trim ? toTitleCase(result.trim) : ''

        // Update available models dropdown with the normalized make
        const models = getModelsByMake(normalizedMake)
        setAvailableModels(models)

        // Update available trims
        if (normalizedMake && normalizedModel && result.year) {
          const trims = getTrimsByModel(normalizedMake, normalizedModel, result.year)
          setAvailableTrims(trims)
        }

        // Debug: Log what we're about to update
        console.log('VIN decoded result (raw):', result)
        console.log('Normalized values:', {
          make: normalizedMake,
          model: normalizedModel,
          year: result.year || '',
          trim: normalizedTrim,
          fuelType: result.fuelType || '',
          doors: result.doors || '',
          bodyClass: result.bodyClass || '',
          transmission: result.transmission || '',
          driveType: result.driveType || ''
        })

        // Update form data with ALL VIN-decoded fields
        // This ensures hosts don't accidentally enter wrong specs
        onCarDataChange({
          make: normalizedMake,
          model: normalizedModel,
          year: result.year || '',
          trim: normalizedTrim,
          fuelType: result.fuelType || '',       // electric, gas, hybrid, diesel
          doors: result.doors || '',              // number of doors
          bodyClass: result.bodyClass || '',      // Sedan, SUV, Pickup (maps to carType)
          transmission: result.transmission || '', // automatic, manual, CVT
          driveType: result.driveType || ''       // AWD, FWD, RWD, 4WD
        })

        console.log('onCarDataChange called successfully')
      } else {
        setVinError('Could not decode VIN. Please enter details manually.')
      }
    } catch (error) {
      setVinError('VIN decode failed. Please enter details manually.')
    } finally {
      setVinDecoding(false)
    }
  }

  // Update available models when make changes
  // NOTE: Don't reset model/trim if VIN was just decoded (vinDecodedRef prevents cascade)
  useEffect(() => {
    if (carData.make) {
      const models = getModelsByMake(carData.make)
      setAvailableModels(models)
      // Only reset model if NOT from VIN decode and model not in list
      // Use ref for immediate check (state might be batched)
      if (!vinDecodedRef.current && carData.model && !models.includes(carData.model)) {
        onCarDataChange({ model: '', trim: '' })
      }
    } else {
      setAvailableModels([])
    }
  }, [carData.make])

  // Update available trims when make/model/year changes
  // NOTE: Don't reset trim if VIN was just decoded
  useEffect(() => {
    if (carData.make && carData.model && carData.year) {
      const trims = getTrimsByModel(carData.make, carData.model, carData.year)
      setAvailableTrims(trims)
      // Only reset trim if NOT from VIN decode and trim not in list
      // Use ref for immediate check (state might be batched)
      if (!vinDecodedRef.current && carData.trim && !trims.includes(carData.trim)) {
        onCarDataChange({ trim: '' })
      }
    } else {
      setAvailableTrims([])
      // Only reset trim if NOT from VIN decode
      if (!vinDecodedRef.current && carData.trim) {
        onCarDataChange({ trim: '' })
      }
    }
  }, [carData.make, carData.model, carData.year])

  // Fetch vehicle specifications (seats/doors/carType/fuelType) when make/model/year changes
  useEffect(() => {
    if (carData.make && carData.model && carData.year) {
      const spec = getVehicleSpecData(carData.make, carData.model, carData.year)
      setVehicleSpec(spec)
    } else {
      setVehicleSpec({ seats: null, doors: null, carType: null, fuelType: null })
    }
  }, [carData.make, carData.model, carData.year])

  // Validate form and notify parent
  useEffect(() => {
    const isValid =
      carData.make !== '' &&
      carData.model !== '' &&
      carData.year !== '' &&
      carData.color !== '' &&
      (!showLocationFields ||
        (carData.city.trim() !== '' &&
          carData.state !== '' &&
          carData.zipCode.trim() !== '' &&
          carData.zipCode.length === 5))

    if (onValidationChange) {
      onValidationChange(isValid)
    }
  }, [carData, showLocationFields, onValidationChange])

  const handleChange = (field: keyof CarData, value: string) => {
    onCarDataChange({ [field]: value })
  }

  // Helper to map NHTSA bodyClass to our carType
  const mapBodyClassToCarType = (bodyClass: string): string | null => {
    if (!bodyClass) return null
    const bc = bodyClass.toLowerCase()
    if (bc.includes('sedan')) return 'sedan'
    if (bc.includes('coupe')) return 'coupe'
    if (bc.includes('convertible')) return 'convertible'
    if (bc.includes('hatchback')) return 'hatchback'
    if (bc.includes('wagon') || bc.includes('sport utility')) return 'suv'
    if (bc.includes('pickup') || bc.includes('truck')) return 'truck'
    if (bc.includes('van') || bc.includes('minivan')) return 'minivan'
    if (bc.includes('crossover')) return 'crossover'
    return null
  }

  // Compute vehicle classification badges
  // Prefer VIN-decoded values over database lookup
  const vinDecodedCarType = mapBodyClassToCarType(carData.bodyClass)
  const vehicleClass = getVehicleClass(carData.make, carData.model, vinDecodedCarType || vehicleSpec.carType)

  // Use VIN-decoded fuelType if available, otherwise fall back to database
  const effectiveFuelType = carData.fuelType || vehicleSpec.fuelType
  const fuelTypeBadge = formatFuelTypeBadge(effectiveFuelType)

  // Use VIN-decoded doors if available, otherwise fall back to database
  const effectiveDoors = carData.doors ? parseInt(carData.doors) : vehicleSpec.doors

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Vehicle Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <IoCarSportOutline className="w-4 h-4" />
          Vehicle Details
        </h3>

        {/* VIN Input - Quick Auto-Fill */}
        <div className="p-4 bg-purple-900/30 border border-purple-700/50 rounded-lg">
          <label className="block text-sm font-medium text-white mb-1">
            VIN <span className="text-gray-300 font-normal">(Recommended for instant auto-fill)</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={carData.vin || ''}
                onChange={(e) => {
                  onCarDataChange({ vin: e.target.value.toUpperCase() })
                  vinDecodedRef.current = false // Reset ref for manual entry
                  setVinDecoded(false)
                  setVinError('')
                }}
                maxLength={17}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white font-mono uppercase"
                placeholder="Enter 17-character VIN"
              />
            </div>
            <button
              type="button"
              onClick={handleVinDecode}
              disabled={vinDecoding || !carData.vin || carData.vin.length !== 17}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                vinDecoded
                  ? 'bg-emerald-600 text-white'
                  : vinDecoding
                    ? 'bg-purple-400 text-white cursor-wait'
                    : carData.vin?.length === 17
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {vinDecoding ? 'Decoding...' : vinDecoded ? (
                <span className="flex items-center gap-1">
                  <IoCheckmarkCircle className="w-4 h-4" />
                  Decoded
                </span>
              ) : 'Decode VIN'}
            </button>
          </div>
          {vinError && <p className="text-xs text-red-400 mt-1">{vinError}</p>}
          {vinDecoded && (
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <IoCheckmarkCircle className="w-3 h-3" />
              Vehicle details auto-filled from NHTSA database
            </p>
          )}
          {!vinDecoded && !vinError && (
            <p className="text-xs text-gray-400 mt-1">
              Enter your VIN to instantly fill in your vehicle details, or enter manually below
            </p>
          )}
        </div>

        {/* Year and Make - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Year <span className="text-red-500">*</span>
              {vinDecoded && (
                <span className="ml-1 text-emerald-400">
                  <IoCheckmarkCircle className="inline w-3 h-3" />
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={carData.year}
                onChange={(e) => handleChange('year', e.target.value)}
                disabled={vinDecoded}
                className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer ${
                  vinDecoded ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                required
              >
                <option value="">Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Make */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Make <span className="text-red-500">*</span>
              {vinDecoded && (
                <span className="ml-1 text-emerald-400">
                  <IoCheckmarkCircle className="inline w-3 h-3" />
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={carData.make}
                onChange={(e) => handleChange('make', e.target.value)}
                disabled={vinDecoded}
                className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer ${
                  vinDecoded ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                required
              >
                <option value="">Make</option>
                {/* Include VIN-decoded make if not in our database */}
                {vinDecoded && carData.make && !allMakes.includes(carData.make) && (
                  <option key={carData.make} value={carData.make}>
                    {carData.make}
                  </option>
                )}
                <optgroup label="Popular Brands">
                  {popularMakes.map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="All Brands">
                  {allMakes
                    .filter((make) => !popularMakes.includes(make))
                    .map((make) => (
                      <option key={make} value={make}>
                        {make}
                      </option>
                    ))}
                </optgroup>
              </select>
              <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Model and Color - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Model <span className="text-red-500">*</span>
              {vinDecoded && carData.model && (
                <span className="ml-1 text-emerald-400">
                  <IoCheckmarkCircle className="inline w-3 h-3" />
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={carData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer ${
                  vinDecoded || !carData.make ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                required
                disabled={vinDecoded || !carData.make}
              >
                <option value="">
                  {carData.make ? 'Model' : 'Select Make First'}
                </option>
                {/* Include VIN-decoded model if not in our database */}
                {vinDecoded && carData.model && !availableModels.includes(carData.model) && (
                  <option key={carData.model} value={carData.model}>
                    {carData.model}
                  </option>
                )}
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Color <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={carData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
                required
              >
                <option value="">Color</option>
                {CAR_COLORS.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
              <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Trim (Optional) */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Trim <span className="text-gray-300 font-normal">(Optional)</span>
            {vinDecoded && carData.trim && (
              <span className="ml-1 text-emerald-400">
                <IoCheckmarkCircle className="inline w-3 h-3" />
              </span>
            )}
          </label>
          <div className="relative">
            <select
              value={carData.trim}
              onChange={(e) => handleChange('trim', e.target.value)}
              className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer ${
                (vinDecoded && carData.trim) || !carData.make || !carData.model || !carData.year ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              disabled={(vinDecoded && !!carData.trim) || !carData.make || !carData.model || !carData.year}
            >
              <option value="">
                {!carData.make || !carData.model || !carData.year
                  ? 'Select Make, Model & Year First'
                  : availableTrims.length > 0 || (vinDecoded && carData.trim)
                    ? 'Select Trim (Optional)'
                    : 'No Trims Available'}
              </option>
              {/* Include VIN-decoded trim if not in our database */}
              {vinDecoded && carData.trim && !availableTrims.includes(carData.trim) && (
                <option key={carData.trim} value={carData.trim}>
                  {carData.trim}
                </option>
              )}
              {availableTrims.map((trim) => (
                <option key={trim} value={trim}>
                  {trim}
                </option>
              ))}
            </select>
            <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Vehicle Preview - shows when make, model, year are filled */}
      {carData.make && carData.model && carData.year && (
        <div className={`border rounded-lg p-4 ${
          carData.color
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              carData.color
                ? 'bg-green-100 dark:bg-green-800/50'
                : 'bg-amber-100 dark:bg-amber-800/50'
            }`}>
              <IoCarSportOutline className={`w-6 h-6 ${carData.color ? 'text-green-600' : 'text-amber-600'}`} />
            </div>
            <div className="flex-1">
              {/* Line 1: Year, Make, and Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {carData.year} {carData.make}
                </p>
                {vehicleClass && <VehicleBadge label={vehicleClass} />}
                {fuelTypeBadge && <VehicleBadge label={fuelTypeBadge} />}
              </div>

              {/* Line 2: Model and Trim (smaller) */}
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {carData.model}{carData.trim && ` ${carData.trim}`}
              </p>

              {/* Line 3: Color • Seats • Doors */}
              <div className="flex items-center gap-2 flex-wrap text-sm text-gray-600 dark:text-gray-300 mt-1">
                {/* Color circle and name */}
                {carData.color ? (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-500"
                      style={{ backgroundColor: getCarColorHex(carData.color) }}
                      aria-label={`Color: ${carData.color}`}
                    />
                    <span>{carData.color}</span>
                  </div>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 text-xs">Select color above</span>
                )}

                {/* Seats (if available) */}
                {vehicleSpec.seats !== null && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <IoPeopleOutline className="w-4 h-4" />
                      <span>{vehicleSpec.seats} Seats</span>
                    </div>
                  </>
                )}

                {/* Doors (prefer VIN-decoded, fall back to database) */}
                {effectiveDoors !== null && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <IoEnterOutline className="w-4 h-4" />
                      <span>{effectiveDoors} Doors</span>
                    </div>
                  </>
                )}
              </div>

              {/* Line 4: Status message */}
              <div className={`text-sm mt-1 ${carData.color ? 'text-gray-600 dark:text-gray-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {carData.color ? 'Ready to list on ItWhip' : 'Select a color to complete vehicle info'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Section */}
      {showLocationFields && (
        <>
          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <IoLocationOutline className="w-4 h-4" />
              Vehicle Location
            </h3>

            {/* Address Autocomplete */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Search Address <span className="text-gray-300 font-normal">(auto-fills city, state, zip)</span>
              </label>
              <AddressAutocomplete
                value=""
                city={carData.city}
                state={carData.state}
                zipCode={carData.zipCode}
                placeholder="Start typing an address in Arizona..."
                onAddressSelect={(address: AddressResult) => {
                  // Auto-populate street address, city, state, zipCode from selected address
                  onCarDataChange({
                    address: address.streetAddress || carData.address,
                    city: address.city || carData.city,
                    state: address.state || carData.state,
                    zipCode: address.zipCode || carData.zipCode
                  })
                }}
              />
            </div>

            {/* Street Address - For manual entry or auto-filled from address search */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Street Address <span className="text-gray-300 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={carData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm"
                placeholder="123 Main Street"
              />
              <p className="text-xs text-gray-400 mt-1">Auto-filled from search above, or enter manually</p>
            </div>

            {/* City, State, Zip - Shown below for manual override or verification */}
            <div className="grid grid-cols-3 gap-3">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={carData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Phoenix"
                  required
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={carData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer text-sm"
                    required
                  >
                    <option value="">State</option>
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.value}
                      </option>
                    ))}
                  </select>
                  <IoChevronDownOutline className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Zip Code */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Zip <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={carData.zipCode}
                  onChange={(e) =>
                    handleChange(
                      'zipCode',
                      e.target.value.replace(/\D/g, '').slice(0, 5)
                    )
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="85001"
                  required
                  maxLength={5}
                  pattern="[0-9]{5}"
                />
              </div>
            </div>

            {/* Arizona Location Notice */}
            <div className="p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg">
              <p className="text-xs text-amber-200">
                <strong>Note:</strong> Non-Arizona listings may not be displayed or approved.
                Vehicle must be located in Arizona at the time of signup and approval.{' '}
                <a href="/terms" className="underline font-medium hover:text-amber-100">
                  Terms & Conditions
                </a>{' '}apply.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

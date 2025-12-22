// app/components/host/CarInformationForm.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoCarSportOutline,
  IoChevronDownOutline,
  IoLocationOutline,
  IoColorPaletteOutline
} from 'react-icons/io5'
import { getAllMakes, getModelsByMake, getYears, getPopularMakes, getTrimsByModel } from '@/app/lib/data/vehicles'

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
  make: string
  model: string
  year: string
  color: string
  trim: string
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
  const allMakes = getAllMakes()
  const popularMakes = getPopularMakes()
  const years = getYears()

  // Update available models when make changes
  useEffect(() => {
    if (carData.make) {
      const models = getModelsByMake(carData.make)
      setAvailableModels(models)
      // Reset model if current model not in new make's models
      if (!models.includes(carData.model)) {
        onCarDataChange({ model: '', trim: '' })
      }
    } else {
      setAvailableModels([])
    }
  }, [carData.make])

  // Update available trims when make/model/year changes
  useEffect(() => {
    if (carData.make && carData.model && carData.year) {
      const trims = getTrimsByModel(carData.make, carData.model, carData.year)
      setAvailableTrims(trims)
      // Reset trim if current trim not in new model's trims for this year
      if (!trims.includes(carData.trim)) {
        onCarDataChange({ trim: '' })
      }
    } else {
      setAvailableTrims([])
      if (carData.trim) {
        onCarDataChange({ trim: '' })
      }
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Vehicle Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <IoCarSportOutline className="w-4 h-4" />
          Vehicle Details
        </h3>

        {/* Year and Make - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={carData.year}
                onChange={(e) => handleChange('year', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
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
            </label>
            <div className="relative">
              <select
                value={carData.make}
                onChange={(e) => handleChange('make', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
                required
              >
                <option value="">Make</option>
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
            </label>
            <div className="relative">
              <select
                value={carData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
                required
                disabled={!carData.make}
              >
                <option value="">
                  {carData.make ? 'Model' : 'Select Make First'}
                </option>
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
          </label>
          <div className="relative">
            <select
              value={carData.trim}
              onChange={(e) => handleChange('trim', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
              disabled={!carData.make || !carData.model || !carData.year}
            >
              <option value="">
                {!carData.make || !carData.model || !carData.year
                  ? 'Select Make, Model & Year First'
                  : availableTrims.length > 0
                    ? 'Select Trim (Optional)'
                    : 'No Trims Available'}
              </option>
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

      {/* Vehicle Preview */}
      {carData.make && carData.model && carData.year && carData.color && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800/50 flex items-center justify-center">
              <IoCarSportOutline className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {carData.year} {carData.make} {carData.model}
                {carData.trim && ` ${carData.trim}`}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <IoColorPaletteOutline className="w-4 h-4" />
                {carData.color} • Ready to list on ItWhip
              </p>
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

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <IoLocationOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={carData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Phoenix"
                  required
                />
              </div>
            </div>

            {/* State and Zip */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={carData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select State</option>
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                  <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Zip Code <span className="text-red-500">*</span>
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
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="85001"
                  required
                  maxLength={5}
                  pattern="[0-9]{5}"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

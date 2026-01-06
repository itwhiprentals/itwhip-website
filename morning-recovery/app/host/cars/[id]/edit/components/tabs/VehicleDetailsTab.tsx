// app/host/cars/[id]/edit/components/tabs/VehicleDetailsTab.tsx
'use client'

import {
  IoLockClosedOutline,
  IoCheckmarkCircle,
  IoInformationCircleOutline
} from 'react-icons/io5'
import {
  getAllMakes,
  getPopularMakes,
  getYears
} from '@/app/lib/data/vehicles'
import AddressAutocomplete from '../AddressAutocomplete'
import type { CarFormData } from '../../types'
import { CAR_TYPES, CAR_COLORS } from '../../types'

interface VehicleDetailsTabProps {
  formData: CarFormData
  setFormData: React.Dispatch<React.SetStateAction<CarFormData>>
  isLocked: boolean
  isApproved: boolean
  isFieldLocked: (fieldName: string) => boolean
  isVinVerified: (fieldName: string) => boolean
  validationErrors: Record<string, string>
  availableModels: string[]
  availableTrims: string[]
  vinDecoding: boolean
  vinError: string
  vinDecoded: boolean
  vinDecodedFields: string[]
  handleVinDecode: () => Promise<void>
  handleMakeChange: (make: string) => void
  handleModelChange: (model: string) => void
  handleYearChange: (year: number) => void
  setVinDecoded: (value: boolean) => void
  setVinError: (value: string) => void
}

export function VehicleDetailsTab({
  formData,
  setFormData,
  isLocked,
  isApproved,
  isFieldLocked,
  isVinVerified,
  validationErrors,
  availableModels,
  availableTrims,
  vinDecoding,
  vinError,
  vinDecoded,
  vinDecodedFields,
  handleVinDecode,
  handleMakeChange,
  handleModelChange,
  handleYearChange,
  setVinDecoded,
  setVinError
}: VehicleDetailsTabProps) {
  const years = getYears()

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle Details</h3>

      {/* VIN and License Plate - Vehicle Identification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            VIN (Vehicle Identification Number) <span className="text-red-500">*</span>
            {isFieldLocked('vin') && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                Locked
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.vin}
              onChange={(e) => {
                setFormData({ ...formData, vin: e.target.value.toUpperCase() })
                setVinDecoded(false)
                setVinError('')
              }}
              disabled={isFieldLocked('vin')}
              maxLength={17}
              className={`w-full px-3 py-2 pr-28 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono uppercase ${
                validationErrors.vin || vinError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } ${isFieldLocked('vin') ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
              placeholder="17-character VIN"
            />
            {!isFieldLocked('vin') && formData.vin?.length === 17 && (
              <button
                type="button"
                onClick={handleVinDecode}
                disabled={vinDecoding}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-white text-xs rounded font-medium transition-colors ${
                  vinDecoded
                    ? 'bg-emerald-500'
                    : vinDecoding
                      ? 'bg-purple-400'
                      : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {vinDecoding ? 'Decoding...' : vinDecoded ? 'Decoded!' : 'Decode VIN'}
              </button>
            )}
          </div>
          {vinError && <p className="text-xs text-red-500 mt-1">{vinError}</p>}
          {validationErrors.vin && <p className="text-xs text-red-500 mt-1">{validationErrors.vin}</p>}
          <p className="text-xs text-gray-500 mt-1">Enter VIN and click "Decode" to auto-fill vehicle details</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            License Plate Number <span className="text-red-500">*</span>
            {isFieldLocked('licensePlate') && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                Locked
              </span>
            )}
          </label>
          <input
            type="text"
            value={formData.licensePlate}
            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
            disabled={isFieldLocked('licensePlate')}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white uppercase ${isFieldLocked('licensePlate') ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
            placeholder="ABC1234"
          />
        </div>
      </div>

      {/* Vehicle Information Policy Note - shown when VIN is decoded */}
      {vinDecoded && vinDecodedFields.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-start gap-2">
            <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Vehicle Information Policy:</strong> Your vehicle details have been verified through VIN
                decoding to ensure accuracy for insurance and guest safety. If your vehicle has custom
                modifications (different color, aftermarket parts, etc.), please{' '}
                <a
                  href="mailto:support@itwhip.com?subject=Vehicle Information Update Request"
                  className="underline font-medium hover:text-blue-900 dark:hover:text-blue-200"
                >
                  contact support
                </a>{' '}
                to request changes.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Make *
            {isVinVerified('make') && !isApproved && (
              <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                <IoCheckmarkCircle className="inline w-3 h-3 mr-0.5" />
                VIN Verified
              </span>
            )}
            {isFieldLocked('make') && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                Locked
              </span>
            )}
          </label>
          <select
            value={formData.make}
            onChange={(e) => handleMakeChange(e.target.value)}
            disabled={isFieldLocked('make')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              validationErrors.make ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } ${isFieldLocked('make') ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
          >
            <option value="">Select Make</option>
            <optgroup label="Popular Brands">
              {getPopularMakes().map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </optgroup>
            <optgroup label="All Brands">
              {getAllMakes().filter(m => !getPopularMakes().includes(m)).map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </optgroup>
          </select>
          {validationErrors.make && <p className="text-red-500 text-xs mt-1">{validationErrors.make}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Model *
            {isVinVerified('model') && !isApproved && (
              <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                <IoCheckmarkCircle className="inline w-3 h-3 mr-0.5" />
                VIN Verified
              </span>
            )}
            {isFieldLocked('model') && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                Locked
              </span>
            )}
          </label>
          <select
            value={formData.model}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={!formData.make || isFieldLocked('model')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              validationErrors.model ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } ${(!formData.make || isFieldLocked('model')) ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
          >
            <option value="">{formData.make ? 'Select Model' : 'Select Make First'}</option>
            {/* Include car's existing model if not in our database (e.g., discontinued models like Ford Fusion) */}
            {formData.model && !availableModels.includes(formData.model) && (
              <option key={formData.model} value={formData.model}>
                {formData.model}
              </option>
            )}
            {availableModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          {validationErrors.model && <p className="text-red-500 text-xs mt-1">{validationErrors.model}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Year *
            {isVinVerified('year') && !isApproved && (
              <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                <IoCheckmarkCircle className="inline w-3 h-3 mr-0.5" />
                VIN Verified
              </span>
            )}
            {isFieldLocked('year') && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                Locked
              </span>
            )}
          </label>
          <select
            value={formData.year}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            disabled={isFieldLocked('year')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              validationErrors.year ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } ${isFieldLocked('year') ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {validationErrors.year && <p className="text-red-500 text-xs mt-1">{validationErrors.year}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trim
            {isVinVerified('trim') && !isApproved && (
              <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                <IoCheckmarkCircle className="inline w-3 h-3 mr-0.5" />
                VIN Verified
              </span>
            )}
            {isFieldLocked('trim') && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                Locked
              </span>
            )}
          </label>
          <select
            value={formData.trim}
            onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
            disabled={!formData.model || isFieldLocked('trim')}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              (!formData.model || isFieldLocked('trim')) ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''
            }`}
          >
            <option value="">{formData.model ? 'Select Trim (Optional)' : 'Select Model First'}</option>
            {/* Include car's existing trim if not in our database (e.g., VIN-decoded trims) */}
            {formData.trim && !availableTrims.includes(formData.trim) && (
              <option key={formData.trim} value={formData.trim}>
                {formData.trim}
              </option>
            )}
            {availableTrims.map(trim => (
              <option key={trim} value={trim}>{trim}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Auto-filled from VIN or select manually</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Color *
            {isFieldLocked('color') && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                Locked
              </span>
            )}
          </label>
          <select
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            disabled={isFieldLocked('color')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
              validationErrors.color ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } ${isFieldLocked('color') ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
          >
            <option value="">Select Color</option>
            {CAR_COLORS.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
          {validationErrors.color && <p className="text-red-500 text-xs mt-1">{validationErrors.color}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vehicle Type
          </label>
          <select
            value={formData.carType}
            onChange={(e) => setFormData({ ...formData, carType: e.target.value })}
            disabled={isLocked}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
          >
            {CAR_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Transmission
          </label>
          <select
            value={formData.transmission}
            onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
            disabled={isLocked}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
          >
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Vehicle Description</h4>
        <div>
          <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span>Description *</span>
            <span className={`text-xs ${
              (formData.description?.length || 0) < 50
                ? 'text-red-500'
                : 'text-gray-500'
            }`}>
              {formData.description?.length || 0}/50 min
            </span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isLocked}
            rows={4}
            minLength={50}
            maxLength={2000}
            placeholder="Describe your vehicle to potential renters. Highlight special features, recent upgrades, or what makes it a great choice... (minimum 50 characters)"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none ${
              validationErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
          />
          {validationErrors.description && (
            <p className="text-xs text-red-500 mt-1">{validationErrors.description}</p>
          )}
          {(formData.description?.length || 0) < 50 && !validationErrors.description && (
            <p className="text-xs text-amber-500 mt-1">
              {50 - (formData.description?.length || 0)} more characters needed
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formData.description?.length || 0}/2000 characters
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Pickup Location</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This is where guests will pick up your vehicle. Search for an address to auto-populate all location fields.
        </p>

        {/* Arizona Location Notice */}
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg mb-4">
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Note:</strong> Non-Arizona listings may not be displayed or approved.
            Vehicle must be located in Arizona at the time of approval.{' '}
            <a href="/terms" className="underline font-medium hover:text-amber-900 dark:hover:text-amber-200">
              Terms & Conditions
            </a>{' '}apply.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Street Address *
            </label>
            <AddressAutocomplete
              value={formData.address}
              city={formData.city}
              state={formData.state}
              zipCode={formData.zipCode}
              onAddressSelect={(address) => {
                setFormData(prev => ({
                  ...prev,
                  address: address.streetAddress,
                  city: address.city,
                  state: address.state,
                  zipCode: address.zipCode,
                  latitude: address.latitude,
                  longitude: address.longitude
                }))
              }}
              disabled={isLocked}
              placeholder="Start typing to search for an address..."
            />
            {validationErrors.address && <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              readOnly
              disabled={isLocked}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white cursor-not-allowed ${isLocked ? 'opacity-60' : ''}`}
              placeholder="Auto-filled from address"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-filled from address selection</p>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                readOnly
                disabled={isLocked}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white cursor-not-allowed ${isLocked ? 'opacity-60' : ''}`}
                placeholder="Auto-filled"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                value={formData.zipCode}
                readOnly
                disabled={isLocked}
                className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white cursor-not-allowed ${
                  validationErrors.zipCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } ${isLocked ? 'opacity-60' : ''}`}
                placeholder="Auto-filled"
              />
              {validationErrors.zipCode && <p className="text-red-500 text-xs mt-1">{validationErrors.zipCode}</p>}
            </div>
          </div>

          {/* Coordinates display - only show if coordinates are valid (not 0,0) */}
          {formData.latitude != null && formData.longitude != null &&
           (formData.latitude !== 0 || formData.longitude !== 0) && (
            <div className="md:col-span-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <IoCheckmarkCircle className="w-4 h-4" />
                <span>Location verified: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VehicleDetailsTab

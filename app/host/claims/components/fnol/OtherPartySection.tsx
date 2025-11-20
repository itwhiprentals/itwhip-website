// app/host/claims/components/fnol/OtherPartySection.tsx
'use client'

import { useState } from 'react'
import { 
  IoPersonOutline, 
  IoChevronDownOutline, 
  IoChevronUpOutline 
} from 'react-icons/io5'
import type { OtherPartySectionProps } from './types'

export default function OtherPartySection({
  otherPartyInvolved,
  setOtherPartyInvolved,
  otherPartyDriverName,
  setOtherPartyDriverName,
  otherPartyDriverPhone,
  setOtherPartyDriverPhone,
  otherPartyDriverLicense,
  setOtherPartyDriverLicense,
  otherPartyDriverLicenseState,
  setOtherPartyDriverLicenseState,
  otherPartyVehicleYear,
  setOtherPartyVehicleYear,
  otherPartyVehicleMake,
  setOtherPartyVehicleMake,
  otherPartyVehicleModel,
  setOtherPartyVehicleModel,
  otherPartyVehiclePlate,
  setOtherPartyVehiclePlate,
  otherPartyVehicleVin,
  setOtherPartyVehicleVin,
  otherPartyInsuranceCarrier,
  setOtherPartyInsuranceCarrier,
  otherPartyInsurancePolicy,
  setOtherPartyInsurancePolicy,
  usStates,
  disabled = false
}: OtherPartySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 rounded-lg shadow-sm border-2 border-rose-200 dark:border-rose-800">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className="w-full flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <IoPersonOutline className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Other Party Involved
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
        </div>
        {isExpanded ? (
          <IoChevronUpOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <IoChevronDownOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 pt-2">
          {/* Was Another Vehicle Involved */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={otherPartyInvolved}
                onChange={(e) => setOtherPartyInvolved(e.target.checked)}
                disabled={disabled}
                className="mt-1 w-4 h-4 text-rose-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-rose-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900 dark:text-white">
                  Another vehicle was involved
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Check this if there was another driver or vehicle in the incident
                </p>
              </div>
            </label>
          </div>

          {otherPartyInvolved && (
            <div className="space-y-6 pl-7 border-l-2 border-rose-300 dark:border-rose-700">
              {/* Driver Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600"></div>
                  Driver Information
                </h4>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    value={otherPartyDriverName}
                    onChange={(e) => setOtherPartyDriverName(e.target.value)}
                    placeholder="Jane Smith"
                    disabled={disabled}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={otherPartyDriverPhone}
                      onChange={(e) => setOtherPartyDriverPhone(e.target.value)}
                      placeholder="(555) 987-6543"
                      disabled={disabled}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      License Number <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={otherPartyDriverLicense}
                      onChange={(e) => setOtherPartyDriverLicense(e.target.value)}
                      placeholder="D1234567"
                      disabled={disabled}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License State <span className="text-gray-500">(Optional)</span>
                  </label>
                  <select
                    value={otherPartyDriverLicenseState}
                    onChange={(e) => setOtherPartyDriverLicenseState(e.target.value)}
                    disabled={disabled}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <option value="">Select state...</option>
                    {usStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4 pt-4 border-t border-rose-200 dark:border-rose-800">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600"></div>
                  Other Vehicle Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Year <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      value={otherPartyVehicleYear}
                      onChange={(e) => setOtherPartyVehicleYear(e.target.value)}
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      disabled={disabled}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Make <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={otherPartyVehicleMake}
                      onChange={(e) => setOtherPartyVehicleMake(e.target.value)}
                      placeholder="Honda"
                      disabled={disabled}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Model <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={otherPartyVehicleModel}
                      onChange={(e) => setOtherPartyVehicleModel(e.target.value)}
                      placeholder="Civic"
                      disabled={disabled}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      License Plate <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={otherPartyVehiclePlate}
                      onChange={(e) => setOtherPartyVehiclePlate(e.target.value)}
                      placeholder="ABC1234"
                      disabled={disabled}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      VIN <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={otherPartyVehicleVin}
                      onChange={(e) => setOtherPartyVehicleVin(e.target.value)}
                      placeholder="1HGBH41JXMN109186"
                      maxLength={17}
                      disabled={disabled}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      17-character Vehicle Identification Number
                    </p>
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div className="space-y-4 pt-4 border-t border-rose-200 dark:border-rose-800">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600"></div>
                  Other Party Insurance
                </h4>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Insurance Carrier <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={otherPartyInsuranceCarrier}
                    onChange={(e) => setOtherPartyInsuranceCarrier(e.target.value)}
                    placeholder="e.g., State Farm, Geico, Progressive"
                    disabled={disabled}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Policy Number <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={otherPartyInsurancePolicy}
                    onChange={(e) => setOtherPartyInsurancePolicy(e.target.value)}
                    placeholder="Policy number"
                    disabled={disabled}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  />
                </div>
              </div>

              {/* Info Note */}
              <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-700">
                <p className="text-xs text-rose-800 dark:text-rose-200">
                  <strong>Pro tip:</strong> Exchange information at the scene when safe to do so. Take photos of their license, registration, and insurance card. This information is crucial for subrogation and liability determination.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
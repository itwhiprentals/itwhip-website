// app/host/claims/components/fnol/VehicleConditionSection.tsx
'use client'

import { IoSpeedometerOutline } from 'react-icons/io5'
import type { VehicleConditionSectionProps } from './types'

export default function VehicleConditionSection({
  odometerAtIncident,
  setOdometerAtIncident,
  vehicleDrivable,
  setVehicleDrivable,
  vehicleLocation,
  setVehicleLocation,
  errors,
  disabled = false
}: VehicleConditionSectionProps) {
  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-lg shadow-sm border-2 border-orange-200 dark:border-orange-800">
      <div className="flex items-center gap-2 mb-4">
        <IoSpeedometerOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Vehicle Condition at Incident
        </h3>
        <span className="ml-auto text-xs text-orange-600 dark:text-orange-400 font-medium">
          Required
        </span>
      </div>

      {/* Odometer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Odometer Reading at Incident *
        </label>
        <input
          type="number"
          value={odometerAtIncident}
          onChange={(e) => setOdometerAtIncident(e.target.value)}
          placeholder="e.g., 45678"
          min="0"
          disabled={disabled}
          className={`
            w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
            text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
            focus:ring-2 focus:ring-orange-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errors.odometerAtIncident ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
          `}
        />
        {errors.odometerAtIncident && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.odometerAtIncident}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter the exact mileage shown on the odometer at the time of the incident
        </p>
      </div>

      {/* Vehicle Drivable */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={vehicleDrivable}
            onChange={(e) => setVehicleDrivable(e.target.checked)}
            disabled={disabled}
            className="mt-1 w-4 h-4 text-orange-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex-1">
            <span className="font-medium text-gray-900 dark:text-white">
              Vehicle is drivable
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Can the vehicle be safely driven after the incident?
            </p>
          </div>
        </label>
      </div>

      {/* Current Location (if not drivable) */}
      {!vehicleDrivable && (
        <div className="pl-7 pt-2 border-l-2 border-orange-300 dark:border-orange-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Vehicle Location *
          </label>
          <input
            type="text"
            value={vehicleLocation}
            onChange={(e) => setVehicleLocation(e.target.value)}
            placeholder="e.g., Towed to Joe's Auto Body, 123 Repair St, Phoenix AZ"
            disabled={disabled}
            className={`
              w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
              text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
              focus:ring-2 focus:ring-orange-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.vehicleLocation ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
            `}
          />
          {errors.vehicleLocation && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.vehicleLocation}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            If the vehicle was towed, provide the tow yard or repair shop address
          </p>
        </div>
      )}

      {/* Info Note */}
      <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
        <p className="text-xs text-orange-800 dark:text-orange-200">
          <strong>Why we need this:</strong> Insurance companies require accurate odometer readings and vehicle location information to process claims and verify vehicle condition.
        </p>
      </div>
    </div>
  )
}
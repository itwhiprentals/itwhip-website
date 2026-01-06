// app/host/profile/components/insurance/VehicleCoverageSection.tsx
'use client'

import { IoCarOutline } from 'react-icons/io5'

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  hasCoverage: boolean
}

interface InsuranceData {
  host: {
    id: string
    name: string
    email: string
  }
  vehicles: Vehicle[]
  summary: {
    totalVehicles: number
    coveredVehicles: number
    gapVehicles: number
  }
}

interface VehicleCoverageSectionProps {
  insuranceData: InsuranceData
}

export default function VehicleCoverageSection({
  insuranceData
}: VehicleCoverageSectionProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
        Vehicle Coverage Summary
      </h4>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center mb-4">
        {/* Total Vehicles */}
        <div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {insuranceData.summary.totalVehicles}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Vehicles</div>
        </div>

        {/* Covered Vehicles */}
        <div>
          <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
            {insuranceData.summary.coveredVehicles}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Covered</div>
        </div>

        {/* Not Covered (Gap) */}
        <div>
          <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
            {insuranceData.summary.gapVehicles}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Not Covered</div>
        </div>
      </div>

      {/* Vehicle List */}
      {insuranceData.vehicles && insuranceData.vehicles.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {insuranceData.vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`flex items-center justify-between p-2 sm:p-3 rounded text-sm ${
                vehicle.hasCoverage
                  ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <IoCarOutline
                  className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                    vehicle.hasCoverage
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                />
                <span className="truncate text-xs sm:text-sm text-gray-900 dark:text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ml-2 ${
                  vehicle.hasCoverage
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                }`}
              >
                {vehicle.hasCoverage ? 'Covered' : 'Not Covered'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty State - No Vehicles */}
      {(!insuranceData.vehicles || insuranceData.vehicles.length === 0) && (
        <div className="text-center py-6">
          <IoCarOutline className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No vehicles found
          </p>
        </div>
      )}
    </div>
  )
}
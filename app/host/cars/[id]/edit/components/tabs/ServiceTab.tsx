// app/host/cars/[id]/edit/components/tabs/ServiceTab.tsx
'use client'

import ServiceHistoryList from '@/app/components/host/ServiceHistoryList'
import ServiceDueAlerts from '@/app/components/host/ServiceDueAlerts'
import { IoAddOutline, IoWarningOutline } from 'react-icons/io5'

interface ServiceTabProps {
  carId: string
  isLocked: boolean
  onAddServiceRecord: () => void
}

export function ServiceTab({ carId, isLocked, onAddServiceRecord }: ServiceTabProps) {
  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Service & Maintenance History
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track all vehicle maintenance for compliance and insurance claims
          </p>
        </div>
        <button
          onClick={onAddServiceRecord}
          disabled={isLocked}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            isLocked
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <IoAddOutline className="w-5 h-5" />
          Add Service Record
        </button>
      </div>

      {/* Lock Warning (if vehicle has active claim) */}
      {isLocked && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Service records locked during active claim
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                You cannot add or modify service records while this vehicle has an active insurance claim.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Service Due Alerts */}
      <ServiceDueAlerts carId={carId} />

      {/* Service History List */}
      <ServiceHistoryList carId={carId} />
    </div>
  )
}

export default ServiceTab


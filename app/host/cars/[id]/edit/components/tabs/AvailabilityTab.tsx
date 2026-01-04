// app/host/cars/[id]/edit/components/tabs/AvailabilityTab.tsx
'use client'

import HostAvailabilityCalendar from '../HostAvailabilityCalendar'
import type { CarFormData } from '../../types'

interface AvailabilityTabProps {
  carId: string
  formData: CarFormData
  setFormData: React.Dispatch<React.SetStateAction<CarFormData>>
  isLocked: boolean
}

export function AvailabilityTab({
  carId,
  formData,
  setFormData,
  isLocked
}: AvailabilityTabProps) {
  return (
    <div className="space-y-6">
      {/* Availability Settings Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Availability Settings</h3>

        {isLocked && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Availability settings cannot be modified while vehicle has an active claim
            </p>
          </div>
        )}

        <div className="space-y-4">
          <label className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              disabled={isLocked}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
            />
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Car is Active</span>
              <p className="text-sm text-gray-500">Make this car available for booking</p>
            </div>
          </label>

          <label className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={formData.instantBook}
              onChange={(e) => setFormData({ ...formData, instantBook: e.target.checked })}
              disabled={isLocked}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
            />
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Instant Book</span>
              <p className="text-sm text-gray-500">Allow guests to book without your approval</p>
            </div>
          </label>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Advance Notice (hours)
            </label>
            <input
              type="number"
              value={formData.advanceNotice}
              onChange={(e) => setFormData({ ...formData, advanceNotice: parseInt(e.target.value) || 0 })}
              min="0"
              max="72"
              disabled={isLocked}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
            />
            <p className="text-xs text-gray-500 mt-1">How far in advance can guests book</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum Trip (days)
            </label>
            <input
              type="number"
              value={formData.minTripDuration}
              onChange={(e) => setFormData({ ...formData, minTripDuration: parseInt(e.target.value) || 1 })}
              min="1"
              max="30"
              disabled={isLocked}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Trip (days)
            </label>
            <input
              type="number"
              value={formData.maxTripDuration}
              onChange={(e) => setFormData({ ...formData, maxTripDuration: parseInt(e.target.value) || 30 })}
              min="1"
              max="365"
              disabled={isLocked}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Full Availability Calendar */}
      <HostAvailabilityCalendar
        carId={carId}
        isLocked={isLocked}
      />
    </div>
  )
}

export default AvailabilityTab


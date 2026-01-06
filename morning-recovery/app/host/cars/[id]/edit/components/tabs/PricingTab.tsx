// app/host/cars/[id]/edit/components/tabs/PricingTab.tsx
'use client'

import type { CarFormData } from '../../types'

interface PricingTabProps {
  formData: CarFormData
  setFormData: React.Dispatch<React.SetStateAction<CarFormData>>
  isLocked: boolean
  validationErrors: Record<string, string>
}

export function PricingTab({
  formData,
  setFormData,
  isLocked,
  validationErrors
}: PricingTabProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing & Fees</h3>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Daily Rate *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.dailyRate}
              onChange={(e) => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) || 0 })}
              min="0"
              step="10"
              disabled={isLocked}
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                validationErrors.dailyRate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
            />
          </div>
          {validationErrors.dailyRate && <p className="text-red-500 text-xs mt-1">{validationErrors.dailyRate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weekly Rate
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.weeklyRate}
              onChange={(e) => setFormData({ ...formData, weeklyRate: parseFloat(e.target.value) || 0 })}
              min="0"
              step="10"
              disabled={isLocked}
              className={`w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Suggested: ${(formData.dailyRate * 6.5).toFixed(0)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Monthly Rate
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.monthlyRate}
              onChange={(e) => setFormData({ ...formData, monthlyRate: parseFloat(e.target.value) || 0 })}
              min="0"
              step="10"
              disabled={isLocked}
              className={`w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Suggested: ${(formData.dailyRate * 25).toFixed(0)}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Delivery Options</h4>
        <div className="space-y-3">
          <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={formData.airportPickup}
              onChange={(e) => setFormData({ ...formData, airportPickup: e.target.checked })}
              disabled={isLocked}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Airport Pickup Available</span>
          </label>

          <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={formData.hotelDelivery}
              onChange={(e) => setFormData({ ...formData, hotelDelivery: e.target.checked })}
              disabled={isLocked}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Hotel Delivery Available</span>
          </label>

          <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={formData.homeDelivery}
              onChange={(e) => setFormData({ ...formData, homeDelivery: e.target.checked })}
              disabled={isLocked}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Home Delivery Available</span>
          </label>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Delivery Fee
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.deliveryFee}
              onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) || 0 })}
              min="0"
              step="5"
              disabled={isLocked}
              className={`w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingTab

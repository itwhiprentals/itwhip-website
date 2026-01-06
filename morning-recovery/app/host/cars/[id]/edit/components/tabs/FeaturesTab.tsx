// app/host/cars/[id]/edit/components/tabs/FeaturesTab.tsx
'use client'

import { getVehicleFeatures, groupFeaturesByCategory } from '@/app/lib/data/vehicle-features'
import {
  IoSparklesOutline,
  IoShieldOutline,
  IoCarOutline,
  IoInformationCircleOutline,
  IoReorderThreeOutline
} from 'react-icons/io5'
import type { CarFormData } from '../../types'
import { CAR_RULES } from '../../types'

interface FeaturesTabProps {
  formData: CarFormData
  setFormData: React.Dispatch<React.SetStateAction<CarFormData>>
  isLocked: boolean
  toggleRule: (rule: string) => void
}

export function FeaturesTab({
  formData,
  setFormData,
  isLocked,
  toggleRule
}: FeaturesTabProps) {
  // Get auto-detected features based on vehicle info
  const autoFeatures = getVehicleFeatures(
    formData.carType || 'SEDAN',
    formData.year,
    formData.fuelType,
    formData.make,
    formData.model
  )
  const groupedFeatures = groupFeaturesByCategory(autoFeatures)

  // Track active features (formData.features contains ACTIVE features)
  const currentFeatures = formData.features || []
  const activeFeatures = currentFeatures.length > 0 ? currentFeatures : autoFeatures

  const handleFeatureToggle = (feature: string, isActive: boolean) => {
    if (isLocked) return
    const newFeatures = isActive
      ? activeFeatures.filter(f => f !== feature)
      : [...activeFeatures, feature]
    setFormData(prev => ({ ...prev, features: newFeatures }))
  }

  return (
    <div className="space-y-6">
      {/* Auto-populated Features Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IoSparklesOutline className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vehicle Features
            </h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            Auto-detected
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Features are automatically determined based on your {formData.year} {formData.make} {formData.model}'s type and year.
          Uncheck any features that are not working or unavailable on your vehicle.
        </p>

        {/* Display auto-populated features by category with toggles */}
        <div className="space-y-4">
          {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                {category === 'safety' && <IoShieldOutline className="w-4 h-4 text-blue-600" />}
                {category === 'comfort' && <IoCarOutline className="w-4 h-4 text-purple-600" />}
                {category === 'technology' && <IoInformationCircleOutline className="w-4 h-4 text-green-600" />}
                {category === 'utility' && <IoReorderThreeOutline className="w-4 h-4 text-orange-600" />}
                <span className="capitalize">
                  {category === 'safety' ? 'Safety' :
                   category === 'comfort' ? 'Comfort & Interior' :
                   category === 'technology' ? 'Technology' : 'Utility'}
                </span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categoryFeatures.map(feature => {
                  const isActive = activeFeatures.includes(feature)
                  return (
                    <label
                      key={feature}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 opacity-60'
                      } ${isLocked ? 'cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => handleFeatureToggle(feature, isActive)}
                        disabled={isLocked}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className={`text-sm ${isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400 line-through'}`}>
                        {feature}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
            {activeFeatures.length} of {autoFeatures.length} features active
          </div>
        </div>

        {/* Missing features button */}
        <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Missing a feature your vehicle has?
          </p>
          <a
            href="mailto:support@itwhip.com?subject=Feature Request for My Vehicle"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Contact Support
          </a>
        </div>
      </div>

      {/* Rental Rules Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Rental Rules</h4>

        {isLocked && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Rules cannot be modified while vehicle has an active claim
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CAR_RULES.map((rule) => (
            <label key={rule} className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={(formData.rules || []).includes(rule)}
                onChange={() => toggleRule(rule)}
                disabled={isLocked}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
              />
              <span className="text-gray-700 dark:text-gray-300">{rule}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeaturesTab

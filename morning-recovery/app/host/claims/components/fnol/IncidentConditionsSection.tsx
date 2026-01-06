// app/host/claims/components/fnol/IncidentConditionsSection.tsx
'use client'

import { IoCloudyOutline } from 'react-icons/io5'
import type { IncidentConditionsSectionProps } from './types'
import { WEATHER_OPTIONS, ROAD_OPTIONS, TRAFFIC_OPTIONS } from './types'

export default function IncidentConditionsSection({
  weatherConditions,
  setWeatherConditions,
  weatherDescription,
  setWeatherDescription,
  roadConditions,
  setRoadConditions,
  roadDescription,
  setRoadDescription,
  estimatedSpeed,
  setEstimatedSpeed,
  trafficConditions,
  setTrafficConditions,
  errors,
  disabled = false
}: IncidentConditionsSectionProps) {
  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/10 dark:to-cyan-900/10 rounded-lg shadow-sm border-2 border-sky-200 dark:border-sky-800">
      <div className="flex items-center gap-2 mb-4">
        <IoCloudyOutline className="w-5 h-5 text-sky-600 dark:text-sky-400" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Incident Conditions
        </h3>
        <span className="ml-auto text-xs text-sky-600 dark:text-sky-400 font-medium">
          Required
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weather Conditions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Weather Conditions *
          </label>
          <select
            value={weatherConditions}
            onChange={(e) => setWeatherConditions(e.target.value)}
            disabled={disabled}
            className={`
              w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
              text-gray-900 dark:text-white
              focus:ring-2 focus:ring-sky-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.weatherConditions ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
            `}
          >
            <option value="">Select weather...</option>
            {WEATHER_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.weatherConditions && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.weatherConditions}</p>
          )}
        </div>

        {/* Road Conditions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Road Conditions *
          </label>
          <select
            value={roadConditions}
            onChange={(e) => setRoadConditions(e.target.value)}
            disabled={disabled}
            className={`
              w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
              text-gray-900 dark:text-white
              focus:ring-2 focus:ring-sky-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.roadConditions ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
            `}
          >
            <option value="">Select road conditions...</option>
            {ROAD_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.roadConditions && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.roadConditions}</p>
          )}
        </div>

        {/* Estimated Speed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estimated Speed (mph) <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <input
            type="number"
            value={estimatedSpeed}
            onChange={(e) => setEstimatedSpeed(e.target.value)}
            placeholder="e.g., 35"
            min="0"
            max="150"
            disabled={disabled}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Approximate speed at the time of impact
          </p>
        </div>

        {/* Traffic Conditions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Traffic Conditions <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <select
            value={trafficConditions}
            onChange={(e) => setTrafficConditions(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <option value="">Select traffic...</option>
            {TRAFFIC_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Weather Description (if Other selected) */}
      {weatherConditions === 'Other' && (
        <div className="border-t border-sky-200 dark:border-sky-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Weather Description
          </label>
          <textarea
            value={weatherDescription}
            onChange={(e) => setWeatherDescription(e.target.value)}
            rows={2}
            placeholder="Describe the weather conditions..."
            disabled={disabled}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
        </div>
      )}

      {/* Road Description (if Other selected) */}
      {roadConditions === 'Other' && (
        <div className="border-t border-sky-200 dark:border-sky-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Road Description
          </label>
          <textarea
            value={roadDescription}
            onChange={(e) => setRoadDescription(e.target.value)}
            rows={2}
            placeholder="Describe the road conditions..."
            disabled={disabled}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
        </div>
      )}

      {/* Info Note */}
      <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-700">
        <p className="text-xs text-sky-800 dark:text-sky-200">
          <strong>Why we need this:</strong> Environmental conditions help insurers understand contributing factors and determine liability. Be as accurate as possible.
        </p>
      </div>
    </div>
  )
}
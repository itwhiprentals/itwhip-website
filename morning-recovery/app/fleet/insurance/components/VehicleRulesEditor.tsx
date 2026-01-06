// app/fleet/insurance/components/VehicleRulesEditor.tsx

'use client'

import { useState, useEffect } from 'react'
import { 
  IoCarSportOutline,
  IoWarningOutline,
  IoAddOutline,
  IoTrashOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface VehicleRules {
  categories: {
    [key: string]: {
      eligible: boolean
      multiplier: number
      maxValue?: number
      minValue?: number
    }
  }
  riskLevels: {
    [key: string]: {
      eligible: boolean
      multiplier: number
      requiresReview?: boolean
    }
  }
  excludedMakes: string[]
  excludedModels: string[]
  vehicleAgeLimit: number
  valueRange: {
    min: number
    max: number
  }
}

interface VehicleRulesEditorProps {
  rules: VehicleRules | null
  onChange: (rules: VehicleRules) => void
}

const VEHICLE_CATEGORIES = [
  { value: 'ECONOMY', label: 'Economy', description: 'Under $25k value' },
  { value: 'STANDARD', label: 'Standard', description: '$25k - $50k' },
  { value: 'PREMIUM', label: 'Premium', description: '$50k - $100k' },
  { value: 'LUXURY', label: 'Luxury', description: '$100k - $250k' },
  { value: 'EXOTIC', label: 'Exotic', description: '$250k - $500k' },
  { value: 'SUPERCAR', label: 'Supercar', description: 'Over $500k' }
]

const RISK_LEVELS = [
  { value: 'LOW', label: 'Low Risk', color: 'text-green-600' },
  { value: 'MEDIUM', label: 'Medium Risk', color: 'text-yellow-600' },
  { value: 'HIGH', label: 'High Risk', color: 'text-orange-600' },
  { value: 'EXTREME', label: 'Extreme Risk', color: 'text-red-600' }
]

export default function VehicleRulesEditor({ rules, onChange }: VehicleRulesEditorProps) {
  const [localRules, setLocalRules] = useState<VehicleRules>({
    categories: {
      ECONOMY: { eligible: true, multiplier: 0.8 },
      STANDARD: { eligible: true, multiplier: 1.0 },
      PREMIUM: { eligible: true, multiplier: 1.2 },
      LUXURY: { eligible: true, multiplier: 1.5 },
      EXOTIC: { eligible: false, multiplier: 2.0 },
      SUPERCAR: { eligible: false, multiplier: 3.0 }
    },
    riskLevels: {
      LOW: { eligible: true, multiplier: 1.0 },
      MEDIUM: { eligible: true, multiplier: 1.2 },
      HIGH: { eligible: true, multiplier: 1.5, requiresReview: true },
      EXTREME: { eligible: false, multiplier: 2.0, requiresReview: true }
    },
    excludedMakes: [],
    excludedModels: [],
    vehicleAgeLimit: 15,
    valueRange: {
      min: 5000,
      max: 500000
    }
  })

  const [newExcludedMake, setNewExcludedMake] = useState('')
  const [newExcludedModel, setNewExcludedModel] = useState('')

  useEffect(() => {
    if (rules) {
      setLocalRules(rules)
    }
  }, [rules])

  const updateCategory = (category: string, field: string, value: any) => {
    const updated = {
      ...localRules,
      categories: {
        ...localRules.categories,
        [category]: {
          ...localRules.categories[category],
          [field]: value
        }
      }
    }
    setLocalRules(updated)
    onChange(updated)
  }

  const updateRiskLevel = (level: string, field: string, value: any) => {
    const updated = {
      ...localRules,
      riskLevels: {
        ...localRules.riskLevels,
        [level]: {
          ...localRules.riskLevels[level],
          [field]: value
        }
      }
    }
    setLocalRules(updated)
    onChange(updated)
  }

  const addExcludedMake = () => {
    if (newExcludedMake && !localRules.excludedMakes.includes(newExcludedMake)) {
      const updated = {
        ...localRules,
        excludedMakes: [...localRules.excludedMakes, newExcludedMake]
      }
      setLocalRules(updated)
      onChange(updated)
      setNewExcludedMake('')
    }
  }

  const removeExcludedMake = (make: string) => {
    const updated = {
      ...localRules,
      excludedMakes: localRules.excludedMakes.filter(m => m !== make)
    }
    setLocalRules(updated)
    onChange(updated)
  }

  const addExcludedModel = () => {
    if (newExcludedModel && !localRules.excludedModels.includes(newExcludedModel)) {
      const updated = {
        ...localRules,
        excludedModels: [...localRules.excludedModels, newExcludedModel]
      }
      setLocalRules(updated)
      onChange(updated)
      setNewExcludedModel('')
    }
  }

  const removeExcludedModel = (model: string) => {
    const updated = {
      ...localRules,
      excludedModels: localRules.excludedModels.filter(m => m !== model)
    }
    setLocalRules(updated)
    onChange(updated)
  }

  const updateValueRange = (field: 'min' | 'max', value: number) => {
    const updated = {
      ...localRules,
      valueRange: {
        ...localRules.valueRange,
        [field]: value
      }
    }
    setLocalRules(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-6">
      {/* Category Rules */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <IoCarSportOutline className="w-5 h-5" />
          Vehicle Category Rules
        </h3>
        <div className="space-y-3">
          {VEHICLE_CATEGORIES.map(category => (
            <div key={category.value} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={localRules.categories[category.value]?.eligible ?? true}
                      onChange={(e) => updateCategory(category.value, 'eligible', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{category.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 ml-8">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">Rate Multiplier</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="5"
                        value={localRules.categories[category.value]?.multiplier ?? 1}
                        onChange={(e) => updateCategory(category.value, 'multiplier', parseFloat(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                        disabled={!localRules.categories[category.value]?.eligible}
                      />
                      <span className="text-xs text-gray-500">x</span>
                    </div>
                  </div>
                  
                  {localRules.categories[category.value]?.eligible && (
                    <>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Min Value</label>
                        <input
                          type="number"
                          placeholder="None"
                          value={localRules.categories[category.value]?.minValue ?? ''}
                          onChange={(e) => updateCategory(category.value, 'minValue', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Max Value</label>
                        <input
                          type="number"
                          placeholder="None"
                          value={localRules.categories[category.value]?.maxValue ?? ''}
                          onChange={(e) => updateCategory(category.value, 'maxValue', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Level Rules */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <IoWarningOutline className="w-5 h-5" />
          Risk Level Adjustments
        </h3>
        <div className="space-y-3">
          {RISK_LEVELS.map(level => (
            <div key={level.value} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={localRules.riskLevels[level.value]?.eligible ?? true}
                    onChange={(e) => updateRiskLevel(level.value, 'eligible', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className={`font-medium ${level.color}`}>{level.label}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">Rate Multiplier</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="5"
                        value={localRules.riskLevels[level.value]?.multiplier ?? 1}
                        onChange={(e) => updateRiskLevel(level.value, 'multiplier', parseFloat(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                        disabled={!localRules.riskLevels[level.value]?.eligible}
                      />
                      <span className="text-xs text-gray-500">x</span>
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={localRules.riskLevels[level.value]?.requiresReview ?? false}
                      onChange={(e) => updateRiskLevel(level.value, 'requiresReview', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                      disabled={!localRules.riskLevels[level.value]?.eligible}
                    />
                    Manual Review
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Value Range */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle Value Range</h3>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum Value
            </label>
            <div className="flex items-center">
              <span className="mr-1">$</span>
              <input
                type="number"
                value={localRules.valueRange.min}
                onChange={(e) => updateValueRange('min', parseInt(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Value
            </label>
            <div className="flex items-center">
              <span className="mr-1">$</span>
              <input
                type="number"
                value={localRules.valueRange.max}
                onChange={(e) => updateValueRange('max', parseInt(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vehicle Age Limit
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={localRules.vehicleAgeLimit}
                onChange={(e) => {
                  const updated = { ...localRules, vehicleAgeLimit: parseInt(e.target.value) }
                  setLocalRules(updated)
                  onChange(updated)
                }}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
              <span className="ml-2 text-sm text-gray-500">years</span>
            </div>
          </div>
        </div>
      </div>

      {/* Excluded Makes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Excluded Makes</h3>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={newExcludedMake}
            onChange={(e) => setNewExcludedMake(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addExcludedMake()}
            placeholder="Enter make to exclude"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
          <button
            type="button"
            onClick={addExcludedMake}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <IoAddOutline className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {localRules.excludedMakes.map(make => (
            <div key={make} className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
              <span>{make}</span>
              <button
                type="button"
                onClick={() => removeExcludedMake(make)}
                className="p-0.5 hover:bg-red-200 dark:hover:bg-red-800/50 rounded-full"
              >
                <IoTrashOutline className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Excluded Models */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Excluded Models</h3>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={newExcludedModel}
            onChange={(e) => setNewExcludedModel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addExcludedModel()}
            placeholder="Enter model to exclude"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
          <button
            type="button"
            onClick={addExcludedModel}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <IoAddOutline className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {localRules.excludedModels.map(model => (
            <div key={model} className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
              <span>{model}</span>
              <button
                type="button"
                onClick={() => removeExcludedModel(model)}
                className="p-0.5 hover:bg-red-200 dark:hover:bg-red-800/50 rounded-full"
              >
                <IoTrashOutline className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">How Vehicle Rules Work:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Categories determine base eligibility and pricing</li>
              <li>Risk multipliers adjust rates based on vehicle characteristics</li>
              <li>Excluded makes/models override all other rules</li>
              <li>Manual review flags require admin approval before coverage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
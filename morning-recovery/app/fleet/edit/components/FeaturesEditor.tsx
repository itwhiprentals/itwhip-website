// app/sys-2847/fleet/edit/components/FeaturesEditor.tsx
'use client'

import { useState, useEffect } from 'react'

interface FeaturesEditorProps {
  selectedFeatures: string[] | string | null | undefined
  onFeaturesChange: (features: string[]) => void
}

const FEATURE_CATEGORIES = {
  comfort: [
    'Bluetooth',
    'Backup Camera',
    'Apple CarPlay',
    'Android Auto',
    'USB Charger',
    'Aux Input',
    'Heated Seats',
    'Leather Seats',
    'Sunroof/Moonroof',
    'Keyless Entry',
    'Push Button Start',
    'Remote Start'
  ],
  safety: [
    'Blind Spot Monitor',
    'Lane Departure Warning',
    'Forward Collision Warning',
    'Automatic Emergency Braking',
    'Adaptive Cruise Control',
    'Parking Sensors',
    'All-Wheel Drive',
    'Traction Control',
    'Stability Control',
    'Airbags (Front & Side)',
    'Child Safety Locks',
    'Roadside Assistance'
  ],
  convenience: [
    'GPS Navigation',
    'Third Row Seating',
    'Bike Rack',
    'Roof Rack',
    'Tow Hitch',
    'Snow Chains/Tires',
    'Pet Friendly',
    'Wheelchair Accessible',
    'Convertible',
    'Spare Tire',
    'First Aid Kit',
    'Phone Mount'
  ],
  technology: [
    'WiFi Hotspot',
    'Wireless Charging',
    'Premium Sound System',
    'Satellite Radio',
    'DVD Player',
    'Dashboard Camera',
    'Heads-Up Display',
    'Night Vision',
    'Parking Camera',
    '360° Camera',
    'Automatic Parking',
    'Self-Driving Features'
  ]
}

const CATEGORY_LABELS = {
  comfort: 'Comfort & Interior',
  safety: 'Safety Features',
  convenience: 'Convenience',
  technology: 'Technology'
}

export function FeaturesEditor({ 
  selectedFeatures: rawSelectedFeatures, 
  onFeaturesChange 
}: FeaturesEditorProps) {
  // Parse the features to ensure we always have an array
  const parseFeatures = (features: string[] | string | null | undefined): string[] => {
    if (!features) return []
    
    if (Array.isArray(features)) {
      return features
    }
    
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        // If it's not JSON, maybe it's comma-separated
        return features.split(',').map(f => f.trim()).filter(f => f)
      }
    }
    
    return []
  }

  const selectedFeatures = parseFeatures(rawSelectedFeatures)
  
  const [customFeature, setCustomFeature] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['comfort'])

  // Get all predefined features as a flat array
  const allPredefinedFeatures = Object.values(FEATURE_CATEGORIES).flat()

  // Get selected custom features (not in predefined list)
  const customFeatures = selectedFeatures.filter(feature => 
    !allPredefinedFeatures.includes(feature)
  )

  const toggleFeature = (feature: string) => {
    const newFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter(f => f !== feature)
      : [...selectedFeatures, feature]
    
    onFeaturesChange(newFeatures)
  }

  const addCustomFeature = () => {
    if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
      onFeaturesChange([...selectedFeatures, customFeature.trim()])
      setCustomFeature('')
    }
  }

  const removeCustomFeature = (feature: string) => {
    onFeaturesChange(selectedFeatures.filter(f => f !== feature))
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const getSelectedCount = (category: keyof typeof FEATURE_CATEGORIES) => {
    return FEATURE_CATEGORIES[category].filter(feature => 
      selectedFeatures.includes(feature)
    ).length
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Vehicle Features
      </h3>

      <div className="space-y-2">
        {/* Feature Categories */}
        {Object.entries(FEATURE_CATEGORIES).map(([category, features]) => {
          const isExpanded = expandedCategories.includes(category)
          const selectedCount = getSelectedCount(category as keyof typeof FEATURE_CATEGORIES)
          
          return (
            <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                  </span>
                </div>
                {selectedCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                    {selectedCount} selected
                  </span>
                )}
              </button>
              
              {isExpanded && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {features.map(feature => (
                    <label 
                      key={feature}
                      className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 p-2 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Custom Features */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Custom Features
          </h4>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={customFeature}
              onChange={(e) => setCustomFeature(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomFeature()
                }
              }}
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
              placeholder="Add a custom feature..."
            />
            <button
              type="button"
              onClick={addCustomFeature}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          
          {customFeatures.length > 0 && (
            <div className="space-y-2">
              {customFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCustomFeature(feature)}
                    className="text-red-600 hover:text-red-700 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Selected Features ({selectedFeatures.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedFeatures.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No features selected yet
              </p>
            ) : (
              selectedFeatures.map((feature, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600"
                >
                  {feature}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
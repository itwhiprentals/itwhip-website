// app/sys-2847/fleet/edit/components/RentalGuidelines.tsx
'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

interface RentalGuidelinesProps {
  selectedRules: string | string[] | null
  onChange: (field: string, value: any) => void
}

const PRESET_RULES = [
  { 
    id: 'no-smoking', 
    label: 'No smoking',
    category: 'restrictions'
  },
  { 
    id: 'age-25', 
    label: 'Must be 25+ to book',
    category: 'requirements'
  },
  { 
    id: 'age-21', 
    label: 'Must be 21+ to book',
    category: 'requirements'
  },
  { 
    id: 'license-insurance', 
    label: 'Valid driver\'s license and insurance required',
    category: 'requirements'
  },
  { 
    id: 'fuel-return', 
    label: 'Return with same fuel level',
    category: 'return'
  },
  { 
    id: 'no-pets', 
    label: 'No pets allowed',
    category: 'restrictions'
  },
  { 
    id: 'pets-allowed', 
    label: 'Pets welcome with approval',
    category: 'restrictions'
  },
  { 
    id: 'cleaning-fee', 
    label: '$250 cleaning fee for excessive mess',
    category: 'fees'
  },
  { 
    id: 'late-fee', 
    label: '$50/hour late return fee',
    category: 'fees'
  },
  { 
    id: 'no-offroad', 
    label: 'No off-road driving',
    category: 'restrictions'
  },
  { 
    id: 'toll-pass', 
    label: 'Toll pass included',
    category: 'included'
  },
  { 
    id: 'child-seats', 
    label: 'Child seats available upon request',
    category: 'included'
  },
  { 
    id: 'international-license', 
    label: 'International driver\'s license accepted',
    category: 'requirements'
  },
  { 
    id: 'credit-card', 
    label: 'Credit card required (no debit cards)',
    category: 'requirements'
  },
  { 
    id: 'deposit', 
    label: '$500 security deposit (refundable)',
    category: 'fees'
  },
  { 
    id: 'no-racing', 
    label: 'No racing or track use',
    category: 'restrictions'
  },
  { 
    id: 'gps-tracking', 
    label: 'Vehicle equipped with GPS tracking',
    category: 'disclosure'
  },
  { 
    id: 'dash-cam', 
    label: 'Dash cam recording for safety',
    category: 'disclosure'
  }
]

const RULE_CATEGORIES = {
  requirements: 'Requirements',
  restrictions: 'Restrictions',
  fees: 'Fees & Charges',
  return: 'Return Policy',
  included: 'Included Features',
  disclosure: 'Disclosures'
}

// Helper function to parse rules - moved outside component to be stable
const parseRulesString = (selectedRules: string | string[] | null): {
  ruleIds: string[],
  customRules: string[],
  mileageLimit: number,
  mileageFee: number
} => {
  if (!selectedRules) {
    return {
      ruleIds: [],
      customRules: [],
      mileageLimit: 200,
      mileageFee: 3
    }
  }

  let rulesArray: string[] = []
  
  if (typeof selectedRules === 'string') {
    try {
      const parsed = JSON.parse(selectedRules)
      if (Array.isArray(parsed)) {
        rulesArray = parsed
      } else if (typeof parsed === 'string') {
        try {
          const doubleParsed = JSON.parse(parsed)
          if (Array.isArray(doubleParsed)) {
            rulesArray = doubleParsed
          } else {
            rulesArray = [parsed]
          }
        } catch {
          rulesArray = [parsed]
        }
      }
    } catch {
      if (selectedRules.includes('. ')) {
        rulesArray = selectedRules.split('. ').map(r => r.trim()).filter(r => r)
      } else if (selectedRules.includes(';')) {
        rulesArray = selectedRules.split(';').map(r => r.trim()).filter(r => r)
      } else if (selectedRules.trim()) {
        rulesArray = [selectedRules.trim()]
      }
    }
  } else if (Array.isArray(selectedRules)) {
    rulesArray = selectedRules
  }

  const foundRuleIds: string[] = []
  const foundCustomRules: string[] = []
  let foundMileageLimit = 200
  let foundMileageFee = 3
  
  rulesArray.forEach(rule => {
    if (typeof rule !== 'string' || !rule.trim()) return
    
    const ruleStr = rule.trim()
    
    const mileageMatch = ruleStr.match(/(\d+)\s*miles?\/day\s+included,?\s*\$?([\d.]+)\/mile\s+after/i)
    if (mileageMatch) {
      foundMileageLimit = parseInt(mileageMatch[1])
      foundMileageFee = parseFloat(mileageMatch[2])
      return
    }
    
    const preset = PRESET_RULES.find(p => p.label === ruleStr)
    if (preset) {
      foundRuleIds.push(preset.id)
    } else {
      foundCustomRules.push(ruleStr)
    }
  })

  return {
    ruleIds: foundRuleIds,
    customRules: foundCustomRules,
    mileageLimit: foundMileageLimit,
    mileageFee: foundMileageFee
  }
}

export function RentalGuidelines({
  selectedRules,
  onChange
}: RentalGuidelinesProps) {
  // Parse initial values from props
  const initialValues = useMemo(() => parseRulesString(selectedRules), [selectedRules])
  
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>(initialValues.ruleIds)
  const [customRules, setCustomRules] = useState<string[]>(initialValues.customRules)
  const [mileageLimit, setMileageLimit] = useState(initialValues.mileageLimit)
  const [mileageFee, setMileageFee] = useState(initialValues.mileageFee)
  const [newCustomRule, setNewCustomRule] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['requirements', 'restrictions'])
  
  // Track if we've initialized from props
  const hasInitialized = useRef(false)
  const lastUpdateRef = useRef<string>('')

  // Initialize state from props only once
  useEffect(() => {
    if (!hasInitialized.current && selectedRules) {
      const parsed = parseRulesString(selectedRules)
      setSelectedRuleIds(parsed.ruleIds)
      setCustomRules(parsed.customRules)
      setMileageLimit(parsed.mileageLimit)
      setMileageFee(parsed.mileageFee)
      hasInitialized.current = true
    }
  }, [selectedRules])

  // Debounced update to parent
  useEffect(() => {
    // Don't update on initial mount
    if (!hasInitialized.current) return

    const timer = setTimeout(() => {
      const allRules: string[] = []
      
      // Always add mileage rule first
      allRules.push(`${mileageLimit} miles/day included, $${mileageFee}/mile after`)
      
      // Add selected preset rules (as labels, not IDs)
      selectedRuleIds.forEach(ruleId => {
        const rule = PRESET_RULES.find(r => r.id === ruleId)
        if (rule) {
          allRules.push(rule.label)
        }
      })
      
      // Add custom rules
      allRules.push(...customRules)
      
      // Convert to JSON string
      const rulesJson = JSON.stringify(allRules)
      
      // Only update if changed
      if (rulesJson !== lastUpdateRef.current) {
        lastUpdateRef.current = rulesJson
        onChange('rules', rulesJson)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [selectedRuleIds, customRules, mileageLimit, mileageFee, onChange])

  // Toggle rule selection
  const toggleRule = useCallback((ruleId: string) => {
    setSelectedRuleIds(prev => {
      if (prev.includes(ruleId)) {
        return prev.filter(id => id !== ruleId)
      } else {
        return [...prev, ruleId]
      }
    })
  }, [])

  const addCustomRule = useCallback(() => {
    if (newCustomRule.trim()) {
      setCustomRules(prev => [...prev, newCustomRule.trim()])
      setNewCustomRule('')
    }
  }, [newCustomRule])

  const removeCustomRule = useCallback((index: number) => {
    setCustomRules(prev => prev.filter((_, i) => i !== index))
  }, [])

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category)
      } else {
        return [...prev, category]
      }
    })
  }, [])

  // Group rules by category
  const rulesByCategory = useMemo(() => {
    return Object.entries(RULE_CATEGORIES).reduce((acc, [key, label]) => {
      acc[key] = {
        label,
        rules: PRESET_RULES.filter(rule => rule.category === key)
      }
      return acc
    }, {} as Record<string, { label: string; rules: typeof PRESET_RULES }>)
  }, [])

  // Count selected rules per category
  const getSelectedCount = (category: string) => {
    return rulesByCategory[category].rules.filter(rule => selectedRuleIds.includes(rule.id)).length
  }

  // Get all currently selected rules for preview
  const getAllSelectedRules = () => {
    const all: string[] = []
    all.push(`${mileageLimit} miles/day included, $${mileageFee}/mile after`)
    
    selectedRuleIds.forEach(ruleId => {
      const rule = PRESET_RULES.find(r => r.id === ruleId)
      if (rule) {
        all.push(rule.label)
      }
    })
    
    all.push(...customRules)
    return all
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Rental Guidelines & Rules
      </h3>

      <div className="space-y-4">
        {/* Mileage Policy */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Mileage Policy
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Daily Mileage Limit
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={mileageLimit}
                  onChange={(e) => setMileageLimit(parseInt(e.target.value) || 0)}
                  className="w-24 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  min="50"
                  max="500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">miles/day</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Overage Fee
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">$</span>
                <input
                  type="number"
                  value={mileageFee}
                  onChange={(e) => setMileageFee(parseFloat(e.target.value) || 0)}
                  className="w-20 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  min="0"
                  max="10"
                  step="0.5"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">per mile</span>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            This will display as: "{mileageLimit} miles/day included, ${mileageFee}/mile after"
          </p>
        </div>

        {/* Preset Rules by Category */}
        <div className="space-y-2">
          {Object.entries(rulesByCategory).map(([category, { label, rules }]) => {
            const selectedCount = getSelectedCount(category)
            const isExpanded = expandedCategories.includes(category)
            
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
                      {label}
                    </span>
                  </div>
                  {selectedCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                      {selectedCount} selected
                    </span>
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-4 space-y-2">
                    {rules.map(rule => (
                      <label 
                        key={rule.id} 
                        className="flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-900 p-2 rounded transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRuleIds.includes(rule.id)}
                          onChange={() => toggleRule(rule.id)}
                          className="mt-0.5 w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 select-none">
                          {rule.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Custom Rules */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Custom Rules
          </h4>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newCustomRule}
              onChange={(e) => setNewCustomRule(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomRule()
                }
              }}
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
              placeholder="Add a custom rule..."
            />
            <button
              type="button"
              onClick={addCustomRule}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          
          {customRules.length > 0 && (
            <div className="space-y-2">
              {customRules.map((rule, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {rule}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCustomRule(index)}
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
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Preview: What Guests Will See ({getAllSelectedRules().length} rules)
          </h4>
          <div className="space-y-1">
            {getAllSelectedRules().length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No rules selected yet. Add rules above to see them here.
              </p>
            ) : (
              getAllSelectedRules().map((rule, index) => (
                <div key={index} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {rule}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
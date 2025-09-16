// app/sys-2847/fleet/edit/components/InsuranceSettings.tsx
'use client'

import { useState } from 'react'

interface InsuranceSettingsProps {
  insuranceIncluded?: boolean
  insuranceDaily?: number
  insuranceRequired?: boolean
  minimumCoverage?: number
  comprehensiveDaily?: number
  collisionDaily?: number
  liabilityDaily?: number
  personalInjuryDaily?: number
  deductible?: number
  requiresProofOfInsurance?: boolean
  acceptsThirdPartyInsurance?: boolean
  onChange: (field: string, value: any) => void
}

const COVERAGE_LEVELS = [
  { value: 100000, label: '$100,000' },
  { value: 250000, label: '$250,000' },
  { value: 500000, label: '$500,000' },
  { value: 1000000, label: '$1,000,000' }
]

const DEDUCTIBLE_OPTIONS = [
  { value: 250, label: '$250' },
  { value: 500, label: '$500' },
  { value: 1000, label: '$1,000' },
  { value: 2500, label: '$2,500' }
]

export function InsuranceSettings({
  insuranceIncluded = false,
  insuranceDaily = 35,
  insuranceRequired = true,
  minimumCoverage = 250000,
  comprehensiveDaily = 15,
  collisionDaily = 20,
  liabilityDaily = 10,
  personalInjuryDaily = 5,
  deductible = 500,
  requiresProofOfInsurance = true,
  acceptsThirdPartyInsurance = true,
  onChange
}: InsuranceSettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Calculate total insurance cost from components
  const calculateTotalInsurance = () => {
    if (showBreakdown) {
      return comprehensiveDaily + collisionDaily + liabilityDaily + personalInjuryDaily
    }
    return insuranceDaily
  }

  const totalInsurance = calculateTotalInsurance()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Insurance Settings
      </h3>

      <div className="space-y-4">
        {/* Basic Insurance Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={insuranceIncluded}
              onChange={(e) => onChange('insuranceIncluded', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-gray-900 dark:text-white font-medium">
                Basic Insurance Included
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Free basic coverage included with rental
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={insuranceRequired}
              onChange={(e) => onChange('insuranceRequired', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-gray-900 dark:text-white font-medium">
                Insurance Required
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Guest must have insurance to book
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptsThirdPartyInsurance}
              onChange={(e) => onChange('acceptsThirdPartyInsurance', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-gray-900 dark:text-white font-medium">
                Accept Third-Party Insurance
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Allow guests to use their own insurance
              </p>
            </div>
          </label>

          {acceptsThirdPartyInsurance && (
            <label className="flex items-center gap-3 cursor-pointer ml-7">
              <input
                type="checkbox"
                checked={requiresProofOfInsurance}
                onChange={(e) => onChange('requiresProofOfInsurance', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-gray-900 dark:text-white font-medium">
                  Require Proof of Insurance
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Guest must upload insurance documents
                </p>
              </div>
            </label>
          )}
        </div>

        {/* Insurance Pricing */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Optional Insurance Pricing
            </h4>
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700"
            >
              {showBreakdown ? 'Simple Pricing' : 'Breakdown Pricing'}
            </button>
          </div>

          {!showBreakdown ? (
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Daily Insurance Rate ($)
              </label>
              <input
                type="number"
                value={insuranceDaily}
                onChange={(e) => onChange('insuranceDaily', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Comprehensive ($/day)
                </label>
                <input
                  type="number"
                  value={comprehensiveDaily}
                  onChange={(e) => onChange('comprehensiveDaily', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Collision ($/day)
                </label>
                <input
                  type="number"
                  value={collisionDaily}
                  onChange={(e) => onChange('collisionDaily', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Liability ($/day)
                </label>
                <input
                  type="number"
                  value={liabilityDaily}
                  onChange={(e) => onChange('liabilityDaily', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Personal Injury ($/day)
                </label>
                <input
                  type="number"
                  value={personalInjuryDaily}
                  onChange={(e) => onChange('personalInjuryDaily', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
          )}

          {showBreakdown && (
            <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Daily Insurance
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${totalInsurance}/day
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Coverage Requirements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Minimum Coverage Required
            </label>
            <select
              value={minimumCoverage}
              onChange={(e) => onChange('minimumCoverage', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
            >
              {COVERAGE_LEVELS.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Deductible Amount
            </label>
            <select
              value={deductible}
              onChange={(e) => onChange('deductible', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
            >
              {DEDUCTIBLE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Settings */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Insurance Policy Details
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  What's Covered:
                </h5>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Collision damage to the rental vehicle</li>
                  <li>Theft of the rental vehicle</li>
                  <li>Third-party liability up to coverage limit</li>
                  <li>Medical payments for injuries</li>
                  <li>Uninsured motorist protection</li>
                </ul>

                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2 mt-4">
                  What's Not Covered:
                </h5>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Personal belongings left in vehicle</li>
                  <li>Damage from prohibited activities</li>
                  <li>Interior damage from smoking/spills</li>
                  <li>Mechanical breakdown from misuse</li>
                  <li>Traffic violations and parking tickets</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Additional Policy Notes
                </label>
                <textarea
                  placeholder="Any special insurance requirements or notes..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white text-sm"
                  onChange={(e) => onChange('insuranceNotes', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Insurance Summary */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Insurance Summary
          </h4>
          <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
            <div className="flex justify-between">
              <span>Basic Insurance:</span>
              <span>{insuranceIncluded ? 'Included Free' : 'Not Included'}</span>
            </div>
            <div className="flex justify-between">
              <span>Optional Coverage:</span>
              <span>${totalInsurance}/day</span>
            </div>
            <div className="flex justify-between">
              <span>Insurance Required:</span>
              <span>{insuranceRequired ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Third-Party Accepted:</span>
              <span>{acceptsThirdPartyInsurance ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Deductible:</span>
              <span>${deductible}</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            <strong>Important:</strong> Ensure your insurance offerings comply with local regulations. 
            Consider consulting with an insurance professional to determine appropriate coverage levels and pricing.
          </p>
        </div>
      </div>
    </div>
  )
}
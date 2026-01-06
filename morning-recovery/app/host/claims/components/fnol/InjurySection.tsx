// app/host/claims/components/fnol/InjurySection.tsx
'use client'

import { useState } from 'react'
import { 
  IoMedkitOutline, 
  IoChevronDownOutline, 
  IoChevronUpOutline,
  IoAddOutline,
  IoTrashOutline
} from 'react-icons/io5'
import type { InjurySectionProps, Injury } from './types'
import { INJURY_SEVERITY_OPTIONS } from './types'

export default function InjurySection({
  wereInjuries,
  setWereInjuries,
  injuries,
  setInjuries,
  disabled = false
}: InjurySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const addInjury = () => {
    setInjuries([
      ...injuries, 
      { 
        person: '', 
        description: '', 
        severity: 'Minor', 
        medicalAttention: false, 
        hospital: '' 
      }
    ])
    setIsExpanded(true)
  }

  const removeInjury = (index: number) => {
    setInjuries(injuries.filter((_, i) => i !== index))
  }

  const updateInjury = (index: number, field: keyof Injury, value: string | boolean) => {
    const updated = [...injuries]
    updated[index] = { ...updated[index], [field]: value }
    setInjuries(updated)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Minor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
      case 'Moderate':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
      case 'Severe':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
      case 'Critical':
        return 'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 rounded-lg shadow-sm border-2 border-red-200 dark:border-red-800">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className="w-full flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <IoMedkitOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Injuries
          </h3>
          {injuries.length > 0 && (
            <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-1 rounded-full font-medium">
              {injuries.length}
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
        </div>
        {isExpanded ? (
          <IoChevronUpOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <IoChevronDownOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 pt-2">
          {/* Were There Injuries */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wereInjuries}
                onChange={(e) => setWereInjuries(e.target.checked)}
                disabled={disabled}
                className="mt-1 w-4 h-4 text-red-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900 dark:text-white">
                  There were injuries
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Check this if anyone was injured in the incident
                </p>
              </div>
            </label>
          </div>

          {wereInjuries && (
            <div className="space-y-4 pl-7 border-l-2 border-red-300 dark:border-red-700">
              {injuries.length === 0 ? (
                <div className="text-center py-6">
                  <IoMedkitOutline className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    No injuries recorded yet. Click "Add Injury" to document injuries.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {injuries.map((injury, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Injury {index + 1}
                          </h4>
                          {injury.severity && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityColor(injury.severity)}`}>
                              {injury.severity}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInjury(index)}
                          disabled={disabled}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove injury"
                        >
                          <IoTrashOutline className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Person Injured */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Person Injured *
                          </label>
                          <input
                            type="text"
                            value={injury.person}
                            onChange={(e) => updateInjury(index, 'person', e.target.value)}
                            placeholder="e.g., Driver, Passenger, Pedestrian"
                            disabled={disabled}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Specify the role: driver, passenger, pedestrian, cyclist, etc.
                          </p>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description *
                          </label>
                          <textarea
                            value={injury.description}
                            onChange={(e) => updateInjury(index, 'description', e.target.value)}
                            rows={2}
                            placeholder="Describe the injury (e.g., laceration on forehead, broken arm, whiplash)..."
                            disabled={disabled}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>

                        {/* Severity */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Severity *
                          </label>
                          <select
                            value={injury.severity}
                            onChange={(e) => updateInjury(index, 'severity', e.target.value)}
                            disabled={disabled}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {INJURY_SEVERITY_OPTIONS.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Minor:</strong> Cuts, bruises, minor pain
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Moderate:</strong> Sprains, fractures, significant pain
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Severe:</strong> Major fractures, head trauma, internal injuries
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Critical:</strong> Life-threatening, requires immediate emergency care
                            </p>
                          </div>
                        </div>

                        {/* Medical Attention */}
                        <div>
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={injury.medicalAttention}
                              onChange={(e) => updateInjury(index, 'medicalAttention', e.target.checked)}
                              disabled={disabled}
                              className="mt-0.5 w-4 h-4 text-red-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="flex-1">
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                Medical attention received
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Was treated by paramedics, hospital, or medical professional
                              </p>
                            </div>
                          </label>
                        </div>

                        {/* Hospital (if medical attention) */}
                        {injury.medicalAttention && (
                          <div className="pl-6 border-l-2 border-red-200 dark:border-red-800">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Hospital or Medical Facility
                            </label>
                            <input
                              type="text"
                              value={injury.hospital}
                              onChange={(e) => updateInjury(index, 'hospital', e.target.value)}
                              placeholder="e.g., Phoenix General Hospital, ABC Medical Center"
                              disabled={disabled}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Injury Button */}
              <button
                type="button"
                onClick={addInjury}
                disabled={disabled}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <IoAddOutline className="w-5 h-5" />
                Add Injury
              </button>

              {/* Critical Warning */}
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                <p className="text-xs text-red-800 dark:text-red-200">
                  <strong>IMPORTANT:</strong> Document all injuries, even minor ones. Insurance companies require detailed injury information for claims processing. If any injuries are critical or life-threatening, ensure emergency services were contacted immediately.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
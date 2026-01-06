// app/host/claims/components/fnol/WitnessSection.tsx
'use client'

import { useState } from 'react'
import { 
  IoPeopleOutline, 
  IoChevronDownOutline, 
  IoChevronUpOutline,
  IoAddOutline,
  IoTrashOutline
} from 'react-icons/io5'
import type { WitnessSectionProps, Witness } from './types'

export default function WitnessSection({
  witnesses,
  setWitnesses,
  disabled = false
}: WitnessSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const addWitness = () => {
    setWitnesses([...witnesses, { name: '', phone: '', email: '', statement: '' }])
    setIsExpanded(true)
  }

  const removeWitness = (index: number) => {
    setWitnesses(witnesses.filter((_, i) => i !== index))
  }

  const updateWitness = (index: number, field: keyof Witness, value: string) => {
    const updated = [...witnesses]
    updated[index][field] = value
    setWitnesses(updated)
  }

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-lg shadow-sm border-2 border-emerald-200 dark:border-emerald-800">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className="w-full flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <IoPeopleOutline className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Witnesses
          </h3>
          {witnesses.length > 0 && (
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full font-medium">
              {witnesses.length}
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
          {witnesses.length === 0 ? (
            <div className="text-center py-6">
              <IoPeopleOutline className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                No witnesses added yet. Click "Add Witness" to include witness information.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {witnesses.map((witness, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-800"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Witness {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeWitness(index)}
                      disabled={disabled}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove witness"
                    >
                      <IoTrashOutline className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={witness.name}
                        onChange={(e) => updateWitness(index, 'name', e.target.value)}
                        placeholder="John Doe"
                        disabled={disabled}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={witness.phone}
                          onChange={(e) => updateWitness(index, 'phone', e.target.value)}
                          placeholder="(555) 123-4567"
                          disabled={disabled}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email <span className="text-gray-500">(Optional)</span>
                        </label>
                        <input
                          type="email"
                          value={witness.email}
                          onChange={(e) => updateWitness(index, 'email', e.target.value)}
                          placeholder="john@example.com"
                          disabled={disabled}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Statement */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Statement <span className="text-gray-500">(Optional)</span>
                      </label>
                      <textarea
                        value={witness.statement}
                        onChange={(e) => updateWitness(index, 'statement', e.target.value)}
                        rows={2}
                        placeholder="What did this witness see?"
                        disabled={disabled}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Brief summary of what they witnessed
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Witness Button */}
          <button
            type="button"
            onClick={addWitness}
            disabled={disabled}
            className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <IoAddOutline className="w-5 h-5" />
            Add Witness
          </button>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
            <p className="text-xs text-emerald-800 dark:text-emerald-200">
              <strong>Why witness information matters:</strong> Independent witnesses can provide crucial testimony about the incident, helping establish facts and liability. Include anyone who saw the accident occur.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
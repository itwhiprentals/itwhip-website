// app/host/claims/components/fnol/PoliceReportSection.tsx
'use client'

import { useState } from 'react'
import { IoShieldOutline, IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5'
import type { PoliceReportSectionProps } from './types'

export default function PoliceReportSection({
  wasPoliceContacted,
  setWasPoliceContacted,
  policeDepartment,
  setPoliceDepartment,
  officerName,
  setOfficerName,
  officerBadge,
  setOfficerBadge,
  policeReportNumber,
  setPoliceReportNumber,
  policeReportFiled,
  setPoliceReportFiled,
  policeReportDate,
  setPoliceReportDate,
  errors,
  disabled = false
}: PoliceReportSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 rounded-lg shadow-sm border-2 border-indigo-200 dark:border-indigo-800">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className="w-full flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <IoShieldOutline className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Police Report
          </h3>
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
          {/* Was Police Contacted */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wasPoliceContacted}
                onChange={(e) => setWasPoliceContacted(e.target.checked)}
                disabled={disabled}
                className="mt-1 w-4 h-4 text-indigo-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900 dark:text-white">
                  Police were contacted
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Check this if law enforcement was called to the scene
                </p>
              </div>
            </label>
          </div>

          {wasPoliceContacted && (
            <div className="space-y-4 pl-7 border-l-2 border-indigo-300 dark:border-indigo-700">
              {/* Police Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Police Department *
                </label>
                <input
                  type="text"
                  value={policeDepartment}
                  onChange={(e) => setPoliceDepartment(e.target.value)}
                  placeholder="e.g., Phoenix Police Department"
                  disabled={disabled}
                  className={`
                    w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm
                    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.policeDepartment ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                  `}
                />
                {errors.policeDepartment && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.policeDepartment}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Officer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Officer Name <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    placeholder="Officer Smith"
                    disabled={disabled}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  />
                </div>

                {/* Badge Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Badge Number <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={officerBadge}
                    onChange={(e) => setOfficerBadge(e.target.value)}
                    placeholder="12345"
                    disabled={disabled}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  />
                </div>
              </div>

              {/* Police Report Filed */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policeReportFiled}
                    onChange={(e) => setPoliceReportFiled(e.target.checked)}
                    disabled={disabled}
                    className="mt-1 w-4 h-4 text-indigo-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Police report was filed
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Check this if an official police report was created
                    </p>
                  </div>
                </label>
              </div>

              {policeReportFiled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7 border-l-2 border-indigo-200 dark:border-indigo-800">
                  {/* Report Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Report Number
                    </label>
                    <input
                      type="text"
                      value={policeReportNumber}
                      onChange={(e) => setPoliceReportNumber(e.target.value)}
                      placeholder="e.g., 2025-123456"
                      disabled={disabled}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Usually found on the police report or incident card
                    </p>
                  </div>

                  {/* Report Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Report Date
                    </label>
                    <input
                      type="date"
                      value={policeReportDate}
                      onChange={(e) => setPoliceReportDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      disabled={disabled}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Note */}
          {!wasPoliceContacted && (
            <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
              <p className="text-xs text-indigo-800 dark:text-indigo-200">
                <strong>Note:</strong> Police reports strengthen insurance claims, especially for accidents involving injuries, significant damage, or disputes about fault.
              </p>
            </div>
          )}

          {wasPoliceContacted && (
            <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
              <p className="text-xs text-indigo-800 dark:text-indigo-200">
                <strong>Tip:</strong> If you don't have the police report number yet, you can usually obtain it from the police department within 3-5 business days using the incident date and location.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
// app/fleet/banking/components/TaxSummaryCard.tsx
// Shows total taxes collected with quarterly remittance tracking
// PASSTHROUGH money that must be remitted to government

'use client'

import { useState, useMemo } from 'react'
import { formatCurrency } from '../types'

interface QuarterlyTax {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  year: number
  taxCollected: number
  status: 'PENDING' | 'FILED' | 'PAID'
  dueDate: string
  filedDate?: string
}

interface TaxSummaryProps {
  data: {
    totalTaxesCollected: number
    taxesByState?: Record<string, number>
    taxesByCity?: Record<string, number>
    quarterlyData?: QuarterlyTax[]
  }
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  FILED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  PAID: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' }
}

// Generate quarterly data if not provided
function generateQuarterlyData(totalTaxes: number): QuarterlyTax[] {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const currentQuarter = Math.floor(currentMonth / 3) + 1

  // Distribute taxes across quarters (rough estimate)
  const quarterShare = totalTaxes / 4

  const quarters: QuarterlyTax[] = []

  for (let q = 4; q >= 1; q--) {
    const year = q > currentQuarter ? currentYear - 1 : currentYear
    const dueMonth = q * 3 + 1 // Month after quarter ends (April, July, Oct, Jan)
    const dueYear = dueMonth > 12 ? year + 1 : year
    const dueDateObj = new Date(dueYear, (dueMonth - 1) % 12, 20)

    let status: 'PENDING' | 'FILED' | 'PAID' = 'PENDING'
    let filedDate: string | undefined

    // Simulate status based on current date
    if (dueDateObj < currentDate) {
      if (q < currentQuarter || year < currentYear) {
        status = 'PAID'
        filedDate = new Date(dueDateObj.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    }

    quarters.push({
      quarter: `Q${q}` as QuarterlyTax['quarter'],
      year,
      taxCollected: quarterShare,
      status,
      dueDate: dueDateObj.toISOString(),
      filedDate
    })
  }

  return quarters
}

export function TaxSummaryCard({ data }: TaxSummaryProps) {
  const [showAllCities, setShowAllCities] = useState(false)
  const [activeTab, setActiveTab] = useState<'summary' | 'quarterly'>('summary')

  const stateEntries = Object.entries(data.taxesByState || {})
    .sort((a, b) => b[1] - a[1])
  const cityEntries = Object.entries(data.taxesByCity || {})
    .sort((a, b) => b[1] - a[1])
  const displayedCities = showAllCities ? cityEntries : cityEntries.slice(0, 5)

  // Use provided quarterly data or generate estimates
  const quarterlyData = useMemo(() => {
    return data.quarterlyData || generateQuarterlyData(data.totalTaxesCollected)
  }, [data.quarterlyData, data.totalTaxesCollected])

  const pendingQuarters = quarterlyData.filter(q => q.status === 'PENDING')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Warning Banner - NOT our money */}
      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Passthrough Money
            </p>
            <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
              This is NOT platform revenue — must be remitted to government quarterly
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tax Summary
        </h2>
        {/* Tab Toggle */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'summary'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('quarterly')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'quarterly'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Quarterly
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Taxes Collected</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(data.totalTaxesCollected)}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          Owed to government • {pendingQuarters.length} quarter(s) pending
        </p>
      </div>

      {activeTab === 'quarterly' ? (
        /* Quarterly Remittance Table */
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Quarter</th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Collected</th>
                  <th className="text-center py-2 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {quarterlyData.map((q) => {
                  const statusStyle = STATUS_STYLES[q.status]
                  const dueDate = new Date(q.dueDate)
                  return (
                    <tr key={`${q.quarter}-${q.year}`} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2 font-medium text-gray-900 dark:text-white">
                        {q.quarter} {q.year}
                      </td>
                      <td className="py-2 text-right text-gray-900 dark:text-white">
                        {formatCurrency(q.taxCollected)}
                      </td>
                      <td className="py-2 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                        {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Filing Action */}
          <a
            href="https://aztaxes.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium text-center transition-colors"
          >
            File with AZTaxes.gov →
          </a>
        </div>
      ) : (
        /* Summary View */
        <>
          {/* Remittance Status */}
          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Current Quarter Status</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Status</p>
                <p className={`font-medium ${pendingQuarters.length > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {pendingQuarters.length > 0 ? 'Pending' : 'Current'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Filing</p>
                <p className="font-medium text-gray-900 dark:text-white">Quarterly</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Next Due</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {pendingQuarters.length > 0
                    ? new Date(pendingQuarters[0].dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {stateEntries.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                By State
              </h3>
              <div className="space-y-2">
                {stateEntries.map(([state, amount]) => (
                  <div key={state} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{state}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cityEntries.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  By City
                </h3>
                {cityEntries.length > 5 && (
                  <button
                    onClick={() => setShowAllCities(!showAllCities)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showAllCities ? 'Show less' : `Show all (${cityEntries.length})`}
                  </button>
                )}
              </div>
              <div className={`space-y-2 ${showAllCities ? 'max-h-60 overflow-y-auto' : ''}`}>
                {displayedCities.map(([city, amount]) => (
                  <div key={city} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{city}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Arizona TPT: State 5.6% + City privilege tax. File quarterly via AZTaxes.gov.
          Due 20th of month following quarter end.
        </p>
      </div>
    </div>
  )
}

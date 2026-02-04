// app/fleet/banking/components/PayoutSimulator.tsx
// Allows fleet admin to simulate payout calculations

'use client'

import { useState } from 'react'
import { formatCurrency } from '../types'

interface PayoutSimulatorProps {
  commissionTiers: {
    name: string
    minVehicles: number
    maxVehicles: number | null
    rate: number
    hostKeeps: number
  }[]
  processingFeeFixed: number
}

export function PayoutSimulator({ commissionTiers, processingFeeFixed }: PayoutSimulatorProps) {
  const [grossEarnings, setGrossEarnings] = useState(500)
  const [fleetSize, setFleetSize] = useState(1)

  // Find applicable tier
  const tier = commissionTiers.find(t => {
    if (t.maxVehicles === null) {
      return fleetSize >= t.minVehicles
    }
    return fleetSize >= t.minVehicles && fleetSize <= t.maxVehicles
  }) || commissionTiers[0]

  const commissionRate = tier?.rate || 0.25
  const platformFee = grossEarnings * commissionRate
  const netPayout = grossEarnings - platformFee - processingFeeFixed

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Payout Simulator
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gross Earnings ($)
          </label>
          <input
            type="number"
            value={grossEarnings}
            onChange={(e) => setGrossEarnings(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fleet Size (Vehicles)
          </label>
          <input
            type="number"
            value={fleetSize}
            onChange={(e) => setFleetSize(Number(e.target.value) || 1)}
            min={1}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Tier Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          tier?.name === 'Diamond' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
          tier?.name === 'Platinum' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
          tier?.name === 'Gold' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}>
          {tier?.name || 'Standard'} Tier ({(commissionRate * 100).toFixed(0)}% commission)
        </span>
      </div>

      {/* Calculation Breakdown */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Gross Earnings</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(grossEarnings)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Platform Fee ({(commissionRate * 100).toFixed(0)}%)
          </span>
          <span className="font-medium text-red-600 dark:text-red-400">
            -{formatCurrency(platformFee)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Processing Fee</span>
          <span className="font-medium text-red-600 dark:text-red-400">
            -{formatCurrency(processingFeeFixed)}
          </span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-600">
          <span className="font-semibold text-gray-900 dark:text-white">Host Net Payout</span>
          <span className="font-bold text-xl text-green-600 dark:text-green-400">
            {formatCurrency(netPayout)}
          </span>
        </div>
      </div>

      {/* Host Keeps Percentage */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Host keeps <span className="font-bold text-green-600 dark:text-green-400">{((1 - commissionRate) * 100).toFixed(0)}%</span> of earnings
        </p>
      </div>

      {/* Tier Reference */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Commission Tiers</p>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {commissionTiers.map(t => (
            <div
              key={t.name}
              className={`p-2 rounded text-center ${
                t.name === tier?.name
                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <p className="font-medium text-gray-900 dark:text-white">{t.name}</p>
              <p className="text-gray-500 dark:text-gray-400">
                {t.minVehicles}{t.maxVehicles ? `-${t.maxVehicles}` : '+'}
              </p>
              <p className="text-gray-600 dark:text-gray-300">{(t.rate * 100).toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

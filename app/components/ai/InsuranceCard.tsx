'use client'

import { IoShield, IoCheckmarkCircle, IoWarning } from 'react-icons/io5'
import type { InsuranceTierOption } from '@/app/lib/ai-booking/types'

interface InsuranceCardProps {
  options: InsuranceTierOption[]
  selected: string | null
  onSelect: (tier: 'MINIMUM' | 'BASIC' | 'PREMIUM' | 'LUXURY') => void
  onBack?: () => void
  compact?: boolean
}

const TIER_META: Record<string, { label: string; color: string; description: string }> = {
  MINIMUM: { label: 'Minimum', color: 'text-gray-500', description: 'State minimum only' },
  BASIC: { label: 'Basic', color: 'text-blue-600', description: 'Good coverage' },
  PREMIUM: { label: 'Premium', color: 'text-purple-600', description: 'Recommended' },
  LUXURY: { label: 'Luxury', color: 'text-amber-600', description: 'Full protection' },
}

export default function InsuranceCard({ options, selected, onSelect, onBack, compact }: InsuranceCardProps) {
  if (compact && selected) {
    const opt = options.find((o) => o.tier === selected)
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoShield size={14} className="text-primary" />
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              Insurance: {TIER_META[selected]?.label}
            </span>
            <span className="text-xs text-gray-500">
              ${opt?.dailyPremium.toFixed(2)}/day
            </span>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700">
        <IoShield size={16} className="text-primary" />
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Choose Insurance
        </h4>
      </div>

      <div className="p-3 space-y-2">
        {options.map((option) => {
          const meta = TIER_META[option.tier]
          const isSelected = selected === option.tier

          return (
            <button
              key={option.tier}
              onClick={() => onSelect(option.tier)}
              className={`
                w-full text-left p-3 rounded-lg border transition-all
                ${isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {isSelected && <IoCheckmarkCircle size={14} className="text-primary" />}
                  <span className={`text-sm font-semibold ${meta.color}`}>
                    {meta.label}
                  </span>
                  {option.tier === 'PREMIUM' && (
                    <span className="text-[9px] font-bold uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      Recommended
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  ${option.dailyPremium.toFixed(2)}/day
                </span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                {option.coverage.description}
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                <span>Liability: ${(option.coverage.liability / 1000).toFixed(0)}K</span>
                <span>
                  Collision: {option.coverage.collision === 'vehicle_value' ? 'Full value' : `$${(option.coverage.collision as number / 1000).toFixed(0)}K`}
                </span>
                <span>Deductible: ${option.coverage.deductible.toLocaleString()}</span>
              </div>

              {option.tier === 'MINIMUM' && option.increasedDeposit && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-600 dark:text-amber-400">
                  <IoWarning size={10} />
                  <span>Deposit increases to ${option.increasedDeposit.toLocaleString()}</span>
                </div>
              )}

              <div className="text-right text-[10px] text-gray-400 mt-1">
                Total: ${option.totalPremium.toFixed(2)}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

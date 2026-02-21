'use client'

import { IoExtensionPuzzle, IoCheckmarkCircle } from 'react-icons/io5'
import type { AddOnOption } from '@/app/lib/ai-booking/types'

interface AddOnsCardProps {
  addOns: AddOnOption[]
  numberOfDays: number
  onToggle: (id: string) => void
  onContinue: () => void
  onBack?: () => void
  compact?: boolean
  onExplore?: () => void
}

export default function AddOnsCard({ addOns, numberOfDays, onToggle, onContinue, onBack, compact, onExplore }: AddOnsCardProps) {
  const selectedAddOns = addOns.filter((a) => a.selected)

  if (compact && selectedAddOns.length >= 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoExtensionPuzzle size={14} className="text-primary" />
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              Add-ons: {selectedAddOns.length === 0 ? 'None' : selectedAddOns.map((a) => a.label).join(', ')}
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
        <IoExtensionPuzzle size={16} className="text-primary" />
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Add-ons
        </h4>
        <span className="text-xs text-gray-400">(optional)</span>
      </div>

      <div className="p-3 space-y-2">
        {addOns.map((addOn) => {
          const amount = addOn.perDay ? addOn.price * numberOfDays : addOn.price

          return (
            <button
              key={addOn.id}
              onClick={() => onToggle(addOn.id)}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg border transition-all
                ${addOn.selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {addOn.selected && <IoCheckmarkCircle size={14} className="text-primary" />}
                <div className="text-left">
                  <span className={`text-sm font-medium ${addOn.selected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {addOn.label}
                  </span>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    {addOn.description}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${amount.toFixed(2)}
                </span>
                {addOn.perDay && (
                  <p className="text-[9px] text-gray-400">${addOn.price}/day × {numberOfDays}</p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={onContinue}
          className="w-full py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          Continue to Review
        </button>
      </div>

      {onExplore && !compact && (
        <div className="px-3 pb-2">
          <button
            onClick={onExplore}
            className="text-[10px] text-gray-400 hover:text-primary transition-colors"
          >
            Want to explore other cars?
          </button>
        </div>
      )}
    </div>
  )
}

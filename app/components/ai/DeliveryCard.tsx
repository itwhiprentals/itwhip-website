'use client'

import { IoCarSport, IoAirplane, IoBed, IoHome, IoCheckmarkCircle } from 'react-icons/io5'
import type { DeliveryOption } from '@/app/lib/ai-booking/types'

interface DeliveryCardProps {
  options: DeliveryOption[]
  selected: string | null
  onSelect: (type: 'pickup' | 'airport' | 'hotel' | 'home') => void
  onBack?: () => void
  compact?: boolean
}

const DELIVERY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  pickup: IoCarSport,
  airport: IoAirplane,
  hotel: IoBed,
  home: IoHome,
}

export default function DeliveryCard({ options, selected, onSelect, onBack, compact }: DeliveryCardProps) {
  const availableOptions = options.filter((o) => o.available)

  if (compact && selected) {
    const opt = availableOptions.find((o) => o.type === selected)
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoCarSport size={14} className="text-primary" />
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              Delivery: {opt?.label}
            </span>
            <span className="text-xs text-gray-500">
              {opt && opt.fee > 0 ? `$${opt.fee.toFixed(2)}` : 'Free'}
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
        <IoCarSport size={16} className="text-primary" />
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Delivery Option
        </h4>
      </div>

      <div className="p-3 space-y-2">
        {availableOptions.map((option) => {
          const Icon = DELIVERY_ICONS[option.type] || IoCarSport
          const isSelected = selected === option.type

          return (
            <button
              key={option.type}
              onClick={() => onSelect(option.type)}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg border transition-all
                ${isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {isSelected && <IoCheckmarkCircle size={14} className="text-primary" />}
                <Icon size={16} className={isSelected ? 'text-primary' : 'text-gray-400'} />
                <span className={`text-sm font-medium ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {option.label}
                </span>
              </div>
              <span className={`text-sm font-semibold ${option.fee === 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                {option.fee === 0 ? 'Free' : `$${option.fee.toFixed(2)}`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

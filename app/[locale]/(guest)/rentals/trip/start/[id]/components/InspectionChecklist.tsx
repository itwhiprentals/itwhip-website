// app/(guest)/rentals/trip/start/[id]/components/InspectionChecklist.tsx

'use client'

import { useState } from 'react'
import {
  IoCheckmarkCircle,
  IoKeyOutline,
  IoCarSportOutline,
  IoFlashlightOutline,
  IoEllipseOutline,
  IoWarningOutline,
  IoDocumentTextOutline,
  IoShieldCheckmark,
  IoAlertCircle,
} from 'react-icons/io5'
import { MdAirlineSeatReclineNormal } from 'react-icons/md'

interface InspectionChecklistProps {
  booking: any
  data: any
  onChecklistChange: (item: string, checked: boolean) => void
  onNotesChange: (notes: string) => void
}

const CHECKLIST_ITEMS = [
  {
    id: 'keysReceived',
    label: 'Keys received',
    description: 'All keys and key fob work properly',
    icon: IoKeyOutline,
    color: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/40',
  },
  {
    id: 'exteriorChecked',
    label: 'Exterior inspected',
    description: 'No undocumented dents or scratches',
    icon: IoCarSportOutline,
    color: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/40',
  },
  {
    id: 'interiorChecked',
    label: 'Interior inspected',
    description: 'Seats, dashboard, and cleanliness OK',
    icon: MdAirlineSeatReclineNormal,
    color: 'text-teal-500 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/40',
  },
  {
    id: 'lightsWork',
    label: 'Lights working',
    description: 'Headlights, brake lights, turn signals',
    icon: IoFlashlightOutline,
    color: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
  },
  {
    id: 'tiresGood',
    label: 'Tires OK',
    description: 'No damage, adequate tread depth',
    icon: IoEllipseOutline,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
  {
    id: 'noWarningLights',
    label: 'No warning lights',
    description: 'Check engine, oil, battery clear',
    icon: IoWarningOutline,
    color: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/40',
  },
]

export function InspectionChecklist({ booking, data, onChecklistChange, onNotesChange }: InspectionChecklistProps) {
  const [notes, setNotes] = useState(data.notes || '')

  const handleCheckChange = (itemId: string) => {
    const newValue = !data.checklist[itemId]
    onChecklistChange(itemId, newValue)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setNotes(value)
    onNotesChange(value)
  }

  const completedCount = Object.values(data.checklist).filter(Boolean).length
  const totalCount = CHECKLIST_ITEMS.length
  const allChecked = completedCount === totalCount
  const progressPercent = (completedCount / totalCount) * 100

  return (
    <div className="space-y-5">
      {/* Header with progress */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
          <IoShieldCheckmark className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pre-Trip Safety Check</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Verify each item before starting your trip</p>
        </div>
        {/* Circular progress */}
        <div className="relative w-10 h-10 flex-shrink-0">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
            <circle
              cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3"
              className="text-green-500 dark:text-green-400 transition-all duration-500"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - progressPercent / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-900 dark:text-white">{completedCount}/{totalCount}</span>
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = data.checklist[item.id] || false
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => handleCheckChange(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                isChecked
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Icon */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isChecked ? 'bg-green-100 dark:bg-green-900/40' : item.bgColor
              }`}>
                <Icon className={`w-4.5 h-4.5 ${isChecked ? 'text-green-600 dark:text-green-400' : item.color}`} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  isChecked ? 'text-green-900 dark:text-green-200' : 'text-gray-900 dark:text-white'
                }`}>
                  {item.label}
                </p>
                <p className={`text-xs ${
                  isChecked ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.description}
                </p>
              </div>

              {/* Checkbox */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                isChecked
                  ? ''
                  : 'border-2 border-gray-300 dark:border-gray-600'
              }`}>
                {isChecked ? (
                  <IoCheckmarkCircle className="w-6 h-6 text-green-500 dark:text-green-400" />
                ) : null}
              </div>
            </button>
          )
        })}
      </div>

      {/* Notes section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <IoDocumentTextOutline className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Additional Notes (Optional)
          </label>
        </div>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Note any existing damage, concerns, or special conditions..."
          rows={3}
          className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none"
        />
      </div>

      {/* Status banner */}
      {allChecked ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <IoShieldCheckmark className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-200">All checks passed</p>
            <p className="text-xs text-green-700 dark:text-green-400">You're ready to start your trip!</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
          <IoAlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Complete all {totalCount - completedCount} remaining item{totalCount - completedCount !== 1 ? 's' : ''} to proceed
          </p>
        </div>
      )}
    </div>
  )
}

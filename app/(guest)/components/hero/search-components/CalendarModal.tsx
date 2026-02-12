// app/(guest)/components/hero/search-components/CalendarModal.tsx

'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  IoCloseOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline
} from 'react-icons/io5'

interface CalendarModalProps {
  isOpen: boolean
  onClose: () => void
  currentDate: string
  minDate: string
  onDateSelect: (date: string) => void
  title: string
  blockedDates?: string[]  // YYYY-MM-DD strings — shown as unavailable (grayed out, not selectable)
}

export default function CalendarModal({
  isOpen,
  onClose,
  currentDate,
  minDate,
  onDateSelect,
  title,
  blockedDates = []
}: CalendarModalProps) {
  const blockedSet = new Set(blockedDates)
  const [mounted, setMounted] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => {
    // Parse the date correctly in local timezone
    if (currentDate) {
      const [year, month, day] = currentDate.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return { month: date.getMonth(), year: date.getFullYear() }
    }
    const today = new Date()
    return { month: today.getMonth(), year: today.getFullYear() }
  })

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Update view month when currentDate changes
  useEffect(() => {
    if (currentDate) {
      const [year, month, day] = currentDate.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      setViewMonth({ month: date.getMonth(), year: date.getFullYear() })
    }
  }, [currentDate])

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handleDateSelect = (day: number) => {
    // Create date in local timezone and format as YYYY-MM-DD
    const year = viewMonth.year
    const month = viewMonth.month + 1
    const selected = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    
    onDateSelect(selected)
  }

  // Helper to compare dates (YYYY-MM-DD format)
  const isSameDate = (date1: string, date2: string) => {
    return date1 === date2
  }

  const isBeforeDate = (date1: string, date2: string) => {
    return date1 < date2
  }

  const getTodayString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const day = today.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (!isOpen || !mounted) return null

  const todayString = getTodayString()

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm mx-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            type="button"
          >
            <IoCloseOutline className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              if (viewMonth.month === 0) {
                setViewMonth({ month: 11, year: viewMonth.year - 1 })
              } else {
                setViewMonth({ ...viewMonth, month: viewMonth.month - 1 })
              }
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            type="button"
          >
            <IoChevronBackOutline className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {monthNames[viewMonth.month]} {viewMonth.year}
          </span>
          <button
            onClick={() => {
              if (viewMonth.month === 11) {
                setViewMonth({ month: 0, year: viewMonth.year + 1 })
              } else {
                setViewMonth({ ...viewMonth, month: viewMonth.month + 1 })
              }
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            type="button"
          >
            <IoChevronForwardOutline className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-7 mb-1.5">
            {dayNames.map(day => (
              <div key={day} className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 py-1.5">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: getFirstDayOfMonth(viewMonth.month, viewMonth.year) }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            
            {Array.from({ length: getDaysInMonth(viewMonth.month, viewMonth.year) }).map((_, i) => {
              const day = i + 1
              const year = viewMonth.year
              const month = (viewMonth.month + 1).toString().padStart(2, '0')
              const dayStr = day.toString().padStart(2, '0')
              const dateStr = `${year}-${month}-${dayStr}`
              
              const isSelected = isSameDate(dateStr, currentDate)
              const isPast = isBeforeDate(dateStr, minDate)
              const isBlocked = blockedSet.has(dateStr)
              const isDisabled = isPast || isBlocked
              const isToday = isSameDate(dateStr, todayString)

              return (
                <button
                  key={day}
                  onClick={() => !isDisabled && handleDateSelect(day)}
                  disabled={isDisabled}
                  title={isBlocked ? 'Unavailable' : undefined}
                  className={`h-9 rounded-lg text-xs font-medium transition-colors relative
                    ${isSelected
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : isBlocked
                        ? 'text-red-300 dark:text-red-800 cursor-not-allowed line-through'
                        : isToday
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : isPast
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  type="button"
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
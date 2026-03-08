// app/(guest)/components/hero/search-components/TimeDropdown.tsx
// WITH CLICK OUTSIDE TO CLOSE!

'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface TimeDropdownProps {
  isOpen: boolean
  currentTime: string
  onSelect: (time: string) => void
  buttonRef: React.RefObject<HTMLButtonElement | null>
  onClose?: () => void
  /** When provided and the date is today, times before now are disabled */
  selectedDate?: string
}

export default function TimeDropdown({
  isOpen,
  currentTime,
  onSelect,
  buttonRef,
  onClose,
  selectedDate
}: TimeDropdownProps) {
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // Check if click is outside the dropdown
      const isDropdownClick = (event.target as Element).closest('.time-dropdown-portal')
      
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        !isDropdownClick
      ) {
        if (onClose) {
          onClose()
        }
      }
    }

    // Small delay to prevent immediate closing when opening
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, buttonRef, onClose])

  if (!isOpen || !mounted) return null

  // Calculate position
  const buttonRect = buttonRef.current?.getBoundingClientRect()
  if (!buttonRect) return null

  const top = buttonRect.bottom + window.scrollY + 4
  const left = buttonRect.left + window.scrollX
  const minWidth = buttonRect.width

  // Check if selected date is today (Arizona time)
  const isDateToday = (() => {
    if (!selectedDate) return false
    const now = new Date()
    const arizonaToday = now.toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' })
    return selectedDate === arizonaToday
  })()

  // Get current Arizona hour/minute for filtering past times
  const arizonaNowMinutes = (() => {
    if (!isDateToday) return 0
    const now = new Date()
    const arizonaTime = now.toLocaleString('en-US', { timeZone: 'America/Phoenix', hour: 'numeric', minute: 'numeric', hour12: false })
    const [h, m] = arizonaTime.split(':').map(Number)
    return h * 60 + m
  })()

  // Generate time options
  const timeOptions = []
  for (let i = 0; i < 48; i++) {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? '00' : '30'
    const time = `${hour.toString().padStart(2, '0')}:${minute}`
    const period = hour < 12 ? 'AM' : 'PM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const slotMinutes = hour * 60 + parseInt(minute)
    const isPast = isDateToday && slotMinutes <= arizonaNowMinutes
    timeOptions.push({
      value: time,
      label: `${displayHour}:${minute} ${period}`,
      isPast
    })
  }

  const dropdownContent = (
    <div 
      ref={dropdownRef}
      className="time-dropdown-portal bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[99999] max-h-[200px] overflow-y-auto"
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        minWidth: `${minWidth}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-1">
        {timeOptions.map((option) => {
          const isSelected = currentTime === option.value

          return (
            <button
              key={option.value}
              onClick={() => {
                if (option.isPast) return
                onSelect(option.value)
              }}
              disabled={option.isPast}
              className={`w-full h-8 px-2.5 py-1 text-left rounded-md text-[11px] transition-colors
                ${option.isPast
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : isSelected
                    ? 'bg-black dark:bg-white text-white dark:text-black font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              type="button"
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )

  return createPortal(dropdownContent, document.body)
}
// app/(guest)/components/hero/search-components/TimeDropdown.tsx

'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface TimeDropdownProps {
  isOpen: boolean
  currentTime: string
  onSelect: (time: string) => void
  buttonRef: React.RefObject<HTMLButtonElement>
}

export default function TimeDropdown({
  isOpen,
  currentTime,
  onSelect,
  buttonRef
}: TimeDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        // Don't close here, let parent handle it
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, buttonRef])

  if (!isOpen) return null

  // Calculate position
  const buttonRect = buttonRef.current?.getBoundingClientRect()
  if (!buttonRect) return null

  const top = buttonRect.bottom + window.scrollY + 4
  const left = buttonRect.left + window.scrollX
  const minWidth = buttonRect.width

  // Generate time options
  const timeOptions = []
  for (let i = 0; i < 48; i++) {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? '00' : '30'
    const time = `${hour.toString().padStart(2, '0')}:${minute}`
    const period = hour < 12 ? 'AM' : 'PM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    timeOptions.push({
      value: time,
      label: `${displayHour}:${minute} ${period}`
    })
  }

  const dropdownContent = (
    <div 
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        minWidth: `${minWidth}px`,
      }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[99999] max-h-[200px] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-1">
        {timeOptions.map((option) => {
          const isSelected = currentTime === option.value
          
          return (
            <button
              key={option.value}
              onClick={() => {
                console.log('🕐 TIME CLICKED:', option.value)
                onSelect(option.value)
              }}
              className={`w-full h-8 px-2.5 py-1 text-left rounded-md text-[11px] transition-colors
                ${isSelected
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
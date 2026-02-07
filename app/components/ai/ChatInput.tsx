'use client'

import { useState, useRef, useEffect } from 'react'
import { IoSend, IoRefresh } from 'react-icons/io5'

// Rotating placeholder examples showing what Choé can do
const placeholderExamples = [
  'SUV in Phoenix under $50/day...',
  'No deposit cars in Scottsdale...',
  'Tesla for next weekend...',
  'Cheap car for 4 days, $300 budget...',
  'Convertible for a date night...',
  'Something spacious for 6 people...',
  'Luxury car in Tempe...',
  'Car with airport delivery...',
]

interface ChatInputProps {
  onSend: (message: string) => void
  onReset: () => void
  suggestions: string[]
  disabled: boolean
  hasMessages: boolean
}

export default function ChatInput({
  onSend,
  onReset,
  suggestions,
  disabled,
  hasMessages,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Rotate placeholder text every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Only focus after user has sent their first message (not on initial mount)
  const hasSentMessage = useRef(false)
  useEffect(() => {
    if (!disabled && hasSentMessage.current) inputRef.current?.focus()
  }, [disabled])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    hasSentMessage.current = true
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSuggestion = (text: string) => {
    if (disabled) return
    onSend(text)
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pb-safe">
      {/* Suggestion chips */}
      {suggestions.length > 0 && !hasMessages && (
        <SuggestionChips
          suggestions={suggestions}
          onSelect={handleSuggestion}
          disabled={disabled}
        />
      )}

      {/* Input row */}
      <div className="flex items-center gap-2 p-3">
        {hasMessages && (
          <button
            onClick={onReset}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Start over"
          >
            <IoRefresh size={18} />
          </button>
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderExamples[placeholderIndex]}
          disabled={disabled}
          className="flex-1 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-400 dark:border-blue-500 rounded-lg text-sm text-gray-900 dark:text-white placeholder-blue-400/70 dark:placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-500 disabled:opacity-50 transition-colors shadow-sm shadow-blue-200/50 dark:shadow-blue-900/30"
        />

        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 p-2.5 bg-[#3D9970] text-white rounded-lg hover:bg-[#2E8B57] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm shadow-[#3D9970]/30"
        >
          <IoSend size={16} />
        </button>
      </div>

      {/* Disclaimer */}
      <div className="text-center pb-2">
        <p className="text-[9px] text-gray-400 dark:text-gray-500">
          Choé can make mistakes. Verify booking details before confirming.
        </p>
      </div>
    </div>
  )
}

function SuggestionChips({
  suggestions,
  onSelect,
  disabled,
}: {
  suggestions: string[]
  onSelect: (text: string) => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2 px-3 pt-3">
      {suggestions.map((text) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 border border-primary/20 rounded-full hover:bg-primary/10 disabled:opacity-50 transition-colors"
        >
          {text}
        </button>
      ))}
    </div>
  )
}

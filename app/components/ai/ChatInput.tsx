'use client'

import { useState, useRef, useEffect } from 'react'
import { IoSend, IoRefresh } from 'react-icons/io5'

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
  const inputRef = useRef<HTMLInputElement>(null)

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
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 transition-colors"
        />

        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 p-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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

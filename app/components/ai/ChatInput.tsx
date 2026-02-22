'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from '@/i18n/navigation'
import { IoSend, IoRefresh } from 'react-icons/io5'
import { useAuthOptional } from '@/app/contexts/AuthContext'
import { useTranslations } from 'next-intl'

interface ChatInputProps {
  onSend: (message: string) => void
  onReset: () => void
  suggestions: string[]
  disabled: boolean
  hasMessages: boolean
  mode?: 'GENERAL' | 'BOOKING' | 'PERSONAL'
  isDetectingMode?: boolean
}

export default function ChatInput({
  onSend,
  onReset,
  suggestions,
  disabled,
  hasMessages,
  mode,
  isDetectingMode,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const auth = useAuthOptional()
  const t = useTranslations('ChoeAI')

  const placeholderExamples = [
    t('placeholder0'), t('placeholder1'), t('placeholder2'), t('placeholder3'),
    t('placeholder4'), t('placeholder5'), t('placeholder6'), t('placeholder7'),
  ]

  // Rotate placeholder text every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [placeholderExamples.length])

  // Auto-resize textarea as content changes
  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px` // max ~5 lines
  }, [])

  // Only focus after user has sent their first message (not on initial mount)
  const hasSentMessage = useRef(false)
  useEffect(() => {
    if (!disabled && hasSentMessage.current) textareaRef.current?.focus()
  }, [disabled])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    hasSentMessage.current = true
    onSend(trimmed)
    setValue('')
    // Reset textarea height after sending
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
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

  const isLoggedIn = auth?.isLoggedIn ?? false
  const userName = auth?.user?.name

  return (
    <div className="pb-safe">
      {/* Suggestion chips — above the input box */}
      {suggestions.length > 0 && !hasMessages && (
        <SuggestionChips
          suggestions={suggestions}
          onSelect={handleSuggestion}
          disabled={disabled}
        />
      )}

      {/* The box — container IS the typing area */}
      <div className="mx-2 mb-1 bg-gray-100 dark:bg-gray-800/60 border border-gray-500/50 dark:border-gray-500/40 focus-within:border-blue-400 dark:focus-within:border-blue-500 rounded-lg overflow-hidden transition-colors">
        {/* Typing area (above the line) */}
        <div className="flex items-end gap-0 px-3 py-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            placeholder={placeholderExamples[placeholderIndex]}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400/60 dark:placeholder-gray-500/50 focus:outline-none disabled:opacity-50 resize-none overflow-y-auto leading-5"
            style={{ maxHeight: 120 }}
          />

          <button
            onClick={onReset}
            disabled={!hasMessages}
            className={`flex-shrink-0 p-2 transition-colors rounded-lg ${
              hasMessages
                ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-gray-300/40 dark:text-gray-600/40 cursor-default'
            }`}
            title={t('startOver')}
          >
            <IoRefresh size={18} />
          </button>

          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="flex-shrink-0 p-2 bg-[#3D9970] text-white rounded-lg hover:bg-[#2E8B57] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <IoSend size={14} />
          </button>
        </div>

        {/* Tiny separator line — edge to edge, black */}
        <div className="border-t border-gray-900/15 dark:border-gray-100/10" />

        {/* Status bar (below the line) */}
        <div className="flex items-center justify-center gap-3 px-3 py-1.5">
          <span className="flex items-center gap-1 text-[9px] text-gray-400/70 dark:text-gray-500/60">
            <span className={`w-1.5 h-1.5 rounded-full ${isLoggedIn ? 'bg-green-400' : 'bg-gray-300/50 dark:bg-gray-600/50'}`} />
            {isLoggedIn ? (userName || t('loggedIn')) : t('notLoggedIn')}
          </span>
          <span className="text-[9px] text-gray-300/40 dark:text-gray-600/40">|</span>
          <span className="flex items-center gap-1 text-[9px] text-gray-400/70 dark:text-gray-500/60">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            {t('platform')}
          </span>
          {mode && (
            <>
              <span className="text-[9px] text-gray-300/40 dark:text-gray-600/40">|</span>
              <span className="flex items-center gap-1 text-[9px] text-gray-400/70 dark:text-gray-500/60">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  isDetectingMode
                    ? 'bg-yellow-400 animate-pulse'
                    : 'bg-green-400'
                }`} />
                {isDetectingMode ? t('detectingMode') : t(`mode${mode.charAt(0) + mode.slice(1).toLowerCase()}`)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Disclaimer — OUTSIDE the box */}
      <div className="text-center pb-0.5">
        <p className="text-[9px] text-gray-400 dark:text-gray-500">
          {t('disclaimer')}{' '}
          <Link href="/help/choe" className="underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors">{t('learnMore')}</Link>
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
    <div className="flex flex-wrap gap-2 px-3 pt-2.5">
      {suggestions.map((text) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/40 rounded-full hover:bg-white/80 dark:hover:bg-gray-700/50 disabled:opacity-50 transition-colors"
        >
          {text}
        </button>
      ))}
    </div>
  )
}

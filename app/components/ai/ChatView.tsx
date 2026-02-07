'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import MessageBubble from './MessageBubble'
import VehicleCard from './VehicleCard'
import ProgressBar from './ProgressBar'
import BookingSummary from './BookingSummary'
import ChatInput from './ChatInput'
import type {
  BookingSession,
  AIBookingResponse,
  VehicleSummary,
  BookingSummary as BookingSummaryType,
  BookingAction,
} from '@/app/lib/ai-booking/types'
import { BookingState } from '@/app/lib/ai-booking/types'

interface ChatViewProps {
  onNavigateToBooking?: (vehicleId: string, startDate: string, endDate: string) => void
  onNavigateToLogin?: () => void
  onClassicSearch?: () => void
}

export default function ChatView({ onNavigateToBooking, onNavigateToLogin, onClassicSearch }: ChatViewProps) {
  const [session, setSession] = useState<BookingSession | null>(null)
  const [vehicles, setVehicles] = useState<VehicleSummary[] | null>(null)

  // Restore from localStorage after hydration
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('itwhip-ai-session')
      if (savedSession) setSession(JSON.parse(savedSession))
      const savedVehicles = localStorage.getItem('itwhip-ai-vehicles')
      if (savedVehicles) setVehicles(JSON.parse(savedVehicles))
    } catch { /* ignore */ }
  }, [])
  const [summary, setSummary] = useState<BookingSummaryType | null>(null)
  const [action, setAction] = useState<BookingAction | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Persist session and vehicles to localStorage
  useEffect(() => {
    if (session) {
      localStorage.setItem('itwhip-ai-session', JSON.stringify(session))
    }
  }, [session])
  useEffect(() => {
    if (vehicles) {
      localStorage.setItem('itwhip-ai-vehicles', JSON.stringify(vehicles))
    }
  }, [vehicles])

  // Auto-scroll to bottom on new messages (skip initial mount)
  const hasInteracted = useRef(false)
  useEffect(() => {
    if (session?.messages.length) {
      if (hasInteracted.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      hasInteracted.current = true
    }
  }, [session?.messages.length, vehicles, summary])

  // Track rate limit state separately (not a real BookingAction)
  const [isRateLimited, setIsRateLimited] = useState(false)

  const sendMessage = useCallback(async (message: string) => {
    setLoading(true)
    setIsRateLimited(false) // Reset on new message

    try {
      const res = await fetch('/api/ai/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          session,
          previousVehicles: vehicles,
        }),
      })

      // Handle rate limit (429) with helpful options
      if (res.status === 429) {
        const errorData = await res.json()
        setSession((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: [
              ...prev.messages,
              {
                role: 'assistant' as const,
                content: errorData.error || 'Rate limit reached.',
                timestamp: Date.now(),
              },
            ],
          }
        })
        setIsRateLimited(true)
        return
      }

      if (!res.ok) throw new Error('Request failed')

      const data: AIBookingResponse = await res.json()

      setSession(data.session)
      setVehicles(data.vehicles)
      setSummary(data.summary)
      setAction(data.action)
      setSuggestions(data.suggestions || [])
    } catch {
      // Add error message to UI
      setSession((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: 'assistant' as const,
              content: "Sorry, something went wrong. Try again?",
              timestamp: Date.now(),
            },
          ],
        }
      })
    } finally {
      setLoading(false)
    }
  }, [session, vehicles])

  const handleReset = useCallback(() => {
    setSession(null)
    setVehicles(null)
    setSummary(null)
    setAction(null)
    setSuggestions([])
    localStorage.removeItem('itwhip-ai-session')
    localStorage.removeItem('itwhip-ai-vehicles')
  }, [])

  // Vehicle select handler - include vehicleId for reliable extraction
  const handleVehicleSelect = useCallback((vehicle: VehicleSummary) => {
    // Include vehicleId in message so Claude can extract it reliably
    // Format: "I'll take the 2024 Honda Accord [id:cm...]"
    sendMessage(`I'll take the ${vehicle.year} ${vehicle.make} ${vehicle.model} [id:${vehicle.id}]`)
  }, [sendMessage])

  const handleConfirm = useCallback(() => {
    sendMessage('Yes, confirm the booking')
  }, [sendMessage])

  const handleChangeVehicle = useCallback(() => {
    sendMessage('Show me other cars')
  }, [sendMessage])

  const handleAction = useCallback(() => {
    if (action === 'NEEDS_LOGIN' && onNavigateToLogin) {
      onNavigateToLogin()
    } else if (action === 'HANDOFF_TO_PAYMENT' && session && onNavigateToBooking) {
      onNavigateToBooking(
        session.vehicleId!,
        session.startDate!,
        session.endDate!
      )
    }
  }, [action, session, onNavigateToLogin, onNavigateToBooking])

  const messages = session?.messages || []
  const hasMessages = messages.length > 0

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-hidden"
    >
      {/* Header */}
      <ChatHeader onClassicSearch={onClassicSearch} />

      {/* Progress bar */}
      <AnimatePresence>
        {session && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springTransition}
            className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden"
          >
            <ProgressBar state={session.state} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!hasMessages && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springTransition}
          >
            <WelcomeMessage />
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: i === messages.length - 1 ? 0.05 : 0 }}
          >
            <MessageBubble role={msg.role} content={msg.content} />
          </motion.div>
        ))}

        {/* Vehicle cards - show when we have results and not in confirmation state */}
        <AnimatePresence>
          {vehicles && vehicles.length > 0 && session?.state !== BookingState.CONFIRMING && !session?.vehicleId && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
            >
              <VehicleResults
                vehicles={vehicles}
                onSelect={handleVehicleSelect}
                startDate={session?.startDate}
                endDate={session?.endDate}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking summary */}
        <AnimatePresence>
          {summary && session?.state === BookingState.CONFIRMING && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
            >
              <BookingSummary
                summary={summary}
                onConfirm={handleConfirm}
                onChangeVehicle={handleChangeVehicle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <AnimatePresence>
          {action && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
            >
              <ActionPrompt action={action} onAction={handleAction} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rate limit prompt with options */}
        <AnimatePresence>
          {isRateLimited && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
            >
              <RateLimitPrompt
                onClassicSearch={onClassicSearch}
                onLogin={onNavigateToLogin}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={springTransition}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-900">
        <ChatInput
          onSend={sendMessage}
          onReset={handleReset}
          suggestions={suggestions}
          disabled={loading}
          hasMessages={hasMessages}
        />
      </div>
    </motion.div>
  )
}

function ChatHeader({ onClassicSearch }: { onClassicSearch?: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="-mt-4">
        <Image src="/images/choe-logo.png" alt="Choé" width={300} height={87} className="h-[83px] w-auto" />
        <span className="text-[9px] text-gray-400 block -mt-7">ItWhip Search Studio</span>
      </div>
      {onClassicSearch && (
        <button
          onClick={onClassicSearch}
          type="button"
          className="text-[11px] font-semibold text-white
            px-3 py-1.5 rounded-md bg-gray-900 dark:bg-white dark:text-gray-900
            hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors shadow-sm"
        >
          Classic Search
        </button>
      )}
    </div>
  )
}

function WelcomeMessage() {
  return (
    <div className="text-center py-8">
      <Image src="/images/choe-logo.png" alt="Choé" width={64} height={64} className="mx-auto mb-3 rounded-lg" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        Find your perfect ride
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-3">
        Tell me what you&apos;re looking for and I&apos;ll find the best car for you in Arizona.
      </p>
      <a
        href="/help/chloe"
        className="text-[10px] text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 underline underline-offset-2"
      >
        Learn about ChoéAI
      </a>
    </div>
  )
}

function VehicleResults({
  vehicles,
  onSelect,
  startDate,
  endDate,
}: {
  vehicles: VehicleSummary[]
  onSelect: (v: VehicleSummary) => void
  startDate?: string | null
  endDate?: string | null
}) {
  return (
    <div className="space-y-2">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onSelect={onSelect}
          startDate={startDate}
          endDate={endDate}
        />
      ))}
    </div>
  )
}

function ActionPrompt({
  action,
  onAction,
}: {
  action: BookingAction
  onAction: () => void
}) {
  const config: Record<string, { label: string; description: string }> = {
    NEEDS_LOGIN: {
      label: 'Log In to Continue',
      description: 'You need to be logged in to complete your booking.',
    },
    NEEDS_VERIFICATION: {
      label: 'Verify Identity',
      description: 'Quick verification needed before booking.',
    },
    HIGH_RISK_REVIEW: {
      label: 'Upload Documents',
      description: 'Additional verification required for this booking.',
    },
    HANDOFF_TO_PAYMENT: {
      label: 'Go to Payment',
      description: 'Everything looks good! Ready to complete your booking.',
    },
  }

  const c = config[action]
  if (!c) return null

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{c.description}</p>
      <button
        onClick={onAction}
        className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
      >
        {c.label}
      </button>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 items-start">
      <Image
        src="/images/choe-logo.png"
        alt="Choé"
        width={96}
        height={28}
        className="flex-shrink-0 h-7 w-auto rounded-md object-contain"
      />
      <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function RateLimitPrompt({
  onClassicSearch,
  onLogin,
}: {
  onClassicSearch?: () => void
  onLogin?: () => void
}) {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <p className="text-sm text-amber-800 dark:text-amber-200 mb-3 text-center">
        You can still browse cars using our classic search, or log in for higher limits.
      </p>
      <div className="flex gap-2 justify-center">
        {onClassicSearch && (
          <button
            onClick={onClassicSearch}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
          >
            Classic Search
          </button>
        )}
        {onLogin && (
          <button
            onClick={onLogin}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Log In
          </button>
        )}
      </div>
    </div>
  )
}

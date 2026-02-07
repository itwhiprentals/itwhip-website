'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import MessageBubble from './MessageBubble'
import VehicleCard from './VehicleCard'
import ProgressBar from './ProgressBar'
import BookingSummary from './BookingSummary'
import ChatInput from './ChatInput'
import { useStreamingChat } from '@/app/hooks/useStreamingChat'
import type {
  BookingSession,
  VehicleSummary,
  BookingSummary as BookingSummaryType,
  BookingAction,
} from '@/app/lib/ai-booking/types'
import { BookingState } from '@/app/lib/ai-booking/types'

// =============================================================================
// TYPES
// =============================================================================

interface ChatViewStreamingProps {
  onNavigateToBooking?: (vehicleId: string, startDate: string, endDate: string) => void
  onNavigateToLogin?: () => void
  onClassicSearch?: () => void
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ChatViewStreaming({
  onNavigateToBooking,
  onNavigateToLogin,
  onClassicSearch,
}: ChatViewStreamingProps) {
  const [persistedSession, setPersistedSession] = useState<BookingSession | null>(null)
  const [persistedVehicles, setPersistedVehicles] = useState<VehicleSummary[] | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use streaming hook
  const {
    isStreaming,
    isThinking,
    currentText,
    session: streamSession,
    vehicles: streamVehicles,
    summary,
    action,
    suggestions,
    error,
    isRateLimited,
    toolsInUse,
    sendMessage,
    reset: resetStream,
  } = useStreamingChat({
    onComplete: (response) => {
      setPersistedSession(response.session)
      // REPLACE vehicles when a new search is performed
      // This ensures filter changes (e.g., "no deposit") show ONLY matching cars
      if (response.vehicles && response.vehicles.length > 0) {
        setPersistedVehicles(response.vehicles)
      }
    },
  })

  // Use stream state or persisted state
  const session = streamSession || persistedSession
  const vehicles = streamVehicles || persistedVehicles

  // Load conversation from database on mount (using sessionId from localStorage)
  useEffect(() => {
    async function loadConversation() {
      try {
        const savedSessionId = localStorage.getItem('itwhip-ai-session-id')
        if (!savedSessionId) {
          setIsLoadingSession(false)
          return
        }

        const response = await fetch(`/api/ai/booking/conversation/${savedSessionId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setPersistedSession(data.data.session)
            // Vehicles aren't persisted in DB yet, load from localStorage as fallback
            const savedVehicles = localStorage.getItem('itwhip-ai-vehicles')
            if (savedVehicles) setPersistedVehicles(JSON.parse(savedVehicles))
          }
        }
      } catch (error) {
        console.warn('[ChatViewStreaming] Failed to load conversation:', error)
      } finally {
        setIsLoadingSession(false)
      }
    }
    loadConversation()
  }, [])

  // Persist only sessionId to localStorage (full state is in database)
  useEffect(() => {
    if (persistedSession?.sessionId) {
      localStorage.setItem('itwhip-ai-session-id', persistedSession.sessionId)
    }
  }, [persistedSession?.sessionId])

  // Persist vehicles to localStorage (until we add vehicle storage to DB)
  useEffect(() => {
    if (persistedVehicles && persistedVehicles.length > 0) {
      localStorage.setItem('itwhip-ai-vehicles', JSON.stringify(persistedVehicles))
    }
  }, [persistedVehicles])

  // Auto-scroll on new content
  const hasInteracted = useRef(false)
  useEffect(() => {
    if (session?.messages.length || currentText) {
      if (hasInteracted.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      hasInteracted.current = true
    }
  }, [session?.messages.length, vehicles, summary, currentText])

  // Send message handler - optimistically add user message immediately
  const handleSendMessage = useCallback((message: string) => {
    // Optimistically add user message to session so it appears immediately
    const updatedSession: BookingSession = persistedSession
      ? {
          ...persistedSession,
          messages: [...persistedSession.messages, { role: 'user' as const, content: message }],
        }
      : {
          sessionId: `session-${Date.now()}`,
          state: BookingState.INIT,
          messages: [{ role: 'user' as const, content: message }],
          location: null,
          locationId: null,
          startDate: null,
          endDate: null,
          startTime: null,
          endTime: null,
          vehicleType: null,
          vehicleId: null,
        }

    setPersistedSession(updatedSession)

    sendMessage({
      message,
      session: persistedSession, // Send original session to backend
      previousVehicles: persistedVehicles,
    })
  }, [sendMessage, persistedSession, persistedVehicles])

  // Reset handler
  const handleReset = useCallback(() => {
    resetStream()
    setPersistedSession(null)
    setPersistedVehicles(null)
    localStorage.removeItem('itwhip-ai-session-id')
    localStorage.removeItem('itwhip-ai-vehicles')
  }, [resetStream])

  // Vehicle select handler - include vehicleId for reliable extraction
  const handleVehicleSelect = useCallback((vehicle: VehicleSummary) => {
    // Include vehicleId in message so Claude can extract it reliably
    // Format: "I'll take the 2024 Honda Accord [id:cm...]"
    handleSendMessage(`I'll take the ${vehicle.year} ${vehicle.make} ${vehicle.model} [id:${vehicle.id}]`)
  }, [handleSendMessage])

  // Action handlers
  const handleConfirm = useCallback(() => {
    handleSendMessage('Yes, confirm the booking')
  }, [handleSendMessage])

  const handleChangeVehicle = useCallback(() => {
    handleSendMessage('Show me other cars')
  }, [handleSendMessage])

  const handleAction = useCallback(() => {
    if (action === 'NEEDS_LOGIN' && onNavigateToLogin) {
      onNavigateToLogin()
    } else if (action === 'HANDOFF_TO_PAYMENT' && session && onNavigateToBooking) {
      onNavigateToBooking(session.vehicleId!, session.startDate!, session.endDate!)
    }
  }, [action, session, onNavigateToLogin, onNavigateToBooking])

  const messages = session?.messages || []
  const hasMessages = messages.length > 0

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 }

  // Show loading state while restoring session from database
  if (isLoadingSession) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-xs text-gray-500 mt-2">Restoring your conversation...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="flex flex-col h-[100dvh] bg-white dark:bg-gray-900 overflow-hidden"
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
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3">
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

        {/* Streaming text - show as it comes in */}
        <AnimatePresence>
          {isStreaming && currentText && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
            >
              <MessageBubble role="assistant" content={currentText} isStreaming />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vehicle cards - persist for scroll-back (hide only during CONFIRMING when summary shows) */}
        <AnimatePresence>
          {vehicles && vehicles.length > 0 && session?.state !== BookingState.CONFIRMING && (
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

        {/* Loading/thinking indicator */}
        <AnimatePresence>
          {(isStreaming && !currentText) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={springTransition}
            >
              <ThinkingIndicator
                isThinking={isThinking}
                toolsInUse={toolsInUse}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message or rate limit prompt */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={springTransition}
            >
              {isRateLimited ? (
                <RateLimitPrompt
                  error={error}
                  onClassicSearch={onClassicSearch}
                  onLogin={onNavigateToLogin}
                />
              ) : (
                <ErrorMessage error={error} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-900">
        <ChatInput
          onSend={handleSendMessage}
          onReset={handleReset}
          suggestions={suggestions}
          disabled={isStreaming}
          hasMessages={hasMessages}
        />
      </div>
    </motion.div>
  )
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

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
        href="/help/choe"
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

function ThinkingIndicator({
  isThinking,
  toolsInUse,
}: {
  isThinking: boolean
  toolsInUse: Array<{ name: string; input: unknown }>
}) {
  const toolLabels: Record<string, string> = {
    search_vehicles: 'Searching cars',
    get_weather: 'Checking weather',
    get_reviews: 'Reading reviews',
    select_vehicle: 'Selecting vehicle',
    update_booking_details: 'Updating details',
    calculator: 'Calculating',
  }

  const currentTool = toolsInUse[0]
  const label = currentTool ? toolLabels[currentTool.name] || 'Processing' : 'Thinking'

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
        <div className="flex items-center gap-2">
          {isThinking && currentTool && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}...</span>
          )}
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorMessage({ error }: { error: string }) {
  return (
    <div className="flex gap-2 items-start">
      <Image
        src="/images/choe-logo.png"
        alt="Choé"
        width={96}
        height={28}
        className="flex-shrink-0 h-7 w-auto rounded-md object-contain"
      />
      <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl rounded-bl-sm">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    </div>
  )
}

function RateLimitPrompt({
  error,
  onClassicSearch,
  onLogin,
}: {
  error: string
  onClassicSearch?: () => void
  onLogin?: () => void
}) {
  return (
    <div className="space-y-3">
      {/* Error message bubble */}
      <div className="flex gap-2 items-start">
        <Image
          src="/images/choe-logo.png"
          alt="Choé"
          width={96}
          height={28}
          className="flex-shrink-0 h-7 w-auto rounded-md object-contain"
        />
        <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl rounded-bl-sm">
          <p className="text-sm text-amber-700 dark:text-amber-300">{error}</p>
        </div>
      </div>

      {/* Options card */}
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
    </div>
  )
}

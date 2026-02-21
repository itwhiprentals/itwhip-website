'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import MessageBubble from './MessageBubble'
import VehicleCard from './VehicleCard'
import ProgressBar from './ProgressBar'
import BookingSummary from './BookingSummary'
import ChatInput from './ChatInput'
import InsuranceCard from './InsuranceCard'
import DeliveryCard from './DeliveryCard'
import AddOnsCard from './AddOnsCard'
import GrandTotalCard from './GrandTotalCard'
import PaymentCard from './PaymentCard'
import ConfirmationCard from './ConfirmationCard'
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5'
import { useLocale, useTranslations } from 'next-intl'
import { useStreamingChat } from '@/app/hooks/useStreamingChat'
import { useCheckout } from '@/app/hooks/useCheckout'
import { useAuthOptional } from '@/app/contexts/AuthContext'
import type {
  BookingSession,
  VehicleSummary,
  BookingSummary as BookingSummaryType,
  BookingAction,
} from '@/app/lib/ai-booking/types'
import { BookingState, CheckoutStep } from '@/app/lib/ai-booking/types'

// =============================================================================
// TYPES
// =============================================================================

interface ChatViewStreamingProps {
  onNavigateToBooking?: (vehicleId: string, startDate: string, endDate: string) => void
  onNavigateToLogin?: () => void
  onClassicSearch?: () => void
  isDarkMode?: boolean
  onToggleTheme?: () => void
  hideHeader?: boolean
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ChatViewStreaming({
  onNavigateToBooking,
  onNavigateToLogin,
  onClassicSearch,
  isDarkMode,
  onToggleTheme,
  hideHeader,
}: ChatViewStreamingProps) {
  const locale = useLocale()
  const t = useTranslations('ChoeAI')
  const auth = useAuthOptional()
  const [persistedSession, setPersistedSession] = useState<BookingSession | null>(null)
  const [persistedVehicles, setPersistedVehicles] = useState<VehicleSummary[] | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [isExploring, setIsExploring] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Checkout pipeline (deterministic — independent from AI conversation)
  const checkout = useCheckout()

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

  // Fallback: rebuild summary client-side if server didn't return one
  // (happens after page reload, checkout failure, or re-selection)
  const effectiveSummary = useMemo<BookingSummaryType | null>(() => {
    if (summary) return summary
    if (
      (session?.state === BookingState.CONFIRMING || session?.state === BookingState.READY_FOR_PAYMENT) &&
      session.vehicleId &&
      session.startDate &&
      session.endDate &&
      vehicles
    ) {
      const selected = vehicles.find((v) => v.id === session.vehicleId)
      if (selected) {
        const numberOfDays = Math.max(1, Math.ceil(
          (new Date(session.endDate).getTime() - new Date(session.startDate).getTime()) / (1000 * 60 * 60 * 24)
        ))
        const subtotal = selected.dailyRate * numberOfDays
        const serviceFee = Math.round(subtotal * 0.15 * 100) / 100
        const taxable = subtotal + serviceFee
        const estimatedTax = Math.round(taxable * 0.084 * 100) / 100
        return {
          vehicle: selected,
          location: session.location || 'Phoenix',
          startDate: session.startDate,
          endDate: session.endDate,
          startTime: session.startTime || '10:00',
          endTime: session.endTime || '10:00',
          numberOfDays,
          dailyRate: selected.dailyRate,
          subtotal,
          serviceFee,
          estimatedTax,
          estimatedTotal: Math.round((taxable + estimatedTax) * 100) / 100,
          depositAmount: selected.depositAmount,
        }
      }
    }
    return null
  }, [summary, session, vehicles])

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
  }, [session?.messages.length, vehicles, effectiveSummary, currentText, checkout.state.step])

  // Detect checkout cancellation keywords
  const isCancelIntent = useCallback((msg: string) => {
    return /\b(cancel|start over|nevermind|never mind|go back to search|stop checkout|quit checkout|abort)\b/i.test(msg)
  }, [])

  // Send message handler - optimistically add user message immediately
  const handleSendMessage = useCallback((message: string) => {
    // If user wants to cancel during checkout, cancel the pipeline
    if (isInCheckout && isCancelIntent(message)) {
      checkout.cancelCheckout()
      // Still send the message to Claude so it can respond naturally
    }

    // Optimistically add user message to session so it appears immediately
    const updatedSession: BookingSession = persistedSession
      ? {
          ...persistedSession,
          messages: [...persistedSession.messages, { role: 'user' as const, content: message, timestamp: Date.now() }],
        }
      : {
          sessionId: `session-${Date.now()}`,
          state: BookingState.INIT,
          messages: [{ role: 'user' as const, content: message, timestamp: Date.now() }],
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
      userId: auth?.user?.id ?? null,
      locale,
    })
  }, [sendMessage, persistedSession, persistedVehicles, auth?.user?.id, locale])

  // Reset handler
  const handleReset = useCallback(() => {
    resetStream()
    setPersistedSession(null)
    setPersistedVehicles(null)
    checkout.resetCheckout()
    localStorage.removeItem('itwhip-ai-session-id')
    localStorage.removeItem('itwhip-ai-vehicles')
  }, [resetStream, checkout])

  // Vehicle select handler - include vehicleId for reliable extraction
  const handleVehicleSelect = useCallback((vehicle: VehicleSummary) => {
    // Include vehicleId in message so Claude can extract it reliably
    // Format: "I'll take the 2024 Honda Accord [id:cm...]"
    handleSendMessage(`I'll take the ${vehicle.year} ${vehicle.make} ${vehicle.model} [id:${vehicle.id}]`)
  }, [handleSendMessage])

  // Action handlers — "Confirm & Book" now starts the in-chat checkout pipeline
  const handleConfirm = useCallback(() => {
    if (effectiveSummary) {
      checkout.initCheckout(effectiveSummary)
    }
  }, [effectiveSummary, checkout])

  const handleChangeVehicle = useCallback(() => {
    handleSendMessage('Show me other cars')
  }, [handleSendMessage])

  const handleExplore = useCallback(() => {
    setIsExploring(true)
  }, [])

  const handleReturnToCheckout = useCallback(() => {
    setIsExploring(false)
  }, [])

  const handleSwapVehicle = useCallback((vehicle: VehicleSummary) => {
    if (!effectiveSummary || !session?.startDate || !session?.endDate) return
    // Build a new summary for the swapped vehicle
    const numberOfDays = Math.max(1, Math.ceil(
      (new Date(session.endDate).getTime() - new Date(session.startDate).getTime()) / (1000 * 60 * 60 * 24)
    ))
    const subtotal = vehicle.dailyRate * numberOfDays
    const serviceFee = Math.round(subtotal * 0.15 * 100) / 100
    const taxable = subtotal + serviceFee
    const estimatedTax = Math.round(taxable * 0.084 * 100) / 100
    const newSummary: BookingSummaryType = {
      vehicle,
      location: session.location || 'Phoenix',
      startDate: session.startDate,
      endDate: session.endDate,
      startTime: session.startTime || '10:00',
      endTime: session.endTime || '10:00',
      numberOfDays,
      dailyRate: vehicle.dailyRate,
      subtotal,
      serviceFee,
      estimatedTax,
      estimatedTotal: Math.round((taxable + estimatedTax) * 100) / 100,
      depositAmount: vehicle.depositAmount,
    }
    checkout.swapVehicle(newSummary)
    setIsExploring(false)
  }, [effectiveSummary, session, checkout])

  const handleAction = useCallback(() => {
    if (action === 'NEEDS_LOGIN' && onNavigateToLogin) {
      onNavigateToLogin()
    } else if (action === 'HANDOFF_TO_PAYMENT' && effectiveSummary) {
      // Start in-chat checkout instead of navigating away
      checkout.initCheckout(effectiveSummary)
    }
  }, [action, effectiveSummary, onNavigateToLogin, checkout])

  const messages = session?.messages || []
  const hasMessages = messages.length > 0
  const isInCheckout = checkout.state.step !== CheckoutStep.IDLE && checkout.state.step !== CheckoutStep.CANCELLED && checkout.state.step !== CheckoutStep.FAILED

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
      className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden"
    >
      {/* Header — hidden when parent provides its own (e.g. /choe uses the real Header) */}
      {!hideHeader && (
        <ChatHeader onClassicSearch={onClassicSearch} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
      )}

      {/* Progress bar — only shows once Choé detects intent (past INIT state) */}
      <AnimatePresence>
        {session && session.state !== BookingState.INIT && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springTransition}
            className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden"
          >
            <ProgressBar state={session.state} checkoutStep={isInCheckout ? checkout.state.step : undefined} />
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

        {/* Vehicle cards - persist for scroll-back (hide during CONFIRMING/checkout) */}
        <AnimatePresence>
          {vehicles && vehicles.length > 0 && ((!isInCheckout && session?.state !== BookingState.CONFIRMING && session?.state !== BookingState.READY_FOR_PAYMENT) || isExploring) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
            >
              {isExploring && isInCheckout && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 dark:text-gray-300">You have an active checkout</span>
                  <button
                    onClick={handleReturnToCheckout}
                    className="text-xs text-primary font-semibold hover:text-primary/80"
                  >
                    Return to checkout
                  </button>
                </div>
              )}
              <VehicleResults
                vehicles={vehicles}
                onSelect={isExploring ? handleSwapVehicle : handleVehicleSelect}
                startDate={session?.startDate}
                endDate={session?.endDate}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking summary — hide once checkout starts */}
        <AnimatePresence>
          {effectiveSummary && (session?.state === BookingState.CONFIRMING || session?.state === BookingState.READY_FOR_PAYMENT) && !isInCheckout && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
            >
              <BookingSummary
                summary={effectiveSummary}
                onConfirm={handleConfirm}
                onChangeVehicle={handleChangeVehicle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================= */}
        {/* CHECKOUT PIPELINE CARDS (deterministic, no AI)                 */}
        {/* ============================================================= */}
        <AnimatePresence mode="wait">
          {isInCheckout && !isExploring && (
            <motion.div
              key={checkout.state.step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={springTransition}
              className="space-y-2"
            >
              {/* Price change warning */}
              {checkout.state.priceChanged && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Price updated: was ${checkout.state.priceChanged.oldRate}/day, now ${checkout.state.priceChanged.newRate}/day
                  </p>
                </div>
              )}

              {/* Compact summaries of completed steps */}
              {checkout.state.step !== CheckoutStep.INSURANCE &&
                checkout.state.step !== CheckoutStep.CONFIRMED &&
                checkout.state.selectedInsurance && (
                <InsuranceCard
                  options={checkout.state.insuranceOptions}
                  selected={checkout.state.selectedInsurance}
                  onSelect={checkout.selectInsurance}
                  onBack={checkout.state.step !== CheckoutStep.PAYMENT && checkout.state.step !== CheckoutStep.PROCESSING ? checkout.goBack : undefined}
                  compact
                />
              )}
              {checkout.state.step !== CheckoutStep.INSURANCE &&
                checkout.state.step !== CheckoutStep.DELIVERY &&
                checkout.state.step !== CheckoutStep.CONFIRMED &&
                checkout.state.selectedDelivery && (
                <DeliveryCard
                  options={checkout.state.deliveryOptions}
                  selected={checkout.state.selectedDelivery}
                  onSelect={checkout.selectDelivery}
                  onBack={checkout.state.step !== CheckoutStep.PAYMENT && checkout.state.step !== CheckoutStep.PROCESSING ? checkout.goBack : undefined}
                  compact
                />
              )}
              {checkout.state.step !== CheckoutStep.INSURANCE &&
                checkout.state.step !== CheckoutStep.DELIVERY &&
                checkout.state.step !== CheckoutStep.ADDONS &&
                checkout.state.step !== CheckoutStep.CONFIRMED && (
                <AddOnsCard
                  addOns={checkout.state.addOns}
                  numberOfDays={checkout.state.summary?.numberOfDays || 1}
                  onToggle={checkout.toggleAddOn}
                  onContinue={checkout.proceedToReview}
                  onBack={checkout.state.step !== CheckoutStep.PAYMENT && checkout.state.step !== CheckoutStep.PROCESSING ? checkout.goBack : undefined}
                  compact
                />
              )}

              {/* Active step card */}
              {checkout.state.step === CheckoutStep.INSURANCE && (
                <InsuranceCard
                  options={checkout.state.insuranceOptions}
                  selected={checkout.state.selectedInsurance}
                  onSelect={checkout.selectInsurance}
                  onExplore={handleExplore}
                />
              )}

              {checkout.state.step === CheckoutStep.DELIVERY && (
                <DeliveryCard
                  options={checkout.state.deliveryOptions}
                  selected={checkout.state.selectedDelivery}
                  onSelect={checkout.selectDelivery}
                  onExplore={handleExplore}
                />
              )}

              {checkout.state.step === CheckoutStep.ADDONS && (
                <AddOnsCard
                  addOns={checkout.state.addOns}
                  numberOfDays={checkout.state.summary?.numberOfDays || 1}
                  onToggle={checkout.toggleAddOn}
                  onContinue={checkout.proceedToReview}
                  onExplore={handleExplore}
                />
              )}

              {checkout.state.step === CheckoutStep.REVIEW && checkout.grandTotal && (
                <GrandTotalCard
                  grandTotal={checkout.grandTotal}
                  numberOfDays={checkout.state.summary?.numberOfDays || 1}
                  dailyRate={checkout.state.summary?.dailyRate || 0}
                  onPay={checkout.proceedToPayment}
                  onBack={checkout.goBack}
                  isLoading={checkout.isLoading}
                  onExplore={handleExplore}
                  guestBalances={checkout.state.guestBalances}
                  appliedCredits={checkout.state.appliedCredits}
                  appliedBonus={checkout.state.appliedBonus}
                  appliedDepositWallet={checkout.state.appliedDepositWallet}
                  onApplyCredits={checkout.applyCredits}
                  onApplyBonus={checkout.applyBonus}
                  onApplyDepositWallet={checkout.applyDepositWallet}
                  promoCode={checkout.state.promoCode}
                  promoDiscount={checkout.state.promoDiscount}
                  onApplyPromo={checkout.applyPromo}
                  savedCards={checkout.state.savedCards}
                  selectedPaymentMethod={checkout.state.selectedPaymentMethod}
                  onSelectPaymentMethod={checkout.selectPaymentMethod}
                  priceChanged={checkout.state.priceChanged}
                />
              )}

              {checkout.state.step === CheckoutStep.PAYMENT && checkout.state.clientSecret && checkout.grandTotal && (
                <PaymentCard
                  clientSecret={checkout.state.clientSecret}
                  total={checkout.grandTotal.total}
                  onSuccess={checkout.confirmBooking}
                  onBack={checkout.goBack}
                />
              )}

              {checkout.state.step === CheckoutStep.PROCESSING && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                  <div className="flex gap-1 justify-center mb-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('confirmingBooking')}</p>
                </div>
              )}

              {checkout.state.step === CheckoutStep.CONFIRMED && checkout.state.bookingConfirmation && (
                <ConfirmationCard
                  confirmation={checkout.state.bookingConfirmation}
                  onNewSearch={handleReset}
                />
              )}

              {checkout.state.step === CheckoutStep.FAILED && (
                <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                    {checkout.state.error || t('somethingWentWrong')}
                  </p>
                  <button
                    onClick={checkout.goBack}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    {t('goBack')}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons — hide during checkout */}
        <AnimatePresence>
          {action && !isInCheckout && (
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
      <div className="flex-shrink-0 bg-white dark:bg-gray-900">
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

function ChatHeader({ onClassicSearch, isDarkMode, onToggleTheme }: {
  onClassicSearch?: () => void
  isDarkMode?: boolean
  onToggleTheme?: () => void
}) {
  const t = useTranslations('ChoeAI')
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-4 pb-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="-mt-4">
        <Image src="/images/choe-logo.png" alt="Choé" width={300} height={87} className="h-[83px] w-auto" />
        <span className="text-[9px] text-gray-400 block -mt-7">{t('searchStudio')}</span>
      </div>
      <div className="flex items-center gap-2">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            type="button"
            aria-label={isDarkMode ? t('switchToLight') : t('switchToDark')}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? (
              <IoSunnyOutline className="w-5 h-5" />
            ) : (
              <IoMoonOutline className="w-5 h-5" />
            )}
          </button>
        )}
        {onClassicSearch && (
          <button
            onClick={onClassicSearch}
            type="button"
            className="text-[11px] font-semibold text-white
              px-3 py-1.5 rounded-md bg-gray-900 dark:bg-white dark:text-gray-900
              hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors shadow-sm"
          >
            {t('classicSearch')}
          </button>
        )}
      </div>
    </div>
  )
}

function WelcomeMessage() {
  const t = useTranslations('ChoeAI')
  return (
    <div className="text-center py-8">
      <Image src="/images/choe-logo.png" alt="Choé" width={64} height={64} className="mx-auto mb-3 rounded-lg" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {t('welcomeTitle')}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-3">
        {t('welcomeDescription')}
      </p>
      <a
        href="/help/choe"
        className="text-[10px] text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 underline underline-offset-2"
      >
        {t('learnAboutChoe')}
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
  const t = useTranslations('ChoeAI')
  const config: Record<string, { labelKey: string; descKey: string }> = {
    NEEDS_LOGIN: { labelKey: 'loginLabel', descKey: 'loginDescription' },
    NEEDS_VERIFICATION: { labelKey: 'verifyLabel', descKey: 'verifyDescription' },
    HIGH_RISK_REVIEW: { labelKey: 'uploadDocsLabel', descKey: 'uploadDocsDescription' },
    HANDOFF_TO_PAYMENT: { labelKey: 'paymentLabel', descKey: 'paymentDescription' },
  }

  const c = config[action]
  if (!c) return null

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{t(c.descKey as any)}</p>
      <button
        onClick={onAction}
        className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
      >
        {t(c.labelKey as any)}
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
  const t = useTranslations('ChoeAI')
  const toolLabels: Record<string, string> = {
    search_vehicles: t('toolSearching'),
    get_weather: t('toolWeather'),
    get_reviews: t('toolReviews'),
    select_vehicle: t('toolSelecting'),
    update_booking_details: t('toolUpdating'),
    calculator: t('toolCalculating'),
  }

  const currentTool = toolsInUse[0]
  const label = currentTool ? toolLabels[currentTool.name] || t('toolProcessing') : t('toolThinking')

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

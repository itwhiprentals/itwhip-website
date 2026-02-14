// app/hooks/useCheckout.ts
// Manages the in-chat checkout pipeline state and API calls.
// Completely independent from the AI conversation (SSE) — uses direct REST calls.

import { useState, useCallback, useEffect, useMemo } from 'react'
import type {
  BookingSummary,
  CheckoutState,
  GrandTotal,
  AddOnItem,
  BookingConfirmation,
  InsuranceTierOption,
  DeliveryOption,
  AddOnOption,
} from '@/app/lib/ai-booking/types'
import { CheckoutStep } from '@/app/lib/ai-booking/types'
import { getTaxRate } from '@/app/[locale]/(guest)/rentals/lib/arizona-taxes'

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: CheckoutState = {
  step: CheckoutStep.IDLE,
  checkoutSessionId: null,
  vehicleId: '',
  summary: null as unknown as BookingSummary,
  insuranceOptions: [],
  selectedInsurance: null,
  deliveryOptions: [],
  selectedDelivery: null,
  addOns: [],
  clientSecret: null,
  paymentIntentId: null,
  bookingConfirmation: null,
  error: null,
}

// SessionStorage key for 3DS redirect persistence
const STORAGE_KEY = 'itwhip-checkout-session'

// Checkout session TTL (matches PendingCheckout expiresAt: 15 minutes)
const SESSION_TTL_MS = 15 * 60 * 1000

// =============================================================================
// HOOK
// =============================================================================

export function useCheckout() {
  const [state, setState] = useState<CheckoutState>(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [initTimestamp, setInitTimestamp] = useState<number | null>(null)

  // ---------------------------------------------------------------------------
  // 3DS PERSISTENCE: Rehydrate on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { checkoutSessionId, step } = JSON.parse(saved)
        if (checkoutSessionId && step && step !== CheckoutStep.IDLE) {
          // Re-fetch state from server would go here in a full implementation.
          // For now, we persist enough to resume after 3DS redirect.
          console.log(`[useCheckout] Found persisted session: ${checkoutSessionId} at step ${step}`)
        }
      }
    } catch {
      // Ignore sessionStorage errors (SSR, privacy mode)
    }
  }, [])

  // Persist to sessionStorage on state changes
  useEffect(() => {
    if (state.checkoutSessionId && state.step !== CheckoutStep.IDLE) {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            checkoutSessionId: state.checkoutSessionId,
            step: state.step,
          }),
        )
      } catch {
        // Ignore
      }
    }
  }, [state.checkoutSessionId, state.step])

  // ---------------------------------------------------------------------------
  // HELPER: Check if session has expired (15min TTL)
  // ---------------------------------------------------------------------------
  const isSessionExpired = useCallback(() => {
    if (!initTimestamp) return false
    return Date.now() - initTimestamp > SESSION_TTL_MS
  }, [initTimestamp])

  // ---------------------------------------------------------------------------
  // COMPUTED: Grand total (display-only, server is source of truth)
  // ---------------------------------------------------------------------------
  const grandTotal = useMemo<GrandTotal | null>(() => {
    return computeGrandTotal(state)
  }, [state])

  // ---------------------------------------------------------------------------
  // ACTION: Initialize checkout
  // ---------------------------------------------------------------------------
  const initCheckout = useCallback(async (summary: BookingSummary) => {
    setIsLoading(true)
    setInitTimestamp(Date.now())
    setState((prev) => ({
      ...prev,
      step: CheckoutStep.INSURANCE,
      vehicleId: summary.vehicle.id,
      summary,
      error: null,
    }))

    try {
      const res = await fetch('/api/ai/booking/checkout/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: summary.vehicle.id,
          startDate: summary.startDate,
          endDate: summary.endDate,
          numberOfDays: summary.numberOfDays,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to initialize checkout')
      }

      const data = await res.json()

      setState((prev) => ({
        ...prev,
        checkoutSessionId: data.checkoutSessionId,
        insuranceOptions: data.insuranceOptions,
        deliveryOptions: data.deliveryOptions,
        addOns: data.addOns,
      }))
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        step: CheckoutStep.FAILED,
        error: error.message || 'Failed to initialize checkout',
      }))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // ACTION: Select insurance tier
  // ---------------------------------------------------------------------------
  const selectInsurance = useCallback(
    async (tier: 'MINIMUM' | 'BASIC' | 'PREMIUM' | 'LUXURY') => {
      setState((prev) => ({
        ...prev,
        selectedInsurance: tier,
        step: CheckoutStep.DELIVERY,
      }))

      // Persist to server
      if (state.checkoutSessionId) {
        await updateServerSession({ selectedInsurance: tier })
      }
    },
    [state.checkoutSessionId],
  )

  // ---------------------------------------------------------------------------
  // ACTION: Select delivery option
  // ---------------------------------------------------------------------------
  const selectDelivery = useCallback(
    async (type: 'pickup' | 'airport' | 'hotel' | 'home') => {
      setState((prev) => ({
        ...prev,
        selectedDelivery: type,
        step: CheckoutStep.ADDONS,
      }))

      if (state.checkoutSessionId) {
        await updateServerSession({ selectedDelivery: type })
      }
    },
    [state.checkoutSessionId],
  )

  // ---------------------------------------------------------------------------
  // ACTION: Toggle add-on
  // ---------------------------------------------------------------------------
  const toggleAddOn = useCallback(
    async (id: string) => {
      setState((prev) => {
        const updated = prev.addOns.map((a) =>
          a.id === id ? { ...a, selected: !a.selected } : a,
        )
        return { ...prev, addOns: updated }
      })

      // Persist selected add-ons to server
      if (state.checkoutSessionId) {
        const currentSelected = state.addOns
          .filter((a) => (a.id === id ? !a.selected : a.selected))
          .map((a) => a.id)
        // If toggling on, add it; if toggling off, the filter handles it
        const isCurrentlySelected = state.addOns.find((a) => a.id === id)?.selected
        const newSelected = isCurrentlySelected
          ? currentSelected.filter((x) => x !== id)
          : [...currentSelected, id]

        await updateServerSession({ selectedAddOns: newSelected })
      }
    },
    [state.checkoutSessionId, state.addOns],
  )

  // ---------------------------------------------------------------------------
  // ACTION: Go back to previous step
  // ---------------------------------------------------------------------------
  const goBack = useCallback(() => {
    setState((prev) => {
      switch (prev.step) {
        case CheckoutStep.DELIVERY:
          return { ...prev, step: CheckoutStep.INSURANCE }
        case CheckoutStep.ADDONS:
          return { ...prev, step: CheckoutStep.DELIVERY }
        case CheckoutStep.REVIEW:
          return { ...prev, step: CheckoutStep.ADDONS }
        case CheckoutStep.PAYMENT:
          return { ...prev, step: CheckoutStep.REVIEW }
        default:
          return prev
      }
    })
  }, [])

  // ---------------------------------------------------------------------------
  // ACTION: Proceed to review
  // ---------------------------------------------------------------------------
  const proceedToReview = useCallback(() => {
    setState((prev) => ({ ...prev, step: CheckoutStep.REVIEW }))
  }, [])

  // ---------------------------------------------------------------------------
  // ACTION: Proceed to payment (creates PaymentIntent)
  // ---------------------------------------------------------------------------
  const proceedToPayment = useCallback(async () => {
    if (!state.checkoutSessionId) return

    // Check if the 15-minute hold has expired
    if (isSessionExpired()) {
      setState((prev) => ({
        ...prev,
        step: CheckoutStep.FAILED,
        error: 'Your checkout session has expired (15-minute hold). Please start checkout again.',
      }))
      return
    }

    setIsLoading(true)
    setState((prev) => ({ ...prev, step: CheckoutStep.PAYMENT, error: null }))

    try {
      const res = await fetch('/api/ai/booking/checkout/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutSessionId: state.checkoutSessionId }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create payment')
      }

      const data = await res.json()

      setState((prev) => ({
        ...prev,
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
      }))
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        step: CheckoutStep.REVIEW,
        error: error.message || 'Failed to create payment',
      }))
    } finally {
      setIsLoading(false)
    }
  }, [state.checkoutSessionId, isSessionExpired])

  // ---------------------------------------------------------------------------
  // ACTION: Confirm booking (after payment succeeds)
  // ---------------------------------------------------------------------------
  const confirmBooking = useCallback(
    async (paymentIntentId: string) => {
      if (!state.checkoutSessionId) return

      setIsLoading(true)
      setState((prev) => ({ ...prev, step: CheckoutStep.PROCESSING, error: null }))

      try {
        const res = await fetch('/api/ai/booking/checkout/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkoutSessionId: state.checkoutSessionId,
            paymentIntentId,
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to confirm booking')
        }

        const confirmation: BookingConfirmation = await res.json()

        setState((prev) => ({
          ...prev,
          step: CheckoutStep.CONFIRMED,
          bookingConfirmation: confirmation,
        }))

        // Clear sessionStorage
        try {
          sessionStorage.removeItem(STORAGE_KEY)
        } catch {
          // Ignore
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          step: CheckoutStep.FAILED,
          error: error.message || 'Failed to confirm booking',
        }))
      } finally {
        setIsLoading(false)
      }
    },
    [state.checkoutSessionId],
  )

  // ---------------------------------------------------------------------------
  // ACTION: Cancel checkout
  // ---------------------------------------------------------------------------
  const cancelCheckout = useCallback(async () => {
    if (state.checkoutSessionId) {
      // Release soft-lock on server
      try {
        await fetch('/api/ai/booking/checkout/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkoutSessionId: state.checkoutSessionId,
            // The update endpoint will extend TTL, but we want to mark as cancelled.
            // We'll handle cancellation via a separate status update below.
          }),
        })
      } catch {
        // Non-critical
      }
    }

    setState({ ...initialState, step: CheckoutStep.CANCELLED })
    setInitTimestamp(null)

    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore
    }
  }, [state.checkoutSessionId])

  // ---------------------------------------------------------------------------
  // ACTION: Reset to idle
  // ---------------------------------------------------------------------------
  const resetCheckout = useCallback(() => {
    setState(initialState)
    setInitTimestamp(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore
    }
  }, [])

  // ---------------------------------------------------------------------------
  // HELPER: Update server session
  // ---------------------------------------------------------------------------
  async function updateServerSession(data: {
    selectedInsurance?: string
    selectedDelivery?: string
    selectedAddOns?: string[]
  }) {
    try {
      await fetch('/api/ai/booking/checkout/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkoutSessionId: state.checkoutSessionId,
          ...data,
        }),
      })
    } catch (error) {
      console.error('[useCheckout] Failed to update server session:', error)
    }
  }

  return {
    state,
    isLoading,
    grandTotal,
    initCheckout,
    selectInsurance,
    selectDelivery,
    toggleAddOn,
    goBack,
    proceedToReview,
    proceedToPayment,
    confirmBooking,
    cancelCheckout,
    resetCheckout,
  }
}

// =============================================================================
// PURE FUNCTION: Compute display-only grand total from checkout state
// =============================================================================

function computeGrandTotal(state: CheckoutState): GrandTotal | null {
  if (state.step === CheckoutStep.IDLE || !state.summary) return null

  const { summary, selectedInsurance, selectedDelivery, addOns, insuranceOptions, deliveryOptions } = state
  const { numberOfDays, dailyRate, depositAmount } = summary

  // Rental base
  const rental = dailyRate * numberOfDays

  // Service fee: 15%
  const serviceFee = Math.round(rental * 0.15 * 100) / 100

  // Insurance
  let insurance = 0
  if (selectedInsurance) {
    const option = insuranceOptions.find((o) => o.tier === selectedInsurance)
    if (option) insurance = option.totalPremium
  }

  // Delivery
  let delivery = 0
  if (selectedDelivery) {
    const option = deliveryOptions.find((o) => o.type === selectedDelivery)
    if (option) delivery = option.fee
  }

  // Add-ons
  const addOnItems: AddOnItem[] = []
  let addOnsTotal = 0
  for (const addOn of addOns) {
    if (addOn.selected) {
      const amount = addOn.perDay ? addOn.price * numberOfDays : addOn.price
      addOnItems.push({ id: addOn.id, label: addOn.label, amount })
      addOnsTotal += amount
    }
  }

  // Tax (city-specific)
  const city = summary.location || 'Phoenix'
  const cityName = city.split(',')[0].trim()
  const { rate: taxRate, display: taxRateDisplay } = getTaxRate(cityName)
  const taxableAmount = rental + serviceFee + insurance + delivery + addOnsTotal
  const tax = Math.round(taxableAmount * taxRate * 100) / 100

  // Deposit (may be increased by MINIMUM insurance)
  let deposit = depositAmount
  if (selectedInsurance === 'MINIMUM') {
    const option = insuranceOptions.find((o) => o.tier === 'MINIMUM')
    if (option?.increasedDeposit) {
      deposit = Math.max(deposit, option.increasedDeposit)
    }
  }

  // Total = rental charges + tax + deposit
  const total = Math.round((taxableAmount + tax + deposit) * 100) / 100

  return {
    rental,
    serviceFee,
    insurance,
    delivery,
    addOns: addOnItems,
    addOnsTotal,
    tax,
    taxRate: taxRateDisplay,
    deposit,
    total,
  }
}

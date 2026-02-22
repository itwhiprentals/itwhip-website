// app/hooks/useCheckout.ts
// Manages the in-chat checkout pipeline state and API calls.
// Completely independent from the AI conversation (SSE) — uses direct REST calls.

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import type {
  BookingSummary,
  CheckoutState,
  GrandTotal,
  AddOnItem,
  BookingConfirmation,
  GuestBalances,
  SavedCard,
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
  guestBalances: null,
  savedCards: [],
  appliedCredits: 0,
  appliedBonus: 0,
  appliedDepositWallet: 0,
  promoCode: null,
  promoDiscount: 0,
  selectedPaymentMethod: null,
  priceChanged: null,
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
  const [isRehydrating, setIsRehydrating] = useState(false)
  const hasRehydrated = useRef(false)

  // ---------------------------------------------------------------------------
  // AUTO-REHYDRATE: Restore checkout from server on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (hasRehydrated.current) return
    hasRehydrated.current = true

    async function rehydrate() {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY)
        if (!saved) return

        const { checkoutSessionId, step } = JSON.parse(saved)
        if (!checkoutSessionId || !step || step === CheckoutStep.IDLE) return

        console.log(`[useCheckout] Rehydrating session: ${checkoutSessionId} at step ${step}`)
        setIsRehydrating(true)

        const res = await fetch(`/api/ai/booking/checkout/resume?checkoutSessionId=${checkoutSessionId}`)
        if (!res.ok) {
          console.warn('[useCheckout] Resume failed, clearing session')
          sessionStorage.removeItem(STORAGE_KEY)
          return
        }

        const data = await res.json()

        // Map server checkoutStep string to CheckoutStep enum
        const stepMap: Record<string, CheckoutStep> = {
          INSURANCE: CheckoutStep.INSURANCE,
          DELIVERY: CheckoutStep.DELIVERY,
          ADDONS: CheckoutStep.ADDONS,
          REVIEW: CheckoutStep.REVIEW,
          PAYMENT: CheckoutStep.PAYMENT,
        }
        const resumedStep = stepMap[data.checkoutStep] || CheckoutStep.INSURANCE

        // Rebuild the summary from vehicle data
        const vehicle = data.vehicle
        if (!vehicle) {
          console.warn('[useCheckout] No vehicle in resume data')
          sessionStorage.removeItem(STORAGE_KEY)
          return
        }

        const startDate = new Date(data.startDate || data.vehicle?.startDate)
        const endDate = new Date(data.endDate || data.vehicle?.endDate)

        // Build a minimal BookingSummary for the UI
        const numberOfDays = Math.max(1, Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ))
        const dailyRate = vehicle.dailyRate
        const subtotal = dailyRate * numberOfDays
        const serviceFee = Math.round(subtotal * 0.15 * 100) / 100
        const taxable = subtotal + serviceFee
        const estimatedTax = Math.round(taxable * 0.084 * 100) / 100

        const resumedSummary: BookingSummary = {
          vehicle: {
            id: vehicle.id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            dailyRate: vehicle.dailyRate,
            photo: vehicle.photo || null,
            photos: [],
            rating: null,
            reviewCount: 0,
            trips: 0,
            distance: null,
            location: vehicle.city || 'Phoenix',
            instantBook: false,
            vehicleType: null,
            seats: null,
            transmission: null,
            depositAmount: data.deposit || vehicle.depositAmount || 0,
            insuranceBasicDaily: null,
            hostFirstName: null,
          },
          location: vehicle.city || 'Phoenix',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '10:00',
          numberOfDays,
          dailyRate,
          subtotal,
          serviceFee,
          estimatedTax,
          estimatedTotal: Math.round((taxable + estimatedTax) * 100) / 100,
          depositAmount: data.deposit || vehicle.depositAmount || 0,
        }

        // Restore add-on selected states
        const selectedAddOnIds = data.selectedAddOns || []
        const addOns = (data.addOns || []).map((a: any) => ({
          ...a,
          selected: selectedAddOnIds.includes(a.id),
        }))

        setState({
          step: resumedStep,
          checkoutSessionId: data.checkoutSessionId,
          vehicleId: vehicle.id,
          summary: resumedSummary,
          insuranceOptions: data.insuranceOptions || [],
          selectedInsurance: data.selectedInsurance || null,
          deliveryOptions: data.deliveryOptions || [],
          selectedDelivery: data.selectedDelivery || null,
          addOns,
          clientSecret: data.clientSecret || null,
          paymentIntentId: data.paymentIntentId || null,
          bookingConfirmation: null,
          error: null,
          guestBalances: data.guestBalances || null,
          savedCards: data.savedCards || [],
          appliedCredits: data.appliedCredits || 0,
          appliedBonus: data.appliedBonus || 0,
          appliedDepositWallet: data.appliedDepositWallet || 0,
          promoCode: data.promoCode || null,
          promoDiscount: data.promoDiscount || 0,
          selectedPaymentMethod: null,
          priceChanged: data.priceChanged || null,
        })

        setInitTimestamp(Date.now())
        console.log(`[useCheckout] Rehydrated to step ${resumedStep}`)
      } catch (err) {
        console.warn('[useCheckout] Rehydration failed:', err)
        sessionStorage.removeItem(STORAGE_KEY)
      } finally {
        setIsRehydrating(false)
      }
    }

    rehydrate()
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
        guestBalances: data.guestBalances || null,
        savedCards: data.savedCards || [],
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

      if (state.checkoutSessionId) {
        await updateServerSession({ selectedInsurance: tier, checkoutStep: 'DELIVERY' })
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
        await updateServerSession({ selectedDelivery: type, checkoutStep: 'ADDONS' })
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

      if (state.checkoutSessionId) {
        const currentSelected = state.addOns
          .filter((a) => (a.id === id ? !a.selected : a.selected))
          .map((a) => a.id)
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
        case CheckoutStep.FAILED:
          return { ...initialState }
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
    if (state.checkoutSessionId) {
      updateServerSession({ checkoutStep: 'REVIEW' })
    }
  }, [state.checkoutSessionId])

  // ---------------------------------------------------------------------------
  // ACTION: Apply credits
  // ---------------------------------------------------------------------------
  const applyCredits = useCallback(
    async (amount: number) => {
      const capped = Math.min(amount, state.guestBalances?.credits || 0)
      setState((prev) => ({ ...prev, appliedCredits: capped }))
      if (state.checkoutSessionId) {
        await updateServerSession({ appliedCredits: capped })
      }
    },
    [state.checkoutSessionId, state.guestBalances],
  )

  // ---------------------------------------------------------------------------
  // ACTION: Apply bonus
  // ---------------------------------------------------------------------------
  const applyBonus = useCallback(
    async (amount: number) => {
      const maxPercent = state.guestBalances?.maxBonusPercent || 0.25
      const gt = computeGrandTotal(state)
      const maxAllowed = gt ? Math.round(gt.subtotalBeforeDiscounts * maxPercent * 100) / 100 : 0
      const capped = Math.min(amount, state.guestBalances?.bonus || 0, maxAllowed)
      setState((prev) => ({ ...prev, appliedBonus: capped }))
      if (state.checkoutSessionId) {
        await updateServerSession({ appliedBonus: capped })
      }
    },
    [state.checkoutSessionId, state.guestBalances, state],
  )

  // ---------------------------------------------------------------------------
  // ACTION: Apply deposit wallet
  // ---------------------------------------------------------------------------
  const applyDepositWallet = useCallback(
    async (amount: number) => {
      const capped = Math.min(amount, state.guestBalances?.depositWallet || 0)
      setState((prev) => ({ ...prev, appliedDepositWallet: capped }))
      if (state.checkoutSessionId) {
        await updateServerSession({ appliedDepositWallet: capped })
      }
    },
    [state.checkoutSessionId, state.guestBalances],
  )

  // ---------------------------------------------------------------------------
  // ACTION: Apply promo code
  // ---------------------------------------------------------------------------
  const applyPromo = useCallback(
    async (code: string) => {
      if (!state.checkoutSessionId) return

      try {
        const res = await fetch('/api/promo/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, checkoutSessionId: state.checkoutSessionId }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Invalid promo code')
        }

        const data = await res.json()
        setState((prev) => ({
          ...prev,
          promoCode: code,
          promoDiscount: data.discount || 0,
        }))
        await updateServerSession({ promoCode: code, promoDiscount: data.discount || 0 })
      } catch (error: any) {
        setState((prev) => ({ ...prev, error: error.message }))
      }
    },
    [state.checkoutSessionId],
  )

  // ---------------------------------------------------------------------------
  // ACTION: Select saved payment method
  // ---------------------------------------------------------------------------
  const selectPaymentMethod = useCallback(
    (pmId: string | null) => {
      setState((prev) => ({ ...prev, selectedPaymentMethod: pmId }))
      if (state.checkoutSessionId && pmId) {
        updateServerSession({ selectedPaymentMethod: pmId })
      }
    },
    [state.checkoutSessionId],
  )

  // ---------------------------------------------------------------------------
  // ACTION: Proceed to payment (creates PaymentIntent)
  // ---------------------------------------------------------------------------
  const proceedToPayment = useCallback(async () => {
    if (!state.checkoutSessionId) return

    if (isSessionExpired()) {
      setState((prev) => ({
        ...prev,
        step: CheckoutStep.FAILED,
        error: 'Your checkout session has expired (15-minute hold). Please start checkout again.',
      }))
      return
    }

    setIsLoading(true)
    setState((prev) => ({ ...prev, error: null }))

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

      // -----------------------------------------------------------------
      // SAVED CARD: Payment already authorized server-side
      // -----------------------------------------------------------------
      if (data.confirmed) {
        console.log('[useCheckout] Saved card authorized — confirming booking')
        setState((prev) => ({
          ...prev,
          step: CheckoutStep.PROCESSING,
          paymentIntentId: data.paymentIntentId,
        }))

        // Confirm booking directly (same as confirmBooking callback)
        const confirmRes = await fetch('/api/ai/booking/checkout/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkoutSessionId: state.checkoutSessionId,
            paymentIntentId: data.paymentIntentId,
          }),
        })

        if (!confirmRes.ok) {
          const err = await confirmRes.json()
          throw new Error(err.error || 'Failed to confirm booking')
        }

        const confirmation = await confirmRes.json()
        setState((prev) => ({
          ...prev,
          step: CheckoutStep.CONFIRMED,
          bookingConfirmation: confirmation,
        }))
        try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
        return
      }

      // -----------------------------------------------------------------
      // SAVED CARD + 3DS: Client must handle authentication challenge
      // -----------------------------------------------------------------
      if (data.requiresAction) {
        console.log('[useCheckout] 3DS required for saved card — launching challenge')
        setState((prev) => ({ ...prev, step: CheckoutStep.PROCESSING }))

        const stripeInstance = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        if (!stripeInstance) throw new Error('Failed to load Stripe')

        const { error: actionError, paymentIntent } = await stripeInstance.handleNextAction({
          clientSecret: data.clientSecret,
        })

        if (actionError) {
          throw new Error(actionError.message || 'Card verification failed. Please try again.')
        }

        if (paymentIntent?.status === 'requires_capture') {
          // 3DS passed — confirm booking
          console.log('[useCheckout] 3DS passed — confirming booking')
          const confirmRes = await fetch('/api/ai/booking/checkout/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              checkoutSessionId: state.checkoutSessionId,
              paymentIntentId: paymentIntent.id,
            }),
          })

          if (!confirmRes.ok) {
            const err = await confirmRes.json()
            throw new Error(err.error || 'Failed to confirm booking')
          }

          const confirmation = await confirmRes.json()
          setState((prev) => ({
            ...prev,
            step: CheckoutStep.CONFIRMED,
            bookingConfirmation: confirmation,
            paymentIntentId: paymentIntent.id,
          }))
          try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
          return
        }

        // Unexpected status after 3DS
        throw new Error('Card verification incomplete. Please try a different card.')
      }

      // -----------------------------------------------------------------
      // NEW CARD: Show PaymentElement UI
      // -----------------------------------------------------------------
      setState((prev) => ({
        ...prev,
        step: CheckoutStep.PAYMENT,
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
  // ACTION: Swap vehicle mid-checkout
  // ---------------------------------------------------------------------------
  const swapVehicle = useCallback(
    async (newSummary: BookingSummary) => {
      if (!state.checkoutSessionId) return

      setIsLoading(true)
      try {
        const res = await fetch('/api/ai/booking/checkout/swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkoutSessionId: state.checkoutSessionId,
            vehicleId: newSummary.vehicle.id,
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to swap vehicle')
        }

        const data = await res.json()

        setState((prev) => ({
          ...prev,
          vehicleId: newSummary.vehicle.id,
          summary: newSummary,
          insuranceOptions: data.insuranceOptions,
          deliveryOptions: data.deliveryOptions,
          selectedInsurance: data.selectedInsurance || null,
          selectedDelivery: data.selectedDelivery || null,
          clientSecret: null,
          paymentIntentId: null,
          step: CheckoutStep.INSURANCE,
          error: null,
        }))
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Failed to swap vehicle',
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
      try {
        await fetch('/api/ai/booking/checkout/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutSessionId: state.checkoutSessionId }),
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
    checkoutStep?: string
    appliedCredits?: number
    appliedBonus?: number
    appliedDepositWallet?: number
    promoCode?: string
    promoDiscount?: number
    selectedPaymentMethod?: string
  }) {
    try {
      const res = await fetch('/api/ai/booking/checkout/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkoutSessionId: state.checkoutSessionId,
          ...data,
        }),
      })
      if (res.ok) {
        const result = await res.json()
        // Handle price change detection from update response
        if (result.priceChanged) {
          setState((prev) => ({ ...prev, priceChanged: result.priceChanged }))
        }
      }
    } catch (error) {
      console.error('[useCheckout] Failed to update server session:', error)
    }
  }

  return {
    state,
    isLoading,
    isRehydrating,
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
    applyCredits,
    applyBonus,
    applyDepositWallet,
    applyPromo,
    selectPaymentMethod,
    swapVehicle,
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

  // Subtotal before discounts
  const subtotalBeforeDiscounts = Math.round((taxableAmount + tax + deposit) * 100) / 100

  // Applied discounts
  const { appliedCredits, appliedBonus, promoDiscount, appliedDepositWallet } = state
  const rentalDiscount = Math.min(appliedCredits + appliedBonus + promoDiscount, taxableAmount + tax)
  const depositDiscount = Math.min(appliedDepositWallet, deposit)
  const totalDiscount = Math.round((rentalDiscount + depositDiscount) * 100) / 100

  // Total after discounts — enforce $1.00 minimum (Stripe rejects $0 charges)
  const total = Math.max(Math.round((subtotalBeforeDiscounts - totalDiscount) * 100) / 100, 1.00)

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
    appliedCredits,
    appliedBonus,
    promoDiscount,
    appliedDepositWallet,
    totalDiscount,
    subtotalBeforeDiscounts,
    total,
  }
}

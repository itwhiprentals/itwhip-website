// app/partner/requests/[id]/components/ConfirmSendSheet.tsx
// Confirm & Send Agreement bottomsheet — opens at CAR_ASSIGNED state
// Screen 1: Agreement Selection → Screen 2: Progress Animation → Screen 3: Success + Redirect

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import BottomSheet from '@/app/components/BottomSheet'
import AgreementPreferenceStep from './AgreementPreferenceStep'
import ConfirmProgress, { type StepStatus } from './ConfirmProgress'
import ConfirmSuccess from './ConfirmSuccess'

type AgreementPref = 'ITWHIP' | 'OWN' | 'BOTH'
type Screen = 'select' | 'progress' | 'success'

interface ConfirmSendSheetProps {
  isOpen: boolean
  onClose: () => void
  requestId: string
  guestName: string
  guestEmail: string
  hostAgreementPreference: 'ITWHIP' | 'OWN' | 'BOTH'
  hostAgreementUrl?: string | null
  existingAgreement?: {
    url?: string
    fileName?: string
    validationScore?: number
    validationSummary?: string
  }
  requestData?: {
    id: string
    guestName: string | null
    offeredRate: number | null
    startDate: string | null
    endDate: string | null
    durationDays: number | null
    pickupCity: string | null
    pickupState: string | null
    totalAmount: number | null
    hostEarnings: number | null
  }
  hostName?: string
  hostEmail?: string
}

export default function ConfirmSendSheet({
  isOpen,
  onClose,
  requestId,
  guestName,
  guestEmail,
  hostAgreementPreference,
  hostAgreementUrl,
  existingAgreement,
  requestData,
  hostName,
  hostEmail,
}: ConfirmSendSheetProps) {
  const t = useTranslations('PartnerRequestDetail')
  const router = useRouter()

  const [screen, setScreen] = useState<Screen>('select')
  const [agreementType, setAgreementType] = useState<AgreementPref>(hostAgreementPreference)

  // Progress + API state
  const [currentAnimStep, setCurrentAnimStep] = useState(0)
  const [apiComplete, setApiComplete] = useState(false)
  const [apiResult, setApiResult] = useState<{ id: string; bookingCode: string } | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const animIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 5 host-friendly progress steps
  const steps = useConfirmSteps(guestName, guestEmail)
  const stepCount = steps.length

  // Derive per-step status for rendering
  const stepStatuses: StepStatus[] = steps.map((step, i) => ({
    loading: step.loading,
    complete: step.complete,
    status: apiError && i === currentAnimStep
      ? 'error'
      : i < currentAnimStep ? 'done'
      : i === currentAnimStep ? 'active'
      : 'pending',
  }))

  // ── Lifecycle ──────────────────────────────────────

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setScreen('select')
      setCurrentAnimStep(0)
      setApiComplete(false)
      setApiResult(null)
      setApiError(null)
      setAgreementType(hostAgreementPreference)
    }
    return () => clearAnimInterval()
  }, [isOpen, hostAgreementPreference])

  // Animation done + API done → success
  useEffect(() => {
    if (apiComplete && currentAnimStep >= stepCount - 1) {
      const timer = setTimeout(() => setScreen('success'), 500)
      return () => clearTimeout(timer)
    }
  }, [apiComplete, currentAnimStep, stepCount])

  // API finishes early → speed up remaining steps
  useEffect(() => {
    if (!apiComplete || currentAnimStep >= stepCount - 1) return
    clearAnimInterval()
    const speedUp = setInterval(() => {
      setCurrentAnimStep(prev => {
        if (prev >= stepCount - 1) { clearInterval(speedUp); return prev }
        return prev + 1
      })
    }, 200)
    return () => clearInterval(speedUp)
  }, [apiComplete, currentAnimStep, stepCount])

  // Auto-redirect 2s after success
  useEffect(() => {
    if (screen !== 'success' || !apiResult) return
    const timer = setTimeout(() => router.push(`/partner/bookings/${apiResult.id}`), 2000)
    return () => clearTimeout(timer)
  }, [screen, apiResult, router])

  // ── Helpers ────────────────────────────────────────

  function clearAnimInterval() {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current)
      animIntervalRef.current = null
    }
  }

  const handleSend = useCallback(async () => {
    setScreen('progress')
    setCurrentAnimStep(0)
    setApiComplete(false)
    setApiResult(null)
    setApiError(null)

    // Stagger animation at 700ms per step
    animIntervalRef.current = setInterval(() => {
      setCurrentAnimStep(prev => {
        if (prev >= stepCount - 1) { clearAnimInterval(); return prev }
        return prev + 1
      })
    }, 700)

    // Single API call in parallel
    try {
      const res = await fetch('/api/partner/bookings/create-from-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          agreementType,
          hostAgreementUrl: agreementType !== 'ITWHIP' ? hostAgreementUrl : null,
        }),
      })
      const data = await res.json()

      if (data.success && data.booking) {
        setApiResult(data.booking)
        setApiComplete(true)
      } else {
        throw new Error(
          data.error === 'BOOKING_EXPIRED' ? t('csBookingExpired') : data.error || t('csGenericError')
        )
      }
    } catch (err: any) {
      setApiError(err.message || t('csGenericError'))
      clearAnimInterval()
    }
  }, [requestId, agreementType, hostAgreementUrl, stepCount, t])

  // ── Title per screen ──────────────────────────────

  const title = screen === 'select'
    ? t('csSendAgreementTo', { guest: guestName })
    : screen === 'progress'
      ? t('csProgressTitle')
      : t('csSuccessTitle')

  // ── Render ─────────────────────────────────────────

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={screen === 'progress' ? () => {} : onClose}
      title={title}
      size="large"
      showDragHandle={screen !== 'progress'}
      footer={undefined}
    >
      {screen === 'select' && (
        <div className="space-y-4">
          <AgreementPreferenceStep
            onComplete={() => {}}
            existingAgreement={existingAgreement}
            requestData={requestData}
            hostName={hostName}
            hostEmail={hostEmail}
            hideButton
            initialPreference={agreementType}
            onSelectionChange={(pref) => setAgreementType(pref)}
          />

          <button
            onClick={handleSend}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            {t('csSendToGuest', { guest: guestName })}
          </button>

          <button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {t('cancel')}
          </button>
        </div>
      )}

      {screen === 'progress' && (
        <ConfirmProgress
          steps={stepStatuses}
          error={apiError}
          onRetry={handleSend}
          onCancel={onClose}
        />
      )}

      {screen === 'success' && apiResult && (
        <ConfirmSuccess
          bookingCode={apiResult.bookingCode}
          bookingId={apiResult.id}
          guestName={guestName}
          guestEmail={guestEmail}
        />
      )}
    </BottomSheet>
  )
}

// ── Hook: step definitions ────────────────────────────

function useConfirmSteps(guestName: string, guestEmail: string) {
  const t = useTranslations('PartnerRequestDetail')
  return [
    { loading: t('csStep1Loading'), complete: t('csStep1Done') },
    { loading: t('csStep2Loading'), complete: t('csStep2Done') },
    { loading: t('csStep3Loading', { guest: guestName }), complete: t('csStep3Done', { email: guestEmail }) },
    { loading: t('csStep4Loading'), complete: t('csStep4Done') },
    { loading: t('csStep5Loading'), complete: t('csStep5Done') },
  ]
}

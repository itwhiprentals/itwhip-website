// app/partner/bookings/[id]/hooks/useCommunication.ts
// Consolidates communication modal state and send logic (pickup/key instructions)

import { useState } from 'react'

type CommType = 'pickup_instructions' | 'keys_instructions'

interface UseCommunicationProps {
  bookingId: string | null
  showToast: (type: 'success' | 'error', message: string) => void
  t: (key: string) => string
}

export function useCommunication({ bookingId, showToast, t }: UseCommunicationProps) {
  const [showCommModal, setShowCommModal] = useState<CommType | null>(null)
  const [commMessage, setCommMessage] = useState('')
  const [sendingComm, setSendingComm] = useState(false)
  const [commSendCounts, setCommSendCounts] = useState<Record<string, number>>({})

  const sendCommunication = async () => {
    if (!bookingId || !showCommModal || !commMessage.trim()) return

    setSendingComm(true)
    try {
      const response = await fetch(`/api/partner/bookings/${bookingId}/communicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: showCommModal, message: commMessage.trim() })
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', data.message)
        setCommSendCounts(prev => ({
          ...prev,
          [showCommModal]: (prev[showCommModal] || 0) + 1
        }))
        setShowCommModal(null)
        setCommMessage('')
      } else {
        showToast('error', data.error || t('bdFailedSend'))
      }
    } catch {
      showToast('error', t('bdFailedSendCommunication'))
    } finally {
      setSendingComm(false)
    }
  }

  return {
    showCommModal, setShowCommModal,
    commMessage, setCommMessage,
    sendingComm,
    commSendCounts, setCommSendCounts,
    sendCommunication,
  }
}

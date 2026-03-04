// app/partner/bookings/[id]/hooks/useBookingMessages.ts
// Consolidates message state, send logic, auto-scroll, and read-status marking

import { useState, useEffect, useRef } from 'react'

interface UseBookingMessagesProps {
  bookingId: string | null
  showToast: (type: 'success' | 'error', message: string) => void
}

export function useBookingMessages({ bookingId, showToast }: UseBookingMessagesProps) {
  const [bookingMessages, setBookingMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [bookingMessages])

  // Mark as read on mount if unread host-facing messages exist
  useEffect(() => {
    if (bookingId && bookingMessages.some((m: any) => !m.isRead && m.senderType !== 'host')) {
      fetch(`/api/partner/messages/${bookingId}/read`, { method: 'POST' }).catch(() => {})
    }
  }, [bookingId, bookingMessages.length])

  const sendBookingMessage = async () => {
    if (!bookingId || !newMessage.trim() || sendingMessage) return
    setSendingMessage(true)
    try {
      const response = await fetch('/api/partner/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, message: newMessage.trim() })
      })
      const data = await response.json()
      if (data.success && data.message) {
        setBookingMessages(prev => [...prev, data.message])
        setNewMessage('')
      } else {
        showToast('error', data.error || 'Failed to send message')
      }
    } catch {
      showToast('error', 'Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return {
    bookingMessages, setBookingMessages,
    newMessage, setNewMessage,
    sendingMessage,
    messagesContainerRef,
    sendBookingMessage,
    formatMessageTime,
  }
}

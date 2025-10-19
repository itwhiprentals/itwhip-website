// app/(guest)/dashboard/components/AppealModal.tsx
'use client'

import { useState } from 'react'

interface AppealModalProps {
  isOpen: boolean
  onClose: () => void
  guestId: string
  onSuccess: () => void
}

export default function AppealModal({ isOpen, onClose, guestId, onSuccess }: AppealModalProps) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for your appeal')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/guest/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim()
        })
      })

      if (response.ok) {
        alert('Appeal submitted successfully. Our team will review it within 24-48 hours.')
        setReason('')
        onSuccess()
        onClose()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to submit appeal')
      }
    } catch (error) {
      console.error('Appeal submission error:', error)
      alert('Failed to submit appeal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Submit Appeal
        </h2>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Please explain why you believe this action should be reconsidered. Our team will review your appeal within 24-48 hours.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white mb-4"
          rows={6}
          placeholder="Explain your situation and why you're appealing..."
          disabled={submitting}
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !reason.trim()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Appeal'}
          </button>
        </div>
      </div>
    </div>
  )
}
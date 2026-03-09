'use client'

import { useState } from 'react'

interface ComposeModalProps {
  open: boolean
  onClose: () => void
  initialPhone?: string
  onSent: () => void
}

export function ComposeModal({ open, onClose, initialPhone = '', onSent }: ComposeModalProps) {
  const [phone, setPhone] = useState(initialPhone)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // Reset when initialPhone changes (modal re-opens with new phone)
  if (open && initialPhone && phone !== initialPhone) {
    setPhone(initialPhone)
    setBody('')
    setResult(null)
  }

  if (!open) return null

  const segments = Math.max(1, Math.ceil(body.length / 160))

  const handleSend = async () => {
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/fleet/api/communications?key=phoenix-fleet-2847', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, body }),
      })
      const data = await res.json()
      if (data.success) {
        setResult({ success: true, message: 'SMS sent successfully!' })
        setBody('')
        onSent()
      } else {
        setResult({ success: false, message: data.error || 'Failed to send' })
      }
    } catch {
      setResult({ success: false, message: 'Network error' })
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setPhone('')
    setBody('')
    setResult(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-xl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Send SMS</h2>
            <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg">
              &times;
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(602) 555-1234"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={1600}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
              />
              <div className="flex justify-between mt-1 text-xs">
                <span className={body.length > 480 ? 'text-red-500' : body.length > 160 ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'}>
                  {body.length} / 1,600 chars
                </span>
                <span className="text-gray-400 dark:text-gray-500">
                  {segments} segment{segments !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {result && (
              <div className={`p-3 rounded-lg text-sm ${
                result.success
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {result.message}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !phone.trim() || !body.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send SMS'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

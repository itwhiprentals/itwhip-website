// Shared utilities for communications components

export function formatDate(d: string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

export function formatPhone(p: string) {
  if (p.length === 12 && p.startsWith('+1')) {
    return `(${p.slice(2, 5)}) ${p.slice(5, 8)}-${p.slice(8)}`
  }
  return p
}

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  queued: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  received: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  ringing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  voicemail: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'no-answer': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export function statusBadge(status: string) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
      {status}
    </span>
  )
}

const TYPE_COLORS: Record<string, string> = {
  BOOKING_CONFIRMED: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  BOOKING_RECEIVED: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  BOOKING_AUTO_COMPLETED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  BOOKING_ON_HOLD: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  BOOKING_HOLD_RELEASED: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  TRIP_STARTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  TRIP_ENDED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  BOOKING_CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  GUEST_APPROACHING: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  CLAIM_FILED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  MISSED_MESSAGE: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  EMERGENCY: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200',
  INBOUND: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  SYSTEM: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
  IVR_SMS: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
}

export function typeBadge(type: string) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
      {type.replace(/_/g, ' ')}
    </span>
  )
}

// Filter options
export const SMS_TYPES = [
  '', 'BOOKING_RECEIVED', 'BOOKING_CONFIRMED', 'BOOKING_AUTO_COMPLETED',
  'BOOKING_ON_HOLD', 'BOOKING_HOLD_RELEASED',
  'TRIP_STARTED', 'TRIP_ENDED', 'BOOKING_CANCELLED',
  'GUEST_APPROACHING', 'CLAIM_FILED', 'MISSED_MESSAGE',
  'EMERGENCY', 'INBOUND', 'IVR_SMS', 'SYSTEM',
]
export const SMS_STATUSES = ['', 'queued', 'sent', 'delivered', 'failed', 'received']
export const CALL_STATUSES = ['', 'ringing', 'in-progress', 'completed', 'voicemail', 'no-answer', 'failed']

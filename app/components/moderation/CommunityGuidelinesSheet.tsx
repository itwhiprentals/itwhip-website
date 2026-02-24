// Community Guidelines bottom sheet — lightweight overlay, no full page needed
// When canAcknowledge is true, shows a footer to dismiss first warning
'use client'

import { useState } from 'react'

interface CommunityGuidelinesSheetProps {
  isOpen: boolean
  onClose: () => void
  canAcknowledge?: boolean
  onAcknowledge?: () => void
  guestId?: string
}

// ---------- Icons ----------

const Shield = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

const CarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0H3m10 0h2m4 0a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0016.586 7H13" />
  </svg>
)

const DocIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const ChatIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ScaleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
)

const CreditCardIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

// ---------- Static data ----------

const guidelines: { title: string; icon: React.FC<{ className?: string }>; items: string[] }[] = [
  {
    title: 'Vehicle Care & Respect',
    icon: CarIcon,
    items: [
      'Return vehicles in the same condition you received them',
      'Report any damage or issues immediately — honesty is always the best policy',
      'No smoking in any vehicle unless explicitly permitted by the host',
      'Keep the vehicle clean and free of trash',
    ],
  },
  {
    title: 'Honest Documentation',
    icon: DocIcon,
    items: [
      'Provide valid, unaltered government-issued ID and driver\'s license',
      'Keep your insurance information current and accurate',
      'Never submit forged, expired, or tampered documents',
      'Update your profile if any personal details change',
    ],
  },
  {
    title: 'Timely Communication',
    icon: ChatIcon,
    items: [
      'Respond to host messages promptly',
      'Notify the host if you\'re running late for pickup or return',
      'Communicate any trip changes as soon as possible',
      'Be respectful and professional in all interactions',
    ],
  },
  {
    title: 'Pickup & Return',
    icon: ClockIcon,
    items: [
      'Arrive on time for scheduled pickups',
      'Return vehicles by the agreed-upon time — late returns affect other guests',
      'Follow the host\'s specific instructions for key handoff',
      'Complete the return checklist and take photos of the vehicle',
    ],
  },
  {
    title: 'Safety & Legal',
    icon: ScaleIcon,
    items: [
      'Only authorized drivers listed on the booking may operate the vehicle',
      'Follow all local traffic laws and regulations',
      'Never drive under the influence of drugs or alcohol',
      'Use the vehicle only for lawful purposes',
    ],
  },
  {
    title: 'Payment & Deposits',
    icon: CreditCardIcon,
    items: [
      'Ensure your payment method is valid and has sufficient funds',
      'Security deposits are refunded after a successful trip inspection',
      'Tolls, tickets, and fines incurred during your trip are your responsibility',
      'Dispute charges through proper channels — do not issue chargebacks without contacting us first',
    ],
  },
]

const consequences = [
  { level: 'Warning', desc: 'First-time or minor violations result in an account warning with possible booking restrictions.', color: 'yellow' },
  { level: 'Temporary Suspension', desc: 'Repeated violations or serious issues may lead to a temporary account suspension.', color: 'orange' },
  { level: 'Permanent Ban', desc: 'Severe violations (fraud, safety threats, illegal activity) result in permanent removal from the platform.', color: 'red' },
]

// ---------- Acknowledge footer component ----------

function GuidelinesAcknowledgeFooter({
  onAcknowledge,
}: {
  onAcknowledge: () => void
}) {
  const [checked, setChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDismiss = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/guest/moderation/acknowledge', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to dismiss warning')
      }
      onAcknowledge()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
      <label className="flex items-start gap-2.5 cursor-pointer mb-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <span className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          I have read and understood the Community Guidelines and agree to follow them going forward.
        </span>
      </label>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mb-2">{error}</p>
      )}

      <button
        onClick={handleDismiss}
        disabled={!checked || submitting}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
          checked && !submitting
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
        }`}
      >
        {submitting ? (
          <>
            <Spinner className="w-4 h-4" />
            Dismissing...
          </>
        ) : (
          'Dismiss Warning'
        )}
      </button>
    </div>
  )
}

// ---------- Main sheet ----------

export default function CommunityGuidelinesSheet({
  isOpen,
  onClose,
  canAcknowledge,
  onAcknowledge,
  guestId,
}: CommunityGuidelinesSheetProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 z-50 flex md:items-center md:justify-center pointer-events-none">
        <div className="bg-white dark:bg-gray-800 w-full md:max-w-2xl md:mx-auto rounded-t-2xl md:rounded-2xl shadow-2xl pointer-events-auto max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Community Guidelines</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 p-4 space-y-4">

            <p className="text-xs text-gray-600 dark:text-gray-400">
              We're building a trusted community of guests and hosts. These guidelines help keep everyone safe and ensure a great experience for all.
            </p>

            {/* Guidelines sections */}
            {guidelines.map((section) => (
              <div key={section.title} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <section.icon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  {section.title}
                </h3>
                <ul className="space-y-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Consequences */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                What Happens If Guidelines Are Violated?
              </h3>
              <div className="space-y-2">
                {consequences.map((c) => (
                  <div key={c.level} className={`flex items-start gap-2 p-2 rounded-lg ${
                    c.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                    c.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                    'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                      c.color === 'yellow' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                      c.color === 'orange' ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200' :
                      'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                    }`}>
                      {c.level}
                    </span>
                    <p className={`text-xs ${
                      c.color === 'yellow' ? 'text-yellow-800 dark:text-yellow-300' :
                      c.color === 'orange' ? 'text-orange-800 dark:text-orange-300' :
                      'text-red-800 dark:text-red-300'
                    }`}>
                      {c.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Appeal note */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Received a warning?</strong> You can always appeal from your dashboard. We review all appeals within 24-48 hours and aim to be fair and transparent in every decision.
              </p>
            </div>

            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center pb-2">
              Last updated: February 2026
            </p>
          </div>

          {/* Acknowledge footer — only for first warning dismissal */}
          {canAcknowledge && onAcknowledge && (
            <GuidelinesAcknowledgeFooter onAcknowledge={onAcknowledge} />
          )}
        </div>
      </div>
    </>
  )
}

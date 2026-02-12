// app/fleet/banking/audit/components.tsx
// Expandable row/card components for the Payment Intents Audit page

'use client'

import { ReactNode } from 'react'
import {
  IoChevronDownOutline,
  IoOpenOutline,
  IoCardOutline,
  IoTimeOutline,
} from 'react-icons/io5'

interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  captureMethod: string
  created: string
  canceledAt: string | null
  cancellationReason: string | null
  description: string | null
  customerId: string | null
  paymentMethod: {
    id: string
    brand: string | null
    last4: string | null
  } | null
  risk: {
    score: number
    level: string
    rule: string | null
    action: string | null
  } | null
  metadata: Record<string, string>
  statusLabel: string
  isActionable: boolean
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

const formatFullDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' })

const METADATA_LABELS: Record<string, string> = {
  guestEmail: 'Guest Email',
  carId: 'Car ID',
  days: 'Rental Days',
  subtotal: 'Subtotal',
  serviceFee: 'Service Fee',
  taxes: 'Taxes',
  insurance: 'Insurance Tier',
  deposit: 'Deposit',
  depositAmount: 'Deposit Amount',
  rentalAmount: 'Rental Amount',
  serverTotal: 'Server Total (cents)',
  bonusApplied: 'Bonus Applied',
  creditsApplied: 'Credits Applied',
  type: 'Type',
  bookingId: 'Booking ID',
}

interface IntentComponentProps {
  pi: PaymentIntent
  expanded: boolean
  onToggle: () => void
  statusBadge: (status: string, label: string) => ReactNode
  cardBadge: (pm: PaymentIntent['paymentMethod']) => ReactNode
  riskBadge: (risk: PaymentIntent['risk']) => ReactNode
}

// Shared expanded detail panel
function IntentDetail({ pi }: { pi: PaymentIntent }) {
  const metaKeys = Object.keys(pi.metadata || {})
  const dollarFields = ['subtotal', 'serviceFee', 'taxes', 'deposit', 'depositAmount', 'rentalAmount', 'bonusApplied', 'creditsApplied']

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 space-y-4">
      {/* Top row: PI ID + Stripe link + timestamps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Payment Intent ID</div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-gray-800 dark:text-gray-200 break-all">{pi.id}</span>
            <a
              href={`https://dashboard.stripe.com/payments/${pi.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-purple-600 hover:text-purple-700 dark:text-purple-400"
              title="View in Stripe Dashboard"
            >
              <IoOpenOutline className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Timestamps</div>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <IoTimeOutline className="w-3.5 h-3.5 text-gray-400" />
              <span>Created: {formatFullDate(pi.created)}</span>
            </div>
            {pi.canceledAt && (
              <div className="flex items-center gap-1.5">
                <IoTimeOutline className="w-3.5 h-3.5 text-red-400" />
                <span>Canceled: {formatFullDate(pi.canceledAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Capture Method</div>
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{pi.captureMethod}</div>
        </div>
        {pi.customerId && (
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Customer ID</div>
            <a
              href={`https://dashboard.stripe.com/customers/${pi.customerId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-purple-600 dark:text-purple-400 hover:underline"
            >
              {pi.customerId.slice(0, 18)}...
            </a>
          </div>
        )}
        {pi.paymentMethod && (
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Payment Method</div>
            <div className="flex items-center gap-1 text-sm text-gray-800 dark:text-gray-200">
              <IoCardOutline className="w-4 h-4 text-gray-400" />
              {pi.paymentMethod.brand && <span className="capitalize">{pi.paymentMethod.brand}</span>}
              {pi.paymentMethod.last4 && <span>•••• {pi.paymentMethod.last4}</span>}
            </div>
            <div className="text-[10px] font-mono text-gray-400 mt-0.5">{pi.paymentMethod.id}</div>
          </div>
        )}
        {pi.cancellationReason && (
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Cancellation Reason</div>
            <div className="text-sm text-red-600 dark:text-red-400 capitalize">{pi.cancellationReason.replace(/_/g, ' ')}</div>
          </div>
        )}
      </div>

      {/* Risk details */}
      {pi.risk && (
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Radar / Risk Assessment</div>
          <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{pi.risk.score}</span>
              <span className="text-xs text-gray-500 ml-1">/ 99</span>
            </div>
            <div className={`text-xs font-medium uppercase px-2 py-0.5 rounded-full ${
              pi.risk.level === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              pi.risk.level === 'elevated' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {pi.risk.level}
            </div>
            {pi.risk.rule && (
              <div className="text-xs text-gray-500">
                Rule: <span className="font-mono">{pi.risk.rule}</span>
                {pi.risk.action && <span className="ml-1 text-amber-600">({pi.risk.action})</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metadata */}
      {metaKeys.length > 0 && (
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Booking Metadata</div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {metaKeys.map(key => (
                <div key={key} className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-gray-500">{METADATA_LABELS[key] || key}</span>
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200 font-mono text-right max-w-[60%] truncate" title={pi.metadata[key]}>
                    {dollarFields.includes(key) && pi.metadata[key] !== '0.00'
                      ? `$${pi.metadata[key]}`
                      : pi.metadata[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Desktop: expandable table row
export function IntentRow({ pi, expanded, onToggle, statusBadge, cardBadge, riskBadge }: IntentComponentProps) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer select-none"
      >
        <td className="px-2 py-3 text-center">
          <IoChevronDownOutline className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'}`} />
        </td>
        <td className="px-4 py-3">
          <span className="font-mono text-xs text-gray-700 dark:text-gray-300" title={pi.id}>
            {pi.id.slice(0, 20)}...
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(pi.amount)}
          </span>
        </td>
        <td className="px-4 py-3">
          {statusBadge(pi.status, pi.statusLabel)}
        </td>
        <td className="px-4 py-3">
          {cardBadge(pi.paymentMethod)}
        </td>
        <td className="px-4 py-3">
          {riskBadge(pi.risk)}
        </td>
        <td className="px-4 py-3">
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate block max-w-[200px]" title={pi.description || ''}>
            {pi.description || pi.metadata?.bookingId || '—'}
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span className="text-xs text-gray-500">{formatDate(pi.created)}</span>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={8} className="p-0 border-b-2 border-purple-200 dark:border-purple-800">
            <IntentDetail pi={pi} />
          </td>
        </tr>
      )}
    </>
  )
}

// Mobile: expandable card
export function IntentCard({ pi, expanded, onToggle, statusBadge, cardBadge, riskBadge }: IntentComponentProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer select-none"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <IoChevronDownOutline className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-0' : '-rotate-90'}`} />
            <div>
              <span className="font-semibold text-gray-900 dark:text-white text-lg">
                {formatCurrency(pi.amount)}
              </span>
              <div className="mt-1">{statusBadge(pi.status, pi.statusLabel)}</div>
            </div>
          </div>
          <span className="text-xs text-gray-500">{formatDate(pi.created)}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
          <span className="font-mono" title={pi.id}>{pi.id.slice(0, 24)}...</span>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          {cardBadge(pi.paymentMethod)}
          {riskBadge(pi.risk)}
        </div>
        {(pi.description || pi.metadata?.bookingId) && (
          <div className="mt-2 text-xs text-gray-500 truncate">
            {pi.description || `Booking: ${pi.metadata.bookingId}`}
          </div>
        )}
      </div>
      {expanded && (
        <div className="border-t border-purple-200 dark:border-purple-800">
          <IntentDetail pi={pi} />
        </div>
      )}
    </div>
  )
}

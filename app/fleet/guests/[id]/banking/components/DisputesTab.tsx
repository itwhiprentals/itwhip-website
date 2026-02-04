// app/fleet/guests/[id]/banking/components/DisputesTab.tsx
'use client'

import { BankingData, Charge, formatCurrency } from '../types'

interface DisputesTabProps {
  data: BankingData
  actionLoading: string | null
  onResolveDispute: (chargeId: string, resolution: string, notes?: string) => void
}

export function DisputesTab({ data, actionLoading, onResolveDispute }: DisputesTabProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        Disputed Charges
        {data.charges.disputed.length > 0 && (
          <span className="px-2 py-0.5 text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
            {data.charges.disputed.length}
          </span>
        )}
      </h3>

      {data.charges.disputed.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-12">No disputed charges</p>
      ) : (
        <div className="space-y-4">
          {data.charges.disputed.map(charge => (
            <DisputeCard
              key={charge.id}
              charge={charge}
              actionLoading={actionLoading}
              onResolveDispute={onResolveDispute}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface DisputeCardProps {
  charge: Charge
  actionLoading: string | null
  onResolveDispute: (chargeId: string, resolution: string, notes?: string) => void
}

function DisputeCard({ charge, actionLoading, onResolveDispute }: DisputeCardProps) {
  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{charge.carName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Booking: {charge.bookingCode}</p>
          {charge.disputeNotes && (
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 italic">
              "{charge.disputeNotes}"
            </p>
          )}
        </div>
        <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
          {formatCurrency(charge.totalCharges)}
        </span>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onResolveDispute(charge.id, 'charge_anyway')}
          disabled={actionLoading === charge.id}
          className="min-h-[44px] px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
        >
          Charge Anyway
        </button>
        <button
          onClick={() => onResolveDispute(charge.id, 'waive', 'Dispute accepted')}
          disabled={actionLoading === charge.id}
          className="min-h-[44px] px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
        >
          Accept & Waive
        </button>
        <button
          onClick={() => onResolveDispute(charge.id, 'escalate', 'Escalated for review')}
          disabled={actionLoading === charge.id}
          className="min-h-[44px] px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50"
        >
          Escalate
        </button>
      </div>
    </div>
  )
}

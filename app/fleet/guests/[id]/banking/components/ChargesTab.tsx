// app/fleet/guests/[id]/banking/components/ChargesTab.tsx
'use client'

import { BankingData, Charge, formatCurrency, formatDate } from '../types'

interface ChargesTabProps {
  data: BankingData
  actionLoading: string | null
  onChargeNow: (chargeId: string) => void
  onWaiveCharge: (charge: Charge) => void
}

export function ChargesTab({ data, actionLoading, onChargeNow, onWaiveCharge }: ChargesTabProps) {
  return (
    <div className="space-y-6">
      {/* Pending Charges */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          Pending Charges
          {data.charges.pending.length > 0 && (
            <span className="px-2 py-0.5 text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
              {data.charges.pending.length}
            </span>
          )}
        </h3>
        {data.charges.pending.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No pending charges</p>
        ) : (
          <div className="space-y-3">
            {data.charges.pending.map(charge => (
              <PendingChargeCard
                key={charge.id}
                charge={charge}
                actionLoading={actionLoading}
                onChargeNow={onChargeNow}
                onWaiveCharge={onWaiveCharge}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Charges */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Completed Charges</h3>
        {data.charges.completed.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No completed charges</p>
        ) : (
          <div className="space-y-2">
            {data.charges.completed.map(charge => (
              <CompletedChargeCard key={charge.id} charge={charge} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface PendingChargeCardProps {
  charge: Charge
  actionLoading: string | null
  onChargeNow: (chargeId: string) => void
  onWaiveCharge: (charge: Charge) => void
}

function PendingChargeCard({ charge, actionLoading, onChargeNow, onWaiveCharge }: PendingChargeCardProps) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{charge.carName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Booking: {charge.bookingCode}</p>
        </div>
        <span className="text-xl font-bold text-red-600 dark:text-red-400">
          {formatCurrency(charge.totalCharges)}
        </span>
      </div>
      {/* Charge Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-sm mb-3">
        {charge.mileageCharge > 0 && <span>Mileage: {formatCurrency(charge.mileageCharge)}</span>}
        {charge.fuelCharge > 0 && <span>Fuel: {formatCurrency(charge.fuelCharge)}</span>}
        {charge.lateCharge > 0 && <span>Late: {formatCurrency(charge.lateCharge)}</span>}
        {charge.damageCharge > 0 && <span>Damage: {formatCurrency(charge.damageCharge)}</span>}
        {charge.cleaningCharge > 0 && <span>Cleaning: {formatCurrency(charge.cleaningCharge)}</span>}
        {charge.otherCharges > 0 && <span>Other: {formatCurrency(charge.otherCharges)}</span>}
      </div>
      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onChargeNow(charge.id)}
          disabled={actionLoading === charge.id}
          className="min-h-[44px] px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
        >
          {actionLoading === charge.id ? 'Processing...' : 'Charge Now'}
        </button>
        <button
          onClick={() => onWaiveCharge(charge)}
          className="min-h-[44px] px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg"
        >
          Waive
        </button>
      </div>
    </div>
  )
}

interface CompletedChargeCardProps {
  charge: Charge
}

function CompletedChargeCard({ charge }: CompletedChargeCardProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{charge.carName}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {charge.bookingCode} • Charged {charge.chargedAt ? formatDate(charge.chargedAt) : 'N/A'}
        </p>
      </div>
      <span className="font-semibold text-green-600 dark:text-green-400">
        {formatCurrency(charge.chargedAmount || charge.totalCharges)}
      </span>
    </div>
  )
}

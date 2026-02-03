// app/fleet/hosts/[id]/banking/components/QuickActions.tsx
'use client'

import {
  IoTrendingDownOutline,
  IoLockClosedOutline,
  IoSendOutline,
  IoPauseCircleOutline,
  IoPlayCircleOutline
} from 'react-icons/io5'
import { BankingData } from '../types'

interface QuickActionsProps {
  data: BankingData
  onChargeHost: () => void
  onHoldFunds: () => void
  onForcePayout: () => void
  onTogglePayouts: () => void
}

export function QuickActions({
  data,
  onChargeHost,
  onHoldFunds,
  onForcePayout,
  onTogglePayouts
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <button
        onClick={onChargeHost}
        className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 font-medium"
      >
        <IoTrendingDownOutline />
        Charge Host
      </button>

      <button
        onClick={onHoldFunds}
        className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2 font-medium"
      >
        <IoLockClosedOutline />
        Hold Funds
      </button>

      <button
        onClick={onForcePayout}
        disabled={data.balances.availableForPayout <= 0 || !data.stripeConnect.accountId}
        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
      >
        <IoSendOutline />
        Force Payout
      </button>

      <button
        onClick={onTogglePayouts}
        className={`px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium ${
          data.payout.enabled
            ? 'bg-gray-600 text-white hover:bg-gray-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {data.payout.enabled ? <IoPauseCircleOutline /> : <IoPlayCircleOutline />}
        {data.payout.enabled ? 'Suspend' : 'Enable'} Payouts
      </button>
    </div>
  )
}

// app/fleet/banking/components/HostBalanceCard.tsx
// Shows all host balance types with clear labels and color coding

import { formatCurrency, HostBalanceSummary } from '../types'

interface HostBalanceCardProps {
  data: HostBalanceSummary
}

interface BalanceItemProps {
  label: string
  amount: number
  description: string
  color: 'green' | 'yellow' | 'orange' | 'red'
  issueCount?: number
}

function BalanceItem({ label, amount, description, color, issueCount }: BalanceItemProps) {
  const colorStyles = {
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      label: 'text-green-700 dark:text-green-400',
      amount: 'text-green-700 dark:text-green-400',
      icon: 'text-green-500 dark:text-green-400'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      label: 'text-yellow-700 dark:text-yellow-400',
      amount: 'text-yellow-700 dark:text-yellow-400',
      icon: 'text-yellow-500 dark:text-yellow-400'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      label: 'text-orange-700 dark:text-orange-400',
      amount: 'text-orange-700 dark:text-orange-400',
      icon: 'text-orange-500 dark:text-orange-400'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      label: 'text-red-700 dark:text-red-400',
      amount: 'text-red-700 dark:text-red-400',
      icon: 'text-red-500 dark:text-red-400'
    }
  }

  const styles = colorStyles[color]

  return (
    <div className={`p-4 rounded-lg border ${styles.bg} ${styles.border}`}>
      <div className="flex items-start justify-between mb-2">
        <p className={`text-sm font-medium ${styles.label}`}>{label}</p>
        {issueCount !== undefined && issueCount > 0 && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.label}`}>
            {issueCount} hosts
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${styles.amount}`}>
        {formatCurrency(amount)}
      </p>
      <p className={`text-xs mt-2 ${styles.label} opacity-80`}>
        {description}
      </p>
    </div>
  )
}

export function HostBalanceCard({ data }: HostBalanceCardProps) {
  // Calculate total across all balance types
  const totalBalances = data.totalCurrentBalance + data.totalPendingBalance + data.totalHoldBalance

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Host Balances
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {data.totalHosts} hosts
        </span>
      </div>

      {/* Total Summary */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Outstanding</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(totalBalances)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Across all host accounts
        </p>
      </div>

      {/* Balance Types Grid */}
      <div className="grid grid-cols-2 gap-4">
        <BalanceItem
          label="Available"
          amount={data.totalCurrentBalance}
          description="Ready to withdraw"
          color="green"
        />
        <BalanceItem
          label="Pending"
          amount={data.totalPendingBalance}
          description="Waiting for eligibility"
          color="yellow"
        />
        <BalanceItem
          label="On Hold"
          amount={data.totalHoldBalance}
          description="Disputes or claims"
          color="orange"
          issueCount={data.hostsWithHoldBalance}
        />
        <BalanceItem
          label="Negative"
          amount={data.totalNegativeBalance}
          description="Owes platform"
          color="red"
          issueCount={data.hostsWithNegativeBalance}
        />
      </div>

      {/* Issue Alert */}
      {(data.hostsWithNegativeBalance > 0 || data.hostsWithHoldBalance > 0) && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Attention Needed
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {data.hostsWithNegativeBalance > 0 && (
                  <span>{data.hostsWithNegativeBalance} host(s) with negative balance. </span>
                )}
                {data.hostsWithHoldBalance > 0 && (
                  <span>{data.hostsWithHoldBalance} host(s) with funds on hold.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Balance Types</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Available for withdrawal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span className="text-gray-600 dark:text-gray-400">3-day hold period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Active dispute/claim</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Debt to platform</span>
          </div>
        </div>
      </div>
    </div>
  )
}

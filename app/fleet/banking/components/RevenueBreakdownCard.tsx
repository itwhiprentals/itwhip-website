// app/fleet/banking/components/RevenueBreakdownCard.tsx
// Shows breakdown of platform revenue vs passthrough money

import { formatCurrency, EnhancedRevenueData } from '../types'

interface RevenueBreakdownProps {
  data: {
    guestServiceFees: number
    hostCommissions: number
    insuranceRevenue: number
    totalPlatformRevenue: number
  }
  enhanced?: EnhancedRevenueData
}

export function RevenueBreakdownCard({ data, enhanced }: RevenueBreakdownProps) {
  // If enhanced data is available, use the new split view
  if (enhanced) {
    const platformItems = [
      {
        label: 'Guest Service Fees (15%)',
        value: enhanced.platformRevenue.guestServiceFees,
        color: 'bg-green-500'
      },
      {
        label: 'Host Commissions (25%)',
        value: enhanced.platformRevenue.hostCommissions,
        color: 'bg-green-400'
      },
      {
        label: 'Insurance Platform Share (30%)',
        value: enhanced.platformRevenue.insurancePlatformShare,
        color: 'bg-green-300'
      },
      {
        label: 'Processing Fees ($1.50/payout)',
        value: enhanced.platformRevenue.processingFees,
        color: 'bg-green-200'
      },
      {
        label: 'Cancellation Revenue',
        value: enhanced.platformRevenue.cancellationRevenue || 0,
        color: 'bg-orange-400',
        tooltip: 'Service fees + non-refunded subtotal from cancelled bookings'
      }
    ]

    const passthroughItems = [
      {
        label: 'Insurance Provider Share (70%)',
        value: enhanced.passthroughMoney.insuranceProviderShare,
        color: 'bg-gray-400'
      },
      {
        label: 'Taxes Collected',
        value: enhanced.passthroughMoney.taxesCollected,
        color: 'bg-gray-300'
      }
    ]

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Revenue Breakdown
        </h2>

        {/* Platform Revenue Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">
              Platform Revenue
            </h3>
            <span className="text-xs text-green-600 dark:text-green-500">(We keep this)</span>
          </div>
          <div className="space-y-3 pl-5">
            {platformItems.map((item, idx) => {
              const isOrange = item.color === 'bg-orange-400'
              return (
                <div key={idx} className="flex justify-between text-sm">
                  <span className={`${isOrange ? 'text-orange-700 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {item.label}
                    {isOrange && item.value > 0 && (
                      <span className="ml-1 text-xs text-orange-500">●</span>
                    )}
                  </span>
                  <span className={`font-medium ${isOrange ? 'text-orange-600 dark:text-orange-400' : 'text-green-700 dark:text-green-400'}`}>
                    {formatCurrency(item.value)}
                  </span>
                </div>
              )
            })}
            <div className="flex justify-between text-sm pt-2 border-t border-green-200 dark:border-green-800">
              <span className="font-semibold text-green-800 dark:text-green-300">Subtotal</span>
              <span className="font-bold text-green-700 dark:text-green-400">
                {formatCurrency(enhanced.platformRevenue.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Separator */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

        {/* Passthrough Money Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Passthrough Money
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">(NOT our revenue)</span>
          </div>
          <div className="space-y-3 pl-5">
            {passthroughItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-500">{item.label}</span>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-500 dark:text-gray-400">Subtotal</span>
              <span className="font-medium text-gray-500 dark:text-gray-400">
                {formatCurrency(enhanced.passthroughMoney.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation Revenue Details (if any) */}
        {enhanced.cancellationDetails && enhanced.cancellationDetails.cancelledCount > 0 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                  Cancellation Breakdown
                </h3>
                <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">
                  {enhanced.cancellationDetails.cancelledCount} cancelled
                </span>
              </div>
              <div className="space-y-2 pl-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Original Booking Value</span>
                  <span className="text-gray-500">{formatCurrency(enhanced.cancellationDetails.totalCancelled)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Service Fees Retained</span>
                  <span className="text-orange-600 dark:text-orange-400">{formatCurrency(enhanced.cancellationDetails.serviceFeeRetained)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Non-Refunded Subtotal</span>
                  <span className="text-orange-600 dark:text-orange-400">{formatCurrency(enhanced.cancellationDetails.nonRefundedSubtotal)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-orange-200 dark:border-orange-800">
                  <span className="font-semibold text-orange-800 dark:text-orange-300">Platform Retained</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(enhanced.cancellationDetails.totalRetained)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Refunded to Guests</span>
                  <span>-{formatCurrency(enhanced.cancellationDetails.totalRefunded)}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Totals */}
        <div className="mt-6 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Gross Collected</span>
            <span className="font-medium text-gray-600 dark:text-gray-300">
              {formatCurrency(enhanced.grossCollected)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900 dark:text-white">Net Platform Revenue</span>
            <span className="font-bold text-2xl text-green-600 dark:text-green-400">
              {formatCurrency(enhanced.platformRevenue.total)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Fallback to legacy view if enhanced data not available
  const items = [
    {
      label: 'Guest Service Fees (15%)',
      value: data.guestServiceFees,
      color: 'bg-blue-500'
    },
    {
      label: 'Host Commissions (25%)',
      value: data.hostCommissions,
      color: 'bg-purple-500'
    },
    {
      label: 'Insurance Revenue (30%)',
      value: data.insuranceRevenue,
      color: 'bg-green-500'
    }
  ]

  const total = data.totalPlatformRevenue || (data.guestServiceFees + data.hostCommissions + data.insuranceRevenue)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Revenue Breakdown
      </h2>
      <div className="space-y-4">
        {items.map((item, idx) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`${item.color} h-2 rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-900 dark:text-white">Total Revenue</span>
          <span className="font-bold text-xl text-gray-900 dark:text-white">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  )
}

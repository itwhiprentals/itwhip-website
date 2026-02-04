// app/fleet/banking/components/AllTimeTotalsCard.tsx
// Shows all-time platform totals: trips, gross revenue, platform revenue, host payouts

import { formatCurrency } from '../types'

interface AllTimeTotalsProps {
  data: {
    totalBookings: number
    grossBookingValue: number
    platformRevenue: number
    hostPayouts: number
    totalPayoutsCount: number
    refundCount: number
  }
}

export function AllTimeTotalsCard({ data }: AllTimeTotalsProps) {
  const stats = [
    {
      label: 'Total Trips',
      value: data.totalBookings.toLocaleString(),
      sublabel: 'All-time bookings'
    },
    {
      label: 'Gross Booking Value',
      value: formatCurrency(data.grossBookingValue),
      sublabel: 'Total guest payments'
    },
    {
      label: 'Platform Revenue',
      value: formatCurrency(data.platformRevenue),
      sublabel: 'Service fees collected'
    },
    {
      label: 'Host Payouts',
      value: formatCurrency(data.hostPayouts),
      sublabel: `${data.totalPayoutsCount.toLocaleString()} payouts`
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        All-Time Platform Totals
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stat.value}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {stat.sublabel}
            </p>
          </div>
        ))}
      </div>
      {data.refundCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Refunds: {data.refundCount.toLocaleString()} bookings refunded
          </p>
        </div>
      )}
    </div>
  )
}

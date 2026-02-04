// app/fleet/banking/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoWalletOutline,
  IoPeopleOutline,
  IoCarOutline,
  IoTrendingUpOutline,
  IoAlertCircleOutline,
  IoRefreshOutline,
  IoChevronForwardOutline,
  IoStatsChartOutline,
  IoCashOutline,
  IoReceiptOutline
} from 'react-icons/io5'
import Link from 'next/link'
import { PlatformBankingData, formatCurrency, formatDateTime } from './types'
import {
  RevenueBreakdownCard,
  PayoutSimulator,
  Host1099SummaryCard,
  PayoutHistoryTable,
  TaxSummaryCard,
  InsuranceRevenueCard,
  HostPayoutCard,
  HostLeaderboardCard,
  HostBalanceCard
} from './components'

export default function PlatformBankingPage() {
  const [data, setData] = useState<PlatformBankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await fetch('/fleet/api/banking?key=phoenix-fleet-2847')
      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      }
    } catch (error) {
      console.error('Error loading platform banking data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading platform banking...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <IoAlertCircleOutline className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Data
          </h3>
          <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Platform Banking
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Financial overview across all hosts and guests
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* ALL-TIME PLATFORM TOTALS */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <IoStatsChartOutline className="text-2xl text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">All-Time Platform Totals</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Bookings Ever */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <IoCarOutline className="text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Trips</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {data.allTime?.totalBookings?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-500">All bookings ever</p>
            </div>

            {/* Gross Booking Value */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <IoReceiptOutline className="text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Gross Revenue</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.allTime?.grossBookingValue || 0)}
              </div>
              <p className="text-xs text-gray-500">Total guest payments</p>
            </div>

            {/* Platform Revenue (Service Fees) */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <IoTrendingUpOutline className="text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Platform Revenue</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {formatCurrency(data.allTime?.platformRevenue || 0)}
              </div>
              <p className="text-xs text-gray-500">Service fees earned</p>
            </div>

            {/* Total Paid to Hosts */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <IoCashOutline className="text-orange-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Host Payouts</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.allTime?.hostPayouts || 0)}
              </div>
              <p className="text-xs text-gray-500">{data.allTime?.totalPayoutsCount || 0} payouts completed</p>
            </div>
          </div>

          {/* Additional All-Time Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{data.allTime?.totalClaims || 0}</div>
              <div className="text-xs text-gray-500">Total Claims</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{data.allTime?.refundCount || 0}</div>
              <div className="text-xs text-gray-500">Total Refunds</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{data.hosts.count + data.guests.count}</div>
              <div className="text-xs text-gray-500">Total Users</div>
            </div>
          </div>
        </div>

        {/* Host Balances & Pending Payouts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Host Balances Card (NEW) */}
          {data.hostBalanceSummary && (
            <HostBalanceCard data={data.hostBalanceSummary} />
          )}

          {/* Pending Payouts Card (NEW) */}
          {data.pendingPayoutsDetailed && (
            <HostPayoutCard
              pendingPayouts={data.pendingPayoutsDetailed}
              totalPendingAmount={data.payouts.pendingAmount}
              totalPendingCount={data.payouts.pendingCount}
              settings={{
                standardPayoutDelay: data.settings?.standardPayoutDelay || 3,
                newHostPayoutDelay: data.settings?.newHostPayoutDelay || 7
              }}
            />
          )}
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Platform Revenue (30d) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Revenue (30d)</span>
              <IoTrendingUpOutline className="text-green-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {formatCurrency(data.recent?.serviceFees || 0)}
            </div>
            <p className="text-xs text-gray-500">{data.recent?.bookingsCount || 0} bookings</p>
          </div>

          {/* Active Claims */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Claims</span>
              <IoAlertCircleOutline className="text-red-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {data.claims.totalActive}
            </div>
            <p className="text-xs text-gray-500">Needs attention</p>
          </div>

          {/* Pending Payouts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending Payouts</span>
              <IoWalletOutline className="text-yellow-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">
              {formatCurrency(data.payouts.pendingAmount)}
            </div>
            <p className="text-xs text-gray-500">{data.payouts.pendingCount} pending</p>
          </div>

          {/* Total Hosts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Hosts</span>
              <IoPeopleOutline className="text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {data.hosts.count}
            </div>
            <p className="text-xs text-gray-500">{formatCurrency(data.hosts.totalPaidOut)} paid</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Host Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Host Finances</h3>
              <Link href="/fleet/hosts" className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                View All <IoChevronForwardOutline />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance</span>
                <span className="font-medium">{formatCurrency(data.hosts.totalCurrentBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending Balance</span>
                <span className="font-medium text-yellow-600">{formatCurrency(data.hosts.totalPendingBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">On Hold</span>
                <span className="font-medium text-red-600">{formatCurrency(data.hosts.totalHoldBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Paid Out</span>
                <span className="font-medium text-green-600">{formatCurrency(data.hosts.totalPaidOut)}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.hosts.byStatus).map(([status, count]) => (
                    <span key={status} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      {status}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Guest Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Guest Finances</h3>
              <Link href="/fleet/guests" className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                View All <IoChevronForwardOutline />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Guests</span>
                <span className="font-medium">{data.guests.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Credit Balances</span>
                <span className="font-medium">{formatCurrency(data.guests.totalCredits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bonus Balances</span>
                <span className="font-medium text-green-600">{formatCurrency(data.guests.totalBonus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Deposit Wallets</span>
                <span className="font-medium">{formatCurrency(data.guests.totalDeposits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Accounts on Hold</span>
                <span className={`font-medium ${data.guests.onHoldCount > 0 ? 'text-red-600' : ''}`}>
                  {data.guests.onHoldCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* All-Time Booking Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">All-Time Booking Disposition</h3>
            <p className="text-xs text-gray-500">Complete breakdown of every booking on the platform</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Booking Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">By Booking Status</h4>
                <div className="space-y-2">
                  {data.allTime?.bookingsByStatus && Object.entries(data.allTime.bookingsByStatus).map(([status, info]) => (
                    <div key={status} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          status === 'COMPLETED' ? 'bg-green-500' :
                          status === 'ACTIVE' ? 'bg-blue-500' :
                          status === 'CANCELLED' ? 'bg-red-500' :
                          status === 'PENDING' ? 'bg-yellow-500' :
                          status === 'CONFIRMED' ? 'bg-purple-500' :
                          'bg-gray-400'
                        }`} />
                        <span className="text-sm font-medium capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{info.count.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(info.totalAmount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Payment Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">By Payment Status</h4>
                <div className="space-y-2">
                  {data.allTime?.bookingsByPaymentStatus && Object.entries(data.allTime.bookingsByPaymentStatus).map(([status, info]) => (
                    <div key={status} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          status === 'PAID' ? 'bg-green-500' :
                          status === 'REFUNDED' ? 'bg-red-500' :
                          status === 'PARTIAL_REFUND' ? 'bg-orange-500' :
                          status === 'PENDING' ? 'bg-yellow-500' :
                          status === 'FAILED' ? 'bg-red-600' :
                          'bg-gray-400'
                        }`} />
                        <span className="text-sm font-medium capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{info.count.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(info.totalAmount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown & Insurance Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Breakdown (Enhanced with Platform vs Passthrough) */}
          {data.allTime?.revenueBreakdown && (
            <RevenueBreakdownCard
              data={{
                guestServiceFees: data.allTime.revenueBreakdown.guestServiceFees || 0,
                hostCommissions: data.allTime.revenueBreakdown.hostCommissions || 0,
                insuranceRevenue: data.allTime.revenueBreakdown.insuranceRevenue || 0,
                totalPlatformRevenue: data.allTime.revenueBreakdown.totalPlatformRevenue || data.allTime.platformRevenue || 0
              }}
              enhanced={data.revenueEnhanced}
            />
          )}

          {/* Insurance Revenue Card (NEW) */}
          {data.insurance && (
            <InsuranceRevenueCard data={data.insurance} />
          )}
        </div>

        {/* Tax Summary & Payout Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tax Summary (Enhanced with Passthrough Warning) */}
          <TaxSummaryCard
            data={{
              totalTaxesCollected: data.allTime?.totalTaxesCollected || 0,
              taxesByState: { 'Arizona': data.allTime?.totalTaxesCollected || 0 }
            }}
          />

          {/* Payout Simulator */}
          {data.settings?.commissionTiers && (
            <PayoutSimulator
              commissionTiers={data.settings.commissionTiers}
              processingFeeFixed={data.settings.processingFeeFixed || 1.50}
            />
          )}
        </div>

        {/* Host Leaderboard (NEW) */}
        {data.hostLeaderboard && (
          <div className="mb-6">
            <HostLeaderboardCard data={data.hostLeaderboard} />
          </div>
        )}

        {/* 1099 Tax Summary */}
        {data.tax1099 && (
          <div className="mb-6">
            <Host1099SummaryCard
              data={{
                taxYear: data.tax1099.taxYear,
                totalHosts: data.tax1099.totalHosts,
                hostsAboveThreshold: data.tax1099.hostsAboveThreshold,
                totalGrossReceipts: data.tax1099.totalGrossReceipts,
                totalPlatformFees: data.tax1099.totalPlatformFees,
                totalProcessingFees: data.tax1099.totalProcessingFees,
                totalNetPayouts: data.tax1099.totalNetPayouts
              }}
            />
          </div>
        )}

        {/* Bookings & Claims Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Current Bookings by Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Current Bookings</h3>
              <Link href="/fleet/bookings" className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                Manage <IoChevronForwardOutline />
              </Link>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(data.bookings.byStatus).map(([status, count]) => (
                  <div key={status} className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{count}</div>
                    <div className="text-xs text-gray-500 capitalize">{status.toLowerCase().replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Claims */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Active Claims</h3>
              <Link href="/fleet/claims" className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                Manage <IoChevronForwardOutline />
              </Link>
            </div>
            <div className="p-4">
              {Object.keys(data.claims.byStatus).length === 0 ? (
                <p className="text-center text-gray-500 py-4">No active claims</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(data.claims.byStatus).map(([status, info]) => (
                    <div key={status} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <div>
                        <span className="text-sm font-medium capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                        <span className="text-xs text-gray-500 ml-2">({info.count})</span>
                      </div>
                      <span className="text-sm font-medium text-orange-600">
                        {formatCurrency(info.estimatedCost || info.approvedAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payouts */}
          <PayoutHistoryTable
            payouts={data.payouts.recentPayouts}
            title="Recent Payouts (30 days)"
          />

          {/* Recent Charges */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Host Charges</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
              {data.recentActivity.charges.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent charges</p>
              ) : (
                data.recentActivity.charges.slice(0, 10).map(charge => (
                  <div key={charge.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{charge.hostName}</p>
                        <p className="text-xs text-gray-500">{charge.chargeType} - {charge.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{formatCurrency(charge.amount)}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          charge.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          charge.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          charge.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {charge.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

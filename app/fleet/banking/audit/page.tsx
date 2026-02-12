// app/fleet/banking/audit/page.tsx
// Stripe Payment Intents Audit Trail — Platform-wide view

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoShieldCheckmarkOutline,
  IoCardOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoFlashOutline,
  IoChevronForwardOutline,
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

interface Summary {
  total: number
  authorized: number
  captured: number
  canceled: number
  failed: number
  processing: number
  totalAuthorized: number
  totalCaptured: number
  totalCanceled: number
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export default function BankingAuditPage() {
  const [intents, setIntents] = useState<PaymentIntent[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [days, setDays] = useState(30)
  const [search, setSearch] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [lastId, setLastId] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    fetchIntents()
  }, [filter, days])

  const fetchIntents = async (append = false, startingAfter?: string) => {
    if (!append) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = new URLSearchParams({
        key: 'phoenix-fleet-2847',
        days: days.toString(),
      })
      if (filter !== 'all') params.set('status', filter)
      if (search) params.set('search', search)
      if (startingAfter) params.set('starting_after', startingAfter)

      const res = await fetch(`/api/fleet/banking/audit?${params}`)
      const data = await res.json()

      if (data.success) {
        if (append) {
          setIntents(prev => [...prev, ...data.intents])
        } else {
          setIntents(data.intents || [])
        }
        setSummary(data.summary || null)
        setHasMore(data.hasMore || false)
        setLastId(data.lastId || null)
      }
    } catch (error) {
      console.error('Failed to fetch audit data:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchIntents()
  }

  const handleSearch = () => {
    fetchIntents()
  }

  const handleLoadMore = () => {
    if (lastId) fetchIntents(true, lastId)
  }

  const statusBadge = (status: string, label: string) => {
    const styles: Record<string, string> = {
      succeeded: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      requires_capture: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      canceled: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      requires_payment_method: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      requires_action: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {label}
      </span>
    )
  }

  const riskBadge = (risk: PaymentIntent['risk']) => {
    if (!risk) return <span className="text-xs text-gray-400">—</span>
    const colors: Record<string, string> = {
      low: 'text-green-600',
      elevated: 'text-amber-600',
      highest: 'text-red-600',
    }
    return (
      <div className="flex items-center gap-1">
        <span className={`text-xs font-medium ${colors[risk.level] || 'text-gray-600'}`}>
          {risk.score}
        </span>
        <span className={`text-[10px] uppercase ${colors[risk.level] || 'text-gray-500'}`}>
          {risk.level}
        </span>
      </div>
    )
  }

  const cardBadge = (pm: PaymentIntent['paymentMethod']) => {
    if (!pm || !pm.last4) return <span className="text-xs text-gray-400">—</span>
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
        <IoCardOutline className="text-sm" />
        {pm.brand && <span className="capitalize">{pm.brand}</span>}
        •••• {pm.last4}
      </span>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/fleet/banking"
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <IoArrowBackOutline className="text-lg text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <IoShieldCheckmarkOutline className="text-purple-600 dark:text-purple-400" />
              Payment Intents Audit
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Stripe payment intents across all guests — last {days} days
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`p-3 rounded-lg border text-left transition-colors ${filter === 'all' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
          >
            <div className="text-xl font-bold text-gray-900 dark:text-white">{summary.total}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Total</div>
          </button>
          <button
            onClick={() => setFilter('captured')}
            className={`p-3 rounded-lg border text-left transition-colors ${filter === 'captured' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
          >
            <div className="text-xl font-bold text-green-600">{summary.captured}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Captured</div>
            <div className="text-xs text-green-600 mt-0.5">{formatCurrency(summary.totalCaptured)}</div>
          </button>
          <button
            onClick={() => setFilter('authorized')}
            className={`p-3 rounded-lg border text-left transition-colors ${filter === 'authorized' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
          >
            <div className="text-xl font-bold text-amber-600">{summary.authorized}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Authorized</div>
            <div className="text-xs text-amber-600 mt-0.5">{formatCurrency(summary.totalAuthorized)}</div>
          </button>
          <button
            onClick={() => setFilter('canceled')}
            className={`p-3 rounded-lg border text-left transition-colors ${filter === 'canceled' ? 'border-gray-500 bg-gray-100 dark:bg-gray-700' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
          >
            <div className="text-xl font-bold text-gray-600 dark:text-gray-400">{summary.canceled}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Canceled</div>
            <div className="text-xs text-gray-500 mt-0.5">{formatCurrency(summary.totalCanceled)}</div>
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`p-3 rounded-lg border text-left transition-colors ${filter === 'failed' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
          >
            <div className="text-xl font-bold text-red-600">{summary.failed}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Failed</div>
          </button>
          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="text-xl font-bold text-purple-600">{summary.processing}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Processing</div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by payment intent ID or description..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Search
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading payment intents...</div>
      ) : intents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <IoShieldCheckmarkOutline className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No payment intents found</p>
          <p className="text-sm text-gray-500 mt-1">Try expanding the date range or changing the filter.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Intent ID</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Card</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Risk</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {intents.map(pi => (
                    <tr key={pi.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {intents.map(pi => (
              <div key={pi.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white text-lg">
                      {formatCurrency(pi.amount)}
                    </span>
                    <div className="mt-1">{statusBadge(pi.status, pi.statusLabel)}</div>
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
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium inline-flex items-center gap-2"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
                <IoChevronForwardOutline />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

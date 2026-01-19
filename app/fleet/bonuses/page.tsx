// app/fleet/bonuses/page.tsx
// Fleet Bonus Management - Control all bonus allocations

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Guest {
  id: string
  name: string | null
  email: string | null
  profilePhotoUrl: string | null
  averageRating: number
  totalTrips: number
  memberTier: string
  stripeIdentityStatus: string | null
  depositWalletBalance: number
  creditBalance: number
  bonusBalance: number
  memberSince: string
}

interface Analytics {
  totalBonusesGiven: number
  currentBalances: {
    deposits: number
    credits: number
    bonuses: number
  }
  guestsWithBonus: number
  globalSettings: {
    guestSignupBonus: number
    guestReferralBonus: number
    maxBonusPercentage: number
    bonusExpirationDays: number
  }
}

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  createdAt: string
  reviewerProfile: {
    id: string
    name: string | null
    email: string | null
    profilePhotoUrl: string | null
  }
}

type BonusType = 'deposit' | 'credit' | 'bonus'
type TargetType = 'specific' | 'all' | 'verified' | 'top_rated'

export default function FleetBonusesPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  // Form state
  const [targetType, setTargetType] = useState<TargetType>('specific')
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [bonusType, setBonusType] = useState<BonusType>('deposit')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [guestFilter, setGuestFilter] = useState('all')

  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/fleet/bonuses?action=analytics', { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setAnalytics(data.analytics)
        setTransactions(data.recentTransactions || [])
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }, [])

  const fetchGuests = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        action: 'guests',
        search: searchQuery,
        filter: guestFilter,
        limit: '50'
      })
      const res = await fetch(`/api/fleet/bonuses?${params}`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setGuests(data.guests || [])
      }
    } catch (error) {
      console.error('Failed to fetch guests:', error)
    }
  }, [searchQuery, guestFilter])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchAnalytics(), fetchGuests()])
      setLoading(false)
    }
    loadData()
  }, [fetchAnalytics, fetchGuests])

  const handleApplyBonus = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' })
      return
    }

    if (targetType === 'specific' && selectedGuests.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one guest' })
      return
    }

    setApplying(true)
    setMessage(null)

    try {
      const res = await fetch('/api/fleet/bonuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userIds: targetType === 'specific' ? selectedGuests : targetType,
          bonusType,
          amount: parseFloat(amount),
          description: description || undefined
        })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Successfully applied $${parseFloat(amount).toFixed(2)} ${bonusType} bonus to ${data.applied} guests. Total: $${data.totalAmount.toFixed(2)}`
        })
        // Reset form
        setSelectedGuests([])
        setAmount('')
        setDescription('')
        // Refresh data
        await fetchAnalytics()
        await fetchGuests()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to apply bonus' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to apply bonus' })
    } finally {
      setApplying(false)
    }
  }

  const toggleGuestSelection = (guestId: string) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    )
  }

  const selectAllGuests = () => {
    if (selectedGuests.length === guests.length) {
      setSelectedGuests([])
    } else {
      setSelectedGuests(guests.map(g => g.id))
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bonus Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Control all bonus allocations for guests
          </p>
        </div>
        <Link
          href="/fleet/settings"
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Global Settings →
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-white shadow-lg">
          <p className="text-sm font-medium mb-1">Total Bonuses Given</p>
          <p className="text-2xl font-bold">${(analytics?.totalBonusesGiven || 0).toLocaleString()}</p>
          <p className="text-xs mt-1 text-green-100">All-time</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-4 text-white shadow-lg">
          <p className="text-sm font-medium mb-1">Current Deposit Balances</p>
          <p className="text-2xl font-bold">${(analytics?.currentBalances.deposits || 0).toLocaleString()}</p>
          <p className="text-xs mt-1 text-blue-100">In guest wallets</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-4 text-white shadow-lg">
          <p className="text-sm font-medium mb-1">Credits + Bonuses</p>
          <p className="text-2xl font-bold">
            ${((analytics?.currentBalances.credits || 0) + (analytics?.currentBalances.bonuses || 0)).toLocaleString()}
          </p>
          <p className="text-xs mt-1 text-purple-100">
            ${(analytics?.currentBalances.credits || 0).toFixed(0)} credits / ${(analytics?.currentBalances.bonuses || 0).toFixed(0)} bonus
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-4 text-white shadow-lg">
          <p className="text-sm font-medium mb-1">Guests with Bonus</p>
          <p className="text-2xl font-bold">{analytics?.guestsWithBonus || 0}</p>
          <p className="text-xs mt-1 text-orange-100">Active bonus holders</p>
        </div>
      </div>

      {/* Global Settings Info */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          Global Bonus Settings
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-yellow-700 dark:text-yellow-300">Signup Bonus:</span>
            <span className="ml-2 font-medium text-yellow-900 dark:text-yellow-100">
              ${analytics?.globalSettings.guestSignupBonus || 0}
            </span>
          </div>
          <div>
            <span className="text-yellow-700 dark:text-yellow-300">Referral Bonus:</span>
            <span className="ml-2 font-medium text-yellow-900 dark:text-yellow-100">
              ${analytics?.globalSettings.guestReferralBonus || 0}
            </span>
          </div>
          <div>
            <span className="text-yellow-700 dark:text-yellow-300">Max Bonus/Booking:</span>
            <span className="ml-2 font-medium text-yellow-900 dark:text-yellow-100">
              {((analytics?.globalSettings.maxBonusPercentage || 0.25) * 100).toFixed(0)}%
            </span>
          </div>
          <div>
            <span className="text-yellow-700 dark:text-yellow-300">Expiration:</span>
            <span className="ml-2 font-medium text-yellow-900 dark:text-yellow-100">
              {analytics?.globalSettings.bonusExpirationDays || 90} days
            </span>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bonus Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Apply Bonus
            </h2>

            {/* Target Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Users
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as TargetType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="specific">Select Specific Users</option>
                <option value="all">All Users</option>
                <option value="verified">Verified Users Only</option>
                <option value="top_rated">Top Rated (4.5★+ with 3+ trips)</option>
              </select>
            </div>

            {/* Bonus Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bonus Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['deposit', 'credit', 'bonus'] as BonusType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setBonusType(type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      bonusType === type
                        ? type === 'deposit'
                          ? 'bg-green-600 text-white'
                          : type === 'credit'
                          ? 'bg-blue-600 text-white'
                          : 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {bonusType === 'deposit' && 'Added to deposit wallet for security deposits'}
                {bonusType === 'credit' && '100% usable per booking, no expiration'}
                {bonusType === 'bonus' && 'Max 25% per booking, expires in 90 days'}
              </p>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., New Year promotion"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Selected count */}
            {targetType === 'specific' && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selected: <span className="font-medium text-gray-900 dark:text-white">{selectedGuests.length} guests</span>
                </p>
                {amount && selectedGuests.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total: ${(parseFloat(amount) * selectedGuests.length).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            {/* Apply Button */}
            <button
              onClick={handleApplyBonus}
              disabled={applying || !amount || (targetType === 'specific' && selectedGuests.length === 0)}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {applying ? 'Applying...' : 'Apply Bonus'}
            </button>
          </div>
        </div>

        {/* Right: Guest Selection & Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Selection */}
          {targetType === 'specific' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Guests
                </h2>
                <button
                  onClick={selectAllGuests}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedGuests.length === guests.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Search & Filter */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <select
                  value={guestFilter}
                  onChange={(e) => setGuestFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All</option>
                  <option value="verified">Verified</option>
                  <option value="with_bonus">Has Bonus</option>
                  <option value="top_rated">Top Rated</option>
                </select>
              </div>

              {/* Guest List */}
              <div className="max-h-80 overflow-y-auto space-y-2">
                {guests.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No guests found
                  </p>
                ) : (
                  guests.map((guest) => (
                    <div
                      key={guest.id}
                      onClick={() => toggleGuestSelection(guest.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedGuests.includes(guest.id)
                          ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                          : 'bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedGuests.includes(guest.id)
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedGuests.includes(guest.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full flex-shrink-0 relative">
                        {/* Placeholder always visible as base layer */}
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            {guest.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        {/* Image overlays placeholder when it loads successfully */}
                        {guest.profilePhotoUrl && (
                          <img
                            src={guest.profilePhotoUrl}
                            alt=""
                            className="absolute inset-0 w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {guest.name || 'Unknown'}
                          </p>
                          {guest.stripeIdentityStatus === 'verified' && (
                            <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] rounded">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {guest.email}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="text-right text-xs flex-shrink-0">
                        <p className="text-gray-600 dark:text-gray-400">
                          {guest.averageRating > 0 ? `${guest.averageRating.toFixed(1)}★` : 'No rating'}
                        </p>
                        <p className="text-gray-500 dark:text-gray-500">
                          {guest.totalTrips} trips
                        </p>
                      </div>

                      {/* Current Balance */}
                      <div className="text-right text-xs flex-shrink-0">
                        <p className="text-green-600 dark:text-green-400">
                          ${guest.depositWalletBalance.toFixed(0)} dep
                        </p>
                        <p className="text-purple-600 dark:text-purple-400">
                          ${(guest.creditBalance + guest.bonusBalance).toFixed(0)} cr
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Bonus Transactions
            </h2>

            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No bonus transactions yet
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full flex-shrink-0 relative">
                      {/* Placeholder always visible as base layer */}
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                          {tx.reviewerProfile?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      {/* Image overlays placeholder when it loads successfully */}
                      {tx.reviewerProfile?.profilePhotoUrl && (
                        <img
                          src={tx.reviewerProfile.profilePhotoUrl}
                          alt=""
                          className="absolute inset-0 w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {tx.reviewerProfile?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {tx.description}
                      </p>
                    </div>

                    {/* Amount & Date */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        +${tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// app/fleet/bonuses/components/PromoCodesTab.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  IoPricetagOutline,
  IoAddCircleOutline,
  IoCopyOutline,
  IoTrashOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
} from 'react-icons/io5'

interface PromoCode {
  id: string
  code: string
  title: string
  description: string | null
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses: number | null
  usedCount: number
  minBookingAmount: number | null
  isActive: boolean
  startsAt: string | null
  expiresAt: string | null
  createdAt: string
}

interface CreateFormData {
  code: string
  title: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: string
  maxUses: string
  minBookingAmount: string
  startsAt: string
  expiresAt: string
}

const INITIAL_FORM: CreateFormData = {
  code: '',
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  maxUses: '',
  minBookingAmount: '',
  startsAt: '',
  expiresAt: '',
}

function getStatusBadge(promo: PromoCode): { label: string; className: string } {
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return {
      label: 'Expired',
      className: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    }
  }
  if (!promo.isActive) {
    return {
      label: 'Inactive',
      className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    }
  }
  return {
    label: 'Active',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  }
}

export default function PromoCodesTab() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [form, setForm] = useState<CreateFormData>(INITIAL_FORM)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchPromoCodes = useCallback(async () => {
    try {
      const res = await fetch('/api/fleet/promo-codes', { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setPromoCodes(data.promoCodes || [])
      }
    } catch (error) {
      console.error('Failed to fetch promo codes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPromoCodes()
  }, [fetchPromoCodes])

  const handleCreate = async () => {
    if (!form.code.trim() || !form.title.trim() || !form.discountValue) {
      setMessage({ type: 'error', text: 'Code, title, and discount value are required' })
      return
    }

    const discountVal = parseFloat(form.discountValue)
    if (isNaN(discountVal) || discountVal <= 0) {
      setMessage({ type: 'error', text: 'Discount value must be a positive number' })
      return
    }

    if (form.discountType === 'percentage' && discountVal > 100) {
      setMessage({ type: 'error', text: 'Percentage discount cannot exceed 100%' })
      return
    }

    setCreating(true)
    setMessage(null)

    try {
      const body: Record<string, unknown> = {
        code: form.code.toUpperCase().trim(),
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        discountType: form.discountType,
        discountValue: discountVal,
      }

      if (form.maxUses) body.maxUses = parseInt(form.maxUses, 10)
      if (form.minBookingAmount) body.minBookingAmount = parseFloat(form.minBookingAmount)
      if (form.startsAt) body.startsAt = form.startsAt
      if (form.expiresAt) body.expiresAt = form.expiresAt

      const res = await fetch('/api/fleet/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: `Promo code "${body.code}" created successfully` })
        setForm(INITIAL_FORM)
        setShowCreateForm(false)
        await fetchPromoCodes()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create promo code' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create promo code' })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setMessage(null)

    try {
      const res = await fetch('/api/fleet/promo-codes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Promo code deleted' })
        setConfirmDeleteId(null)
        await fetchPromoCodes()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete promo code' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete promo code' })
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggle = async (id: string) => {
    setTogglingId(id)
    setMessage(null)

    try {
      const res = await fetch(`/api/fleet/promo-codes/${id}/toggle`, {
        method: 'POST',
        credentials: 'include',
      })

      const data = await res.json()

      if (data.success) {
        await fetchPromoCodes()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to toggle promo code' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to toggle promo code' })
    } finally {
      setTogglingId(null)
    }
  }

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const updateForm = (field: keyof CreateFormData, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: field === 'code' ? value.toUpperCase() : value,
    }))
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IoPricetagOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Promo Codes
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({promoCodes.length})
          </span>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showCreateForm ? (
            <>
              <IoCloseOutline className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <IoAddCircleOutline className="w-4 h-4" />
              Create New Code
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            Create New Promo Code
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Code *
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => updateForm('code', e.target.value)}
                placeholder="e.g. SUMMER25"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm uppercase"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder="e.g. Summer 2026 Promo"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder="Optional description for internal reference"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Type *
              </label>
              <select
                value={form.discountType}
                onChange={(e) => updateForm('discountType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Value * {form.discountType === 'percentage' ? '(%)' : '($)'}
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => updateForm('discountValue', e.target.value)}
                placeholder={form.discountType === 'percentage' ? '10' : '25.00'}
                min="0"
                step={form.discountType === 'percentage' ? '1' : '0.01'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Uses
              </label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => updateForm('maxUses', e.target.value)}
                placeholder="Unlimited"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Min Booking Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Booking Amount ($)
              </label>
              <input
                type="number"
                value={form.minBookingAmount}
                onChange={(e) => updateForm('minBookingAmount', e.target.value)}
                placeholder="No minimum"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={form.startsAt}
                onChange={(e) => updateForm('startsAt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => updateForm('expiresAt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <IoCheckmarkOutline className="w-4 h-4" />
              {creating ? 'Creating...' : 'Create Promo Code'}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false)
                setForm(INITIAL_FORM)
              }}
              className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Promo Code Cards */}
      {promoCodes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <IoPricetagOutline className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            No promo codes yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Create your first promo code to offer discounts to guests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promoCodes.map((promo) => {
            const status = getStatusBadge(promo)
            const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date()

            return (
              <div
                key={promo.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${
                  isExpired ? 'opacity-60' : ''
                }`}
              >
                {/* Header: Code + Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <code className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {promo.code}
                    </code>
                    <button
                      onClick={() => handleCopy(promo.code, promo.id)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Copy code"
                    >
                      {copiedId === promo.id ? (
                        <IoCheckmarkOutline className="w-4 h-4 text-green-500" />
                      ) : (
                        <IoCopyOutline className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                {/* Title */}
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                  {promo.title}
                </p>

                {/* Description */}
                {promo.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {promo.description}
                  </p>
                )}

                {/* Discount */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Discount: </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {promo.discountType === 'percentage'
                        ? `${promo.discountValue}%`
                        : `$${promo.discountValue.toFixed(2)}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Usage: </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {promo.usedCount}
                      {promo.maxUses !== null ? `/${promo.maxUses}` : ''}
                    </span>
                  </div>
                </div>

                {/* Min Booking Amount */}
                {promo.minBookingAmount !== null && promo.minBookingAmount > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Min booking: ${promo.minBookingAmount.toFixed(2)}
                  </p>
                )}

                {/* Dates */}
                <div className="text-xs text-gray-400 dark:text-gray-500 mb-3 space-y-0.5">
                  {promo.startsAt && (
                    <p>Starts: {new Date(promo.startsAt).toLocaleDateString()}</p>
                  )}
                  {promo.expiresAt && (
                    <p>Expires: {new Date(promo.expiresAt).toLocaleDateString()}</p>
                  )}
                  <p>Created: {new Date(promo.createdAt).toLocaleDateString()}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handleToggle(promo.id)}
                    disabled={togglingId === promo.id || !!isExpired}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      promo.isActive
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                        : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {togglingId === promo.id
                      ? 'Updating...'
                      : promo.isActive
                        ? 'Deactivate'
                        : 'Activate'}
                  </button>

                  {confirmDeleteId === promo.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(promo.id)}
                        disabled={deletingId === promo.id}
                        className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                      >
                        {deletingId === promo.id ? '...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(promo.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <IoTrashOutline className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

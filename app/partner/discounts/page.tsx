// app/partner/discounts/page.tsx
// Partner Discount Manager - Create and manage promotional codes

'use client'

import { useState, useEffect } from 'react'
import {
  IoPricetagOutline,
  IoAddCircleOutline,
  IoSearchOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoToggleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoCopyOutline,
  IoCheckmarkOutline
} from 'react-icons/io5'

interface Discount {
  id: string
  code: string
  title: string
  description: string | null
  percentage: number
  maxUses: number | null
  usedCount: number
  startsAt: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

interface NewDiscount {
  code: string
  title: string
  description: string
  percentage: number
  maxUses: string
  startsAt: string
  expiresAt: string
}

export default function PartnerDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [newDiscount, setNewDiscount] = useState<NewDiscount>({
    code: '',
    title: '',
    description: '',
    percentage: 10,
    maxUses: '',
    startsAt: '',
    expiresAt: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const fetchDiscounts = async () => {
    try {
      const res = await fetch('/api/partner/discounts')
      const data = await res.json()
      if (data.success) {
        setDiscounts(data.discounts)
      }
    } catch (error) {
      console.error('Failed to fetch discounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newDiscount.code || !newDiscount.title || newDiscount.percentage <= 0) {
      return
    }

    setIsSaving(true)

    try {
      const res = await fetch('/api/partner/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDiscount,
          maxUses: newDiscount.maxUses ? parseInt(newDiscount.maxUses) : null
        })
      })

      const data = await res.json()

      if (data.success) {
        setDiscounts(prev => [data.discount, ...prev])
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to create discount:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async (discountId: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/partner/discounts/${discountId}/toggle`, {
        method: 'POST'
      })

      if (res.ok) {
        setDiscounts(prev =>
          prev.map(d =>
            d.id === discountId ? { ...d, isActive: !currentState } : d
          )
        )
      }
    } catch (error) {
      console.error('Failed to toggle discount:', error)
    }
  }

  const handleDelete = async (discountId: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return

    try {
      const res = await fetch(`/api/partner/discounts/${discountId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setDiscounts(prev => prev.filter(d => d.id !== discountId))
      }
    } catch (error) {
      console.error('Failed to delete discount:', error)
    }
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const resetForm = () => {
    setNewDiscount({
      code: '',
      title: '',
      description: '',
      percentage: 10,
      maxUses: '',
      startsAt: '',
      expiresAt: ''
    })
    setEditingDiscount(null)
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewDiscount(prev => ({ ...prev, code }))
  }

  const getStatusBadge = (discount: Discount) => {
    const now = new Date()
    const startsAt = discount.startsAt ? new Date(discount.startsAt) : null
    const expiresAt = discount.expiresAt ? new Date(discount.expiresAt) : null

    if (!discount.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          <IoCloseCircleOutline className="w-3 h-3" />
          Inactive
        </span>
      )
    }

    if (expiresAt && expiresAt < now) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <IoTimeOutline className="w-3 h-3" />
          Expired
        </span>
      )
    }

    if (startsAt && startsAt > now) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
          <IoTimeOutline className="w-3 h-3" />
          Scheduled
        </span>
      )
    }

    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
          <IoCheckmarkCircleOutline className="w-3 h-3" />
          Maxed Out
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
        <IoCheckmarkCircleOutline className="w-3 h-3" />
        Active
      </span>
    )
  }

  const filteredDiscounts = discounts.filter(d =>
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discounts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage promotional codes for your fleet
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <IoAddCircleOutline className="w-5 h-5" />
          Create Discount
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search discounts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Discounts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredDiscounts.length === 0 ? (
          <div className="text-center py-12">
            <IoPricetagOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {discounts.length === 0 ? 'No discount codes yet' : 'No discounts match your search'}
            </p>
            {discounts.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors mt-4"
              >
                <IoAddCircleOutline className="w-5 h-5" />
                Create Your First Discount
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {discount.code}
                        </span>
                        <button
                          onClick={() => copyCode(discount.code, discount.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {copiedId === discount.id ? (
                            <IoCheckmarkOutline className="w-4 h-4 text-green-500" />
                          ) : (
                            <IoCopyOutline className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {discount.title}
                      </p>
                      {discount.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {discount.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {discount.percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {discount.usedCount}
                        {discount.maxUses && ` / ${discount.maxUses}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(discount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(discount.id, discount.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            discount.isActive
                              ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title={discount.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <IoToggleOutline className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <IoTrashOutline className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Create Discount Code
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g., SAVE20"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono uppercase placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newDiscount.title}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., New Driver Special"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newDiscount.description}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder="Describe this promotion..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newDiscount.percentage}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, percentage: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Uses (optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newDiscount.maxUses}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, maxUses: e.target.value }))}
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date (optional)
                  </label>
                  <input
                    type="date"
                    value={newDiscount.startsAt}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, startsAt: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={newDiscount.expiresAt}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving || !newDiscount.code || !newDiscount.title || newDiscount.percentage <= 0}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
              >
                {isSaving ? 'Creating...' : 'Create Discount'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

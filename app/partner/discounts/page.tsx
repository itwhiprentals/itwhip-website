// app/partner/discounts/page.tsx
// Partner Discount Manager - Promo codes, deposits, and vehicle pricing

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoPricetagOutline,
  IoAddCircleOutline,
  IoSearchOutline,
  IoTrashOutline,
  IoToggleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
  IoWalletOutline,
  IoSaveOutline,
  IoCarOutline,
  IoCreateOutline,
  IoChevronForwardOutline,
  IoPencilOutline
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

interface DepositSettings {
  requireDeposit: boolean
  depositAmount: number
  globalDiscountPercent: number
}

interface FleetVehicle {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  discountPercent: number
  customDepositAmount: number | null
  photo: string | null
  isActive: boolean
  estimatedValue: number | null
}

export default function PartnerDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
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

  // Settings state
  const [depositSettings, setDepositSettings] = useState<DepositSettings>({
    requireDeposit: true,
    depositAmount: 500,
    globalDiscountPercent: 0
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  // Per-car editing state
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)
  const [vehicleEdits, setVehicleEdits] = useState<{
    discountPercent: number
    customDepositAmount: string
  }>({ discountPercent: 0, customDepositAmount: '' })
  const [isSavingVehicle, setIsSavingVehicle] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch all data in parallel
      const [discountsRes, settingsRes, fleetRes] = await Promise.all([
        fetch('/api/partner/discounts'),
        fetch('/api/partner/settings'),
        fetch('/api/partner/fleet')
      ])

      const [discountsData, settingsData, fleetData] = await Promise.all([
        discountsRes.json(),
        settingsRes.json(),
        fleetRes.json()
      ])

      if (discountsData.success) {
        setDiscounts(discountsData.discounts)
      }

      if (settingsData.success && settingsData.host) {
        setDepositSettings({
          requireDeposit: settingsData.host.requireDeposit ?? true,
          depositAmount: settingsData.host.depositAmount ?? 500,
          globalDiscountPercent: settingsData.host.globalDiscountPercent ?? 0
        })
      }

      if (fleetData.success && fleetData.vehicles) {
        setVehicles(fleetData.vehicles.map((v: any) => ({
          id: v.id,
          make: v.make,
          model: v.model,
          year: v.year,
          dailyRate: v.dailyRate,
          discountPercent: v.discountPercent ?? 0,
          customDepositAmount: v.customDepositAmount,
          photo: v.photos?.[0]?.url || null,
          isActive: v.isActive,
          estimatedValue: v.estimatedValue
        })))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSavingSettings(true)
    try {
      const res = await fetch('/api/partner/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requireDeposit: depositSettings.requireDeposit,
          depositAmount: depositSettings.depositAmount,
          globalDiscountPercent: depositSettings.globalDiscountPercent
        })
      })
      const data = await res.json()
      if (data.success) {
        setSettingsSaved(true)
        setTimeout(() => setSettingsSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSavingSettings(false)
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

  const startEditingVehicle = (vehicle: FleetVehicle) => {
    setEditingVehicleId(vehicle.id)
    // Show the actual deposit on this vehicle (custom or global default)
    const effectiveDeposit = vehicle.customDepositAmount ?? depositSettings.depositAmount
    setVehicleEdits({
      discountPercent: vehicle.discountPercent,
      customDepositAmount: effectiveDeposit.toString()
    })
  }

  const cancelEditingVehicle = () => {
    setEditingVehicleId(null)
    setVehicleEdits({ discountPercent: 0, customDepositAmount: '' })
  }

  const saveVehicleSettings = async (vehicleId: string) => {
    setIsSavingVehicle(true)
    try {
      const res = await fetch(`/api/partner/fleet/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountPercent: vehicleEdits.discountPercent,
          customDepositAmount: vehicleEdits.customDepositAmount || null
        })
      })

      const data = await res.json()

      if (data.success) {
        setVehicles(prev =>
          prev.map(v =>
            v.id === vehicleId
              ? {
                  ...v,
                  discountPercent: vehicleEdits.discountPercent,
                  customDepositAmount: vehicleEdits.customDepositAmount
                    ? parseFloat(vehicleEdits.customDepositAmount)
                    : null
                }
              : v
          )
        )
        setEditingVehicleId(null)
      }
    } catch (error) {
      console.error('Failed to save vehicle settings:', error)
    } finally {
      setIsSavingVehicle(false)
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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discounts & Pricing</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage promo codes, deposits, and vehicle pricing
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <IoAddCircleOutline className="w-5 h-5" />
          Create Promo Code
        </button>
      </div>

      {/* Global Settings Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <IoWalletOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Global Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Default deposit and discount settings for your entire fleet
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Deposit Settings */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={depositSettings.requireDeposit}
                onChange={(e) => setDepositSettings(prev => ({ ...prev, requireDeposit: e.target.checked }))}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Require deposit</span>
            </label>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Default Deposit Amount</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={depositSettings.depositAmount}
                  onChange={(e) => setDepositSettings(prev => ({ ...prev, depositAmount: parseFloat(e.target.value) || 0 }))}
                  disabled={!depositSettings.requireDeposit}
                  className="w-28 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Global Discount */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 dark:text-gray-300">
              Fleet-wide Discount
            </label>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Applies to all vehicles</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={depositSettings.globalDiscountPercent}
                  onChange={(e) => setDepositSettings(prev => ({ ...prev, globalDiscountPercent: parseFloat(e.target.value) || 0 }))}
                  className="w-20 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
              </div>
            </div>
            {depositSettings.globalDiscountPercent > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400">
                All vehicles will be {depositSettings.globalDiscountPercent}% off
              </p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex items-end">
            <button
              onClick={saveSettings}
              disabled={isSavingSettings}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isSavingSettings ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </>
              ) : settingsSaved ? (
                <>
                  <IoCheckmarkOutline className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <IoSaveOutline className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {!depositSettings.requireDeposit && (
          <p className="mt-4 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            Deposits are recommended to protect against damage and no-shows. Disabling may increase your risk.
          </p>
        )}

        {/* Quick Apply to Single Vehicle */}
        {vehicles.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quick Apply to Single Vehicle
            </h4>
            <div className="grid sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Select Vehicle</label>
                <select
                  value={editingVehicleId || ''}
                  onChange={(e) => {
                    const vehicleId = e.target.value
                    if (vehicleId) {
                      const vehicle = vehicles.find(v => v.id === vehicleId)
                      if (vehicle) {
                        startEditingVehicle(vehicle)
                      }
                    } else {
                      cancelEditingVehicle()
                    }
                  }}
                  className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.year} {v.make} {v.model} - ${v.dailyRate}/day
                    </option>
                  ))}
                </select>
              </div>
              {editingVehicleId && (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Discount %</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={vehicleEdits.discountPercent}
                      onChange={(e) => setVehicleEdits(prev => ({ ...prev, discountPercent: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Deposit $
                      {(() => {
                        const selectedVehicle = vehicles.find(v => v.id === editingVehicleId)
                        return selectedVehicle?.customDepositAmount === null ? (
                          <span className="text-blue-500 dark:text-blue-400 ml-1">(global)</span>
                        ) : (
                          <span className="text-green-500 dark:text-green-400 ml-1">(custom)</span>
                        )
                      })()}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={vehicleEdits.customDepositAmount}
                      onChange={(e) => setVehicleEdits(prev => ({ ...prev, customDepositAmount: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
            {editingVehicleId && (
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => saveVehicleSettings(editingVehicleId)}
                  disabled={isSavingVehicle}
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isSavingVehicle ? 'Saving...' : 'Apply to Vehicle'}
                </button>
                <button
                  onClick={cancelEditingVehicle}
                  className="px-4 py-1.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vehicle Pricing Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <IoCarOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Per-Vehicle Pricing</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Override discounts and deposits for specific vehicles
                </p>
              </div>
            </div>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <IoCarOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No vehicles in your fleet</p>
            <Link
              href="/partner/fleet/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors mt-4"
            >
              <IoAddCircleOutline className="w-5 h-5" />
              Add Your First Vehicle
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {/* Main row - Vehicle info and actions */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Vehicle Photo */}
                  <div className="w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    {vehicle.photo ? (
                      <Image
                        src={vehicle.photo}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        width={64}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoCarOutline className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Vehicle Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h4>
                      {!vehicle.isActive && (
                        <span className="px-1.5 py-0.5 text-[10px] sm:text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                      ${vehicle.dailyRate}/day
                      {vehicle.discountPercent > 0 && (
                        <span className="text-green-600 dark:text-green-400 ml-1 sm:ml-2">
                          -{vehicle.discountPercent}%
                        </span>
                      )}
                      {vehicle.customDepositAmount !== null && (
                        <span className="text-blue-600 dark:text-blue-400 ml-1 sm:ml-2">
                          ${vehicle.customDepositAmount} dep
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Desktop Edit Button - hidden on mobile when editing */}
                  {editingVehicleId !== vehicle.id && (
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEditingVehicle(vehicle)}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <IoPencilOutline className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit Pricing</span>
                      </button>
                      <Link
                        href={`/partner/fleet/${vehicle.id}/edit`}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                      >
                        <IoChevronForwardOutline className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Edit Form - Stacked on mobile, inline on desktop */}
                {editingVehicleId === vehicle.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4">
                      {/* Discount Input */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <label className="text-xs text-gray-500">Discount</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={vehicleEdits.discountPercent}
                            onChange={(e) => setVehicleEdits(prev => ({ ...prev, discountPercent: parseFloat(e.target.value) || 0 }))}
                            className="w-full sm:w-16 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>

                      {/* Deposit Input */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <label className="text-xs text-gray-500">
                          Deposit {vehicle.customDepositAmount === null ? (
                            <span className="text-blue-500">(global)</span>
                          ) : (
                            <span className="text-green-500">(custom)</span>
                          )}
                        </label>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">$</span>
                          <input
                            type="number"
                            min="0"
                            value={vehicleEdits.customDepositAmount}
                            onChange={(e) => setVehicleEdits(prev => ({ ...prev, customDepositAmount: e.target.value }))}
                            className="w-full sm:w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="col-span-2 flex items-center justify-end gap-2 sm:ml-auto">
                        <button
                          onClick={cancelEditingVehicle}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveVehicleSettings(vehicle.id)}
                          disabled={isSavingVehicle}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                        >
                          {isSavingVehicle ? '...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Promo Codes Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <IoPricetagOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Promo Codes</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Create promotional codes for customers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        {discounts.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search promo codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}

        {/* Codes List */}
        {filteredDiscounts.length === 0 ? (
          <div className="text-center py-12">
            <IoPricetagOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {discounts.length === 0 ? 'No promo codes yet' : 'No codes match your search'}
            </p>
            {discounts.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors mt-4"
              >
                <IoAddCircleOutline className="w-5 h-5" />
                Create Your First Code
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDiscounts.map((discount) => (
                <div key={discount.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start justify-between mb-2">
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
                    <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {discount.percentage}%
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {discount.title}
                  </p>
                  {discount.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {discount.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(discount)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Used: {discount.usedCount}{discount.maxUses && ` / ${discount.maxUses}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggle(discount.id, discount.isActive)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          discount.isActive
                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <IoToggleOutline className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(discount.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <IoTrashOutline className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
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
          </>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Create Promo Code
              </h2>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">

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
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving || !newDiscount.code || !newDiscount.title || newDiscount.percentage <= 0}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                {isSaving ? 'Creating...' : 'Create Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

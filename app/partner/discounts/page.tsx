// app/partner/discounts/page.tsx
// Partner Discounts & Deposits Management
//
// HYBRID deposit system with MODE SWITCHER:
// - Global Mode: All vehicles use host-level settings (can remove vehicles to individual)
// - Individual Mode: Configure each removed vehicle separately
//
// Plus promo codes management

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
  IoGlobeOutline,
  IoListOutline,
  IoWarningOutline,
  IoAddOutline,
  IoCloseOutline,
  IoRemoveCircleOutline,
  IoArrowBackOutline,
  IoSwapHorizontalOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'
import { useTranslations } from 'next-intl'

// Types
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

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  dailyRate: number
  photo: string | null
  isActive: boolean
  vehicleDepositMode: 'global' | 'individual'
  requireDeposit: boolean
  depositAmount: number | null
}

interface DepositSettings {
  global: {
    requireDeposit: boolean
    defaultAmount: number
    makeDeposits: Record<string, number>
  }
  makes: string[]
  counts: {
    global: number
    individual: number
    total: number
  }
  vehicles: Vehicle[]
}

// Rate-based fallback deposit - MUST match BookingWidget's getCarClassAndDefaultDeposit exactly!
// economy (<$150/day) = $250, luxury ($150-499/day) = $700, exotic ($500+/day) = $1000
function getRateBasedDeposit(dailyRate: number): number {
  if (dailyRate < 150) return 250      // economy
  if (dailyRate < 500) return 700      // luxury
  return 1000                           // exotic
}

// Calculate effective deposit exactly like BookingWidget
// This ensures the discounts page shows the same deposit the customer sees
function getEffectiveDeposit(
  vehicle: Vehicle,
  globalSettings: DepositSettings['global']
): number {
  // INDIVIDUAL MODE: vehicle-specific settings
  if (vehicle.vehicleDepositMode === 'individual') {
    if (!vehicle.requireDeposit) return 0
    if (vehicle.depositAmount !== null && vehicle.depositAmount !== undefined) {
      return vehicle.depositAmount
    }
    // Fallback to rate-based
    return getRateBasedDeposit(vehicle.dailyRate)
  }

  // GLOBAL MODE: host-level settings
  if (!globalSettings.requireDeposit) return 0

  // Check for make-specific override
  const makeOverride = globalSettings.makeDeposits[vehicle.make]
  if (makeOverride !== undefined) {
    return makeOverride
  }

  // Use global default if set
  if (globalSettings.defaultAmount) {
    return globalSettings.defaultAmount
  }

  // Fallback to rate-based
  return getRateBasedDeposit(vehicle.dailyRate)
}

export default function PartnerDiscountsPage() {
  const t = useTranslations('PartnerDiscounts')
  // View mode: which section to display
  const [viewMode, setViewMode] = useState<'global' | 'individual'>('global')

  // Deposit state
  const [depositSettings, setDepositSettings] = useState<DepositSettings>({
    global: {
      requireDeposit: true,
      defaultAmount: 500,
      makeDeposits: {}
    },
    makes: [],
    counts: { global: 0, individual: 0, total: 0 },
    vehicles: []
  })
  const [isSavingGlobal, setIsSavingGlobal] = useState(false)
  const [isSavingIndividual, setIsSavingIndividual] = useState(false)
  const [globalSaved, setGlobalSaved] = useState(false)
  const [individualSaved, setIndividualSaved] = useState(false)

  // Individual mode edits (only for vehicles in individual mode)
  const [vehicleEdits, setVehicleEdits] = useState<Record<string, { requireDeposit: boolean; depositAmount: number | null }>>({})

  // Promo codes state
  const [discounts, setDiscounts] = useState<Discount[]>([])
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

  // New make input for global mode
  const [newMake, setNewMake] = useState('')
  const [newMakeAmount, setNewMakeAmount] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [depositRes, discountsRes] = await Promise.all([
        fetch('/api/partner/deposit-settings'),
        fetch('/api/partner/discounts')
      ])

      const [depositData, discountsData] = await Promise.all([
        depositRes.json(),
        discountsRes.json()
      ])

      if (depositData.success) {
        setDepositSettings({
          global: depositData.global,
          makes: depositData.makes || [],
          counts: depositData.counts || { global: 0, individual: 0, total: 0 },
          vehicles: depositData.vehicles || []
        })

        // Initialize vehicle edits for individual mode vehicles only
        const edits: Record<string, { requireDeposit: boolean; depositAmount: number | null }> = {}
        depositData.vehicles?.forEach((v: Vehicle) => {
          if (v.vehicleDepositMode === 'individual') {
            edits[v.id] = {
              requireDeposit: v.requireDeposit,
              depositAmount: v.depositAmount
            }
          }
        })
        setVehicleEdits(edits)
      }

      if (discountsData.success) {
        setDiscounts(discountsData.discounts)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter vehicles by mode
  const globalVehicles = depositSettings.vehicles.filter(v => v.vehicleDepositMode === 'global')
  const individualVehicles = depositSettings.vehicles.filter(v => v.vehicleDepositMode === 'individual')

  // Move a vehicle from Global to Individual
  const moveToIndividual = async (vehicleId: string) => {
    const vehicle = depositSettings.vehicles.find(v => v.id === vehicleId)
    if (!vehicle) return

    // Confirm before removing from global
    const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
    const confirmed = window.confirm(
      t('removeFromGlobalConfirm', { vehicle: vehicleName })
    )
    if (!confirmed) return

    // Initialize edit state with global defaults
    setVehicleEdits(prev => ({
      ...prev,
      [vehicleId]: {
        requireDeposit: depositSettings.global.requireDeposit,
        depositAmount: depositSettings.global.makeDeposits[vehicle.make] ?? depositSettings.global.defaultAmount
      }
    }))

    try {
      const res = await fetch('/api/partner/vehicles/bulk-deposits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicles: [{
            id: vehicleId,
            vehicleDepositMode: 'individual',
            requireDeposit: depositSettings.global.requireDeposit,
            depositAmount: depositSettings.global.makeDeposits[vehicle.make] ?? depositSettings.global.defaultAmount
          }]
        })
      })

      if (res.ok) {
        // Refresh data
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to move vehicle to individual:', error)
    }
  }

  // Move a vehicle from Individual back to Global
  const moveToGlobal = async (vehicleId: string) => {
    try {
      const res = await fetch('/api/partner/vehicles/bulk-deposits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicles: [{
            id: vehicleId,
            vehicleDepositMode: 'global'
          }]
        })
      })

      if (res.ok) {
        // Remove from edits
        setVehicleEdits(prev => {
          const updated = { ...prev }
          delete updated[vehicleId]
          return updated
        })
        // Refresh data
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to move vehicle to global:', error)
    }
  }

  const saveGlobalSettings = async () => {
    setIsSavingGlobal(true)
    try {
      // Normalize: round default amount to nearest $25, min $25
      const normalizedGlobal = {
        ...depositSettings.global,
        defaultAmount: depositSettings.global.requireDeposit
          ? Math.max(25, Math.round(depositSettings.global.defaultAmount / 25) * 25)
          : depositSettings.global.defaultAmount,
        // Also normalize make deposits to nearest $25
        makeDeposits: Object.fromEntries(
          Object.entries(depositSettings.global.makeDeposits).map(([make, amount]) => [
            make,
            Math.max(25, Math.round(amount / 25) * 25)
          ])
        )
      }

      // Update local state with normalized values
      setDepositSettings(prev => ({ ...prev, global: normalizedGlobal }))

      const res = await fetch('/api/partner/deposit-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          global: normalizedGlobal
        })
      })

      if (res.ok) {
        setGlobalSaved(true)
        setTimeout(() => setGlobalSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save global settings:', error)
    } finally {
      setIsSavingGlobal(false)
    }
  }

  const saveIndividualSettings = async () => {
    setIsSavingIndividual(true)
    try {
      // Build vehicles array with their edits
      const vehicles = individualVehicles.map(vehicle => {
        const edit = vehicleEdits[vehicle.id] || { requireDeposit: true, depositAmount: depositSettings.global.defaultAmount }

        // Validate and normalize: if deposit is required but amount is empty/invalid -> disable deposit
        const hasValidAmount = edit.depositAmount !== null &&
                               edit.depositAmount !== undefined &&
                               edit.depositAmount >= 25

        const requireDeposit = edit.requireDeposit && hasValidAmount
        const depositAmount = requireDeposit ? Math.round(edit.depositAmount! / 25) * 25 : null

        return {
          id: vehicle.id,
          vehicleDepositMode: 'individual' as const,
          requireDeposit,
          depositAmount
        }
      })

      if (vehicles.length > 0) {
        const res = await fetch('/api/partner/vehicles/bulk-deposits', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicles })
        })

        if (res.ok) {
          setIndividualSaved(true)
          setTimeout(() => setIndividualSaved(false), 3000)
          // Refresh data to get updated values
          await fetchData()
        }
      } else {
        setIndividualSaved(true)
        setTimeout(() => setIndividualSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save individual settings:', error)
    } finally {
      setIsSavingIndividual(false)
    }
  }

  const addMakeDeposit = () => {
    if (!newMake || !newMakeAmount) return
    const rawAmount = parseFloat(newMakeAmount)
    if (isNaN(rawAmount) || rawAmount < 25) return

    // Round to nearest $25
    const amount = Math.round(rawAmount / 25) * 25

    setDepositSettings(prev => ({
      ...prev,
      global: {
        ...prev.global,
        makeDeposits: {
          ...prev.global.makeDeposits,
          [newMake]: amount
        }
      }
    }))
    setNewMake('')
    setNewMakeAmount('')
  }

  const removeMakeDeposit = (make: string) => {
    setDepositSettings(prev => {
      const newMakeDeposits = { ...prev.global.makeDeposits }
      delete newMakeDeposits[make]
      return {
        ...prev,
        global: {
          ...prev.global,
          makeDeposits: newMakeDeposits
        }
      }
    })
  }

  // Promo code functions
  const handleCreate = async () => {
    if (!newDiscount.code || !newDiscount.title || newDiscount.percentage <= 0) return
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
      const res = await fetch(`/api/partner/discounts/${discountId}/toggle`, { method: 'POST' })
      if (res.ok) {
        setDiscounts(prev => prev.map(d => d.id === discountId ? { ...d, isActive: !currentState } : d))
      }
    } catch (error) {
      console.error('Failed to toggle discount:', error)
    }
  }

  const handleDelete = async (discountId: string) => {
    if (!confirm(t('deleteConfirm'))) return
    try {
      const res = await fetch(`/api/partner/discounts/${discountId}`, { method: 'DELETE' })
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
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"><IoCloseCircleOutline className="w-3 h-3" />{t('statusInactive')}</span>
    }
    if (expiresAt && expiresAt < now) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"><IoTimeOutline className="w-3 h-3" />{t('statusExpired')}</span>
    }
    if (startsAt && startsAt > now) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"><IoTimeOutline className="w-3 h-3" />{t('statusScheduled')}</span>
    }
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"><IoCheckmarkCircleOutline className="w-3 h-3" />{t('statusMaxedOut')}</span>
    }
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"><IoCheckmarkCircleOutline className="w-3 h-3" />{t('statusActive')}</span>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <IoAddCircleOutline className="w-5 h-5" />
          {t('createPromoCode')}
        </button>
      </div>

      {/* ========== DEPOSIT MANAGEMENT ========== */}
      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-3">
            {/* Global Mode Button */}
            <button
              onClick={() => setViewMode('global')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                viewMode === 'global'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  viewMode === 'global'
                    ? 'border-blue-500'
                    : 'border-gray-400'
                }`}>
                  {viewMode === 'global' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  )}
                </div>
                <IoGlobeOutline className={`w-5 h-5 ${viewMode === 'global' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
              </div>
              <h4 className={`font-medium ${viewMode === 'global' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                {t('globalMode')}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('globalModeDescription')}
              </p>
              <span className="inline-block mt-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {t('vehicleCount', { count: globalVehicles.length })}
              </span>
            </button>

            {/* Individual Mode Button */}
            <button
              onClick={() => setViewMode('individual')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                viewMode === 'individual'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  viewMode === 'individual'
                    ? 'border-purple-500'
                    : 'border-gray-400'
                }`}>
                  {viewMode === 'individual' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  )}
                </div>
                <IoListOutline className={`w-5 h-5 ${viewMode === 'individual' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`} />
              </div>
              <h4 className={`font-medium ${viewMode === 'individual' ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-white'}`}>
                {t('individualMode')}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('individualModeDescription')}
              </p>
              <span className="inline-block mt-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                {t('vehicleCount', { count: individualVehicles.length })}
              </span>
            </button>
      </div>

      {/* ===== GLOBAL MODE VIEW ===== */}
      {viewMode === 'global' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 space-y-6">
            {/* Require Deposits Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">{t('requireDeposits')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t('requireDepositsDescription')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDepositSettings(prev => ({
                  ...prev,
                  global: { ...prev.global, requireDeposit: !prev.global.requireDeposit }
                }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  depositSettings.global.requireDeposit ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={depositSettings.global.requireDeposit}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  depositSettings.global.requireDeposit ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {depositSettings.global.requireDeposit ? (
              <>
                {/* Default Deposit Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('defaultDepositAmount')}
                  </label>
                  <div className="flex items-center gap-2 max-w-xs">
                    <span className="text-gray-500 dark:text-gray-400">$</span>
                    <input
                      type="number"
                      min="25"
                      step="25"
                      value={depositSettings.global.defaultAmount}
                      onChange={(e) => setDepositSettings(prev => ({
                        ...prev,
                        global: { ...prev.global, defaultAmount: parseFloat(e.target.value) || 25 }
                      }))}
                      className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('minIncrements')}
                  </p>
                </div>

                {/* Per-Make Overrides */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('adjustByMake')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {t('adjustByMakeDescription')}
                  </p>

                  {/* Existing make deposits */}
                  {Object.keys(depositSettings.global.makeDeposits).length > 0 && (
                    <div className="space-y-2 mb-3">
                      {Object.entries(depositSettings.global.makeDeposits).map(([make, amount]) => (
                        <div key={make} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <span className="font-medium text-gray-900 dark:text-white flex-1">{make}</span>
                          <span className="text-gray-600 dark:text-gray-300">${amount}</span>
                          <button
                            onClick={() => removeMakeDeposit(make)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          >
                            <IoCloseOutline className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new make deposit */}
                  <div className="flex items-center gap-2">
                    <select
                      value={newMake}
                      onChange={(e) => setNewMake(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('selectMake')}</option>
                      {depositSettings.makes
                        .filter(m => !depositSettings.global.makeDeposits[m])
                        .map(make => (
                          <option key={make} value={make}>{make}</option>
                        ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        min="25"
                        step="25"
                        placeholder="250"
                        value={newMakeAmount}
                        onChange={(e) => setNewMakeAmount(e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={addMakeDeposit}
                      disabled={!newMake || !newMakeAmount}
                      className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg"
                    >
                      <IoAddOutline className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      {t('noProtection')}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      {t('noProtectionDescription')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* All Vehicles - Global shown active, Individual shown grayed out */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('yourFleet')}
                </label>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <IoRemoveCircleOutline className="w-3.5 h-3.5 text-red-500" /> {t('remove')}
                  </span>
                  <span className="flex items-center gap-1">
                    <IoAddCircleOutline className="w-3.5 h-3.5 text-green-500" /> {t('addBack')}
                  </span>
                </div>
              </div>
              {depositSettings.vehicles.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <IoCarOutline className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('noVehiclesInFleet')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {depositSettings.vehicles.map((vehicle) => {
                    const isIndividual = vehicle.vehicleDepositMode === 'individual'

                    // Calculate effective deposit exactly like BookingWidget
                    const effectiveDeposit = getEffectiveDeposit(vehicle, depositSettings.global)

                    // Check if this vehicle has a make-specific override (for display)
                    const hasMakeOverride = !isIndividual && depositSettings.global.makeDeposits[vehicle.make] !== undefined

                    return (
                      <div
                        key={vehicle.id}
                        className={`p-3 rounded-lg transition-all ${
                          isIndividual
                            ? 'bg-gray-100 dark:bg-gray-800 opacity-60'
                            : 'bg-gray-50 dark:bg-gray-700/50'
                        }`}
                      >
                        {/* Top Row: Photo + Vehicle Name + Action Button */}
                        <div className="flex items-start gap-3">
                          {/* Vehicle Photo */}
                          <div className={`w-14 h-10 sm:w-12 sm:h-9 rounded overflow-hidden flex-shrink-0 ${
                            isIndividual ? 'grayscale' : ''
                          } bg-gray-200 dark:bg-gray-600`}>
                            {vehicle.photo ? (
                              <Image
                                src={vehicle.photo}
                                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                width={56}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <IoCarOutline className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Vehicle Info - Full name, no truncation */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium leading-tight ${
                              isIndividual
                                ? 'text-gray-500 dark:text-gray-400'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {t('perDay', { rate: vehicle.dailyRate })}
                            </p>
                          </div>

                          {/* Action Button */}
                          {isIndividual ? (
                            <button
                              onClick={() => moveToGlobal(vehicle.id)}
                              className="p-1.5 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors flex-shrink-0"
                              title={t('addBackToGlobal')}
                            >
                              <IoAddCircleOutline className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => moveToIndividual(vehicle.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors flex-shrink-0"
                              title={t('configureIndividually')}
                            >
                              <IoRemoveCircleOutline className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        {/* Bottom Row: Deposit Amount + Badge */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          {isIndividual && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                              {t('individual')}
                            </span>
                          )}
                          {!isIndividual && <div />}

                          {/* Deposit Amount */}
                          <div className="text-right">
                            {effectiveDeposit > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{t('deposit')}</span>
                                <span className={`text-sm font-semibold ${isIndividual ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
                                  ${effectiveDeposit}
                                </span>
                                {hasMakeOverride && (
                                  <span className="text-xs text-blue-600 dark:text-blue-400">({vehicle.make})</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <IoWarningOutline className="w-3.5 h-3.5" />
                                {t('noDeposit')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Info about Individual Mode */}
            {individualVehicles.length > 0 && (
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-300 flex items-center gap-2">
                  <IoListOutline className="w-4 h-4 flex-shrink-0" />
                  {t('individualVehiclesInfo', { count: individualVehicles.length })}
                </p>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={saveGlobalSettings}
                disabled={isSavingGlobal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isSavingGlobal ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {t('saving')}
                  </>
                ) : globalSaved ? (
                  <>
                    <IoCheckmarkOutline className="w-4 h-4" />
                    {t('saved')}
                  </>
                ) : (
                  <>
                    <IoSaveOutline className="w-4 h-4" />
                    {t('saveGlobalSettings')}
                  </>
                )}
          </button>
        </div>
        </div>
      )}

      {/* ===== INDIVIDUAL MODE VIEW ===== */}
      {viewMode === 'individual' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            {individualVehicles.length === 0 ? (
              <div className="text-center py-8">
                <IoCarOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {t('noVehiclesIndividualYet')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  {t('removeFromGlobalToConfigureHere')}
                </p>
                <button
                  onClick={() => setViewMode('global')}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <IoGlobeOutline className="w-4 h-4" />
                  {t('goToGlobalMode')}
                </button>
              </div>
            ) : (
              <>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg mb-4">
                  <p className="text-sm text-purple-800 dark:text-purple-300">
                    {t('individualModeInfo')}
                  </p>
                </div>

                <div className="space-y-3">
                  {individualVehicles.map((vehicle) => {
                    const edit = vehicleEdits[vehicle.id] || { requireDeposit: true, depositAmount: depositSettings.global.defaultAmount }

                    return (
                      <div
                        key={vehicle.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        {/* Top Row: Photo + Vehicle Name + Back Button */}
                        <div className="flex items-start gap-3">
                          {/* Vehicle Photo */}
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
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
                                <IoCarOutline className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Vehicle Info - Full name, no truncation */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white leading-tight">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              {t('perDay', { rate: vehicle.dailyRate })}
                            </p>
                          </div>

                          {/* Move back to Global Button */}
                          <button
                            onClick={() => moveToGlobal(vehicle.id)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors flex-shrink-0"
                            title={t('useGlobalSettings')}
                          >
                            <IoArrowBackOutline className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Bottom Row: Toggle + Deposit Amount */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          {/* Toggle with Label */}
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setVehicleEdits(prev => ({
                                ...prev,
                                [vehicle.id]: {
                                  ...edit,
                                  requireDeposit: !edit.requireDeposit
                                }
                              }))}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                edit.requireDeposit ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                              role="switch"
                              aria-checked={edit.requireDeposit}
                            >
                              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                edit.requireDeposit ? 'translate-x-5' : 'translate-x-0'
                              }`} />
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {edit.requireDeposit ? t('depositOn') : t('depositOff')}
                            </span>
                          </div>

                          {/* Deposit Amount Input or Warning */}
                          {edit.requireDeposit ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500 dark:text-gray-400">$</span>
                                <input
                                  type="number"
                                  min="25"
                                  step="25"
                                  placeholder="250"
                                  value={edit.depositAmount || ''}
                                  onChange={(e) => setVehicleEdits(prev => ({
                                    ...prev,
                                    [vehicle.id]: {
                                      ...edit,
                                      depositAmount: parseFloat(e.target.value) || null
                                    }
                                  }))}
                                  className={`w-24 px-2 py-1.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                    !edit.depositAmount || edit.depositAmount < 25
                                      ? 'border-amber-400 dark:border-amber-500'
                                      : 'border-gray-300 dark:border-gray-600'
                                  }`}
                                />
                              </div>
                              {(!edit.depositAmount || edit.depositAmount < 25) && (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400">
                                  {t('minAmount')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <IoWarningOutline className="w-4 h-4" />
                              {t('noDeposit')}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={saveIndividualSettings}
                    disabled={isSavingIndividual}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {isSavingIndividual ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        {t('saving')}
                      </>
                    ) : individualSaved ? (
                      <>
                        <IoCheckmarkOutline className="w-4 h-4" />
                        {t('saved')}
                      </>
                    ) : (
                      <>
                        <IoSaveOutline className="w-4 h-4" />
                        {t('saveIndividualSettings')}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
        </div>
      )}

      {/* ========== PROMO CODES SECTION ========== */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <IoPricetagOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('promoCodes')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {t('promoCodesDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Promo code payout info banner */}
        <div className="px-5 pt-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                When you offer promo codes, the platform service fee is still calculated on the full booking amount. The discount is covered by your payout. If your payout balance doesn&apos;t cover it, the difference will be charged to your card on file.
              </p>
            </div>
          </div>
        </div>

        {discounts.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchPromoCodes')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}

        {filteredDiscounts.length === 0 ? (
          <div className="text-center py-12">
            <IoPricetagOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {discounts.length === 0 ? t('noPromoCodesYet') : t('noCodesMatchSearch')}
            </p>
            {discounts.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors mt-4"
              >
                <IoAddCircleOutline className="w-5 h-5" />
                {t('createYourFirstCode')}
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredDiscounts.map((discount) => (
              <div key={discount.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
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
                      {getStatusBadge(discount)}
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{discount.title}</p>
                    {discount.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{discount.description}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {discount.maxUses
                        ? t('usedWithMax', { usedCount: discount.usedCount, maxUses: discount.maxUses })
                        : t('used', { usedCount: discount.usedCount })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {discount.percentage}%
                    </span>
                    <button
                      onClick={() => handleToggle(discount.id, discount.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        discount.isActive
                          ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <IoToggleOutline className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(discount.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <IoTrashOutline className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Promo Code Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('createPromoCodeTitle')}</h2>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('codeLabel')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder={t('codePlaceholder')}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono uppercase placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('generate')}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('titleLabel')}</label>
                <input
                  type="text"
                  value={newDiscount.title}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('titlePlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('descriptionLabel')}</label>
                <textarea
                  value={newDiscount.description}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('discountPercent')}</label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('maxUsesLabel')}</label>
                  <input
                    type="number"
                    min="1"
                    value={newDiscount.maxUses}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, maxUses: e.target.value }))}
                    placeholder={t('maxUsesPlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('startDateLabel')}</label>
                  <input
                    type="date"
                    value={newDiscount.startsAt}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, startsAt: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('endDateLabel')}</label>
                  <input
                    type="date"
                    value={newDiscount.expiresAt}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => { setShowModal(false); resetForm() }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving || !newDiscount.code || !newDiscount.title || newDiscount.percentage <= 0}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
              >
                {isSaving ? t('creating') : t('createCode')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

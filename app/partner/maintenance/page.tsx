// app/partner/maintenance/page.tsx
// Partner Maintenance Dashboard

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import {
  IoBuildOutline,
  IoCarOutline,
  IoAddOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoReceiptOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoFilterOutline,
  IoCloseOutline,
  IoDocumentOutline,
  IoLocationOutline,
  IoSpeedometerOutline
} from 'react-icons/io5'

interface MaintenanceRecord {
  id: string
  carId: string
  vehicleName: string
  vehiclePhoto: string | null
  serviceType: string
  serviceDate: string
  mileageAtService: number
  nextServiceDue: string | null
  nextServiceMileage: number | null
  shopName: string
  shopAddress: string
  technicianName: string | null
  invoiceNumber: string | null
  receiptUrl: string
  itemsServiced: string[]
  costTotal: number
  notes: string | null
  dueStatus: 'ok' | 'due_soon' | 'overdue'
  currentMileage: number
}

interface Vehicle {
  id: string
  name: string
}

interface Stats {
  total: number
  overdue: number
  dueSoon: number
  upToDate: number
  totalCost: number
}

const SERVICE_TYPE_KEYS: Record<string, string> = {
  OIL_CHANGE: 'serviceOilChange',
  STATE_INSPECTION: 'serviceStateInspection',
  TIRE_ROTATION: 'serviceTireRotation',
  BRAKE_CHECK: 'serviceBrakeCheck',
  FLUID_CHECK: 'serviceFluidCheck',
  BATTERY_CHECK: 'serviceBatteryCheck',
  AIR_FILTER: 'serviceAirFilter',
  MAJOR_SERVICE_30K: 'serviceMajor30K',
  MAJOR_SERVICE_60K: 'serviceMajor60K',
  MAJOR_SERVICE_90K: 'serviceMajor90K',
  CUSTOM: 'serviceCustom'
}

export default function MaintenancePage() {
  const t = useTranslations('PartnerMaintenance')

  const locale = useLocale()
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, overdue: 0, dueSoon: 0, upToDate: 0, totalCost: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'due_soon' | 'overdue'>('all')
  const [vehicleFilter, setVehicleFilter] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [filter, vehicleFilter])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('filter', filter)
      if (vehicleFilter) params.set('vehicleId', vehicleFilter)

      const response = await fetch(`/api/partner/maintenance?${params}`)
      const data = await response.json()

      if (data.success) {
        setRecords(data.records)
        setStats(data.stats)
        setVehicles(data.vehicles)
      }
    } catch (error) {
      console.error('Failed to fetch maintenance records:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getServiceTypeLabel = (serviceType: string) => {
    const key = SERVICE_TYPE_KEYS[serviceType]
    return key ? t(key) : serviceType
  }

  const getDueStatusBadge = (status: 'ok' | 'due_soon' | 'overdue') => {
    switch (status) {
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <IoWarningOutline className="w-3 h-3" />
            {t('badgeOverdue')}
          </span>
        )
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
            <IoTimeOutline className="w-3 h-3" />
            {t('badgeDueSoon')}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            <IoCheckmarkCircleOutline className="w-3 h-3" />
            {t('badgeUpToDate')}
          </span>
        )
    }
  }

  return (
    <div className="p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <IoAddOutline className="w-5 h-5" />
          {t('addServiceRecord')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overdue}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('statsOverdue')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <IoTimeOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.dueSoon}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('statsDueSoon')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upToDate}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('statsUpToDate')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <IoReceiptOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalCost)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('statsTotalSpent')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['all', 'due_soon', 'overdue'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {f === 'all' ? t('filterAll') : f === 'due_soon' ? t('filterDueSoon') : t('filterOverdue')}
              </button>
            ))}
          </div>

          {/* Vehicle Filter */}
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
          >
            <option value="">{t('allVehicles')}</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('loadingRecords')}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center">
            <IoBuildOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('noRecords')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('noRecordsDescription')}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <IoAddOutline className="w-5 h-5" />
              {t('addFirstRecord')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {records.map((record) => (
              <div key={record.id} className="p-4">
                <button
                  onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                  className="w-full flex items-center gap-4 text-left"
                >
                  {/* Vehicle Photo */}
                  <div className="w-16 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {record.vehiclePhoto ? (
                      <img src={record.vehiclePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoCarOutline className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Record Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getServiceTypeLabel(record.serviceType)}
                      </span>
                      {getDueStatusBadge(record.dueStatus)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{record.vehicleName}</span>
                      <span>{formatDate(record.serviceDate)}</span>
                      <span>{t('mileageUnit', { mileage: record.mileageAtService.toLocaleString() })}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(record.costTotal)}</span>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  {expandedRecord === record.id ? (
                    <IoChevronUpOutline className="w-5 h-5 text-gray-400" />
                  ) : (
                    <IoChevronDownOutline className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Expanded Details */}
                {expandedRecord === record.id && (
                  <div className="mt-4 pl-20 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">{t('serviceProvider')}</p>
                        <p className="font-medium text-gray-900 dark:text-white">{record.shopName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{record.shopAddress}</p>
                        {record.technicianName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('techLabel', { name: record.technicianName })}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">{t('nextService')}</p>
                        {record.nextServiceDue && (
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(record.nextServiceDue)}
                          </p>
                        )}
                        {record.nextServiceMileage && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('orAtMileage', { mileage: record.nextServiceMileage.toLocaleString() })}
                          </p>
                        )}
                        {!record.nextServiceDue && !record.nextServiceMileage && (
                          <p className="text-gray-500 dark:text-gray-400">{t('notScheduled')}</p>
                        )}
                      </div>
                    </div>

                    {record.itemsServiced.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('itemsServiced')}</p>
                        <div className="flex flex-wrap gap-1">
                          {record.itemsServiced.map((item, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.notes && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('notes')}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{record.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={record.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <IoDocumentOutline className="w-4 h-4" />
                        {t('viewReceipt')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <AddMaintenanceModal
          vehicles={vehicles}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchRecords()
          }}
        />
      )}
    </div>
  )
}

// Add Maintenance Modal Component
function AddMaintenanceModal({
  vehicles,
  onClose,
  onSuccess
}: {
  vehicles: Vehicle[]
  onClose: () => void
  onSuccess: () => void
}) {
  const t = useTranslations('PartnerMaintenance')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    carId: '',
    serviceType: 'OIL_CHANGE',
    serviceDate: new Date().toISOString().split('T')[0],
    mileageAtService: '',
    nextServiceDue: '',
    nextServiceMileage: '',
    shopName: '',
    shopAddress: '',
    technicianName: '',
    invoiceNumber: '',
    receiptUrl: '',
    itemsServiced: '',
    costTotal: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/partner/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          itemsServiced: formData.itemsServiced.split(',').map(s => s.trim()).filter(Boolean)
        })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || t('errorCreateFailed'))
      }
    } catch (err) {
      setError(t('errorCreateFailed'))
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getServiceTypeLabel = (key: string) => {
    const tKey = SERVICE_TYPE_KEYS[key]
    return tKey ? t(tKey) : key
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('modalTitle')}</h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <IoCloseOutline className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vehicle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelVehicle')}</label>
              <select
                value={formData.carId}
                onChange={(e) => updateField('carId', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="">{t('selectVehicle')}</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelServiceType')}</label>
              <select
                value={formData.serviceType}
                onChange={(e) => updateField('serviceType', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                {Object.keys(SERVICE_TYPE_KEYS).map((key) => (
                  <option key={key} value={key}>{getServiceTypeLabel(key)}</option>
                ))}
              </select>
            </div>

            {/* Service Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelServiceDate')}</label>
              <input
                type="date"
                value={formData.serviceDate}
                onChange={(e) => updateField('serviceDate', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Mileage at Service */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelMileageAtService')}</label>
              <input
                type="number"
                value={formData.mileageAtService}
                onChange={(e) => updateField('mileageAtService', e.target.value)}
                required
                placeholder={t('placeholderMileage')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Next Service Due */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelNextServiceDue')}</label>
              <input
                type="date"
                value={formData.nextServiceDue}
                onChange={(e) => updateField('nextServiceDue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Next Service Mileage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelNextServiceMileage')}</label>
              <input
                type="number"
                value={formData.nextServiceMileage}
                onChange={(e) => updateField('nextServiceMileage', e.target.value)}
                placeholder={t('placeholderNextMileage')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Shop Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelShopName')}</label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => updateField('shopName', e.target.value)}
                required
                placeholder={t('placeholderShopName')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Shop Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelShopAddress')}</label>
              <input
                type="text"
                value={formData.shopAddress}
                onChange={(e) => updateField('shopAddress', e.target.value)}
                required
                placeholder={t('placeholderShopAddress')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Technician Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelTechnicianName')}</label>
              <input
                type="text"
                value={formData.technicianName}
                onChange={(e) => updateField('technicianName', e.target.value)}
                placeholder={t('placeholderOptional')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Invoice Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelInvoiceNumber')}</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => updateField('invoiceNumber', e.target.value)}
                placeholder={t('placeholderOptional')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Receipt URL */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelReceiptUrl')}</label>
              <input
                type="url"
                value={formData.receiptUrl}
                onChange={(e) => updateField('receiptUrl', e.target.value)}
                required
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('receiptUrlHint')}</p>
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelTotalCost')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costTotal}
                  onChange={(e) => updateField('costTotal', e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Items Serviced */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelItemsServiced')}</label>
              <input
                type="text"
                value={formData.itemsServiced}
                onChange={(e) => updateField('itemsServiced', e.target.value)}
                placeholder={t('placeholderItems')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('labelNotes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={2}
              placeholder={t('placeholderNotes')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              {t('buttonCancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium"
            >
              {loading ? t('buttonCreating') : t('buttonAddRecord')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

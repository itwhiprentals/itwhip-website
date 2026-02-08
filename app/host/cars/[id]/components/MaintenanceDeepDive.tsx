// app/host/cars/[id]/components/MaintenanceDeepDive.tsx

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  IoConstructOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoCalendarOutline,
  IoSpeedometerOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoAlertCircleOutline,
  IoImageOutline,
  IoCloseCircleOutline,
  IoFilterOutline,
  IoDownloadOutline,
  IoRefreshOutline,
  IoChevronDownOutline,
  IoChevronUpOutline
} from 'react-icons/io5'

interface ServiceRecord {
  id: string
  serviceType: string
  serviceDate: string
  description: string | null
  cost: number | null
  mileage: number | null
  performedBy: string | null
  receiptUrl: string | null
  notes: string | null
  fleetVerified: boolean
  verifiedBy: string | null
  verifiedAt: string | null
  addedBy: {
    type: string
    name: string
    id: string | null
  }
  createdAt: string
}

interface UpcomingService {
  type: string
  dueDate: string
  daysUntil: number
  isOverdue: boolean
  lastPerformed: string | null
}

interface MaintenanceDeepDiveProps {
  carId: string
}

export default function MaintenanceDeepDive({ carId }: MaintenanceDeepDiveProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchServiceRecords()
  }, [carId])

  const fetchServiceRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/host/cars/${carId}/service-records`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch service records')
      }
      
      const result = await response.json()
      if (result.success) {
        setData(result)
      }
    } catch (err) {
      console.error('Error fetching service records:', err)
      setError(err instanceof Error ? err.message : 'Failed to load service records')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (recordId: string) => {
    const newExpanded = new Set(expandedRecords)
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId)
    } else {
      newExpanded.add(recordId)
    }
    setExpandedRecords(newExpanded)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getServiceTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'OIL_CHANGE': IoConstructOutline,
      'TIRE_ROTATION': IoConstructOutline,
      'BRAKE_SERVICE': IoConstructOutline,
      'INSPECTION': IoDocumentTextOutline,
      'REPAIR': IoConstructOutline,
      'DETAILING': IoConstructOutline,
      'OTHER': IoConstructOutline
    }
    return icons[type] || IoConstructOutline
  }

  const getServiceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'OIL_CHANGE': 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
      'TIRE_ROTATION': 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
      'BRAKE_SERVICE': 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
      'INSPECTION': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      'REPAIR': 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
      'DETAILING': 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400',
      'OTHER': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
    }
    return colors[type] || colors['OTHER']
  }

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'OIL_CHANGE': 'Oil Change',
      'TIRE_ROTATION': 'Tire Rotation',
      'BRAKE_SERVICE': 'Brake Service',
      'INSPECTION': 'State Inspection',
      'REPAIR': 'Repair',
      'DETAILING': 'Detailing',
      'OTHER': 'Other Service'
    }
    return labels[type] || type.replace('_', ' ')
  }

  const filteredRecords = data?.serviceRecords.filter((record: ServiceRecord) => {
    if (selectedType === 'all') return true
    return record.serviceType === selectedType
  }) || []

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <IoAlertCircleOutline className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Service Records
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Something went wrong'}
          </p>
          <button
            onClick={fetchServiceRecords}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { vehicle, serviceRecords, statistics } = data

  return (
    <div className="space-y-4 md:space-y-6">
      
      {/* Header with Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <IoConstructOutline className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                Maintenance & Service History
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>

          <button
            onClick={fetchServiceRecords}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
          >
            <IoRefreshOutline className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1">
              <IoDocumentTextOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Records</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {statistics.totalRecords}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1">
              <IoCashOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Cost</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(statistics.totalCost)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1">
              <IoShieldCheckmarkOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Verified</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
              {statistics.verifiedCount}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1">
              <IoTimeOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Last Service</p>
            </div>
            <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              {statistics.daysSinceLastService !== null 
                ? `${statistics.daysSinceLastService}d ago` 
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Services Alert */}
      {statistics.overdueServices.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <IoAlertCircleOutline className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                Overdue Services ({statistics.overdueServices.length})
              </h3>
              <ul className="space-y-1">
                {statistics.overdueServices.map((service: string, index: number) => (
                  <li key={index} className="text-sm text-red-800 dark:text-red-400">
                    • {service} is overdue
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Services */}
      {statistics.upcomingServices.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {statistics.upcomingServices.map((service: UpcomingService, index: number) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  service.isOverdue
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : service.daysUntil < 30
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {service.type}
                  </p>
                  <span className={`text-xs font-medium ${
                    service.isOverdue
                      ? 'text-red-600 dark:text-red-400'
                      : service.daysUntil < 30
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {service.isOverdue 
                      ? `Overdue by ${Math.abs(service.daysUntil)} days`
                      : `Due in ${service.daysUntil} days`
                    }
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Due: {formatDate(service.dueDate)}
                </p>
                {service.lastPerformed && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Last: {formatDate(service.lastPerformed)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Type Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <IoFilterOutline className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Service Type</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({statistics.totalRecords})
          </button>
          {Object.entries(statistics.serviceTypeBreakdown).map(([type, count]) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedType === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {getServiceTypeLabel(type)} ({count as any})
            </button>
          ))}
        </div>
      </div>

      {/* Service Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700 text-center">
            <IoDocumentTextOutline className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {selectedType === 'all' 
                ? 'No service records yet' 
                : `No ${getServiceTypeLabel(selectedType)} records`}
            </p>
          </div>
        ) : (
          filteredRecords.map((record: ServiceRecord) => {
            const Icon = getServiceTypeIcon(record.serviceType)
            const isExpanded = expandedRecords.has(record.id)
            
            return (
              <div 
                key={record.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Record Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getServiceTypeColor(record.serviceType)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            {getServiceTypeLabel(record.serviceType)}
                          </h3>
                          {record.fleetVerified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                              <IoShieldCheckmarkOutline className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(record.serviceDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      {record.cost !== null && (
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(record.cost)}
                        </p>
                      )}
                      {record.mileage !== null && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-end mt-1">
                          <IoSpeedometerOutline className="w-3 h-3" />
                          {record.mileage.toLocaleString()} mi
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <IoPersonOutline className="w-4 h-4" />
                      <span>Added by: {record.addedBy.name}</span>
                    </div>
                    {record.performedBy && (
                      <div className="flex items-center gap-1">
                        <IoConstructOutline className="w-4 h-4" />
                        <span>Performed by: {record.performedBy}</span>
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse Button */}
                  {(record.description || record.notes || record.receiptUrl) && (
                    <button
                      onClick={() => toggleExpanded(record.id)}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <IoChevronUpOutline className="w-4 h-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <IoChevronDownOutline className="w-4 h-4" />
                          Show Details
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
                    {record.description && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Description
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {record.description}
                        </p>
                      </div>
                    )}

                    {record.notes && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Notes
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {record.notes}
                        </p>
                      </div>
                    )}

                    {record.receiptUrl && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Receipt
                        </p>
                        <div 
                          onClick={() => setSelectedImage(record.receiptUrl)}
                          className="relative w-full h-32 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          <Image
                            src={record.receiptUrl}
                            alt="Service receipt"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <IoImageOutline className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    )}

                    {record.fleetVerified && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Verified by Fleet Admin on {formatDate(record.verifiedAt!)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Cost Breakdown */}
      {statistics.averageCostByType.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Average Cost by Service Type
          </h3>
          <div className="space-y-3">
            {statistics.averageCostByType.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getServiceTypeColor(item.type)}`}>
                    {getServiceTypeLabel(item.type)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({item.count} {item.count === 1 ? 'service' : 'services'})
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(item.averageCost)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <IoCloseCircleOutline className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl w-full h-full">
            <Image
              src={selectedImage}
              alt="Receipt"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => window.print()}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
        >
          <IoDownloadOutline className="w-4 h-4" />
          Export Service History
        </button>
      </div>
    </div>
  )
}
// app/components/host/ServiceHistoryList.tsx

'use client'

import { useState, useEffect } from 'react'
import { 
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoSpeedometerOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoWarningOutline,
  IoConstructOutline,
  IoCarOutline
} from 'react-icons/io5'

interface ServiceRecord {
  id: string
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
  inspectionReportUrl: string | null
  itemsServiced: string[]
  costTotal: number
  notes: string | null
  verifiedByFleet: boolean
  verifiedAt: string | null
  verifiedBy: string | null
  createdAt: string
}

interface ServiceHistoryListProps {
  carId: string
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  OIL_CHANGE: 'Oil Change',
  STATE_INSPECTION: 'State Inspection',
  TIRE_ROTATION: 'Tire Rotation',
  BRAKE_CHECK: 'Brake Inspection',
  FLUID_CHECK: 'Fluid Service',
  BATTERY_CHECK: 'Battery Check',
  AIR_FILTER: 'Air Filter Replacement',
  MAJOR_SERVICE_30K: '30,000 Mile Service',
  MAJOR_SERVICE_60K: '60,000 Mile Service',
  MAJOR_SERVICE_90K: '90,000 Mile Service',
  CUSTOM: 'Custom Service'
}

const SERVICE_TYPE_ICONS: Record<string, any> = {
  OIL_CHANGE: IoConstructOutline,
  STATE_INSPECTION: IoShieldCheckmarkOutline,
  TIRE_ROTATION: IoCarOutline,
  BRAKE_CHECK: IoWarningOutline,
  FLUID_CHECK: IoConstructOutline,
  BATTERY_CHECK: IoConstructOutline,
  AIR_FILTER: IoConstructOutline,
  MAJOR_SERVICE_30K: IoCheckmarkCircleOutline,
  MAJOR_SERVICE_60K: IoCheckmarkCircleOutline,
  MAJOR_SERVICE_90K: IoCheckmarkCircleOutline,
  CUSTOM: IoDocumentTextOutline
}

export default function ServiceHistoryList({ carId }: ServiceHistoryListProps) {
  const [records, setRecords] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServiceRecords()
  }, [carId])

  const fetchServiceRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/host/cars/${carId}/service`, {
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecords(data.serviceRecords)
      } else {
        setError('Failed to load service records')
      }
    } catch (err) {
      console.error('Error fetching service records:', err)
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (type: string) => {
    const Icon = SERVICE_TYPE_ICONS[type] || IoDocumentTextOutline
    return <Icon className="w-5 h-5" />
  }

  const isServiceOverdue = (nextDue: string | null): boolean => {
    if (!nextDue) return false
    return new Date(nextDue) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
        <button
          onClick={fetchServiceRecords}
          className="text-xs text-red-600 dark:text-red-400 hover:underline mt-2"
        >
          Try again
        </button>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <IoDocumentTextOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">No service records yet</p>
        <p className="text-sm text-gray-500 mt-1">Add your first service record to start tracking maintenance</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div 
          key={record.id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                {getServiceIcon(record.serviceType)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {SERVICE_TYPE_LABELS[record.serviceType] || record.serviceType}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(record.serviceDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {record.verifiedByFleet && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs font-medium text-green-700 dark:text-green-400">
                <IoShieldCheckmarkOutline className="w-3 h-3" />
                Fleet Verified
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Mileage</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                <IoSpeedometerOutline className="w-3 h-3" />
                {record.mileageAtService.toLocaleString()}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Cost</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                <IoCashOutline className="w-3 h-3" />
                ${record.costTotal.toFixed(2)}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Shop</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {record.shopName}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Invoice</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {record.invoiceNumber || 'N/A'}
              </p>
            </div>
          </div>

          {/* Items Serviced */}
          {record.itemsServiced.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Items Serviced:</p>
              <div className="flex flex-wrap gap-1">
                {record.itemsServiced.map((item, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Notes:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{record.notes}</p>
            </div>
          )}

          {/* Next Service Due */}
          {record.nextServiceDue && (
            <div className={`p-2 rounded-lg border mb-3 ${
              isServiceOverdue(record.nextServiceDue)
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
              <p className={`text-xs font-medium flex items-center gap-1 ${
                isServiceOverdue(record.nextServiceDue)
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-blue-700 dark:text-blue-400'
              }`}>
                <IoCalendarOutline className="w-3 h-3" />
                {isServiceOverdue(record.nextServiceDue) ? 'Service Overdue' : 'Next Service Due:'}
              </p>
              <p className={`text-xs mt-0.5 ${
                isServiceOverdue(record.nextServiceDue)
                  ? 'text-red-600 dark:text-red-300'
                  : 'text-blue-600 dark:text-blue-300'
              }`}>
                {new Date(record.nextServiceDue).toLocaleDateString()}
                {record.nextServiceMileage && ` or ${record.nextServiceMileage.toLocaleString()} miles`}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <a
              href={record.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <IoDocumentTextOutline className="w-3 h-3" />
              View Receipt
            </a>
            {record.inspectionReportUrl && (
              <a
                href={record.inspectionReportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <IoShieldCheckmarkOutline className="w-3 h-3" />
                View Inspection
              </a>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              Added {new Date(record.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
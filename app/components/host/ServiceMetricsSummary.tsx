// app/components/host/ServiceMetricsSummary.tsx

'use client'

import { useState, useEffect } from 'react'
import { 
  IoConstructOutline,
  IoWarningOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'
import Link from 'next/link'

interface ServiceMetricsSummaryProps {
  carId: string
}

interface ServiceSummary {
  lastOilChange: string | null
  lastInspection: string | null
  currentMileage: number
  serviceStatus: 'current' | 'due_soon' | 'overdue' | 'critical'
  overdueItems: string[]
  totalServiceRecords: number
}

export default function ServiceMetricsSummary({ carId }: ServiceMetricsSummaryProps) {
  const [summary, setSummary] = useState<ServiceSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServiceSummary()
  }, [carId])

  const fetchServiceSummary = async () => {
    try {
      setLoading(true)
      
      // Fetch service records
      const serviceResponse = await fetch(`/api/host/cars/${carId}/service`, {
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })

      if (!serviceResponse.ok) {
        setLoading(false)
        return
      }

      const serviceData = await serviceResponse.json()
      const records = serviceData.serviceRecords || []

      // Fetch car details for current mileage
      const carResponse = await fetch(`/api/host/cars/${carId}`, {
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })

      if (!carResponse.ok) {
        setLoading(false)
        return
      }

      const carData = await carResponse.json()
      const car = carData.car

      // Find last oil change
      const lastOilChange = records.find(
        (r: any) => r.serviceType === 'OIL_CHANGE'
      )

      // Find last inspection
      const lastInspection = records.find(
        (r: any) => r.serviceType === 'STATE_INSPECTION'
      )

      // Determine service status
      let serviceStatus: ServiceSummary['serviceStatus'] = 'current'
      const overdueItems: string[] = []

      const now = new Date()

      // Check oil change status
      if (lastOilChange) {
        const oilDate = new Date(lastOilChange.serviceDate)
        const daysSinceOil = Math.floor((now.getTime() - oilDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysSinceOil > 180) {
          overdueItems.push('Oil change overdue')
          serviceStatus = 'overdue'
        } else if (daysSinceOil > 150) {
          overdueItems.push('Oil change due soon')
          if (serviceStatus === 'current') serviceStatus = 'due_soon'
        }
      } else {
        overdueItems.push('No oil change record')
        serviceStatus = 'overdue'
      }

      // Check inspection status
      if (lastInspection && lastInspection.nextServiceDue) {
        const inspectionExpires = new Date(lastInspection.nextServiceDue)
        
        if (now > inspectionExpires) {
          overdueItems.push('Inspection expired')
          serviceStatus = 'critical'
        } else {
          const daysUntilExpiry = Math.floor((inspectionExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (daysUntilExpiry < 30) {
            overdueItems.push('Inspection expires soon')
            if (serviceStatus === 'current') serviceStatus = 'due_soon'
          }
        }
      } else {
        overdueItems.push('No inspection record')
        if ((serviceStatus as string) !== 'critical') serviceStatus = 'overdue'
      }

      setSummary({
        lastOilChange: lastOilChange ? lastOilChange.serviceDate : null,
        lastInspection: lastInspection ? lastInspection.serviceDate : null,
        currentMileage: car.currentMileage || 0,
        serviceStatus,
        overdueItems,
        totalServiceRecords: records.length
      })
      
    } catch (error) {
      console.error('Error fetching service summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: ServiceSummary['serviceStatus']) => {
    switch (status) {
      case 'current':
        return {
          text: 'All Current',
          className: 'text-green-700 dark:text-green-400'
        }
      case 'due_soon':
        return {
          text: 'Service Due Soon',
          className: 'text-blue-700 dark:text-blue-400'
        }
      case 'overdue':
        return {
          text: 'Service Overdue',
          className: 'text-yellow-700 dark:text-yellow-400'
        }
      case 'critical':
        return {
          text: 'Critical',
          className: 'text-red-700 dark:text-red-400'
        }
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading service info...</p>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Service information unavailable</p>
      </div>
    )
  }

  const statusBadge = getStatusBadge(summary.serviceStatus)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      {/* Header with Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoConstructOutline className="w-4 h-4" />
          Maintenance Status
        </h3>
        <span className={`text-xs font-medium ${statusBadge.className}`}>
          {statusBadge.text}
        </span>
      </div>

      {/* Warning Items if any */}
      {summary.overdueItems.length > 0 && (
        <>
          <div className="space-y-1 mb-3">
            {summary.overdueItems.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                {summary.serviceStatus === 'critical' ? (
                  <IoAlertCircleOutline className="w-3 h-3 mt-0.5 flex-shrink-0 text-red-500" />
                ) : (
                  <IoWarningOutline className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                    summary.serviceStatus === 'overdue' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                )}
                <p className="text-xs text-gray-600 dark:text-gray-400">{item}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3"></div>
        </>
      )}

      {/* Service Details - styled exactly like Vehicle Information */}
      <div className="space-y-2 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Last Oil Change</span>
          <span className="text-gray-900 dark:text-white">
            {summary.lastOilChange 
              ? new Date(summary.lastOilChange).toLocaleDateString()
              : 'Never'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Last Inspection</span>
          <span className="text-gray-900 dark:text-white">
            {summary.lastInspection 
              ? new Date(summary.lastInspection).toLocaleDateString()
              : 'Never'}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Current Mileage</span>
            <span className="text-gray-900 dark:text-white">
              {summary.currentMileage.toLocaleString()} mi
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Records</span>
            <span className="text-gray-900 dark:text-white">
              {summary.totalServiceRecords}
            </span>
          </div>
        </div>
      </div>

      {/* Link styled exactly like Vehicle Information link */}
      <Link
        href={`/host/cars/${carId}/edit?tab=service`}
        className="text-sm text-purple-600 dark:text-purple-400 hover:underline inline-block"
      >
        View Full Service History →
      </Link>
    </div>
  )
}
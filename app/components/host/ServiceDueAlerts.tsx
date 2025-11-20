// app/components/host/ServiceDueAlerts.tsx

'use client'

import { useState, useEffect } from 'react'
import { 
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline,
  IoCloseOutline
} from 'react-icons/io5'
import { analyzeServiceTriggers, generateServiceAlerts } from '@/app/lib/service/calculate-service-triggers'

interface ServiceDueAlertsProps {
  carId: string
}

interface Alert {
  severity: 'error' | 'warning' | 'info' | 'success'
  message: string
  action?: string
}

export default function ServiceDueAlerts({ carId }: ServiceDueAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchServiceStatus()
  }, [carId])

  const fetchServiceStatus = async () => {
    try {
      setLoading(true)
      
      // Fetch service records
      const serviceResponse = await fetch(`/api/host/cars/${carId}/service`, {
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })

      if (!serviceResponse.ok) {
        console.error('Failed to fetch service records')
        setLoading(false)
        return
      }

      const serviceData = await serviceResponse.json()
      
      // Fetch car details for current mileage and trips
      const carResponse = await fetch(`/api/host/cars/${carId}`, {
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })

      if (!carResponse.ok) {
        console.error('Failed to fetch car details')
        setLoading(false)
        return
      }

      const carData = await carResponse.json()
      const car = carData.car

      // Analyze service triggers
      const analysis = analyzeServiceTriggers(
        serviceData.serviceRecords,
        car.totalTrips || 0,
        car.currentMileage || 0
      )

      // Generate alerts
      const generatedAlerts = generateServiceAlerts(analysis)
      setAlerts(generatedAlerts)
      
    } catch (error) {
      console.error('Error fetching service status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAlertStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'error':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-red-800 dark:text-red-300',
          action: 'text-red-700 dark:text-red-400'
        }
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          text: 'text-yellow-800 dark:text-yellow-300',
          action: 'text-yellow-700 dark:text-yellow-400'
        }
      case 'info':
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-800 dark:text-blue-300',
          action: 'text-blue-700 dark:text-blue-400'
        }
      case 'success':
        return {
          container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          icon: 'text-green-600 dark:text-green-400',
          text: 'text-green-800 dark:text-green-300',
          action: 'text-green-700 dark:text-green-400'
        }
    }
  }

  const getAlertIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'error':
        return IoWarningOutline
      case 'warning':
        return IoAlertCircleOutline
      case 'info':
        return IoInformationCircleOutline
      case 'success':
        return IoCheckmarkCircleOutline
    }
  }

  const dismissAlert = (index: number) => {
    const newDismissed = new Set(dismissedAlerts)
    newDismissed.add(`${carId}-${index}`)
    setDismissedAlerts(newDismissed)
  }

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Checking service status...</p>
        </div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return null
  }

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter((_, index) => 
    !dismissedAlerts.has(`${carId}-${index}`)
  )

  if (visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert, index) => {
        const styles = getAlertStyles(alert.severity)
        const Icon = getAlertIcon(alert.severity)
        
        return (
          <div 
            key={index}
            className={`border rounded-lg p-4 ${styles.container}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${styles.text}`}>
                  {alert.message}
                </p>
                {alert.action && (
                  <p className={`text-xs mt-1 ${styles.action}`}>
                    {alert.action}
                  </p>
                )}
              </div>

              {alert.severity !== 'success' && (
                <button
                  onClick={() => dismissAlert(index)}
                  className={`p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors ${styles.icon}`}
                  aria-label="Dismiss alert"
                >
                  <IoCloseOutline className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
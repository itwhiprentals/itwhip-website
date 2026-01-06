// app/admin/dashboard/components/HostApplicationsWidget.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoPeopleOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoEyeOutline,
  IoArrowForwardOutline
} from 'react-icons/io5'
import StatusBadge from '@/app/components/StatusBadge'

interface HostApplication {
  id: string
  name: string
  email: string
  phone?: string
  approvalStatus: 'PENDING' | 'NEEDS_ATTENTION' | 'APPROVED' | 'REJECTED'
  documentStatuses?: {
    governmentId?: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
    driversLicense?: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
    insurance?: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
    bankAccount?: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  }
  backgroundCheckStatus?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  createdAt: string
  profilePhoto?: string
}

interface HostStats {
  newApplications: number
  awaitingDocs: number
  backgroundCheck: number
  readyForApproval: number
}

interface HostApplicationsWidgetProps {
  className?: string
}

export default function HostApplicationsWidget({ className = '' }: HostApplicationsWidgetProps) {
  const [loading, setLoading] = useState(true)
  const [pendingHosts, setPendingHosts] = useState<HostApplication[]>([])
  const [hostStats, setHostStats] = useState<HostStats>({
    newApplications: 0,
    awaitingDocs: 0,
    backgroundCheck: 0,
    readyForApproval: 0
  })

  useEffect(() => {
    fetchHostApplications()
  }, [])

  const fetchHostApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/hosts/applications?limit=5')
      
      if (response.ok) {
        const data = await response.json()
        const hosts = data.data?.hosts || []
        
        // Filter for pending hosts only
        const pending = hosts.filter((h: any) => h.approvalStatus === 'PENDING')
        setPendingHosts(pending)
        
        // Calculate stats from the summary data
        const summary = data.data?.summary || {}
        setHostStats({
          newApplications: summary.totalPending || 0,
          awaitingDocs: 0, // Can be calculated from hosts if needed
          backgroundCheck: 0,
          readyForApproval: 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch host applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeSince = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (hours < 1) {
      const mins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${mins} mins ago`
    } else if (hours < 24) {
      return `${hours} hours ago`
    } else {
      const days = Math.floor(hours / 24)
      return `${days} days ago`
    }
  }

  const getDocumentProgress = (host: HostApplication) => {
    if (!host.documentStatuses) return 0
    const statuses = Object.values(host.documentStatuses)
    const approved = statuses.filter(s => s === 'APPROVED').length
    return Math.round((approved / 4) * 100)
  }

  const totalPending = hostStats.newApplications + hostStats.awaitingDocs + 
                       hostStats.backgroundCheck + hostStats.readyForApproval

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <IoPeopleOutline className="w-5 h-5 mr-2 text-purple-600" />
          Host Applications
        </h3>
        <Link 
          href="/admin/rentals/hosts/applications"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
        >
          View All ({totalPending})
          <IoArrowForwardOutline className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">New</p>
              <p className="text-2xl font-bold text-blue-600">{hostStats.newApplications}</p>
            </div>
            <IoDocumentTextOutline className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Awaiting Docs</p>
              <p className="text-2xl font-bold text-yellow-600">{hostStats.awaitingDocs}</p>
            </div>
            <IoTimeOutline className="w-6 h-6 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Background</p>
              <p className="text-2xl font-bold text-purple-600">{hostStats.backgroundCheck}</p>
            </div>
            <IoShieldCheckmarkOutline className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Ready</p>
              <p className="text-2xl font-bold text-green-600">{hostStats.readyForApproval}</p>
            </div>
            <IoCheckmarkCircle className="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>

      {/* Pending Hosts List */}
      {pendingHosts.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
          {pendingHosts.map(host => (
            <Link
              key={host.id}
              href={`/admin/rentals/hosts/${host.id}`}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {host.profilePhoto ? (
                    <img 
                      src={host.profilePhoto} 
                      alt={host.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {host.name[0].toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {host.name}
                      </p>
                      <StatusBadge status={host.approvalStatus} size="sm" />
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {host.email}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Applied {formatTimeSince(host.createdAt)}</span>
                      {host.backgroundCheckStatus && (
                        <span className="flex items-center">
                          <IoShieldCheckmarkOutline className="w-3 h-3 mr-1" />
                          {host.backgroundCheckStatus}
                        </span>
                      )}
                    </div>

                    {/* Document Progress */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Documents</span>
                        <span className="text-gray-600 dark:text-gray-400">{getDocumentProgress(host)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${getDocumentProgress(host)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <IoEyeOutline className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <IoCheckmarkCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No pending host applications</p>
          <p className="text-sm text-gray-500 mt-1">All applications have been processed</p>
        </div>
      )}
    </div>
  )
}
// app/admin/system/health/details/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
 IoArrowBackOutline,
 IoServerOutline,
 IoCloudOutline,
 IoGlobeOutline,
 IoStatsChartOutline,
 IoRefreshOutline,
 IoCheckmarkCircle,
 IoCloseCircle,
 IoWarningOutline,
 IoTimeOutline,
 IoSpeedometerOutline,
 IoHardwareChipOutline,
 IoLayersOutline,
 IoMailOutline,
 IoConstructOutline,
 IoSwapHorizontalOutline,
 IoTerminalOutline
} from 'react-icons/io5'

interface DetailedHealthData {
 timestamp: string
 checks: {
   database: {
     postgres: {
       connected: boolean
       version: string
       poolSize: number
       activeConnections: number
       idleConnections: number
       waitingConnections: number
       queryPerformance: Array<{
         query: string
         avgTime: number
         count: number
       }>
     }
     redis?: {
       connected: boolean
       memoryUsage: number
       uptime: number
       connectedClients: number
     }
   }
   storage: {
     cloudinary: {
       accountName: string
       usage: number
       bandwidth: number
       transformations: number
       apiCallsRemaining: number
       lastError?: string
     }
     firebase: {
       projectId: string
       storageUsed: number
       bandwidth: number
       operations: number
     }
     local: {
       tempFiles: number
       cacheSize: number
       diskSpace: number
     }
   }
   apis: Array<{
     name: string
     endpoint: string
     status: 'up' | 'down' | 'degraded'
     responseTime: number
     lastChecked: string
     errorRate: number
     lastError?: string
   }>
   queues: {
     emailQueue: {
       pending: number
       processing: number
       failed: number
       completed24h: number
     }
     jobQueue: {
       pending: number
       processing: number
       failed: number
       completed24h: number
     }
   }
   memory: {
     total: number
     used: number
     free: number
     heapUsed: number
     heapTotal: number
     external: number
     arrayBuffers: number
   }
 }
}

export default function DetailedMetricsPage() {
 const [health, setHealth] = useState<DetailedHealthData | null>(null)
 const [loading, setLoading] = useState(true)
 const [selectedTab, setSelectedTab] = useState<'database' | 'storage' | 'apis' | 'memory'>('database')
 const [autoRefresh, setAutoRefresh] = useState(true)
 const [refreshInterval, setRefreshInterval] = useState(30)
 const [error, setError] = useState<string | null>(null)

 useEffect(() => {
   loadDetailedHealth()
   
   if (autoRefresh) {
     const interval = setInterval(loadDetailedHealth, refreshInterval * 1000)
     return () => clearInterval(interval)
   }
 }, [autoRefresh, refreshInterval])

 const loadDetailedHealth = async () => {
   try {
     setError(null)
     const response = await fetch('/api/admin/system/health/detailed')
     if (response.ok) {
       const data = await response.json()
       setHealth(data)
     } else {
       throw new Error('Failed to load health data')
     }
   } catch (error) {
     console.error('Failed to load detailed health:', error)
     setError('Failed to load system metrics. Please try again.')
   } finally {
     setLoading(false)
   }
 }

 const testConnection = async (service: string) => {
   try {
     const response = await fetch('/api/admin/system/health/detailed', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ service })
     })
     const result = await response.json()
     alert(`${service} test: ${result.success ? 'Success' : 'Failed'}\n${result.message}`)
   } catch (error) {
     alert(`Failed to test ${service}`)
   }
 }

 const formatBytes = (bytes: number) => {
   if (bytes < 1024) return bytes + ' B'
   if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
   if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
   return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
 }

 const getStatusColor = (status: string) => {
   switch (status) {
     case 'up': return 'text-green-600'
     case 'degraded': return 'text-yellow-600'
     case 'down': return 'text-red-600'
     default: return 'text-gray-600'
   }
 }

 const getStatusIcon = (status: string) => {
   switch (status) {
     case 'up': return <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
     case 'degraded': return <IoWarningOutline className="w-5 h-5 text-yellow-600" />
     case 'down': return <IoCloseCircle className="w-5 h-5 text-red-600" />
     default: return null
   }
 }

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="text-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
         <p className="text-gray-600">Loading system metrics...</p>
       </div>
     </div>
   )
 }

 if (error) {
   return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
       <div className="text-center max-w-md">
         <IoWarningOutline className="w-16 h-16 text-red-500 mx-auto mb-4" />
         <p className="text-gray-800 mb-4">{error}</p>
         <button
           onClick={loadDetailedHealth}
           className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
         >
           Retry
         </button>
       </div>
     </div>
   )
 }

 if (!health) {
   return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <p className="text-gray-600">No data available</p>
     </div>
   )
 }

 return (
   <div className="min-h-screen bg-gray-50">
     {/* Header */}
     <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex items-center justify-between h-16">
           <div className="flex items-center">
             <Link href="/admin/dashboard" className="mr-4">
               <IoArrowBackOutline className="w-6 h-6 text-gray-600 hover:text-gray-900" />
             </Link>
             <h1 className="text-lg sm:text-xl font-bold text-gray-900">System Metrics</h1>
           </div>
           
           <div className="flex items-center gap-2 sm:gap-4">
             <label className="hidden sm:flex items-center text-sm">
               <input
                 type="checkbox"
                 checked={autoRefresh}
                 onChange={(e) => setAutoRefresh(e.target.checked)}
                 className="mr-2"
               />
               Auto-refresh
             </label>
             
             <select
               value={refreshInterval}
               onChange={(e) => setRefreshInterval(Number(e.target.value))}
               className="text-sm px-2 py-1 border border-gray-300 rounded"
             >
               <option value={10}>10s</option>
               <option value={30}>30s</option>
               <option value={60}>1m</option>
               <option value={300}>5m</option>
             </select>
             
             <button
               onClick={loadDetailedHealth}
               className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
               title="Refresh"
             >
               <IoRefreshOutline className="w-5 h-5" />
             </button>
           </div>
         </div>
       </div>
     </div>

     {/* Last Updated */}
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
       <p className="text-xs text-gray-500">
         Last updated: {new Date(health.timestamp).toLocaleString()}
       </p>
     </div>

     {/* Tabs */}
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       <div className="border-b border-gray-200 overflow-x-auto">
         <nav className="-mb-px flex space-x-4 sm:space-x-8">
           <button
             onClick={() => setSelectedTab('database')}
             className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
               selectedTab === 'database'
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700'
             }`}
           >
             <IoServerOutline className="w-4 h-4 inline mr-1" />
             Database
           </button>
           <button
             onClick={() => setSelectedTab('storage')}
             className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
               selectedTab === 'storage'
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700'
             }`}
           >
             <IoCloudOutline className="w-4 h-4 inline mr-1" />
             Storage
           </button>
           <button
             onClick={() => setSelectedTab('apis')}
             className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
               selectedTab === 'apis'
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700'
             }`}
           >
             <IoGlobeOutline className="w-4 h-4 inline mr-1" />
             APIs & Queues
           </button>
           <button
             onClick={() => setSelectedTab('memory')}
             className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
               selectedTab === 'memory'
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700'
             }`}
           >
             <IoHardwareChipOutline className="w-4 h-4 inline mr-1" />
             Memory
           </button>
         </nav>
       </div>
     </div>

     {/* Content */}
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
       {selectedTab === 'database' && (
         <div className="space-y-6">
           {/* PostgreSQL */}
           <div className="bg-white rounded-lg shadow p-4 sm:p-6">
             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
               <h3 className="font-semibold text-gray-900 flex items-center">
                 <IoServerOutline className="w-5 h-5 mr-2" />
                 PostgreSQL
               </h3>
               <button
                 onClick={() => testConnection('postgres')}
                 className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
               >
                 Test Connection
               </button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               <div>
                 <p className="text-sm text-gray-600">Status</p>
                 <p className="font-medium text-gray-900">
                   {health.checks.database.postgres.connected ? 
                     <span className="text-green-600">Connected</span> : 
                     <span className="text-red-600">Disconnected</span>
                   }
                 </p>
               </div>
               <div>
                 <p className="text-sm text-gray-600">Version</p>
                 <p className="font-medium text-gray-900">{health.checks.database.postgres.version}</p>
               </div>
               <div>
                 <p className="text-sm text-gray-600">Pool Size</p>
                 <p className="font-medium text-gray-900">{health.checks.database.postgres.poolSize}</p>
               </div>
               <div>
                 <p className="text-sm text-gray-600">Active</p>
                 <p className="font-medium text-gray-900">{health.checks.database.postgres.activeConnections}</p>
               </div>
               <div>
                 <p className="text-sm text-gray-600">Idle</p>
                 <p className="font-medium text-gray-900">{health.checks.database.postgres.idleConnections}</p>
               </div>
               <div>
                 <p className="text-sm text-gray-600">Waiting</p>
                 <p className="font-medium text-gray-900">{health.checks.database.postgres.waitingConnections}</p>
               </div>
             </div>

             {health.checks.database.postgres.queryPerformance.length > 0 && (
               <div className="mt-6">
                 <h4 className="text-sm font-medium text-gray-700 mb-3">Slow Queries</h4>
                 <div className="space-y-2">
                   {health.checks.database.postgres.queryPerformance.slice(0, 5).map((query, index) => (
                     <div key={index} className="text-sm bg-gray-50 p-3 rounded">
                       <code className="text-xs text-gray-600 block truncate">{query.query}</code>
                       <div className="flex justify-between mt-2">
                         <span className="text-xs text-gray-500">Avg: {query.avgTime}ms</span>
                         <span className="text-xs text-gray-500">Count: {query.count}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
         </div>
       )}

       {selectedTab === 'storage' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Cloudinary */}
           <div className="bg-white rounded-lg shadow p-4 sm:p-6">
             <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
               <IoCloudOutline className="w-5 h-5 mr-2" />
               Cloudinary
             </h3>
             <div className="space-y-3 text-sm">
               <div className="flex justify-between">
                 <span className="text-gray-600">Account</span>
                 <span className="font-medium">{health.checks.storage.cloudinary.accountName}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Storage Used</span>
                 <span className="font-medium">{formatBytes(health.checks.storage.cloudinary.usage)}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Bandwidth</span>
                 <span className="font-medium">{formatBytes(health.checks.storage.cloudinary.bandwidth)}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Transformations</span>
                 <span className="font-medium">{health.checks.storage.cloudinary.transformations.toLocaleString()}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">API Calls Remaining</span>
                 <span className="font-medium">{health.checks.storage.cloudinary.apiCallsRemaining.toLocaleString()}</span>
               </div>
             </div>
           </div>

           {/* Local Storage */}
           <div className="bg-white rounded-lg shadow p-4 sm:p-6">
             <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
               <IoLayersOutline className="w-5 h-5 mr-2" />
               Local Storage
             </h3>
             <div className="space-y-3 text-sm">
               <div className="flex justify-between">
                 <span className="text-gray-600">Temp Files</span>
                 <span className="font-medium">{health.checks.storage.local.tempFiles}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Cache Size</span>
                 <span className="font-medium">{formatBytes(health.checks.storage.local.cacheSize)}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Disk Space</span>
                 <span className="font-medium">{formatBytes(health.checks.storage.local.diskSpace)}</span>
               </div>
             </div>
           </div>
         </div>
       )}

       {selectedTab === 'apis' && (
         <div className="space-y-6">
           {/* External APIs */}
           <div className="bg-white rounded-lg shadow overflow-hidden">
             <div className="p-4 sm:p-6 border-b border-gray-200">
               <h3 className="font-semibold text-gray-900">External APIs</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                     <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                     <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response</th>
                     <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error Rate</th>
                     <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Check</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {health.checks.apis.map((api, index) => (
                     <tr key={index}>
                       <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                         {api.name}
                       </td>
                       <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center">
                           {getStatusIcon(api.status)}
                           <span className={`ml-2 text-sm ${getStatusColor(api.status)}`}>
                             {api.status.toUpperCase()}
                           </span>
                         </div>
                       </td>
                       <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {api.responseTime}ms
                       </td>
                       <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {api.errorRate.toFixed(1)}%
                       </td>
                       <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {new Date(api.lastChecked).toLocaleTimeString()}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>

           {/* Queues */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white rounded-lg shadow p-4 sm:p-6">
               <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                 <IoMailOutline className="w-5 h-5 mr-2" />
                 Email Queue
               </h3>
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-600">Pending</span>
                   <span className="font-medium">{health.checks.queues.emailQueue.pending}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">Processing</span>
                   <span className="font-medium">{health.checks.queues.emailQueue.processing}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">Failed</span>
                   <span className="font-medium text-red-600">{health.checks.queues.emailQueue.failed}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">Completed (24h)</span>
                   <span className="font-medium">{health.checks.queues.emailQueue.completed24h}</span>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-lg shadow p-4 sm:p-6">
               <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                 <IoConstructOutline className="w-5 h-5 mr-2" />
                 Job Queue
               </h3>
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-600">Pending</span>
                   <span className="font-medium">{health.checks.queues.jobQueue.pending}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">Processing</span>
                   <span className="font-medium">{health.checks.queues.jobQueue.processing}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">Failed</span>
                   <span className="font-medium text-red-600">{health.checks.queues.jobQueue.failed}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">Completed (24h)</span>
                   <span className="font-medium">{health.checks.queues.jobQueue.completed24h}</span>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}

       {selectedTab === 'memory' && (
         <div className="bg-white rounded-lg shadow p-4 sm:p-6">
           <h3 className="font-semibold text-gray-900 mb-6 flex items-center">
             <IoHardwareChipOutline className="w-5 h-5 mr-2" />
             Memory Usage
           </h3>
           
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
             <div>
               <p className="text-sm text-gray-600">Total Memory</p>
               <p className="text-xl font-bold text-gray-900">{formatBytes(health.checks.memory.total)}</p>
             </div>
             <div>
               <p className="text-sm text-gray-600">Used Memory</p>
               <p className="text-xl font-bold text-gray-900">{formatBytes(health.checks.memory.used)}</p>
             </div>
             <div>
               <p className="text-sm text-gray-600">Free Memory</p>
               <p className="text-xl font-bold text-green-600">{formatBytes(health.checks.memory.free)}</p>
             </div>
           </div>

           <div className="space-y-4">
             <div>
               <div className="flex justify-between mb-1">
                 <span className="text-sm text-gray-600">System Memory</span>
                 <span className="text-sm text-gray-900">
                   {((health.checks.memory.used / health.checks.memory.total) * 100).toFixed(1)}%
                 </span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2">
                 <div
                   className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                   style={{ width: `${(health.checks.memory.used / health.checks.memory.total) * 100}%` }}
                 />
               </div>
             </div>

             <div>
               <div className="flex justify-between mb-1">
                 <span className="text-sm text-gray-600">Heap Memory</span>
                 <span className="text-sm text-gray-900">
                   {formatBytes(health.checks.memory.heapUsed)} / {formatBytes(health.checks.memory.heapTotal)}
                 </span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2">
                 <div
                   className="bg-green-600 h-2 rounded-full transition-all duration-500"
                   style={{ width: `${(health.checks.memory.heapUsed / health.checks.memory.heapTotal) * 100}%` }}
                 />
               </div>
             </div>
           </div>

           <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
             <div className="flex justify-between">
               <span className="text-gray-600">External Memory</span>
               <span className="font-medium">{formatBytes(health.checks.memory.external)}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-600">Array Buffers</span>
               <span className="font-medium">{formatBytes(health.checks.memory.arrayBuffers)}</span>
             </div>
           </div>
         </div>
       )}
     </div>
   </div>
 )
}
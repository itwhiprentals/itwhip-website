// app/admin/system/health/page.tsx

'use client'

import { useState, useEffect } from 'react'

interface DetailedHealth {
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

export default function SystemHealthDetailsPage() {
 const [health, setHealth] = useState<DetailedHealth | null>(null)
 const [loading, setLoading] = useState(true)
 const [selectedTab, setSelectedTab] = useState<'database' | 'storage' | 'apis' | 'memory'>('database')
 const [autoRefresh, setAutoRefresh] = useState(true)
 const [refreshInterval, setRefreshInterval] = useState(30)

 useEffect(() => {
   loadDetailedHealth()
   
   if (autoRefresh) {
     const interval = setInterval(loadDetailedHealth, refreshInterval * 1000)
     return () => clearInterval(interval)
   }
 }, [autoRefresh, refreshInterval])

 const loadDetailedHealth = async () => {
   try {
     const response = await fetch('/api/admin/system/health/detailed')
     if (response.ok) {
       const data = await response.json()
       setHealth(data)
     }
   } catch (error) {
     console.error('Failed to load detailed health:', error)
   } finally {
     setLoading(false)
   }
 }

 const testConnection = async (service: string) => {
   try {
     const response = await fetch(`/api/admin/system/test/${service}`, {
       method: 'POST'
     })
     const result = await response.json()
     alert(`${service} test: ${result.success ? 'Success' : 'Failed'}\n${result.message}`)
   } catch (error) {
     alert(`Failed to test ${service}`)
   }
 }

 const optimizeDatabase = async () => {
   if (!confirm('Run database optimization? This may take a few minutes.')) return
   
   try {
     const response = await fetch('/api/admin/system/database/optimize', {
       method: 'POST'
     })
     if (response.ok) {
       alert('Database optimization completed')
       loadDetailedHealth()
     }
   } catch (error) {
     console.error('Failed to optimize database:', error)
   }
 }

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
     </div>
   )
 }

 if (!health) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <p className="text-gray-600">Failed to load health details</p>
     </div>
   )
 }

 const formatBytes = (bytes: number) => {
   if (bytes < 1024) return bytes + ' B'
   if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
   if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
   return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
 }

 return (
   <div className="p-6 max-w-7xl mx-auto">
     <div className="mb-6 flex justify-between items-center">
       <div>
         <h1 className="text-2xl font-bold text-gray-900">System Health Details</h1>
         <p className="text-gray-600">Last updated: {new Date(health.timestamp).toLocaleString()}</p>
       </div>
       
       <div className="flex gap-3 items-center">
         <label className="flex items-center">
           <input
             type="checkbox"
             checked={autoRefresh}
             onChange={(e) => setAutoRefresh(e.target.checked)}
             className="mr-2"
           />
           <span className="text-sm text-gray-600">Auto-refresh</span>
         </label>
         
         <select
           value={refreshInterval}
           onChange={(e) => setRefreshInterval(Number(e.target.value))}
           className="px-3 py-1 border border-gray-300 rounded text-sm"
         >
           <option value={10}>10s</option>
           <option value={30}>30s</option>
           <option value={60}>1m</option>
           <option value={300}>5m</option>
         </select>
         
         <button
           onClick={loadDetailedHealth}
           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
         >
           Refresh Now
         </button>
       </div>
     </div>

     {/* Tabs */}
     <div className="border-b border-gray-200 mb-6">
       <nav className="-mb-px flex space-x-8">
         <button
           onClick={() => setSelectedTab('database')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedTab === 'database'
               ? 'border-blue-500 text-blue-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Database
         </button>
         <button
           onClick={() => setSelectedTab('storage')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedTab === 'storage'
               ? 'border-blue-500 text-blue-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Storage
         </button>
         <button
           onClick={() => setSelectedTab('apis')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedTab === 'apis'
               ? 'border-blue-500 text-blue-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           APIs & Queues
         </button>
         <button
           onClick={() => setSelectedTab('memory')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedTab === 'memory'
               ? 'border-blue-500 text-blue-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Memory
         </button>
       </nav>
     </div>

     {/* Content */}
     {selectedTab === 'database' && (
       <div className="space-y-6">
         <div className="bg-white rounded-lg shadow p-6">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-gray-900">PostgreSQL</h3>
             <div className="flex gap-2">
               <button
                 onClick={() => testConnection('postgres')}
                 className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
               >
                 Test Connection
               </button>
               <button
                 onClick={optimizeDatabase}
                 className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
               >
                 Optimize
               </button>
             </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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
               <p className="text-sm text-gray-600">Active Connections</p>
               <p className="font-medium text-gray-900">{health.checks.database.postgres.activeConnections}</p>
             </div>
             <div>
               <p className="text-sm text-gray-600">Idle Connections</p>
               <p className="font-medium text-gray-900">{health.checks.database.postgres.idleConnections}</p>
             </div>
             <div>
               <p className="text-sm text-gray-600">Waiting</p>
               <p className="font-medium text-gray-900">{health.checks.database.postgres.waitingConnections}</p>
             </div>
           </div>

           {health.checks.database.postgres.queryPerformance.length > 0 && (
             <div>
               <h4 className="text-sm font-medium text-gray-700 mb-2">Slow Queries</h4>
               <div className="space-y-2">
                 {health.checks.database.postgres.queryPerformance.slice(0, 5).map((query, index) => (
                   <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                     <code className="text-xs text-gray-600">{query.query.substring(0, 100)}...</code>
                     <div className="flex justify-between mt-1">
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
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="font-semibold text-gray-900 mb-4">Cloudinary</h3>
           <div className="space-y-2 text-sm">
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
               <span className="font-medium">{health.checks.storage.cloudinary.transformations}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-600">API Calls Remaining</span>
               <span className="font-medium">{health.checks.storage.cloudinary.apiCallsRemaining}</span>
             </div>
           </div>
         </div>

         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="font-semibold text-gray-900 mb-4">Local Storage</h3>
           <div className="space-y-2 text-sm">
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
         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="font-semibold text-gray-900 mb-4">External APIs</h3>
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
               <thead>
                 <tr>
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Response Time</th>
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Error Rate</th>
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Checked</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                 {health.checks.apis.map((api, index) => (
                   <tr key={index}>
                     <td className="px-4 py-2 text-sm font-medium text-gray-900">{api.name}</td>
                     <td className="px-4 py-2">
                       <span className={`px-2 py-1 text-xs rounded-full ${
                         api.status === 'up' ? 'bg-green-100 text-green-800' :
                         api.status === 'degraded' ? 'bg-amber-100 text-amber-800' :
                         'bg-red-100 text-red-800'
                       }`}>
                         {api.status.toUpperCase()}
                       </span>
                     </td>
                     <td className="px-4 py-2 text-sm text-gray-900">{api.responseTime}ms</td>
                     <td className="px-4 py-2 text-sm text-gray-900">{api.errorRate.toFixed(1)}%</td>
                     <td className="px-4 py-2 text-sm text-gray-500">
                       {new Date(api.lastChecked).toLocaleTimeString()}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white rounded-lg shadow p-6">
             <h3 className="font-semibold text-gray-900 mb-4">Email Queue</h3>
             <div className="space-y-2 text-sm">
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

           <div className="bg-white rounded-lg shadow p-6">
             <h3 className="font-semibold text-gray-900 mb-4">Job Queue</h3>
             <div className="space-y-2 text-sm">
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
       <div className="bg-white rounded-lg shadow p-6">
         <h3 className="font-semibold text-gray-900 mb-4">Memory Usage</h3>
         
         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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

         <div className="space-y-3">
           <div>
             <div className="flex justify-between mb-1">
               <span className="text-sm text-gray-600">System Memory</span>
               <span className="text-sm text-gray-900">
                 {((health.checks.memory.used / health.checks.memory.total) * 100).toFixed(1)}%
               </span>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-2">
               <div
                 className="bg-blue-600 h-2 rounded-full"
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
                 className="bg-green-600 h-2 rounded-full"
                 style={{ width: `${(health.checks.memory.heapUsed / health.checks.memory.heapTotal) * 100}%` }}
               />
             </div>
           </div>
         </div>

         <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
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
 )
}
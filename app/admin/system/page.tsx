// app/admin/system/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SystemHealth {
 status: 'healthy' | 'degraded' | 'critical'
 database: {
   status: 'connected' | 'slow' | 'disconnected'
   responseTime: number
   activeConnections: number
   maxConnections: number
 }
 storage: {
   cloudinary: {
     status: 'operational' | 'degraded' | 'down'
     usage: number
     limit: number
     failedUploads: number
   }
   firebase: {
     status: 'operational' | 'degraded' | 'down'
     usage: number
     limit: number
   }
 }
 apis: {
   stripe: {
     status: 'operational' | 'degraded' | 'down'
     failedCharges: number
     successRate: number
   }
   email: {
     status: 'operational' | 'degraded' | 'down'
     queueSize: number
     failedEmails: number
   }
 }
 performance: {
   avgResponseTime: number
   errorRate: number
   uptime: number
   memoryUsage: number
   cpuUsage: number
 }
 trips: {
   stuckTrips: number
   overdueReturns: number
   missingPhotos: number
   failedUploads: number
 }
}

export default function SystemOverviewPage() {
 const router = useRouter()
 const [health, setHealth] = useState<SystemHealth | null>(null)
 const [loading, setLoading] = useState(true)
 const [autoRefresh, setAutoRefresh] = useState(true)

 useEffect(() => {
   loadSystemHealth()
   
   if (autoRefresh) {
     const interval = setInterval(loadSystemHealth, 30000) // Refresh every 30 seconds
     return () => clearInterval(interval)
   }
 }, [autoRefresh])

 const loadSystemHealth = async () => {
   try {
     const response = await fetch('/api/admin/system/health')
     if (response.ok) {
       const data = await response.json()
       setHealth(data)
     }
   } catch (error) {
     console.error('Failed to load system health:', error)
   } finally {
     setLoading(false)
   }
 }

 const runDiagnostics = async () => {
   setLoading(true)
   try {
     const response = await fetch('/api/admin/system/diagnostics', {
       method: 'POST'
     })
     if (response.ok) {
       await loadSystemHealth()
     }
   } catch (error) {
     console.error('Failed to run diagnostics:', error)
   } finally {
     setLoading(false)
   }
 }

 const clearCache = async () => {
   if (!confirm('Clear all system caches? This may temporarily slow down the system.')) return
   
   try {
     const response = await fetch('/api/admin/system/cache', {
       method: 'DELETE'
     })
     if (response.ok) {
       alert('Cache cleared successfully')
     }
   } catch (error) {
     console.error('Failed to clear cache:', error)
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
       <p className="text-gray-600">Failed to load system health</p>
     </div>
   )
 }

 const getStatusColor = (status: string) => {
   switch (status) {
     case 'healthy':
     case 'connected':
     case 'operational':
       return 'text-green-600'
     case 'degraded':
     case 'slow':
       return 'text-amber-600'
     case 'critical':
     case 'disconnected':
     case 'down':
       return 'text-red-600'
     default:
       return 'text-gray-600'
   }
 }

 const getStatusBadge = (status: string) => {
   const color = getStatusColor(status)
   return (
     <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
       color === 'text-green-600' ? 'bg-green-100' :
       color === 'text-amber-600' ? 'bg-amber-100' :
       color === 'text-red-600' ? 'bg-red-100' : 'bg-gray-100'
     } ${color}`}>
       {status.toUpperCase()}
     </span>
   )
 }

 return (
   <div className="p-6 max-w-7xl mx-auto">
     <div className="mb-6 flex justify-between items-center">
       <div>
         <h1 className="text-2xl font-bold text-gray-900">System Health Monitor</h1>
         <p className="text-gray-600">Real-time system performance and health metrics</p>
       </div>
       
       <div className="flex gap-3">
         <label className="flex items-center">
           <input
             type="checkbox"
             checked={autoRefresh}
             onChange={(e) => setAutoRefresh(e.target.checked)}
             className="mr-2"
           />
           <span className="text-sm text-gray-600">Auto-refresh</span>
         </label>
         
         <button
           onClick={runDiagnostics}
           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
         >
           Run Diagnostics
         </button>
         
         <button
           onClick={clearCache}
           className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
         >
           Clear Cache
         </button>
       </div>
     </div>

     {/* Overall Status */}
     <div className={`mb-6 p-4 rounded-lg ${
       health.status === 'healthy' ? 'bg-green-50 border border-green-200' :
       health.status === 'degraded' ? 'bg-amber-50 border border-amber-200' :
       'bg-red-50 border border-red-200'
     }`}>
       <div className="flex items-center justify-between">
         <div className="flex items-center">
           <div className={`w-3 h-3 rounded-full mr-3 ${
             health.status === 'healthy' ? 'bg-green-500' :
             health.status === 'degraded' ? 'bg-amber-500' :
             'bg-red-500'
           } animate-pulse`} />
           <span className="font-semibold text-gray-900">
             System Status: {getStatusBadge(health.status)}
           </span>
         </div>
         <span className="text-sm text-gray-600">
           Uptime: {health.performance.uptime.toFixed(2)}%
         </span>
       </div>
     </div>

     {/* Service Status Grid */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
       {/* Database */}
       <div className="bg-white rounded-lg shadow p-6">
         <div className="flex items-center justify-between mb-4">
           <h3 className="font-semibold text-gray-900">Database</h3>
           {getStatusBadge(health.database.status)}
         </div>
         <div className="space-y-2 text-sm">
           <div className="flex justify-between">
             <span className="text-gray-600">Response Time</span>
             <span className={`font-medium ${health.database.responseTime > 100 ? 'text-red-600' : 'text-gray-900'}`}>
               {health.database.responseTime}ms
             </span>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-600">Connections</span>
             <span className="font-medium text-gray-900">
               {health.database.activeConnections}/{health.database.maxConnections}
             </span>
           </div>
         </div>
       </div>

       {/* Storage */}
       <div className="bg-white rounded-lg shadow p-6">
         <div className="flex items-center justify-between mb-4">
           <h3 className="font-semibold text-gray-900">Storage</h3>
           {getStatusBadge(health.storage.cloudinary.status)}
         </div>
         <div className="space-y-2 text-sm">
           <div>
             <div className="flex justify-between mb-1">
               <span className="text-gray-600">Cloudinary</span>
               <span className="text-gray-900">
                 {((health.storage.cloudinary.usage / health.storage.cloudinary.limit) * 100).toFixed(1)}%
               </span>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-2">
               <div
                 className="bg-blue-600 h-2 rounded-full"
                 style={{ width: `${(health.storage.cloudinary.usage / health.storage.cloudinary.limit) * 100}%` }}
               />
             </div>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-600">Failed Uploads</span>
             <span className={`font-medium ${health.storage.cloudinary.failedUploads > 0 ? 'text-red-600' : 'text-gray-900'}`}>
               {health.storage.cloudinary.failedUploads}
             </span>
           </div>
         </div>
       </div>

       {/* APIs */}
       <div className="bg-white rounded-lg shadow p-6">
         <div className="flex items-center justify-between mb-4">
           <h3 className="font-semibold text-gray-900">External APIs</h3>
           {getStatusBadge(health.apis.stripe.status)}
         </div>
         <div className="space-y-2 text-sm">
           <div className="flex justify-between">
             <span className="text-gray-600">Stripe Success</span>
             <span className={`font-medium ${health.apis.stripe.successRate < 95 ? 'text-amber-600' : 'text-gray-900'}`}>
               {health.apis.stripe.successRate.toFixed(1)}%
             </span>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-600">Email Queue</span>
             <span className={`font-medium ${health.apis.email.queueSize > 100 ? 'text-red-600' : 'text-gray-900'}`}>
               {health.apis.email.queueSize} pending
             </span>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-600">Failed Emails</span>
             <span className={`font-medium ${health.apis.email.failedEmails > 0 ? 'text-red-600' : 'text-gray-900'}`}>
               {health.apis.email.failedEmails}
             </span>
           </div>
         </div>
       </div>
     </div>

     {/* Performance Metrics */}
     <div className="bg-white rounded-lg shadow p-6 mb-6">
       <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
       <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
         <div>
           <p className="text-sm text-gray-600">Avg Response</p>
           <p className={`text-xl font-bold ${health.performance.avgResponseTime > 500 ? 'text-red-600' : 'text-gray-900'}`}>
             {health.performance.avgResponseTime}ms
           </p>
         </div>
         <div>
           <p className="text-sm text-gray-600">Error Rate</p>
           <p className={`text-xl font-bold ${health.performance.errorRate > 1 ? 'text-red-600' : 'text-gray-900'}`}>
             {health.performance.errorRate.toFixed(2)}%
           </p>
         </div>
         <div>
           <p className="text-sm text-gray-600">Memory Usage</p>
           <p className={`text-xl font-bold ${health.performance.memoryUsage > 80 ? 'text-amber-600' : 'text-gray-900'}`}>
             {health.performance.memoryUsage.toFixed(1)}%
           </p>
         </div>
         <div>
           <p className="text-sm text-gray-600">CPU Usage</p>
           <p className={`text-xl font-bold ${health.performance.cpuUsage > 70 ? 'text-amber-600' : 'text-gray-900'}`}>
             {health.performance.cpuUsage.toFixed(1)}%
           </p>
         </div>
         <div>
           <p className="text-sm text-gray-600">Uptime</p>
           <p className="text-xl font-bold text-green-600">
             {health.performance.uptime.toFixed(2)}%
           </p>
         </div>
       </div>
     </div>

     {/* Trip System Issues */}
     {Object.values(health.trips).some(v => v > 0) && (
       <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
         <h3 className="font-semibold text-amber-900 mb-4">Trip System Issues</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {health.trips.stuckTrips > 0 && (
             <button
               onClick={() => router.push('/admin/rentals/trips?filter=stuck')}
               className="text-left"
             >
               <p className="text-2xl font-bold text-amber-900">{health.trips.stuckTrips}</p>
               <p className="text-sm text-amber-700">Stuck Trips</p>
             </button>
           )}
           {health.trips.overdueReturns > 0 && (
             <button
               onClick={() => router.push('/admin/rentals/trips?filter=overdue')}
               className="text-left"
             >
               <p className="text-2xl font-bold text-amber-900">{health.trips.overdueReturns}</p>
               <p className="text-sm text-amber-700">Overdue Returns</p>
             </button>
           )}
           {health.trips.missingPhotos > 0 && (
             <div>
               <p className="text-2xl font-bold text-amber-900">{health.trips.missingPhotos}</p>
               <p className="text-sm text-amber-700">Missing Photos</p>
             </div>
           )}
           {health.trips.failedUploads > 0 && (
             <div>
               <p className="text-2xl font-bold text-amber-900">{health.trips.failedUploads}</p>
               <p className="text-sm text-amber-700">Failed Uploads</p>
             </div>
           )}
         </div>
       </div>
     )}

     {/* Quick Actions */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
       <button
         onClick={() => router.push('/admin/system/health')}
         className="bg-white rounded-lg shadow p-4 text-left hover:shadow-lg transition-shadow"
       >
         <h3 className="font-semibold text-gray-900">Health Details</h3>
         <p className="text-sm text-gray-600">View detailed system health metrics</p>
       </button>
       
       <button
         onClick={() => router.push('/admin/system/alerts')}
         className="bg-white rounded-lg shadow p-4 text-left hover:shadow-lg transition-shadow"
       >
         <h3 className="font-semibold text-gray-900">System Alerts</h3>
         <p className="text-sm text-gray-600">Configure and view system alerts</p>
       </button>
     </div>
   </div>
 )
}
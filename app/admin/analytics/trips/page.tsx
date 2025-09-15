// app/admin/analytics/trips/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { TripMetrics } from '../../rentals/trips/components/TripMetrics'

interface TripAnalytics {
 summary: {
   totalTrips: number
   activeTrips: number
   completedToday: number
   averageDuration: number
   averageMileage: number
   overdueRate: number
   damageRate: number
   additionalChargesRate: number
   totalRevenue: number
   averageRevenue: number
 }
 trends: {
   dates: string[]
   trips: number[]
   revenue: number[]
   mileage: number[]
 }
 distribution: {
   byDuration: Array<{ range: string; count: number }>
   byMileage: Array<{ range: string; count: number }>
   byDayOfWeek: Array<{ day: string; count: number }>
   byHour: Array<{ hour: number; count: number }>
 }
 topHosts: Array<{
   name: string
   trips: number
   revenue: number
   averageRating: number
 }>
 issues: {
   overdueTrips: number
   unresolvedDisputes: number
   failedCharges: number
   missingPhotos: number
 }
}

export default function TripAnalyticsPage() {
 const [analytics, setAnalytics] = useState<TripAnalytics | null>(null)
 const [loading, setLoading] = useState(true)
 const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week')
 const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'distribution' | 'performance'>('overview')

 useEffect(() => {
   loadAnalytics()
 }, [period])

 const loadAnalytics = async () => {
   try {
     const response = await fetch(`/api/admin/analytics/trips?period=${period}`)
     if (response.ok) {
       const data = await response.json()
       setAnalytics(data)
     }
   } catch (error) {
     console.error('Failed to load trip analytics:', error)
   } finally {
     setLoading(false)
   }
 }

 const exportReport = () => {
   if (!analytics) return
   
   const csv = [
     ['Trip Analytics Report', new Date().toISOString()],
     [],
     ['Summary'],
     ['Total Trips', analytics.summary.totalTrips],
     ['Average Duration (hours)', analytics.summary.averageDuration],
     ['Average Mileage', analytics.summary.averageMileage],
     ['Overdue Rate (%)', analytics.summary.overdueRate],
     ['Damage Rate (%)', analytics.summary.damageRate],
     ['Additional Charges Rate (%)', analytics.summary.additionalChargesRate],
     ['Total Revenue', analytics.summary.totalRevenue],
     [],
     ['Top Hosts'],
     ['Name', 'Trips', 'Revenue', 'Rating'],
     ...analytics.topHosts.map(h => [h.name, h.trips, h.revenue, h.averageRating])
   ].map(row => row.join(',')).join('\n')
   
   const blob = new Blob([csv], { type: 'text/csv' })
   const url = window.URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = `trip_analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`
   a.click()
 }

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
     </div>
   )
 }

 if (!analytics) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <p className="text-gray-600">Failed to load analytics</p>
     </div>
   )
 }

 return (
   <div className="p-6 max-w-7xl mx-auto">
     <div className="mb-6 flex justify-between items-center">
       <div>
         <h1 className="text-2xl font-bold text-gray-900">Trip Analytics</h1>
         <p className="text-gray-600">Detailed analysis of trip patterns and performance</p>
       </div>
       
       <button
         onClick={exportReport}
         className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
       >
         Export Report
       </button>
     </div>

     {/* View Tabs */}
     <div className="border-b border-gray-200 mb-6">
       <nav className="-mb-px flex space-x-8">
         <button
           onClick={() => setSelectedView('overview')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedView === 'overview'
               ? 'border-blue-500 text-blue-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Overview
         </button>
         <button
           onClick={() => setSelectedView('trends')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedView === 'trends'
               ? 'border-blue-500 text-blue-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Trends
         </button>
         <button
           onClick={() => setSelectedView('distribution')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedView === 'distribution'
               ? 'border-blue-500 text-blue-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Distribution
         </button>
         <button
           onClick={() => setSelectedView('performance')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedView === 'performance'
               ? 'border-blue-500 text-blue-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Performance
         </button>
       </nav>
     </div>

     {/* Content */}
     {selectedView === 'overview' && (
       <div>
         <TripMetrics
           metrics={{
             ...analytics.summary,
             topHosts: analytics.topHosts
           }}
           period={period}
           onPeriodChange={setPeriod}
         />
         
         {/* Issues Alert */}
         {Object.values(analytics.issues).some(v => v > 0) && (
           <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
             <h3 className="font-semibold text-amber-900 mb-3">Attention Required</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {analytics.issues.overdueTrips > 0 && (
                 <div>
                   <p className="text-2xl font-bold text-amber-900">{analytics.issues.overdueTrips}</p>
                   <p className="text-sm text-amber-700">Overdue Trips</p>
                 </div>
               )}
               {analytics.issues.unresolvedDisputes > 0 && (
                 <div>
                   <p className="text-2xl font-bold text-amber-900">{analytics.issues.unresolvedDisputes}</p>
                   <p className="text-sm text-amber-700">Open Disputes</p>
                 </div>
               )}
               {analytics.issues.failedCharges > 0 && (
                 <div>
                   <p className="text-2xl font-bold text-amber-900">{analytics.issues.failedCharges}</p>
                   <p className="text-sm text-amber-700">Failed Charges</p>
                 </div>
               )}
               {analytics.issues.missingPhotos > 0 && (
                 <div>
                   <p className="text-2xl font-bold text-amber-900">{analytics.issues.missingPhotos}</p>
                   <p className="text-sm text-amber-700">Missing Photos</p>
                 </div>
               )}
             </div>
           </div>
         )}
       </div>
     )}

     {selectedView === 'trends' && (
       <div className="bg-white rounded-lg shadow p-6">
         <h3 className="font-semibold text-gray-900 mb-4">Trip Trends</h3>
         <div className="space-y-8">
           <div>
             <p className="text-sm text-gray-600 mb-2">Trips Over Time</p>
             <div className="h-64 flex items-end space-x-2">
               {analytics.trends.trips.map((count, index) => (
                 <div
                   key={index}
                   className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors relative group"
                   style={{ height: `${(count / Math.max(...analytics.trends.trips)) * 100}%` }}
                 >
                   <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                     {count} trips
                   </div>
                 </div>
               ))}
             </div>
             <div className="flex justify-between mt-2 text-xs text-gray-500">
               {analytics.trends.dates.map((date, index) => (
                 <span key={index}>{date}</span>
               ))}
             </div>
           </div>
         </div>
       </div>
     )}

     {selectedView === 'distribution' && (
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="font-semibold text-gray-900 mb-4">Duration Distribution</h3>
           <div className="space-y-2">
             {analytics.distribution.byDuration.map((item, index) => (
               <div key={index} className="flex items-center">
                 <span className="text-sm text-gray-600 w-20">{item.range}</span>
                 <div className="flex-1 mx-2 bg-gray-200 rounded-full h-4">
                   <div
                     className="bg-blue-500 h-4 rounded-full"
                     style={{ width: `${(item.count / Math.max(...analytics.distribution.byDuration.map(d => d.count))) * 100}%` }}
                   />
                 </div>
                 <span className="text-sm text-gray-900 w-10 text-right">{item.count}</span>
               </div>
             ))}
           </div>
         </div>

         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="font-semibold text-gray-900 mb-4">Mileage Distribution</h3>
           <div className="space-y-2">
             {analytics.distribution.byMileage.map((item, index) => (
               <div key={index} className="flex items-center">
                 <span className="text-sm text-gray-600 w-24">{item.range}</span>
                 <div className="flex-1 mx-2 bg-gray-200 rounded-full h-4">
                   <div
                     className="bg-green-500 h-4 rounded-full"
                     style={{ width: `${(item.count / Math.max(...analytics.distribution.byMileage.map(d => d.count))) * 100}%` }}
                   />
                 </div>
                 <span className="text-sm text-gray-900 w-10 text-right">{item.count}</span>
               </div>
             ))}
           </div>
         </div>

         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="font-semibold text-gray-900 mb-4">By Day of Week</h3>
           <div className="space-y-2">
             {analytics.distribution.byDayOfWeek.map((item, index) => (
               <div key={index} className="flex items-center">
                 <span className="text-sm text-gray-600 w-20">{item.day}</span>
                 <div className="flex-1 mx-2 bg-gray-200 rounded-full h-4">
                   <div
                     className="bg-purple-500 h-4 rounded-full"
                     style={{ width: `${(item.count / Math.max(...analytics.distribution.byDayOfWeek.map(d => d.count))) * 100}%` }}
                   />
                 </div>
                 <span className="text-sm text-gray-900 w-10 text-right">{item.count}</span>
               </div>
             ))}
           </div>
         </div>

         <div className="bg-white rounded-lg shadow p-6">
           <h3 className="font-semibold text-gray-900 mb-4">By Hour of Day</h3>
           <div className="h-32 flex items-end space-x-1">
             {analytics.distribution.byHour.map((item, index) => (
               <div
                 key={index}
                 className="flex-1 bg-amber-500 hover:bg-amber-600 transition-colors relative group"
                 style={{ height: `${(item.count / Math.max(...analytics.distribution.byHour.map(d => d.count))) * 100}%` }}
               >
                 <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   {item.hour}:00 - {item.count}
                 </div>
               </div>
             ))}
           </div>
           <p className="text-xs text-gray-500 text-center mt-2">Hour of Day</p>
         </div>
       </div>
     )}

     {selectedView === 'performance' && (
       <div className="bg-white rounded-lg shadow p-6">
         <h3 className="font-semibold text-gray-900 mb-4">Host Performance</h3>
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
             <thead>
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trips</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Trip Value</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200">
               {analytics.topHosts.map((host, index) => (
                 <tr key={index}>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                     #{index + 1}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{host.name}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{host.trips}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     ${host.revenue.toLocaleString()}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center">
                       <span className="text-sm text-gray-900">{host.averageRating.toFixed(1)}</span>
                       <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                       </svg>
                     </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     ${(host.revenue / host.trips).toFixed(2)}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
     )}
   </div>
 )
}
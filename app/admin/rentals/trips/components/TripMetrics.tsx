// app/admin/rentals/trips/components/TripMetrics.tsx

'use client'

interface MetricsData {
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
 topHosts: Array<{
   name: string
   trips: number
   revenue: number
 }>
}

interface TripMetricsProps {
 metrics: MetricsData
 period: 'today' | 'week' | 'month'
 onPeriodChange: (period: 'today' | 'week' | 'month') => void
}

export function TripMetrics({ metrics, period, onPeriodChange }: TripMetricsProps) {
 const formatDuration = (hours: number) => {
   if (hours < 24) {
     return `${hours.toFixed(1)}h`
   }
   const days = Math.floor(hours / 24)
   const remainingHours = hours % 24
   return `${days}d ${remainingHours.toFixed(0)}h`
 }

 const getPerformanceColor = (rate: number, threshold: number, inverse = false) => {
   if (inverse) {
     if (rate > threshold) return 'text-red-600'
     if (rate > threshold * 0.7) return 'text-amber-600'
     return 'text-green-600'
   } else {
     if (rate < threshold) return 'text-red-600'
     if (rate < threshold * 1.3) return 'text-amber-600'
     return 'text-green-600'
   }
 }

 return (
   <div className="bg-white rounded-lg shadow">
     <div className="p-4 border-b">
       <div className="flex justify-between items-center">
         <h3 className="font-semibold text-gray-900">Trip Metrics</h3>
         <div className="flex gap-2">
           <button
             onClick={() => onPeriodChange('today')}
             className={`px-3 py-1 text-sm rounded ${
               period === 'today' 
                 ? 'bg-blue-600 text-white' 
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
             }`}
           >
             Today
           </button>
           <button
             onClick={() => onPeriodChange('week')}
             className={`px-3 py-1 text-sm rounded ${
               period === 'week' 
                 ? 'bg-blue-600 text-white' 
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
             }`}
           >
             Week
           </button>
           <button
             onClick={() => onPeriodChange('month')}
             className={`px-3 py-1 text-sm rounded ${
               period === 'month' 
                 ? 'bg-blue-600 text-white' 
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
             }`}
           >
             Month
           </button>
         </div>
       </div>
     </div>

     <div className="p-4">
       {/* Key Metrics Grid */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
         <div>
           <p className="text-sm text-gray-500">Total Trips</p>
           <p className="text-2xl font-bold text-gray-900">{metrics.totalTrips}</p>
           <p className="text-xs text-gray-500 mt-1">
             {metrics.activeTrips} active
           </p>
         </div>
         
         <div>
           <p className="text-sm text-gray-500">Avg Duration</p>
           <p className="text-2xl font-bold text-gray-900">
             {formatDuration(metrics.averageDuration)}
           </p>
           <p className="text-xs text-gray-500 mt-1">per trip</p>
         </div>
         
         <div>
           <p className="text-sm text-gray-500">Avg Mileage</p>
           <p className="text-2xl font-bold text-gray-900">
             {metrics.averageMileage.toFixed(0)} mi
           </p>
           <p className="text-xs text-gray-500 mt-1">per trip</p>
         </div>
         
         <div>
           <p className="text-sm text-gray-500">Revenue</p>
           <p className="text-2xl font-bold text-gray-900">
             ${metrics.totalRevenue.toFixed(0)}
           </p>
           <p className="text-xs text-gray-500 mt-1">
             ${metrics.averageRevenue.toFixed(0)} avg
           </p>
         </div>
       </div>

       {/* Performance Indicators */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
         <div className="bg-gray-50 rounded p-3">
           <div className="flex justify-between items-center mb-1">
             <p className="text-sm text-gray-600">Overdue Rate</p>
             <span className={`text-sm font-bold ${getPerformanceColor(metrics.overdueRate, 10, true)}`}>
               {metrics.overdueRate.toFixed(1)}%
             </span>
           </div>
           <div className="w-full bg-gray-200 rounded-full h-1.5">
             <div 
               className={`h-1.5 rounded-full ${
                 metrics.overdueRate > 10 ? 'bg-red-500' : 
                 metrics.overdueRate > 5 ? 'bg-amber-500' : 
                 'bg-green-500'
               }`}
               style={{ width: `${Math.min(metrics.overdueRate * 10, 100)}%` }}
             />
           </div>
         </div>
         
         <div className="bg-gray-50 rounded p-3">
           <div className="flex justify-between items-center mb-1">
             <p className="text-sm text-gray-600">Damage Rate</p>
             <span className={`text-sm font-bold ${getPerformanceColor(metrics.damageRate, 5, true)}`}>
               {metrics.damageRate.toFixed(1)}%
             </span>
           </div>
           <div className="w-full bg-gray-200 rounded-full h-1.5">
             <div 
               className={`h-1.5 rounded-full ${
                 metrics.damageRate > 5 ? 'bg-red-500' : 
                 metrics.damageRate > 2 ? 'bg-amber-500' : 
                 'bg-green-500'
               }`}
               style={{ width: `${Math.min(metrics.damageRate * 20, 100)}%` }}
             />
           </div>
         </div>
         
         <div className="bg-gray-50 rounded p-3">
           <div className="flex justify-between items-center mb-1">
             <p className="text-sm text-gray-600">Extra Charges</p>
             <span className={`text-sm font-bold ${getPerformanceColor(metrics.additionalChargesRate, 30, true)}`}>
               {metrics.additionalChargesRate.toFixed(1)}%
             </span>
           </div>
           <div className="w-full bg-gray-200 rounded-full h-1.5">
             <div 
               className={`h-1.5 rounded-full ${
                 metrics.additionalChargesRate > 50 ? 'bg-red-500' : 
                 metrics.additionalChargesRate > 30 ? 'bg-amber-500' : 
                 'bg-green-500'
               }`}
               style={{ width: `${Math.min(metrics.additionalChargesRate * 2, 100)}%` }}
             />
           </div>
         </div>
         
         <div className="bg-gray-50 rounded p-3">
           <div className="flex justify-between items-center mb-1">
             <p className="text-sm text-gray-600">Completion Rate</p>
             <span className={`text-sm font-bold ${getPerformanceColor(100 - metrics.overdueRate, 90)}`}>
               {(100 - metrics.overdueRate).toFixed(1)}%
             </span>
           </div>
           <div className="w-full bg-gray-200 rounded-full h-1.5">
             <div 
               className={`h-1.5 rounded-full ${
                 (100 - metrics.overdueRate) < 90 ? 'bg-red-500' : 
                 (100 - metrics.overdueRate) < 95 ? 'bg-amber-500' : 
                 'bg-green-500'
               }`}
               style={{ width: `${100 - metrics.overdueRate}%` }}
             />
           </div>
         </div>
       </div>

       {/* Top Hosts */}
       {metrics.topHosts.length > 0 && (
         <div>
           <h4 className="text-sm font-medium text-gray-700 mb-3">Top Performing Hosts</h4>
           <div className="space-y-2">
             {metrics.topHosts.slice(0, 5).map((host, index) => (
               <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                 <div className="flex items-center gap-3">
                   <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                   <div>
                     <p className="text-sm font-medium text-gray-900">{host.name}</p>
                     <p className="text-xs text-gray-500">{host.trips} trips</p>
                   </div>
                 </div>
                 <p className="text-sm font-medium text-gray-900">
                   ${host.revenue.toFixed(0)}
                 </p>
               </div>
             ))}
           </div>
         </div>
       )}
     </div>
   </div>
 )
}
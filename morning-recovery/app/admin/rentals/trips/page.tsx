// app/admin/rentals/trips/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TripStats {
 activeTrips: number
 pendingStart: number
 completedToday: number
 overdueReturns: number
 openDisputes: number
 todayRevenue: number
}

interface ActiveTrip {
 id: string
 bookingCode: string
 guestName: string
 guestEmail: string
 guestPhone: string
 car: {
   make: string
   model: string
   year: number
 }
 tripStartedAt: string
 endDate: string
 startMileage: number
 currentDuration: string
 isOverdue: boolean
 pickupLocation: string
}

export default function TripsOverviewPage() {
 const router = useRouter()
 const [stats, setStats] = useState<TripStats>({
   activeTrips: 0,
   pendingStart: 0,
   completedToday: 0,
   overdueReturns: 0,
   openDisputes: 0,
   todayRevenue: 0
 })
 const [activeTrips, setActiveTrips] = useState<ActiveTrip[]>([])
 const [loading, setLoading] = useState(true)
 const [selectedTab, setSelectedTab] = useState<'active' | 'pending' | 'overdue'>('active')

 useEffect(() => {
   loadTripData()
   const interval = setInterval(loadTripData, 30000) // Refresh every 30 seconds
   return () => clearInterval(interval)
 }, [])

 const loadTripData = async () => {
   try {
     const response = await fetch('/api/admin/trips/overview')
     if (response.ok) {
       const data = await response.json()
       setStats(data.stats)
       setActiveTrips(data.activeTrips)
     }
   } catch (error) {
     console.error('Failed to load trip data:', error)
   } finally {
     setLoading(false)
   }
 }

 const handleForceEndTrip = async (tripId: string) => {
   if (!confirm('Are you sure you want to force end this trip? This action cannot be undone.')) {
     return
   }

   try {
     const response = await fetch(`/api/admin/trips/${tripId}/force-end`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' }
     })
     
     if (response.ok) {
       loadTripData()
     }
   } catch (error) {
     console.error('Failed to force end trip:', error)
   }
 }

 const formatDuration = (startTime: string) => {
   const start = new Date(startTime)
   const now = new Date()
   const diff = now.getTime() - start.getTime()
   const hours = Math.floor(diff / (1000 * 60 * 60))
   const days = Math.floor(hours / 24)
   
   if (days > 0) {
     return `${days}d ${hours % 24}h`
   }
   return `${hours}h`
 }

 const filteredTrips = activeTrips.filter(trip => {
   if (selectedTab === 'active') return !trip.isOverdue
   if (selectedTab === 'overdue') return trip.isOverdue
   return true
 })

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
     </div>
   )
 }

 return (
   <div className="p-6 max-w-7xl mx-auto">
     <div className="mb-6">
       <h1 className="text-2xl font-bold text-gray-900">Trip Management</h1>
       <p className="text-gray-600">Monitor and manage active trips</p>
     </div>

     {/* Stats Grid */}
     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
       <div className="bg-white rounded-lg shadow p-4">
         <div className="text-2xl font-bold text-blue-600">{stats.activeTrips}</div>
         <div className="text-sm text-gray-600">Active Trips</div>
       </div>
       
       <div className="bg-white rounded-lg shadow p-4">
         <div className="text-2xl font-bold text-green-600">{stats.pendingStart}</div>
         <div className="text-sm text-gray-600">Ready to Start</div>
       </div>
       
       <div className="bg-white rounded-lg shadow p-4">
         <div className="text-2xl font-bold text-gray-600">{stats.completedToday}</div>
         <div className="text-sm text-gray-600">Completed Today</div>
       </div>
       
       <div className="bg-white rounded-lg shadow p-4">
         <div className="text-2xl font-bold text-red-600">{stats.overdueReturns}</div>
         <div className="text-sm text-gray-600">Overdue</div>
       </div>
       
       <div className="bg-white rounded-lg shadow p-4">
         <div className="text-2xl font-bold text-amber-600">{stats.openDisputes}</div>
         <div className="text-sm text-gray-600">Disputes</div>
       </div>
       
       <div className="bg-white rounded-lg shadow p-4">
         <div className="text-2xl font-bold text-purple-600">
           ${stats.todayRevenue.toFixed(2)}
         </div>
         <div className="text-sm text-gray-600">Today's Revenue</div>
       </div>
     </div>

     {/* Quick Actions */}
     <div className="flex gap-4 mb-6">
       <button
         onClick={() => router.push('/admin/rentals/trips/active')}
         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
       >
         View All Active
       </button>
       <button
         onClick={() => router.push('/admin/rentals/trips/charges')}
         className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
       >
         Manage Charges
       </button>
       <button
         onClick={() => router.push('/admin/disputes')}
         className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
       >
         Review Disputes
       </button>
     </div>

     {/* Tabs */}
     <div className="border-b border-gray-200 mb-6">
       <nav className="-mb-px flex space-x-8">
         <button
           onClick={() => setSelectedTab('active')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedTab === 'active'
               ? 'border-blue-500 text-blue-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Active ({activeTrips.filter(t => !t.isOverdue).length})
         </button>
         <button
           onClick={() => setSelectedTab('overdue')}
           className={`py-2 px-1 border-b-2 font-medium text-sm ${
             selectedTab === 'overdue'
               ? 'border-red-500 text-red-600'
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Overdue ({activeTrips.filter(t => t.isOverdue).length})
         </button>
       </nav>
     </div>

     {/* Active Trips Table */}
     <div className="bg-white rounded-lg shadow overflow-hidden">
       <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-50">
           <tr>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
               Booking
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
               Guest
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
               Vehicle
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
               Duration
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
               Status
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
               Actions
             </th>
           </tr>
         </thead>
         <tbody className="bg-white divide-y divide-gray-200">
           {filteredTrips.map((trip) => (
             <tr key={trip.id} className={trip.isOverdue ? 'bg-red-50' : ''}>
               <td className="px-6 py-4 whitespace-nowrap">
                 <div className="text-sm font-medium text-gray-900">{trip.bookingCode}</div>
                 <div className="text-xs text-gray-500">{trip.pickupLocation}</div>
               </td>
               <td className="px-6 py-4 whitespace-nowrap">
                 <div className="text-sm text-gray-900">{trip.guestName}</div>
                 <div className="text-xs text-gray-500">{trip.guestPhone}</div>
               </td>
               <td className="px-6 py-4 whitespace-nowrap">
                 <div className="text-sm text-gray-900">
                   {trip.car.year} {trip.car.make} {trip.car.model}
                 </div>
               </td>
               <td className="px-6 py-4 whitespace-nowrap">
                 <div className="text-sm text-gray-900">
                   {formatDuration(trip.tripStartedAt)}
                 </div>
                 <div className="text-xs text-gray-500">
                   Due: {new Date(trip.endDate).toLocaleDateString()}
                 </div>
               </td>
               <td className="px-6 py-4 whitespace-nowrap">
                 {trip.isOverdue ? (
                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                     Overdue
                   </span>
                 ) : (
                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                     Active
                   </span>
                 )}
               </td>
               <td className="px-6 py-4 whitespace-nowrap text-sm">
                 <button
                   onClick={() => router.push(`/admin/rentals/bookings/${trip.id}`)}
                   className="text-blue-600 hover:text-blue-900 mr-3"
                 >
                   View
                 </button>
                 {trip.isOverdue && (
                   <button
                     onClick={() => handleForceEndTrip(trip.id)}
                     className="text-red-600 hover:text-red-900"
                   >
                     Force End
                   </button>
                 )}
               </td>
             </tr>
           ))}
         </tbody>
       </table>
       
       {filteredTrips.length === 0 && (
         <div className="text-center py-8 text-gray-500">
           No {selectedTab} trips found
         </div>
       )}
     </div>
   </div>
 )
}
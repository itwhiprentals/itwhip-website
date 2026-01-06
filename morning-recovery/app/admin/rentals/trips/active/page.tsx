// app/admin/rentals/trips/active/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ActiveTripDetail {
 id: string
 bookingCode: string
 guestName: string
 guestEmail: string
 guestPhone: string
 car: {
   id: string
   make: string
   model: string
   year: number
   licensePlate: string
   currentMileage: number
 }
 host: {
   name: string
   phone: string
   email: string
 }
 tripStartedAt: string
 startDate: string
 endDate: string
 startMileage: number
 fuelLevelStart: string
 pickupLocation: string
 returnLocation: string
 pickupWindowEnd: string
 numberOfDays: number
 dailyMileageLimit: number
 totalAmount: number
 depositAmount: number
 isOverdue: boolean
 hoursOverdue: number
 lastUpdate: string
 inspectionPhotosCount: number
}

export default function ActiveTripsPage() {
 const router = useRouter()
 const [trips, setTrips] = useState<ActiveTripDetail[]>([])
 const [loading, setLoading] = useState(true)
 const [filter, setFilter] = useState<'all' | 'overdue' | 'ending-today'>('all')
 const [searchTerm, setSearchTerm] = useState('')
 const [selectedTrip, setSelectedTrip] = useState<string | null>(null)
 const [autoRefresh, setAutoRefresh] = useState(true)

 useEffect(() => {
   loadActiveTrips()
   
   if (autoRefresh) {
     const interval = setInterval(loadActiveTrips, 15000) // Refresh every 15 seconds
     return () => clearInterval(interval)
   }
 }, [autoRefresh])

 const loadActiveTrips = async () => {
   try {
     const response = await fetch('/api/admin/trips/active')
     if (response.ok) {
       const data = await response.json()
       setTrips(data.trips || [])
     }
   } catch (error) {
     console.error('Failed to load active trips:', error)
   } finally {
     setLoading(false)
   }
 }

 const handleEndTrip = async (tripId: string) => {
   if (!confirm('End this trip? The guest should complete the end trip process themselves.')) {
     return
   }

   try {
     const response = await fetch(`/api/admin/trips/${tripId}/end`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ 
         endedBy: 'admin',
         reason: 'Admin ended trip'
       })
     })
     
     if (response.ok) {
       loadActiveTrips()
     }
   } catch (error) {
     console.error('Failed to end trip:', error)
   }
 }

 const handleContactGuest = (trip: ActiveTripDetail) => {
   const subject = `Regarding your active rental - ${trip.bookingCode}`
   window.location.href = `mailto:${trip.guestEmail}?subject=${encodeURIComponent(subject)}`
 }

 const handleCallGuest = (phone: string) => {
   window.location.href = `tel:${phone}`
 }

 const calculateTripDuration = (startTime: string) => {
   const start = new Date(startTime)
   const now = new Date()
   const diff = now.getTime() - start.getTime()
   
   const days = Math.floor(diff / (1000 * 60 * 60 * 24))
   const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
   const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
   
   if (days > 0) {
     return `${days}d ${hours}h ${minutes}m`
   }
   return `${hours}h ${minutes}m`
 }

 const getStatusColor = (trip: ActiveTripDetail) => {
   if (trip.isOverdue) return 'bg-red-100 text-red-800 border-red-200'
   const endDate = new Date(trip.endDate)
   const now = new Date()
   const hoursUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60)
   
   if (hoursUntilEnd < 24) return 'bg-amber-100 text-amber-800 border-amber-200'
   return 'bg-green-100 text-green-800 border-green-200'
 }

 const filteredTrips = trips.filter(trip => {
   const matchesSearch = searchTerm === '' || 
     trip.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
     trip.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     trip.guestEmail.toLowerCase().includes(searchTerm.toLowerCase())
   
   if (!matchesSearch) return false
   
   if (filter === 'overdue') return trip.isOverdue
   if (filter === 'ending-today') {
     const endDate = new Date(trip.endDate)
     const today = new Date()
     return endDate.toDateString() === today.toDateString()
   }
   
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
     <div className="mb-6 flex justify-between items-center">
       <div>
         <h1 className="text-2xl font-bold text-gray-900">Active Trips</h1>
         <p className="text-gray-600">Monitor all trips currently in progress</p>
       </div>
       
       <div className="flex items-center gap-4">
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
           onClick={loadActiveTrips}
           className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
         >
           Refresh Now
         </button>
       </div>
     </div>

     {/* Filters */}
     <div className="mb-6 flex gap-4">
       <input
         type="text"
         placeholder="Search by booking code, guest name, or email..."
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
         className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
       />
       
       <select
         value={filter}
         onChange={(e) => setFilter(e.target.value as any)}
         className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
       >
         <option value="all">All Active ({trips.length})</option>
         <option value="overdue">Overdue ({trips.filter(t => t.isOverdue).length})</option>
         <option value="ending-today">Ending Today</option>
       </select>
     </div>

     {/* Stats Bar */}
     <div className="mb-6 p-4 bg-gray-50 rounded-lg flex gap-8">
       <div>
         <span className="text-sm text-gray-600">Total Active:</span>
         <span className="ml-2 font-bold text-gray-900">{trips.length}</span>
       </div>
       <div>
         <span className="text-sm text-gray-600">Overdue:</span>
         <span className="ml-2 font-bold text-red-600">
           {trips.filter(t => t.isOverdue).length}
         </span>
       </div>
       <div>
         <span className="text-sm text-gray-600">Ending in 24h:</span>
         <span className="ml-2 font-bold text-amber-600">
           {trips.filter(t => {
             const endDate = new Date(t.endDate)
             const now = new Date()
             const hours = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60)
             return hours > 0 && hours < 24
           }).length}
         </span>
       </div>
     </div>

     {/* Trips Grid */}
     <div className="grid gap-4">
       {filteredTrips.map((trip) => (
         <div
           key={trip.id}
           className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
             trip.isOverdue ? 'border-red-300' : 'border-gray-200'
           }`}
         >
           <div className="flex justify-between items-start mb-4">
             <div>
               <div className="flex items-center gap-3">
                 <h3 className="text-lg font-semibold text-gray-900">
                   {trip.bookingCode}
                 </h3>
                 <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(trip)}`}>
                   {trip.isOverdue ? `Overdue ${trip.hoursOverdue}h` : 'Active'}
                 </span>
               </div>
               <p className="text-sm text-gray-600 mt-1">
                 Started {calculateTripDuration(trip.tripStartedAt)} ago
               </p>
             </div>
             
             <div className="flex gap-2">
               <button
                 onClick={() => router.push(`/admin/rentals/bookings/${trip.id}`)}
                 className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
               >
                 View Details
               </button>
               <button
                 onClick={() => router.push(`/admin/rentals/trips/inspections/${trip.id}`)}
                 className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
               >
                 View Photos
               </button>
               {trip.isOverdue && (
                 <button
                   onClick={() => handleEndTrip(trip.id)}
                   className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                 >
                   Force End
                 </button>
               )}
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
               <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Guest</p>
               <p className="font-medium text-gray-900">{trip.guestName}</p>
               <p className="text-sm text-gray-600">{trip.guestEmail}</p>
               <div className="flex gap-2 mt-1">
                 <button
                   onClick={() => handleCallGuest(trip.guestPhone)}
                   className="text-xs text-blue-600 hover:text-blue-700"
                 >
                   Call
                 </button>
                 <button
                   onClick={() => handleContactGuest(trip)}
                   className="text-xs text-blue-600 hover:text-blue-700"
                 >
                   Email
                 </button>
               </div>
             </div>
             
             <div>
               <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vehicle</p>
               <p className="font-medium text-gray-900">
                 {trip.car.year} {trip.car.make} {trip.car.model}
               </p>
               <p className="text-sm text-gray-600">Plate: {trip.car.licensePlate}</p>
               <p className="text-sm text-gray-600">
                 Start: {trip.startMileage} mi | Fuel: {trip.fuelLevelStart}
               </p>
             </div>
             
             <div>
               <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Trip Info</p>
               <p className="text-sm text-gray-900">
                 Due: {new Date(trip.endDate).toLocaleString()}
               </p>
               <p className="text-sm text-gray-600">
                 Daily Limit: {trip.dailyMileageLimit} mi/day
               </p>
               <p className="text-sm text-gray-600">
                 Host: {trip.host.name}
               </p>
             </div>
           </div>

           {trip.isOverdue && (
             <div className="mt-4 p-3 bg-red-50 rounded-lg">
               <p className="text-sm text-red-800 font-medium">
                 This trip is {trip.hoursOverdue} hours overdue. Consider contacting the guest.
               </p>
             </div>
           )}
         </div>
       ))}
     </div>

     {filteredTrips.length === 0 && (
       <div className="text-center py-12 bg-white rounded-lg">
         <p className="text-gray-500">No active trips found</p>
       </div>
     )}
   </div>
 )
}
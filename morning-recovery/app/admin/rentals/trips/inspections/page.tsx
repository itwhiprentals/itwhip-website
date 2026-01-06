// app/admin/rentals/trips/inspections/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
 IoArrowBackOutline,
 IoCameraOutline,
 IoCarSportOutline,
 IoPersonOutline,
 IoCalendarOutline,
 IoCheckmarkCircle,
 IoCloseCircle,
 IoWarningOutline,
 IoTimeOutline,
 IoSearchOutline,
 IoFilterOutline,
 IoRefreshOutline,
 IoEyeOutline,
 IoFlagOutline,
 IoDocumentTextOutline,
 IoSpeedometerOutline
} from 'react-icons/io5'

interface InspectionData {
 id: string
 bookingCode: string
 guestName: string
 guestEmail: string
 car: {
   make: string
   model: string
   year: number
 }
 tripStatus: string
 tripStartedAt?: string
 tripEndedAt?: string
 startMileage?: number
 endMileage?: number
 hasStartPhotos: boolean
 hasEndPhotos: boolean
 startPhotosCount: number
 endPhotosCount: number
 damageReported: boolean
 createdAt: string
}

export default function InspectionsListPage() {
 const router = useRouter()
 const [inspections, setInspections] = useState<InspectionData[]>([])
 const [loading, setLoading] = useState(true)
 const [refreshing, setRefreshing] = useState(false)
 const [searchTerm, setSearchTerm] = useState('')
 const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'missing'>('all')
 const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent')

 useEffect(() => {
   fetchInspections()
 }, [filterStatus, sortBy])

 const fetchInspections = async () => {
   try {
     setRefreshing(true)
     
     // Fetch all bookings with trip data
     const response = await fetch('/api/admin/rentals/bookings?includeTrips=true')
     if (response.ok) {
       const data = await response.json()
       
       // Filter bookings that have trip activity
       const tripsWithInspections = data.bookings
         .filter((booking: any) => 
           booking.tripStatus === 'ACTIVE' || 
           booking.tripStatus === 'COMPLETED' ||
           booking.tripStartedAt
         )
         .map((booking: any) => ({
           id: booking.id,
           bookingCode: booking.bookingCode,
           guestName: booking.guestName,
           guestEmail: booking.guestEmail,
           car: {
             make: booking.car.make,
             model: booking.car.model,
             year: booking.car.year
           },
           tripStatus: booking.tripStatus || 'NOT_STARTED',
           tripStartedAt: booking.tripStartedAt,
           tripEndedAt: booking.tripEndedAt,
           startMileage: booking.startMileage,
           endMileage: booking.endMileage,
           hasStartPhotos: booking.inspectionPhotos?.some((p: any) => p.type === 'start') || false,
           hasEndPhotos: booking.inspectionPhotos?.some((p: any) => p.type === 'end') || false,
           startPhotosCount: booking.inspectionPhotos?.filter((p: any) => p.type === 'start').length || 0,
           endPhotosCount: booking.inspectionPhotos?.filter((p: any) => p.type === 'end').length || 0,
           damageReported: booking.damageReported || false,
           createdAt: booking.createdAt
         }))
       
       setInspections(tripsWithInspections)
     }
   } catch (error) {
     console.error('Failed to fetch inspections:', error)
   } finally {
     setLoading(false)
     setRefreshing(false)
   }
 }

 const filteredInspections = inspections
   .filter(inspection => {
     // Search filter
     if (searchTerm) {
       const search = searchTerm.toLowerCase()
       if (
         !inspection.bookingCode.toLowerCase().includes(search) &&
         !inspection.guestName.toLowerCase().includes(search) &&
         !inspection.guestEmail.toLowerCase().includes(search) &&
         !`${inspection.car.year} ${inspection.car.make} ${inspection.car.model}`.toLowerCase().includes(search)
       ) {
         return false
       }
     }

     // Status filter
     if (filterStatus === 'active') {
       return inspection.tripStatus === 'ACTIVE'
     } else if (filterStatus === 'completed') {
       return inspection.tripStatus === 'COMPLETED'
     } else if (filterStatus === 'missing') {
       return (inspection.tripStatus === 'ACTIVE' && !inspection.hasStartPhotos) ||
              (inspection.tripStatus === 'COMPLETED' && !inspection.hasEndPhotos)
     }

     return true
   })
   .sort((a, b) => {
     if (sortBy === 'recent') {
       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
     } else {
       return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
     }
   })

 const getStatusBadge = (inspection: InspectionData) => {
   if (inspection.tripStatus === 'ACTIVE') {
     return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active Trip</span>
   } else if (inspection.tripStatus === 'COMPLETED') {
     return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Completed</span>
   }
   return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Not Started</span>
 }

 const getPhotoStatus = (hasPhotos: boolean, count: number) => {
   if (hasPhotos) {
     return (
       <span className="flex items-center text-green-600">
         <IoCheckmarkCircle className="w-4 h-4 mr-1" />
         {count} photos
       </span>
     )
   }
   return (
     <span className="flex items-center text-red-600">
       <IoCloseCircle className="w-4 h-4 mr-1" />
       Missing
     </span>
   )
 }

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="text-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
         <p className="text-gray-600">Loading inspections...</p>
       </div>
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
             <h1 className="text-lg sm:text-xl font-bold text-gray-900">Trip Inspections</h1>
           </div>
           
           <button
             onClick={fetchInspections}
             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
             disabled={refreshing}
           >
             <IoRefreshOutline className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
           </button>
         </div>
       </div>
     </div>

     {/* Filters */}
     <div className="bg-white border-b border-gray-200">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
         <div className="flex flex-col sm:flex-row gap-4">
           {/* Search */}
           <div className="flex-1 relative">
             <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input
               type="text"
               placeholder="Search by booking code, guest, or vehicle..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             />
           </div>

           {/* Status Filter */}
           <select
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value as any)}
             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
           >
             <option value="all">All Trips</option>
             <option value="active">Active Trips</option>
             <option value="completed">Completed</option>
             <option value="missing">Missing Photos</option>
           </select>

           {/* Sort */}
           <select
             value={sortBy}
             onChange={(e) => setSortBy(e.target.value as any)}
             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
           >
             <option value="recent">Most Recent</option>
             <option value="oldest">Oldest First</option>
           </select>
         </div>
       </div>
     </div>

     {/* Stats Cards */}
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
         <div className="bg-white rounded-lg shadow p-4">
           <p className="text-sm text-gray-600">Total Trips</p>
           <p className="text-2xl font-bold text-gray-900">{inspections.length}</p>
         </div>
         <div className="bg-white rounded-lg shadow p-4">
           <p className="text-sm text-gray-600">Active</p>
           <p className="text-2xl font-bold text-green-600">
             {inspections.filter(i => i.tripStatus === 'ACTIVE').length}
           </p>
         </div>
         <div className="bg-white rounded-lg shadow p-4">
           <p className="text-sm text-gray-600">Missing Photos</p>
           <p className="text-2xl font-bold text-amber-600">
             {inspections.filter(i => 
               (i.tripStatus === 'ACTIVE' && !i.hasStartPhotos) ||
               (i.tripStatus === 'COMPLETED' && !i.hasEndPhotos)
             ).length}
           </p>
         </div>
         <div className="bg-white rounded-lg shadow p-4">
           <p className="text-sm text-gray-600">With Damage</p>
           <p className="text-2xl font-bold text-red-600">
             {inspections.filter(i => i.damageReported).length}
           </p>
         </div>
       </div>

       {/* Inspections List */}
       <div className="space-y-4">
         {filteredInspections.length > 0 ? (
           filteredInspections.map(inspection => (
             <div
               key={inspection.id}
               className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
               onClick={() => router.push(`/admin/rentals/trips/inspections/${inspection.id}`)}
             >
               <div className="p-4 sm:p-6">
                 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                   {/* Left Section - Trip Info */}
                   <div className="flex-1">
                     <div className="flex flex-wrap items-center gap-2 mb-2">
                       <h3 className="text-lg font-semibold text-gray-900">
                         {inspection.bookingCode}
                       </h3>
                       {getStatusBadge(inspection)}
                       {inspection.damageReported && (
                         <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                           <IoWarningOutline className="w-3 h-3 inline mr-1" />
                           Damage Reported
                         </span>
                       )}
                     </div>

                     <div className="text-sm text-gray-600 space-y-1">
                       <div className="flex items-center">
                         <IoCarSportOutline className="w-4 h-4 mr-2 text-gray-400" />
                         {inspection.car.year} {inspection.car.make} {inspection.car.model}
                       </div>
                       <div className="flex items-center">
                         <IoPersonOutline className="w-4 h-4 mr-2 text-gray-400" />
                         {inspection.guestName} ({inspection.guestEmail})
                       </div>
                       {inspection.tripStartedAt && (
                         <div className="flex items-center">
                           <IoTimeOutline className="w-4 h-4 mr-2 text-gray-400" />
                           Started: {new Date(inspection.tripStartedAt).toLocaleString()}
                         </div>
                       )}
                       {inspection.startMileage && (
                         <div className="flex items-center">
                           <IoSpeedometerOutline className="w-4 h-4 mr-2 text-gray-400" />
                           Mileage: {inspection.startMileage.toLocaleString()}
                           {inspection.endMileage && ` → ${inspection.endMileage.toLocaleString()}`}
                         </div>
                       )}
                     </div>
                   </div>

                   {/* Right Section - Photos Status */}
                   <div className="flex flex-col sm:items-end space-y-2">
                     <div className="flex flex-col space-y-1 text-sm">
                       <div className="flex items-center justify-between sm:justify-end">
                         <span className="text-gray-600 mr-3">Start Photos:</span>
                         {getPhotoStatus(inspection.hasStartPhotos, inspection.startPhotosCount)}
                       </div>
                       <div className="flex items-center justify-between sm:justify-end">
                         <span className="text-gray-600 mr-3">End Photos:</span>
                         {getPhotoStatus(inspection.hasEndPhotos, inspection.endPhotosCount)}
                       </div>
                     </div>
                     
                     <button
                       onClick={(e) => {
                         e.stopPropagation()
                         router.push(`/admin/rentals/trips/inspections/${inspection.id}`)
                       }}
                       className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                     >
                       <IoEyeOutline className="w-4 h-4 mr-1" />
                       View Inspection
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           ))
         ) : (
           <div className="bg-white rounded-lg shadow p-12 text-center">
             <IoCameraOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">No Inspections Found</h3>
             <p className="text-gray-600">
               {searchTerm || filterStatus !== 'all' 
                 ? 'Try adjusting your filters' 
                 : 'No trips have been started yet'}
             </p>
           </div>
         )}
       </div>
     </div>
   </div>
 )
}
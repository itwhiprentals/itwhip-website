// app/(guest)/rentals/dashboard/bookings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
 IoCarSportOutline,
 IoTimeOutline,
 IoCheckmarkCircle,
 IoWarningOutline,
 IoDocumentTextOutline,
 IoFilterOutline,
 IoCalendarOutline,
 IoSearchOutline,
 IoArrowBackOutline
} from 'react-icons/io5'

interface RentalBooking {
 id: string
 bookingCode: string
 car: {
   make: string
   model: string
   year: number
   photos?: any[]
   dailyRate: number
 }
 host: {
   name: string
 }
 startDate: string
 endDate: string
 numberOfDays: number
 status: string
 verificationStatus?: string
 totalAmount: number
 createdAt: string
}

export default function BookingsListPage() {
 const router = useRouter()
 const [bookings, setBookings] = useState<RentalBooking[]>([])
 const [loading, setLoading] = useState(true)
 const [filter, setFilter] = useState('all')
 const [searchTerm, setSearchTerm] = useState('')

 useEffect(() => {
   fetchBookings()
 }, [])

 const fetchBookings = async () => {
   try {
     const response = await fetch('/api/rentals/user-bookings')
     const data = await response.json()
     
     if (data.success) {
       setBookings(data.bookings)
     }
   } catch (error) {
     console.error('Failed to fetch bookings:', error)
   } finally {
     setLoading(false)
   }
 }

 const getStatusColor = (status: string, verificationStatus?: string) => {
   if (verificationStatus?.toUpperCase() === 'PENDING') {
     return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
   }
   switch(status) {
     case 'CONFIRMED':
       return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
     case 'PENDING':
       return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
     case 'ACTIVE':
       return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
     case 'COMPLETED':
       return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
     case 'CANCELLED':
       return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
     default:
       return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
   }
 }

 const getStatusIcon = (status: string, verificationStatus?: string) => {
   if (verificationStatus?.toUpperCase() === 'PENDING') {
     return <IoWarningOutline className="w-5 h-5 text-yellow-600" />
   }
   switch(status) {
     case 'CONFIRMED':
       return <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
     case 'PENDING':
       return <IoTimeOutline className="w-5 h-5 text-yellow-600" />
     case 'ACTIVE':
       return <IoCarSportOutline className="w-5 h-5 text-blue-600" />
     case 'COMPLETED':
       return <IoCheckmarkCircle className="w-5 h-5 text-gray-600" />
     default:
       return <IoDocumentTextOutline className="w-5 h-5 text-gray-600" />
   }
 }

 const filteredBookings = bookings.filter(booking => {
   // Filter by status
   if (filter !== 'all') {
     if (filter === 'upcoming' && !['PENDING', 'CONFIRMED'].includes(booking.status)) return false
     if (filter === 'active' && booking.status !== 'ACTIVE') return false
     if (filter === 'completed' && booking.status !== 'COMPLETED') return false
     if (filter === 'needs-action' && booking.verificationStatus?.toUpperCase() !== 'PENDING') return false
   }
   
   // Filter by search term
   if (searchTerm) {
     const search = searchTerm.toLowerCase()
     return (
       booking.bookingCode.toLowerCase().includes(search) ||
       booking.car.make.toLowerCase().includes(search) ||
       booking.car.model.toLowerCase().includes(search) ||
       booking.host.name.toLowerCase().includes(search)
     )
   }
   
   return true
 })

 const needsActionCount = bookings.filter(b => b.verificationStatus?.toUpperCase() === 'PENDING').length

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="text-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
         <p className="text-gray-600 dark:text-gray-400">Loading your bookings...</p>
       </div>
     </div>
   )
 }

 return (
   <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
     {/* Header */}
     <div className="bg-white dark:bg-gray-800 shadow">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
         <div className="flex items-center gap-3 mb-3 sm:mb-0">
           <button
             onClick={() => router.push('/dashboard')}
             className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
           >
             <IoArrowBackOutline className="w-6 h-6" />
           </button>
           <div className="flex-1 min-w-0">
             <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
               My Rental Bookings
             </h1>
             <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
               View and manage all your car rental reservations
             </p>
           </div>
           <button
             onClick={() => router.push('/rentals/search')}
             className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
           >
             New Booking
           </button>
         </div>
       </div>
     </div>

     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       {/* Search and Filters */}
       <div className="space-y-4 mb-6">
         {/* Search Bar */}
         <div className="relative">
           <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
           <input
             type="text"
             placeholder="Search by booking code, car, or host..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
           />
         </div>

         {/* Filter Pills - Horizontal Scroll on Mobile */}
         <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
           <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
             {['all', 'upcoming', 'active', 'completed', 'needs-action'].map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                   filter === f
                     ? 'bg-green-600 text-white'
                     : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                 }`}
               >
                 {f === 'needs-action' ? 'Needs Action' : f.charAt(0).toUpperCase() + f.slice(1)}
                 {f === 'needs-action' && needsActionCount > 0 && (
                   <span className="ml-1.5 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">
                     {needsActionCount}
                   </span>
                 )}
               </button>
             ))}
           </div>
         </div>
       </div>

       {/* Alert for pending verifications */}
       {needsActionCount > 0 && filter !== 'needs-action' && (
         <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
           <div className="flex items-center justify-between">
             <div className="flex items-center">
               <IoWarningOutline className="w-5 h-5 text-yellow-600 mr-3" />
               <p className="text-yellow-800 dark:text-yellow-200">
                 You have {needsActionCount} booking{needsActionCount > 1 ? 's' : ''} requiring verification
               </p>
             </div>
             <button
               onClick={() => setFilter('needs-action')}
               className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 font-medium"
             >
               View Now
             </button>
           </div>
         </div>
       )}

       {/* Bookings List */}
       {filteredBookings.length === 0 ? (
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
           <IoCarSportOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
           <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
             No bookings found
           </h3>
           <p className="text-gray-600 dark:text-gray-400 mb-6">
             {searchTerm 
               ? `No bookings match "${searchTerm}"`
               : filter === 'all' 
               ? "You don't have any bookings yet"
               : `No ${filter} bookings`}
           </p>
           {filter === 'all' && (
             <button
               onClick={() => router.push('/rentals/search')}
               className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
             >
               Browse Available Cars
             </button>
           )}
         </div>
       ) : (
         <div className="space-y-4">
           {filteredBookings.map(booking => (
             <div
               key={booking.id}
               className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-4 sm:p-6 cursor-pointer overflow-hidden"
               onClick={() => router.push(`/rentals/dashboard/bookings/${booking.id}`)}
             >
               {/* Mobile Layout */}
               <div className="sm:hidden">
                 <div className="flex gap-3 mb-3">
                   {booking.car.photos?.[0] && (
                     <img
                       src={booking.car.photos[0].url}
                       alt={`${booking.car.make} ${booking.car.model}`}
                       className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                     />
                   )}
                   <div className="flex-1 min-w-0">
                     <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                       {booking.car.year} {booking.car.make}
                     </h3>
                     <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                       {booking.car.model}
                     </p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                       {booking.bookingCode}
                     </p>
                     <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                       getStatusColor(booking.status, booking.verificationStatus)
                     }`}>
                       {booking.verificationStatus?.toUpperCase() === 'PENDING' ? 'Verify Now' : booking.status}
                     </span>
                   </div>
                 </div>

                 <div className="flex items-center justify-between text-sm border-t border-gray-100 dark:border-gray-700 pt-3">
                   <div className="flex items-center text-gray-600 dark:text-gray-400">
                     <IoCalendarOutline className="w-4 h-4 mr-1.5 flex-shrink-0" />
                     <span className="text-xs">
                       {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                     </span>
                   </div>
                   <p className="text-lg font-bold text-gray-900 dark:text-white">
                     ${booking.totalAmount.toFixed(0)}
                   </p>
                 </div>

                 {booking.verificationStatus?.toUpperCase() === 'PENDING' && (
                   <div className="mt-2 flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                     <IoWarningOutline className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                     <span className="truncate">Upload documents to confirm</span>
                   </div>
                 )}
               </div>

               {/* Desktop Layout */}
               <div className="hidden sm:block">
                 <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                   <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                     {booking.car.photos?.[0] && (
                       <img
                         src={booking.car.photos[0].url}
                         alt={`${booking.car.make} ${booking.car.model}`}
                         className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                       />
                     )}

                     <div className="flex-1 min-w-0">
                       <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                         {booking.car.year} {booking.car.make}
                       </h3>
                       <p className="text-base text-gray-700 dark:text-gray-300">
                         {booking.car.model}
                       </p>
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                         Booking Code: {booking.bookingCode}
                       </p>

                       <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                         <div className="flex items-center text-gray-600 dark:text-gray-400">
                           <IoCalendarOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                           {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                         </div>
                         <div className="flex items-center text-gray-600 dark:text-gray-400">
                           <IoTimeOutline className="w-4 h-4 mr-2 flex-shrink-0" />
                           {booking.numberOfDays} day{booking.numberOfDays > 1 ? 's' : ''}
                         </div>
                         <div className="text-gray-600 dark:text-gray-400">
                           Host: {booking.host.name}
                         </div>
                         <div className="text-gray-600 dark:text-gray-400">
                           Booked: {new Date(booking.createdAt).toLocaleDateString()}
                         </div>
                       </div>

                       {booking.verificationStatus?.toUpperCase() === 'PENDING' && (
                         <div className="mt-3 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                           <IoWarningOutline className="w-4 h-4 mr-1" />
                           Verification required - Upload documents to confirm
                         </div>
                       )}
                     </div>
                   </div>

                   <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start space-y-0 lg:space-y-3">
                     <div className="text-right">
                       <p className="text-2xl font-bold text-gray-900 dark:text-white">
                         ${booking.totalAmount.toFixed(2)}
                       </p>
                       <p className="text-sm text-gray-600 dark:text-gray-400">
                         ${booking.car.dailyRate}/day
                       </p>
                     </div>

                     <div className="flex items-center">
                       {getStatusIcon(booking.status, booking.verificationStatus)}
                       <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                         getStatusColor(booking.status, booking.verificationStatus)
                       }`}>
                         {booking.verificationStatus?.toUpperCase() === 'PENDING' ? 'Verify Now' : booking.status}
                       </span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           ))}
         </div>
       )}
     </div>
   </div>
 )
}
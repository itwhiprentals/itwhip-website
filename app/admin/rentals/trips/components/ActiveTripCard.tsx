// app/admin/rentals/trips/components/ActiveTripCard.tsx

'use client'

interface ActiveTripCardProps {
 trip: {
   id: string
   bookingCode: string
   guestName: string
   guestPhone: string
   car: {
     make: string
     model: string
     year: number
   }
   tripStartedAt: string
   endDate: string
   startMileage: number
   isOverdue: boolean
   hoursOverdue?: number
 }
 onViewDetails: (id: string) => void
 onEndTrip: (id: string) => void
 onContactGuest: (phone: string) => void
}

export function ActiveTripCard({ trip, onViewDetails, onEndTrip, onContactGuest }: ActiveTripCardProps) {
 const calculateDuration = () => {
   const start = new Date(trip.tripStartedAt)
   const now = new Date()
   const diff = now.getTime() - start.getTime()
   
   const days = Math.floor(diff / (1000 * 60 * 60 * 24))
   const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
   
   if (days > 0) {
     return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`
   }
   return `${hours} hour${hours > 1 ? 's' : ''}`
 }

 const getTimeUntilReturn = () => {
   const end = new Date(trip.endDate)
   const now = new Date()
   const diff = end.getTime() - now.getTime()
   
   if (diff < 0) {
     return `Overdue by ${trip.hoursOverdue || 0} hours`
   }
   
   const hours = Math.floor(diff / (1000 * 60 * 60))
   if (hours < 24) {
     return `Due in ${hours} hour${hours > 1 ? 's' : ''}`
   }
   
   const days = Math.floor(hours / 24)
   return `Due in ${days} day${days > 1 ? 's' : ''}`
 }

 return (
   <div className={`bg-white rounded-lg shadow-sm border-l-4 p-4 ${
     trip.isOverdue ? 'border-red-500' : 'border-green-500'
   }`}>
     <div className="flex justify-between items-start mb-3">
       <div>
         <h3 className="font-semibold text-gray-900">{trip.bookingCode}</h3>
         <p className="text-sm text-gray-600">
           {trip.car.year} {trip.car.make} {trip.car.model}
         </p>
       </div>
       
       {trip.isOverdue && (
         <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
           OVERDUE
         </span>
       )}
     </div>

     <div className="space-y-2 text-sm">
       <div className="flex justify-between">
         <span className="text-gray-500">Guest:</span>
         <span className="font-medium">{trip.guestName}</span>
       </div>
       
       <div className="flex justify-between">
         <span className="text-gray-500">Duration:</span>
         <span className="font-medium">{calculateDuration()}</span>
       </div>
       
       <div className="flex justify-between">
         <span className="text-gray-500">Return:</span>
         <span className={`font-medium ${trip.isOverdue ? 'text-red-600' : ''}`}>
           {getTimeUntilReturn()}
         </span>
       </div>
       
       <div className="flex justify-between">
         <span className="text-gray-500">Start Mileage:</span>
         <span className="font-medium">{trip.startMileage.toLocaleString()} mi</span>
       </div>
     </div>

     <div className="flex gap-2 mt-4 pt-3 border-t">
       <button
         onClick={() => onViewDetails(trip.id)}
         className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
       >
         View
       </button>
       
       <button
         onClick={() => onContactGuest(trip.guestPhone)}
         className="flex-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
       >
         Call
       </button>
       
       {trip.isOverdue && (
         <button
           onClick={() => onEndTrip(trip.id)}
           className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
         >
           End
         </button>
       )}
     </div>
   </div>
 )
}
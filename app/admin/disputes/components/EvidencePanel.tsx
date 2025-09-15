// app/admin/disputes/components/EvidencePanel.tsx

'use client'

import { useState, useEffect } from 'react'

interface EvidencePanelProps {
 bookingId: string
 messages: Array<{
   id: string
   message: string
   senderType: string
   createdAt: string
   metadata?: any
 }>
}

export function EvidencePanel({ bookingId, messages }: EvidencePanelProps) {
 const [inspectionPhotos, setInspectionPhotos] = useState<any>({
   start: [],
   end: []
 })
 const [showPhotoModal, setShowPhotoModal] = useState(false)
 const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
 const [tripData, setTripData] = useState<any>(null)

 useEffect(() => {
   loadInspectionPhotos()
   loadTripData()
 }, [bookingId])

 const loadInspectionPhotos = async () => {
   try {
     const response = await fetch(`/api/admin/rentals/bookings/${bookingId}/photos`)
     if (response.ok) {
       const data = await response.json()
       setInspectionPhotos({
         start: data.startPhotos || [],
         end: data.endPhotos || []
       })
     }
   } catch (error) {
     console.error('Failed to load photos:', error)
   }
 }

 const loadTripData = async () => {
   try {
     const response = await fetch(`/api/admin/rentals/bookings/${bookingId}/trip-data`)
     if (response.ok) {
       const data = await response.json()
       setTripData(data)
     }
   } catch (error) {
     console.error('Failed to load trip data:', error)
   }
 }

 const handlePhotoClick = (photoUrl: string) => {
   setSelectedPhoto(photoUrl)
   setShowPhotoModal(true)
 }

 // Filter dispute-related messages
 const disputeMessages = messages.filter(m => 
   m.senderType === 'guest' || 
   (m.metadata && m.metadata.disputeId)
 )

 return (
   <div className="bg-white rounded-lg shadow p-6">
     <h2 className="text-lg font-semibold text-gray-900 mb-4">Evidence & Documentation</h2>

     {/* Trip Data Summary */}
     {tripData && (
       <div className="mb-6 p-4 bg-gray-50 rounded-lg">
         <h3 className="text-sm font-medium text-gray-900 mb-3">Trip Data</h3>
         <div className="grid grid-cols-2 gap-4 text-sm">
           <div>
             <span className="text-gray-500">Start Mileage:</span>
             <span className="ml-2 font-medium">{tripData.startMileage || 'N/A'}</span>
           </div>
           <div>
             <span className="text-gray-500">End Mileage:</span>
             <span className="ml-2 font-medium">{tripData.endMileage || 'N/A'}</span>
           </div>
           <div>
             <span className="text-gray-500">Start Fuel:</span>
             <span className="ml-2 font-medium">{tripData.fuelLevelStart || 'N/A'}</span>
           </div>
           <div>
             <span className="text-gray-500">End Fuel:</span>
             <span className="ml-2 font-medium">{tripData.fuelLevelEnd || 'N/A'}</span>
           </div>
           {tripData.damageReported && (
             <div className="col-span-2">
               <span className="text-red-600 font-medium">Damage Reported</span>
               {tripData.damageDescription && (
                 <p className="text-gray-700 mt-1">{tripData.damageDescription}</p>
               )}
             </div>
           )}
         </div>
       </div>
     )}

     {/* Inspection Photos */}
     <div className="mb-6">
       <h3 className="text-sm font-medium text-gray-900 mb-3">Inspection Photos</h3>
       
       {/* Start Photos */}
       {inspectionPhotos.start.length > 0 && (
         <div className="mb-4">
           <p className="text-xs text-gray-500 mb-2">Trip Start</p>
           <div className="grid grid-cols-4 gap-2">
             {inspectionPhotos.start.map((photo: any, index: number) => (
               <div
                 key={index}
                 onClick={() => handlePhotoClick(photo.url)}
                 className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
               >
                 <img
                   src={photo.url}
                   alt={`Start inspection ${photo.category}`}
                   className="w-full h-full object-cover"
                 />
                 <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                   {photo.category}
                 </span>
               </div>
             ))}
           </div>
         </div>
       )}

       {/* End Photos */}
       {inspectionPhotos.end.length > 0 && (
         <div>
           <p className="text-xs text-gray-500 mb-2">Trip End</p>
           <div className="grid grid-cols-4 gap-2">
             {inspectionPhotos.end.map((photo: any, index: number) => (
               <div
                 key={index}
                 onClick={() => handlePhotoClick(photo.url)}
                 className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
               >
                 <img
                   src={photo.url}
                   alt={`End inspection ${photo.category}`}
                   className="w-full h-full object-cover"
                 />
                 <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                   {photo.category}
                 </span>
               </div>
             ))}
           </div>
         </div>
       )}

       {inspectionPhotos.start.length === 0 && inspectionPhotos.end.length === 0 && (
         <p className="text-sm text-gray-500">No inspection photos available</p>
       )}
     </div>

     {/* Guest Messages */}
     <div>
       <h3 className="text-sm font-medium text-gray-900 mb-3">Guest Communications</h3>
       {disputeMessages.length > 0 ? (
         <div className="space-y-3 max-h-96 overflow-y-auto">
           {disputeMessages.map((message) => (
             <div
               key={message.id}
               className={`p-3 rounded-lg ${
                 message.senderType === 'guest' 
                   ? 'bg-blue-50 ml-4' 
                   : 'bg-gray-50 mr-4'
               }`}
             >
               <div className="flex items-start justify-between mb-1">
                 <span className="text-xs font-medium text-gray-700">
                   {message.senderType === 'guest' ? 'Guest' : 'System'}
                 </span>
                 <span className="text-xs text-gray-500">
                   {new Date(message.createdAt).toLocaleString()}
                 </span>
               </div>
               <p className="text-sm text-gray-900">{message.message}</p>
               {message.metadata?.evidence && (
                 <div className="mt-2 text-xs text-gray-500">
                   Evidence attached
                 </div>
               )}
             </div>
           ))}
         </div>
       ) : (
         <p className="text-sm text-gray-500">No messages from guest</p>
       )}
     </div>

     {/* Photo Modal */}
     {showPhotoModal && selectedPhoto && (
       <div
         className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
         onClick={() => setShowPhotoModal(false)}
       >
         <div className="relative max-w-4xl max-h-[90vh]">
           <img
             src={selectedPhoto}
             alt="Inspection photo"
             className="max-w-full max-h-full object-contain"
           />
           <button
             onClick={() => setShowPhotoModal(false)}
             className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
           >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
         </div>
       </div>
     )}
   </div>
 )
}
// app/admin/rentals/trips/inspections/[id]/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface InspectionPhoto {
 id: string
 type: 'start' | 'end'
 category: string
 url: string
 uploadedAt: string
 metadata?: {
   location?: string
   timestamp?: string
   checklistComplete?: boolean
 }
}

interface InspectionData {
 bookingId: string
 bookingCode: string
 guestName: string
 car: {
   make: string
   model: string
   year: number
 }
 tripStartedAt: string
 tripEndedAt?: string
 startMileage: number
 endMileage?: number
 fuelLevelStart: string
 fuelLevelEnd?: string
 damageReported: boolean
 damageDescription?: string
 startPhotos: InspectionPhoto[]
 endPhotos: InspectionPhoto[]
}

export default function InspectionPhotosPage() {
 const params = useParams()
 const router = useRouter()
 const bookingId = params.id as string
 
 const [data, setData] = useState<InspectionData | null>(null)
 const [loading, setLoading] = useState(true)
 const [selectedPhoto, setSelectedPhoto] = useState<InspectionPhoto | null>(null)
 const [compareMode, setCompareMode] = useState(false)
 const [selectedCategory, setSelectedCategory] = useState<string>('all')
 const [showDamageModal, setShowDamageModal] = useState(false)
 const [damageNotes, setDamageNotes] = useState('')

 useEffect(() => {
   loadInspectionData()
 }, [bookingId])

 const loadInspectionData = async () => {
   try {
     const response = await fetch(`/api/admin/trips/inspections/${bookingId}`)
     if (response.ok) {
       const result = await response.json()
       setData(result)
       if (result.damageDescription) {
         setDamageNotes(result.damageDescription)
       }
     }
   } catch (error) {
     console.error('Failed to load inspection data:', error)
   } finally {
     setLoading(false)
   }
 }

 const downloadPhoto = (url: string, filename: string) => {
   const a = document.createElement('a')
   a.href = url
   a.download = filename
   a.click()
 }

 const downloadAllPhotos = async (type: 'start' | 'end') => {
   const photos = type === 'start' ? data?.startPhotos : data?.endPhotos
   if (!photos) return

   photos.forEach((photo, index) => {
     setTimeout(() => {
       downloadPhoto(photo.url, `${data?.bookingCode}_${type}_${photo.category}_${index}.jpg`)
     }, index * 500)
   })
 }

 const flagDamage = async () => {
   if (!damageNotes.trim()) {
     alert('Please enter damage description')
     return
   }

   try {
     const response = await fetch(`/api/admin/trips/inspections/${bookingId}/damage`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         damageReported: true,
         damageDescription: damageNotes
       })
     })
     
     if (response.ok) {
       setShowDamageModal(false)
       loadInspectionData()
     }
   } catch (error) {
     console.error('Failed to flag damage:', error)
   }
 }

 const generateReport = () => {
   if (!data) return

   const report = {
     bookingCode: data.bookingCode,
     guest: data.guestName,
     vehicle: `${data.car.year} ${data.car.make} ${data.car.model}`,
     tripStart: data.tripStartedAt,
     tripEnd: data.tripEndedAt,
     mileage: {
       start: data.startMileage,
       end: data.endMileage,
       total: data.endMileage ? data.endMileage - data.startMileage : null
     },
     fuel: {
       start: data.fuelLevelStart,
       end: data.fuelLevelEnd
     },
     damage: data.damageReported,
     damageDescription: data.damageDescription,
     photos: {
       start: data.startPhotos.length,
       end: data.endPhotos.length
     }
   }

   const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
   const url = window.URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = `inspection_report_${data.bookingCode}.json`
   a.click()
 }

 const photoCategories = [
   'all',
   'front',
   'back',
   'driver_side',
   'passenger_side',
   'odometer',
   'fuel',
   'interior_front',
   'interior_back',
   'damage'
 ]

 const filterPhotos = (photos: InspectionPhoto[]) => {
   if (selectedCategory === 'all') return photos
   return photos.filter(p => p.category === selectedCategory)
 }

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
     </div>
   )
 }

 if (!data) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="text-center">
         <p className="text-red-600 mb-4">Inspection data not found</p>
         <button
           onClick={() => router.push('/admin/rentals/trips')}
           className="px-4 py-2 bg-gray-600 text-white rounded-lg"
         >
           Back to Trips
         </button>
       </div>
     </div>
   )
 }

 return (
   <div className="p-6 max-w-7xl mx-auto">
     <div className="mb-6">
       <button
         onClick={() => router.push('/admin/rentals/trips')}
         className="text-gray-600 hover:text-gray-900 mb-4"
       >
         ← Back to Trips
       </button>
       
       <div className="flex justify-between items-start">
         <div>
           <h1 className="text-2xl font-bold text-gray-900">Trip Inspection Photos</h1>
           <p className="text-gray-600">Booking: {data.bookingCode}</p>
           <p className="text-sm text-gray-500 mt-1">
             {data.car.year} {data.car.make} {data.car.model} - {data.guestName}
           </p>
         </div>
         
         <div className="flex gap-2">
           <button
             onClick={() => setCompareMode(!compareMode)}
             className={`px-4 py-2 rounded-lg ${
               compareMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
             }`}
           >
             {compareMode ? 'Exit Compare' : 'Compare Mode'}
           </button>
           <button
             onClick={generateReport}
             className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
           >
             Generate Report
           </button>
           {!data.damageReported && (
             <button
               onClick={() => setShowDamageModal(true)}
               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
             >
               Flag Damage
             </button>
           )}
         </div>
       </div>
     </div>

     {/* Trip Summary */}
     <div className="bg-white rounded-lg shadow p-4 mb-6">
       <div className="grid grid-cols-4 gap-4">
         <div>
           <p className="text-sm text-gray-500">Trip Start</p>
           <p className="font-medium">{new Date(data.tripStartedAt).toLocaleString()}</p>
         </div>
         <div>
           <p className="text-sm text-gray-500">Trip End</p>
           <p className="font-medium">
             {data.tripEndedAt ? new Date(data.tripEndedAt).toLocaleString() : 'In Progress'}
           </p>
         </div>
         <div>
           <p className="text-sm text-gray-500">Mileage</p>
           <p className="font-medium">
             {data.startMileage} → {data.endMileage || '?'} 
             {data.endMileage && ` (${data.endMileage - data.startMileage} mi)`}
           </p>
         </div>
         <div>
           <p className="text-sm text-gray-500">Fuel Level</p>
           <p className="font-medium">
             {data.fuelLevelStart} → {data.fuelLevelEnd || '?'}
           </p>
         </div>
       </div>
       
       {data.damageReported && (
         <div className="mt-4 p-3 bg-red-50 rounded-lg">
           <p className="text-sm font-medium text-red-800">Damage Reported</p>
           <p className="text-sm text-red-700 mt-1">{data.damageDescription}</p>
         </div>
       )}
     </div>

     {/* Category Filter */}
     <div className="mb-4 flex gap-2">
       {photoCategories.map(category => (
         <button
           key={category}
           onClick={() => setSelectedCategory(category)}
           className={`px-3 py-1 rounded-lg text-sm ${
             selectedCategory === category
               ? 'bg-blue-600 text-white'
               : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
           }`}
         >
           {category.replace(/_/g, ' ').toUpperCase()}
         </button>
       ))}
     </div>

     {/* Photos Display */}
     {compareMode ? (
       <div className="grid grid-cols-2 gap-6">
         <div>
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-semibold">Trip Start Photos</h2>
             <button
               onClick={() => downloadAllPhotos('start')}
               className="text-sm text-blue-600 hover:text-blue-700"
             >
               Download All
             </button>
           </div>
           <div className="grid grid-cols-3 gap-2">
             {filterPhotos(data.startPhotos).map((photo) => (
               <div
                 key={photo.id}
                 className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90"
                 onClick={() => setSelectedPhoto(photo)}
               >
                 <img
                   src={photo.url}
                   alt={photo.category}
                   className="w-full h-full object-cover"
                 />
                 <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-2 py-1 rounded">
                   {photo.category}
                 </span>
               </div>
             ))}
           </div>
         </div>
         
         <div>
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-semibold">Trip End Photos</h2>
             <button
               onClick={() => downloadAllPhotos('end')}
               className="text-sm text-blue-600 hover:text-blue-700"
             >
               Download All
             </button>
           </div>
           <div className="grid grid-cols-3 gap-2">
             {filterPhotos(data.endPhotos).map((photo) => (
               <div
                 key={photo.id}
                 className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90"
                 onClick={() => setSelectedPhoto(photo)}
               >
                 <img
                   src={photo.url}
                   alt={photo.category}
                   className="w-full h-full object-cover"
                 />
                 <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-2 py-1 rounded">
                   {photo.category}
                 </span>
               </div>
             ))}
           </div>
         </div>
       </div>
     ) : (
       <div>
         <div className="mb-6">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-semibold">Trip Start Photos ({data.startPhotos.length})</h2>
             <button
               onClick={() => downloadAllPhotos('start')}
               className="text-sm text-blue-600 hover:text-blue-700"
             >
               Download All
             </button>
           </div>
           <div className="grid grid-cols-6 gap-2">
             {filterPhotos(data.startPhotos).map((photo) => (
               <div
                 key={photo.id}
                 className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90"
                 onClick={() => setSelectedPhoto(photo)}
               >
                 <img
                   src={photo.url}
                   alt={photo.category}
                   className="w-full h-full object-cover"
                 />
                 <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-2 py-1 rounded">
                   {photo.category}
                 </span>
               </div>
             ))}
           </div>
         </div>
         
         {data.endPhotos.length > 0 && (
           <div>
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-semibold">Trip End Photos ({data.endPhotos.length})</h2>
               <button
                 onClick={() => downloadAllPhotos('end')}
                 className="text-sm text-blue-600 hover:text-blue-700"
               >
                 Download All
               </button>
             </div>
             <div className="grid grid-cols-6 gap-2">
               {filterPhotos(data.endPhotos).map((photo) => (
                 <div
                   key={photo.id}
                   className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90"
                   onClick={() => setSelectedPhoto(photo)}
                 >
                   <img
                     src={photo.url}
                     alt={photo.category}
                     className="w-full h-full object-cover"
                   />
                   <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-2 py-1 rounded">
                     {photo.category}
                   </span>
                 </div>
               ))}
             </div>
           </div>
         )}
       </div>
     )}

     {/* Photo Modal */}
     {selectedPhoto && (
       <div
         className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
         onClick={() => setSelectedPhoto(null)}
       >
         <div className="relative max-w-5xl max-h-[90vh]">
           <img
             src={selectedPhoto.url}
             alt={selectedPhoto.category}
             className="max-w-full max-h-full object-contain"
           />
           <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded">
             <p className="text-sm font-medium">{selectedPhoto.category.replace(/_/g, ' ').toUpperCase()}</p>
             <p className="text-xs">{selectedPhoto.type === 'start' ? 'Trip Start' : 'Trip End'}</p>
             <p className="text-xs">{new Date(selectedPhoto.uploadedAt).toLocaleString()}</p>
           </div>
           <button
             onClick={(e) => {
               e.stopPropagation()
               downloadPhoto(selectedPhoto.url, `${data.bookingCode}_${selectedPhoto.type}_${selectedPhoto.category}.jpg`)
             }}
             className="absolute top-4 right-16 bg-white text-gray-900 px-3 py-2 rounded hover:bg-gray-100"
           >
             Download
           </button>
           <button
             onClick={() => setSelectedPhoto(null)}
             className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
           >
             ✕
           </button>
         </div>
       </div>
     )}

     {/* Damage Modal */}
     {showDamageModal && (
       <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
         <div className="bg-white rounded-lg p-6 max-w-md w-full">
           <h3 className="text-lg font-semibold mb-4">Flag Damage</h3>
           <textarea
             value={damageNotes}
             onChange={(e) => setDamageNotes(e.target.value)}
             placeholder="Describe the damage..."
             className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
           />
           <div className="flex gap-2 mt-4">
             <button
               onClick={flagDamage}
               className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
             >
               Flag Damage
             </button>
             <button
               onClick={() => setShowDamageModal(false)}
               className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
             >
               Cancel
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 )
}
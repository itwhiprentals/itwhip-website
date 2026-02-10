// app/(guest)/rentals/trip/start/[id]/components/PhotoCapture.tsx

'use client'

import { useState, useRef } from 'react'
import { TRIP_CONSTANTS } from '@/app/lib/trip/constants'
import { validatePhotoFile } from '@/app/lib/trip/validation'

interface PhotoCaptureProps {
 booking: any
 data: any
 onPhotoCapture: (photoId: string, url: string) => void
}

export function PhotoCapture({ booking, data, onPhotoCapture }: PhotoCaptureProps) {
 const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
 const [uploading, setUploading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const fileInputRef = useRef<HTMLInputElement>(null)

 const requiredPhotos = TRIP_CONSTANTS.REQUIRED_PHOTOS.start
 const currentPhoto = requiredPhotos[currentPhotoIndex]
 const capturedCount = Object.keys(data.photos).length

 const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
   const file = event.target.files?.[0]
   if (!file) return

   // Validate file
   const validation = validatePhotoFile(file)
   if (!validation.valid) {
     setError(validation.error || 'Invalid file')
     return
   }

   setUploading(true)
   setError(null)

   try {
     // Upload to Cloudinary
     const formData = new FormData()
     formData.append('file', file)
     formData.append('type', `inspection_${currentPhoto.id}`)

     const response = await fetch(`/api/rentals/bookings/${booking.id}/trip/inspection-photos`, {
       method: 'POST',
       credentials: 'include',
       body: formData
     })

     if (response.ok) {
       const data = await response.json()
       onPhotoCapture(currentPhoto.id, data.url)
       
       // Move to next photo if available
       if (currentPhotoIndex < requiredPhotos.length - 1) {
         setCurrentPhotoIndex(currentPhotoIndex + 1)
       }
     } else {
       const error = await response.json()
       setError(error.error || 'Failed to upload photo')
     }
   } catch (err) {
     setError('Failed to upload photo. Please try again.')
   } finally {
     setUploading(false)
     if (fileInputRef.current) {
       fileInputRef.current.value = ''
     }
   }
 }

 const handleRetake = (photoId: string) => {
   const index = requiredPhotos.findIndex(p => p.id === photoId)
   if (index !== -1) {
     setCurrentPhotoIndex(index)
   }
 }

 const getPhotoStatus = (photoId: string) => {
   return data.photos[photoId] ? 'captured' : 'pending'
 }

 return (
   <div className="space-y-6">
     {/* Instructions */}
     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
       <h3 className="text-sm font-medium text-blue-900 mb-2">Photo Instructions</h3>
       <ul className="text-sm text-blue-800 space-y-1">
         <li>• Take clear, well-lit photos</li>
         <li>• Include the entire area in frame</li>
         <li>• Document any existing damage</li>
         <li>• Photos are required for your protection</li>
       </ul>
     </div>

     {/* Current Photo Capture */}
     <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
       <div className="mb-4">
         <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
           <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
           </svg>
         </div>
         <h3 className="text-lg font-medium text-gray-900 mb-1">
           {currentPhoto.label}
         </h3>
         <p className="text-sm text-gray-600">
           Photo {currentPhotoIndex + 1} of {requiredPhotos.length}
         </p>
       </div>

       <input
         ref={fileInputRef}
         type="file"
         accept="image/*"
         capture="environment"
         onChange={handleFileSelect}
         className="hidden"
       />

       <button
         onClick={() => fileInputRef.current?.click()}
         disabled={uploading}
         className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
       >
         {uploading ? 'Uploading...' : 'Take Photo'}
       </button>

       {error && (
         <p className="mt-3 text-sm text-red-600">{error}</p>
       )}
     </div>

     {/* Photo Grid */}
     <div>
       <h3 className="text-sm font-medium text-gray-900 mb-3">Required Photos</h3>
       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
         {requiredPhotos.map((photo) => {
           const status = getPhotoStatus(photo.id)
           const photoUrl = data.photos[photo.id]
           
           return (
             <div
               key={photo.id}
               className={`relative border rounded-lg p-3 ${
                 status === 'captured' 
                   ? 'border-green-500 bg-green-50' 
                   : 'border-gray-300 bg-white'
               }`}
             >
               {photoUrl ? (
                 <div>
                   <img
                     src={photoUrl}
                     alt={photo.label}
                     className="w-full h-24 object-cover rounded mb-2"
                   />
                   <p className="text-xs text-gray-700 font-medium">{photo.label}</p>
                   <button
                     onClick={() => handleRetake(photo.id)}
                     className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                   >
                     Retake
                   </button>
                 </div>
               ) : (
                 <div className="text-center">
                   <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                     <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                   </div>
                   <p className="text-xs text-gray-600">{photo.label}</p>
                   {photo.required && (
                     <span className="text-xs text-red-500">Required</span>
                   )}
                 </div>
               )}
             </div>
           )
         })}
       </div>
     </div>

     {/* Progress Summary */}
     <div className="bg-gray-50 rounded-lg p-4">
       <div className="flex items-center justify-between">
         <span className="text-sm text-gray-600">
           {capturedCount} of {requiredPhotos.filter(p => p.required).length} required photos captured
         </span>
         <div className="flex items-center">
           <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
             <div
               className="bg-green-600 h-2 rounded-full transition-all"
               style={{
                 width: `${(capturedCount / requiredPhotos.filter(p => p.required).length) * 100}%`
               }}
             />
           </div>
           <span className="text-sm font-medium text-gray-700">
             {Math.round((capturedCount / requiredPhotos.filter(p => p.required).length) * 100)}%
           </span>
         </div>
       </div>
     </div>
   </div>
 )
}
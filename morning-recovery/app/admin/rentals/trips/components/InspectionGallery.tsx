// app/admin/rentals/trips/components/InspectionGallery.tsx

'use client'

import { useState } from 'react'

interface Photo {
 id: string
 url: string
 category: string
 type: 'start' | 'end'
 uploadedAt: string
 metadata?: any
}

interface InspectionGalleryProps {
 photos: Photo[]
 bookingCode: string
 onPhotoClick?: (photo: Photo) => void
 onDownload?: (photo: Photo) => void
 onDownloadAll?: () => void
 compareMode?: boolean
}

export function InspectionGallery({ 
 photos, 
 bookingCode,
 onPhotoClick,
 onDownload,
 onDownloadAll,
 compareMode = false
}: InspectionGalleryProps) {
 const [selectedCategory, setSelectedCategory] = useState<string>('all')
 const [selectedType, setSelectedType] = useState<'all' | 'start' | 'end'>('all')

 const categories = [
   { value: 'all', label: 'All' },
   { value: 'front', label: 'Front' },
   { value: 'back', label: 'Back' },
   { value: 'driver_side', label: 'Driver Side' },
   { value: 'passenger_side', label: 'Passenger Side' },
   { value: 'odometer', label: 'Odometer' },
   { value: 'fuel', label: 'Fuel' },
   { value: 'interior_front', label: 'Interior Front' },
   { value: 'interior_back', label: 'Interior Back' },
   { value: 'damage', label: 'Damage' }
 ]

 const filteredPhotos = photos.filter(photo => {
   const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory
   const matchesType = selectedType === 'all' || photo.type === selectedType
   return matchesCategory && matchesType
 })

 const startPhotos = filteredPhotos.filter(p => p.type === 'start')
 const endPhotos = filteredPhotos.filter(p => p.type === 'end')

 const getCategoryCount = (category: string) => {
   if (category === 'all') return photos.length
   return photos.filter(p => p.category === category).length
 }

 const getPhotoLabel = (photo: Photo) => {
   const categoryLabel = photo.category.replace(/_/g, ' ')
   return `${categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1)}`
 }

 return (
   <div className="bg-white rounded-lg shadow">
     <div className="p-4 border-b">
       <div className="flex justify-between items-center mb-3">
         <h3 className="font-semibold text-gray-900">Inspection Photos</h3>
         {onDownloadAll && (
           <button
             onClick={onDownloadAll}
             className="text-sm text-blue-600 hover:text-blue-700"
           >
             Download All
           </button>
         )}
       </div>

       <div className="flex gap-2 mb-3">
         <select
           value={selectedType}
           onChange={(e) => setSelectedType(e.target.value as any)}
           className="px-3 py-1 border border-gray-300 rounded text-sm"
         >
           <option value="all">All Photos ({photos.length})</option>
           <option value="start">Start ({photos.filter(p => p.type === 'start').length})</option>
           <option value="end">End ({photos.filter(p => p.type === 'end').length})</option>
         </select>
       </div>

       <div className="flex flex-wrap gap-1">
         {categories.map(cat => (
           <button
             key={cat.value}
             onClick={() => setSelectedCategory(cat.value)}
             className={`px-2 py-1 text-xs rounded ${
               selectedCategory === cat.value
                 ? 'bg-blue-600 text-white'
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
             }`}
           >
             {cat.label} ({getCategoryCount(cat.value)})
           </button>
         ))}
       </div>
     </div>

     <div className="p-4">
       {compareMode ? (
         <div className="grid grid-cols-2 gap-4">
           <div>
             <h4 className="text-sm font-medium text-gray-700 mb-2">
               Trip Start ({startPhotos.length})
             </h4>
             <div className="grid grid-cols-3 gap-2">
               {startPhotos.map(photo => (
                 <div
                   key={photo.id}
                   className="relative aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
                   onClick={() => onPhotoClick?.(photo)}
                 >
                   <img
                     src={photo.url}
                     alt={photo.category}
                     className="w-full h-full object-cover"
                   />
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                     <p className="text-xs text-white truncate">{getPhotoLabel(photo)}</p>
                   </div>
                   {onDownload && (
                     <button
                       onClick={(e) => {
                         e.stopPropagation()
                         onDownload(photo)
                       }}
                       className="absolute top-1 right-1 p-1 bg-white/80 rounded hover:bg-white"
                     >
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                       </svg>
                     </button>
                   )}
                 </div>
               ))}
             </div>
           </div>

           <div>
             <h4 className="text-sm font-medium text-gray-700 mb-2">
               Trip End ({endPhotos.length})
             </h4>
             <div className="grid grid-cols-3 gap-2">
               {endPhotos.map(photo => (
                 <div
                   key={photo.id}
                   className="relative aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
                   onClick={() => onPhotoClick?.(photo)}
                 >
                   <img
                     src={photo.url}
                     alt={photo.category}
                     className="w-full h-full object-cover"
                   />
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                     <p className="text-xs text-white truncate">{getPhotoLabel(photo)}</p>
                   </div>
                   {onDownload && (
                     <button
                       onClick={(e) => {
                         e.stopPropagation()
                         onDownload(photo)
                       }}
                       className="absolute top-1 right-1 p-1 bg-white/80 rounded hover:bg-white"
                     >
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                       </svg>
                     </button>
                   )}
                 </div>
               ))}
             </div>
           </div>
         </div>
       ) : (
         <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
           {filteredPhotos.map(photo => (
             <div
               key={photo.id}
               className="relative aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
               onClick={() => onPhotoClick?.(photo)}
             >
               <img
                 src={photo.url}
                 alt={photo.category}
                 className="w-full h-full object-cover"
               />
               <div className="absolute top-1 left-1">
                 <span className={`px-1 py-0.5 text-xs rounded ${
                   photo.type === 'start' 
                     ? 'bg-green-600 text-white' 
                     : 'bg-blue-600 text-white'
                 }`}>
                   {photo.type.toUpperCase()}
                 </span>
               </div>
               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                 <p className="text-xs text-white truncate">{getPhotoLabel(photo)}</p>
               </div>
               {onDownload && (
                 <button
                   onClick={(e) => {
                     e.stopPropagation()
                     onDownload(photo)
                   }}
                   className="absolute top-1 right-1 p-1 bg-white/80 rounded hover:bg-white"
                 >
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                   </svg>
                 </button>
               )}
             </div>
           ))}
         </div>
       )}

       {filteredPhotos.length === 0 && (
         <div className="text-center py-8">
           <p className="text-gray-500 text-sm">No photos found</p>
         </div>
       )}
     </div>
   </div>
 )
}
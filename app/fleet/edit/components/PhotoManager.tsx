// app/sys-2847/fleet/edit/components/PhotoManager.tsx
'use client'

import { useState, useRef } from 'react'

interface PhotoManagerProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  maxPhotos?: number
}

export function PhotoManager({ 
  photos, 
  onPhotosChange,
  maxPhotos = 20 
}: PhotoManagerProps) {
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    // Check max photos limit
    if (photos.length + e.target.files.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos allowed`)
      return
    }
    
    setUploadingPhotos(true)
    
    const uploadFormData = new FormData()
    Array.from(e.target.files).forEach(file => {
      uploadFormData.append('files', file)
    })
    
    try {
      const response = await fetch('/sys-2847/fleet/api/upload', {
        method: 'POST',
        body: uploadFormData
      })
      
      const data = await response.json()
      
      if (data.success && data.data) {
        const newPhotos = Array.isArray(data.data) ? data.data : [data.data]
        onPhotosChange([...photos, ...newPhotos])
      } else {
        alert('Failed to upload photos')
      }
    } catch (err) {
      console.error('Photo upload error:', err)
      alert('Failed to upload photos')
    } finally {
      setUploadingPhotos(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Remove photo
  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }

  // Move photo to main (first position)
  const movePhotoToMain = (index: number) => {
    if (index === 0) return
    const newPhotos = [...photos]
    const [photo] = newPhotos.splice(index, 1)
    newPhotos.unshift(photo)
    onPhotosChange(newPhotos)
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null) return
    
    const newPhotos = [...photos]
    const draggedPhoto = newPhotos[draggedIndex]
    
    // Remove dragged photo from original position
    newPhotos.splice(draggedIndex, 1)
    
    // Insert at new position
    const adjustedDropIndex = dropIndex > draggedIndex ? dropIndex - 1 : dropIndex
    newPhotos.splice(adjustedDropIndex, 0, draggedPhoto)
    
    onPhotosChange(newPhotos)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Add photos by URL
  const handleAddByUrl = () => {
    const urls = prompt('Paste photo URLs (one per line):')
    if (!urls) return
    
    const urlArray = urls.split('\n').filter(url => url.trim().startsWith('http'))
    
    if (urlArray.length === 0) {
      alert('No valid URLs found')
      return
    }
    
    if (photos.length + urlArray.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos allowed`)
      return
    }
    
    onPhotosChange([...photos, ...urlArray])
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Photos ({photos.length}/{maxPhotos})
        </h3>
        <button
          type="button"
          onClick={handleAddByUrl}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Add by URL
        </button>
      </div>
      
      {/* Upload Input */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotoUpload}
          disabled={uploadingPhotos || photos.length >= maxPhotos}
          className="block w-full text-sm text-gray-700 dark:text-gray-300 
            file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 
            file:text-sm file:font-semibold 
            file:bg-gray-100 dark:file:bg-gray-700 
            file:text-gray-700 dark:file:text-white 
            hover:file:bg-gray-200 dark:hover:file:bg-gray-600 
            cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {uploadingPhotos && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Uploading photos...
          </p>
        )}
        {photos.length >= maxPhotos && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            Maximum photo limit reached
          </p>
        )}
      </div>
      
      {/* Photos Grid */}
      {photos.length > 0 ? (
        <>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Drag to reorder • Click star to set main photo • First photo is shown on listings
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((photoUrl, index) => (
              <div
                key={`${index}-${photoUrl.substring(0, 30)}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  relative group cursor-move
                  ${draggedIndex === index ? 'opacity-50' : ''}
                  ${dragOverIndex === index ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                {/* Image Container */}
                <div className="relative w-full h-28 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                  <img 
                    src={photoUrl} 
                    alt={`Car photo ${index + 1}`}
                    className={`w-full h-full object-cover ${
                      index === 0 ? 'ring-2 ring-yellow-500' : ''
                    }`}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      console.error('Failed to load image:', photoUrl)
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent && !parent.querySelector('.error-text')) {
                        const errorDiv = document.createElement('div')
                        errorDiv.className = 'error-text absolute inset-0 flex items-center justify-center text-red-500 dark:text-red-400 text-xs'
                        errorDiv.innerHTML = `
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        `
                        parent.appendChild(errorDiv)
                      }
                    }}
                  />
                  
                  {/* Drag Handle */}
                  <div className="absolute top-1 left-1 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                </div>
                
                {/* Star button for setting main photo */}
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => movePhotoToMain(index)}
                    className="absolute top-1 right-8 w-6 h-6 bg-black/70 hover:bg-yellow-600 text-white text-sm rounded flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    title="Set as main photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                )}
                
                {/* Main photo indicator */}
                {index === 0 && (
                  <>
                    <div className="absolute top-1 right-8 w-6 h-6 bg-yellow-500 text-white text-sm rounded flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span className="absolute bottom-1 left-1 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                      MAIN
                    </span>
                  </>
                )}
                
                {/* Order number */}
                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  #{index + 1}
                </span>
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white text-sm rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove photo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 mb-2">No photos uploaded yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Upload photos or add by URL
          </p>
        </div>
      )}
      
      {/* Tips */}
      {photos.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Tips:</strong> Upload high-quality photos showing different angles. 
            Include exterior, interior, and feature shots. The main photo appears in search results.
          </p>
        </div>
      )}
    </div>
  )
}
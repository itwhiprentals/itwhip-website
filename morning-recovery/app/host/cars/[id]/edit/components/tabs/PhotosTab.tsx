// app/host/cars/[id]/edit/components/tabs/PhotosTab.tsx
'use client'

import Image from 'next/image'
import {
  IoAddOutline,
  IoImageOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoStar,
  IoStarOutline,
  IoTrashOutline
} from 'react-icons/io5'
import type { CarPhoto } from '../../types'

interface PhotosTabProps {
  photos: CarPhoto[]
  isLocked: boolean
  uploadingPhoto: boolean
  validationErrors: Record<string, string>
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSetHeroPhoto: (photoId: string) => void
  handleDeletePhoto: (photoId: string) => void
}

export function PhotosTab({
  photos,
  isLocked,
  uploadingPhoto,
  validationErrors,
  handlePhotoUpload,
  handleSetHeroPhoto,
  handleDeletePhoto
}: PhotosTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Photos</h3>
        <label className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
          isLocked
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
        }`}>
          <IoAddOutline className="w-5 h-5" />
          {uploadingPhoto ? 'Uploading...' : 'Add Photos'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
            disabled={uploadingPhoto || isLocked}
          />
        </label>
      </div>

      {isLocked && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Photo uploads are disabled while vehicle has an active claim
          </p>
        </div>
      )}

      {/* Photo count indicator */}
      <div className={`flex items-center justify-between mb-4 p-3 rounded-lg ${
        photos.length >= 3
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
          : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
      }`}>
        <div className="flex items-center gap-2">
          {photos.length >= 3 ? (
            <IoCheckmarkCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          )}
          <span className={`text-sm font-medium ${
            photos.length >= 3
              ? 'text-emerald-800 dark:text-emerald-300'
              : 'text-amber-800 dark:text-amber-300'
          }`}>
            {photos.length} of 3 minimum photos uploaded
          </span>
        </div>
        {photos.length < 3 && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            {3 - photos.length} more required
          </span>
        )}
      </div>

      {validationErrors.photos && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
            <IoWarningOutline className="w-4 h-4" />
            {validationErrors.photos}
          </p>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <IoImageOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No photos uploaded yet</p>
          <p className="text-sm text-gray-500 mt-1">Add photos to showcase your vehicle</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <Image
                src={photo.url}
                alt="Car photo"
                width={300}
                height={200}
                className="w-full h-40 object-cover rounded-lg"
              />
              {!isLocked && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleSetHeroPhoto(photo.id)}
                    className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800"
                    title="Set as main photo"
                  >
                    {photo.isHero ? (
                      <IoStar className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <IoStarOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800"
                    title="Delete photo"
                  >
                    <IoTrashOutline className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              )}
              {photo.isHero && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">
                  Main Photo
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PhotosTab

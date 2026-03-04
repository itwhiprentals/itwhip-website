// app/partner/requests/[id]/components/add-car/PhotosStep.tsx
// Photo upload grid with hero selection and deletion

'use client'

import Image from 'next/image'
import {
  IoCheckmarkCircle,
  IoWarningOutline,
  IoImageOutline,
  IoAddOutline,
  IoTrashOutline,
  IoStar,
  IoStarOutline,
} from 'react-icons/io5'
import type { PhotoItem } from '@/app/hooks/usePhotoUpload'
import type { ChangeEvent } from 'react'

interface PhotosStepProps {
  photos: PhotoItem[]
  handlePhotoUpload: (e: ChangeEvent<HTMLInputElement>) => void
  setHeroPhoto: (photoId: string) => void
  deletePhoto: (photoId: string) => void
  t: (key: string, values?: Record<string, any>) => string
}

export default function PhotosStep({
  photos, handlePhotoUpload, setHeroPhoto, deletePhoto, t
}: PhotosStepProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IoImageOutline className="w-5 h-5 text-orange-600" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('addVehiclePhotos')}</h3>
        </div>
        {photos.length > 0 && (
          <label className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 cursor-pointer flex items-center gap-1">
            <IoAddOutline className="w-4 h-4" />
            {t('addAddPhotos')}
            <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Count indicator */}
      <div className={`flex items-center justify-between mb-3 p-2.5 rounded-lg ${
        photos.length >= 3
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
      }`}>
        <div className="flex items-center gap-2">
          {photos.length >= 3 ? (
            <IoCheckmarkCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <IoWarningOutline className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          )}
          <span className={`text-sm font-medium ${
            photos.length >= 3 ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'
          }`}>
            {t('addPhotoCount', { count: photos.length })}
          </span>
        </div>
        {photos.length < 3 && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            {t('addMoreRequired', { count: 3 - photos.length })}
          </span>
        )}
      </div>

      {photos.length === 0 ? (
        <label className="block text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
          <IoImageOutline className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('addClickOrDrag')}</p>
          <p className="text-xs text-gray-500 mt-1">{t('addPhotoFormat')}</p>
          <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
        </label>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-[4/3]">
              <Image src={photo.url} alt="Vehicle" fill className="object-cover rounded-lg" />
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setHeroPhoto(photo.id)}
                  className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-md"
                >
                  {photo.isHero ? (
                    <IoStar className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <IoStarOutline className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  )}
                </button>
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-md"
                >
                  <IoTrashOutline className="w-4 h-4 text-red-500" />
                </button>
              </div>
              {photo.isHero && (
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-orange-600 text-white text-[10px] rounded">
                  {t('addMainPhoto')}
                </div>
              )}
            </div>
          ))}
          <label className="aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
            <IoAddOutline className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-500 mt-1">{t('addAddMore')}</span>
            <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>
      )}
    </div>
  )
}

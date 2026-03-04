// app/hooks/usePhotoUpload.ts
// Shared hook for vehicle photo upload, hero selection, and deletion
// Used by AddCarSimple, AddCarWizard, and car edit forms

import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react'

export interface PhotoItem {
  id: string
  url: string
  file?: File
  isHero: boolean
}

export function usePhotoUpload(initialPhotos?: PhotoItem[]) {
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos || [])

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const newPhotos: PhotoItem[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      newPhotos.push({
        id: `temp-${Date.now()}-${i}`,
        url: URL.createObjectURL(file),
        file,
        isHero: photos.length === 0 && i === 0
      })
    }
    setPhotos(prev => [...prev, ...newPhotos])
    e.target.value = ''
  }

  const setHeroPhoto = (photoId: string) => {
    setPhotos(prev => prev.map(p => ({ ...p, isHero: p.id === photoId })))
  }

  const deletePhoto = (photoId: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== photoId)
      if (filtered.length > 0 && !filtered.some(p => p.isHero)) filtered[0].isHero = true
      return filtered
    })
  }

  return {
    photos, setPhotos,
    handlePhotoUpload,
    setHeroPhoto,
    deletePhoto,
  }
}

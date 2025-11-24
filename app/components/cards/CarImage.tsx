// app/components/cards/CarImage.tsx
'use client'

import { useState } from 'react'
import { IoCarOutline } from 'react-icons/io5'

interface CarImageProps {
  car: any
  className?: string
}

export default function CarImage({ car, className = '' }: CarImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const getImageUrl = () => {
    const sources = [
      car.photos, 
      car.RentalCarPhoto, 
      car.carPhotos, 
      car.images, 
      car.photo, 
      car.image, 
      car.imageUrl, 
      car.photoUrl
    ]
    
    for (const src of sources) {
      if (src) {
        if (Array.isArray(src) && src.length > 0) {
          const first = src[0]
          if (first.url) return first.url
          if (typeof first === 'string') return first
        }
        if (typeof src === 'object' && src.url) return src.url
        if (typeof src === 'string') return src
      }
    }

    const make = (car.make || '').toLowerCase()
    const model = (car.model || '').toLowerCase()
    const type = (car.carType || '').toLowerCase()

    const brandImages = {
      tesla: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
      bmw: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      mercedes: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
      audi: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&h=600&fit=crop',
      porsche: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
      lexus: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop',
      toyota: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&h=600&fit=crop',
      honda: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      ford: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&h=600&fit=crop',
      chevrolet: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
      nissan: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
      hyundai: 'https://images.unsplash.com/photo-1562141961-401595f78d6e?w=800&h=600&fit=crop',
      kia: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop'
    }

    if (brandImages[make]) return brandImages[make]
    if (model.includes('suv') || type.includes('suv')) return brandImages.nissan
    if (model.includes('sedan') || type.includes('sedan')) return brandImages.bmw
    if (model.includes('coupe') || type.includes('coupe')) return 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop'
    if (model.includes('convertible') || type.includes('convertible')) return brandImages.porsche
    if (model.includes('truck') || type.includes('truck')) return 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop'
    if (model.includes('hatchback') || type.includes('hatchback')) return brandImages.kia

    return 'https://images.unsplash.com/photo-1485463611174-f302f6a5c1c9?w=800&h=600&fit=crop'
  }

  const imageUrl = getImageUrl()

  if (imageError) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center`}>
        <div className="text-center">
          <IoCarOutline className="w-16 h-16 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {car.year} {car.make} {car.model}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center absolute inset-0 z-10`}>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={imageUrl}
        alt={`${car.make} ${car.model} ${car.year}`}
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={() => { 
          setImageError(true)
          setIsLoading(false) 
        }}
        loading="lazy"
      />
    </div>
  )
}
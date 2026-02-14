// app/(guest)/rentals/components/CarTypeCard.tsx
// Individual car type card with scene backgrounds

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { 
  IoSparklesOutline,
  IoCheckmarkOutline,
  IoCarOutline,
  IoArrowForwardOutline,
  IoFlashOutline
} from 'react-icons/io5'
import { CarType } from './CarTypeData'

interface CarTypeCardProps {
  car: CarType
  index: number
  isActive?: boolean
}

export default function CarTypeCard({ car, index, isActive = false }: CarTypeCardProps) {
  const t = useTranslations('VehicleCard')
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  
  const handleClick = () => {
    router.push(`/rentals/search?carType=${car.type}`)
  }
  
  return (
    <div
      className={`
        relative flex-shrink-0 w-[280px] sm:w-[320px] md:w-full 
        h-[400px] sm:h-[420px] rounded-lg overflow-hidden 
        cursor-pointer transition-all duration-500 
        ${isActive ? 'scale-105 shadow-2xl' : 'scale-100 shadow-lg'}
        ${isHovered ? 'transform -translate-y-2' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Background Scene Image */}
      <div className="absolute inset-0">
        <img 
          src={car.sceneImage} 
          alt={`${car.label} scene`}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80`} />
      </div>
      
      {/* Badge */}
      {car.badge && (
        <div className="absolute top-4 left-4 z-20">
          <span className={`
            px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
            backdrop-blur-md bg-white/90 text-gray-900 shadow-lg
          `}>
            {car.badge}
          </span>
        </div>
      )}
      
      {/* Available Count */}
      <div className="absolute top-4 right-4 z-20">
        <div className="px-3 py-1.5 rounded-full backdrop-blur-md bg-black/50 text-white text-xs font-medium flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {car.available} {t('available')}
        </div>
      </div>
      
      {/* Car Image - Only show if image exists */}
      {car.image && (
        <div className={`
          absolute inset-x-0 top-1/3 transform -translate-y-1/2 
          transition-all duration-500 
          ${isHovered ? 'scale-110' : 'scale-100'}
        `}>
          <img 
            src={car.image} 
            alt={car.label}
            className="w-4/5 mx-auto drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))'
            }}
          />
        </div>
      )}
      
      {/* Content */}
      <div className="absolute bottom-0 inset-x-0 p-6 text-white">
        {/* Tagline */}
        <p className="text-sm font-medium text-gray-300 mb-1">{car.tagline}</p>
        
        {/* Title and Price */}
        <div className="flex items-end justify-between mb-3">
          <h3 className="text-2xl font-bold">{car.label}</h3>
          <div className="text-right">
            <span className="text-2xl font-bold">${car.priceValue}</span>
            <span className="text-sm text-gray-300">{t('perDay')}</span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-300 mb-4">{car.description}</p>
        
        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {car.features.map((feature, idx) => (
            <span 
              key={idx}
              className="px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium"
            >
              {feature}
            </span>
          ))}
        </div>
        
        {/* CTA */}
        <div className={`
          flex items-center justify-between px-4 py-3 rounded-lg
          bg-white/10 backdrop-blur-md border border-white/20
          transition-all duration-300
          ${isHovered ? 'bg-white/20 border-white/30' : ''}
        `}>
          <span className="font-semibold">{t('browseType', { type: car.label })}</span>
          <IoArrowForwardOutline className={`
            w-5 h-5 transition-transform duration-300
            ${isHovered ? 'translate-x-2' : 'translate-x-0'}
          `} />
        </div>
      </div>
    </div>
  )
}
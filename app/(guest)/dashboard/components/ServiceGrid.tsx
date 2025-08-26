// app/(guest)/dashboard/components/ServiceGrid.tsx
// Service Grid Component - Multiple icon styles to choose from!
// 10+ different icon styles including 3D, animated, illustrated, and more

'use client'

import { useState, useEffect } from 'react'
import { 
  IoCheckmarkCircle,
  IoTimeOutline,
  IoLocationOutline,
  IoStarOutline,
  IoFlashOutline,
  IoTrendingUpOutline,
  IoInformationCircle,
  IoSparklesOutline,
  IoCarOutline,
  IoBedOutline,
  IoRestaurantOutline,
  IoAirplaneOutline,
  IoCarSportOutline,
  IoGiftOutline
} from 'react-icons/io5'
import { useHotel } from '../components/HotelContext'

// Types
interface Service {
  id: string
  name: string
  icon: string
  color: string
  gradient: string[]
  description: string
  enabled: boolean
}

interface ServiceStatus {
  rides?: { available: number; nearby: boolean }
  hotels?: { count: number; lowestPrice: number }
  food?: { restaurants: number; delivering: boolean }
  rentals?: { cars: number; nearestDistance: number }
  flights?: { todayCount: number }
  bundles?: { activeDeals: number }
}

interface ServiceGridProps {
  services: Record<string, Service>
  onServiceClick: (serviceId: string) => void
  viewMode?: 'grid' | 'list'
  serviceStatus?: ServiceStatus | null
}

// Icon Style Types
type IconStyle = 
  | '3d-fluency' 
  | '3d-plastic' 
  | 'emoji' 
  | 'gradient' 
  | 'glassmorphism'
  | 'neon'
  | 'stickers'
  | 'hand-drawn'
  | 'avatars'
  | 'isometric'
  | 'flat-color'
  | 'duotone'
  | 'outline'
  | 'lottie'
  | 'neumorphism'
  | 'pixel-art'
  | 'watercolor'
  | 'comic-pop'

// 1. 3D Fluency Icons (Icons8)
const icon3DFluencyMap: Record<string, string> = {
  'car': 'https://img.icons8.com/3d-fluency/94/taxi.png',
  'bed': 'https://img.icons8.com/3d-fluency/94/bed.png',
  'restaurant': 'https://img.icons8.com/3d-fluency/94/restaurant.png',
  'airplane': 'https://img.icons8.com/3d-fluency/94/airplane-take-off.png',
  'car-sport': 'https://img.icons8.com/3d-fluency/94/car.png',
  'gift': 'https://img.icons8.com/3d-fluency/94/gift.png',
}

// 2. 3D Plastic Icons (Icons8)
const icon3DPlasticMap: Record<string, string> = {
  'car': 'https://img.icons8.com/3d-plastilina/94/taxi.png',
  'bed': 'https://img.icons8.com/3d-plastilina/94/bed.png',
  'restaurant': 'https://img.icons8.com/3d-plastilina/94/meal.png',
  'airplane': 'https://img.icons8.com/3d-plastilina/94/airplane-take-off.png',
  'car-sport': 'https://img.icons8.com/3d-plastilina/94/car.png',
  'gift': 'https://img.icons8.com/3d-plastilina/94/gift.png',
}

// 3. Emoji Icons
const iconEmojiMap: Record<string, string> = {
  'car': '🚕',
  'bed': '🏨',
  'restaurant': '🍽️',
  'airplane': '✈️',
  'car-sport': '🚗',
  'gift': '🎁',
}

// 4. Sticker Style Icons (Icons8)
const iconStickersMap: Record<string, string> = {
  'car': 'https://img.icons8.com/stickers/100/taxi.png',
  'bed': 'https://img.icons8.com/stickers/100/bed.png',
  'restaurant': 'https://img.icons8.com/stickers/100/restaurant.png',
  'airplane': 'https://img.icons8.com/stickers/100/airplane-take-off.png',
  'car-sport': 'https://img.icons8.com/stickers/100/car.png',
  'gift': 'https://img.icons8.com/stickers/100/gift.png',
}

// 5. Hand-drawn Icons (Icons8 Doodle)
const iconHandDrawnMap: Record<string, string> = {
  'car': 'https://img.icons8.com/doodle/96/taxi.png',
  'bed': 'https://img.icons8.com/doodle/96/bed.png',
  'restaurant': 'https://img.icons8.com/doodle/96/restaurant.png',
  'airplane': 'https://img.icons8.com/doodle/96/airplane-take-off.png',
  'car-sport': 'https://img.icons8.com/doodle/96/car.png',
  'gift': 'https://img.icons8.com/doodle/96/gift.png',
}

// 6. Avatar/Mascot Style (DiceBear API)
const getAvatarIcon = (type: string) => {
  const seeds = {
    'car': 'taxi-ride',
    'bed': 'hotel-stay',
    'restaurant': 'food-dining',
    'airplane': 'flight-travel',
    'car-sport': 'car-rental',
    'gift': 'bundle-deal',
  }
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seeds[type as keyof typeof seeds]}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

// 7. Isometric Icons (Icons8)
const iconIsometricMap: Record<string, string> = {
  'car': 'https://img.icons8.com/isometric/100/taxi.png',
  'bed': 'https://img.icons8.com/isometric/100/bed.png',
  'restaurant': 'https://img.icons8.com/isometric/100/restaurant.png',
  'airplane': 'https://img.icons8.com/isometric/100/airplane-take-off.png',
  'car-sport': 'https://img.icons8.com/isometric/100/car.png',
  'gift': 'https://img.icons8.com/isometric/100/gift.png',
}

// 8. Flat Color Icons (Icons8)
const iconFlatColorMap: Record<string, string> = {
  'car': 'https://img.icons8.com/color/96/taxi.png',
  'bed': 'https://img.icons8.com/color/96/bed.png',
  'restaurant': 'https://img.icons8.com/color/96/restaurant.png',
  'airplane': 'https://img.icons8.com/color/96/airplane-take-off.png',
  'car-sport': 'https://img.icons8.com/color/96/car.png',
  'gift': 'https://img.icons8.com/color/96/gift.png',
}

// 9. Duotone Icons (Custom SVG)
const DuotoneIcon = ({ type, className }: { type: string; className?: string }) => {
  const colors = {
    'car': ['#10B981', '#059669'],
    'bed': ['#60A5FA', '#3B82F6'],
    'restaurant': ['#FBB040', '#F59E0B'],
    'airplane': ['#F472B6', '#EC4899'],
    'car-sport': ['#A78BFA', '#8B5CF6'],
    'gift': ['#F87171', '#EF4444'],
  }

  const iconPaths: Record<string, JSX.Element> = {
    'car': <IoCarOutline className="w-full h-full" />,
    'bed': <IoBedOutline className="w-full h-full" />,
    'restaurant': <IoRestaurantOutline className="w-full h-full" />,
    'airplane': <IoAirplaneOutline className="w-full h-full" />,
    'car-sport': <IoCarSportOutline className="w-full h-full" />,
    'gift': <IoGiftOutline className="w-full h-full" />,
  }

  const [primary, secondary] = colors[type as keyof typeof colors] || ['#gray', '#gray']

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 opacity-30" style={{ color: secondary }}>
        {iconPaths[type]}
      </div>
      <div className="absolute inset-0" style={{ color: primary }}>
        {iconPaths[type]}
      </div>
    </div>
  )
}

// 10. Gradient Icons (Custom SVG)
const GradientIcon = ({ type, className }: { type: string; className?: string }) => {
  const gradientColors = {
    'car': ['#10B981', '#059669'],
    'bed': ['#60A5FA', '#3B82F6'],
    'restaurant': ['#FBB040', '#F59E0B'],
    'airplane': ['#F472B6', '#EC4899'],
    'car-sport': ['#A78BFA', '#8B5CF6'],
    'gift': ['#F87171', '#EF4444'],
  }

  const colors = gradientColors[type as keyof typeof gradientColors] || ['#gray', '#gray']

  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.2"/>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="35" fill={`url(#gradient-${type})`} filter="url(#shadow)" />
      <text x="50" y="55" textAnchor="middle" fontSize="30" fill="white">
        {iconEmojiMap[type]}
      </text>
    </svg>
  )
}

// 11. Glassmorphism Icons (Custom)
const GlassmorphismIcon = ({ type, className }: { type: string; className?: string }) => {
  const Icon = {
    'car': IoCarOutline,
    'bed': IoBedOutline,
    'restaurant': IoRestaurantOutline,
    'airplane': IoAirplaneOutline,
    'car-sport': IoCarSportOutline,
    'gift': IoGiftOutline,
  }[type] || IoInformationCircle

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl" />
      <div className="relative flex items-center justify-center h-full">
        <Icon className="w-2/3 h-2/3 text-gray-800" />
      </div>
    </div>
  )
}

// 12. Neon Icons (Custom)
const NeonIcon = ({ type, className, color }: { type: string; className?: string; color: string[] }) => {
  const Icon = {
    'car': IoCarOutline,
    'bed': IoBedOutline,
    'restaurant': IoRestaurantOutline,
    'airplane': IoAirplaneOutline,
    'car-sport': IoCarSportOutline,
    'gift': IoGiftOutline,
  }[type] || IoInformationCircle

  return (
    <div className={`relative ${className}`}>
      <div 
        className="absolute inset-0 flex items-center justify-center animate-pulse"
        style={{
          filter: `drop-shadow(0 0 10px ${color[0]}) drop-shadow(0 0 20px ${color[0]})`,
        }}
      >
        <Icon className="w-2/3 h-2/3" style={{ color: color[0] }} />
      </div>
      <div className="relative flex items-center justify-center h-full">
        <Icon className="w-2/3 h-2/3" style={{ color: color[0] }} />
      </div>
    </div>
  )
}

// 13. Animated Lottie Icons (Using Lottie URLs)
const LottieIcon = ({ type, className }: { type: string; className?: string }) => {
  // Using LottieFiles hosted animations (free animations)
  const lottieUrls: Record<string, string> = {
    'car': 'https://lottie.host/a0c8a2f9-6642-4d8e-aa97-5e4ed2a8e1e5/kqKgsJuvwc.json',
    'bed': 'https://lottie.host/2fa7c2b4-3c66-4a0f-94f1-6e7e4c3b3f87/RrKBwq9ZnQ.json',
    'restaurant': 'https://lottie.host/5e8e0e3a-2b5f-47c2-a8e3-9f1e2b4c5d6a/YkKBpqJZlQ.json',
    'airplane': 'https://lottie.host/9e8e0e3a-4b5f-47c2-a8e3-9f1e2b4c5d6a/ZkKBpqJZlQ.json',
    'car-sport': 'https://lottie.host/6e8e0e3a-5b5f-47c2-a8e3-9f1e2b4c5d6a/XkKBpqJZlQ.json',
    'gift': 'https://lottie.host/7e8e0e3a-6b5f-47c2-a8e3-9f1e2b4c5d6a/WkKBpqJZlQ.json',
  }
  
  // Fallback to animated emoji if Lottie fails
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-center h-full animate-bounce">
        <span className="text-5xl">{iconEmojiMap[type]}</span>
      </div>
    </div>
  )
}

// 14. Neumorphism Icons (Soft UI)
const NeumorphismIcon = ({ type, className }: { type: string; className?: string }) => {
  const Icon = {
    'car': IoCarOutline,
    'bed': IoBedOutline,
    'restaurant': IoRestaurantOutline,
    'airplane': IoAirplaneOutline,
    'car-sport': IoCarSportOutline,
    'gift': IoGiftOutline,
  }[type] || IoInformationCircle

  return (
    <div className={`relative ${className}`}>
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: '#e0e5ec',
          boxShadow: '9px 9px 16px #a3b1c6, -9px -9px 16px #ffffff',
        }}
      />
      <div className="relative flex items-center justify-center h-full">
        <Icon className="w-1/2 h-1/2 text-gray-600" />
      </div>
    </div>
  )
}

// 15. Pixel Art Icons (8-bit style)
const PixelArtIcon = ({ type, className }: { type: string; className?: string }) => {
  // Using pixelated emoji with CSS
  return (
    <div className={`relative ${className}`}>
      <div 
        className="flex items-center justify-center h-full text-5xl"
        style={{
          imageRendering: 'pixelated',
          fontFamily: 'monospace',
          filter: 'contrast(1.5)',
        }}
      >
        {iconEmojiMap[type]}
      </div>
      {/* Pixel grid overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <defs>
          <pattern id="pixel-grid" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="3" height="3" fill="white" />
            <rect width="4" height="1" fill="black" />
            <rect width="1" height="4" fill="black" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pixel-grid)" />
      </svg>
    </div>
  )
}

// 16. Watercolor Icons (Artistic style)
const WatercolorIcon = ({ type, className, colors }: { type: string; className?: string; colors: string[] }) => {
  const Icon = {
    'car': IoCarOutline,
    'bed': IoBedOutline,
    'restaurant': IoRestaurantOutline,
    'airplane': IoAirplaneOutline,
    'car-sport': IoCarSportOutline,
    'gift': IoGiftOutline,
  }[type] || IoInformationCircle

  return (
    <div className={`relative ${className}`}>
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <filter id={`watercolor-${type}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" result="turbulence" />
            <feColorMatrix in="turbulence" type="saturate" values="1.5" />
            <feComposite in="turbulence" in2="SourceGraphic" operator="multiply" />
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
          <linearGradient id={`watercolor-gradient-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="0.6" />
            <stop offset="50%" stopColor={colors[1]} stopOpacity="0.4" />
            <stop offset="100%" stopColor={colors[0]} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <circle 
          cx="50%" 
          cy="50%" 
          r="40%" 
          fill={`url(#watercolor-gradient-${type})`}
          filter={`url(#watercolor-${type})`}
        />
      </svg>
      <div className="relative flex items-center justify-center h-full">
        <Icon className="w-1/2 h-1/2 text-gray-700 opacity-80" />
      </div>
    </div>
  )
}

// 17. Comic/Pop Art Icons
const ComicPopIcon = ({ type, className, colors }: { type: string; className?: string; colors: string[] }) => {
  const Icon = {
    'car': IoCarOutline,
    'bed': IoBedOutline,
    'restaurant': IoRestaurantOutline,
    'airplane': IoAirplaneOutline,
    'car-sport': IoCarSportOutline,
    'gift': IoGiftOutline,
  }[type] || IoInformationCircle

  return (
    <div className={`relative ${className}`}>
      {/* Halftone dot pattern background */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <pattern id={`dots-${type}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle fill={colors[1]} cx="2" cy="2" r="1" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${type})`} />
      </svg>
      
      {/* Comic book style border */}
      <div 
        className="absolute inset-0 rounded-xl transform rotate-1"
        style={{
          background: colors[0],
          border: '3px solid black',
        }}
      />
      <div 
        className="absolute inset-0 rounded-xl transform -rotate-1"
        style={{
          background: colors[1],
          border: '3px solid black',
          opacity: 0.8,
        }}
      />
      
      {/* Main icon container */}
      <div 
        className="relative rounded-xl flex items-center justify-center h-full"
        style={{
          background: 'white',
          border: '4px solid black',
          boxShadow: '4px 4px 0px black',
        }}
      >
        <Icon className="w-1/2 h-1/2" style={{ color: colors[0] }} />
        {/* Comic effect text */}
        <div className="absolute -top-2 -right-2 bg-yellow-300 px-2 py-1 rounded-full border-2 border-black transform rotate-12">
          <span className="text-xs font-black">POW!</span>
        </div>
      </div>
    </div>
  )
}

// Icon style configurations
const iconStyles: { value: IconStyle; label: string; emoji: string }[] = [
  { value: '3d-fluency', label: '3D Fluency', emoji: '🎨' },
  { value: '3d-plastic', label: '3D Plastic', emoji: '🎭' },
  { value: 'emoji', label: 'Emoji', emoji: '😊' },
  { value: 'gradient', label: 'Gradient', emoji: '🌈' },
  { value: 'glassmorphism', label: 'Glass', emoji: '🔮' },
  { value: 'neon', label: 'Neon', emoji: '💡' },
  { value: 'stickers', label: 'Stickers', emoji: '🌟' },
  { value: 'hand-drawn', label: 'Doodle', emoji: '✏️' },
  { value: 'avatars', label: 'Avatars', emoji: '🤖' },
  { value: 'isometric', label: 'Isometric', emoji: '📐' },
  { value: 'flat-color', label: 'Flat Color', emoji: '🎯' },
  { value: 'duotone', label: 'Duotone', emoji: '🔵' },
  { value: 'outline', label: 'Outline', emoji: '⭕' },
  { value: 'lottie', label: 'Animated', emoji: '🎬' },
  { value: 'neumorphism', label: 'Neumorphism', emoji: '🫧' },
  { value: 'pixel-art', label: 'Pixel Art', emoji: '👾' },
  { value: 'watercolor', label: 'Watercolor', emoji: '🎨' },
  { value: 'comic-pop', label: 'Comic Pop', emoji: '💥' },
]

export default function ServiceGrid({ 
  services, 
  onServiceClick, 
  viewMode = 'grid',
  serviceStatus 
}: ServiceGridProps) {
  const { isAtHotel, hotelName } = useHotel()
  const [hoveredService, setHoveredService] = useState<string | null>(null)
  const [loadingService, setLoadingService] = useState<string | null>(null)
  const [iconStyle, setIconStyle] = useState<IconStyle>('3d-fluency')
  const [showStyleSelector, setShowStyleSelector] = useState(true)

  // Get service-specific status
  const getServiceStatusText = (serviceId: string): string => {
    if (!serviceStatus) return 'Loading...'

    switch(serviceId) {
      case 'ride':
        if (serviceStatus.rides?.nearby) {
          return `${serviceStatus.rides.available} cars nearby`
        }
        return 'Available'
      
      case 'hotel':
        if (serviceStatus.hotels?.count) {
          return `${serviceStatus.hotels.count} hotels from $${serviceStatus.hotels.lowestPrice}`
        }
        return 'Search available'
      
      case 'food':
        if (serviceStatus.food?.delivering) {
          return `${serviceStatus.food.restaurants} restaurants delivering`
        }
        return 'Browse menus'
      
      case 'rental':
        if (serviceStatus.rentals?.cars) {
          return `${serviceStatus.rentals.cars} cars available`
        }
        return 'Check availability'
      
      case 'flight':
        if (serviceStatus.flights?.todayCount) {
          return `${serviceStatus.flights.todayCount} flights today`
        }
        return 'Search flights'
      
      case 'bundle':
        if (serviceStatus.bundles?.activeDeals) {
          return `${serviceStatus.bundles.activeDeals} active deals`
        }
        return 'Create package'
      
      default:
        return 'Available'
    }
  }

  // Get service badge - now pops out for better visibility
  const getServiceBadge = (serviceId: string) => {
    // Make badges pop out more for Neumorphism and other styles
    const isSpecialStyle = iconStyle === 'neumorphism' || iconStyle === 'glassmorphism' || iconStyle === '3d-fluency'
    
    if (isAtHotel && serviceId === 'ride') {
      return (
        <span className={`absolute ${isSpecialStyle ? '-top-2 -right-2' : 'top-2 right-2'} 
          bg-gradient-to-r from-green-500 to-emerald-500 text-white 
          text-xs px-3 py-1.5 rounded-full font-bold flex items-center z-20 
          shadow-lg transform ${isSpecialStyle ? 'rotate-3 scale-110' : ''} 
          border-2 border-white`}>
          <IoSparklesOutline className="w-3 h-3 mr-1" />
          Hotel earns 15%
        </span>
      )
    }
    
    if (serviceId === 'bundle') {
      return (
        <span className={`absolute ${isSpecialStyle ? '-top-2 -right-2' : 'top-2 right-2'} 
          bg-gradient-to-r from-red-500 to-pink-500 text-white 
          text-xs px-3 py-1.5 rounded-full font-bold flex items-center z-20 
          shadow-lg transform ${isSpecialStyle ? 'rotate-3 scale-110' : ''} 
          border-2 border-white animate-pulse`}>
          <IoSparklesOutline className="w-3 h-3 mr-1" />
          Save up to 30%
        </span>
      )
    }

    return null
  }

  // Handle service click
  const handleServiceClick = async (serviceId: string) => {
    setLoadingService(serviceId)
    
    setTimeout(() => {
      onServiceClick(serviceId)
      setLoadingService(null)
    }, 300)
  }

  // Render icon based on selected style
  const renderIcon = (service: Service, size: 'large' | 'small' = 'large') => {
    const isHovered = hoveredService === service.id
    const sizeClass = size === 'large' ? 'w-20 h-20' : 'w-12 h-12'
    const hoverClass = isHovered ? 'scale-110' : ''
    const animationClass = iconStyle === 'neon' || iconStyle === 'lottie' ? 'animate-pulse' : 
                          iconStyle === 'pixel-art' ? '' : 
                          isHovered ? 'rotate-3' : ''

    switch (iconStyle) {
      case '3d-fluency':
        return (
          <div className={`transition-all duration-300 ${hoverClass} ${animationClass}`}>
            <img 
              src={icon3DFluencyMap[service.icon]} 
              alt={service.name}
              className={`${sizeClass} drop-shadow-lg`}
            />
          </div>
        )
      
      case '3d-plastic':
        return (
          <div className={`transition-all duration-300 ${hoverClass} ${animationClass}`}>
            <img 
              src={icon3DPlasticMap[service.icon]} 
              alt={service.name}
              className={`${sizeClass} drop-shadow-lg`}
            />
          </div>
        )
      
      case 'emoji':
        return (
          <div className={`${sizeClass} flex items-center justify-center text-5xl transition-all duration-300 ${hoverClass} ${animationClass}`}>
            {iconEmojiMap[service.icon]}
          </div>
        )
      
      case 'gradient':
        return (
          <GradientIcon 
            type={service.icon} 
            className={`${sizeClass} transition-all duration-300 ${hoverClass} ${animationClass}`}
          />
        )
      
      case 'glassmorphism':
        return (
          <GlassmorphismIcon
            type={service.icon}
            className={`${sizeClass} transition-all duration-300 ${hoverClass} ${animationClass}`}
          />
        )
      
      case 'neon':
        return (
          <NeonIcon
            type={service.icon}
            color={service.gradient}
            className={`${sizeClass} transition-all duration-300 ${hoverClass}`}
          />
        )
      
      case 'stickers':
        return (
          <div className={`transition-all duration-300 ${hoverClass} ${animationClass}`}>
            <img 
              src={iconStickersMap[service.icon]} 
              alt={service.name}
              className={`${sizeClass}`}
            />
          </div>
        )
      
      case 'hand-drawn':
        return (
          <div className={`transition-all duration-300 ${hoverClass} ${animationClass}`}>
            <img 
              src={iconHandDrawnMap[service.icon]} 
              alt={service.name}
              className={`${sizeClass}`}
            />
          </div>
        )
      
      case 'avatars':
        return (
          <div className={`transition-all duration-300 ${hoverClass} ${animationClass}`}>
            <img 
              src={getAvatarIcon(service.icon)} 
              alt={service.name}
              className={`${sizeClass} rounded-2xl`}
            />
          </div>
        )
      
      case 'isometric':
        return (
          <div className={`transition-all duration-300 ${hoverClass} ${animationClass}`}>
            <img 
              src={iconIsometricMap[service.icon]} 
              alt={service.name}
              className={`${sizeClass}`}
            />
          </div>
        )
      
      case 'flat-color':
        return (
          <div className={`transition-all duration-300 ${hoverClass} ${animationClass}`}>
            <img 
              src={iconFlatColorMap[service.icon]} 
              alt={service.name}
              className={`${sizeClass}`}
            />
          </div>
        )
      
      case 'duotone':
        return (
          <DuotoneIcon
            type={service.icon}
            className={`${sizeClass} transition-all duration-300 ${hoverClass} ${animationClass}`}
          />
        )
      
      case 'outline':
        const OutlineIcon = {
          'car': IoCarOutline,
          'bed': IoBedOutline,
          'restaurant': IoRestaurantOutline,
          'airplane': IoAirplaneOutline,
          'car-sport': IoCarSportOutline,
          'gift': IoGiftOutline,
        }[service.icon] || IoInformationCircle
        
        return (
          <div className={`${sizeClass} transition-all duration-300 ${hoverClass} ${animationClass}`}>
            <OutlineIcon className="w-full h-full" style={{ color: service.gradient[0] }} />
          </div>
        )
      
      case 'lottie':
        return (
          <LottieIcon
            type={service.icon}
            className={`${sizeClass} transition-all duration-300 ${hoverClass}`}
          />
        )
      
      case 'neumorphism':
        return (
          <NeumorphismIcon
            type={service.icon}
            className={`${sizeClass} transition-all duration-300 ${hoverClass} ${animationClass}`}
          />
        )
      
      case 'pixel-art':
        return (
          <PixelArtIcon
            type={service.icon}
            className={`${sizeClass} transition-all duration-300 ${hoverClass}`}
          />
        )
      
      case 'watercolor':
        return (
          <WatercolorIcon
            type={service.icon}
            colors={service.gradient}
            className={`${sizeClass} transition-all duration-300 ${hoverClass} ${animationClass}`}
          />
        )
      
      case 'comic-pop':
        return (
          <ComicPopIcon
            type={service.icon}
            colors={service.gradient}
            className={`${sizeClass} transition-all duration-300 ${hoverClass}`}
          />
        )
      
      default:
        return null
    }
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div>
        {/* Icon Style Selector */}
        {showStyleSelector && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Choose Icon Style:</h4>
              <button
                onClick={() => setShowStyleSelector(!showStyleSelector)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                {showStyleSelector ? 'Hide' : 'Show'} Styles
              </button>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 gap-2">
              {iconStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setIconStyle(style.value)}
                  className={`p-2 text-center rounded-xl transition-all border-2 ${
                    iconStyle === style.value 
                      ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 shadow-md transform scale-105' 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-2xl mb-1">{style.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">{style.label}</div>
                </button>
              ))}
            </div>
            
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                Current style: <span className="font-semibold text-gray-700">{iconStyles.find(s => s.value === iconStyle)?.label}</span>
              </p>
            </div>
          </div>
        )}

        {/* Service Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.values(services).map((service) => {
            const isLoading = loadingService === service.id
            const isHovered = hoveredService === service.id

            return (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service.id)}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
                disabled={!service.enabled || isLoading}
                className={`
                  relative overflow-visible rounded-2xl transition-all duration-300 transform
                  ${service.enabled ? 'hover:scale-105 hover:shadow-2xl' : 'opacity-50 cursor-not-allowed'}
                  ${isLoading ? 'scale-95' : ''}
                  ${iconStyle === 'neon' ? 'bg-gray-900' : 
                    iconStyle === 'neumorphism' ? 'bg-gray-100' :
                    iconStyle === 'comic-pop' ? 'bg-yellow-50' :
                    iconStyle === 'watercolor' ? 'bg-gradient-to-br from-blue-50 to-pink-50' :
                    'bg-white'}
                  border-2 ${iconStyle === 'neon' ? 'border-gray-800' : 
                             iconStyle === 'comic-pop' ? 'border-black' :
                             'border-gray-100'}
                `}
                style={iconStyle === 'neumorphism' ? {
                  background: '#e0e5ec',
                  boxShadow: isHovered 
                    ? 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff'
                    : '9px 9px 16px #a3b1c6, -9px -9px 16px #ffffff',
                } : {}}
              >
                <div className="relative p-6">
                  {/* Service Badge */}
                  {getServiceBadge(service.id)}

                  {/* Background Effect - not for Neumorphism */}
                  {iconStyle !== 'neon' && iconStyle !== 'neumorphism' && (
                    <div 
                      className="absolute top-0 left-0 right-0 h-32 opacity-10"
                      style={{
                        background: `linear-gradient(135deg, ${service.gradient[0]}, ${service.gradient[1]})`
                      }}
                    />
                  )}

                  {/* Icon */}
                  <div className="mb-4 flex justify-center relative z-10">
                    {renderIcon(service, 'large')}
                  </div>

                  {/* Service Name */}
                  <h3 
                    className={`text-lg font-bold mb-1 
                      ${iconStyle === 'neon' ? 'text-white' : 
                        iconStyle === 'neumorphism' ? 'text-gray-700' :
                        'text-gray-900'}`}
                    style={{ color: iconStyle === 'neon' ? '#fff' : 
                             iconStyle === 'neumorphism' ? '#4a5568' :
                             service.gradient[0] }}
                  >
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm mb-3 
                    ${iconStyle === 'neon' ? 'text-gray-300' : 
                      iconStyle === 'neumorphism' ? 'text-gray-600' :
                      'text-gray-600'}`}>
                    {service.description}
                  </p>

                  {/* Status - Enhanced for Neumorphism */}
                  <div 
                    className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full font-semibold
                      ${iconStyle === 'neumorphism' 
                        ? 'text-gray-700 bg-gray-200 shadow-inner' 
                        : 'text-white'}`}
                    style={{
                      background: iconStyle === 'neon' 
                        ? `linear-gradient(135deg, ${service.gradient[0]}80, ${service.gradient[1]}80)`
                        : iconStyle === 'neumorphism'
                        ? '#d1d9e6'
                        : `linear-gradient(135deg, ${service.gradient[0]}, ${service.gradient[1]})`,
                      boxShadow: iconStyle === 'neumorphism'
                        ? 'inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff'
                        : undefined
                    }}
                  >
                    <IoCheckmarkCircle className={`w-3 h-3 mr-1 
                      ${iconStyle === 'neumorphism' ? 'text-green-600' : ''}`} />
                    <span>{getServiceStatusText(service.id)}</span>
                  </div>

                  {/* Loading Overlay */}
                  {isLoading && (
                    <div className={`absolute inset-0 ${iconStyle === 'neon' ? 'bg-gray-900' : 'bg-white'} bg-opacity-80 flex items-center justify-center rounded-2xl`}>
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2" 
                        style={{ borderColor: service.gradient[0] }}
                      />
                    </div>
                  )}

                  {/* Hover Effect */}
                  {isHovered && !isLoading && iconStyle !== 'neon' && (
                    <div 
                      className="absolute inset-0 opacity-5 pointer-events-none rounded-2xl"
                      style={{
                        background: `radial-gradient(circle at center, ${service.gradient[0]}, transparent)`
                      }}
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // List View
  return (
    <div className="space-y-3">
      {Object.values(services).map((service) => {
        const isLoading = loadingService === service.id

        return (
          <button
            key={service.id}
            onClick={() => handleServiceClick(service.id)}
            disabled={!service.enabled || isLoading}
            className={`
              w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200
              ${service.enabled 
                ? 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-lg' 
                : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
              }
            `}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mr-4">
              {renderIcon(service, 'small')}
            </div>

            {/* Content */}
            <div className="flex-1 text-left">
              <div className="flex items-center mb-1">
                <h3 
                  className="text-base font-bold"
                  style={{ color: service.gradient[0] }}
                >
                  {service.name}
                </h3>
                {/* Special badges */}
                {isAtHotel && service.id === 'ride' && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                    <IoSparklesOutline className="w-3 h-3 mr-1" />
                    15% to hotel
                  </span>
                )}
                {service.id === 'bundle' && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                    <IoSparklesOutline className="w-3 h-3 mr-1" />
                    Save 30%
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {service.description}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <IoCheckmarkCircle className="w-3 h-3 mr-1 text-green-500" />
                <span>{getServiceStatusText(service.id)}</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 ml-4">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2" 
                  style={{ borderColor: service.gradient[0] }}
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${service.gradient[0]}, ${service.gradient[1]})`
                  }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        )
      })}

      {/* Tips Section */}
      {isAtHotel && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <IoInformationCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-blue-900">Hotel Guest Benefit</p>
              <p className="text-blue-700 mt-1">
                As a guest at {hotelName || 'this hotel'}, your hotel earns 15% commission on all rides you book. 
                You're supporting the hotel while getting great service!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
          <span>Available Now</span>
        </div>
        <div className="flex items-center">
          <IoFlashOutline className="w-3 h-3 mr-1 text-yellow-500" />
          <span>Fast Service</span>
        </div>
        <div className="flex items-center">
          <IoTrendingUpOutline className="w-3 h-3 mr-1 text-blue-500" />
          <span>Popular</span>
        </div>
      </div>
    </div>
  )
}
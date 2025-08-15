// app/components/UIComponents.tsx

'use client'

import { ReactNode } from 'react'
import { 
  IoCheckmarkCircle,
  IoAlertCircle,
  IoInformationCircle,
  IoCloseCircle,
  IoArrowForward,
  IoChevronForward
} from 'react-icons/io5'
import type { 
  CTAButtonProps, 
  StatCardProps, 
  ServiceOptionProps,
  FlightCardProps,
  TrafficCardProps,
  PredictionCardProps,
  StepCardProps,
  SearchPillProps,
  PhoneMockupProps
} from '../types'
import { getStatusColor, getDelayRiskLevel } from '../utils/helpers'

// Primary CTA Button Component
export function CTAButton({
  text,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  disabled = false
}: CTAButtonProps) {
  const baseClasses = `
    font-medium rounded-lg transition-all duration-200 
    flex items-center justify-center space-x-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : 'w-auto'}
  `

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700',
    outline: 'border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </button>
  )
}

// Stat Card Component
export function StatCard({ value, label, color = 'blue', icon }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    purple: 'text-purple-400'
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`text-2xl md:text-3xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
          {value}
        </div>
        {icon && <div className="text-white/60">{icon}</div>}
      </div>
      <div className="text-xs text-gray-300 uppercase tracking-wider">
        {label}
      </div>
    </div>
  )
}

// Service Option Card Component
export function ServiceOption({ option, isHighlighted = false, onSelect }: ServiceOptionProps) {
  return (
    <div className={`
      bg-gray-50 dark:bg-gray-800 rounded-lg p-4 
      flex items-center justify-between transition-all
      ${isHighlighted ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}
    `}>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-gray-900 dark:text-white">
            {option.service}
          </h4>
          {isHighlighted && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              BEST VALUE
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {option.time}
        </p>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {option.price}
        </div>
        {option.available && onSelect && (
          <button
            onClick={onSelect}
            className={`
              mt-2 px-4 py-1 rounded-lg text-sm font-medium transition-colors
              ${isHighlighted 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }
            `}
          >
            {isHighlighted ? 'View Options' : 'Details'}
          </button>
        )}
      </div>
    </div>
  )
}

// Flight Card Component
export function FlightCard({ flight, dynamicPrices }: FlightCardProps) {
  const riskLevel = getDelayRiskLevel(flight.delayProbability)
  
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 
      hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold text-lg text-gray-900 dark:text-white">
            {flight.flightNumber}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {flight.from}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {flight.scheduled}
          </div>
          <div 
            className="text-xs font-medium"
            style={{ color: riskLevel.color }}
          >
            {flight.delayProbability}% delay risk
          </div>
        </div>
      </div>
      
      {dynamicPrices && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
            rounded px-2 py-1 text-red-700 dark:text-red-300">
            Market: ${Math.round(25 * flight.surgePrediction)}+
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
            rounded px-2 py-1 text-green-700 dark:text-green-300">
            Platform: ${Math.round(25 * flight.surgePrediction * 0.65)}
          </div>
        </div>
      )}
    </div>
  )
}

// Traffic Route Card Component
export function TrafficCard({ route }: TrafficCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium text-gray-900 dark:text-white">
          {route.route}
        </div>
        <div 
          className="text-sm font-bold uppercase"
          style={{ color: getStatusColor(route.status) }}
        >
          {route.status}
        </div>
      </div>
      
      {route.delay > 0 && (
        <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">
          +{route.delay} min delay
        </div>
      )}
      
      {route.alternative && (
        <div className="text-sm text-green-600 dark:text-green-400">
          Alt: {route.alternative}
        </div>
      )}
    </div>
  )
}

// Surge Prediction Card Component
export function PredictionCard({ prediction }: PredictionCardProps) {
  const getSurgeColor = (multiplier: number) => {
    if (multiplier > 2) return 'text-red-600 dark:text-red-400'
    if (multiplier > 1.5) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 
      rounded-xl p-4 text-center hover:shadow-lg transition-all">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {prediction.time}
      </div>
      <div className={`text-2xl font-bold mb-1 ${getSurgeColor(prediction.multiplier)}`}>
        {prediction.multiplier}x
      </div>
      <div className="text-xs text-gray-500">
        {prediction.probability}%
      </div>
    </div>
  )
}

// Step Card Component (for How It Works)
export function StepCard({ step, title, description, icon, showConnector = false }: StepCardProps) {
  return (
    <div className="text-center relative">
      <div className="relative">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center 
          text-white mx-auto mb-4 shadow-lg">
          {icon}
        </div>
        {showConnector && (
          <div className="hidden md:block absolute top-8 left-full w-full h-0.5 
            bg-gray-300 dark:bg-gray-700 -translate-x-4" />
        )}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 dark:bg-blue-900 
          rounded-full flex items-center justify-center text-xs font-bold 
          text-blue-600 dark:text-blue-400">
          {step}
        </div>
      </div>
      <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  )
}

// Search Pill Component
export function SearchPill({ onClick, placeholder = "Where to?", showCalendar = true }: SearchPillProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-6 py-4 
        flex items-center justify-between hover:from-blue-700 hover:to-blue-800 
        transition-all shadow-lg group"
    >
      <div className="flex items-center space-x-3 text-white">
        <IoArrowForward className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        <span className="text-lg font-semibold">{placeholder}</span>
      </div>
      {showCalendar && (
        <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-lg text-white">
          <IoChevronForward className="w-4 h-4" />
          <span className="text-sm font-medium">Later</span>
        </div>
      )}
    </button>
  )
}

// Phone Mockup Component
export function PhoneMockup({ imageSrc, altText, rotation = 0, zIndex = 0, position }: PhoneMockupProps) {
  return (
    <div 
      className="absolute"
      style={{
        transform: `rotate(${rotation}deg)`,
        zIndex,
        ...position
      }}
    >
      <div className="relative w-[160px] h-[360px] bg-black rounded-[1.5rem] p-1 shadow-2xl">
        <div className="absolute top-[35px] left-1/2 transform -translate-x-1/2 
          w-[70px] h-[18px] bg-black rounded-full" />
        <div className="w-full h-full bg-white rounded-[1.25rem] overflow-hidden">
          <img 
            src={imageSrc}
            alt={altText}
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>
    </div>
  )
}

// Alert Component
export function Alert({ 
  type = 'info', 
  title, 
  message,
  onClose
}: { 
  type?: 'success' | 'warning' | 'error' | 'info'
  title?: string
  message: string
  onClose?: () => void
}) {
  const typeConfig = {
    success: {
      icon: <IoCheckmarkCircle className="w-5 h-5" />,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-300',
      iconColor: 'text-green-600'
    },
    warning: {
      icon: <IoAlertCircle className="w-5 h-5" />,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-800 dark:text-yellow-300',
      iconColor: 'text-yellow-600'
    },
    error: {
      icon: <IoCloseCircle className="w-5 h-5" />,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-300',
      iconColor: 'text-red-600'
    },
    info: {
      icon: <IoInformationCircle className="w-5 h-5" />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-300',
      iconColor: 'text-blue-600'
    }
  }

  const config = typeConfig[type]

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
      <div className="flex items-start">
        <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
          {config.icon}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.textColor} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${config.textColor}`}>
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${config.iconColor} hover:opacity-70 transition-opacity`}
          >
            <IoCloseCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

// Loading Spinner Component
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-2 border-gray-300 dark:border-gray-700 
        border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin`} />
    </div>
  )
}

// Badge Component
export function Badge({ 
  text, 
  variant = 'default' 
}: { 
  text: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'new'
}) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${variantClasses[variant]}`}>
      {text}
    </span>
  )
}

// Progress Bar Component
export function ProgressBar({ 
  value, 
  max = 100, 
  color = 'blue',
  showLabel = false 
}: { 
  value: number
  max?: number
  color?: 'blue' | 'green' | 'yellow' | 'red'
  showLabel?: boolean
}) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
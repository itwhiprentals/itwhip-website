// app/(guest)/rentals/components/details/HostProfile.tsx
'use client'

import { useState } from 'react'
import HostProfileModal from './HostProfileModal'
import { formatPrivateName, isCompanyName } from '@/app/lib/utils/namePrivacy'
import { 
  IoStarOutline,
  IoStar,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoChatbubbleOutline,
  IoCarOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoTrophyOutline,
  IoSparklesOutline,
  IoCallOutline,
  IoMailOutline,
  IoPersonOutline,
  IoLanguageOutline,
  IoSchoolOutline,
  IoRibbonOutline,
  IoDiamondOutline,
  IoDocumentTextOutline,
  IoMedalOutline
} from 'react-icons/io5'

interface Host {
  id?: string
  name?: string
  email?: string
  phone?: string
  profilePhoto?: string
  bio?: string
  responseTime?: number
  responseRate?: number
  totalTrips?: number
  rating?: number
  memberSince?: string
  joinedAt?: string
  languages?: string[]
  verificationStatus?: string
  verificationLevel?: string
  city?: string
  state?: string
  education?: string
  work?: string
  totalReviews?: number
  badge?: 'super_host' | 'elite_host' | 'top_rated' | 'all_star' | null
  profileImage?: string
  firstName?: string
  lastName?: string
  description?: string
  averageRating?: number
  createdAt?: string
  isVerified?: boolean
  isCompany?: boolean  // Flag to indicate if host is a company
  _count?: {
    cars?: number
    bookings?: number
    reviews?: number
  }
}

interface HostProfileProps {
  host?: Host | any
}

// Helper function to format member since date
function formatMemberSince(dateString: string): string {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'N/A'
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  
  return `${month} ${year}`
}

export default function HostProfile({ host }: HostProfileProps) {
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [showAllCars, setShowAllCars] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [messageSent, setMessageSent] = useState(false)
  const [showHostModal, setShowHostModal] = useState(false)
  
  if (!host) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">Host information not available</p>
      </div>
    )
  }
  
  // Format the display name based on whether it's a company
  const displayName = formatPrivateName(
    host.name || (host.firstName && host.lastName ? `${host.firstName} ${host.lastName}` : 'Host'),
    host.isCompany
  )
  
  const processedHost = {
    name: host.name || (host.firstName && host.lastName ? `${host.firstName} ${host.lastName}` : 'Host'),
    displayName: displayName,  // Use formatted display name
    profilePhoto: host.profilePhoto || host.profileImage || null,
    verificationStatus: host.verificationStatus || host.verificationLevel || (host.isVerified ? 'id_verified' : ''),
    city: host.city || 'Phoenix',
    state: host.state || 'AZ',
    memberSince: host.memberSince || host.joinedAt || host.createdAt || new Date().toISOString(),
    rating: host.rating || host.averageRating || 0,
    totalTrips: host.totalTrips || host._count?.bookings || 0,
    totalReviews: host.totalReviews || host._count?.reviews || 0,
    responseRate: host.responseRate || 0,
    responseTime: host.responseTime || 0,
    bio: host.bio || host.description || '',
    languages: host.languages || ['English'],
    education: host.education || '',
    work: host.work || '',
    badge: host.badge || null,
    email: host.email || '',
    phone: host.phone || '',
    isCompany: host.isCompany || isCompanyName(host.name || ''),
    _count: host._count || {
      cars: 0,
      bookings: host.totalTrips || 0,
      reviews: host.totalReviews || 0
    }
  }
  
  // Parse verification status - use verificationLevel from database
  let verificationStatuses: string[] = [];
  const verificationData = host.verificationLevel || host.verificationStatus || '';
  
  if (verificationData) {
    if (typeof verificationData === 'string') {
      // Split by comma and filter out email_verified
      verificationStatuses = verificationData
        .split(',')
        .map(s => s.trim())
        .filter(s => s && s !== 'email_verified');
    }
  }
  
  const isVerified = verificationStatuses.length > 0;
  
  // Format member since with month and year
  const memberSinceFormatted = formatMemberSince(processedHost.memberSince)
  
  const responseTimeText = processedHost.responseTime 
    ? (processedHost.responseTime < 60 
      ? `${processedHost.responseTime} min`
      : `${Math.floor(processedHost.responseTime / 60)} ${Math.floor(processedHost.responseTime / 60) === 1 ? 'hour' : 'hours'}`)
    : 'N/A'
  
  const getHostBadge = () => {
    if (processedHost.badge) {
      switch(processedHost.badge) {
        case 'elite_host':
          return { type: 'elite_host', label: 'Elite Host', color: 'purple', icon: IoDiamondOutline }
        case 'super_host':
          return { type: 'super_host', label: 'Super Host', color: 'amber', icon: IoTrophyOutline }
        case 'all_star':
          return { type: 'all_star', label: 'All-Star Host', color: 'blue', icon: IoStar }
        case 'top_rated':
          return { type: 'top_rated', label: 'Top Rated', color: 'green', icon: IoRibbonOutline }
      }
    }
    
    if (processedHost.totalTrips >= 500 && processedHost.rating >= 4.9 && processedHost.responseRate >= 95) {
      return { type: 'elite_host', label: 'Elite Host', color: 'purple', icon: IoDiamondOutline }
    }
    if (processedHost.totalTrips >= 100 && processedHost.rating >= 4.8 && processedHost.responseRate >= 90) {
      return { type: 'super_host', label: 'Super Host', color: 'amber', icon: IoTrophyOutline }
    }
    if (processedHost.totalTrips >= 50 && processedHost.rating >= 4.7) {
      return { type: 'all_star', label: 'All-Star Host', color: 'blue', icon: IoStar }
    }
    if (processedHost.rating >= 4.9 && processedHost.totalTrips >= 20) {
      return { type: 'top_rated', label: 'Top Rated', color: 'green', icon: IoRibbonOutline }
    }
    
    return null
  }
  
  const hostBadge = getHostBadge()
  
  // Verification badges - NO EMAIL VERIFICATION
  const verificationBadges = [
    { 
      verified: verificationStatuses.includes('id_verified'), 
      label: 'Identity Verified', 
      icon: IoPersonOutline,
      color: 'text-blue-600' 
    },
    { 
      verified: verificationStatuses.includes('phone_verified'), 
      label: 'Phone Verified', 
      icon: IoCallOutline,
      color: 'text-green-600' 
    },
    { 
      verified: verificationStatuses.includes('background_checked'), 
      label: 'Background Checked', 
      icon: IoShieldCheckmarkOutline,
      color: 'text-indigo-600' 
    },
    { 
      verified: verificationStatuses.includes('driving_record'), 
      label: 'Driving Record', 
      icon: IoCarOutline,
      color: 'text-purple-600' 
    },
    { 
      verified: verificationStatuses.includes('insurance_verified'), 
      label: 'Insurance Verified', 
      icon: IoDocumentTextOutline,
      color: 'text-amber-600' 
    },
    { 
      verified: verificationStatuses.includes('training_completed'), 
      label: 'Training Completed', 
      icon: IoMedalOutline,
      color: 'text-teal-600' 
    }
  ]
  
  const handleSendMessage = () => {
    if (!messageText.trim()) return
    setMessageSent(true)
    setMessageText('')
    
    setTimeout(() => {
      setMessageSent(false)
    }, 3000)
  }

  if (!processedHost.name || processedHost.name === 'Host') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">Host profile is being updated...</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Host Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          {/* Profile photo - 68px circle with clickable functionality */}
          <button
            onClick={() => setShowHostModal(true)}
            className="block relative hover:ring-2 hover:ring-amber-400 transition-all rounded-full"
          >
            {processedHost.profilePhoto ? (
              <img
                src={processedHost.profilePhoto}
                alt={processedHost.displayName}
                className="w-[68px] h-[68px] rounded-full object-cover shadow-md border-2 border-gray-200 dark:border-gray-700 cursor-pointer"
              />
            ) : (
              <div className="w-[68px] h-[68px] rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-md border-2 border-gray-300 dark:border-gray-600 cursor-pointer">
                <IoPersonOutline className="w-9 h-9 text-gray-400" />
              </div>
            )}
            {isVerified && (
              <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-0.5 shadow-lg">
                <IoShieldCheckmarkOutline className="w-3 h-3" />
              </div>
            )}
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setShowHostModal(true)}
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-amber-600 transition-colors cursor-pointer"
            >
              {processedHost.displayName}
            </button>
            {hostBadge && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                ${hostBadge.color === 'purple' ? 'bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-700 dark:text-purple-400' :
                  hostBadge.color === 'amber' ? 'bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 text-amber-700 dark:text-amber-400' :
                  hostBadge.color === 'blue' ? 'bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-400' :
                  'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 text-green-700 dark:text-green-400'}`}>
                <hostBadge.icon className="w-3.5 h-3.5" />
                <span>{hostBadge.label}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-1">
                <IoLocationOutline className="w-4 h-4" />
                <span>{processedHost.city}, {processedHost.state}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <IoCalendarOutline className="w-4 h-4" />
                <span>Joined {memberSinceFormatted}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {processedHost.rating > 0 && (
                <div className="flex items-center gap-1">
                  <IoStar className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {processedHost.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">rating</span>
                </div>
              )}
              {processedHost.totalTrips > 0 && (
                <div className="flex items-center gap-1">
                  <IoCarOutline className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {processedHost.totalTrips}
                  </span>
                  <span className="text-gray-500">trips</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* About Section */}
      {processedHost.bio && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mb-5">
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
            About {processedHost.displayName}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            {processedHost.bio}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-4">
            {processedHost.languages && processedHost.languages.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IoLanguageOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Speaks: {processedHost.languages.join(', ')}</span>
              </div>
            )}
            {processedHost.education && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IoSchoolOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{processedHost.education}</span>
              </div>
            )}
            {processedHost.work && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IoCarOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Works in: {processedHost.work}</span>
              </div>
            )}
            {processedHost.totalReviews > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{processedHost.totalReviews} reviews</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Verification Badges */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mb-5">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
          Verified information
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {verificationBadges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div
                key={index}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs ${
                  badge.verified 
                    ? 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50' 
                    : 'text-gray-400 dark:text-gray-500 opacity-60 bg-gray-50/50 dark:bg-gray-700/30'
                }`}
              >
                <Icon className={`w-5 h-5 ${badge.verified ? badge.color : 'text-gray-400'}`} />
                <span className="font-medium text-center text-[10px] leading-tight">
                  {badge.label}
                </span>
                {badge.verified && (
                  <IoCheckmarkCircleOutline className="w-3 h-3 text-green-600" />
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Message Host - Locked until booking */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mb-5">
        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
          Contact {processedHost.displayName}
        </h4>
        
        <div className="relative">
          <div className="relative bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0">
                <IoChatbubbleOutline className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Messaging is locked
                </h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  You'll be able to ask {processedHost.displayName} questions and coordinate pickup details after your booking is confirmed.
                </p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <IoTimeOutline className="w-3 h-3" />
                  <span>Responds in ~{responseTimeText}</span>
                </div>
                <div className="flex items-center gap-1">
                  <IoCheckmarkCircleOutline className="w-3 h-3" />
                  <span>{processedHost.responseRate || 'N/A'}% response rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Host Profile Modal */}
      {showHostModal && host?.id && (
        <HostProfileModal
          hostId={host.id}
          isOpen={showHostModal}
          onClose={() => setShowHostModal(false)}
        />
      )}
    </div>
  )
}
// app/(guest)/dashboard/services/BundleCard.tsx
// Bundle Card Component - Create custom travel packages with maximum savings
// Combines flights, hotels, rides, and activities for discounted bundles

'use client'

import { useState, useEffect } from 'react'
import { 
  IoGiftOutline,
  IoAirplaneOutline,
  IoBedOutline,
  IoCarOutline,
  IoRestaurantOutline,
  IoTicketOutline,
  IoSparklesOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoAddOutline,
  IoRemoveOutline,
  IoTrendingUp,
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoInformationCircleOutline,
  IoStarOutline,
  IoTimeOutline,
  IoTrophyOutline,
  IoRocketOutline,
  IoPricetagOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoSwapHorizontalOutline,
  IoWarningOutline,
  IoBriefcaseOutline,
  IoHeartOutline,
  IoSunnyOutline,
  IoBusinessOutline,
  IoFitnessOutline
} from 'react-icons/io5'

// Types
interface BundleCardProps {
  destination?: string
  startDate?: string
  endDate?: string
  travelers?: number
  onCreateBundle?: (bundle: TravelBundle) => void
  isAtHotel?: boolean
}

interface TravelBundle {
  id: string
  name: string
  type: 'vacation' | 'business' | 'romantic' | 'family' | 'adventure' | 'custom'
  destination: string
  startDate: string
  endDate: string
  travelers: number
  components: BundleComponent[]
  totalPrice: number
  originalPrice: number
  savings: number
  savingsPercent: number
  perks: string[]
  insurance: boolean
  flexible: boolean
}

interface BundleComponent {
  id: string
  type: 'flight' | 'hotel' | 'ride' | 'car' | 'food' | 'activity' | 'transfer'
  name: string
  description: string
  icon: any
  selected: boolean
  required: boolean
  price: number
  originalPrice: number
  details?: any
  quantity?: number
}

interface PreBuiltBundle {
  id: string
  name: string
  type: 'vacation' | 'business' | 'romantic' | 'family' | 'adventure'
  description: string
  icon: any
  badge?: string
  basePrice: number
  originalPrice: number
  duration: number
  includes: string[]
  image: string
  popular: boolean
  limitedTime?: boolean
}

export default function BundleCard({
  destination = '',
  startDate = '',
  endDate = '',
  travelers = 2,
  onCreateBundle,
  isAtHotel = false
}: BundleCardProps) {
  // State management
  const [bundleDestination, setBundleDestination] = useState(destination)
  const [bundleStartDate, setBundleStartDate] = useState(startDate)
  const [bundleEndDate, setBundleEndDate] = useState(endDate)
  const [travelerCount, setTravelerCount] = useState(travelers)
  const [selectedBundleType, setSelectedBundleType] = useState<string>('vacation')
  const [customComponents, setCustomComponents] = useState<BundleComponent[]>([])
  const [preBuiltBundles, setPreBuiltBundles] = useState<PreBuiltBundle[]>([])
  const [selectedPreBuilt, setSelectedPreBuilt] = useState<PreBuiltBundle | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [bundleStage, setBundleStage] = useState<'select-type' | 'customize' | 'review' | 'confirm' | 'booked'>('select-type')
  const [addInsurance, setAddInsurance] = useState(true)
  const [flexibleDates, setFlexibleDates] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [additionalDiscount, setAdditionalDiscount] = useState(0)

  // Bundle types
  const bundleTypes = [
    { 
      id: 'vacation', 
      name: 'Vacation', 
      icon: IoSunnyOutline, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Relax and explore'
    },
    { 
      id: 'business', 
      name: 'Business', 
      icon: IoBriefcaseOutline, 
      color: 'from-gray-600 to-gray-700',
      description: 'Efficient travel'
    },
    { 
      id: 'romantic', 
      name: 'Romantic', 
      icon: IoHeartOutline, 
      color: 'from-pink-500 to-red-500',
      description: 'Couples getaway'
    },
    { 
      id: 'family', 
      name: 'Family', 
      icon: IoPersonOutline, 
      color: 'from-green-500 to-emerald-500',
      description: 'Fun for all ages'
    },
    { 
      id: 'adventure', 
      name: 'Adventure', 
      icon: IoRocketOutline, 
      color: 'from-orange-500 to-red-500',
      description: 'Thrill seeking'
    },
    { 
      id: 'custom', 
      name: 'Custom', 
      icon: IoSparklesOutline, 
      color: 'from-purple-500 to-indigo-500',
      description: 'Build your own'
    }
  ]

  // Load pre-built bundles
  useEffect(() => {
    loadPreBuiltBundles()
  }, [selectedBundleType])

  // Load available bundles
  const loadPreBuiltBundles = async () => {
    setIsLoading(true)
    try {
      // This would normally call the API
      // Mock data for now
      const mockBundles: PreBuiltBundle[] = [
        {
          id: 'bundle-1',
          name: 'Vegas Weekend Escape',
          type: 'vacation',
          description: 'Flight + Hotel + Shows + Dining',
          icon: IoSparklesOutline,
          badge: 'Most Popular',
          basePrice: 599,
          originalPrice: 899,
          duration: 3,
          includes: ['Round-trip flight', '3 nights at Caesars Palace', '2 show tickets', '$100 dining credit', 'Airport transfers'],
          image: 'vegas.jpg',
          popular: true,
          limitedTime: false
        },
        {
          id: 'bundle-2',
          name: 'California Coast Road Trip',
          type: 'adventure',
          description: 'Flight + Car + Hotels + Activities',
          icon: IoCarOutline,
          badge: 'Adventure',
          basePrice: 1299,
          originalPrice: 1899,
          duration: 7,
          includes: ['Round-trip flight to LAX', '7-day car rental', '6 nights hotels', 'Yosemite pass', 'Wine tasting tour'],
          image: 'california.jpg',
          popular: true,
          limitedTime: false
        },
        {
          id: 'bundle-3',
          name: 'NYC Business Express',
          type: 'business',
          description: 'Flight + Hotel + Transport + Workspace',
          icon: IoBriefcaseOutline,
          badge: 'Business',
          basePrice: 849,
          originalPrice: 1249,
          duration: 3,
          includes: ['Business class flight', 'Midtown hotel', 'Airport transfers', 'Co-working space', 'Mobile WiFi'],
          image: 'nyc.jpg',
          popular: false,
          limitedTime: false
        },
        {
          id: 'bundle-4',
          name: 'Cancun Romance Package',
          type: 'romantic',
          description: 'Flight + Resort + Spa + Dining',
          icon: IoHeartOutline,
          badge: 'Couples Only',
          basePrice: 1799,
          originalPrice: 2599,
          duration: 5,
          includes: ['Round-trip flights', 'All-inclusive resort', 'Couples spa treatment', 'Private dinner', 'Sunset cruise'],
          image: 'cancun.jpg',
          popular: true,
          limitedTime: true
        },
        {
          id: 'bundle-5',
          name: 'Orlando Family Fun',
          type: 'family',
          description: 'Flight + Hotel + Parks + Meals',
          icon: IoPersonOutline,
          badge: 'Family Favorite',
          basePrice: 2199,
          originalPrice: 3299,
          duration: 5,
          includes: ['Family flights (4)', 'Suite accommodation', '3-day park passes', 'Breakfast included', 'Rental minivan'],
          image: 'orlando.jpg',
          popular: true,
          limitedTime: false
        }
      ]

      // Filter by selected type
      const filtered = selectedBundleType === 'custom' 
        ? mockBundles 
        : mockBundles.filter(b => b.type === selectedBundleType)
      
      setPreBuiltBundles(filtered)
    } catch (error) {
      console.error('Failed to load bundles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize custom components
  const initializeCustomComponents = () => {
    const components: BundleComponent[] = [
      {
        id: 'comp-flight',
        type: 'flight',
        name: 'Round-trip Flight',
        description: 'Economy class flights',
        icon: IoAirplaneOutline,
        selected: true,
        required: false,
        price: 350,
        originalPrice: 450,
        quantity: travelerCount
      },
      {
        id: 'comp-hotel',
        type: 'hotel',
        name: 'Hotel Stay',
        description: '4-star hotel accommodation',
        icon: IoBedOutline,
        selected: true,
        required: false,
        price: 450,
        originalPrice: 600,
        quantity: Math.ceil(travelerCount / 2) // rooms needed
      },
      {
        id: 'comp-car',
        type: 'car',
        name: 'Rental Car',
        description: 'Midsize vehicle',
        icon: IoCarOutline,
        selected: false,
        required: false,
        price: 280,
        originalPrice: 380,
        quantity: 1
      },
      {
        id: 'comp-transfer',
        type: 'transfer',
        name: 'Airport Transfers',
        description: 'Round-trip airport transport',
        icon: IoCarOutline,
        selected: true,
        required: false,
        price: 90,
        originalPrice: 120,
        quantity: 1
      },
      {
        id: 'comp-activity',
        type: 'activity',
        name: 'Activities & Tours',
        description: 'Local experiences and attractions',
        icon: IoTicketOutline,
        selected: false,
        required: false,
        price: 200,
        originalPrice: 280,
        quantity: travelerCount
      },
      {
        id: 'comp-food',
        type: 'food',
        name: 'Meal Plan',
        description: 'Breakfast and dinner included',
        icon: IoRestaurantOutline,
        selected: false,
        required: false,
        price: 150,
        originalPrice: 200,
        quantity: travelerCount
      }
    ]

    // Adjust based on bundle type
    switch(selectedBundleType) {
      case 'business':
        components[0].description = 'Business class flights'
        components[0].price = 650
        components[0].originalPrice = 850
        components[3].selected = true // transfers important
        break
      case 'romantic':
        components[1].description = 'Romantic suite'
        components[1].price = 550
        components[1].originalPrice = 750
        components[5].selected = true // meal plan
        break
      case 'family':
        components[2].selected = true // need car
        components[4].selected = true // activities
        break
      case 'adventure':
        components[2].selected = true // rental car
        components[4].selected = true // activities
        components[4].price = 350
        break
    }

    setCustomComponents(components)
  }

  // Calculate bundle savings
  const calculateBundleSavings = () => {
    const selected = customComponents.filter(c => c.selected)
    const totalOriginal = selected.reduce((sum, c) => sum + (c.originalPrice * (c.quantity || 1)), 0)
    const totalBundled = selected.reduce((sum, c) => sum + (c.price * (c.quantity || 1)), 0)
    
    let finalPrice = totalBundled
    
    // Apply bundle discount based on number of components
    const componentCount = selected.length
    let bundleDiscount = 0
    if (componentCount >= 5) bundleDiscount = 0.15
    else if (componentCount >= 4) bundleDiscount = 0.12
    else if (componentCount >= 3) bundleDiscount = 0.10
    else if (componentCount >= 2) bundleDiscount = 0.05
    
    finalPrice = finalPrice * (1 - bundleDiscount)
    
    // Add insurance if selected
    if (addInsurance) {
      finalPrice += 89 * travelerCount
    }
    
    // Apply promo code discount
    if (additionalDiscount > 0) {
      finalPrice = finalPrice * (1 - additionalDiscount)
    }
    
    const savings = totalOriginal - finalPrice
    const savingsPercent = Math.round((savings / totalOriginal) * 100)
    
    return {
      original: totalOriginal,
      bundled: finalPrice,
      savings,
      savingsPercent
    }
  }

  // Calculate nights
  const calculateNights = () => {
    if (!bundleStartDate || !bundleEndDate) return 0
    const start = new Date(bundleStartDate)
    const end = new Date(bundleEndDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  // Toggle component selection
  const toggleComponent = (componentId: string) => {
    setCustomComponents(customComponents.map(c => 
      c.id === componentId ? { ...c, selected: !c.selected } : c
    ))
  }

  // Update component quantity
  const updateComponentQuantity = (componentId: string, change: number) => {
    setCustomComponents(customComponents.map(c => {
      if (c.id === componentId && c.quantity !== undefined) {
        const newQuantity = Math.max(1, c.quantity + change)
        return { ...c, quantity: newQuantity }
      }
      return c
    }))
  }

  // Select pre-built bundle
  const selectPreBuiltBundle = (bundle: PreBuiltBundle) => {
    setSelectedPreBuilt(bundle)
    // Initialize components based on pre-built bundle
    initializeCustomComponents()
    setBundleStage('customize')
  }

  // Create custom bundle
  const startCustomBundle = () => {
    setSelectedPreBuilt(null)
    initializeCustomComponents()
    setBundleStage('customize')
  }

  // Book bundle
  const bookBundle = async () => {
    setIsLoading(true)
    try {
      const savings = calculateBundleSavings()
      const selectedComponents = customComponents.filter(c => c.selected)
      
      const bundle: TravelBundle = {
        id: Date.now().toString(),
        name: selectedPreBuilt?.name || 'Custom Bundle',
        type: selectedBundleType as any,
        destination: bundleDestination,
        startDate: bundleStartDate,
        endDate: bundleEndDate,
        travelers: travelerCount,
        components: selectedComponents,
        totalPrice: savings.bundled,
        originalPrice: savings.original,
        savings: savings.savings,
        savingsPercent: savings.savingsPercent,
        perks: [
          '24/7 Support',
          'Free Changes',
          'Price Match Guarantee',
          'Travel Insurance Included'
        ],
        insurance: addInsurance,
        flexible: flexibleDates
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setBundleStage('booked')
      
      if (onCreateBundle) {
        onCreateBundle(bundle)
      }
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Apply promo code
  const applyPromoCode = () => {
    // Mock promo codes
    const promoCodes: { [key: string]: number } = {
      'SAVE10': 0.10,
      'SAVE15': 0.15,
      'SAVE20': 0.20,
      'HOTEL20': 0.20,
      'BUNDLE25': 0.25
    }
    
    const discount = promoCodes[promoCode.toUpperCase()]
    if (discount) {
      setAdditionalDiscount(discount)
    }
  }

  const nights = calculateNights()
  const savings = calculateBundleSavings()

  // Booking confirmed view
  if (bundleStage === 'booked') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Bundle Booked!</h3>
          <p className="text-gray-600 mb-2">
            Your {selectedPreBuilt?.name || 'custom bundle'} is confirmed
          </p>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium mb-6">
            <IoTrendingUp className="mr-2" />
            You saved ${savings.savings.toFixed(0)} ({savings.savingsPercent}%)
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Destination</span>
                <span className="font-medium text-gray-900">{bundleDestination}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dates</span>
                <span className="font-medium text-gray-900">
                  {bundleStartDate} to {bundleEndDate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Travelers</span>
                <span className="font-medium text-gray-900">{travelerCount}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Total Paid</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${savings.bundled.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 line-through">
                      ${savings.original.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setBundleStage('select-type')
                setSelectedPreBuilt(null)
              }}
              className="bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
            >
              Create Another
            </button>
            <button
              onClick={() => window.location.href = '/bundles'}
              className="bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
            >
              View Booking
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Confirmation view
  if (bundleStage === 'confirm') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Your Bundle</h3>
          <button
            onClick={() => setBundleStage('review')}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Bundle Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">
            {selectedPreBuilt?.name || 'Custom Bundle'}
          </h4>
          
          <div className="space-y-2">
            {customComponents.filter(c => c.selected).map(component => {
              const Icon = component.icon
              return (
                <div key={component.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{component.name}</span>
                    {component.quantity && component.quantity > 1 && (
                      <span className="text-xs text-gray-500">x{component.quantity}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ${component.price * (component.quantity || 1)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Trip Details */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Trip Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">DESTINATION</p>
              <p className="font-medium text-gray-900">{bundleDestination || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">DURATION</p>
              <p className="font-medium text-gray-900">{nights} nights</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">CHECK-IN</p>
              <p className="font-medium text-gray-900">{bundleStartDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">CHECK-OUT</p>
              <p className="font-medium text-gray-900">{bundleEndDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">TRAVELERS</p>
              <p className="font-medium text-gray-900">{travelerCount} people</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">BUNDLE TYPE</p>
              <p className="font-medium text-gray-900 capitalize">{selectedBundleType}</p>
            </div>
          </div>
        </div>

        {/* Perks */}
        <div className="mb-6 p-3 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Included Perks</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center text-sm text-green-700">
              <IoCheckmarkCircle className="w-4 h-4 mr-2" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center text-sm text-green-700">
              <IoCheckmarkCircle className="w-4 h-4 mr-2" />
              <span>Free Changes</span>
            </div>
            <div className="flex items-center text-sm text-green-700">
              <IoCheckmarkCircle className="w-4 h-4 mr-2" />
              <span>Price Match</span>
            </div>
            {addInsurance && (
              <div className="flex items-center text-sm text-green-700">
                <IoCheckmarkCircle className="w-4 h-4 mr-2" />
                <span>Travel Insurance</span>
              </div>
            )}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Original Price</span>
              <span className="text-gray-500 line-through">${savings.original.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Bundle Price</span>
              <span className="text-gray-900">${(savings.original * 0.85).toFixed(2)}</span>
            </div>
            {addInsurance && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Travel Insurance</span>
                <span className="text-gray-900">${(89 * travelerCount).toFixed(2)}</span>
              </div>
            )}
            {additionalDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Promo Discount ({(additionalDiscount * 100).toFixed(0)}%)</span>
                <span className="text-green-600">
                  -${(savings.bundled * additionalDiscount).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm font-medium">
              <span className="text-green-600">Total Savings</span>
              <span className="text-green-600">${savings.savings.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ${savings.bundled.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-600">
                    Save {savings.savingsPercent}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Book Button */}
        <div className="flex space-x-3">
          <button
            onClick={() => setBundleStage('review')}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={bookBundle}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
          >
            {isLoading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    )
  }

  // Review view
  if (bundleStage === 'review') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Review Your Bundle</h3>
          <button
            onClick={() => setBundleStage('customize')}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back to customize
          </button>
        </div>

        {/* Savings Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Your Bundle Savings</p>
              <p className="text-3xl font-bold">${savings.savings.toFixed(0)}</p>
              <p className="text-sm opacity-90 mt-1">
                {savings.savingsPercent}% off regular prices
              </p>
            </div>
            <IoTrophyOutline className="w-16 h-16 opacity-20" />
          </div>
        </div>

        {/* Components Summary */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">What's Included</h4>
          <div className="space-y-3">
            {customComponents.filter(c => c.selected).map(component => {
              const Icon = component.icon
              return (
                <div key={component.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{component.name}</p>
                      <p className="text-sm text-gray-500">{component.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${component.price * (component.quantity || 1)}
                    </p>
                    {component.originalPrice && (
                      <p className="text-xs text-gray-500 line-through">
                        ${component.originalPrice * (component.quantity || 1)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Add-ons */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Protection & Flexibility</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={addInsurance}
                  onChange={(e) => setAddInsurance(e.target.checked)}
                  className="text-green-600"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Travel Insurance</p>
                  <p className="text-sm text-gray-500">
                    Cover medical, cancellation, and delays
                  </p>
                </div>
              </div>
              <span className="font-semibold text-gray-900">
                ${89 * travelerCount}
              </span>
            </label>
            
            <label className="flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={flexibleDates}
                  onChange={(e) => setFlexibleDates(e.target.checked)}
                  className="text-green-600"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Flexible Dates</p>
                  <p className="text-sm text-gray-500">
                    Change dates without fees
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">FREE</span>
            </label>
          </div>
        </div>

        {/* Promo Code */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Promo Code
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={applyPromoCode}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Apply
            </button>
          </div>
          {additionalDiscount > 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Promo code applied! Extra {(additionalDiscount * 100).toFixed(0)}% off
            </p>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={() => setBundleStage('confirm')}
          className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
        >
          Continue to Confirmation
        </button>
      </div>
    )
  }

  // Customize bundle view
  if (bundleStage === 'customize') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Customize Your {selectedPreBuilt?.name || 'Bundle'}
          </h3>
          <button
            onClick={() => setBundleStage('select-type')}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back to bundles
          </button>
        </div>

        {/* Destination & Dates */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <IoLocationOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={bundleDestination}
                onChange={(e) => setBundleDestination(e.target.value)}
                placeholder="Destination"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <IoCalendarOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={bundleStartDate}
                onChange={(e) => setBundleStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <IoCalendarOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={bundleEndDate}
                onChange={(e) => setBundleEndDate(e.target.value)}
                min={bundleStartDate}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Travelers */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Travelers
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTravelerCount(Math.max(1, travelerCount - 1))}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors"
            >
              <IoRemoveOutline className="w-5 h-5" />
            </button>
            <span className="text-xl font-semibold text-gray-900 w-12 text-center">
              {travelerCount}
            </span>
            <button
              onClick={() => setTravelerCount(travelerCount + 1)}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors"
            >
              <IoAddOutline className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Components Selection */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Select Components</h4>
          <div className="space-y-3">
            {customComponents.map(component => {
              const Icon = component.icon
              return (
                <div
                  key={component.id}
                  className={`border rounded-lg p-4 transition-all ${
                    component.selected 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={component.selected}
                        onChange={() => toggleComponent(component.id)}
                        disabled={component.required}
                        className="text-green-600"
                      />
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {component.name}
                          {component.required && (
                            <span className="ml-2 text-xs text-gray-500">(Required)</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{component.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {component.quantity !== undefined && component.selected && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateComponentQuantity(component.id, -1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors"
                          >
                            <IoRemoveOutline className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium text-gray-900 w-8 text-center">
                            {component.quantity}
                          </span>
                          <button
                            onClick={() => updateComponentQuantity(component.id, 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors"
                          >
                            <IoAddOutline className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${component.price * (component.quantity || 1)}
                        </p>
                        {component.originalPrice && (
                          <p className="text-xs text-gray-500 line-through">
                            ${component.originalPrice * (component.quantity || 1)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Savings Preview */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Your Bundle Price</p>
              <p className="text-3xl font-bold text-green-600">
                ${savings.bundled.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 line-through">
                Regular: ${savings.original.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                <IoTrendingUp className="mr-1" />
                Save {savings.savingsPercent}%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                ${savings.savings.toFixed(2)} saved
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => setBundleStage('review')}
          disabled={customComponents.filter(c => c.selected).length < 2}
          className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
        >
          Review Bundle
        </button>
        {customComponents.filter(c => c.selected).length < 2 && (
          <p className="text-sm text-center text-gray-500 mt-2">
            Select at least 2 components to create a bundle
          </p>
        )}
      </div>
    )
  }

  // Bundle type selection view
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Create Travel Bundle</h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
          <IoTrendingUp className="mr-1" />
          Save up to 40%
        </span>
      </div>

      {/* Bundle Types */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Choose Bundle Type</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {bundleTypes.map(type => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setSelectedBundleType(type.id)}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  selectedBundleType === type.id
                    ? 'border-green-500 bg-gradient-to-r ' + type.color + ' text-white'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <Icon className={`w-8 h-8 mb-2 mx-auto ${
                  selectedBundleType === type.id ? 'text-white' : 'text-gray-600'
                }`} />
                <p className={`font-medium ${
                  selectedBundleType === type.id ? 'text-white' : 'text-gray-900'
                }`}>
                  {type.name}
                </p>
                <p className={`text-xs mt-1 ${
                  selectedBundleType === type.id ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {type.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Pre-built Bundles */}
      {selectedBundleType !== 'custom' && preBuiltBundles.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Popular {selectedBundleType} Bundles</h4>
          <div className="space-y-4">
            {preBuiltBundles.map(bundle => {
              const Icon = bundle.icon
              return (
                <div
                  key={bundle.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => selectPreBuiltBundle(bundle)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-semibold text-gray-900">{bundle.name}</h5>
                        {bundle.badge && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            bundle.popular ? 'bg-orange-100 text-orange-700' :
                            bundle.limitedTime ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {bundle.badge}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{bundle.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {bundle.includes.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            <IoCheckmarkCircle className="w-3 h-3 mr-1 text-green-600" />
                            {item}
                          </span>
                        ))}
                        {bundle.includes.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{bundle.includes.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {bundle.duration} days / {bundle.duration - 1} nights
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500 mb-1">Per person from</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${bundle.basePrice}
                      </p>
                      <p className="text-sm text-gray-500 line-through">
                        ${bundle.originalPrice}
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        Save ${bundle.originalPrice - bundle.basePrice}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Custom Bundle Button */}
      <div className="text-center">
        <button
          onClick={startCustomBundle}
          className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
        >
          {selectedBundleType === 'custom' ? 'Build Custom Bundle' : 'Customize This Bundle Type'}
        </button>
        
        {/* Comparison Tool */}
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
        >
          <IoInformationCircleOutline className="inline mr-1" />
          Why book a bundle?
        </button>
      </div>

      {/* Comparison */}
      {showComparison && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Bundle vs Separate Booking</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Book Separately</p>
              <ul className="space-y-1 text-sm text-gray-500">
                <li>• Multiple bookings needed</li>
                <li>• No package discounts</li>
                <li>• Manage separately</li>
                <li>• Standard support</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-green-600 mb-2">Bundle with ItWhip</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="font-medium">• Save 20-40%</li>
                <li className="font-medium">• One booking</li>
                <li className="font-medium">• 24/7 concierge</li>
                <li className="font-medium">• Free changes</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bundles...</p>
        </div>
      )}
    </div>
  )
}
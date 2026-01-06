// app/(guest)/dashboard/components/HotelMiniStore.tsx
// Hotel Mini Store Component - Digital store for in-hotel purchases
// Displays hotel-specific inventory, room service, amenities, and services

'use client'

import { useState, useEffect } from 'react'
import { 
  IoRestaurantOutline,
  IoBasketOutline,
  IoFlowerOutline,
  IoCarOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoAddCircleOutline,
  IoRemoveCircleOutline,
  IoCartOutline,
  IoFlashOutline,
  IoWifiOutline,
  IoBedOutline,
  IoWaterOutline,
  IoShirtOutline,
  IoMedkitOutline,
  IoPhonePortraitOutline,
  IoCafeOutline,
  IoWineOutline,
  IoInformationCircle,
  IoStarOutline,
  IoLocationOutline
} from 'react-icons/io5'

// Types
interface HotelInventoryItem {
  id: string
  category: 'room-service' | 'amenities' | 'spa' | 'transport' | 'experiences'
  subcategory?: string
  name: string
  description: string
  price: number
  image?: string
  available: boolean
  deliveryTime?: number // in minutes
  popular?: boolean
  dietary?: string[] // vegetarian, vegan, gluten-free, etc.
  quantity?: number
}

interface CartItem extends HotelInventoryItem {
  quantity: number
}

interface HotelMiniStoreProps {
  hotelId: string
  roomNumber?: string
  onAddToCart: (item: CartItem) => void
}

// Category configuration
const categories = [
  { id: 'room-service', name: 'Room Service', icon: IoRestaurantOutline, color: 'orange' },
  { id: 'amenities', name: 'Amenities', icon: IoBasketOutline, color: 'blue' },
  { id: 'spa', name: 'Spa & Wellness', icon: IoFlowerOutline, color: 'purple' },
  { id: 'transport', name: 'Transportation', icon: IoCarOutline, color: 'green' },
  { id: 'experiences', name: 'Experiences', icon: IoStarOutline, color: 'yellow' },
]

// Mock inventory data (would come from API)
const mockInventory: HotelInventoryItem[] = [
  // Room Service
  {
    id: 'rs-1',
    category: 'room-service',
    subcategory: 'breakfast',
    name: 'Continental Breakfast',
    description: 'Fresh pastries, fruit, yogurt, juice, and coffee',
    price: 24,
    available: true,
    deliveryTime: 30,
    popular: true,
    dietary: ['vegetarian'],
  },
  {
    id: 'rs-2',
    category: 'room-service',
    subcategory: 'lunch',
    name: 'Club Sandwich',
    description: 'Triple-decker with turkey, bacon, lettuce, tomato',
    price: 18,
    available: true,
    deliveryTime: 25,
  },
  {
    id: 'rs-3',
    category: 'room-service',
    subcategory: 'dinner',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with seasonal vegetables and rice',
    price: 32,
    available: true,
    deliveryTime: 35,
    dietary: ['gluten-free'],
  },
  {
    id: 'rs-4',
    category: 'room-service',
    subcategory: 'beverages',
    name: 'Wine Selection',
    description: 'Curated selection of red and white wines',
    price: 45,
    available: true,
    deliveryTime: 10,
  },
  
  // Amenities
  {
    id: 'am-1',
    category: 'amenities',
    name: 'Toothbrush & Toothpaste',
    description: 'Premium dental care kit',
    price: 5,
    available: true,
    deliveryTime: 10,
  },
  {
    id: 'am-2',
    category: 'amenities',
    name: 'Phone Charger',
    description: 'Universal charging cable (Lightning/USB-C)',
    price: 15,
    available: true,
    deliveryTime: 10,
    popular: true,
  },
  {
    id: 'am-3',
    category: 'amenities',
    name: 'Premium Pillow',
    description: 'Memory foam or down alternative',
    price: 35,
    available: true,
    deliveryTime: 15,
  },
  {
    id: 'am-4',
    category: 'amenities',
    name: 'Umbrella',
    description: 'Compact travel umbrella',
    price: 20,
    available: true,
    deliveryTime: 10,
  },
  
  // Spa
  {
    id: 'spa-1',
    category: 'spa',
    name: 'Swedish Massage',
    description: '60-minute full body relaxation massage',
    price: 150,
    available: true,
    deliveryTime: 60,
    popular: true,
  },
  {
    id: 'spa-2',
    category: 'spa',
    name: 'Facial Treatment',
    description: 'Rejuvenating facial with premium products',
    price: 120,
    available: true,
    deliveryTime: 90,
  },
  
  // Transport
  {
    id: 'tr-1',
    category: 'transport',
    name: 'Airport Ride',
    description: 'Private car to Phoenix Sky Harbor',
    price: 47,
    available: true,
    deliveryTime: 5,
    popular: true,
  },
  {
    id: 'tr-2',
    category: 'transport',
    name: 'Downtown Tour',
    description: '2-hour guided city tour',
    price: 85,
    available: true,
    deliveryTime: 30,
  },
]

export default function HotelMiniStore({ hotelId, roomNumber, onAddToCart }: HotelMiniStoreProps) {
  const [selectedCategory, setSelectedCategory] = useState('room-service')
  const [inventory, setInventory] = useState<HotelInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [searchQuery, setSearchQuery] = useState('')

  // Load inventory on mount
  useEffect(() => {
    loadInventory()
  }, [hotelId])

  // Load hotel inventory
  const loadInventory = async () => {
    setLoading(true)
    try {
      // In production, this would fetch from API
      // const response = await fetch(`/api/hotels/${hotelId}/inventory`)
      // const data = await response.json()
      // setInventory(data.items)
      
      // For now, use mock data
      setTimeout(() => {
        setInventory(mockInventory)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Failed to load inventory:', error)
      setLoading(false)
    }
  }

  // Filter inventory by category and search
  const filteredInventory = inventory.filter(item => {
    const matchesCategory = item.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  // Handle quantity change
  const handleQuantityChange = (itemId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta)
    }))
  }

  // Handle add to cart
  const handleAddToCart = (item: HotelInventoryItem) => {
    const quantity = quantities[item.id] || 1
    onAddToCart({
      ...item,
      quantity
    })
    
    // Reset quantity
    setQuantities(prev => ({
      ...prev,
      [item.id]: 0
    }))
  }

  // Get icon for subcategory
  const getSubcategoryIcon = (subcategory?: string) => {
    switch(subcategory) {
      case 'breakfast': return IoCafeOutline
      case 'lunch': return IoRestaurantOutline
      case 'dinner': return IoRestaurantOutline
      case 'beverages': return IoWineOutline
      default: return IoBasketOutline
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hotel store...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="hotel-mini-store">
      {/* Store Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Hotel Store</h2>
            {roomNumber && (
              <p className="text-sm text-gray-600 mt-1">
                <IoBedOutline className="inline-block w-4 h-4 mr-1" />
                Delivering to Room {roomNumber}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              <IoFlashOutline className="inline-block w-4 h-4 mr-1 text-yellow-500" />
              Fast delivery
            </span>
            <span className="text-xs text-gray-500">
              <IoCheckmarkCircle className="inline-block w-4 h-4 mr-1 text-green-500" />
              Room charging
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <IoBasketOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map(category => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all
                  ${isSelected 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{category.name}</span>
                <span className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${isSelected ? 'bg-green-700' : 'bg-gray-200'}
                `}>
                  {inventory.filter(i => i.category === category.id).length}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInventory.map(item => {
          const SubIcon = getSubcategoryIcon(item.subcategory)
          const quantity = quantities[item.id] || 0
          
          return (
            <div
              key={item.id}
              className={`
                bg-white border rounded-lg p-4 transition-all
                ${item.available 
                  ? 'border-gray-200 hover:shadow-lg hover:border-green-500' 
                  : 'border-gray-200 opacity-60'
                }
              `}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <SubIcon className="w-4 h-4 mr-2 text-gray-500" />
                        {item.name}
                        {item.popular && (
                          <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-green-600">${item.price}</p>
                      {item.deliveryTime && (
                        <p className="text-xs text-gray-500 flex items-center justify-end mt-1">
                          <IoTimeOutline className="w-3 h-3 mr-1" />
                          {item.deliveryTime} min
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dietary tags */}
                  {item.dietary && item.dietary.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.dietary.map(diet => (
                        <span
                          key={diet}
                          className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full"
                        >
                          {diet}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              {item.available ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={quantity === 0}
                      className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IoRemoveCircleOutline className="w-6 h-6 text-gray-600" />
                    </button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <IoAddCircleOutline className="w-6 h-6 text-green-600" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={quantity === 0}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                      ${quantity > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <IoCartOutline className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {quantity > 0 ? `Add (${quantity})` : 'Add to Cart'}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-2 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-500">Currently Unavailable</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <IoBasketOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No items found in this category</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <IoInformationCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Room Charging Available</p>
            <p className="text-blue-700 mt-1">
              All purchases will be charged to your room and appear on your final bill at checkout.
              {roomNumber && ` Items will be delivered to Room ${roomNumber}.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
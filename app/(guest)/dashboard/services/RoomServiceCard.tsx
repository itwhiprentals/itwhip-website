// app/(guest)/dashboard/services/RoomServiceCard.tsx
// Room Service Card Component - Handles food ordering for hotel guests
// Displays menu items, dietary options, and manages orders

'use client'

import { useState, useEffect } from 'react'
import {
  IoRestaurantOutline,
  IoCafeOutline,
  IoWineOutline,
  IoPizzaOutline,
  IoFishOutline,
  IoLeafOutline,
  IoFlameOutline,
  IoTimeOutline,
  IoStarOutline,
  IoAddCircle,
  IoRemoveCircle,
  IoInformationCircle,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoCartOutline,
  IoFlashOutline
} from 'react-icons/io5'

// Types
interface MenuItem {
  id: string
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages' | 'desserts'
  name: string
  description: string
  price: number
  image?: string
  ingredients?: string[]
  dietary: string[] // vegetarian, vegan, gluten-free, dairy-free, nut-free
  spicyLevel?: 0 | 1 | 2 | 3 // 0 = not spicy, 3 = very spicy
  calories?: number
  prepTime: number // minutes
  available: boolean
  popular?: boolean
  chefRecommended?: boolean
  rating?: number
  reviews?: number
}

interface OrderItem extends MenuItem {
  quantity: number
  specialInstructions?: string
}

interface RoomServiceCardProps {
  hotelId: string
  roomNumber?: string
  onAddToCart: (items: OrderItem[]) => void
  onClose?: () => void
}

// Menu categories with icons
const menuCategories = [
  { id: 'breakfast', name: 'Breakfast', icon: IoCafeOutline, available: '6:00 AM - 11:00 AM' },
  { id: 'lunch', name: 'Lunch', icon: IoRestaurantOutline, available: '11:00 AM - 3:00 PM' },
  { id: 'dinner', name: 'Dinner', icon: IoFishOutline, available: '5:00 PM - 11:00 PM' },
  { id: 'snacks', name: 'Snacks', icon: IoPizzaOutline, available: '24/7' },
  { id: 'beverages', name: 'Beverages', icon: IoWineOutline, available: '24/7' },
  { id: 'desserts', name: 'Desserts', icon: IoRestaurantOutline, available: '11:00 AM - 11:00 PM' },
]

// Mock menu data (would come from API)
const mockMenu: MenuItem[] = [
  // Breakfast
  {
    id: 'bf-1',
    category: 'breakfast',
    name: 'Classic American Breakfast',
    description: 'Two eggs any style, bacon or sausage, hash browns, toast',
    price: 18,
    dietary: [],
    calories: 850,
    prepTime: 20,
    available: true,
    popular: true,
    rating: 4.5,
    reviews: 127,
  },
  {
    id: 'bf-2',
    category: 'breakfast',
    name: 'Avocado Toast',
    description: 'Smashed avocado, poached eggs, cherry tomatoes, feta',
    price: 16,
    dietary: ['vegetarian'],
    calories: 420,
    prepTime: 15,
    available: true,
    chefRecommended: true,
    rating: 4.8,
    reviews: 89,
  },
  {
    id: 'bf-3',
    category: 'breakfast',
    name: 'Vegan Pancakes',
    description: 'Fluffy pancakes with maple syrup and fresh berries',
    price: 14,
    dietary: ['vegan', 'dairy-free'],
    calories: 380,
    prepTime: 15,
    available: true,
    rating: 4.6,
    reviews: 56,
  },
  
  // Lunch
  {
    id: 'ln-1',
    category: 'lunch',
    name: 'Caesar Salad',
    description: 'Romaine, parmesan, croutons, Caesar dressing',
    price: 14,
    dietary: [],
    calories: 520,
    prepTime: 10,
    available: true,
    rating: 4.4,
    reviews: 203,
  },
  {
    id: 'ln-2',
    category: 'lunch',
    name: 'Wagyu Burger',
    description: 'Premium beef, aged cheddar, caramelized onions, truffle aioli',
    price: 28,
    dietary: [],
    calories: 980,
    prepTime: 25,
    available: true,
    popular: true,
    chefRecommended: true,
    rating: 4.9,
    reviews: 342,
  },
  {
    id: 'ln-3',
    category: 'lunch',
    name: 'Thai Green Curry',
    description: 'Vegetables, tofu, jasmine rice, fresh herbs',
    price: 19,
    dietary: ['vegan', 'gluten-free'],
    spicyLevel: 2,
    calories: 450,
    prepTime: 20,
    available: true,
    rating: 4.7,
    reviews: 178,
  },
  
  // Dinner
  {
    id: 'dn-1',
    category: 'dinner',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon, asparagus, lemon butter sauce',
    price: 32,
    dietary: ['gluten-free'],
    calories: 620,
    prepTime: 30,
    available: true,
    chefRecommended: true,
    rating: 4.8,
    reviews: 256,
  },
  {
    id: 'dn-2',
    category: 'dinner',
    name: 'Ribeye Steak',
    description: '12oz prime cut, garlic mashed potatoes, seasonal vegetables',
    price: 48,
    dietary: ['gluten-free'],
    calories: 1100,
    prepTime: 35,
    available: true,
    popular: true,
    rating: 4.9,
    reviews: 419,
  },
  
  // Beverages
  {
    id: 'bv-1',
    category: 'beverages',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed, no added sugar',
    price: 8,
    dietary: ['vegan', 'gluten-free'],
    calories: 110,
    prepTime: 5,
    available: true,
    rating: 4.6,
    reviews: 98,
  },
  {
    id: 'bv-2',
    category: 'beverages',
    name: 'House Wine Selection',
    description: 'Red or white, ask for today\'s selection',
    price: 12,
    dietary: ['vegan'],
    calories: 125,
    prepTime: 2,
    available: true,
    rating: 4.5,
    reviews: 167,
  },
]

export default function RoomServiceCard({ hotelId, roomNumber, onAddToCart, onClose }: RoomServiceCardProps) {
  const [selectedCategory, setSelectedCategory] = useState('breakfast')
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem>>({})
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [dietaryFilter, setDietaryFilter] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showCart, setShowCart] = useState(false)

  // Load menu on mount
  useEffect(() => {
    loadMenu()
  }, [hotelId])

  // Load menu from API
  const loadMenu = async () => {
    setLoading(true)
    try {
      // In production: await fetch(`/api/hotels/${hotelId}/menu`)
      setTimeout(() => {
        setMenu(mockMenu)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Failed to load menu:', error)
      setLoading(false)
    }
  }

  // Check if category is currently available
  const isCategoryAvailable = (categoryId: string): boolean => {
    const now = new Date()
    const hour = now.getHours()
    
    switch(categoryId) {
      case 'breakfast': return hour >= 6 && hour < 11
      case 'lunch': return hour >= 11 && hour < 15
      case 'dinner': return hour >= 17 && hour < 23
      case 'snacks':
      case 'beverages': return true // 24/7
      case 'desserts': return hour >= 11 && hour < 23
      default: return false
    }
  }

  // Filter menu by category and dietary restrictions
  const filteredMenu = menu.filter(item => {
    const matchesCategory = item.category === selectedCategory
    const matchesDietary = dietaryFilter.length === 0 || 
      dietaryFilter.every(diet => item.dietary.includes(diet))
    return matchesCategory && matchesDietary
  })

  // Handle quantity change
  const handleQuantityChange = (item: MenuItem, delta: number) => {
    setOrderItems(prev => {
      const currentQuantity = prev[item.id]?.quantity || 0
      const newQuantity = Math.max(0, currentQuantity + delta)
      
      if (newQuantity === 0) {
        const newItems = { ...prev }
        delete newItems[item.id]
        return newItems
      }
      
      return {
        ...prev,
        [item.id]: {
          ...item,
          quantity: newQuantity,
          specialInstructions: prev[item.id]?.specialInstructions || ''
        }
      }
    })
  }

  // Handle special instructions
  const handleSpecialInstructions = (itemId: string, instructions: string) => {
    setOrderItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        specialInstructions: instructions
      }
    }))
  }

  // Toggle item expansion
  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Get total order amount
  const getOrderTotal = (): number => {
    return Object.values(orderItems).reduce((total, item) => 
      total + (item.price * item.quantity), 0
    )
  }

  // Get total prep time
  const getEstimatedTime = (): number => {
    const maxPrepTime = Math.max(
      ...Object.values(orderItems).map(item => item.prepTime),
      0
    )
    return maxPrepTime + 10 // Add 10 minutes for delivery
  }

  // Handle checkout
  const handleCheckout = () => {
    const items = Object.values(orderItems)
    if (items.length > 0) {
      onAddToCart(items)
      setOrderItems({})
      if (onClose) onClose()
    }
  }

  // Render spicy level
  const renderSpicyLevel = (level?: number) => {
    if (level === undefined) return null
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(3)].map((_, i) => (
          <IoFlameOutline
            key={i}
            className={`w-3 h-3 ${i < level ? 'text-red-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  // Render rating
  const renderRating = (rating?: number, reviews?: number) => {
    if (!rating) return null
    
    return (
      <div className="flex items-center space-x-1 text-xs">
        <IoStarOutline className="w-3 h-3 text-yellow-500" />
        <span className="text-gray-600">{rating}</span>
        {reviews && <span className="text-gray-400">({reviews})</span>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="room-service-card bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Room Service Menu</h2>
            {roomNumber && (
              <p className="text-sm text-gray-600 mt-1">Delivering to Room {roomNumber}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <IoCartOutline className="w-5 h-5" />
              {Object.keys(orderItems).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {Object.keys(orderItems).length}
                </span>
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <IoCloseCircle className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex space-x-2 overflow-x-auto">
          {menuCategories.map(category => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id
            const isAvailable = isCategoryAvailable(category.id)
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all
                  ${isSelected 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                  ${!isAvailable ? 'opacity-50' : ''}
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.name}</span>
                {!isAvailable && (
                  <span className="text-xs">(Closed)</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Dietary Filters */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Dietary:</span>
          {['vegetarian', 'vegan', 'gluten-free'].map(diet => (
            <button
              key={diet}
              onClick={() => {
                setDietaryFilter(prev => 
                  prev.includes(diet) 
                    ? prev.filter(d => d !== diet)
                    : [...prev, diet]
                )
              }}
              className={`
                px-3 py-1 rounded-full text-xs font-medium transition-all
                ${dietaryFilter.includes(diet)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {diet}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {filteredMenu.map(item => {
          const quantity = orderItems[item.id]?.quantity || 0
          const isExpanded = expandedItems.has(item.id)
          
          return (
            <div
              key={item.id}
              className={`
                border rounded-lg p-4 mb-3 transition-all
                ${quantity > 0 ? 'border-green-500 bg-green-50' : 'border-gray-200'}
                ${!item.available ? 'opacity-50' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <span>{item.name}</span>
                        {item.popular && (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        {item.chefRecommended && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                            Chef's Pick
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        {renderRating(item.rating, item.reviews)}
                        {renderSpicyLevel(item.spicyLevel)}
                        {item.calories && (
                          <span className="text-xs text-gray-500">{item.calories} cal</span>
                        )}
                        <span className="text-xs text-gray-500 flex items-center">
                          <IoTimeOutline className="w-3 h-3 mr-1" />
                          {item.prepTime} min
                        </span>
                      </div>

                      {/* Dietary tags */}
                      {item.dietary.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.dietary.map(diet => (
                            <span
                              key={diet}
                              className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center"
                            >
                              <IoLeafOutline className="w-3 h-3 mr-1" />
                              {diet}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-green-600">${item.price}</p>
                    </div>
                  </div>

                  {/* Expandable details */}
                  <button
                    onClick={() => toggleItemExpansion(item.id)}
                    className="text-xs text-blue-600 hover:text-blue-700 mt-2 flex items-center"
                  >
                    {isExpanded ? 'Hide details' : 'Show details'}
                    {isExpanded ? <IoChevronUpOutline className="w-3 h-3 ml-1" /> : <IoChevronDownOutline className="w-3 h-3 ml-1" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      {item.ingredients && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Ingredients:</p>
                          <p className="text-xs text-gray-600">{item.ingredients.join(', ')}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-semibold text-gray-700">Special Instructions:</label>
                        <textarea
                          className="w-full mt-1 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                          rows={2}
                          placeholder="Any allergies or preferences?"
                          value={orderItems[item.id]?.specialInstructions || ''}
                          onChange={(e) => handleSpecialInstructions(item.id, e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity controls */}
              {item.available && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(item, -1)}
                      disabled={quantity === 0}
                      className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                    >
                      <IoRemoveCircle className="w-6 h-6 text-gray-600" />
                    </button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item, 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <IoAddCircle className="w-6 h-6 text-green-600" />
                    </button>
                  </div>
                  
                  {quantity > 0 && (
                    <span className="text-sm font-semibold text-green-600">
                      ${(item.price * quantity).toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Cart Summary */}
      {showCart && Object.keys(orderItems).length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2 mb-3">
            {Object.values(orderItems).map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg text-green-600">${getOrderTotal().toFixed(2)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <IoTimeOutline className="w-4 h-4 mr-1" />
              <span>Estimated delivery: {getEstimatedTime()} minutes</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Order Now - Charge to Room
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
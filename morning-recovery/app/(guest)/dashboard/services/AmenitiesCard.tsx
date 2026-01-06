// app/(guest)/dashboard/services/AmenitiesCard.tsx
// Amenities Card Component - Digital mini-bar and hotel store for in-room purchases
// Enables instant ordering of toiletries, snacks, drinks, and hotel merchandise

'use client'

import { useState, useEffect } from 'react'
import { 
  IoBasketOutline,
  IoWaterOutline,
  IoWineOutline,
  IoCafeOutline,
  IoFastFoodOutline,
  IoShirtOutline,
  IoSparklesOutline,
  IoMedkitOutline,
  IoFlowerOutline,
  IoGiftOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoCartOutline,
  IoTimeOutline,
  IoBedOutline,
  IoFlashOutline,
  IoStarOutline,
  IoTrendingUp,
  IoInformationCircleOutline,
  IoLeafOutline,
  IoNutritionOutline,
  IoFitnessOutline,
  IoBarbellOutline,
  IoHeartOutline,
  IoThumbsUpOutline,
  IoFlameOutline,
  IoSnowOutline,
  IoSunnyOutline,
  IoMoonOutline,
  IoRocketOutline,
  IoPricetagOutline,
  IoChevronDownOutline,
  IoChevronUpOutline
} from 'react-icons/io5'

// Types
interface AmenitiesCardProps {
  hotelId?: string
  roomNumber?: string
  onAddToCart?: (item: AmenityItem, quantity: number) => void
  onOrderComplete?: (order: AmenityOrder) => void
  showRoomCharge?: boolean
  expressDelivery?: boolean
}

interface AmenityItem {
  id: string
  category: AmenityCategory
  name: string
  brand?: string
  description: string
  price: number
  originalPrice?: number
  image?: string
  icon: any
  inStock: boolean
  stockCount?: number
  popular: boolean
  premium: boolean
  sustainable?: boolean
  allergens?: string[]
  size?: string
  tags: string[]
  deliveryTime: number // minutes
  limitPerOrder?: number
}

interface AmenityCategory {
  id: string
  name: string
  icon: any
  description: string
  itemCount: number
  color: string
}

interface AmenityOrder {
  id: string
  roomNumber: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  tip: number
  total: number
  deliveryTime: string
  paymentMethod: 'roomCharge' | 'card'
  specialInstructions?: string
}

interface OrderItem {
  item: AmenityItem
  quantity: number
  totalPrice: number
}

export default function AmenitiesCard({
  hotelId = 'grand-hotel',
  roomNumber = '412',
  onAddToCart,
  onOrderComplete,
  showRoomCharge = true,
  expressDelivery = true
}: AmenitiesCardProps) {
  // State management
  const [categories, setCategories] = useState<AmenityCategory[]>([])
  const [items, setItems] = useState<AmenityItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<OrderItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [orderStage, setOrderStage] = useState<'browse' | 'cart' | 'checkout' | 'confirmed'>('browse')
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard')
  const [tipAmount, setTipAmount] = useState(15) // percentage
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: [0, 100],
    sustainable: false,
    popular: false,
    premium: false,
    inStockOnly: true
  })
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [recentlyViewed, setRecentlyViewed] = useState<AmenityItem[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Time-based recommendations
  const getTimeBasedCategory = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 22) return 'evening'
    return 'night'
  }

  // Load categories and items
  useEffect(() => {
    loadAmenities()
  }, [hotelId])

  // Load amenities data
  const loadAmenities = async () => {
    setIsLoading(true)
    try {
      // This would normally call the API
      // Mock data for now
      const mockCategories: AmenityCategory[] = [
        {
          id: 'toiletries',
          name: 'Toiletries',
          icon: IoSparklesOutline,
          description: 'Premium bath and body essentials',
          itemCount: 24,
          color: 'from-purple-500 to-pink-500'
        },
        {
          id: 'snacks',
          name: 'Snacks',
          icon: IoFastFoodOutline,
          description: 'Gourmet snacks and treats',
          itemCount: 18,
          color: 'from-orange-500 to-red-500'
        },
        {
          id: 'beverages',
          name: 'Beverages',
          icon: IoWaterOutline,
          description: 'Refreshing drinks and spirits',
          itemCount: 32,
          color: 'from-blue-500 to-cyan-500'
        },
        {
          id: 'wellness',
          name: 'Wellness',
          icon: IoMedkitOutline,
          description: 'Health and wellness products',
          itemCount: 15,
          color: 'from-green-500 to-emerald-500'
        },
        {
          id: 'merchandise',
          name: 'Merchandise',
          icon: IoShirtOutline,
          description: 'Hotel branded items',
          itemCount: 12,
          color: 'from-indigo-500 to-purple-500'
        },
        {
          id: 'gifts',
          name: 'Gifts',
          icon: IoGiftOutline,
          description: 'Local specialties and souvenirs',
          itemCount: 20,
          color: 'from-pink-500 to-rose-500'
        }
      ]

      const mockItems: AmenityItem[] = [
        // Toiletries
        {
          id: 'item-1',
          category: mockCategories[0],
          name: 'Luxury Shampoo & Conditioner Set',
          brand: 'L\'Occitane',
          description: 'Repairing shampoo and conditioner with essential oils',
          price: 28,
          originalPrice: 35,
          icon: IoSparklesOutline,
          inStock: true,
          stockCount: 8,
          popular: true,
          premium: true,
          sustainable: true,
          tags: ['organic', 'paraben-free', 'vegan'],
          deliveryTime: 10,
          size: '250ml each'
        },
        {
          id: 'item-2',
          category: mockCategories[0],
          name: 'Bamboo Toothbrush Set',
          brand: 'EcoSmile',
          description: 'Sustainable bamboo toothbrushes with charcoal bristles',
          price: 12,
          icon: IoLeafOutline,
          inStock: true,
          stockCount: 15,
          popular: false,
          premium: false,
          sustainable: true,
          tags: ['eco-friendly', 'biodegradable'],
          deliveryTime: 10,
          size: 'Pack of 2'
        },
        {
          id: 'item-3',
          category: mockCategories[0],
          name: 'Silk Sleep Mask',
          brand: 'DreamSoft',
          description: 'Pure mulberry silk eye mask for perfect sleep',
          price: 45,
          originalPrice: 60,
          icon: IoMoonOutline,
          inStock: true,
          stockCount: 5,
          popular: true,
          premium: true,
          sustainable: false,
          tags: ['luxury', 'hypoallergenic'],
          deliveryTime: 10
        },
        
        // Snacks
        {
          id: 'item-4',
          category: mockCategories[1],
          name: 'Artisan Chocolate Box',
          brand: 'Swiss Delights',
          description: 'Handcrafted dark chocolate truffles',
          price: 32,
          originalPrice: 40,
          icon: IoHeartOutline,
          inStock: true,
          stockCount: 10,
          popular: true,
          premium: true,
          sustainable: false,
          allergens: ['milk', 'nuts'],
          tags: ['gourmet', 'gift-worthy'],
          deliveryTime: 15,
          size: '12 pieces'
        },
        {
          id: 'item-5',
          category: mockCategories[1],
          name: 'Mixed Nuts Selection',
          brand: 'Nature\'s Best',
          description: 'Premium roasted and salted mixed nuts',
          price: 18,
          icon: IoNutritionOutline,
          inStock: true,
          stockCount: 20,
          popular: true,
          premium: false,
          sustainable: true,
          allergens: ['nuts'],
          tags: ['healthy', 'protein', 'vegan'],
          deliveryTime: 10,
          size: '200g'
        },
        {
          id: 'item-6',
          category: mockCategories[1],
          name: 'Protein Bar Pack',
          brand: 'FitFuel',
          description: 'High-protein, low-sugar energy bars',
          price: 24,
          icon: IoBarbellOutline,
          inStock: true,
          stockCount: 12,
          popular: false,
          premium: false,
          sustainable: false,
          allergens: ['soy', 'nuts'],
          tags: ['fitness', 'energy', 'low-carb'],
          deliveryTime: 10,
          size: 'Pack of 6'
        },
        
        // Beverages
        {
          id: 'item-7',
          category: mockCategories[2],
          name: 'Premium Water Collection',
          brand: 'AquaPure',
          description: 'Fiji, Evian, and Voss water selection',
          price: 15,
          icon: IoWaterOutline,
          inStock: true,
          stockCount: 30,
          popular: true,
          premium: false,
          sustainable: false,
          tags: ['hydration', 'mineral'],
          deliveryTime: 5,
          size: '3 bottles'
        },
        {
          id: 'item-8',
          category: mockCategories[2],
          name: 'Champagne',
          brand: 'Moët & Chandon',
          description: 'Premium champagne for celebrations',
          price: 125,
          originalPrice: 150,
          icon: IoWineOutline,
          inStock: true,
          stockCount: 3,
          popular: true,
          premium: true,
          sustainable: false,
          tags: ['celebration', 'luxury', 'alcohol'],
          deliveryTime: 15,
          size: '750ml',
          limitPerOrder: 2
        },
        {
          id: 'item-9',
          category: mockCategories[2],
          name: 'Organic Coffee Pods',
          brand: 'Morning Brew',
          description: 'Fair trade organic coffee capsules',
          price: 22,
          icon: IoCafeOutline,
          inStock: true,
          stockCount: 25,
          popular: true,
          premium: false,
          sustainable: true,
          tags: ['organic', 'fair-trade', 'morning'],
          deliveryTime: 10,
          size: 'Pack of 10'
        },
        
        // Wellness
        {
          id: 'item-10',
          category: mockCategories[3],
          name: 'Essential Oil Set',
          brand: 'ZenScents',
          description: 'Lavender, eucalyptus, and peppermint oils',
          price: 38,
          originalPrice: 48,
          icon: IoFlowerOutline,
          inStock: true,
          stockCount: 7,
          popular: true,
          premium: true,
          sustainable: true,
          tags: ['aromatherapy', 'relaxation', 'natural'],
          deliveryTime: 10,
          size: '3 x 10ml'
        },
        {
          id: 'item-11',
          category: mockCategories[3],
          name: 'Vitamin Pack',
          brand: 'VitaBoost',
          description: 'Daily vitamins and supplements travel pack',
          price: 28,
          icon: IoMedkitOutline,
          inStock: true,
          stockCount: 15,
          popular: false,
          premium: false,
          sustainable: false,
          tags: ['health', 'vitamins', 'travel'],
          deliveryTime: 10,
          size: '7-day supply'
        },
        {
          id: 'item-12',
          category: mockCategories[3],
          name: 'Yoga Mat',
          brand: 'FlexFit',
          description: 'Premium non-slip yoga mat',
          price: 45,
          icon: IoFitnessOutline,
          inStock: true,
          stockCount: 4,
          popular: false,
          premium: false,
          sustainable: true,
          tags: ['fitness', 'yoga', 'exercise'],
          deliveryTime: 20,
          size: '6mm thick'
        },
        
        // Merchandise
        {
          id: 'item-13',
          category: mockCategories[4],
          name: 'Hotel Bathrobe',
          brand: hotelId,
          description: 'Luxurious terry cloth bathrobe with hotel logo',
          price: 85,
          originalPrice: 120,
          icon: IoShirtOutline,
          inStock: true,
          stockCount: 6,
          popular: true,
          premium: true,
          sustainable: false,
          tags: ['luxury', 'comfort', 'souvenir'],
          deliveryTime: 15,
          size: 'One size'
        },
        {
          id: 'item-14',
          category: mockCategories[4],
          name: 'Hotel Slippers',
          brand: hotelId,
          description: 'Plush memory foam slippers',
          price: 25,
          icon: IoSparklesOutline,
          inStock: true,
          stockCount: 10,
          popular: true,
          premium: false,
          sustainable: false,
          tags: ['comfort', 'relaxation'],
          deliveryTime: 10,
          size: 'M/L'
        }
      ]

      setCategories(mockCategories)
      setItems(mockItems)
    } catch (error) {
      console.error('Failed to load amenities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter items
  const getFilteredItems = () => {
    let filtered = [...items]
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category.id === selectedCategory)
    }
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    // Additional filters
    if (filters.inStockOnly) {
      filtered = filtered.filter(item => item.inStock)
    }
    if (filters.sustainable) {
      filtered = filtered.filter(item => item.sustainable)
    }
    if (filters.popular) {
      filtered = filtered.filter(item => item.popular)
    }
    if (filters.premium) {
      filtered = filtered.filter(item => item.premium)
    }
    
    // Price range
    filtered = filtered.filter(item => 
      item.price >= filters.priceRange[0] && 
      item.price <= filters.priceRange[1]
    )
    
    return filtered
  }

  // Get time-based recommendations
  const getTimeBasedRecommendations = () => {
    const timeCategory = getTimeBasedCategory()
    
    switch(timeCategory) {
      case 'morning':
        return items.filter(item => 
          item.tags.includes('morning') || 
          item.category.id === 'beverages' ||
          item.name.toLowerCase().includes('coffee')
        ).slice(0, 3)
      
      case 'evening':
        return items.filter(item => 
          item.tags.includes('relaxation') ||
          item.category.id === 'wellness' ||
          item.name.toLowerCase().includes('wine')
        ).slice(0, 3)
      
      case 'night':
        return items.filter(item => 
          item.tags.includes('relaxation') ||
          item.name.toLowerCase().includes('sleep') ||
          item.category.id === 'wellness'
        ).slice(0, 3)
      
      default:
        return items.filter(item => item.popular).slice(0, 3)
    }
  }

  // Add to cart
  const addToCart = (item: AmenityItem, quantity: number = 1) => {
    const existingItem = cart.find(cartItem => cartItem.item.id === item.id)
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity
      const maxQuantity = item.limitPerOrder || 10
      
      setCart(cart.map(cartItem => 
        cartItem.item.id === item.id
          ? { ...cartItem, quantity: Math.min(newQuantity, maxQuantity), totalPrice: item.price * Math.min(newQuantity, maxQuantity) }
          : cartItem
      ))
    } else {
      // Add new item
      setCart([...cart, {
        item,
        quantity,
        totalPrice: item.price * quantity
      }])
    }
    
    // Add to recently viewed
    setRecentlyViewed(prev => {
      const filtered = prev.filter(i => i.id !== item.id)
      return [item, ...filtered].slice(0, 5)
    })
    
    if (onAddToCart) {
      onAddToCart(item, quantity)
    }
  }

  // Update cart quantity
  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.item.id !== itemId))
    } else {
      setCart(cart.map(cartItem => 
        cartItem.item.id === itemId
          ? { ...cartItem, quantity, totalPrice: cartItem.item.price * quantity }
          : cartItem
      ))
    }
  }

  // Toggle favorite
  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId)
    } else {
      newFavorites.add(itemId)
    }
    setFavorites(newFavorites)
  }

  // Toggle item expansion
  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  // Calculate order totals
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
    const deliveryFee = deliveryMethod === 'express' ? 10 : 0
    const tax = subtotal * 0.08
    const tip = (subtotal * tipAmount) / 100
    const total = subtotal + deliveryFee + tax + tip
    
    return { subtotal, deliveryFee, tax, tip, total }
  }

  // Place order
  const placeOrder = async () => {
    setIsLoading(true)
    try {
      const totals = calculateTotals()
      const order: AmenityOrder = {
        id: Date.now().toString(),
        roomNumber,
        items: cart,
        ...totals,
        deliveryTime: deliveryMethod === 'express' ? '10-15 min' : '20-30 min',
        paymentMethod: 'roomCharge',
        specialInstructions
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setOrderStage('confirmed')
      
      if (onOrderComplete) {
        onOrderComplete(order)
      }
      
      // Clear cart after order
      setTimeout(() => {
        setCart([])
        setOrderStage('browse')
      }, 5000)
    } catch (error) {
      console.error('Order failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totals = calculateTotals()
  const timeRecommendations = getTimeBasedRecommendations()

  // Order confirmed view
  if (orderStage === 'confirmed') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
          <p className="text-gray-600 mb-6">
            Your items will be delivered to Room {roomNumber}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Delivery Time</span>
              <span className="font-medium text-gray-900">
                {deliveryMethod === 'express' ? '10-15 minutes' : '20-30 minutes'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Charged</span>
              <span className="text-lg font-bold text-green-600">
                ${totals.total.toFixed(2)}
              </span>
            </div>
            {showRoomCharge && (
              <div className="mt-3 p-2 bg-blue-50 rounded">
                <div className="flex items-center text-blue-700 text-sm">
                  <IoBedOutline className="w-4 h-4 mr-2" />
                  <span>Charged to Room {roomNumber}</span>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => {
              setCart([])
              setOrderStage('browse')
            }}
            className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  // Checkout view
  if (orderStage === 'checkout') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Checkout</h3>
          <button
            onClick={() => setOrderStage('cart')}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.item.name}
                </span>
                <span className="font-medium text-gray-900">
                  ${item.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Options */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Delivery Speed</h4>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
              <div className="flex items-center">
                <input
                  type="radio"
                  value="standard"
                  checked={deliveryMethod === 'standard'}
                  onChange={(e) => setDeliveryMethod(e.target.value as any)}
                  className="text-green-600"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Standard</p>
                  <p className="text-sm text-gray-500">20-30 minutes</p>
                </div>
              </div>
              <span className="font-medium text-gray-900">FREE</span>
            </label>
            
            {expressDelivery && (
              <label className="flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
                <div className="flex items-center">
                  <input
                    type="radio"
                    value="express"
                    checked={deliveryMethod === 'express'}
                    onChange={(e) => setDeliveryMethod(e.target.value as any)}
                    className="text-green-600"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Express</p>
                    <p className="text-sm text-gray-500">10-15 minutes</p>
                  </div>
                </div>
                <span className="font-medium text-gray-900">$10.00</span>
              </label>
            )}
          </div>
        </div>

        {/* Special Instructions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions (Optional)
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Any special requests?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Tip Selection */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Add Tip</h4>
          <div className="flex space-x-2">
            {[10, 15, 20, 25].map(percent => (
              <button
                key={percent}
                onClick={() => setTipAmount(percent)}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                  tipAmount === percent
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">${totals.subtotal.toFixed(2)}</span>
            </div>
            {deliveryMethod === 'express' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Express Delivery</span>
                <span className="text-gray-900">${totals.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">${totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tip ({tipAmount}%)</span>
              <span className="text-gray-900">${totals.tip.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-green-600">
                  ${totals.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Room Charge Notice */}
        {showRoomCharge && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center text-blue-700">
              <IoBedOutline className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">
                This will be charged to Room {roomNumber}
              </span>
            </div>
          </div>
        )}

        {/* Place Order Button */}
        <button
          onClick={placeOrder}
          disabled={isLoading}
          className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
        >
          {isLoading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    )
  }

  // Cart view
  if (orderStage === 'cart' || showCart) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Cart</h3>
          <button
            onClick={() => {
              setOrderStage('browse')
              setShowCart(false)
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-8">
            <IoCartOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Your cart is empty</p>
            <button
              onClick={() => {
                setOrderStage('browse')
                setShowCart(false)
              }}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cart.map(cartItem => (
                <div key={cartItem.item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <cartItem.item.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{cartItem.item.name}</p>
                      <p className="text-sm text-gray-500">
                        ${cartItem.item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors"
                      >
                        <IoRemoveOutline className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-gray-900 w-8 text-center">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity + 1)}
                        disabled={cartItem.item.limitPerOrder ? cartItem.quantity >= cartItem.item.limitPerOrder : false}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors disabled:opacity-50"
                      >
                        <IoAddOutline className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="font-semibold text-gray-900 w-16 text-right">
                      ${cartItem.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ${totals.subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Tax and delivery calculated at checkout
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setOrderStage('browse')
                  setShowCart(false)
                }}
                className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => setOrderStage('checkout')}
                className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // Main browse view
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Hotel Store</h3>
        <div className="flex items-center space-x-2">
          {cart.length > 0 && (
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IoCartOutline className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.length}
              </span>
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoFilterOutline className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <IoSearchOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search amenities..."
          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Time-based Recommendations */}
      {timeRecommendations.length > 0 && !searchQuery && selectedCategory === 'all' && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <IoRocketOutline className="w-4 h-4 mr-2" />
            {getTimeBasedCategory() === 'morning' ? 'Good Morning!' :
             getTimeBasedCategory() === 'evening' ? 'Good Evening!' :
             getTimeBasedCategory() === 'night' ? 'Night Essentials' :
             'Recommended for You'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {timeRecommendations.map(item => (
              <div 
                key={item.id}
                className="border border-gray-200 rounded-lg p-3 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
                onClick={() => addToCart(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        ${item.price}
                      </p>
                    </div>
                  </div>
                  <button className="p-1 bg-green-600 text-white rounded hover:bg-green-700">
                    <IoAddOutline className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Items
        </button>
        {categories.map(category => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r text-white ' + category.color
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span>{category.name}</span>
              <span className="ml-2 text-xs opacity-75">
                ({category.itemCount})
              </span>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.popular}
                onChange={(e) => setFilters({...filters, popular: e.target.checked})}
                className="text-green-600"
              />
              <span className="text-sm text-gray-700">Popular</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.premium}
                onChange={(e) => setFilters({...filters, premium: e.target.checked})}
                className="text-green-600"
              />
              <span className="text-sm text-gray-700">Premium</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.sustainable}
                onChange={(e) => setFilters({...filters, sustainable: e.target.checked})}
                className="text-green-600"
              />
              <span className="text-sm text-gray-700">Eco-Friendly</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => setFilters({...filters, inStockOnly: e.target.checked})}
                className="text-green-600"
              />
              <span className="text-sm text-gray-700">In Stock</span>
            </label>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amenities...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getFilteredItems().map(item => {
            const isExpanded = expandedItems.has(item.id)
            const isFavorite = favorites.has(item.id)
            const inCart = cart.find(c => c.item.id === item.id)
            
            return (
              <div
                key={item.id}
                className={`border rounded-lg overflow-hidden hover:shadow-lg transition-all ${
                  !item.inStock ? 'opacity-60' : ''
                } ${inCart ? 'border-green-500' : 'border-gray-200'}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          {item.popular && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              <IoFlameOutline className="mr-0.5" />
                              Popular
                            </span>
                          )}
                          {item.premium && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              Premium
                            </span>
                          )}
                        </div>
                        
                        {item.brand && (
                          <p className="text-sm text-gray-500">{item.brand}</p>
                        )}
                        
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        
                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            {item.size && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Size:</span> {item.size}
                              </p>
                            )}
                            
                            {item.allergens && item.allergens.length > 0 && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Allergens:</span> {item.allergens.join(', ')}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => toggleItemExpansion(item.id)}
                          className="text-sm text-green-600 hover:text-green-700 font-medium mt-2"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <IoHeartOutline className={`w-5 h-5 ${
                        isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-xl font-bold text-gray-900">
                          ${item.price.toFixed(2)}
                        </p>
                        {item.originalPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            ${item.originalPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                        <div className="flex items-center">
                          <IoTimeOutline className="w-3 h-3 mr-1" />
                          <span>{item.deliveryTime} min</span>
                        </div>
                        
                        {item.sustainable && (
                          <div className="flex items-center text-green-600">
                            <IoLeafOutline className="w-3 h-3 mr-1" />
                            <span>Eco</span>
                          </div>
                        )}
                        
                        {item.stockCount && item.stockCount <= 5 && (
                          <span className="text-orange-600">
                            Only {item.stockCount} left
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {item.inStock ? (
                      inCart ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, inCart.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <IoRemoveOutline className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium text-gray-900 w-8 text-center">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, inCart.quantity + 1)}
                            disabled={item.limitPerOrder ? inCart.quantity >= item.limitPerOrder : false}
                            className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <IoAddOutline className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
                        >
                          <IoAddOutline className="w-4 h-4 mr-1" />
                          Add
                        </button>
                      )
                    ) : (
                      <span className="text-sm text-gray-500 font-medium">Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && getFilteredItems().length === 0 && (
        <div className="text-center py-8">
          <IoBasketOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No items found</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setFilters({
                priceRange: [0, 100],
                sustainable: false,
                popular: false,
                premium: false,
                inStockOnly: true
              })
            }}
            className="mt-4 text-green-600 hover:text-green-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowCart(true)}
            className="bg-green-600 text-white rounded-full px-6 py-3 shadow-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <IoCartOutline className="w-5 h-5" />
            <span className="font-medium">Cart ({cart.length})</span>
            <span className="font-bold">${totals.subtotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
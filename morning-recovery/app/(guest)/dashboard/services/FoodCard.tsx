// app/(guest)/dashboard/services/FoodCard.tsx
// Food Card Component - Order food delivery or pickup from local restaurants
// Shows restaurants, menus, and handles food ordering with room charging option

'use client'

import { useState, useEffect } from 'react'
import { 
  IoRestaurantOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoStarOutline,
  IoCarOutline,
  IoWalkOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoAddOutline,
  IoRemoveOutline,
  IoFlameOutline,
  IoLeafOutline,
  IoFishOutline,
  IoPizzaOutline,
  IoFastFoodOutline,
  IoCafeOutline,
  IoWineOutline,
  IoIceCreamOutline,
  IoInformationCircleOutline,
  IoBagCheckOutline,
  IoCartOutline,
  IoTimerOutline,
  IoTrendingUp,
  IoBedOutline
} from 'react-icons/io5'

// Types
interface FoodCardProps {
  deliveryAddress?: string
  isAtHotel?: boolean
  roomNumber?: string
  onOrderFood?: (order: FoodOrder) => void
  showRoomCharge?: boolean
}

interface Restaurant {
  id: string
  name: string
  cuisine: string[]
  rating: number
  reviews: number
  deliveryTime: number // minutes
  deliveryFee: number
  minimumOrder: number
  distance: number // miles
  image: string
  popular: boolean
  partnerHotel: boolean
  categories: MenuCategory[]
  tags: string[]
}

interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

interface MenuItem {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  image?: string
  popular?: boolean
  spicy?: number // 0-3 scale
  vegetarian?: boolean
  vegan?: boolean
  glutenFree?: boolean
  calories?: number
  customizations?: Customization[]
}

interface Customization {
  id: string
  name: string
  options: CustomizationOption[]
  required: boolean
  maxSelections: number
}

interface CustomizationOption {
  id: string
  name: string
  price: number
}

interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  customizations: { [key: string]: string[] }
  specialInstructions?: string
  totalPrice: number
}

interface FoodOrder {
  id: string
  restaurantId: string
  restaurantName: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  tip: number
  total: number
  deliveryAddress: string
  deliveryTime: string
  paymentMethod: 'card' | 'roomCharge'
  roomNumber?: string
}

export default function FoodCard({
  deliveryAddress = '',
  isAtHotel = false,
  roomNumber = '',
  onOrderFood,
  showRoomCharge = true
}: FoodCardProps) {
  // State management
  const [address, setAddress] = useState(deliveryAddress)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [orderStage, setOrderStage] = useState<'browse' | 'menu' | 'checkout' | 'confirmed'>('browse')
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'roomCharge'>(isAtHotel ? 'roomCharge' : 'card')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [itemQuantity, setItemQuantity] = useState(1)
  const [itemCustomizations, setItemCustomizations] = useState<{ [key: string]: string[] }>({})
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [tipAmount, setTipAmount] = useState(15) // percentage

  // Cuisine types
  const cuisineTypes = [
    { id: 'all', name: 'All', icon: IoRestaurantOutline },
    { id: 'american', name: 'American', icon: IoFastFoodOutline },
    { id: 'italian', name: 'Italian', icon: IoPizzaOutline },
    { id: 'asian', name: 'Asian', icon: IoFishOutline },
    { id: 'mexican', name: 'Mexican', icon: IoFlameOutline },
    { id: 'healthy', name: 'Healthy', icon: IoLeafOutline },
    { id: 'cafe', name: 'Cafe', icon: IoCafeOutline },
    { id: 'dessert', name: 'Dessert', icon: IoIceCreamOutline }
  ]

  // Load restaurants
  useEffect(() => {
    loadRestaurants()
  }, [])

  // Set hotel address if at hotel
  useEffect(() => {
    if (isAtHotel && !address) {
      setAddress('Current Hotel - Room ' + (roomNumber || 'TBD'))
    }
  }, [isAtHotel, roomNumber])

  // Load restaurants
  const loadRestaurants = async () => {
    setIsLoading(true)
    try {
      // This would normally call the API
      // Mock data for now
      const mockRestaurants: Restaurant[] = [
        {
          id: 'rest-1',
          name: 'The Capital Grille',
          cuisine: ['american', 'steakhouse'],
          rating: 4.8,
          reviews: 1247,
          deliveryTime: 35,
          deliveryFee: 4.99,
          minimumOrder: 30,
          distance: 0.8,
          image: 'capital-grille.jpg',
          popular: true,
          partnerHotel: true,
          tags: ['Premium', 'Hotel Partner'],
          categories: [
            {
              id: 'cat-1',
              name: 'Starters',
              items: [
                {
                  id: 'item-1',
                  categoryId: 'cat-1',
                  name: 'Lobster Bisque',
                  description: 'Rich and creamy with chunks of North Atlantic lobster',
                  price: 14.50,
                  popular: true,
                  calories: 380
                },
                {
                  id: 'item-2',
                  categoryId: 'cat-1',
                  name: 'Caesar Salad',
                  description: 'Romaine, parmesan, house-made croutons, Caesar dressing',
                  price: 12.00,
                  vegetarian: true,
                  calories: 290,
                  customizations: [
                    {
                      id: 'cust-1',
                      name: 'Add Protein',
                      required: false,
                      maxSelections: 1,
                      options: [
                        { id: 'opt-1', name: 'Grilled Chicken', price: 6 },
                        { id: 'opt-2', name: 'Grilled Shrimp', price: 8 },
                        { id: 'opt-3', name: 'Grilled Salmon', price: 10 }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 'cat-2',
              name: 'Main Courses',
              items: [
                {
                  id: 'item-3',
                  categoryId: 'cat-2',
                  name: 'Filet Mignon',
                  description: '10oz center-cut, served with mashed potatoes',
                  price: 52.00,
                  popular: true,
                  glutenFree: true,
                  calories: 680,
                  customizations: [
                    {
                      id: 'cust-2',
                      name: 'Temperature',
                      required: true,
                      maxSelections: 1,
                      options: [
                        { id: 'opt-4', name: 'Rare', price: 0 },
                        { id: 'opt-5', name: 'Medium Rare', price: 0 },
                        { id: 'opt-6', name: 'Medium', price: 0 },
                        { id: 'opt-7', name: 'Medium Well', price: 0 },
                        { id: 'opt-8', name: 'Well Done', price: 0 }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'rest-2',
          name: 'Pizzeria Bianco',
          cuisine: ['italian', 'pizza'],
          rating: 4.9,
          reviews: 3421,
          deliveryTime: 25,
          deliveryFee: 2.99,
          minimumOrder: 20,
          distance: 1.2,
          image: 'pizzeria.jpg',
          popular: true,
          partnerHotel: false,
          tags: ['Top Rated', 'Fast Delivery'],
          categories: [
            {
              id: 'cat-3',
              name: 'Pizzas',
              items: [
                {
                  id: 'item-4',
                  categoryId: 'cat-3',
                  name: 'Margherita',
                  description: 'Tomato sauce, fresh mozzarella, basil, olive oil',
                  price: 18.00,
                  popular: true,
                  vegetarian: true,
                  calories: 890
                }
              ]
            }
          ]
        },
        {
          id: 'rest-3',
          name: 'True Food Kitchen',
          cuisine: ['healthy', 'american'],
          rating: 4.6,
          reviews: 1892,
          deliveryTime: 30,
          deliveryFee: 3.99,
          minimumOrder: 25,
          distance: 2.1,
          image: 'truefood.jpg',
          popular: false,
          partnerHotel: true,
          tags: ['Healthy', 'Organic'],
          categories: [
            {
              id: 'cat-4',
              name: 'Bowls',
              items: [
                {
                  id: 'item-5',
                  categoryId: 'cat-4',
                  name: 'Ancient Grains Bowl',
                  description: 'Quinoa, farro, vegetables, tahini sauce',
                  price: 16.00,
                  vegetarian: true,
                  vegan: true,
                  glutenFree: false,
                  calories: 420
                }
              ]
            }
          ]
        }
      ]

      setRestaurants(mockRestaurants)
    } catch (error) {
      console.error('Failed to load restaurants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter restaurants
  const getFilteredRestaurants = () => {
    let filtered = restaurants

    // Filter by cuisine
    if (selectedCuisine !== 'all') {
      filtered = filtered.filter(r => r.cuisine.includes(selectedCuisine))
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    return filtered
  }

  // Add item to cart
  const addToCart = () => {
    if (!selectedItem || !selectedRestaurant) return

    const cartItem: CartItem = {
      id: Date.now().toString(),
      menuItem: selectedItem,
      quantity: itemQuantity,
      customizations: itemCustomizations,
      specialInstructions,
      totalPrice: calculateItemTotal()
    }

    setCart([...cart, cartItem])
    setSelectedItem(null)
    setItemQuantity(1)
    setItemCustomizations({})
    setSpecialInstructions('')
    setShowCart(true)
  }

  // Calculate item total with customizations
  const calculateItemTotal = () => {
    if (!selectedItem) return 0
    
    let total = selectedItem.price * itemQuantity
    
    // Add customization costs
    Object.entries(itemCustomizations).forEach(([custId, options]) => {
      const customization = selectedItem.customizations?.find(c => c.id === custId)
      if (customization) {
        options.forEach(optId => {
          const option = customization.options.find(o => o.id === optId)
          if (option) {
            total += option.price * itemQuantity
          }
        })
      }
    })
    
    return total
  }

  // Update cart item quantity
  const updateCartItemQuantity = (itemId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + change)
        if (newQuantity === 0) return null
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: (item.totalPrice / item.quantity) * newQuantity
        }
      }
      return item
    }).filter(Boolean) as CartItem[])
  }

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  // Calculate order totals
  const calculateOrderTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
    const deliveryFee = deliveryMethod === 'delivery' ? (selectedRestaurant?.deliveryFee || 0) : 0
    const tax = subtotal * 0.08
    const tip = deliveryMethod === 'delivery' ? (subtotal * tipAmount / 100) : 0
    const total = subtotal + deliveryFee + tax + tip
    
    return { subtotal, deliveryFee, tax, tip, total }
  }

  // Place order
  const placeOrder = async () => {
    if (!selectedRestaurant || cart.length === 0) return
    
    setIsLoading(true)
    try {
      const totals = calculateOrderTotals()
      const order: FoodOrder = {
        id: Date.now().toString(),
        restaurantId: selectedRestaurant.id,
        restaurantName: selectedRestaurant.name,
        items: cart,
        ...totals,
        deliveryAddress: address,
        deliveryTime: `${selectedRestaurant.deliveryTime}-${selectedRestaurant.deliveryTime + 10} min`,
        paymentMethod,
        roomNumber: paymentMethod === 'roomCharge' ? roomNumber : undefined
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setOrderStage('confirmed')
      
      if (onOrderFood) {
        onOrderFood(order)
      }
      
      // Clear cart after order
      setTimeout(() => {
        setCart([])
      }, 3000)
    } catch (error) {
      console.error('Failed to place order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Order confirmed view
  if (orderStage === 'confirmed') {
    const totals = calculateOrderTotals()
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
          <p className="text-gray-600 mb-6">
            Your food from {selectedRestaurant?.name} is on the way
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-left">
                <p className="text-sm text-gray-500">Delivery Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedRestaurant?.deliveryTime}-{selectedRestaurant?.deliveryTime! + 10} min
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-lg font-semibold text-green-600">
                  ${totals.total.toFixed(2)}
                </p>
              </div>
            </div>
            
            {paymentMethod === 'roomCharge' && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center text-blue-700">
                  <IoBedOutline className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">
                    Charged to Room {roomNumber}
                  </span>
                </div>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Delivery to: {address}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setOrderStage('browse')
                setSelectedRestaurant(null)
              }}
              className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
            >
              Order More Food
            </button>
            <button
              onClick={() => window.location.href = '/orders'}
              className="flex-1 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Checkout view
  if (orderStage === 'checkout' && selectedRestaurant) {
    const totals = calculateOrderTotals()
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Checkout</h3>
          <button
            onClick={() => setOrderStage('menu')}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {item.quantity}x {item.menuItem.name}
                    </span>
                  </div>
                  {Object.entries(item.customizations).length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Customizations included
                    </p>
                  )}
                  {item.specialInstructions && (
                    <p className="text-xs text-gray-500 mt-1">
                      Note: {item.specialInstructions}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ${item.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Details */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Delivery Details</h4>
          
          <div className="flex space-x-3 mb-3">
            <button
              onClick={() => setDeliveryMethod('delivery')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                deliveryMethod === 'delivery'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <IoCarOutline className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Delivery</span>
            </button>
            <button
              onClick={() => setDeliveryMethod('pickup')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                deliveryMethod === 'pickup'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <IoWalkOutline className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Pickup</span>
            </button>
          </div>
          
          {deliveryMethod === 'delivery' && (
            <div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Delivery address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Estimated delivery: {selectedRestaurant.deliveryTime}-{selectedRestaurant.deliveryTime + 10} min
              </p>
            </div>
          )}
        </div>

        {/* Payment Method */}
        {showRoomCharge && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
            <div className="space-y-2">
              {isAtHotel && (
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
                  <input
                    type="radio"
                    value="roomCharge"
                    checked={paymentMethod === 'roomCharge'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'roomCharge')}
                    className="text-green-600"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Charge to Room {roomNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      Bill to your hotel room
                    </p>
                  </div>
                </label>
              )}
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                  className="text-green-600"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Credit Card
                  </p>
                  <p className="text-xs text-gray-500">
                    Pay with card on file
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Tip Selection (Delivery only) */}
        {deliveryMethod === 'delivery' && (
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
            <p className="text-xs text-gray-500 mt-2">
              Tip amount: ${(totals.subtotal * tipAmount / 100).toFixed(2)}
            </p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">${totals.subtotal.toFixed(2)}</span>
            </div>
            {deliveryMethod === 'delivery' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-900">${totals.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tip ({tipAmount}%)</span>
                  <span className="text-gray-900">${totals.tip.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">${totals.tax.toFixed(2)}</span>
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

        {/* Place Order Button */}
        <button
          onClick={placeOrder}
          disabled={isLoading || !address}
          className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
        >
          {isLoading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    )
  }

  // Menu view with item customization
  if (selectedItem) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Customize Item</h3>
          <button
            onClick={() => {
              setSelectedItem(null)
              setItemQuantity(1)
              setItemCustomizations({})
              setSpecialInstructions('')
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">{selectedItem.name}</h4>
          <p className="text-sm text-gray-600 mb-4">{selectedItem.description}</p>
          
          {/* Dietary Info */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedItem.vegetarian && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <IoLeafOutline className="mr-1" />
                Vegetarian
              </span>
            )}
            {selectedItem.vegan && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <IoLeafOutline className="mr-1" />
                Vegan
              </span>
            )}
            {selectedItem.glutenFree && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Gluten Free
              </span>
            )}
            {selectedItem.spicy && selectedItem.spicy > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                <IoFlameOutline className="mr-1" />
                {'🌶'.repeat(selectedItem.spicy)}
              </span>
            )}
            {selectedItem.calories && (
              <span className="text-xs text-gray-500">
                {selectedItem.calories} cal
              </span>
            )}
          </div>
        </div>

        {/* Customizations */}
        {selectedItem.customizations && selectedItem.customizations.length > 0 && (
          <div className="mb-6">
            {selectedItem.customizations.map(customization => (
              <div key={customization.id} className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">
                  {customization.name}
                  {customization.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h5>
                <div className="space-y-2">
                  {customization.options.map(option => (
                    <label
                      key={option.id}
                      className="flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-green-500"
                    >
                      <div className="flex items-center">
                        <input
                          type={customization.maxSelections === 1 ? 'radio' : 'checkbox'}
                          name={customization.id}
                          value={option.id}
                          checked={itemCustomizations[customization.id]?.includes(option.id) || false}
                          onChange={(e) => {
                            if (customization.maxSelections === 1) {
                              setItemCustomizations({
                                ...itemCustomizations,
                                [customization.id]: [option.id]
                              })
                            } else {
                              const current = itemCustomizations[customization.id] || []
                              if (e.target.checked) {
                                if (current.length < customization.maxSelections) {
                                  setItemCustomizations({
                                    ...itemCustomizations,
                                    [customization.id]: [...current, option.id]
                                  })
                                }
                              } else {
                                setItemCustomizations({
                                  ...itemCustomizations,
                                  [customization.id]: current.filter(id => id !== option.id)
                                })
                              }
                            }
                          }}
                          className="text-green-600"
                        />
                        <span className="ml-3 text-sm text-gray-900">{option.name}</span>
                      </div>
                      {option.price > 0 && (
                        <span className="text-sm text-gray-600">
                          +${option.price.toFixed(2)}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Special Instructions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
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

        {/* Quantity Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Quantity
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors"
            >
              <IoRemoveOutline className="w-5 h-5" />
            </button>
            <span className="text-xl font-semibold text-gray-900 w-12 text-center">
              {itemQuantity}
            </span>
            <button
              onClick={() => setItemQuantity(itemQuantity + 1)}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors"
            >
              <IoAddOutline className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={addToCart}
          className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
        >
          <span>Add to Cart</span>
          <span className="ml-2">•</span>
          <span className="ml-2">${calculateItemTotal().toFixed(2)}</span>
        </button>
      </div>
    )
  }

  // Restaurant menu view
  if (orderStage === 'menu' && selectedRestaurant) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        {/* Restaurant Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setOrderStage('browse')
                setSelectedRestaurant(null)
                setCart([])
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to restaurants
            </button>
            {selectedRestaurant.partnerHotel && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <IoBedOutline className="mr-1" />
                Hotel Partner
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedRestaurant.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <IoStarOutline className="w-4 h-4 text-amber-500 fill-current mr-1" />
              <span>{selectedRestaurant.rating} ({selectedRestaurant.reviews} reviews)</span>
            </div>
            <div className="flex items-center">
              <IoTimerOutline className="w-4 h-4 mr-1" />
              <span>{selectedRestaurant.deliveryTime} min</span>
            </div>
            <div className="flex items-center">
              <IoCarOutline className="w-4 h-4 mr-1" />
              <span>${selectedRestaurant.deliveryFee} delivery</span>
            </div>
          </div>
        </div>

        {/* Menu Categories */}
        <div className="p-6">
          {selectedRestaurant.categories.map(category => (
            <div key={category.id} className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-4">{category.name}</h4>
              <div className="space-y-4">
                {category.items.map(item => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          {item.popular && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        
                        <div className="flex items-center space-x-3 mt-2">
                          {item.vegetarian && (
                            <IoLeafOutline className="w-4 h-4 text-green-600" title="Vegetarian" />
                          )}
                          {item.spicy && item.spicy > 0 && (
                            <span className="text-red-500" title="Spicy">
                              {'🌶'.repeat(item.spicy)}
                            </span>
                          )}
                          {item.calories && (
                            <span className="text-xs text-gray-500">{item.calories} cal</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <p className="text-lg font-semibold text-gray-900">
                          ${item.price.toFixed(2)}
                        </p>
                        <button className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Cart */}
        {cart.length > 0 && (
          <div className="sticky bottom-0 p-4 bg-white border-t border-gray-200 shadow-lg">
            <button
              onClick={() => setOrderStage('checkout')}
              className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition-colors flex items-center justify-between px-6"
            >
              <span className="flex items-center">
                <IoCartOutline className="w-5 h-5 mr-2" />
                View Cart ({cart.length} items)
              </span>
              <span>${calculateOrderTotals().subtotal.toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  // Main browse view
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Order Food</h3>
        {isAtHotel && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <IoBedOutline className="mr-1" />
            Room Service Available
          </span>
        )}
      </div>

      {/* Delivery Address */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Delivery Address
        </label>
        <div className="relative">
          <IoLocationOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter delivery address"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <IoSearchOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants or cuisine"
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Cuisine Filters */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {cuisineTypes.map(cuisine => {
            const Icon = cuisine.icon
            return (
              <button
                key={cuisine.id}
                onClick={() => setSelectedCuisine(cuisine.id)}
                className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCuisine === cuisine.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="text-sm">{cuisine.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurants...</p>
        </div>
      )}

      {/* Restaurant List */}
      {!isLoading && getFilteredRestaurants().length > 0 && (
        <div className="space-y-4">
          {getFilteredRestaurants().map(restaurant => (
            <div
              key={restaurant.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
              onClick={() => {
                setSelectedRestaurant(restaurant)
                setOrderStage('menu')
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{restaurant.name}</h4>
                    {restaurant.popular && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        <IoTrendingUp className="mr-0.5" />
                        Popular
                      </span>
                    )}
                    {restaurant.partnerHotel && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Partner
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <IoStarOutline className="w-4 h-4 text-amber-500 fill-current mr-1" />
                      <span>{restaurant.rating} ({restaurant.reviews})</span>
                    </div>
                    <span>•</span>
                    <span>{restaurant.cuisine.join(', ')}</span>
                    <span>•</span>
                    <span>{restaurant.distance} mi</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <IoTimerOutline className="w-4 h-4 mr-1" />
                      <span>{restaurant.deliveryTime} min</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <IoCarOutline className="w-4 h-4 mr-1" />
                      <span>${restaurant.deliveryFee} delivery</span>
                    </div>
                    {restaurant.minimumOrder > 0 && (
                      <div className="flex items-center text-gray-600">
                        <IoBagCheckOutline className="w-4 h-4 mr-1" />
                        <span>${restaurant.minimumOrder} min</span>
                      </div>
                    )}
                  </div>
                  
                  {restaurant.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {restaurant.tags.map(tag => (
                        <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <IoChevronForwardOutline className="w-5 h-5 text-gray-400 ml-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && getFilteredRestaurants().length === 0 && (
        <div className="text-center py-8">
          <IoRestaurantOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No restaurants found</p>
          <button
            onClick={() => {
              setSelectedCuisine('all')
              setSearchQuery('')
            }}
            className="mt-4 text-green-600 hover:text-green-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
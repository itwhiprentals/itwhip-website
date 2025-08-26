// app/(guest)/rentals/components/CarTypeData.ts
// Configuration and data for car type showcase

export interface CarType {
  id: string
  type: string
  label: string
  tagline: string
  image: string
  sceneImage: string
  gradient: string
  accentColor: string
  price: string
  priceValue: number
  description: string
  available: number
  features: string[]
  badge?: string
  popular?: boolean
}

export const carTypes: CarType[] = [
  {
    id: 'economy',
    type: 'economy',
    label: 'Economy',
    tagline: 'Budget-Friendly Options',
    image: '', // Removed car image
    sceneImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&h=900&fit=crop',
    gradient: 'from-green-400 to-blue-500',
    accentColor: 'green',
    price: 'From $45/day',
    priceValue: 45,
    description: 'Explore our selection of fuel-efficient compact cars',
    available: 89,
    features: ['38+ MPG', 'Compact', 'Easy Parking'],
    badge: 'Best Value',
    popular: true
  },
  {
    id: 'suv',
    type: 'suv',
    label: 'SUV',
    tagline: 'Spacious & Versatile',
    image: '', // Removed car image
    sceneImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1600&h=900&fit=crop',
    gradient: 'from-orange-400 to-red-500',
    accentColor: 'orange',
    price: 'From $65/day',
    priceValue: 65,
    description: 'Browse our collection of family-friendly SUVs',
    available: 67,
    features: ['7 Seats', 'AWD Available', 'Large Cargo'],
    badge: 'Family Choice'
  },
  {
    id: 'luxury',
    type: 'luxury',
    label: 'Luxury',
    tagline: 'Premium Selection',
    image: '', // Removed car image
    sceneImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&h=900&fit=crop',
    gradient: 'from-purple-600 to-pink-600',
    accentColor: 'purple',
    price: 'From $125/day',
    priceValue: 125,
    description: 'View our premium and luxury vehicle collection',
    available: 34,
    features: ['Premium Audio', 'Leather Seats', 'Sport Mode'],
    badge: 'Premium'
  },
  {
    id: 'convertible',
    type: 'convertible',
    label: 'Convertible',
    tagline: 'Open-Air Experience',
    image: '', // Removed car image
    sceneImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&h=900&fit=crop',
    gradient: 'from-yellow-400 to-orange-500',
    accentColor: 'yellow',
    price: 'From $95/day',
    priceValue: 95,
    description: 'See all available convertibles for your Phoenix adventure',
    available: 23,
    features: ['Open Top', 'Sport Design', 'Premium Sound'],
    badge: 'Phoenix Favorite',
    popular: true
  },
  {
    id: 'electric',
    type: 'electric',
    label: 'Electric',
    tagline: 'Eco-Friendly Fleet',
    image: '', // Removed car image
    sceneImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1600&h=900&fit=crop',
    gradient: 'from-cyan-400 to-blue-600',
    accentColor: 'cyan',
    price: 'From $85/day',
    priceValue: 85,
    description: 'Discover our range of electric and hybrid vehicles',
    available: 45,
    features: ['Autopilot', 'Fast Charging', '300+ Range'],
    badge: 'Eco Choice'
  },
  {
    id: 'minivan',
    type: 'minivan',
    label: 'Minivan',
    tagline: 'Group Transportation',
    image: '', // Removed car image
    sceneImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&h=900&fit=crop',
    gradient: 'from-indigo-400 to-purple-500',
    accentColor: 'indigo',
    price: 'From $75/day',
    priceValue: 75,
    description: 'Find the perfect minivan for your group travel needs',
    available: 28,
    features: ['8 Seats', 'Entertainment', 'Easy Access']
  }
]
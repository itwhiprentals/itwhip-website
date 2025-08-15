import type {
    FlightPrediction,
    TrafficRoute,
    DriverPosition,
    GroupMember,
    PriceComparison
  } from '../types'
  
  // API Endpoints
  export const API_ENDPOINTS = {
    testFlight: 'https://testflight.apple.com/join/ygzsQbNf',
    websiteUrl: 'https://itwhip.com',
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.itwhip.com'
  }
  
  // App Configuration
  export const APP_CONFIG = {
    tickerRotationInterval: 5000, // 5 seconds
    surgeUpdateInterval: 30000, // 30 seconds
    statsUpdateInterval: 10000, // 10 seconds
    surgePredictionInterval: 300000, // 5 minutes
    defaultDistanceMiles: 15,
    driverMinimumFare: 15,
    platformFeePercentage: 0.20, // 20% platform fee
    savingsPercentage: 0.35, // 35% average savings
  }
  
  // Initial Flight Predictions Data
  export const initialFlightPredictions: FlightPrediction[] = [
    {
      flightNumber: 'AA123',
      from: 'Dallas (DFW)',
      scheduled: '3:45 PM',
      delayProbability: 67,
      surgePrediction: 2.3,
      status: 'High delay risk - Pattern match'
    },
    {
      flightNumber: 'SW456',
      from: 'Denver (DEN)',
      scheduled: '4:15 PM',
      delayProbability: 15,
      surgePrediction: 1.2,
      status: 'On time'
    },
    {
      flightNumber: 'UA789',
      from: 'Chicago (ORD)',
      scheduled: '4:30 PM',
      delayProbability: 45,
      surgePrediction: 1.8,
      status: 'Moderate delay risk'
    },
    {
      flightNumber: 'DL321',
      from: 'Los Angeles (LAX)',
      scheduled: '5:00 PM',
      delayProbability: 89,
      surgePrediction: 3.1,
      status: 'Delayed - Weather at origin'
    }
  ]
  
  // Initial Traffic Routes Data
  export const initialTrafficRoutes: TrafficRoute[] = [
    { 
      route: 'I-10 Eastbound', 
      status: 'heavy', 
      delay: 30, 
      alternative: 'Use Loop 202' 
    },
    { 
      route: 'Loop 202', 
      status: 'clear', 
      delay: 0 
    },
    { 
      route: 'Loop 101', 
      status: 'moderate', 
      delay: 15 
    },
    { 
      route: 'SR-143', 
      status: 'clear', 
      delay: 0 
    }
  ]
  
  // Initial Drivers Positioned Data
  export const initialDriversPositioned: DriverPosition[] = [
    { id: '1', name: 'John S.', terminal: 4, status: 'positioned' },
    { id: '2', name: 'Maria G.', terminal: 3, status: 'positioned' },
    { id: '3', name: 'Mike D.', terminal: 4, status: 'enroute', eta: 5 },
    { id: '4', name: 'Sarah L.', terminal: 2, status: 'positioned' },
    { id: '5', name: 'Tom W.', terminal: 4, status: 'available' }
  ]
  
  // Initial Group Members Data
  export const initialGroupMembers: GroupMember[] = [
    { id: '1', name: 'Mike', flight: 'AA123', arrival: '3:45 PM', terminal: 4 },
    { id: '2', name: 'Dave', flight: 'SW456', arrival: '4:15 PM', terminal: 2 },
    { id: '3', name: 'John', flight: 'UA789', arrival: '4:30 PM', terminal: 3 }
  ]
  
  // Price Comparison Options
  export const compareOptions: PriceComparison[] = [
    { 
      service: 'Independent Drivers', 
      price: '$22-28', 
      time: '2-5 min', 
      available: true 
    },
    { 
      service: 'Current Market Rate', 
      price: '$45-67', 
      time: 'Varies', 
      available: true 
    },
    { 
      service: 'Parking (3 days)', 
      price: '$54', 
      time: 'Walk to terminal', 
      available: true 
    },
    { 
      service: 'Shuttle Service', 
      price: '$35', 
      time: '15-20 min wait', 
      available: true 
    },
    { 
      service: 'Rental Car (1 day)', 
      price: '$89', 
      time: '30 min process', 
      available: false 
    }
  ]
  
  // Service Areas
  export const serviceAreas = [
    'Phoenix Sky Harbor',
    'Scottsdale',
    'Tempe',
    'Mesa',
    'Chandler',
    'Glendale',
    'Paradise Valley',
    'Gilbert',
    'Peoria',
    'Surprise',
    'Goodyear',
    'Avondale'
  ]
  
  // Footer Links
  export const footerLinks = {
    platform: [
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Track Flights', href: '/flights' },
      { label: 'Connect with Drivers', href: '/drivers' },
      { label: 'Airport Guide', href: '/airport-guide' },
      { label: 'Surge Calendar', href: '/surge-calendar' }
    ],
    drivers: [
      { label: 'Apply to Drive', href: '/drive' },
      { label: 'Driver Portal', href: '/driver-portal' },
      { label: 'Requirements', href: '/driver-requirements' },
      { label: 'Earnings Calculator', href: '/earnings' },
      { label: 'Driver Support', href: '/driver-support' }
    ],
    legal: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Platform Agreement', href: '/platform-agreement' },
      { label: 'Driver Agreement', href: '/driver-agreement' },
      { label: 'Contact Us', href: '/contact' }
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Safety', href: '/safety' },
      { label: 'Accessibility', href: '/accessibility' },
      { label: 'Blog', href: '/blog' },
      { label: 'Press', href: '/press' }
    ]
  }
  
  // Social Media Links
  export const socialLinks = {
    facebook: 'https://facebook.com/itwhip',
    twitter: 'https://twitter.com/itwhip',
    instagram: 'https://instagram.com/itwhip',
    linkedin: 'https://linkedin.com/company/itwhip'
  }
  
  // How It Works Steps
  export const howItWorksSteps = [
    {
      step: '1',
      title: 'Track Your Flight',
      description: 'Real-time flight tracking and delay predictions',
      iconName: 'airplane'
    },
    {
      step: '2',
      title: 'Check Surge Predictions',
      description: 'AI-powered surge forecasting up to 6 hours ahead',
      iconName: 'analytics'
    },
    {
      step: '3',
      title: 'Connect with Drivers',
      description: 'Independent drivers set their own competitive rates',
      iconName: 'people'
    },
    {
      step: '4',
      title: 'Choose Your Option',
      description: 'Select based on price, time, and driver rating',
      iconName: 'checkmark'
    }
  ]
  
  // Driver Benefits
  export const driverBenefits = [
    'Keep 80% of fares - we only take 20% platform fee',
    'YOU set your own prices (we just suggest)',
    'Get flight data 3 hours in advance',
    'Instant approval with platform verification'
  ]
  
  // SEO & Meta Data
  export const seoData = {
    title: 'ItWhip - Beat Airport Surge Pricing | Independent Driver Platform',
    description: 'Connect with independent drivers at Phoenix Sky Harbor. Save 30-40% vs surge pricing. Real-time flight tracking, surge predictions, and guaranteed fair rates.',
    keywords: 'airport rides, Phoenix Sky Harbor, surge pricing, independent drivers, rideshare alternative, airport transportation, PHX airport',
    ogImage: 'https://itwhip.com/og-image.jpg',
    twitterHandle: '@itwhip'
  }
  
  // Pattern Recognition Events
  export const patternEvents = [
    {
      icon: 'analytics',
      title: 'Friday',
      description: '2.3x likely',
      color: '#3b82f6'
    },
    {
      icon: 'construct',
      title: 'I-10 Work',
      description: 'Delays',
      color: '#f59e0b'
    },
    {
      icon: 'basketball',
      title: 'Suns Game',
      description: '7PM surge',
      color: '#a855f7'
    },
    {
      icon: 'cloud',
      title: 'Dust Storm',
      description: '3PM alert',
      color: '#ef4444'
    }
  ]
  
  // Animation Durations (in ms)
  export const animations = {
    tickerScroll: 15000,
    fadeIn: 200,
    slideIn: 300,
    modalOpen: 150,
    themeTransition: 200
  }
  
  // Breakpoints for responsive design
  export const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }
  
  // Color Palette
  export const colors = {
    surge: {
      critical: '#dc2626',
      warning: '#d97706',
      info: '#2563eb'
    },
    traffic: {
      heavy: '#ef4444',
      moderate: '#f59e0b',
      clear: '#10b981'
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  }
  
  // First 100 Drivers Promotion
  export const driverPromotion = {
    totalSpots: 100,
    spotsLeft: 23,
    percentageFilled: 77,
    averageEarnings: '$28-35/hr',
    platformFee: 20,
    keepPercentage: 80
  }
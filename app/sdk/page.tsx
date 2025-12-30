// app/sdk/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import { 
  IoCodeSlashOutline,
  IoServerOutline,
  IoShieldCheckmarkOutline,
  IoTerminalOutline,
  IoGitBranchOutline,
  IoCloudOutline,
  IoKeyOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoLockClosedOutline,
  IoRocketOutline,
  IoTimeOutline,
  IoCopyOutline,
  IoChevronForwardOutline,
  IoDownloadOutline,
  IoLogoGithub,
  IoConstructOutline,
  IoCloseOutline,
  IoLayersOutline,
  IoFlashOutline,
  IoAnalyticsOutline,
  IoNotificationsOutline,
  IoBuildOutline,
  IoSpeedometerOutline,
  IoGlobeOutline,
  IoWalletOutline,
  IoCarOutline,
  IoAirplaneOutline,
  IoPeopleOutline
} from 'react-icons/io5'

export default function SDKPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [gdsCode, setGdsCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [copySuccess, setCopySuccess] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    window.location.href = '/portal/login'
  }

  // Simulate API response time tracking
  const [apiLatency] = useState({
    p50: '127ms',
    p95: '243ms',
    p99: '512ms'
  })

  // Live metrics simulation
  const [liveMetrics, setLiveMetrics] = useState({
    activeRides: 342,
    driversOnline: 127,
    avgWaitTime: '4.2',
    requestsPerMin: 89
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        activeRides: prev.activeRides + Math.floor(Math.random() * 10 - 5),
        driversOnline: prev.driversOnline + Math.floor(Math.random() * 6 - 3),
        avgWaitTime: (3 + Math.random() * 3).toFixed(1),
        requestsPerMin: Math.floor(80 + Math.random() * 30)
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopySuccess(label)
    setTimeout(() => setCopySuccess(''), 2000)
  }

  const handleGDSSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsValidating(true)
    
    // Simulate validation
    setTimeout(() => {
      window.location.href = '/portal/dashboard'
    }, 1500)
  }

  const codeExamples = {
    javascript: {
      install: 'npm install @itwhip/rental-sdk',
      initialize: `import { ItWhipSDK } from '@itwhip/rental-sdk';

const sdk = new ItWhipSDK({
  apiKey: process.env.ITWHIP_API_KEY,
  apiSecret: process.env.ITWHIP_API_SECRET,
  hostId: process.env.HOST_ID,
  environment: 'production'
});

// Initialize connection
await sdk.initialize();`,
      booking: `// Create a rental booking
const booking = await sdk.rentals.create({
  renterProfile: {
    userId: 'RENTER-123456',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1-480-555-0123',
    driversLicense: 'DL-AZ-123456'
  },
  rental: {
    vehicleId: 'VEH-789',
    pickupLocation: 'host_address',
    startDate: '2024-01-15T10:00:00Z',
    endDate: '2024-01-18T10:00:00Z',
    vehicleClass: 'standard',
    insurance: 'basic'
  },
  billing: {
    method: 'card',
    paymentMethodId: 'pm_xyz789',
    splitPayment: null
  }
});

console.log('Booking confirmed:', booking.confirmationCode);
// Output: Booking confirmed: WHIP-2024-ABCD1234`,
      tracking: `// Real-time rental tracking
sdk.rentals.track(booking.id, (update) => {
  console.log('Vehicle location:', update.location);
  console.log('Rental status:', update.status);
  console.log('Mileage:', update.currentMileage);

  // Notify renter of pickup reminder
  if (update.status === 'ready_for_pickup') {
    notifyRenter(booking.renterPhone, 'Your vehicle is ready for pickup!');
  }
});`,
      vehicleAvailability: `// Check vehicle availability
const available = await sdk.vehicles.checkAvailability({
  vehicleId: 'VEH-789',
  startDate: '2024-01-15T10:00:00Z',
  endDate: '2024-01-18T10:00:00Z'
});

// Get pricing for the rental period
const pricing = await sdk.vehicles.getPricing({
  vehicleId: 'VEH-789',
  days: 3,
  insurance: 'premium'
});

console.log('Available:', available.isAvailable);
console.log('Total price:', pricing.total);`
    },
    python: {
      install: 'pip install itwhip-sdk',
      initialize: `from itwhip import ItWhipSDK
import os

sdk = ItWhipSDK(
    api_key=os.environ['ITWHIP_API_KEY'],
    api_secret=os.environ['ITWHIP_API_SECRET'],
    host_id=os.environ['HOST_ID'],
    environment='production'
)

# Initialize connection
await sdk.initialize()`,
      booking: `# Create a rental booking
booking = await sdk.rentals.create({
    'renter_profile': {
        'user_id': 'RENTER-123456',
        'name': 'John Smith',
        'email': 'john@example.com',
        'phone': '+1-480-555-0123',
        'drivers_license': 'DL-AZ-123456'
    },
    'rental': {
        'vehicle_id': 'VEH-789',
        'pickup_location': 'host_address',
        'start_date': '2024-01-15T10:00:00Z',
        'end_date': '2024-01-18T10:00:00Z',
        'vehicle_class': 'standard',
        'insurance': 'basic'
    },
    'billing': {
        'method': 'card',
        'payment_method_id': 'pm_xyz789',
        'split_payment': None
    }
})

print(f'Booking confirmed: {booking.confirmation_code}')
# Output: Booking confirmed: WHIP-2024-ABCD1234`,
      tracking: `# Real-time rental tracking
def handle_update(update):
    print(f'Vehicle location: {update["location"]}')
    print(f'Rental status: {update["status"]}')
    print(f'Mileage: {update["current_mileage"]}')

    # Notify renter of pickup reminder
    if update["status"] == 'ready_for_pickup':
        notify_renter(booking.renter_phone, 'Your vehicle is ready for pickup!')

sdk.rentals.track(booking.id, handle_update)`,
      vehicleAvailability: `# Check vehicle availability
available = await sdk.vehicles.check_availability({
    'vehicle_id': 'VEH-789',
    'start_date': '2024-01-15T10:00:00Z',
    'end_date': '2024-01-18T10:00:00Z'
})

# Get pricing for the rental period
pricing = await sdk.vehicles.get_pricing({
    'vehicle_id': 'VEH-789',
    'days': 3,
    'insurance': 'premium'
})

print(f'Available: {available.is_available}')
print(f'Total price: {pricing.total}')`
    },
    php: {
      install: 'composer require itwhip/rental-sdk',
      initialize: `<?php
require_once 'vendor/autoload.php';

use ItWhip\\RentalSDK;

$sdk = new RentalSDK([
    'apiKey' => $_ENV['ITWHIP_API_KEY'],
    'apiSecret' => $_ENV['ITWHIP_API_SECRET'],
    'hostId' => $_ENV['HOST_ID'],
    'environment' => 'production'
]);

// Initialize connection
$sdk->initialize();`,
      booking: `// Create a rental booking
$booking = $sdk->rentals->create([
    'renterProfile' => [
        'userId' => 'RENTER-123456',
        'name' => 'John Smith',
        'email' => 'john@example.com',
        'phone' => '+1-480-555-0123',
        'driversLicense' => 'DL-AZ-123456'
    ],
    'rental' => [
        'vehicleId' => 'VEH-789',
        'pickupLocation' => 'host_address',
        'startDate' => '2024-01-15T10:00:00Z',
        'endDate' => '2024-01-18T10:00:00Z',
        'vehicleClass' => 'standard',
        'insurance' => 'basic'
    ],
    'billing' => [
        'method' => 'card',
        'paymentMethodId' => 'pm_xyz789',
        'splitPayment' => null
    ]
]);

echo "Booking confirmed: " . $booking->confirmationCode;
// Output: Booking confirmed: WHIP-2024-ABCD1234`,
      tracking: `// Real-time rental tracking
$sdk->rentals->track($booking->id, function($update) use ($booking) {
    echo "Vehicle location: " . $update->location . PHP_EOL;
    echo "Rental status: " . $update->status . PHP_EOL;
    echo "Mileage: " . $update->currentMileage . PHP_EOL;

    // Notify renter of pickup reminder
    if ($update->status === 'ready_for_pickup') {
        notifyRenter($booking->renterPhone, 'Your vehicle is ready for pickup!');
    }
});`,
      vehicleAvailability: `// Check vehicle availability
$available = $sdk->vehicles->checkAvailability([
    'vehicleId' => 'VEH-789',
    'startDate' => '2024-01-15T10:00:00Z',
    'endDate' => '2024-01-18T10:00:00Z'
]);

// Get pricing for the rental period
$pricing = $sdk->vehicles->getPricing([
    'vehicleId' => 'VEH-789',
    'days' => 3,
    'insurance' => 'premium'
]);

echo "Available: " . ($available->isAvailable ? 'Yes' : 'No') . PHP_EOL;
echo "Total price: $" . $pricing->total . PHP_EOL;`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Main Header Component with Full Navigation */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />

      {/* Page Title Section - Below Header */}
      <div className="mt-14 md:mt-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoCodeSlashOutline className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  ItWhip Rental SDK
                </h1>
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full font-mono">
                  v3.14.2
                </span>
              </div>
            </div>

            {/* Desktop Quick Links */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/developers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                API Reference
              </Link>
              <Link href="/integrations" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Integrations
              </Link>
              <Link href="/host-dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Host Dashboard
              </Link>
              <Link href="https://github.com" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <IoLogoGithub className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Dashboard Access
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Sticky Quick Navigation - Mobile Only */}
      <div className="md:hidden sticky top-14 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          {/* Scrollable Quick Links Container */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <Link 
                href="/developers" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoDocumentTextOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">API Docs</span>
              </Link>
              <Link 
                href="/integrations" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoLayersOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Integrations</span>
              </Link>
              <Link 
                href="/gds" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoServerOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">GDS Specs</span>
              </Link>
              {/* Dashboard Access - Part of scrollable area */}
              <button 
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoKeyOutline className="w-4 h-4 flex-shrink-0" />
                <span>Dashboard Access</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Selector - Connected to nav above */}
      <div className="lg:hidden sticky top-[94px] z-40 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-2">
          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">
            SDK Section
          </label>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-no-repeat bg-right pr-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="overview">Overview</option>
            <option value="quickstart">Quick Start</option>
            <option value="authentication">Authentication</option>
            <option value="endpoints">Endpoints</option>
            <option value="webhooks">Webhooks</option>
            <option value="errors">Error Handling</option>
            <option value="changelog">Changelog</option>
          </select>
        </div>
      </div>

      {/* Live Platform Metrics Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto">
            <div className="flex items-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="whitespace-nowrap">Live Platform Status</span>
              </div>
              <div className="flex items-center space-x-1">
                <IoCarOutline className="w-4 h-4" />
                <span className="font-mono">{liveMetrics.activeRides}</span>
                <span className="opacity-75">active rides</span>
              </div>
              <div className="flex items-center space-x-1">
                <IoSpeedometerOutline className="w-4 h-4" />
                <span className="font-mono">{liveMetrics.avgWaitTime}min</span>
                <span className="opacity-75">avg wait</span>
              </div>
              <div className="flex items-center space-x-1">
                <IoFlashOutline className="w-4 h-4" />
                <span className="font-mono">{liveMetrics.requestsPerMin}/min</span>
                <span className="opacity-75">API calls</span>
              </div>
              <div className="flex items-center space-x-1">
                <IoPeopleOutline className="w-4 h-4" />
                <span className="font-mono">{liveMetrics.driversOnline}</span>
                <span className="opacity-75">drivers online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <IoRocketOutline className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Instant Ride SDK™
              </h2>
            </div>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
              Enterprise-grade transportation integration for Global Distribution Systems (GDS) and Property Management Systems (PMS)
            </p>
          </div>

          {/* Key Metrics - Mobile Optimized */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto mt-6 md:mt-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 md:p-4 border border-gray-200 dark:border-gray-800">
              <div className="text-xl md:text-2xl font-mono font-bold text-gray-900 dark:text-white">99.97%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">API Uptime SLA</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 md:p-4 border border-gray-200 dark:border-gray-800">
              <div className="text-xl md:text-2xl font-mono font-bold text-gray-900 dark:text-white">127ms</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Response</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 md:p-4 border border-gray-200 dark:border-gray-800">
              <div className="text-xl md:text-2xl font-mono font-bold text-gray-900 dark:text-white">2.5M+</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Daily API Calls</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 md:p-4 border border-gray-200 dark:border-gray-800">
              <div className="text-xl md:text-2xl font-mono font-bold text-gray-900 dark:text-white">487</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Active Hosts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation - Desktop Only */}
      <div className="hidden lg:block bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {['overview', 'quickstart', 'authentication', 'endpoints', 'webhooks', 'errors', 'changelog'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* Quick Links */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-2">
                      <IoDownloadOutline className="w-4 h-4" />
                      <span>Download SDK</span>
                    </a>
                  </li>
                  <li>
                    <a href="/developers" className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-2">
                      <IoDocumentTextOutline className="w-4 h-4" />
                      <span>API Documentation</span>
                    </a>
                  </li>
                  <li>
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-2"
                    >
                      <IoKeyOutline className="w-4 h-4" />
                      <span>Get API Keys</span>
                    </button>
                  </li>
                  <li>
                    <a href="/status" className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-2">
                      <IoAnalyticsOutline className="w-4 h-4" />
                      <span>API Status Page</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Status */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-sm font-semibold text-green-900 dark:text-green-300">System Status</h3>
                </div>
                <p className="text-xs text-green-800 dark:text-green-400">All systems operational</p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">API Gateway</span>
                    <span className="text-green-600">Healthy</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">GDS Bridge</span>
                    <span className="text-green-600">Connected</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Webhooks</span>
                    <span className="text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Flight Tracking</span>
                    <span className="text-green-600">Online</span>
                  </div>
                </div>
              </div>

              {/* Language Selector */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Code Examples</h3>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="javascript">JavaScript/Node.js</option>
                  <option value="python">Python</option>
                  <option value="php">PHP</option>
                </select>
              </div>

              {/* Support */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Need Integration Support?</h3>
                <p className="text-xs text-blue-800 dark:text-blue-400 mb-3">
                  Our integration team is available 24/7 for enterprise partners.
                </p>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full text-xs px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Access Partner Portal
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3 space-y-6 md:space-y-8">
            {/* Mobile Quick Links - Only show on mobile */}
            <div className="lg:hidden bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <a href="#" className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <IoDownloadOutline className="w-4 h-4" />
                  <span>Download SDK</span>
                </a>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <IoKeyOutline className="w-4 h-4" />
                  <span>Get API Keys</span>
                </button>
              </div>
              {/* Language Selector Mobile */}
              <div className="mt-3">
                <label className="text-xs text-gray-500 dark:text-gray-400">Code Language:</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="javascript">JavaScript/Node.js</option>
                  <option value="python">Python</option>
                  <option value="php">PHP</option>
                </select>
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                {/* Overview Section */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
                      The ItWhip Instant Ride SDK™ provides seamless integration between Global Distribution Systems (GDS), 
                      Property Management Systems (PMS), and our luxury transportation network. Built for enterprise-scale 
                      deployments with support for Amadeus, Sabre, and Travelport.
                    </p>
                    
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Key Features</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start space-x-2">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Real-time availability and instant booking confirmation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Automatic guest profile synchronization with PMS</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Direct billing to room folios and corporate accounts</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Flight tracking and automatic schedule adjustments</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Multi-property and chain-wide deployment support</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Revenue sharing program with transparent reporting</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>White-label options for branded experiences</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Architecture Diagram */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">System Architecture</h2>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 md:p-8 text-center">
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 md:p-4 inline-block">
                        <span className="text-xs md:text-sm font-mono text-gray-700 dark:text-gray-300">Property Management System</span>
                      </div>
                      <div className="text-gray-400 text-sm">↓ HTTPS/REST ↓</div>
                      <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 md:p-4 inline-block">
                        <span className="text-xs md:text-sm font-mono text-blue-700 dark:text-blue-300">ItWhip SDK Gateway</span>
                      </div>
                      <div className="text-gray-400 text-sm">↓ WebSocket ↓</div>
                      <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3 md:p-4 inline-block">
                        <span className="text-xs md:text-sm font-mono text-green-700 dark:text-green-300">Transportation Network</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Integration Partners */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Certified Integrations</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                    {['Stripe', 'Plaid', 'Veriff', 'Checkr', 'Twilio', 'SendGrid', 'Cloudinary', 'Mapbox', 'CalTrack GPS', 'Bouncie', 'Zubie', 'Samsara'].map((partner) => (
                      <div key={partner} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 md:p-3 text-center">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{partner}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revenue Model */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 md:p-6 border border-green-200 dark:border-green-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <IoWalletOutline className="w-6 h-6 mr-2 text-green-600" />
                    Revenue Sharing Model
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Property Benefits</h3>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Earn 15-25% commission per ride</li>
                        <li>• No setup or monthly fees</li>
                        <li>• Real-time revenue dashboard</li>
                        <li>• Monthly direct deposits</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Average Monthly Earnings</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">100-room property:</span>
                          <span className="font-mono font-bold text-green-600">$8,500/mo</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">200-room property:</span>
                          <span className="font-mono font-bold text-green-600">$18,200/mo</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">500+ room property:</span>
                          <span className="font-mono font-bold text-green-600">$47,000/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="text-sm text-green-700 dark:text-green-300 font-semibold hover:text-green-800"
                    >
                      View your property's revenue potential →
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'quickstart' && (
              <>
                {/* Installation */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Start Guide</h2>
                  
                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Step 1: Install the SDK
                      </h3>
                      <div className="bg-gray-900 dark:bg-black rounded-lg p-3 md:p-4 relative overflow-hidden">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          <code>{selectedLanguage === 'javascript' ? 
`npm install @itwhip/instant-ride-sdk

# or using yarn
yarn add @itwhip/instant-ride-sdk

# or using CDN
<script src="https://sdk.itwhip.com/v3/instant-ride.min.js"></script>` :
selectedLanguage === 'python' ?
`pip install itwhip-sdk

# or using poetry
poetry add itwhip-sdk

# or using requirements.txt
echo "itwhip-sdk>=3.14.0" >> requirements.txt
pip install -r requirements.txt` :
`composer require itwhip/instant-ride-sdk

# or add to composer.json
{
  "require": {
    "itwhip/instant-ride-sdk": "^3.14"
  }
}`
                          }</code>
                        </pre>
                        <button 
                          onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].install, 'install')}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          {copySuccess === 'install' ? <IoCheckmarkCircle className="w-5 h-5 text-green-500" /> : <IoCopyOutline className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Step 2: Initialize with your credentials
                      </h3>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-3 flex items-start space-x-2">
                        <IoWarningOutline className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                          <strong>Important:</strong> You'll need your GDS/Amadeus credentials to obtain API keys. 
                          <button onClick={() => setShowAuthModal(true)} className="underline font-semibold">
                            Verify your property credentials here
                          </button>
                        </p>
                      </div>
                      <div className="bg-gray-900 dark:bg-black rounded-lg p-3 md:p-4 relative overflow-hidden">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          <code>{codeExamples[selectedLanguage as keyof typeof codeExamples].initialize}</code>
                        </pre>
                        <button 
                          onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].initialize, 'init')}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          {copySuccess === 'init' ? <IoCheckmarkCircle className="w-5 h-5 text-green-500" /> : <IoCopyOutline className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Step 3: Create your first booking
                      </h3>
                      <div className="bg-gray-900 dark:bg-black rounded-lg p-3 md:p-4 relative overflow-hidden">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          <code>{codeExamples[selectedLanguage as keyof typeof codeExamples].booking}</code>
                        </pre>
                        <button 
                          onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].booking, 'booking')}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          {copySuccess === 'booking' ? <IoCheckmarkCircle className="w-5 h-5 text-green-500" /> : <IoCopyOutline className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Step 4 - Real-time Tracking */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Step 4: Enable real-time tracking
                      </h3>
                      <div className="bg-gray-900 dark:bg-black rounded-lg p-3 md:p-4 relative overflow-hidden">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          <code>{codeExamples[selectedLanguage as keyof typeof codeExamples].tracking}</code>
                        </pre>
                        <button 
                          onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].tracking, 'tracking')}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          {copySuccess === 'tracking' ? <IoCheckmarkCircle className="w-5 h-5 text-green-500" /> : <IoCopyOutline className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Step 5 - Flight Integration */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Step 5: Add flight tracking integration
                      </h3>
                      <div className="bg-gray-900 dark:bg-black rounded-lg p-3 md:p-4 relative overflow-hidden">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          <code>{codeExamples[selectedLanguage as keyof typeof codeExamples].flightIntegration}</code>
                        </pre>
                        <button 
                          onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].flightIntegration, 'flight')}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          {copySuccess === 'flight' ? <IoCheckmarkCircle className="w-5 h-5 text-green-500" /> : <IoCopyOutline className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testing */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Testing Your Integration</h2>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                          Use our sandbox environment to test your integration without affecting production data.
                        </p>
                        <div className="space-y-2 text-xs text-blue-700 dark:text-blue-200">
                          <div><strong>Sandbox URL:</strong> https://sandbox-api.itwhip.com/v3</div>
                          <div><strong>Test Property ID:</strong> TEST-PHX-001</div>
                          <div><strong>Test API Key:</strong> sk_test_4242424242424242</div>
                        </div>
                        <button 
                          onClick={() => setShowAuthModal(true)}
                          className="mt-3 text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Get Your Sandbox Credentials
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'authentication' && (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Authentication</h2>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800 mb-6">
                    <div className="flex items-start space-x-3">
                      <IoLockClosedOutline className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                          GDS Authentication Required
                        </h3>
                        <p className="text-xs text-red-800 dark:text-red-400 mb-3">
                          API access requires valid GDS/Amadeus credentials. Properties must be verified through our partner portal 
                          to obtain production API keys.
                        </p>
                        <button 
                          onClick={() => setShowAuthModal(true)}
                          className="text-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                          Verify Property Now
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">OAuth 2.0 Flow</h3>
                      <div className="bg-gray-900 dark:bg-black rounded-lg p-4">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          <code>{`POST /oauth/token
Host: api.itwhip.com
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&scope=rides.create rides.read rides.update billing.charge`}</code>
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Response</h3>
                      <div className="bg-gray-900 dark:bg-black rounded-lg p-4">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          <code>{`{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "rides.create rides.read rides.update billing.charge",
  "property_tier": "premium",
  "rate_limit": "1000/hour"
}`}</code>
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">API Key Authentication</h3>
                      <div className="bg-gray-900 dark:bg-black rounded-lg p-4">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          <code>{`// Using API Key in headers
GET /api/v3/rides
Host: api.itwhip.com
Authorization: Bearer sk_live_abcdef123456789
X-Host-ID: HOST-PHX-001`}</code>
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Signature Verification (Webhooks)</h3>
                      <div className="bg-gray-900 dark:bg-black rounded-lg p-4">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          <code>{`// Verify webhook signatures
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}`}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Best Practices */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Security Best Practices</h2>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Rotate API Keys Regularly</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Rotate production keys every 90 days minimum</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Use Environment Variables</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Never hardcode credentials in your source code</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Implement IP Whitelisting</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Restrict API access to known server IPs</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Monitor API Usage</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Set up alerts for unusual activity patterns</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'endpoints' && (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">API Endpoints</h2>
                  
                  <div className="space-y-6">
                    {/* Rides Endpoints */}
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">Rides</h3>
                      <div className="space-y-3">
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-mono rounded">POST</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">/api/v3/rides</code>
                            </div>
                            <span className="text-xs text-gray-500">Create booking</span>
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">GET</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">{'/api/v3/rides/{id}'}</code>
                            </div>
                            <span className="text-xs text-gray-500">Get booking details</span>
                          </div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs font-mono rounded">PUT</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">{'/api/v3/rides/{id}'}</code>
                            </div>
                            <span className="text-xs text-gray-500">Update booking</span>
                          </div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-mono rounded">DELETE</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">{'/api/v3/rides/{id}'}</code>
                            </div>
                            <span className="text-xs text-gray-500">Cancel booking</span>
                          </div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">GET</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">/api/v3/rides/upcoming</code>
                            </div>
                            <span className="text-xs text-gray-500">List upcoming rides</span>
                          </div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-mono rounded">POST</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">{'/api/v3/rides/{id}/track'}</code>
                            </div>
                            <span className="text-xs text-gray-500">Enable tracking</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fleet Endpoints */}
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">Fleet Management</h3>
                      <div className="space-y-3">
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">GET</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">/api/v3/fleet/availability</code>
                            </div>
                            <span className="text-xs text-gray-500">Check availability</span>
                          </div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">GET</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">/api/v3/fleet/vehicles</code>
                            </div>
                            <span className="text-xs text-gray-500">List vehicle classes</span>
                          </div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-mono rounded">POST</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">/api/v3/fleet/estimate</code>
                            </div>
                            <span className="text-xs text-gray-500">Get fare estimate</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Billing Endpoints */}
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">Billing Integration</h3>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-3">
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                          <strong>Note:</strong> Billing endpoints require PMS integration credentials. 
                          <button onClick={() => setShowAuthModal(true)} className="underline">Configure in partner portal</button>
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-mono rounded">POST</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">/api/v3/billing/room-charge</code>
                            </div>
                            <span className="text-xs text-gray-500">Charge to folio</span>
                          </div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">GET</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">/api/v3/billing/invoices</code>
                            </div>
                            <span className="text-xs text-gray-500">Get invoices</span>
                          </div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-mono rounded">POST</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">/api/v3/billing/reconcile</code>
                            </div>
                            <span className="text-xs text-gray-500">Daily reconciliation</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Analytics Endpoints */}
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">Analytics & Reporting</h3>
                      <div className="space-y-3">
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">GET</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">/api/v3/analytics/revenue</code>
                            </div>
                            <span className="text-xs text-gray-500">Revenue reports</span>
                          </div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">GET</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">/api/v3/analytics/usage</code>
                            </div>
                            <span className="text-xs text-gray-500">Usage statistics</span>
                          </div>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">GET</span>
                              <code className="text-sm text-gray-700 dark:text-gray-300">/api/v3/analytics/guests</code>
                            </div>
                            <span className="text-xs text-gray-500">Guest insights</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rate Limits */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Rate Limits</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 text-gray-700 dark:text-gray-300">Tier</th>
                          <th className="text-left py-2 text-gray-700 dark:text-gray-300">Requests/Hour</th>
                          <th className="text-left py-2 text-gray-700 dark:text-gray-300">Burst</th>
                          <th className="text-left py-2 text-gray-700 dark:text-gray-300">Concurrent</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 text-gray-600 dark:text-gray-400">Trial</td>
                          <td className="py-2 font-mono text-gray-900 dark:text-white">100</td>
                          <td className="py-2 font-mono text-gray-900 dark:text-white">10</td>
                          <td className="py-2 font-mono text-gray-900 dark:text-white">2</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 text-gray-600 dark:text-gray-400">Standard</td>
                          <td className="py-2 font-mono text-gray-900 dark:text-white">1,000</td>
                          <td className="py-2 font-mono text-gray-900 dark:text-white">50</td>
                          <td className="py-2 font-mono text-gray-900 dark:text-white">10</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 text-gray-600 dark:text-gray-400">Premium</td>
                          <td className="py-2 font-mono text-gray-900 dark:text-white">10,000</td>
                          <td className="py-2 font-mono text-gray-900 dark:text-white">200</td>
                          <td className="py-2 font-mono text-gray-900 dark:text-white">50</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600 dark:text-gray-400">Enterprise</td>
                          <td className="py-2 font-mono text-gray-900 dark:text-white">Unlimited</td>
                          <td className="py-2 font-mono text-gray-900 dark:text-white">Custom</td>
                          <td className="py-2 font-mono text-gray-900 dark:text-white">Custom</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'webhooks' && (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Webhooks</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Event Types</h3>
                      <div className="space-y-2">
                        {[
                          { event: 'ride.created', description: 'New ride booking created' },
                          { event: 'ride.confirmed', description: 'Driver assigned and confirmed' },
                          { event: 'ride.started', description: 'Ride has begun' },
                          { event: 'ride.completed', description: 'Ride completed successfully' },
                          { event: 'ride.cancelled', description: 'Ride cancelled' },
                          { event: 'driver.arrived', description: 'Driver at pickup location' },
                          { event: 'driver.location', description: 'Real-time location update' },
                          { event: 'billing.charged', description: 'Payment processed' },
                          { event: 'billing.failed', description: 'Payment failed' },
                          { event: 'flight.updated', description: 'Flight status changed' },
                          { event: 'property.revenue', description: 'Daily revenue report' }
                        ].map(item => (
                          <div key={item.event} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                            <code className="text-sm text-blue-600 dark:text-blue-400">{item.event}</code>
                            <span className="text-xs text-gray-500">{item.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Webhook Payload Example</h3>
                      <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                        <pre className="text-xs text-gray-300">
                          <code>{`{
  "id": "evt_1234567890",
  "type": "ride.completed",
  "created": 1642531200,
  "data": {
    "ride_id": "ride_ABC123",
    "confirmation_code": "WHIP-2024-XYZ789",
    "property_id": "prop_123",
    "guest": {
      "pms_id": "GUEST-456",
      "name": "Jane Doe",
      "room": "507"
    },
    "driver": {
      "id": "drv_789",
      "name": "Michael Johnson",
      "vehicle": "Tesla Model S",
      "plate": "LUX-2024"
    },
    "trip": {
      "distance_miles": 18.3,
      "duration_minutes": 24,
      "fare": {
        "amount": 4700,
        "currency": "USD",
        "breakdown": {
          "base": 2500,
          "distance": 1800,
          "time": 400,
          "property_commission": 705
        }
      }
    }
  }
}`}</code>
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Webhook Configuration</h3>
                      <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                        <pre className="text-xs text-gray-300">
                          <code>{`// Configure webhook endpoint
await sdk.webhooks.configure({
  endpoint: 'https://your-app.com/webhooks',
  events: ['ride.*', 'billing.*', 'flight.updated'],
  secret: 'whsec_abcdef123456',
  retries: {
    enabled: true,
    maxAttempts: 3,
    backoff: 'exponential'
  }
});`}</code>
                        </pre>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start space-x-3">
                        <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                            Configure webhook endpoints and manage event subscriptions in your partner dashboard.
                          </p>
                          <button 
                            onClick={() => setShowAuthModal(true)}
                            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            Configure Webhooks
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Webhook Testing Tool */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Webhook Testing</h2>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use our webhook testing tool to simulate events and verify your endpoint configuration.
                    </p>
                    <div className="flex items-center space-x-3">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        Send Test Event
                      </button>
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 text-sm">
                        View Event Logs
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'errors' && (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Error Handling</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Error Response Format</h3>
                      <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                        <pre className="text-xs text-gray-300">
                          <code>{`{
  "error": {
    "code": "invalid_request",
    "message": "The request is missing required parameters",
    "details": {
      "missing_fields": ["guest_profile.pms_id", "ride.scheduled_time"]
    },
    "request_id": "req_xYz123ABC",
    "documentation_url": "https://docs.itwhip.com/errors/invalid_request"
  }
}`}</code>
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Common Error Codes</h3>
                      <div className="space-y-2">
                        {[
                          { code: '400', type: 'Bad Request', description: 'Invalid request parameters' },
                          { code: '401', type: 'Unauthorized', description: 'Invalid or missing API credentials' },
                          { code: '403', type: 'Forbidden', description: 'Property not verified or tier insufficient' },
                          { code: '404', type: 'Not Found', description: 'Resource does not exist' },
                          { code: '409', type: 'Conflict', description: 'Booking time conflict or duplicate request' },
                          { code: '422', type: 'Unprocessable', description: 'Request understood but cannot process' },
                          { code: '429', type: 'Rate Limited', description: 'Too many requests, please retry' },
                          { code: '500', type: 'Server Error', description: 'Internal server error' },
                          { code: '503', type: 'Unavailable', description: 'Service temporarily unavailable' }
                        ].map(error => (
                          <div key={error.code} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center space-x-3">
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-mono rounded">
                                {error.code}
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{error.type}</span>
                            </div>
                            <span className="text-xs text-gray-500">{error.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start space-x-3">
                        <IoWarningOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">
                            403 Forbidden: Property Not Verified
                          </h3>
                          <p className="text-xs text-amber-800 dark:text-amber-400 mb-3">
                            This error occurs when your property hasn't been verified or doesn't have the required tier for instant rides.
                          </p>
                          <button 
                            onClick={() => setShowAuthModal(true)}
                            className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
                          >
                            Verify Property to Enable API Access
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Error Recovery Strategies</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Retry with Exponential Backoff</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">For 429 and 503 errors, implement exponential backoff starting at 1 second</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Idempotency Keys</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Use idempotency keys to safely retry requests without duplicates</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Circuit Breaker Pattern</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Implement circuit breakers to handle service degradation gracefully</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'changelog' && (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Changelog</h2>
                  
                  <div className="space-y-6">
                    {/* Version 3.14.2 */}
                    <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-mono rounded">
                          v3.14.2
                        </span>
                        <span className="text-sm text-gray-500">Released January 8, 2024</span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                          LATEST
                        </span>
                      </div>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Added support for group bookings (up to 15 passengers)</li>
                        <li>• Improved webhook retry logic with exponential backoff</li>
                        <li>• Fixed timezone handling for international properties</li>
                        <li>• Added `discrete_billing` flag for corporate accounts</li>
                        <li>• New endpoint: `/api/v3/rides/bulk` for multiple bookings</li>
                      </ul>
                    </div>

                    {/* Version 3.14.0 */}
                    <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">
                          v3.14.0
                        </span>
                        <span className="text-sm text-gray-500">Released December 15, 2023</span>
                      </div>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>• <strong>Major:</strong> GDS integration for Amadeus Hospitality</li>
                        <li>• New endpoint: `/api/v3/analytics/revenue`</li>
                        <li>• Support for Oracle Opera Cloud PMS</li>
                        <li>• WebSocket connections for real-time tracking</li>
                        <li>• Property tier system with revenue sharing</li>
                      </ul>
                    </div>

                    {/* Version 3.13.0 */}
                    <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs font-mono rounded">
                          v3.13.0
                        </span>
                        <span className="text-sm text-gray-500">Released November 1, 2023</span>
                      </div>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Flight tracking integration with FlightStats API</li>
                        <li>• Automatic schedule adjustments for delays</li>
                        <li>• Multi-property chain management support</li>
                        <li>• Enhanced billing reconciliation tools</li>
                      </ul>
                    </div>

                    {/* Version 3.12.0 */}
                    <div className="pb-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs font-mono rounded">
                          v3.12.0
                        </span>
                        <span className="text-sm text-gray-500">Released October 1, 2023</span>
                      </div>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>• White-label branding options</li>
                        <li>• Guest preference learning system</li>
                        <li>• Loyalty program integration</li>
                        <li>• Advanced analytics dashboard</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <a href="https://github.com/itwhip/sdk-releases" className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-2">
                      <span>View all releases on GitHub</span>
                      <IoChevronForwardOutline className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Migration Guide */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Migration Guide</h2>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Upgrading from v2.x to v3.x</h3>
                    <p className="text-xs text-blue-800 dark:text-blue-400 mb-3">
                      Version 3.x includes breaking changes. Please review the migration guide before upgrading.
                    </p>
                    <a href="/docs/migration" className="text-xs text-blue-600 hover:text-blue-700 underline">
                      View Migration Guide →
                    </a>
                  </div>
                </div>
              </>
            )}

          </main>
        </div>
      </div>

      {/* Performance Metrics Section */}
      <section className="bg-gray-100 dark:bg-gray-900 py-8 md:py-12 mt-8 md:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8 text-center">Platform Performance</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 text-center">
              <IoTimeOutline className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2 md:mb-3" />
              <div className="text-xl md:text-2xl font-mono font-bold text-gray-900 dark:text-white">{apiLatency.p50}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">P50 Latency</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 text-center">
              <IoCloudOutline className="w-6 h-6 md:w-8 md:h-8 text-green-600 mx-auto mb-2 md:mb-3" />
              <div className="text-xl md:text-2xl font-mono font-bold text-gray-900 dark:text-white">99.97%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Uptime SLA</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 text-center">
              <IoServerOutline className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mx-auto mb-2 md:mb-3" />
              <div className="text-xl md:text-2xl font-mono font-bold text-gray-900 dark:text-white">14</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Global Regions</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 text-center">
              <IoShieldCheckmarkOutline className="w-6 h-6 md:w-8 md:h-8 text-amber-600 mx-auto mb-2 md:mb-3" />
              <div className="text-xl md:text-2xl font-mono font-bold text-gray-900 dark:text-white">SOC 2</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Certified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Success Stories */}
      <section className="bg-white dark:bg-black py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8 text-center">Integration Success Stories</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-3">
                <IoCarOutline className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">$67,433</div>
                  <div className="text-xs text-gray-500">Monthly Revenue</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                "The SDK integration took less than 2 hours. We're now earning over $67K monthly from ride commissions."
              </p>
              <div className="mt-3 text-xs text-gray-500">
                - Fairmont Scottsdale Princess
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-3">
                <IoAirplaneOutline className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">94%</div>
                  <div className="text-xs text-gray-500">Guest Satisfaction</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                "Flight tracking integration means our guests never wait. Drivers arrive perfectly timed with flight landings."
              </p>
              <div className="mt-3 text-xs text-gray-500">
                - Four Seasons Resort
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-3">
                <IoAnalyticsOutline className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">3,847</div>
                  <div className="text-xs text-gray-500">Monthly Rides</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                "The analytics dashboard shows we're completing nearly 4,000 rides monthly with zero surge pricing."
              </p>
              <div className="mt-3 text-xs text-gray-500">
                - The Phoenician Resort
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4">
            Ready to Integrate Instant Rides?
          </h2>
          <p className="text-base md:text-lg text-blue-100 mb-6">
            Join 487+ properties already offering instant luxury transportation to their guests
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-6 md:px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started with SDK Integration
            </button>
            <a 
              href="/contact"
              className="px-6 md:px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors"
            >
              Schedule Integration Call
            </a>
          </div>
        </div>
      </section>

      {/* Auth Modal - The Real Trap */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Property Verification</h3>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <IoCloseOutline className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Enter your GDS/Amadeus property code to access API credentials and view integration analytics.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleGDSSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GDS Property Code
                  </label>
                  <input
                    type="text"
                    value={gdsCode}
                    onChange={(e) => setGdsCode(e.target.value.toUpperCase())}
                    placeholder="e.g., PHX1234 or AMADEUS-5678"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This is your Amadeus, Sabre, or Travelport property identifier
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="rounded text-blue-600"
                    required 
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400">
                    I have authority to manage this property's technical integrations
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isValidating}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Property...</span>
                    </span>
                  ) : (
                    'Verify & Access Dashboard'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Don't have your GDS code? Contact your property's revenue manager or 
                <a href="/contact" className="text-blue-600 hover:text-blue-700 ml-1">reach out to support</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
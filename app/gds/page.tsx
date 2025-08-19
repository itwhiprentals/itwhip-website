// app/gds/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { 
  IoDocumentTextOutline,
  IoServerOutline,
  IoCodeSlashOutline,
  IoTerminalOutline,
  IoGitBranchOutline,
  IoLayersOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoDownloadOutline,
  IoCopyOutline,
  IoBookOutline,
  IoHomeOutline,
  IoBusinessOutline
} from 'react-icons/io5'

export default function GDSDocumentationPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('overview')
  const [copiedCode, setCopiedCode] = useState('')
  
  // Header state management for main nav
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers for main nav
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/portal/login')
  }

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const sections = [
    { id: 'overview', name: 'Overview' },
    { id: 'amadeus', name: 'Amadeus Integration' },
    { id: 'sabre', name: 'Sabre Integration' },
    { id: 'travelport', name: 'Travelport Integration' },
    { id: 'codes', name: 'Property Codes' },
    { id: 'formats', name: 'Data Formats' },
    { id: 'errors', name: 'Error Codes' },
    { id: 'testing', name: 'Testing' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Main Header Component with Full Navigation - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title Section - Fixed below main header */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <IoDocumentTextOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  GDS Documentation
                </h1>
                <span className="ml-2 text-xs text-gray-500">v2.4.1</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/sdk" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                API Reference
              </Link>
              <Link href="/integrations" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Integrations
              </Link>
              <Link href="/support" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Support
              </Link>
              <Link 
                href="/portal/login"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                Partner Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Navigation - Fixed */}
      <div className="md:hidden fixed top-[106px] left-0 right-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              <Link 
                href="/sdk" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoCodeSlashOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">API Ref</span>
              </Link>
              <Link 
                href="/integrations" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoLayersOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Integrations</span>
              </Link>
              <Link 
                href="/support" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoInformationCircleOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Support</span>
              </Link>
              <Link 
                href="/portal/login"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoBusinessOutline className="w-4 h-4 flex-shrink-0" />
                <span>Partner Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area with Sidebar */}
      <div className="flex flex-1 mt-[150px] md:mt-[112px]">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-112px)] sticky top-[112px]">
          <nav className="p-4">
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    activeSection === section.id
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  {section.name}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="px-3 text-xs text-gray-500 mb-2">Resources</div>
              <Link href="/downloads/gds-spec-v2.4.pdf" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <IoDownloadOutline className="w-4 h-4" />
                <span>Download PDF</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Mobile Section Selector */}
            <div className="lg:hidden mb-6">
              <select
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Sections */}
            {activeSection === 'overview' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Global Distribution System Integration
                </h1>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        This documentation covers technical specifications for GDS integration with the ItWhip 
                        instant ride platform. For property-specific implementation, access the partner portal 
                        with your GDS credentials.
                      </p>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                  Supported Systems
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Amadeus</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Version 18.2+</p>
                    <p className="text-xs text-green-600 mt-2">✓ Fully Supported</p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sabre</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Red 360 2.0+</p>
                    <p className="text-xs text-green-600 mt-2">✓ Fully Supported</p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Travelport</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Universal API v42+</p>
                    <p className="text-xs text-green-600 mt-2">✓ Fully Supported</p>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Integration Process
                </h2>
                
                <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                  <li>Obtain property credentials from your GDS provider</li>
                  <li>Configure API endpoints in your PMS</li>
                  <li>Map transportation service codes</li>
                  <li>Enable real-time availability updates</li>
                  <li>Test integration in sandbox environment</li>
                  <li>Deploy to production</li>
                </ol>
              </div>
            )}

            {activeSection === 'amadeus' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Amadeus Integration
                </h1>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                  Connection Parameters
                </h2>

                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">XML Configuration</span>
                    <button
                      onClick={() => copyToClipboard(`<AmadeusConfig>
  <PropertyCode>PHX1234</PropertyCode>
  <WSAPId>WS_ITWHIP_PROD</WSAPId>
  <OfficeId>PHXHO08AA</OfficeId>
  <TransportService>
    <Code>TRN</Code>
    <SubCode>LUX</SubCode>
  </TransportService>
</AmadeusConfig>`, 'amadeus-config')}
                      className="text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'amadeus-config' ? <IoCheckmarkCircle className="w-4 h-4" /> : <IoCopyOutline className="w-4 h-4" />}
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
{`<AmadeusConfig>
  <PropertyCode>PHX1234</PropertyCode>
  <WSAPId>WS_ITWHIP_PROD</WSAPId>
  <OfficeId>PHXHO08AA</OfficeId>
  <TransportService>
    <Code>TRN</Code>
    <SubCode>LUX</SubCode>
  </TransportService>
</AmadeusConfig>`}
                  </pre>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Service Codes
                </h2>

                <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Code</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Service</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">TRN-LUX-APT</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Airport Transfer - Luxury</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Premium</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">TRN-STD-LOC</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Local Transfer - Standard</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Standard</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">TRN-VIP-ANY</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">VIP Service - Any Location</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">VIP</td>
                    </tr>
                  </tbody>
                </table>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <IoWarningOutline className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>Important:</strong> Amadeus property codes must be registered in the partner portal 
                        before API access is granted. Contact your Amadeus representative for code assignment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'sabre' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Sabre Red 360 Integration
                </h1>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                  SOAP Endpoint Configuration
                </h2>

                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">WSDL Endpoint</span>
                    <button
                      onClick={() => copyToClipboard('https://api.itwhip.com/sabre/v2/TransportationService?wsdl', 'sabre-wsdl')}
                      className="text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'sabre-wsdl' ? <IoCheckmarkCircle className="w-4 h-4" /> : <IoCopyOutline className="w-4 h-4" />}
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
{`https://api.itwhip.com/sabre/v2/TransportationService?wsdl`}
                  </pre>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Authentication Headers
                </h2>

                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <pre className="text-sm text-gray-300 overflow-x-auto">
{`<soap:Header>
  <MessageHeader>
    <From>
      <PartyId>Property_PCC</PartyId>
    </From>
    <To>
      <PartyId>ITWHIP_SABRE</PartyId>
    </To>
    <CPAId>PHX_PROPERTY</CPAId>
    <Service>TransportationService</Service>
    <Action>GetAvailability</Action>
  </MessageHeader>
  <Security>
    <BinarySecurityToken>{{BASE64_TOKEN}}</BinarySecurityToken>
  </Security>
</soap:Header>`}
                  </pre>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <IoWarningOutline className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-800 dark:text-red-300">
                        <strong>Security Notice:</strong> Never expose your BinarySecurityToken in client-side code. 
                        All API calls must be made from secure server environments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'codes' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Property Code Formats
                </h1>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Standard Format Specifications
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Amadeus Format</h3>
                      <code className="bg-gray-900 text-gray-300 px-2 py-1 rounded text-sm">
                        [CITY_CODE][PROPERTY_ID][CHAIN_CODE]
                      </code>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Example: PHX1234OM (Phoenix, Property 1234, Omni)
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Sabre Format</h3>
                      <code className="bg-gray-900 text-gray-300 px-2 py-1 rounded text-sm">
                        [CHAIN][NUMERIC_ID]
                      </code>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Example: OM12345 (Omni, ID 12345)
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Travelport Format</h3>
                      <code className="bg-gray-900 text-gray-300 px-2 py-1 rounded text-sm">
                        [COUNTRY]-[STATE]-[PROPERTY]-[CHAIN]
                      </code>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Example: US-AZ-1234-OM (USA, Arizona, 1234, Omni)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Property codes are unique identifiers assigned by your GDS provider. To verify your 
                        property code and check integration status, use the partner portal with your credentials.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'formats' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Data Format Specifications
                </h1>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                  Transportation Request Schema
                </h2>

                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <pre className="text-sm text-gray-300 overflow-x-auto">
{`{
  "transportRequest": {
    "propertyCode": "PHX1234",
    "guestInfo": {
      "confirmationNumber": "ABC123456",
      "lastName": "Smith",
      "roomNumber": "1205"
    },
    "service": {
      "type": "AIRPORT_TRANSFER",
      "class": "LUXURY",
      "pickupDateTime": "2024-12-15T14:30:00Z",
      "passengerCount": 2
    },
    "locations": {
      "pickup": {
        "type": "PROPERTY",
        "code": "PHX1234"
      },
      "dropoff": {
        "type": "AIRPORT",
        "code": "PHX",
        "terminal": "4",
        "airline": "AA"
      }
    }
  }
}`}
                  </pre>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Response Format
                </h2>

                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm text-gray-300 overflow-x-auto">
{`{
  "transportResponse": {
    "status": "CONFIRMED",
    "bookingReference": "ITW-2024-12345",
    "vehicle": {
      "type": "TESLA_MODEL_S",
      "capacity": 4,
      "amenities": ["WIFI", "WATER", "PHONE_CHARGER"]
    },
    "driver": {
      "id": "DRV-789",
      "rating": 4.9,
      "verified": true
    },
    "pricing": {
      "base": 45.00,
      "surgeMultiplier": 1.0,
      "total": 45.00,
      "currency": "USD"
    },
    "estimatedPickupTime": "2024-12-15T14:30:00Z",
    "estimatedDuration": 25
  }
}`}
                  </pre>
                </div>
              </div>
            )}

            {activeSection === 'errors' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Error Codes and Handling
                </h1>

                <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Code</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Description</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-2 text-sm text-red-600 font-mono">ERR_1001</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Invalid property code</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Verify code format</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-red-600 font-mono">ERR_1002</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Property not authorized</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Check portal access</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-red-600 font-mono">ERR_2001</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">No drivers available</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Retry or fallback</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-red-600 font-mono">ERR_3001</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Invalid date/time</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Check ISO format</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-red-600 font-mono">ERR_4001</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Rate limit exceeded</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Implement backoff</td>
                    </tr>
                  </tbody>
                </table>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <IoWarningOutline className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>Rate Limiting:</strong> API requests are limited to 100 per minute per property. 
                        Implement exponential backoff for retries to avoid service suspension.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'testing' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Testing and Sandbox Environment
                </h1>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        <strong>Sandbox Available:</strong> Test environment with simulated responses available at 
                        <code className="bg-green-100 dark:bg-green-800 px-1 rounded">sandbox.api.itwhip.com</code>
                      </p>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                  Test Property Codes
                </h2>

                <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">GDS</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Test Code</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Property Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">Amadeus</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-mono">TEST1234</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Test Hotel Phoenix</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">Sabre</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-mono">TS99999</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Sandbox Resort</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">Travelport</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-mono">US-AZ-TEST-01</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Demo Property</td>
                    </tr>
                  </tbody>
                </table>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Testing Checklist
                </h2>

                <div className="space-y-2">
                  {[
                    'Verify property code authentication',
                    'Test booking creation flow',
                    'Validate guest confirmation lookup',
                    'Test real-time availability updates',
                    'Verify pricing calculations',
                    'Test cancellation handling',
                    'Validate error responses',
                    'Test rate limiting behavior'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <input type="checkbox" className="mt-1 rounded border-gray-300 dark:border-gray-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer with Hidden Portal Link */}
            <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8 mt-16">
              <div className="text-center text-xs text-gray-500 dark:text-gray-600">
                <p className="mb-2">
                  ItWhip GDS Documentation v2.4.1 | Last Updated: December 2024
                </p>
                <p className="mb-4">
                  For technical support, contact gds-support@itwhip.com
                </p>
                
                {/* Hidden Portal Link - The Trap */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-[10px] text-gray-400 dark:text-gray-700">
                    Property managers can verify integration status and view analytics in the{' '}
                    <Link href="/portal/login" className="underline hover:text-gray-500">
                      partner portal
                    </Link>
                    {' '}using GDS credentials.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
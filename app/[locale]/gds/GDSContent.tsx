// app/gds/GDSContent.tsx

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
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

export default function GDSContent() {
  const t = useTranslations('GDS')
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
    { id: 'overview', nameKey: 'sections.overview' },
    { id: 'amadeus', nameKey: 'sections.amadeus' },
    { id: 'sabre', nameKey: 'sections.sabre' },
    { id: 'travelport', nameKey: 'sections.travelport' },
    { id: 'codes', nameKey: 'sections.codes' },
    { id: 'formats', nameKey: 'sections.formats' },
    { id: 'errors', nameKey: 'sections.errors' },
    { id: 'testing', nameKey: 'sections.testing' }
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
                  {t('pageTitle')}
                </h1>
                <span className="ml-2 text-xs text-gray-500">v2.4.1</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/sdk" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                {t('nav.apiReference')}
              </Link>
              <Link href="/integrations" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                {t('nav.integrations')}
              </Link>
              <Link href="/support" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                {t('nav.support')}
              </Link>
              <Link
                href="/portal/login"
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-semibold hover:bg-amber-700"
              >
                {t('nav.partnerPortal')}
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
                <span className="text-xs font-medium">{t('nav.apiRef')}</span>
              </Link>
              <Link
                href="/integrations"
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoLayersOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">{t('nav.integrations')}</span>
              </Link>
              <Link
                href="/support"
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoInformationCircleOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">{t('nav.support')}</span>
              </Link>
              <Link
                href="/portal/login"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoBusinessOutline className="w-4 h-4 flex-shrink-0" />
                <span>{t('nav.partnerPortal')}</span>
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
                  {t(section.nameKey)}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="px-3 text-xs text-gray-500 mb-2">{t('sidebar.resources')}</div>
              <Link href="/downloads/gds-spec-v2.4.pdf" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <IoDownloadOutline className="w-4 h-4" />
                <span>{t('sidebar.downloadPdf')}</span>
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
                    {t(section.nameKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Sections */}
            {activeSection === 'overview' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('overview.title')}
                </h1>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {t('overview.infoBanner')}
                      </p>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                  {t('overview.supportedSystems')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Amadeus</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Version 18.2+</p>
                    <p className="text-xs text-green-600 mt-2">{t('overview.fullySupported')}</p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sabre</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Red 360 2.0+</p>
                    <p className="text-xs text-green-600 mt-2">{t('overview.fullySupported')}</p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Travelport</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Universal API v42+</p>
                    <p className="text-xs text-green-600 mt-2">{t('overview.fullySupported')}</p>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('overview.integrationProcess')}
                </h2>

                <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                  <li>{t('overview.step1')}</li>
                  <li>{t('overview.step2')}</li>
                  <li>{t('overview.step3')}</li>
                  <li>{t('overview.step4')}</li>
                  <li>{t('overview.step5')}</li>
                  <li>{t('overview.step6')}</li>
                </ol>
              </div>
            )}

            {activeSection === 'amadeus' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('amadeus.title')}
                </h1>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                  {t('amadeus.connectionParams')}
                </h2>

                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">{t('amadeus.xmlConfig')}</span>
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
                  {t('amadeus.serviceCodes')}
                </h2>

                <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tables.code')}</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tables.service')}</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tables.category')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">TRN-LUX-APT</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('amadeus.airportLuxury')}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('amadeus.premium')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">TRN-STD-LOC</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('amadeus.localStandard')}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('amadeus.standard')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">TRN-VIP-ANY</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('amadeus.vipAny')}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('amadeus.vip')}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <IoWarningOutline className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>{t('amadeus.importantLabel')}</strong> {t('amadeus.importantText')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'sabre' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('sabre.title')}
                </h1>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                  {t('sabre.soapEndpoint')}
                </h2>

                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">{t('sabre.wsdlEndpoint')}</span>
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
                  {t('sabre.authHeaders')}
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
                        <strong>{t('sabre.securityLabel')}</strong> {t('sabre.securityText')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'travelport' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('travelport.title')}
                </h1>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                  {t('travelport.restConfig')}
                </h2>

                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <pre className="text-sm text-gray-300 overflow-x-auto">
{`// Base URL
https://api.itwhip.com/travelport/v1

// Headers
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
X-TP-TargetBranch: {BRANCH_CODE}
X-TP-TraceId: {UUID}`}
                  </pre>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('travelport.supportedOps')}
                </h2>

                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <code className="text-amber-600 text-sm">GET /availability</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {t('travelport.getAvailability')}
                    </p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <code className="text-amber-600 text-sm">POST /bookings</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {t('travelport.postBookings')}
                    </p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <code className="text-amber-600 text-sm">DELETE /bookings/{"{id}"}</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {t('travelport.deleteBookings')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'codes' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('codes.title')}
                </h1>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('codes.standardFormats')}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('codes.amadeusFormat')}</h3>
                      <code className="bg-gray-900 text-gray-300 px-2 py-1 rounded text-sm">
                        [CITY_CODE][PROPERTY_ID][CHAIN_CODE]
                      </code>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('codes.amadeusExample')}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('codes.sabreFormat')}</h3>
                      <code className="bg-gray-900 text-gray-300 px-2 py-1 rounded text-sm">
                        [CHAIN][NUMERIC_ID]
                      </code>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('codes.sabreExample')}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('codes.travelportFormat')}</h3>
                      <code className="bg-gray-900 text-gray-300 px-2 py-1 rounded text-sm">
                        [COUNTRY]-[STATE]-[PROPERTY]-[CHAIN]
                      </code>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('codes.travelportExample')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <IoInformationCircleOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {t('codes.infoText')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'formats' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('formats.title')}
                </h1>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                  {t('formats.requestSchema')}
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
                  {t('formats.responseFormat')}
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
                  {t('errors.title')}
                </h1>

                <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tables.code')}</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tables.description')}</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tables.action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-2 text-sm text-red-600 font-mono">ERR_1001</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('errors.err1001Desc')}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('errors.err1001Action')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-red-600 font-mono">ERR_1002</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('errors.err1002Desc')}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('errors.err1002Action')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-red-600 font-mono">ERR_2001</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('errors.err2001Desc')}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('errors.err2001Action')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-red-600 font-mono">ERR_3001</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('errors.err3001Desc')}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('errors.err3001Action')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-red-600 font-mono">ERR_4001</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('errors.err4001Desc')}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('errors.err4001Action')}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <IoWarningOutline className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>{t('errors.rateLimitLabel')}</strong> {t('errors.rateLimitText')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'testing' && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('testing.title')}
                </h1>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        <strong>{t('testing.sandboxLabel')}</strong> {t('testing.sandboxText')}
                        <code className="bg-green-100 dark:bg-green-800 px-1 rounded">sandbox.api.itwhip.com</code>
                      </p>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                  {t('testing.testCodes')}
                </h2>

                <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tables.gds')}</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tables.testCode')}</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t('tables.propertyName')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">Amadeus</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-mono">TEST1234</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('testing.testHotelPhoenix')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">Sabre</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-mono">TS99999</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('testing.sandboxResort')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">Travelport</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-mono">US-AZ-TEST-01</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{t('testing.demoProperty')}</td>
                    </tr>
                  </tbody>
                </table>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('testing.checklistTitle')}
                </h2>

                <div className="space-y-2">
                  {([
                    'testing.check1',
                    'testing.check2',
                    'testing.check3',
                    'testing.check4',
                    'testing.check5',
                    'testing.check6',
                    'testing.check7',
                    'testing.check8'
                  ] as const).map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <input type="checkbox" className="mt-1 rounded border-gray-300 dark:border-gray-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t(item)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer with Hidden Portal Link */}
            <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-8 mt-16">
              <div className="text-center text-xs text-gray-500 dark:text-gray-600">
                <p className="mb-2">
                  {t('footer.version')}
                </p>
                <p className="mb-4">
                  {t('footer.supportContact')}
                </p>

                {/* Hidden Portal Link - The Trap */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-[10px] text-gray-400 dark:text-gray-700">
                    {t('footer.portalPrefix')}{' '}
                    <Link href="/portal/login" className="underline hover:text-gray-500">
                      {t('footer.portalLink')}
                    </Link>
                    {' '}{t('footer.portalSuffix')}
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

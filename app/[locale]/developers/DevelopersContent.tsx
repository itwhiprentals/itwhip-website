// app/developers/DevelopersContent.tsx

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import { 
  IoCodeSlashOutline,
  IoServerOutline,
  IoGitBranchOutline,
  IoTerminalOutline,
  IoDocumentTextOutline,
  IoLockClosedOutline,
  IoFlashOutline,
  IoLayersOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoCloudOutline,
  IoShieldCheckmarkOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
  IoRocketOutline
} from 'react-icons/io5'

export default function DevelopersContent() {
  const t = useTranslations('Developers')
  const [activeSection, setActiveSection] = useState('overview')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [copiedCode, setCopiedCode] = useState('')
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    // Handle get app click - could open modal or redirect
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    // Handle sign in click - could open modal or redirect
    window.location.href = '/portal/login'
  }

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const codeExamples = {
    javascript: {
      quickStart: `// Initialize ItWhip API Client
const ItWhip = require('@itwhip/sdk');

const client = new ItWhip({
  apiKey: process.env.ITWHIP_API_KEY,
  partnerId: 'YOUR_PARTNER_ID',
  environment: 'production'
});

// Enable car rentals for your application
await client.rentals.enable({
  instantBooking: true,
  vehicleClasses: ['economy', 'standard', 'luxury'],
  coverage: 'phoenix-metro'
});`,
      
      bookingTracking: `// Track rental bookings
client.bookings.track({
  bookingId: 'BK123456',
  callback: async (booking) => {
    if (booking.status === 'confirmed') {
      // Auto-assign vehicle
      const rental = await client.rentals.assign({
        renter: booking.renter,
        pickup: booking.pickupLocation,
        vehicleId: booking.vehicleId,
        startDate: booking.startDate
      });

      console.log('Rental ' + rental.id + ' confirmed');
    }
  }
});`,
      
      revenueTracking: '// Get real-time revenue analytics\n' +
        'const revenue = await client.analytics.getRevenue({\n' +
        '  period: \'month\',\n' +
        '  breakdown: \'daily\'\n' +
        '});\n\n' +
        'console.log(\'This month: $\' + revenue.total);\n' +
        'console.log(\'Rentals completed: \' + revenue.rentalCount);\n' +
        'console.log(\'Average per rental: $\' + revenue.average);',

      webhookSetup: `// Subscribe to real-time events
client.webhooks.subscribe({
  endpoint: 'https://your-app.com/webhooks',
  events: ['rental.started', 'rental.completed', 'rental.cancelled'],
  secret: process.env.WEBHOOK_SECRET
});

// Handle webhook events
app.post('/webhooks', (req, res) => {
  const event = req.body;

  switch(event.type) {
    case 'rental.completed':
      console.log('Rental completed:', event.data.rentalId);
      break;
    case 'rental.started':
      notifyHost(event.data.hostPhone);
      break;
  }

  res.status(200).send('OK');
});`,

      errorHandling: `// Error handling example
try {
  const rental = await client.rentals.create({
    renter: renterName,
    vehicleId: vehicleId,
    startDate: startDate,
    endDate: endDate
  });
} catch (error) {
  if (error.code === 'VEHICLE_UNAVAILABLE') {
    // Suggest alternative vehicles
    const alternatives = await client.vehicles.findSimilar(vehicleId);
  } else if (error.code === 'INVALID_LOCATION') {
    console.error('Location not in service area');
  } else {
    console.error('Unexpected error:', error.message);
  }
}`
    },
    python: {
      quickStart: `# Initialize ItWhip API Client
from itwhip import Client
import os

client = Client(
    api_key=os.environ['ITWHIP_API_KEY'],
    partner_id='YOUR_PARTNER_ID',
    environment='production'
)

# Enable car rentals for your application
client.rentals.enable(
    instant_booking=True,
    vehicle_classes=['economy', 'standard', 'luxury'],
    coverage='phoenix-metro'
)`,

      bookingTracking: '# Track rental bookings\n' +
        'def booking_confirmed(booking):\n' +
        '    if booking.status == \'confirmed\':\n' +
        '        # Auto-assign vehicle\n' +
        '        rental = client.rentals.assign(\n' +
        '            renter=booking.renter,\n' +
        '            pickup=booking.pickup_location,\n' +
        '            vehicle_id=booking.vehicle_id,\n' +
        '            start_date=booking.start_date\n' +
        '        )\n' +
        '        print("Rental " + str(rental.id) + " confirmed")\n\n' +
        'client.bookings.track(\n' +
        '    booking_id=\'BK123456\',\n' +
        '    callback=booking_confirmed\n' +
        ')',

      revenueTracking: '# Get real-time revenue analytics\n' +
        'revenue = client.analytics.get_revenue(\n' +
        '    period=\'month\',\n' +
        '    breakdown=\'daily\'\n' +
        ')\n\n' +
        'print("This month: $" + str(revenue.total))\n' +
        'print("Rentals completed: " + str(revenue.rental_count))\n' +
        'print("Average per rental: $" + str(revenue.average))',

      webhookSetup: '# Subscribe to real-time events\n' +
        'client.webhooks.subscribe(\n' +
        '    endpoint=\'https://your-app.com/webhooks\',\n' +
        '    events=[\'rental.started\', \'rental.completed\', \'rental.cancelled\'],\n' +
        '    secret=os.environ[\'WEBHOOK_SECRET\']\n' +
        ')\n\n' +
        '# Handle webhook events (Flask example)\n' +
        'from flask import Flask, request\n\n' +
        'app = Flask(__name__)\n\n' +
        '@app.route(\'/webhooks\', methods=[\'POST\'])\n' +
        'def handle_webhook():\n' +
        '    event = request.json\n' +
        '    \n' +
        '    if event[\'type\'] == \'rental.completed\':\n' +
        '        print("Rental completed: " + event[\'data\'][\'rentalId\'])\n' +
        '    elif event[\'type\'] == \'rental.started\':\n' +
        '        notify_host(event[\'data\'][\'hostPhone\'])\n' +
        '    \n' +
        '    return \'OK\', 200',

      errorHandling: '# Error handling example\n' +
        'from itwhip.exceptions import VehicleUnavailable, InvalidLocation\n\n' +
        'try:\n' +
        '    rental = client.rentals.create(\n' +
        '        renter=renter_name,\n' +
        '        vehicle_id=vehicle_id,\n' +
        '        start_date=start_date,\n' +
        '        end_date=end_date\n' +
        '    )\n' +
        'except VehicleUnavailable:\n' +
        '    # Suggest alternative vehicles\n' +
        '    alternatives = client.vehicles.find_similar(vehicle_id)\n' +
        'except InvalidLocation:\n' +
        '    print(\'Location not in service area\')\n' +
        'except Exception as e:\n' +
        '    print("Unexpected error: " + str(e))'
    },
    php: {
      quickStart: `// Initialize ItWhip API Client
require_once 'vendor/autoload.php';

use ItWhip\\Client;

$client = new Client([
    'apiKey' => $_ENV['ITWHIP_API_KEY'],
    'partnerId' => 'YOUR_PARTNER_ID',
    'environment' => 'production'
]);

// Enable car rentals for your application
$client->rentals->enable([
    'instantBooking' => true,
    'vehicleClasses' => ['economy', 'standard', 'luxury'],
    'coverage' => 'phoenix-metro'
]);`,

      bookingTracking: `// Track rental bookings
$client->bookings->track([
    'bookingId' => 'BK123456',
    'callback' => function($booking) use ($client) {
        if ($booking->status === 'confirmed') {
            // Auto-assign vehicle
            $rental = $client->rentals->assign([
                'renter' => $booking->renter,
                'pickup' => $booking->pickupLocation,
                'vehicleId' => $booking->vehicleId,
                'startDate' => $booking->startDate
            ]);

            echo "Rental " . $rental->id . " confirmed" . PHP_EOL;
        }
    }
]);`,

      revenueTracking: `// Get real-time revenue analytics
$revenue = $client->analytics->getRevenue([
    'period' => 'month',
    'breakdown' => 'daily'
]);

echo "This month: $" . $revenue->total . PHP_EOL;
echo "Rentals completed: " . $revenue->rentalCount . PHP_EOL;
echo "Average per rental: $" . $revenue->average . PHP_EOL;`,

      webhookSetup: `// Subscribe to real-time events
$client->webhooks->subscribe([
    'endpoint' => 'https://your-app.com/webhooks',
    'events' => ['rental.started', 'rental.completed', 'rental.cancelled'],
    'secret' => $_ENV['WEBHOOK_SECRET']
]);

// Handle webhook events
$payload = file_get_contents('php://input');
$event = json_decode($payload, true);

switch($event['type']) {
    case 'rental.completed':
        error_log("Rental completed: " . $event['data']['rentalId']);
        break;
    case 'rental.started':
        notifyHost($event['data']['hostPhone']);
        break;
}

http_response_code(200);
echo 'OK';`,

      errorHandling: `// Error handling example
try {
    $rental = $client->rentals->create([
        'renter' => $renterName,
        'vehicleId' => $vehicleId,
        'startDate' => $startDate,
        'endDate' => $endDate
    ]);
} catch (VehicleUnavailableException $e) {
    // Suggest alternative vehicles
    $alternatives = $client->vehicles->findSimilar($vehicleId);
} catch (InvalidLocationException $e) {
    error_log('Location not in service area');
} catch (Exception $e) {
    error_log('Unexpected error: ' . $e->getMessage());
}`
    },
    ruby: {
      quickStart: `# Initialize ItWhip API Client
require 'itwhip'

client = ItWhip::Client.new(
  api_key: ENV['ITWHIP_API_KEY'],
  partner_id: 'YOUR_PARTNER_ID',
  environment: 'production'
)

# Enable car rentals for your application
client.rentals.enable(
  instant_booking: true,
  vehicle_classes: ['economy', 'standard', 'luxury'],
  coverage: 'phoenix-metro'
)`,

      bookingTracking: `# Track rental bookings
client.bookings.track(
  booking_id: 'BK123456'
) do |booking|
  if booking.status == 'confirmed'
    # Auto-assign vehicle
    rental = client.rentals.assign(
      renter: booking.renter,
      pickup: booking.pickup_location,
      vehicle_id: booking.vehicle_id,
      start_date: booking.start_date
    )

    puts "Rental #{rental.id} confirmed"
  end
end`,

      revenueTracking: `# Get real-time revenue analytics
revenue = client.analytics.get_revenue(
  period: 'month',
  breakdown: 'daily'
)

puts "This month: $#{revenue.total}"
puts "Rentals completed: #{revenue.rental_count}"
puts "Average per rental: $#{revenue.average}"`,

      webhookSetup: `# Subscribe to real-time events
client.webhooks.subscribe(
  endpoint: 'https://your-app.com/webhooks',
  events: ['rental.started', 'rental.completed', 'rental.cancelled'],
  secret: ENV['WEBHOOK_SECRET']
)

# Handle webhook events (Sinatra example)
require 'sinatra'

post '/webhooks' do
  event = JSON.parse(request.body.read)

  case event['type']
  when 'rental.completed'
    puts "Rental completed: #{event['data']['rentalId']}"
  when 'rental.started'
    notify_host(event['data']['hostPhone'])
  end

  status 200
  'OK'
end`,

      errorHandling: `# Error handling example
begin
  rental = client.rentals.create(
    renter: renter_name,
    vehicle_id: vehicle_id,
    start_date: start_date,
    end_date: end_date
  )
rescue ItWhip::VehicleUnavailable => e
  # Suggest alternative vehicles
  alternatives = client.vehicles.find_similar(vehicle_id)
rescue ItWhip::InvalidLocation => e
  puts 'Location not in service area'
rescue StandardError => e
  puts "Unexpected error: #{e.message}"
end`
    },
    java: {
      quickStart: `// Initialize ItWhip API Client
import com.itwhip.Client;
import com.itwhip.RentalOptions;

Client client = new Client.Builder()
    .apiKey(System.getenv("ITWHIP_API_KEY"))
    .partnerId("YOUR_PARTNER_ID")
    .environment("production")
    .build();

// Enable car rentals for your application
RentalOptions options = new RentalOptions.Builder()
    .instantBooking(true)
    .vehicleClasses("economy", "standard", "luxury")
    .coverage("phoenix-metro")
    .build();

client.rentals().enable(options);`,

      bookingTracking: `// Track rental bookings
client.bookings().track("BK123456", booking -> {
    if (booking.getStatus().equals("confirmed")) {
        // Auto-assign vehicle
        Rental rental = client.rentals().assign(
            new AssignRequest.Builder()
                .renter(booking.getRenter())
                .pickup(booking.getPickupLocation())
                .vehicleId(booking.getVehicleId())
                .startDate(booking.getStartDate())
                .build()
        );

        System.out.println("Rental " + rental.getId() + " confirmed");
    }
});`,

      revenueTracking: `// Get real-time revenue analytics
Revenue revenue = client.analytics().getRevenue(
    new RevenueRequest.Builder()
        .period("month")
        .breakdown("daily")
        .build()
);

System.out.println("This month: $" + revenue.getTotal());
System.out.println("Rentals completed: " + revenue.getRentalCount());
System.out.println("Average per rental: $" + revenue.getAverage());`,

      webhookSetup: `// Subscribe to real-time events
client.webhooks().subscribe(
    new WebhookSubscription.Builder()
        .endpoint("https://your-app.com/webhooks")
        .events("rental.started", "rental.completed", "rental.cancelled")
        .secret(System.getenv("WEBHOOK_SECRET"))
        .build()
);

// Handle webhook events (Spring Boot example)
@RestController
public class WebhookController {

    @PostMapping("/webhooks")
    public ResponseEntity<String> handleWebhook(@RequestBody Event event) {
        switch(event.getType()) {
            case "rental.completed":
                System.out.println("Rental completed: " + event.getData().getRentalId());
                break;
            case "rental.started":
                notifyHost(event.getData().getHostPhone());
                break;
        }

        return ResponseEntity.ok("OK");
    }
}`,

      errorHandling: `// Error handling example
try {
    Rental rental = client.rentals().create(
        new CreateRequest.Builder()
            .renter(renterName)
            .vehicleId(vehicleId)
            .startDate(startDate)
            .endDate(endDate)
            .build()
    );
} catch (VehicleUnavailableException e) {
    // Suggest alternative vehicles
    List<Vehicle> alternatives = client.vehicles().findSimilar(vehicleId);
} catch (InvalidLocationException e) {
    System.err.println("Location not in service area");
} catch (Exception e) {
    System.err.println("Unexpected error: " + e.getMessage());
}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black">
      {/* Main Header Component with Full Navigation */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleGetAppClick={handleGetAppClick}
        handleSearchClick={handleSearchClick}
      />

      {/* Page Title Section - Below Header */}
      <div className="mt-14 md:mt-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoCodeSlashOutline className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('pageTitle')}
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/sdk" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                {t('nav.sdkDocs')}
              </Link>
              <Link href="/integrations" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                {t('nav.integrations')}
              </Link>
              <Link href="/gds" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                {t('nav.gdsSystems')}
              </Link>
              <Link href="/portal/login" className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700">
                {t('nav.portalAccess')}
              </Link>
            </div>
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
                href="/sdk" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoCodeSlashOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">{t('nav.sdkDocs')}</span>
              </Link>
              <Link
                href="/integrations"
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoLayersOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">{t('nav.integrations')}</span>
              </Link>
              <Link
                href="/gds"
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoServerOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">{t('nav.gdsSystems')}</span>
              </Link>
              {/* Portal Access - Now part of the scrollable area */}
              <Link
                href="/portal/login"
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoRocketOutline className="w-4 h-4 flex-shrink-0" />
                <span>{t('nav.portalAccess')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Section Selector - Connected directly to nav above */}
      <div className="lg:hidden sticky top-[94px] z-40 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-2">
          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">
            {t('sectionSelector')}
          </label>
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-no-repeat bg-right pr-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="overview">{t('sections.overview')}</option>
            <option value="quickstart">{t('sections.quickStart')}</option>
            <option value="authentication">{t('sections.authentication')}</option>
            <option value="endpoints">{t('sections.apiEndpoints')}</option>
            <option value="webhooks">{t('sections.webhooks')}</option>
            <option value="testing">{t('sections.testing')}</option>
            <option value="errors">{t('sections.errorHandling')}</option>
            <option value="rate-limits">{t('sections.rateLimits')}</option>
            <option value="security">{t('sections.security')}</option>
          </select>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden lg:block w-64 border-r border-gray-200 dark:border-gray-800 min-h-screen bg-white dark:bg-gray-950">
          <nav className="p-6 space-y-1 sticky top-[88px]">
            {[
              { id: 'overview', labelKey: 'sections.overview', icon: IoDocumentTextOutline },
              { id: 'quickstart', labelKey: 'sections.quickStart', icon: IoFlashOutline },
              { id: 'authentication', labelKey: 'sections.authentication', icon: IoLockClosedOutline },
              { id: 'endpoints', labelKey: 'sections.apiEndpoints', icon: IoServerOutline },
              { id: 'webhooks', labelKey: 'sections.webhooks', icon: IoGitBranchOutline },
              { id: 'testing', labelKey: 'sections.testing', icon: IoTerminalOutline },
              { id: 'errors', labelKey: 'sections.errorHandling', icon: IoWarningOutline },
              { id: 'rate-limits', labelKey: 'sections.rateLimits', icon: IoCloudOutline },
              { id: 'security', labelKey: 'sections.security', icon: IoShieldCheckmarkOutline }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{t(item.labelKey)}</span>
              </button>
            ))}
          </nav>

          {/* API Status */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{t('sidebar.apiStatus')}</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">{t('sidebar.operational')}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{t('sidebar.version')}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">v3.2.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{t('sidebar.uptime')}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">99.99%</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Getting Started Alert */}
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <IoFlashOutline className="w-5 h-5 text-amber-600 mt-0.5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  {t('alert.title')}
                </h3>
                <p className="text-xs mt-1 text-amber-800 dark:text-amber-200">
                  {t('alert.description')}
                </p>
                <button
                  onClick={() => setActiveSection('quickstart')}
                  className="mt-2 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400"
                >
                  {t('alert.jumpToQuickStart')}
                </button>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {t('apiDocumentation')}
            </h1>
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
              <span className="text-xs sm:text-sm text-gray-500">{t('language')}:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>

          {/* Content Sections - Keeping all existing content */}
          {activeSection === 'overview' && (
            <div className="space-y-6 sm:space-y-8">
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('sections.overview')}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                  {t('overview.description')}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">487</div>
                    <div className="text-xs text-gray-500">{t('overview.stats.activePartners')}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">2.5M</div>
                    <div className="text-xs text-gray-500">{t('overview.stats.apiCallsDay')}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">99.99%</div>
                    <div className="text-xs text-gray-500">{t('overview.stats.uptimeSla')}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">&lt;200ms</div>
                    <div className="text-xs text-gray-500">{t('overview.stats.responseTime')}</div>
                  </div>
                </div>

                {/* Key Features */}
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {[
                    {
                      icon: IoFlashOutline,
                      titleKey: 'overview.features.realTimeDispatch.title',
                      descKey: 'overview.features.realTimeDispatch.description'
                    },
                    {
                      icon: IoLayersOutline,
                      titleKey: 'overview.features.fleetIntegration.title',
                      descKey: 'overview.features.fleetIntegration.description'
                    },
                    {
                      icon: IoServerOutline,
                      titleKey: 'overview.features.restfulApi.title',
                      descKey: 'overview.features.restfulApi.description'
                    },
                    {
                      icon: IoShieldCheckmarkOutline,
                      titleKey: 'overview.features.enterpriseSecurity.title',
                      descKey: 'overview.features.enterpriseSecurity.description'
                    }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                          {t(feature.titleKey)}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {t(feature.descKey)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Base URL */}
                <div className="bg-gray-900 dark:bg-black rounded-lg p-3 sm:p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">{t('overview.baseUrl')}</span>
                    <button
                      onClick={() => copyToClipboard('https://api.itwhip.com/v3', 'base-url')}
                      className="text-xs text-amber-500 hover:text-amber-400 flex items-center space-x-1"
                    >
                      {copiedCode === 'base-url' ? (
                        <>
                          <IoCheckmarkOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{t('copied')}</span>
                        </>
                      ) : (
                        <>
                          <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{t('copy')}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <code className="text-green-400 font-mono text-xs sm:text-sm break-all">
                    https://api.itwhip.com/v3
                  </code>
                </div>

                {/* SDK Libraries */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    {t('overview.officialSdks')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['JavaScript', 'Python', 'PHP', 'Ruby', 'Java', 'Go', '.NET', 'Swift'].map((lang) => (
                      <span key={lang} className="px-2 py-1 bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeSection === 'quickstart' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('quickstart.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('quickstart.description')}
                </p>

                {/* Step 1 */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('quickstart.step1')}
                  </h3>
                  <div className="bg-gray-900 dark:bg-black rounded-lg p-3 sm:p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">
                        {selectedLanguage === 'javascript' && 'NPM'}
                        {selectedLanguage === 'python' && 'PIP'}
                        {selectedLanguage === 'php' && 'COMPOSER'}
                        {selectedLanguage === 'ruby' && 'GEM'}
                        {selectedLanguage === 'java' && 'MAVEN'}
                      </span>
                      <button
                        onClick={() => {
                          const installCommands: { [key: string]: string } = {
                            javascript: 'npm install @itwhip/sdk',
                            python: 'pip install itwhip',
                            php: 'composer require itwhip/sdk',
                            ruby: 'gem install itwhip',
                            java: '<dependency>\n  <groupId>com.itwhip</groupId>\n  <artifactId>sdk</artifactId>\n  <version>3.2.1</version>\n</dependency>'
                          }
                          copyToClipboard(installCommands[selectedLanguage], 'install')
                        }}
                        className="text-xs text-amber-500 hover:text-amber-400 flex items-center space-x-1"
                      >
                        {copiedCode === 'install' ? (
                          <>
                            <IoCheckmarkOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t('copied')}</span>
                          </>
                        ) : (
                          <>
                            <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t('copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <pre className="text-green-400 font-mono text-xs sm:text-sm">
                        {selectedLanguage === 'javascript' && 'npm install @itwhip/sdk'}
                        {selectedLanguage === 'python' && 'pip install itwhip'}
                        {selectedLanguage === 'php' && 'composer require itwhip/sdk'}
                        {selectedLanguage === 'ruby' && 'gem install itwhip'}
                        {selectedLanguage === 'java' && `<dependency>
  <groupId>com.itwhip</groupId>
  <artifactId>sdk</artifactId>
  <version>3.2.1</version>
</dependency>`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('quickstart.step2')}
                  </h3>
                  <div className="bg-gray-900 dark:bg-black rounded-lg p-3 sm:p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">
                        {selectedLanguage.toUpperCase()}
                      </span>
                      <button
                        onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].quickStart, 'quickstart')}
                        className="text-xs text-amber-500 hover:text-amber-400 flex items-center space-x-1"
                      >
                        {copiedCode === 'quickstart' ? (
                          <>
                            <IoCheckmarkOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t('copied')}</span>
                          </>
                        ) : (
                          <>
                            <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t('copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <pre className="text-green-400 font-mono text-xs sm:text-sm whitespace-pre">
                        {codeExamples[selectedLanguage as keyof typeof codeExamples].quickStart}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('quickstart.step3')}
                  </h3>
                  <div className="bg-gray-900 dark:bg-black rounded-lg p-3 sm:p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">
                        {selectedLanguage.toUpperCase()}
                      </span>
                      <button
                        onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].bookingTracking, 'booking')}
                        className="text-xs text-amber-500 hover:text-amber-400 flex items-center space-x-1"
                      >
                        {copiedCode === 'booking' ? (
                          <>
                            <IoCheckmarkOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t('copied')}</span>
                          </>
                        ) : (
                          <>
                            <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t('copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <pre className="text-green-400 font-mono text-xs sm:text-sm whitespace-pre">
                        {codeExamples[selectedLanguage as keyof typeof codeExamples].bookingTracking}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('quickstart.step4')}
                  </h3>
                  <div className="bg-gray-900 dark:bg-black rounded-lg p-3 sm:p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">
                        {selectedLanguage.toUpperCase()}
                      </span>
                      <button
                        onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].revenueTracking, 'revenue')}
                        className="text-xs text-amber-500 hover:text-amber-400 flex items-center space-x-1"
                      >
                        {copiedCode === 'revenue' ? (
                          <>
                            <IoCheckmarkOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t('copied')}</span>
                          </>
                        ) : (
                          <>
                            <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t('copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <pre className="text-green-400 font-mono text-xs sm:text-sm whitespace-pre">
                        {codeExamples[selectedLanguage as keyof typeof codeExamples].revenueTracking}
                      </pre>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeSection === 'authentication' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('sections.authentication')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('auth.description')}
                </p>

                {/* API Key Example */}
                <div className="bg-gray-900 dark:bg-black rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">{t('auth.headerLabel')}</span>
                    <button
                      onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth')}
                      className="text-xs text-amber-500 hover:text-amber-400 flex items-center space-x-1"
                    >
                      {copiedCode === 'auth' ? (
                        <>
                          <IoCheckmarkOutline className="w-4 h-4" />
                          <span>{t('copied')}</span>
                        </>
                      ) : (
                        <>
                          <IoCopyOutline className="w-4 h-4" />
                          <span>{t('copy')}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <code className="text-green-400 font-mono">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>

                {/* Security Notice */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex space-x-3">
                    <IoWarningOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                        {t('auth.securityBestPractices')}
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-200">
                        <li>{t('auth.practices.noExpose')}</li>
                        <li>{t('auth.practices.rotateKeys')}</li>
                        <li>{t('auth.practices.envVars')}</li>
                        <li>{t('auth.practices.ipWhitelist')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeSection === 'endpoints' && (
            <div className="space-y-6 sm:space-y-8">
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('sections.apiEndpoints')}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                  {t('endpoints.description')}
                </p>

                {/* API Response Time Badge */}
                <div className="mb-6 inline-flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-700 dark:text-green-300">{t('endpoints.allSystemsOperational')}</span>
                </div>

                {/* Endpoints List - Mobile Optimized */}
                <div className="space-y-3 sm:space-y-4">
                  {[
                    {
                      method: 'GET',
                      endpoint: '/vehicles/{vehicleId}',
                      descKey: 'endpoints.items.getVehicle',
                      responseTime: '45ms'
                    },
                    {
                      method: 'POST',
                      endpoint: '/rentals/create',
                      descKey: 'endpoints.items.createRental',
                      responseTime: '120ms'
                    },
                    {
                      method: 'GET',
                      endpoint: '/rentals/{rentalId}',
                      descKey: 'endpoints.items.getRental',
                      responseTime: '35ms'
                    },
                    {
                      method: 'POST',
                      endpoint: '/bookings/track',
                      descKey: 'endpoints.items.trackBooking',
                      responseTime: '85ms'
                    },
                    {
                      method: 'GET',
                      endpoint: '/analytics/revenue',
                      descKey: 'endpoints.items.getRevenue',
                      responseTime: '150ms'
                    },
                    {
                      method: 'POST',
                      endpoint: '/webhooks/subscribe',
                      descKey: 'endpoints.items.subscribeWebhooks',
                      responseTime: '55ms'
                    },
                    {
                      method: 'GET',
                      endpoint: '/vehicles/available',
                      descKey: 'endpoints.items.checkAvailable',
                      responseTime: '75ms'
                    },
                    {
                      method: 'PUT',
                      endpoint: '/rentals/{rentalId}/cancel',
                      descKey: 'endpoints.items.cancelRental',
                      responseTime: '95ms'
                    },
                    {
                      method: 'GET',
                      endpoint: '/reports/monthly',
                      descKey: 'endpoints.items.monthlyReports',
                      responseTime: '250ms'
                    },
                    {
                      method: 'POST',
                      endpoint: '/renters/notify',
                      descKey: 'endpoints.items.notifyRenters',
                      responseTime: '65ms'
                    }
                  ].map((endpoint, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 sm:p-4 hover:border-amber-500 transition-colors cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            endpoint.method === 'GET' 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : endpoint.method === 'POST'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="text-xs sm:text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                            {endpoint.endpoint}
                          </code>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ~{endpoint.responseTime}
                        </span>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {t(endpoint.descKey)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Try It Out Button */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t('endpoints.explorer.title')}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {t('endpoints.explorer.description')}
                      </p>
                    </div>
                    <Link
                      href="/api-explorer"
                      className="px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-700"
                    >
                      {t('endpoints.explorer.tryNow')}
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Webhooks Section */}
          {activeSection === 'webhooks' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('sections.webhooks')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('webhooks.description')}
                </p>

                {/* Webhook Setup */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('webhooks.settingUp')}
                  </h3>
                  <div className="bg-gray-900 dark:bg-black rounded-lg p-3 sm:p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">
                        {selectedLanguage.toUpperCase()}
                      </span>
                      <button
                        onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].webhookSetup, 'webhook')}
                        className="text-xs text-amber-500 hover:text-amber-400 flex items-center space-x-1"
                      >
                        {copiedCode === 'webhook' ? (
                          <>
                            <IoCheckmarkOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t('copied')}</span>
                          </>
                        ) : (
                          <>
                            <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t('copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <pre className="text-green-400 font-mono text-xs sm:text-sm whitespace-pre">
                        {codeExamples[selectedLanguage as keyof typeof codeExamples].webhookSetup}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Available Events */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    {t('webhooks.availableEvents')}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { event: 'rental.requested', descKey: 'webhooks.events.rentalRequested' },
                      { event: 'rental.confirmed', descKey: 'webhooks.events.rentalConfirmed' },
                      { event: 'rental.pickup', descKey: 'webhooks.events.rentalPickup' },
                      { event: 'rental.started', descKey: 'webhooks.events.rentalStarted' },
                      { event: 'rental.completed', descKey: 'webhooks.events.rentalCompleted' },
                      { event: 'rental.cancelled', descKey: 'webhooks.events.rentalCancelled' },
                      { event: 'payment.processed', descKey: 'webhooks.events.paymentProcessed' },
                      { event: 'vehicle.location', descKey: 'webhooks.events.vehicleLocation' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800 last:border-0">
                        <code className="text-sm font-mono text-amber-600">{item.event}</code>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t(item.descKey)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Testing Section */}
          {activeSection === 'testing' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('testing.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('testing.description')}
                </p>

                {/* Test Credentials */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    {t('testing.credentials')}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">{t('testing.sandboxUrl')}:</span>
                      <code className="block mt-1 text-sm font-mono text-amber-600">
                        https://sandbox.api.itwhip.com/v3
                      </code>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{t('testing.testApiKey')}:</span>
                      <code className="block mt-1 text-sm font-mono text-amber-600">
                        test_key_a1b2c3d4e5f6g7h8i9j0
                      </code>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{t('testing.testPartnerId')}:</span>
                      <code className="block mt-1 text-sm font-mono text-amber-600">
                        TEST_PARTNER_PHX_001
                      </code>
                    </div>
                  </div>
                </div>

                {/* Test Cards */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex space-x-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                        {t('testing.testModeFeatures')}
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                        <li>{t('testing.features.simulatedRentals')}</li>
                        <li>{t('testing.features.mockData')}</li>
                        <li>{t('testing.features.instantWebhooks')}</li>
                        <li>{t('testing.features.noCharges')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Error Handling */}
          {activeSection === 'errors' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('sections.errorHandling')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('errors.description')}
                </p>

                {/* Error Code Example */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('errors.exampleTitle')}
                  </h3>
                  <div className="bg-gray-900 dark:bg-black rounded-lg p-3 sm:p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">
                        {selectedLanguage.toUpperCase()}
                      </span>
                      <button
                        onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].errorHandling, 'error')}
                        className="text-xs text-amber-500 hover:text-amber-400 flex items-center space-x-1"
                      >
                        {copiedCode === 'error' ? (
                          <>
                            <IoCheckmarkOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t('copied')}</span>
                          </>
                        ) : (
                          <>
                            <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t('copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <pre className="text-green-400 font-mono text-xs sm:text-sm whitespace-pre">
                        {codeExamples[selectedLanguage as keyof typeof codeExamples].errorHandling}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Error Codes Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 dark:border-gray-800 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          {t('errors.table.errorCode')}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          {t('errors.table.description')}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          {t('errors.table.action')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr>
                        <td className="px-4 py-3 text-sm font-mono text-amber-600">VEHICLE_UNAVAILABLE</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('errors.codes.vehicleUnavailable.desc')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('errors.codes.vehicleUnavailable.action')}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-mono text-amber-600">INVALID_LOCATION</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('errors.codes.invalidLocation.desc')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('errors.codes.invalidLocation.action')}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-mono text-amber-600">PAYMENT_FAILED</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('errors.codes.paymentFailed.desc')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('errors.codes.paymentFailed.action')}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-mono text-amber-600">RATE_LIMIT_EXCEEDED</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('errors.codes.rateLimitExceeded.desc')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('errors.codes.rateLimitExceeded.action')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* Rate Limits */}
          {activeSection === 'rate-limits' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('sections.rateLimits')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('rateLimits.description')}
                </p>

                {/* Rate Limit Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 dark:border-gray-800 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          {t('rateLimits.table.planTier')}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          {t('rateLimits.table.requestsMin')}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          {t('rateLimits.table.requestsDay')}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          {t('rateLimits.table.burstLimit')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('rateLimits.tiers.basic')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">60</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">10,000</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">100</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('rateLimits.tiers.premium')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">300</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">100,000</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">500</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('rateLimits.tiers.enterprise')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('rateLimits.unlimited')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('rateLimits.unlimited')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('rateLimits.custom')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Rate Limit Headers */}
                <div className="mt-6 bg-gray-900 dark:bg-black rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">{t('rateLimits.headersTitle')}</h3>
                  <pre className="text-green-400 font-mono text-sm">
{`X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1640995200`}
                  </pre>
                </div>
              </section>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="space-y-6 sm:space-y-8">
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('security.title')}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                  {t('security.description')}
                </p>

                {/* Security Certifications Banner */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">
                        {t('security.bankLevel')}
                      </h3>
                      <p className="text-xs mt-1 text-green-800 dark:text-green-200">
                        {t('security.bankLevelDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compliance Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { certKey: 'security.certs.soc2.name', descKey: 'security.certs.soc2.desc' },
                    { certKey: 'security.certs.pci.name', descKey: 'security.certs.pci.desc' },
                    { certKey: 'security.certs.iso.name', descKey: 'security.certs.iso.desc' },
                    { certKey: 'security.certs.gdpr.name', descKey: 'security.certs.gdpr.desc' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-800">
                      <IoCheckmarkCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">{t(item.certKey)}</div>
                      <div className="text-xs text-gray-500 mt-1">{t(item.descKey)}</div>
                    </div>
                  ))}
                </div>

                {/* Security Features */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('security.enterpriseFeatures')}
                  </h3>

                  {[
                    {
                      icon: IoLockClosedOutline,
                      titleKey: 'security.features.encryption.title',
                      descKey: 'security.features.encryption.description',
                      detailKey: 'security.features.encryption.details'
                    },
                    {
                      icon: IoShieldCheckmarkOutline,
                      titleKey: 'security.features.zeroTrust.title',
                      descKey: 'security.features.zeroTrust.description',
                      detailKey: 'security.features.zeroTrust.details'
                    },
                    {
                      icon: IoServerOutline,
                      titleKey: 'security.features.redundant.title',
                      descKey: 'security.features.redundant.description',
                      detailKey: 'security.features.redundant.details'
                    },
                    {
                      icon: IoCloudOutline,
                      titleKey: 'security.features.ddos.title',
                      descKey: 'security.features.ddos.description',
                      detailKey: 'security.features.ddos.details'
                    }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex space-x-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <feature.icon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {t(feature.titleKey)}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {t(feature.descKey)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                          {t(feature.detailKey)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Data Protection */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-sm">
                    {t('security.dataProtection.title')}
                  </h3>
                  <ul className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>{t('security.dataProtection.pii.label')}</strong> {t('security.dataProtection.pii.text')}</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>{t('security.dataProtection.retention.label')}</strong> {t('security.dataProtection.retention.text')}</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>{t('security.dataProtection.accessLogs.label')}</strong> {t('security.dataProtection.accessLogs.text')}</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>{t('security.dataProtection.gdprRights.label')}</strong> {t('security.dataProtection.gdprRights.text')}</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>{t('security.dataProtection.tokenization.label')}</strong> {t('security.dataProtection.tokenization.text')}</span>
                    </li>
                  </ul>
                </div>

                {/* Contact Security Team */}
                <div className="mt-6 text-center p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('security.contactTitle')}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {t('security.contactDesc')}
                  </p>
                  <a href="mailto:info@itwhip.com" className="text-sm font-semibold text-amber-600 hover:text-amber-700">
                    info@itwhip.com
                  </a>
                </div>
              </section>
            </div>
          )}
          
        </main>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('footer.title')}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              {t('footer.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/portal/login"
                className="px-6 sm:px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
              >
                {t('footer.accessPortal')}
              </Link>
              <Link
                href="/contact"
                className="px-6 sm:px-8 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold"
              >
                {t('footer.contactSales')}
              </Link>
            </div>

            {/* Hidden but discoverable */}
            <p className="mt-8 text-xs text-gray-400">
              {t('footer.verifyIntegration')}{' '}
              <Link href="/portal/login" className="text-amber-600 hover:underline">
                {t('footer.partnerPortal')}
              </Link>
              {' '}{t('footer.usingCredentials')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
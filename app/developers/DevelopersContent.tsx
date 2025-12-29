// app/developers/DevelopersContent.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
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
                Developer Documentation
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/sdk" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                SDK Docs
              </Link>
              <Link href="/integrations" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                Integrations
              </Link>
              <Link href="/gds" className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600">
                GDS Systems
              </Link>
              <Link href="/portal/login" className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700">
                Portal Access
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
                <span className="text-xs font-medium">SDK Docs</span>
              </Link>
              <Link 
                href="/integrations" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoLayersOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Integrations</span>
              </Link>
              <Link 
                href="/gds" 
                className="flex items-center space-x-1.5 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800 min-w-fit"
              >
                <IoServerOutline className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">GDS Systems</span>
              </Link>
              {/* Portal Access - Now part of the scrollable area */}
              <Link 
                href="/portal/login" 
                className="flex items-center space-x-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold whitespace-nowrap min-w-fit"
              >
                <IoRocketOutline className="w-4 h-4 flex-shrink-0" />
                <span>Portal Access</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Section Selector - Connected directly to nav above */}
      <div className="lg:hidden sticky top-[94px] z-40 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-2">
          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">
            Documentation Section
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
            <option value="overview">Overview</option>
            <option value="quickstart">Quick Start</option>
            <option value="authentication">Authentication</option>
            <option value="endpoints">API Endpoints</option>
            <option value="webhooks">Webhooks</option>
            <option value="testing">Testing</option>
            <option value="errors">Error Handling</option>
            <option value="rate-limits">Rate Limits</option>
            <option value="security">Security</option>
          </select>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden lg:block w-64 border-r border-gray-200 dark:border-gray-800 min-h-screen bg-white dark:bg-gray-950">
          <nav className="p-6 space-y-1 sticky top-[88px]">
            {[
              { id: 'overview', label: 'Overview', icon: IoDocumentTextOutline },
              { id: 'quickstart', label: 'Quick Start', icon: IoFlashOutline },
              { id: 'authentication', label: 'Authentication', icon: IoLockClosedOutline },
              { id: 'endpoints', label: 'API Endpoints', icon: IoServerOutline },
              { id: 'webhooks', label: 'Webhooks', icon: IoGitBranchOutline },
              { id: 'testing', label: 'Testing', icon: IoTerminalOutline },
              { id: 'errors', label: 'Error Handling', icon: IoWarningOutline },
              { id: 'rate-limits', label: 'Rate Limits', icon: IoCloudOutline },
              { id: 'security', label: 'Security', icon: IoShieldCheckmarkOutline }
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
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* API Status */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">API Status</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">Operational</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Version</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">v3.2.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Uptime</span>
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
                  New to ItWhip API?
                </h3>
                <p className="text-xs mt-1 text-amber-800 dark:text-amber-200">
                  Start with our Quick Start guide to integrate in under 15 minutes.
                  Your app can start connecting renters with vehicles immediately.
                </p>
                <button 
                  onClick={() => setActiveSection('quickstart')}
                  className="mt-2 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400"
                >
                  Jump to Quick Start →
                </button>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              API Documentation
            </h1>
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
              <span className="text-xs sm:text-sm text-gray-500">Language:</span>
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
                  Overview
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                  The ItWhip API provides programmatic access to our P2P car rental platform,
                  allowing partners to integrate vehicle rentals directly into their
                  applications and fleet management systems.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">487</div>
                    <div className="text-xs text-gray-500">Active Partners</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">2.5M</div>
                    <div className="text-xs text-gray-500">API Calls/Day</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">99.99%</div>
                    <div className="text-xs text-gray-500">Uptime SLA</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">&lt;200ms</div>
                    <div className="text-xs text-gray-500">Response Time</div>
                  </div>
                </div>

                {/* Key Features */}
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {[
                    {
                      icon: IoFlashOutline,
                      title: 'Real-time Dispatch',
                      description: 'Instant ride dispatch with sub-second response times'
                    },
                    {
                      icon: IoLayersOutline,
                      title: 'Fleet Integration',
                      description: 'Seamless integration with fleet management and booking systems'
                    },
                    {
                      icon: IoServerOutline,
                      title: 'RESTful API',
                      description: 'Simple REST architecture with JSON responses'
                    },
                    {
                      icon: IoShieldCheckmarkOutline,
                      title: 'Enterprise Security',
                      description: 'SOC 2 compliant with 256-bit SSL encryption'
                    }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Base URL */}
                <div className="bg-gray-900 dark:bg-black rounded-lg p-3 sm:p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">BASE URL</span>
                    <button
                      onClick={() => copyToClipboard('https://api.itwhip.com/v3', 'base-url')}
                      className="text-xs text-amber-500 hover:text-amber-400 flex items-center space-x-1"
                    >
                      {copiedCode === 'base-url' ? (
                        <>
                          <IoCheckmarkOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Copied!</span>
                        </>
                      ) : (
                        <>
                          <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Copy</span>
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
                    Official SDKs Available
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
                  Quick Start Guide
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get started with the ItWhip API in minutes. Follow these simple steps to
                  enable car rentals for your application.
                </p>

                {/* Step 1 */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step 1: Install SDK
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
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Copy</span>
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
                    Step 2: Initialize Client
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
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Copy</span>
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
                    Step 3: Track Bookings
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
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Copy</span>
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
                    Step 4: Track Revenue
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
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Copy</span>
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
                  Authentication
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  All API requests require authentication using your API key. Include your 
                  key in the Authorization header of every request.
                </p>

                {/* API Key Example */}
                <div className="bg-gray-900 dark:bg-black rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">AUTHORIZATION HEADER</span>
                    <button
                      onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth')}
                      className="text-xs text-amber-500 hover:text-amber-400 flex items-center space-x-1"
                    >
                      {copiedCode === 'auth' ? (
                        <>
                          <IoCheckmarkOutline className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <IoCopyOutline className="w-4 h-4" />
                          <span>Copy</span>
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
                        Security Best Practices
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-200">
                        <li>• Never expose your API key in client-side code</li>
                        <li>• Rotate your API keys regularly</li>
                        <li>• Use environment variables to store keys</li>
                        <li>• Implement IP whitelisting for production</li>
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
                  API Endpoints
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                  Complete reference for all available API endpoints. Click any endpoint for details.
                </p>

                {/* API Response Time Badge */}
                <div className="mb-6 inline-flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-700 dark:text-green-300">All systems operational</span>
                </div>

                {/* Endpoints List - Mobile Optimized */}
                <div className="space-y-3 sm:space-y-4">
                  {[
                    {
                      method: 'GET',
                      endpoint: '/vehicles/{vehicleId}',
                      description: 'Get vehicle details and availability',
                      responseTime: '45ms'
                    },
                    {
                      method: 'POST',
                      endpoint: '/rentals/create',
                      description: 'Create a new rental booking',
                      responseTime: '120ms'
                    },
                    {
                      method: 'GET',
                      endpoint: '/rentals/{rentalId}',
                      description: 'Get rental status and details',
                      responseTime: '35ms'
                    },
                    {
                      method: 'POST',
                      endpoint: '/bookings/track',
                      description: 'Track booking for status updates',
                      responseTime: '85ms'
                    },
                    {
                      method: 'GET',
                      endpoint: '/analytics/revenue',
                      description: 'Get revenue analytics and reports',
                      responseTime: '150ms'
                    },
                    {
                      method: 'POST',
                      endpoint: '/webhooks/subscribe',
                      description: 'Subscribe to real-time event webhooks',
                      responseTime: '55ms'
                    },
                    {
                      method: 'GET',
                      endpoint: '/vehicles/available',
                      description: 'Check available vehicles in area',
                      responseTime: '75ms'
                    },
                    {
                      method: 'PUT',
                      endpoint: '/rentals/{rentalId}/cancel',
                      description: 'Cancel an active rental',
                      responseTime: '95ms'
                    },
                    {
                      method: 'GET',
                      endpoint: '/reports/monthly',
                      description: 'Generate monthly revenue reports',
                      responseTime: '250ms'
                    },
                    {
                      method: 'POST',
                      endpoint: '/renters/notify',
                      description: 'Send notifications to renters',
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
                        {endpoint.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Try It Out Button */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Interactive API Explorer
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Test endpoints directly in your browser
                      </p>
                    </div>
                    <Link
                      href="/api-explorer"
                      className="px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-700"
                    >
                      Try Now
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
                  Webhooks
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Subscribe to real-time events to stay updated on ride status, driver locations, and more.
                </p>

                {/* Webhook Setup */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Setting Up Webhooks
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
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Copy</span>
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
                    Available Events
                  </h3>
                  <div className="space-y-3">
                    {[
                      { event: 'rental.requested', description: 'New rental requested by renter' },
                      { event: 'rental.confirmed', description: 'Host confirmed the rental' },
                      { event: 'rental.pickup', description: 'Vehicle picked up by renter' },
                      { event: 'rental.started', description: 'Rental period has started' },
                      { event: 'rental.completed', description: 'Rental completed successfully' },
                      { event: 'rental.cancelled', description: 'Rental was cancelled' },
                      { event: 'payment.processed', description: 'Payment processed successfully' },
                      { event: 'vehicle.location', description: 'Real-time vehicle location update' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800 last:border-0">
                        <code className="text-sm font-mono text-amber-600">{item.event}</code>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.description}</span>
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
                  Testing Environment
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Use our sandbox environment to test your integration without affecting 
                  production data or incurring charges.
                </p>

                {/* Test Credentials */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Test Credentials
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Sandbox URL:</span>
                      <code className="block mt-1 text-sm font-mono text-amber-600">
                        https://sandbox.api.itwhip.com/v3
                      </code>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Test API Key:</span>
                      <code className="block mt-1 text-sm font-mono text-amber-600">
                        test_key_a1b2c3d4e5f6g7h8i9j0
                      </code>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Test Partner ID:</span>
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
                        Test Mode Features
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                        <li>• Simulated rentals (no real bookings)</li>
                        <li>• Mock vehicle data for testing</li>
                        <li>• Instant webhook callbacks</li>
                        <li>• No charges or real transactions</li>
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
                  Error Handling
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Learn how to handle common errors and edge cases in your integration.
                </p>

                {/* Error Code Example */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Error Handling Example
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
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <IoCopyOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Copy</span>
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
                          Error Code
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr>
                        <td className="px-4 py-3 text-sm font-mono text-amber-600">VEHICLE_UNAVAILABLE</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Vehicle not available</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Find similar vehicles</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-mono text-amber-600">INVALID_LOCATION</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Location not serviced</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Check coverage area</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-mono text-amber-600">PAYMENT_FAILED</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Payment processing failed</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Retry or use alternate</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-mono text-amber-600">RATE_LIMIT_EXCEEDED</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Too many requests</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Wait and retry</td>
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
                  Rate Limits
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  API rate limits vary by plan tier. All rate limits are per API key.
                </p>

                {/* Rate Limit Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 dark:border-gray-800 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Plan Tier
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Requests/Min
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Requests/Day
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Burst Limit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Basic</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">60</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">10,000</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">100</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Premium</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">300</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">100,000</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">500</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Enterprise</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Unlimited</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Unlimited</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Custom</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Rate Limit Headers */}
                <div className="mt-6 bg-gray-900 dark:bg-black rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">Rate Limit Headers</h3>
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
                  Security & Compliance
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                  We take security seriously. ItWhip maintains the highest standards of data protection
                  and compliance to ensure your partner and customer data remains secure.
                </p>

                {/* Security Certifications Banner */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">
                        Bank-Level Security
                      </h3>
                      <p className="text-xs mt-1 text-green-800 dark:text-green-200">
                        Same security standards used by major financial institutions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compliance Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { cert: 'SOC 2 Type II', desc: 'Annual Audit' },
                    { cert: 'PCI DSS Level 1', desc: 'Payment Security' },
                    { cert: 'ISO 27001', desc: 'Info Security' },
                    { cert: 'GDPR Compliant', desc: 'Data Privacy' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-800">
                      <IoCheckmarkCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">{item.cert}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Security Features */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Enterprise Security Features
                  </h3>
                  
                  {[
                    {
                      icon: IoLockClosedOutline,
                      title: '256-bit AES Encryption',
                      description: 'All data encrypted at rest and in transit using military-grade encryption',
                      details: 'TLS 1.3, Perfect Forward Secrecy, HSTS enabled'
                    },
                    {
                      icon: IoShieldCheckmarkOutline,
                      title: 'Zero-Trust Architecture',
                      description: 'Every request verified, no implicit trust even within our network',
                      details: 'Multi-factor authentication, Role-based access control'
                    },
                    {
                      icon: IoServerOutline,
                      title: 'Redundant Infrastructure',
                      description: 'Multi-region deployment with automatic failover',
                      details: 'AWS us-east-1, us-west-2, eu-west-1 with 99.99% SLA'
                    },
                    {
                      icon: IoCloudOutline,
                      title: 'DDoS Protection',
                      description: 'CloudFlare Enterprise protection against attacks',
                      details: 'Rate limiting, WAF rules, automatic threat detection'
                    }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex space-x-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <feature.icon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {feature.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {feature.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                          {feature.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Data Protection */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-sm">
                    Customer Data Protection
                  </h3>
                  <ul className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>PII Encryption:</strong> All customer personal information encrypted with unique keys</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Data Retention:</strong> Automatic deletion after 90 days unless required by law</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Access Logs:</strong> Complete audit trail of all data access</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>GDPR Rights:</strong> Customer data export, deletion, and correction available via API</span>
                    </li>
                    <li className="flex items-start">
                      <IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Tokenization:</strong> Credit card data never touches our servers (Stripe vault)</span>
                    </li>
                  </ul>
                </div>

                {/* Contact Security Team */}
                <div className="mt-6 text-center p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Questions about security?
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Our security team is available 24/7 to address your concerns
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
              Ready to integrate?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Join 487 partners already using ItWhip to connect renters with vehicles
              across Arizona while earning revenue on every rental.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/portal/login"
                className="px-6 sm:px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
              >
                Access Partner Portal
              </Link>
              <Link
                href="/contact"
                className="px-6 sm:px-8 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold"
              >
                Contact Sales
              </Link>
            </div>
            
            {/* Hidden but discoverable */}
            <p className="mt-8 text-xs text-gray-400">
              Partners can verify their integration status in the{' '}
              <Link href="/portal/login" className="text-amber-600 hover:underline">
                partner portal
              </Link>
              {' '}using their API credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
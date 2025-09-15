// app/host-benefits/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { 
  IoCheckmarkCircle,
  IoCashOutline,
  IoShieldCheckmarkOutline,
  IoTrendingUpOutline,
  IoReceiptOutline,
  IoFlashOutline,
  IoAnalyticsOutline,
  IoWifiOutline,
  IoPeopleOutline,
  IoSchoolOutline,
  IoHeartOutline,
  IoTimerOutline,
  IoCalculatorOutline,
  IoCarOutline,
  IoGlobeOutline,
  IoRocketOutline,
  IoSparklesOutline,
  IoDiamondOutline,
  IoRibbonOutline,
  IoMedalOutline,
  IoTrophyOutline,
  IoArrowForwardOutline,
  IoDocumentTextOutline,
  IoFingerPrintOutline,
  IoCameraOutline,
  IoNotificationsOutline,
  IoConstructOutline,
  IoKeyOutline,
  IoBusinessOutline,
  IoWalletOutline,
  IoInformationCircleOutline,
  IoStatsChartOutline,
  IoClipboardOutline,
  IoLockClosedOutline,
  IoCallOutline,
  IoMailOutline,
  IoSettingsOutline,
  IoPhonePortraitOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoStarOutline,
  IoCalendarOutline
} from 'react-icons/io5'

export default function HostBenefitsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null)
  
  // Header state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Header handlers
  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/')
  }

  // Comprehensive benefits organized by category
  const benefitCategories = [
    {
      id: 'earnings',
      name: 'Earnings & Payments',
      icon: IoCashOutline,
      color: 'green',
      benefits: [
        {
          title: '78-85% Revenue Share',
          description: 'Keep the majority of your rental income with our simple commission structure',
          details: [
            '15% commission for economy/standard vehicles',
            '18% for luxury vehicles',
            '20% for exotic/premium vehicles',
            'Commission rates locked - never increase'
          ],
          icon: IoTrendingUpOutline,
          highlight: 'Industry-leading rates'
        },
        {
          title: '48-Hour Fast Payments',
          description: 'Get paid within 2 days of trip completion - fastest in the industry',
          details: [
            'Direct deposit to your bank',
            'No payment processing fees',
            'Choose daily or weekly payouts',
            'Instant payouts for Gold+ hosts'
          ],
          icon: IoFlashOutline,
          highlight: '10x faster than competitors'
        },
        {
          title: '$600-10,000 Monthly Earnings',
          description: 'Realistic earnings based on vehicle type and rental days',
          details: [
            'Economy: $600-1,100/month',
            'Standard: $900-1,500/month',
            'Luxury: $1,500-3,000/month',
            'Exotic: $5,000-10,000/month'
          ],
          icon: IoWalletOutline,
          highlight: 'Based on 15-20 rental days'
        },
        {
          title: 'Dynamic Pricing Tools',
          description: 'AI-powered pricing optimization to maximize your revenue',
          details: [
            'Market demand analysis',
            'Competitor rate tracking',
            'Event-based surge pricing',
            'Seasonal adjustments'
          ],
          icon: IoAnalyticsOutline,
          highlight: '23% higher earnings average'
        }
      ]
    },
    {
      id: 'protection',
      name: 'Protection & Insurance',
      icon: IoShieldCheckmarkOutline,
      color: 'blue',
      benefits: [
        {
          title: '$0 Insurance Cost',
          description: 'Complete protection included - save thousands annually',
          details: [
            'Save $3,000-6,000/year vs commercial insurance',
            'Coverage included in commission',
            'No monthly insurance payments',
            'No additional fees'
          ],
          icon: IoShieldCheckmarkOutline,
          highlight: 'Biggest cost savings'
        },
        {
          title: 'Up to $2M Liability Coverage',
          description: 'Comprehensive protection during every rental',
          details: [
            '$750K standard vehicle coverage',
            '$1M luxury vehicle coverage',
            '$2M exotic vehicle coverage',
            'Medical payments included'
          ],
          icon: IoLockClosedOutline,
          highlight: '40x traditional coverage'
        },
        {
          title: 'Physical Damage Protection',
          description: 'Your vehicle is protected against damage during rentals',
          details: [
            '$0-1,000 deductible based on tier',
            'Collision and comprehensive',
            'Loss of use compensation',
            'Diminished value coverage available'
          ],
          icon: IoConstructOutline,
          highlight: 'Complete peace of mind'
        },
        {
          title: '48-72 Hour Claims Resolution',
          description: 'Fast claims processing when you need it most',
          details: [
            'Dedicated claims hotline',
            'Preferred repair network',
            'Direct billing to shops',
            'Rental credit during repairs'
          ],
          icon: IoTimerOutline,
          highlight: '10x faster than traditional'
        }
      ]
    },
    {
      id: 'taxes',
      name: 'Tax Benefits',
      icon: IoReceiptOutline,
      color: 'purple',
      benefits: [
        {
          title: '$8,000-25,000 Annual Tax Savings',
          description: 'Turn your car into a tax-advantaged business',
          details: [
            'Vehicle depreciation ($5-15K/year)',
            'Operating expenses deductible',
            'Mileage deduction ($0.655/mile)',
            'Business expense write-offs'
          ],
          icon: IoCalculatorOutline,
          highlight: 'Maximize deductions'
        },
        {
          title: 'Automated Tax Documentation',
          description: 'We handle all the paperwork for tax season',
          details: [
            'Automatic 1099 generation',
            'Expense categorization',
            'Mileage tracking',
            'QuickBooks integration'
          ],
          icon: IoDocumentTextOutline,
          highlight: 'Simplify tax filing'
        },
        {
          title: 'Business Expense Deductions',
          description: 'Deduct all car-related business expenses',
          details: [
            'Cleaning & detailing',
            'Maintenance & repairs',
            'Platform fees',
            'Insurance & registration'
          ],
          icon: IoClipboardOutline,
          highlight: '100% deductible'
        }
      ]
    },
    {
      id: 'tools',
      name: 'Technology & Tools',
      icon: IoSettingsOutline,
      color: 'indigo',
      benefits: [
        {
          title: 'GPS Tracking & Monitoring',
          description: 'Know where your vehicle is 24/7 during rentals',
          details: [
            'Real-time location tracking',
            'Speed monitoring alerts',
            'Geofence boundaries',
            'Trip history recording'
          ],
          icon: IoWifiOutline,
          highlight: 'Complete visibility'
        },
        {
          title: 'Guest Verification System',
          description: 'Multi-point screening ensures quality renters',
          details: [
            'Government ID verification',
            'Facial recognition matching',
            'Criminal background checks',
            'Driving record analysis'
          ],
          icon: IoFingerPrintOutline,
          highlight: '7-point verification'
        },
        {
          title: 'Professional Photography',
          description: 'Make your listing stand out with pro photos',
          details: [
            'Free for luxury+ vehicles',
            'Multiple angle coverage',
            'Lighting optimization',
            'Virtual tour creation'
          ],
          icon: IoCameraOutline,
          highlight: '3x more bookings'
        },
        {
          title: 'Smart Calendar Management',
          description: 'Full control over your availability',
          details: [
            'Block dates instantly',
            'Recurring blackouts',
            'Minimum trip duration',
            'Advance notice settings'
          ],
          icon: IoCalendarOutline,
          highlight: 'You stay in control'
        }
      ]
    },
    {
      id: 'support',
      name: 'Support & Service',
      icon: IoPeopleOutline,
      color: 'orange',
      benefits: [
        {
          title: 'We Handle Guest Communication',
          description: 'Focus on your life while we manage renters',
          details: [
            'All guest questions answered',
            'Booking coordination',
            'Issue resolution',
            'Check-in/out management'
          ],
          icon: IoMailOutline,
          highlight: 'Hands-off hosting'
        },
        {
          title: 'Quick Response Support',
          description: 'Get help when you need it',
          details: [
            '1-2 hour typical response',
            'Priority support for issues',
            'Dedicated host support team',
            'In-app messaging'
          ],
          icon: IoNotificationsOutline,
          highlight: 'Real human support'
        },
        {
          title: 'Host University Training',
          description: 'Learn how to maximize your earnings',
          details: [
            'Free training courses',
            'Optimization webinars',
            'Best practices guide',
            'Monthly coaching calls'
          ],
          icon: IoSchoolOutline,
          highlight: 'Continuous learning'
        }
      ]
    },
    {
      id: 'rewards',
      name: 'Rewards & Growth',
      icon: IoTrophyOutline,
      color: 'yellow',
      benefits: [
        {
          title: 'Host Tier Rewards',
          description: 'Earn more as you grow with reduced commissions',
          details: [
            'Silver (10+ trips): -1% commission',
            'Gold (25+ trips): -2% commission',
            'Platinum (50+ trips): -3% commission',
            'Elite Fleet (10+ cars): Custom rates'
          ],
          icon: IoDiamondOutline,
          highlight: 'Loyalty pays off'
        },
        {
          title: '$500 Referral Bonuses',
          description: 'Earn for every new host you bring to the platform',
          details: [
            '$500 per qualified host',
            'No limit on referrals',
            'Bonus for fleet referrals',
            'Monthly referral contests'
          ],
          icon: IoGlobeOutline,
          highlight: 'Unlimited earnings'
        },
        {
          title: 'Priority Placement',
          description: 'Top hosts get premium visibility',
          details: [
            'Homepage features',
            'Search result priority',
            'Badge display',
            'Marketing inclusion'
          ],
          icon: IoStarOutline,
          highlight: 'More bookings'
        }
      ]
    },
    {
      id: 'flexibility',
      name: 'Flexibility & Control',
      icon: IoTimeOutline,
      color: 'teal',
      benefits: [
        {
          title: 'You Keep Your Keys',
          description: 'Multiple secure key exchange options',
          details: [
            'Keyless entry devices',
            'Lockbox installation',
            'Hotel concierge handoff',
            'Meet & greet service'
          ],
          icon: IoKeyOutline,
          highlight: 'Convenient options'
        },
        {
          title: 'Set Your Own Rules',
          description: 'Control who rents and how',
          details: [
            'Minimum renter age',
            'Trip duration limits',
            'Mileage restrictions',
            'No-smoking policy'
          ],
          icon: IoClipboardOutline,
          highlight: 'Your car, your rules'
        },
        {
          title: 'Instant Calendar Control',
          description: 'Block dates whenever you need your car',
          details: [
            'Real-time availability updates',
            'Recurring blackout dates',
            'Last-minute blocking',
            'Holiday scheduling'
          ],
          icon: IoCalendarOutline,
          highlight: 'Use when you want'
        }
      ]
    },
    {
      id: 'special',
      name: 'Special Programs',
      icon: IoRocketOutline,
      color: 'pink',
      benefits: [
        {
          title: '0% Commission First 60 Days',
          description: 'Keep 100% of earnings when you start',
          details: [
            'No platform fees',
            'Full earnings retention',
            'Still get full protection',
            'All tools included'
          ],
          icon: IoSparklesOutline,
          highlight: 'Limited time offer'
        },
        {
          title: 'Fleet Owner Benefits',
          description: 'Special perks for multiple vehicles',
          details: [
            '3-5 cars: 1% commission reduction',
            '6-10 cars: 2% reduction + manager',
            '11-20 cars: 3% reduction + API',
            '20+ cars: Custom enterprise rates'
          ],
          icon: IoBusinessOutline,
          highlight: 'Scale your business'
        },
        {
          title: 'Luxury Host Perks',
          description: 'Premium benefits for high-value vehicles',
          details: [
            'White-glove service',
            'Concierge support',
            'Premium placement',
            'Custom marketing'
          ],
          icon: IoDiamondOutline,
          highlight: 'VIP treatment'
        }
      ]
    }
  ]

  const allBenefits = benefitCategories.flatMap(cat => 
    cat.benefits.map(benefit => ({ ...benefit, category: cat.name, categoryId: cat.id }))
  )

  const filteredBenefits = selectedCategory === 'all' 
    ? allBenefits 
    : allBenefits.filter(b => b.categoryId === selectedCategory)

  // Key statistics
  const keyStats = [
    { value: '48hr', label: 'Payment Speed', detail: 'Industry fastest' },
    { value: '$0', label: 'Insurance Cost', detail: 'Save $3-6K/year' },
    { value: '85%', label: 'Max Revenue', detail: 'You keep' },
    { value: '$2M', label: 'Protection', detail: 'Maximum coverage' },
    { value: '30%', label: 'Tax Savings', detail: 'Average deduction' },
    { value: '60', label: 'Day Trial', detail: '0% commission' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Title */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IoTrophyOutline className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Complete Host Benefits
              </h1>
              <span className="hidden sm:inline-block ml-2 px-2 py-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/20 rounded">
                Everything Included
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/list-your-car"
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-semibold hover:bg-purple-700"
              >
                Start Earning →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-[106px] md:mt-[112px] pb-20">
        
        {/* Hero Section with Key Stats */}
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <IoSparklesOutline className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Limited Time: 0% Commission First 60 Days
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Get as an ItWhip Host
                <span className="block text-purple-600 mt-2">No Hidden Costs. Ever.</span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                One simple commission covers everything. Compare us to any platform - 
                we offer more benefits, better protection, and faster payments.
              </p>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
              {keyStats.map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stat.value}</div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="sticky top-[106px] md:top-[112px] z-20 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                All Benefits ({allBenefits.length})
              </button>
              {benefitCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <cat.icon className="w-4 h-4 mr-1" />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBenefits.map((benefit, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <benefit.icon className="w-10 h-10 text-purple-600 flex-shrink-0" />
                      <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded">
                        {benefit.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {benefit.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      {benefit.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start">
                          <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{detail}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-purple-600">
                        ✨ {benefit.highlight}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-12 sm:py-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                How We Compare
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                See why hosts are switching to ItWhip
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600">
                      ItWhip
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">
                      Others
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Payment Speed</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-green-600">48 hours</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">3-14 days</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Insurance Cost</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-green-600">$0 included</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">$200-500/mo</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Commission Rate</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-green-600">15-20%</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">25-35%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Coverage Limit</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-green-600">Up to $2M</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">$750K max</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Guest Screening</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-green-600">7-point verification</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">Basic ID check</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Support Response</td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-green-600">1-2 hours</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">24-48 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Testimonial/Trust Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
              Join 2,847+ Phoenix Hosts Already Earning
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold text-white mb-2">$1.2M</div>
                <div className="text-sm text-purple-100">Paid to hosts this month</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold text-white mb-2">18 days</div>
                <div className="text-sm text-purple-100">Average monthly bookings</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold text-white mb-2">4.9★</div>
                <div className="text-sm text-purple-100">Platform rating</div>
              </div>
            </div>
            
            <Link 
              href="/list-your-car"
              className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg"
            >
              Start Your Application →
            </Link>
            
            <p className="text-xs text-purple-200 mt-4">
              5-minute application • Instant approval • Start earning in 24 hours
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Common Questions About Benefits
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Are these benefits really all included?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yes, everything listed is included in our simple 15-20% commission. No hidden fees, 
                  no monthly charges, no insurance costs. The commission covers platform operation, 
                  insurance, support, and all tools.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How do you offer $0 insurance?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We've partnered with commercial insurers to provide fleet coverage. The insurance 
                  is included in our commission structure, saving you $3,000-6,000 annually compared 
                  to getting your own commercial policy.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  When do benefits start?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All benefits activate immediately upon approval. Insurance coverage begins with 
                  your first booking. The 0% commission offer applies to your first 60 days. 
                  Host tier benefits unlock as you complete trips.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything Included. Nothing Hidden.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              One commission covers it all. Start earning with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                href="/list-your-car"
                className="inline-block px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition shadow-lg"
              >
                List Your Car Now
              </Link>
              <Link 
                href="/host-earnings"
                className="inline-block px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition border-2 border-purple-600"
              >
                Calculate Earnings
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>No fees</span>
              </div>
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Keep your keys</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
// app/portal/reservations/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import {
  IoArrowBackOutline,
  IoCalendarOutline,
  IoGridOutline,
  IoBedOutline,
  IoPersonOutline,
  IoCashOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoAddCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoCarOutline,
  IoStarOutline,
  IoWalletOutline,
  IoTrendingUpOutline,
  IoWarningOutline,
  IoSwapHorizontalOutline,
  IoDownloadOutline,
  IoPrintOutline,
  IoMailOutline,
  IoCallOutline,
  IoDocumentTextOutline,
  IoKeyOutline,
  IoWifiOutline,
  IoRestaurantOutline,
  IoFitnessOutline,
  IoBusinessOutline,
  IoAirplaneOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoCopyOutline,
  IoNotificationsOutline,
  IoRefreshOutline,
  IoSettingsOutline,
  IoCloudUploadOutline,
  IoShieldCheckmarkOutline,
  IoSparklesOutline,
  IoFlashOutline,
  IoRocketOutline,
  IoChevronDownOutline,
  IoChevronForwardOutline,
  IoEllipsisHorizontalOutline,
  IoInformationCircleOutline,
  IoPulseOutline,
  IoAnalyticsOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoRepeatOutline,
  IoListOutline,
  IoHomeOutline,
  IoCardOutline,
  IoClipboardOutline,
  IoChatbubbleOutline,
  IoThermometerOutline,
  IoWaterOutline,
  IoBulbOutline,
  IoConstructOutline,
  IoHappyOutline,
  IoSadOutline,
  IoAlertCircleOutline,
  IoCheckmarkDoneOutline,
  IoReorderThreeOutline,
  IoMoveOutline,
  IoResizeOutline,
  IoSyncOutline,
  IoTrendingDownOutline,
  IoBarChartOutline
} from 'react-icons/io5'

// Mock data generator for rooms and reservations
const generateRooms = () => {
  const rooms = []
  const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Presidential']
  const floors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  
  floors.forEach(floor => {
    for (let i = 1; i <= 12; i++) {
      const roomNumber = `${floor}${i.toString().padStart(2, '0')}`
      const typeIndex = i <= 6 ? 0 : i <= 9 ? 1 : i <= 11 ? 2 : 3
      const randomStatus = Math.random()
      rooms.push({
        number: roomNumber,
        type: roomTypes[typeIndex],
        floor,
        status: randomStatus > 0.7 ? 'vacant' : randomStatus > 0.2 ? 'occupied' : randomStatus > 0.1 ? 'dirty' : 'maintenance',
        rate: typeIndex === 0 ? 289 : typeIndex === 1 ? 389 : typeIndex === 2 ? 589 : 1289,
        guest: null,
        housekeeping: randomStatus > 0.7 ? 'clean' : randomStatus > 0.4 ? 'cleaning' : 'dirty',
        nextAvailable: randomStatus > 0.7 ? 'Now' : 'Tomorrow 2PM'
      })
    }
  })
  
  return rooms
}

// Generate more comprehensive reservation data
const generateReservations = () => {
  const firstNames = ['Michael', 'Sarah', 'David', 'Jennifer', 'Robert', 'Lisa', 'James', 'Mary', 'John', 'Patricia']
  const lastNames = ['Chen', 'Williams', 'Martinez', 'Anderson', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore']
  const sources = ['Direct', 'ItWhip', 'Expedia', 'Booking.com', 'Corporate', 'Walk-in']
  const reservations = []
  
  for (let i = 0; i < 30; i++) {
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + Math.floor(Math.random() * 7) - 3)
    const nights = Math.floor(Math.random() * 5) + 1
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + nights)
    
    const rate = 289 + Math.floor(Math.random() * 300)
    const total = rate * nights
    const paid = Math.random() > 0.5 ? total : Math.floor(total * Math.random())
    
    reservations.push({
      id: `RES${(1000 + i).toString()}`,
      guest: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      email: `guest${i}@email.com`,
      phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      room: Math.random() > 0.2 ? `${Math.floor(Math.random() * 10) + 1}${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}` : 'Unassigned',
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      nights,
      rate,
      total,
      status: checkIn.toDateString() === new Date().toDateString() ? 'arriving' : 
              checkIn < new Date() ? 'in-house' : 
              'confirmed',
      source: sources[Math.floor(Math.random() * sources.length)],
      vip: Math.random() > 0.85,
      notes: Math.random() > 0.7 ? 'Special request: High floor, away from elevator' : '',
      transportation: Math.random() > 0.6 ? 'Airport pickup scheduled' : 'No transportation',
      preferences: 'Standard preferences',
      history: Math.random() > 0.7 ? `${Math.floor(Math.random() * 10) + 1} previous stays` : 'First time guest',
      balance: total - paid,
      deposit: paid,
      extras: Math.random() > 0.7 ? ['Late checkout', 'Spa package'] : [],
      creditCard: '****' + Math.floor(Math.random() * 9000) + 1000,
      loyaltyNumber: Math.random() > 0.5 ? 'GOLD' + Math.floor(Math.random() * 90000) + 10000 : null
    })
  }
  
  return reservations
}

export default function ReservationsManagerPage() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [showNewReservation, setShowNewReservation] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [rooms, setRooms] = useState(generateRooms())
  const [reservations, setReservations] = useState(generateReservations())
  const [showQuickCheckin, setShowQuickCheckin] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  
  // Live metrics with more detail
  const [metrics, setMetrics] = useState({
    occupancy: 87,
    adr: 389,
    revpar: 338,
    totalRooms: 120,
    occupied: 104,
    vacant: 16,
    dirty: 8,
    maintenance: 3,
    arrivals: 34,
    departures: 28,
    stayovers: 70,
    dayUse: 2,
    revenue: {
      today: 40456,
      mtd: 1214000,
      ytd: 14568000,
      lastMonth: 1189000
    },
    housekeeping: {
      cleaned: 42,
      inProgress: 12,
      pending: 8
    },
    forecast: {
      tomorrow: 92,
      weekend: 98,
      nextWeek: 85
    }
  })

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        occupied: Math.floor(100 + Math.random() * 10),
        vacant: Math.floor(10 + Math.random() * 10),
        revenue: {
          ...prev.revenue,
          today: prev.revenue.today + Math.floor(Math.random() * 1000)
        }
      }))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const handleGetAppClick = () => {
    window.open('https://testflight.apple.com/join/ygzsQbNf', '_blank')
  }

  const handleSearchClick = () => {
    router.push('/portal/login')
  }

  // Filter reservations based on search
  const filteredReservations = reservations.filter(res => {
    const matchesSearch = res.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         res.room.includes(searchQuery) ||
                         res.id.includes(searchQuery)
    const matchesFilter = filterStatus === 'all' || res.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Quick check-in function
  const handleQuickCheckin = (reservation: any) => {
    // Update reservation status
    const updated = reservations.map(r => 
      r.id === reservation.id ? { ...r, status: 'in-house' } : r
    )
    setReservations(updated)
    setShowQuickCheckin(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleGetAppClick={handleGetAppClick}
          handleSearchClick={handleSearchClick}
        />
      </div>

      {/* Page Header with Controls - Fixed below main header */}
      <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/portal/dashboard"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <IoArrowBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <IoBedOutline className="w-6 h-6 text-blue-600" />
                  <span>Reservations Manager</span>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setShowNewReservation(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <IoAddCircleOutline className="w-5 h-5" />
                <span>New Reservation</span>
              </button>
              <button
                onClick={() => setShowQuickCheckin(true)} 
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center space-x-2"
              >
                <IoCheckmarkCircleOutline className="w-5 h-5" />
                <span>Quick Check-in</span>
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                <IoDownloadOutline className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                <IoNotificationsOutline className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Bar - Scrollable on mobile */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-3 border-t border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <div className="flex space-x-6 min-w-max">
              {/* Occupancy with visual indicator */}
              <div className="flex items-center space-x-2">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-300 dark:text-gray-700"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${metrics.occupancy * 1.26} 126`}
                      className="text-blue-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{metrics.occupancy}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Occupancy</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{metrics.occupied}/{metrics.totalRooms}</div>
                </div>
              </div>

              {/* Room Status Breakdown */}
              <div className="flex items-center space-x-4 border-l pl-4 border-gray-300 dark:border-gray-700">
                <div>
                  <div className="text-lg font-bold text-green-600">{metrics.vacant}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Vacant</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{metrics.dirty}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Dirty</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">{metrics.maintenance}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">OOO</div>
                </div>
              </div>

              {/* Today's Activity */}
              <div className="flex items-center space-x-4 border-l pl-4 border-gray-300 dark:border-gray-700">
                <div>
                  <div className="text-lg font-bold text-blue-600">{metrics.arrivals}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Arrivals</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">{metrics.stayovers}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Stayovers</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{metrics.departures}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Departures</div>
                </div>
              </div>

              {/* Revenue */}
              <div className="flex items-center space-x-4 border-l pl-4 border-gray-300 dark:border-gray-700">
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">${metrics.adr}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">ADR</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">${metrics.revpar}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">RevPAR</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">${(metrics.revenue.today / 1000).toFixed(1)}K</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Today</div>
                </div>
              </div>

              {/* Housekeeping Status */}
              <div className="flex items-center space-x-4 border-l pl-4 border-gray-300 dark:border-gray-700">
                <div>
                  <div className="text-lg font-bold text-green-600">{metrics.housekeeping.cleaned}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Cleaned</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-600">{metrics.housekeeping.inProgress}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Cleaning</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">{metrics.housekeeping.pending}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Adjusted padding to account for fixed headers */}
      <div className="pt-44 md:pt-48 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-[1600px] mx-auto">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search guest, room, confirmation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <IoCloseCircleOutline className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* View Mode & Filters */}
              <div className="flex items-center space-x-2">
                {/* Date Picker */}
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                />

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="arriving">Arriving Today</option>
                  <option value="in-house">In-House</option>
                  <option value="departing">Departing</option>
                </select>

                {/* View Mode Toggles */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded flex items-center space-x-1 ${viewMode === 'grid' ? 'bg-white dark:bg-gray-900 shadow' : ''} transition`}
                    title="Room Grid"
                  >
                    <IoGridOutline className="w-4 h-4" />
                    <span className="hidden lg:inline text-sm">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded flex items-center space-x-1 ${viewMode === 'list' ? 'bg-white dark:bg-gray-900 shadow' : ''} transition`}
                    title="List View"
                  >
                    <IoListOutline className="w-4 h-4" />
                    <span className="hidden lg:inline text-sm">List</span>
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-1.5 rounded flex items-center space-x-1 ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-900 shadow' : ''} transition`}
                    title="Calendar View"
                  >
                    <IoCalendarOutline className="w-4 h-4" />
                    <span className="hidden lg:inline text-sm">Calendar</span>
                  </button>
                </div>

                <button 
                  onClick={() => window.location.reload()}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  title="Refresh"
                >
                  <IoRefreshOutline className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Room Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Room Grid */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Room Status Grid</h2>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-500">Quick Actions:</span>
                      <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition">
                        Block Rooms
                      </button>
                      <button className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                        Assign Housekeeping
                      </button>
                    </div>
                  </div>
                  
                  {/* Floor Grid */}
                  <div className="p-4 overflow-x-auto">
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(floor => (
                      <div key={floor} className="flex items-center space-x-2 mb-2">
                        <div className="w-12 text-xs font-semibold text-gray-600 dark:text-gray-400">
                          F{floor}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rooms.filter(r => r.floor === floor).map(room => {
                            const reservation = reservations.find(r => r.room === room.number)
                            return (
                              <button
                                key={room.number}
                                onClick={() => {
                                  if (reservation) {
                                    setSelectedReservation(reservation)
                                  } else {
                                    setSelectedRoom(room)
                                  }
                                }}
                                className={`relative w-14 h-12 rounded text-xs font-semibold transition-all hover:scale-105 hover:shadow-lg ${
                                  room.status === 'occupied' 
                                    ? reservation?.vip 
                                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg ring-2 ring-yellow-300'
                                      : 'bg-blue-500 text-white'
                                    : room.status === 'vacant'
                                    ? room.housekeeping === 'clean'
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-700'
                                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-2 border-yellow-300 dark:border-yellow-700'
                                    : room.status === 'dirty'
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-2 border-orange-300 dark:border-orange-700'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500 border-2 border-gray-300 dark:border-gray-700'
                                }`}
                                title={`Room ${room.number} - ${room.type} - ${room.status}${reservation ? ` - ${reservation.guest}` : ''}`}
                              >
                                <div>{room.number}</div>
                                {reservation?.vip && (
                                  <IoStarOutline className="absolute top-0.5 right-0.5 w-3 h-3" />
                                )}
                                {room.status === 'occupied' && reservation?.status === 'departing' && (
                                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                )}
                                {room.housekeeping === 'cleaning' && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-spin"></div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Legend */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span>Occupied</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded ring-1 ring-yellow-300"></div>
                        <span>VIP Guest</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                        <span>Vacant Clean</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                        <span>Vacant Dirty</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
                        <span>Dirty</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <span>Out of Order</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="relative w-4 h-4 bg-blue-500 rounded">
                          <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        </div>
                        <span>Departing Today</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="relative w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded">
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-500 rounded-full"></div>
                        </div>
                        <span>Being Cleaned</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Panel - Quick Stats and Actions */}
              <div className="space-y-6">
                {/* Today's Overview */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Overview</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Arrivals</span>
                        <span className="text-lg font-bold text-blue-600">{metrics.arrivals}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Next: Michael Chen at 2:00 PM
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Departures</span>
                        <span className="text-lg font-bold text-orange-600">{metrics.departures}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        12 already checked out
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">In-House</span>
                        <span className="text-lg font-bold text-purple-600">{metrics.stayovers}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        5 VIP guests currently
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Snapshot */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg shadow p-6 border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Snapshot</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
                        <span className="text-xl font-bold text-green-600">
                          ${(metrics.revenue.today / 1000).toFixed(1)}K
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(metrics.revenue.today / 50000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-green-200 dark:border-green-700">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">MTD</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            ${(metrics.revenue.mtd / 1000000).toFixed(2)}M
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">vs Last Month</div>
                          <div className="font-semibold text-green-600">
                            +{((metrics.revenue.mtd - metrics.revenue.lastMonth) / metrics.revenue.lastMonth * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg shadow p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
                    <IoSparklesOutline className="w-5 h-5 text-purple-600 animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <IoTrendingUpOutline className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Upgrade Opportunity
                          </div>
                          <div className="text-xs text-gray-500">
                            Room 412 guest likely to accept suite upgrade
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <IoWarningOutline className="w-4 h-4 text-orange-500 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Maintenance Alert
                          </div>
                          <div className="text-xs text-gray-500">
                            Room 305 AC reported 3 times this week
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <IoRocketOutline className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Demand Surge
                          </div>
                          <div className="text-xs text-gray-500">
                            Weekend occupancy trending to 98%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm">
                    View All Insights
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Guest</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Room</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Check In</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Check Out</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Nights</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredReservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className="relative">
                              <IoPersonOutline className="w-8 h-8 text-gray-400" />
                              {reservation.vip && (
                                <IoStarOutline className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                                <span>{reservation.guest}</span>
                                {reservation.vip && (
                                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs rounded">
                                    VIP
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">{reservation.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {reservation.room}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {reservation.checkIn}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {reservation.checkOut}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {reservation.nights}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            reservation.status === 'confirmed' 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : reservation.status === 'arriving'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : reservation.status === 'in-house'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {reservation.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                          ${reservation.rate}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                          ${reservation.total}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          <span className={reservation.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                            ${reservation.balance}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded ${
                            reservation.source === 'ItWhip' 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : reservation.source === 'Direct'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {reservation.source}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setSelectedReservation(reservation)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                              title="View Details"
                            >
                              <IoEyeOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition" title="Edit">
                              <IoCreateOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition" title="Email">
                              <IoMailOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition" title="Schedule Transportation">
                              <IoCarOutline className="w-4 h-4 text-blue-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition" title="More">
                              <IoEllipsisHorizontalOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer with Pagination */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {filteredReservations.length} of {reservations.length} reservations
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      Previous
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                      1
                    </button>
                    <button className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      2
                    </button>
                    <button className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      3
                    </button>
                    <button className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendar View Placeholder */}
          {viewMode === 'calendar' && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8">
              <div className="text-center">
                <IoCalendarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Calendar View Coming Soon
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Drag and drop reservations across dates and rooms
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                    <span>{selectedReservation.guest}</span>
                    {selectedReservation.vip && (
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs rounded-full">
                        VIP GUEST
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Confirmation: {selectedReservation.id} • Room {selectedReservation.room}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <IoCloseCircleOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Quick Action Tabs */}
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition whitespace-nowrap">
                  Check In
                </button>
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition whitespace-nowrap">
                  Modify Stay
                </button>
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition whitespace-nowrap">
                  Room Move
                </button>
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition whitespace-nowrap">
                  Add Charges
                </button>
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition whitespace-nowrap">
                  Transportation
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Reservation Details */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reservation Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Check-in Date & Time</label>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedReservation.checkIn} • 3:00 PM</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Check-out Date & Time</label>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedReservation.checkOut} • 11:00 AM</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Room Type</label>
                        <p className="font-medium text-gray-900 dark:text-white">Deluxe King</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Rate Plan</label>
                        <p className="font-medium text-gray-900 dark:text-white">Best Available Rate</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Number of Guests</label>
                        <p className="font-medium text-gray-900 dark:text-white">2 Adults</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Booking Source</label>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedReservation.source}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Room Rate ({selectedReservation.nights} nights × ${selectedReservation.rate})</span>
                        <span className="font-medium text-gray-900 dark:text-white">${selectedReservation.rate * selectedReservation.nights}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Taxes & Fees</span>
                        <span className="font-medium text-gray-900 dark:text-white">${Math.floor(selectedReservation.rate * selectedReservation.nights * 0.15)}</span>
                      </div>
                      {selectedReservation.extras?.map((extra, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{extra}</span>
                          <span className="font-medium text-gray-900 dark:text-white">$50</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Total Amount</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">${selectedReservation.total}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Paid</span>
                          <span className="font-medium text-green-600">${selectedReservation.deposit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Balance Due</span>
                          <span className={`font-bold ${selectedReservation.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${selectedReservation.balance}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transportation Integration */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transportation</h3>
                      <IoCarOutline className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Airport Pickup</span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Scheduled</span>
                        </div>
                        <p className="text-xs text-gray-500">Tomorrow at 2:00 PM • Flight AA523</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Daily Transportation</span>
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">Not Set</span>
                        </div>
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                          Schedule rides for stay
                        </button>
                      </div>
                    </div>
                    <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                      Manage Transportation
                    </button>
                  </div>
                </div>

                {/* Sidebar - Guest Information */}
                <div className="space-y-6">
                  {/* Guest Profile */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Guest Profile</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500">Email</label>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{selectedReservation.email}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Phone</label>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{selectedReservation.phone}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Loyalty Status</label>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {selectedReservation.loyaltyNumber || 'Not a member'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Guest History</label>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{selectedReservation.history}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Lifetime Value</label>
                        <p className="font-medium text-green-600 text-sm">$4,892</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Preferences */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes & Preferences</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500">Special Requests</label>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {selectedReservation.notes || 'None'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Room Preferences</label>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {selectedReservation.preferences}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Dietary Restrictions</label>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Vegetarian</p>
                      </div>
                    </div>
                    <button className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-semibold">
                      Edit preferences
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-xs font-medium">
                        <IoKeyOutline className="w-4 h-4 mx-auto mb-1" />
                        Room Key
                      </button>
                      <button className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-xs font-medium">
                        <IoWifiOutline className="w-4 h-4 mx-auto mb-1" />
                        WiFi Code
                      </button>
                      <button className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-xs font-medium">
                        <IoRestaurantOutline className="w-4 h-4 mx-auto mb-1" />
                        Dining
                      </button>
                      <button className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-xs font-medium">
                        <IoFitnessOutline className="w-4 h-4 mx-auto mb-1" />
                        Spa
                      </button>
                      <button className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-xs font-medium">
                        <IoPrintOutline className="w-4 h-4 mx-auto mb-1" />
                        Folio
                      </button>
                      <button className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-xs font-medium">
                        <IoMailOutline className="w-4 h-4 mx-auto mb-1" />
                        Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2 justify-between">
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                      <IoCheckmarkCircleOutline className="w-4 h-4 inline mr-1" />
                      Check In Now
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                      <IoCreateOutline className="w-4 h-4 inline mr-1" />
                      Modify Reservation
                    </button>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition">
                      <IoMailOutline className="w-4 h-4 inline mr-1" />
                      Send Confirmation
                    </button>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
                    <IoTrashOutline className="w-4 h-4 inline mr-1" />
                    Cancel Reservation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Details Modal - For vacant rooms */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Room {selectedRoom.number} - {selectedRoom.type}
                </h2>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <IoCloseCircleOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedRoom.status}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Housekeeping</label>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedRoom.housekeeping}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Rate</label>
                  <p className="font-medium text-gray-900 dark:text-white">${selectedRoom.rate}/night</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Next Available</label>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedRoom.nextAvailable}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                  Assign Guest
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                  Mark Clean
                </button>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition">
                  Send Housekeeping
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
                  Mark OOO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Check-in Modal */}
      {showQuickCheckin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Check-in</h2>
                <button
                  onClick={() => setShowQuickCheckin(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <IoCloseCircleOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by guest name or confirmation..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>
              
              <div className="space-y-3">
                {reservations.filter(r => r.status === 'arriving').slice(0, 5).map(reservation => (
                  <div key={reservation.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IoPersonOutline className="w-8 h-8 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {reservation.guest}
                            {reservation.vip && (
                              <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">VIP</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Room {reservation.room} • {reservation.nights} nights • ${reservation.total}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleQuickCheckin(reservation)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                      >
                        Check In
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Reservation Modal Placeholder */}
      {showNewReservation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Reservation</h2>
                <button
                  onClick={() => setShowNewReservation(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <IoCloseCircleOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <IoAddCircleOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Create New Reservation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Full reservation creation form with room selection, guest details, and payment processing
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// app/lib/generators.ts

/**
 * Dynamic data generators for creating believable, ever-changing metrics
 * that make hotels panic every time they check the dashboard
 */

// Surge multiplier generator (1.5x - 3.5x)
export const generateSurgeMultiplier = (): number => {
    return parseFloat((Math.random() * 2 + 1.5).toFixed(1))
  }
  
  // Generate current active ride requests (varies by time of day)
  export const generateActiveRequests = (timeOfDay?: number): number => {
    const hour = timeOfDay || new Date().getHours()
    
    // Peak hours: 7-9am, 5-7pm
    const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
    const isNightTime = hour >= 22 || hour <= 5
    
    if (isPeakHour) {
      return Math.floor(Math.random() * 30) + 25 // 25-55 requests
    } else if (isNightTime) {
      return Math.floor(Math.random() * 10) + 5 // 5-15 requests
    } else {
      return Math.floor(Math.random() * 20) + 10 // 10-30 requests
    }
  }
  
  // Generate wait times based on surge
  export const generateWaitTime = (surgeMultiplier: number): number => {
    const baseWait = 8
    const surgeImpact = Math.floor((surgeMultiplier - 1) * 5)
    return baseWait + surgeImpact + Math.floor(Math.random() * 5)
  }
  
  // Generate daily missed revenue (with variance)
  export const generateDailyMissedRevenue = (monthlyPotential: number): number => {
    const dailyBase = monthlyPotential / 30
    const variance = 0.2 // +/- 20% variance
    const multiplier = 1 + (Math.random() * variance * 2 - variance)
    return Math.floor(dailyBase * multiplier)
  }
  
  // Generate hourly revenue loss
  export const generateHourlyLoss = (dailyLoss: number, hour?: number): number => {
    const currentHour = hour || new Date().getHours()
    
    // Weight by hour (peak hours lose more)
    const hourWeights: { [key: number]: number } = {
      6: 1.2, 7: 1.8, 8: 2.0, 9: 1.5, // Morning rush
      10: 1.0, 11: 0.8, 12: 1.2, 13: 1.0, 14: 0.8, 15: 0.9, // Midday
      16: 1.3, 17: 2.0, 18: 2.2, 19: 1.8, // Evening rush
      20: 1.2, 21: 0.9, 22: 0.7, 23: 0.5, // Evening
      0: 0.3, 1: 0.2, 2: 0.2, 3: 0.2, 4: 0.3, 5: 0.5 // Night
    }
    
    const weight = hourWeights[currentHour] || 1.0
    const hourlyBase = dailyLoss / 24
    return Math.floor(hourlyBase * weight)
  }
  
  // Generate competitor performance metrics
  export const generateCompetitorMetrics = (baseRevenue: number) => {
    return {
      revenue: Math.floor(baseRevenue * (0.8 + Math.random() * 0.4)), // +/- 20%
      rides: Math.floor(Math.random() * 500) + 300,
      avgRating: parseFloat((4 + Math.random() * 0.8).toFixed(1)), // 4.0-4.8
      surgeProtection: Math.random() > 0.3, // 70% have surge protection
      instantRides: Math.random() > 0.2, // 80% have instant rides
    }
  }
  
  // Generate guest satisfaction metrics
  export const generateSatisfactionScore = (hasInstantRides: boolean): number => {
    if (hasInstantRides) {
      return parseFloat((4 + Math.random() * 0.8).toFixed(1)) // 4.0-4.8 for properties with rides
    } else {
      return parseFloat((2 + Math.random() * 1.5).toFixed(1)) // 2.0-3.5 for properties without
    }
  }
  
  // Generate complaint patterns
  export const generateComplaintTime = (): string => {
    const minutes = Math.floor(Math.random() * 180) // Within last 3 hours
    
    if (minutes < 60) {
      return `${minutes} min ago`
    } else {
      const hours = Math.floor(minutes / 60)
      return `${hours} hr${hours > 1 ? 's' : ''} ago`
    }
  }
  
  // Generate surge event predictions
  export const generateSurgeEvent = () => {
    const events = [
      { type: 'Concert', venue: 'Footprint Center', surge: 3.2, time: '7:30 PM' },
      { type: 'Suns Game', venue: 'Footprint Center', surge: 2.8, time: '7:00 PM' },
      { type: 'Flight Delays', venue: 'PHX Airport', surge: 2.5, time: 'Now' },
      { type: 'Convention End', venue: 'Convention Center', surge: 2.2, time: '5:00 PM' },
      { type: 'Bar Close', venue: 'Old Town', surge: 3.5, time: '2:00 AM' },
    ]
    
    return events[Math.floor(Math.random() * events.length)]
  }
  
  // Generate flight arrival patterns
  export const generateFlightArrivals = () => {
    const airlines = ['AA', 'SW', 'UA', 'DL', 'AS']
    const cities = ['LAX', 'ORD', 'DFW', 'DEN', 'SEA', 'SFO']
    
    return Array.from({ length: 5 }, () => ({
      flight: `${airlines[Math.floor(Math.random() * airlines.length)]}${Math.floor(Math.random() * 900) + 100}`,
      from: cities[Math.floor(Math.random() * cities.length)],
      passengers: Math.floor(Math.random() * 150) + 50,
      eta: `${Math.floor(Math.random() * 60)} min`,
      status: Math.random() > 0.7 ? 'Delayed' : 'On Time'
    }))
  }
  
  // Generate traffic conditions
  export const generateTrafficConditions = () => {
    const routes = [
      { route: 'I-10 to Hotel', normal: 20, current: 0, status: '' },
      { route: 'Loop 101 N', normal: 15, current: 0, status: '' },
      { route: 'SR-51 S', normal: 18, current: 0, status: '' },
      { route: 'Loop 202', normal: 22, current: 0, status: '' },
    ]
    
    return routes.map(route => {
      const congestionFactor = 1 + Math.random() * 1.5 // 1x to 2.5x normal time
      const current = Math.floor(route.normal * congestionFactor)
      const status = congestionFactor > 1.8 ? 'Heavy' : congestionFactor > 1.3 ? 'Moderate' : 'Light'
      
      return {
        ...route,
        current,
        status,
        delay: current - route.normal
      }
    })
  }
  
  // Generate booking patterns
  export const generateBookingTrends = (hasInstantRides: boolean) => {
    const baseBookings = 100
    const trend = hasInstantRides ? 1.2 : 0.85 // 20% increase with rides, 15% decrease without
    
    return Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      bookings: Math.floor(baseBookings * trend * (0.8 + Math.random() * 0.4)),
      cancellations: hasInstantRides 
        ? Math.floor(Math.random() * 3) 
        : Math.floor(Math.random() * 8) + 3
    }))
  }
  
  // Generate driver availability
  export const generateDriverAvailability = () => {
    const hour = new Date().getHours()
    const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
    
    return {
      available: isPeak ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 10) + 8,
      busy: isPeak ? Math.floor(Math.random() * 15) + 10 : Math.floor(Math.random() * 8) + 3,
      offline: Math.floor(Math.random() * 5) + 2,
      avgDistance: parseFloat((Math.random() * 3 + 0.5).toFixed(1)), // 0.5-3.5 miles
    }
  }
  
  // Generate revenue projections
  export const generateRevenueProjection = (monthlyPotential: number, months: number = 12) => {
    const growth = 1.08 // 8% monthly growth
    
    return Array.from({ length: months }, (_, i) => {
      const month = new Date()
      month.setMonth(month.getMonth() + i)
      
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        projected: Math.floor(monthlyPotential * Math.pow(growth, i)),
        conservative: Math.floor(monthlyPotential * Math.pow(growth, i) * 0.7),
        optimistic: Math.floor(monthlyPotential * Math.pow(growth, i) * 1.3),
      }
    })
  }
  
  // Generate comparison metrics for dashboard
  export const generateComparisonMetrics = (propertyTier: string) => {
    const metrics: any = {
      avgCompetitorRevenue: 0,
      marketShare: 0,
      rankingPosition: 0,
      totalMarketSize: 0
    }
    
    if (propertyTier === 'PREMIUM') {
      metrics.avgCompetitorRevenue = Math.floor(Math.random() * 20000) + 60000
      metrics.marketShare = Math.floor(Math.random() * 15) + 10
      metrics.rankingPosition = Math.floor(Math.random() * 5) + 1
    } else if (propertyTier === 'STANDARD') {
      metrics.avgCompetitorRevenue = Math.floor(Math.random() * 15000) + 40000
      metrics.marketShare = 0
      metrics.rankingPosition = Math.floor(Math.random() * 5) + 8
    } else {
      metrics.avgCompetitorRevenue = Math.floor(Math.random() * 10000) + 25000
      metrics.marketShare = 0
      metrics.rankingPosition = Math.floor(Math.random() * 5) + 12
    }
    
    metrics.totalMarketSize = metrics.avgCompetitorRevenue * 15 // Assume 15 competitors
    
    return metrics
  }
  
  // Generate time-based urgency messages
  export const generateUrgencyMessage = (): string => {
    const messages = [
      'Surge pricing active NOW - Guests paying 3x',
      'Flight delays causing high demand',
      '23 ride requests in last hour',
      'Competitor just captured 5 airport rides',
      'Convention checkout - surge imminent',
      'Weekend surge pattern starting',
      'Airport queue at 45 min wait',
      'Downtown event causing 2.8x surge',
      'Your shuttle still at airport',
      'Guests complaining about wait times'
    ]
    
    return messages[Math.floor(Math.random() * messages.length)]
  }
  
  // Generate seasonal patterns
  export const generateSeasonalMultiplier = (): number => {
    const month = new Date().getMonth()
    
    // Peak season in Phoenix: Oct-Apr (winter visitors)
    const seasonalFactors: { [key: number]: number } = {
      0: 1.3,  // Jan - Peak
      1: 1.3,  // Feb - Peak
      2: 1.4,  // Mar - Spring training
      3: 1.2,  // Apr
      4: 0.8,  // May
      5: 0.6,  // Jun - Low season
      6: 0.6,  // Jul - Low season
      7: 0.7,  // Aug
      8: 0.8,  // Sep
      9: 1.0,  // Oct
      10: 1.2, // Nov - Holiday
      11: 1.3  // Dec - Holiday
    }
    
    return seasonalFactors[month] || 1.0
  }
  
  // Master metric generator that combines everything
  export const generateCompleteDashboardMetrics = (hotelCode: string, hotelData: any) => {
    const currentHour = new Date().getHours()
    const surgeMultiplier = generateSurgeMultiplier()
    const seasonalFactor = generateSeasonalMultiplier()
    
    return {
      // Real-time metrics
      currentSurge: surgeMultiplier,
      activeRequests: generateActiveRequests(currentHour),
      waitTime: generateWaitTime(surgeMultiplier),
      driversAvailable: generateDriverAvailability(),
      
      // Revenue metrics
      dailyMissed: generateDailyMissedRevenue(hotelData.monthlyPotential || 50000),
      hourlyLoss: generateHourlyLoss(hotelData.monthlyPotential / 30, currentHour),
      projectedMonthly: Math.floor((hotelData.monthlyPotential || 50000) * seasonalFactor),
      
      // Competitive metrics
      competitorAverage: generateCompetitorMetrics(hotelData.monthlyPotential || 50000),
      marketPosition: generateComparisonMetrics(hotelData.tier),
      
      // Operational metrics
      flightArrivals: generateFlightArrivals(),
      trafficConditions: generateTrafficConditions(),
      surgeEvents: generateSurgeEvent(),
      bookingTrends: generateBookingTrends(hotelData.status === 'ALREADY_EARNING'),
      
      // Engagement metrics
      satisfactionScore: generateSatisfactionScore(hotelData.status === 'ALREADY_EARNING'),
      urgencyMessage: generateUrgencyMessage(),
      complaintTime: generateComplaintTime(),
      
      // Projections
      revenueProjection: generateRevenueProjection(hotelData.monthlyPotential || 50000, 6),
      
      // Timestamp
      lastUpdated: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 5000).toISOString() // Updates every 5 seconds
    }
  }
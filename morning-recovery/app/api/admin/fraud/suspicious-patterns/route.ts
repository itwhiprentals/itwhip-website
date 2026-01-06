// app/api/admin/fraud/suspicious-patterns/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

// Pattern types we're looking for
type PatternType = 
  | 'velocity' 
  | 'device_cluster' 
  | 'email_pattern' 
  | 'geographic_anomaly' 
  | 'payment_fraud'
  | 'identity_farming'

interface SuspiciousPattern {
  type: PatternType
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number // 0-100
  bookingIds: string[]
  description: string
  details: any
  firstSeen: Date
  lastSeen: Date
  occurrences: number
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d' // 1d, 7d, 30d
    const minSeverity = searchParams.get('severity') || 'low'
    const patternType = searchParams.get('type') // Optional filter by type
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    switch (timeframe) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      default: // 7d
        startDate.setDate(startDate.getDate() - 7)
    }
    
    const patterns: SuspiciousPattern[] = []
    
    // 1. VELOCITY PATTERNS - Multiple bookings in short time
    const velocityPatterns = await detectVelocityPatterns(startDate, endDate)
    patterns.push(...velocityPatterns)
    
    // 2. DEVICE CLUSTERS - Same device, different identities
    const deviceClusters = await detectDeviceClusters(startDate, endDate)
    patterns.push(...deviceClusters)
    
    // 3. EMAIL PATTERNS - Similar emails, sequential patterns
    const emailPatterns = await detectEmailPatterns(startDate, endDate)
    patterns.push(...emailPatterns)
    
    // 4. GEOGRAPHIC ANOMALIES - Impossible travel, location mismatches
    const geoAnomalies = await detectGeographicAnomalies(startDate, endDate)
    patterns.push(...geoAnomalies)
    
    // 5. PAYMENT FRAUD PATTERNS - Failed payments, chargebacks
    const paymentPatterns = await detectPaymentPatterns(startDate, endDate)
    patterns.push(...paymentPatterns)
    
    // 6. IDENTITY FARMING - Creating multiple accounts
    const identityFarming = await detectIdentityFarming(startDate, endDate)
    patterns.push(...identityFarming)
    
    // Filter by severity if specified
    const filteredPatterns = patterns.filter(p => {
      const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 }
      return severityOrder[p.severity] >= severityOrder[minSeverity as keyof typeof severityOrder]
    })
    
    // Filter by type if specified
    const finalPatterns = patternType 
      ? filteredPatterns.filter(p => p.type === patternType)
      : filteredPatterns
    
    // Sort by severity and confidence
    finalPatterns.sort((a, b) => {
      const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 }
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
      if (severityDiff !== 0) return severityDiff
      return b.confidence - a.confidence
    })
    
    // Get summary statistics
    const stats = {
      totalPatterns: finalPatterns.length,
      criticalPatterns: finalPatterns.filter(p => p.severity === 'critical').length,
      highPatterns: finalPatterns.filter(p => p.severity === 'high').length,
      affectedBookings: new Set(finalPatterns.flatMap(p => p.bookingIds)).size,
      timeframe,
      generatedAt: new Date()
    }
    
    return NextResponse.json({
      success: true,
      patterns: finalPatterns,
      stats
    })
    
  } catch (error) {
    console.error('Error detecting patterns:', error)
    return NextResponse.json(
      { error: 'Failed to detect patterns' },
      { status: 500 }
    )
  }
}

// VELOCITY DETECTION - Multiple bookings in short timeframe
async function detectVelocityPatterns(startDate: Date, endDate: Date): Promise<SuspiciousPattern[]> {
  const patterns: SuspiciousPattern[] = []
  
  // Group by device fingerprint
  const deviceVelocity = await prisma.rentalBooking.groupBy({
    by: ['deviceFingerprint'],
    where: {
      createdAt: { gte: startDate, lte: endDate },
      deviceFingerprint: { not: null }
    },
    _count: { id: true },
    having: {
      id: { _count: { gte: 3 } } // 3+ bookings from same device
    }
  })
  
  for (const device of deviceVelocity) {
    if (!device.deviceFingerprint) continue
    
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        deviceFingerprint: device.deviceFingerprint,
        createdAt: { gte: startDate, lte: endDate }
      },
      orderBy: { createdAt: 'asc' }
    })
    
    // Calculate time between bookings
    const timeDiffs: number[] = []
    for (let i = 1; i < bookings.length; i++) {
      const diff = bookings[i].createdAt.getTime() - bookings[i-1].createdAt.getTime()
      timeDiffs.push(diff / (1000 * 60)) // Convert to minutes
    }
    
    const avgTimeBetween = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length
    
    // Determine severity based on frequency
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (avgTimeBetween < 5) severity = 'critical' // Less than 5 minutes between bookings
    else if (avgTimeBetween < 30) severity = 'high' // Less than 30 minutes
    else if (avgTimeBetween < 120) severity = 'medium' // Less than 2 hours
    
    patterns.push({
      type: 'velocity',
      severity,
      confidence: 95,
      bookingIds: bookings.map(b => b.id),
      description: `${bookings.length} bookings from same device in ${timeDiffs.length > 0 ? Math.round(avgTimeBetween) : 0} min avg interval`,
      details: {
        deviceFingerprint: device.deviceFingerprint,
        bookingCount: bookings.length,
        avgMinutesBetween: avgTimeBetween,
        emails: [...new Set(bookings.map(b => b.guestEmail))],
        names: [...new Set(bookings.map(b => b.guestName))]
      },
      firstSeen: bookings[0].createdAt,
      lastSeen: bookings[bookings.length - 1].createdAt,
      occurrences: bookings.length
    })
  }
  
  // Group by IP address
  const ipVelocity = await prisma.rentalBooking.groupBy({
    by: ['bookingIpAddress'],
    where: {
      createdAt: { gte: startDate, lte: endDate },
      bookingIpAddress: { not: null }
    },
    _count: { id: true },
    having: {
      id: { _count: { gte: 5 } } // 5+ bookings from same IP
    }
  })
  
  for (const ip of ipVelocity) {
    if (!ip.bookingIpAddress) continue
    
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        bookingIpAddress: ip.bookingIpAddress,
        createdAt: { gte: startDate, lte: endDate }
      }
    })
    
    // Check if different devices used (more suspicious)
    const uniqueDevices = new Set(bookings.map(b => b.deviceFingerprint).filter(Boolean))
    
    if (uniqueDevices.size > 1) {
      patterns.push({
        type: 'velocity',
        severity: uniqueDevices.size > 3 ? 'high' : 'medium',
        confidence: 85,
        bookingIds: bookings.map(b => b.id),
        description: `${bookings.length} bookings from same IP using ${uniqueDevices.size} different devices`,
        details: {
          ipAddress: ip.bookingIpAddress,
          bookingCount: bookings.length,
          uniqueDevices: uniqueDevices.size,
          emails: [...new Set(bookings.map(b => b.guestEmail))]
        },
        firstSeen: bookings[0].createdAt,
        lastSeen: bookings[bookings.length - 1].createdAt,
        occurrences: bookings.length
      })
    }
  }
  
  return patterns
}

// DEVICE CLUSTERING - Same device, different identities
async function detectDeviceClusters(startDate: Date, endDate: Date): Promise<SuspiciousPattern[]> {
  const patterns: SuspiciousPattern[] = []
  
  const deviceClusters = await prisma.rentalBooking.groupBy({
    by: ['deviceFingerprint'],
    where: {
      createdAt: { gte: startDate, lte: endDate },
      deviceFingerprint: { not: null }
    },
    _count: { id: true },
    having: {
      id: { _count: { gte: 2 } }
    }
  })
  
  for (const cluster of deviceClusters) {
    if (!cluster.deviceFingerprint) continue
    
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        deviceFingerprint: cluster.deviceFingerprint,
        createdAt: { gte: startDate, lte: endDate }
      }
    })
    
    const uniqueEmails = new Set(bookings.map(b => b.guestEmail?.toLowerCase()).filter(Boolean))
    const uniqueNames = new Set(bookings.map(b => b.guestName?.toLowerCase()).filter(Boolean))
    const uniquePhones = new Set(bookings.map(b => b.guestPhone).filter(Boolean))
    
    // Suspicious if multiple identities from same device
    if (uniqueEmails.size > 1 || uniqueNames.size > 1) {
      const severity = uniqueEmails.size > 3 ? 'high' : 
                      uniqueEmails.size > 1 ? 'medium' : 'low'
      
      patterns.push({
        type: 'device_cluster',
        severity,
        confidence: 90,
        bookingIds: bookings.map(b => b.id),
        description: `Same device used by ${uniqueEmails.size} different emails and ${uniqueNames.size} different names`,
        details: {
          deviceFingerprint: cluster.deviceFingerprint,
          emails: Array.from(uniqueEmails),
          names: Array.from(uniqueNames),
          phones: Array.from(uniquePhones),
          totalBookings: bookings.length,
          riskScores: bookings.map(b => b.riskScore).filter(Boolean)
        },
        firstSeen: bookings[0].createdAt,
        lastSeen: bookings[bookings.length - 1].createdAt,
        occurrences: bookings.length
      })
    }
  }
  
  return patterns
}

// EMAIL PATTERN DETECTION - Similar emails, sequential patterns
async function detectEmailPatterns(startDate: Date, endDate: Date): Promise<SuspiciousPattern[]> {
  const patterns: SuspiciousPattern[] = []
  
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      guestEmail: { not: null }
    }
  })
  
  // Group by email domain
  const domainGroups = new Map<string, typeof bookings>()
  bookings.forEach(booking => {
    const domain = booking.guestEmail?.split('@')[1]?.toLowerCase()
    if (domain) {
      if (!domainGroups.has(domain)) {
        domainGroups.set(domain, [])
      }
      domainGroups.get(domain)!.push(booking)
    }
  })
  
  // Check for suspicious patterns in each domain
  for (const [domain, domainBookings] of domainGroups) {
    if (domainBookings.length >= 3) {
      const usernames = domainBookings.map(b => b.guestEmail?.split('@')[0]?.toLowerCase()).filter(Boolean) as string[]
      
      // Check for sequential patterns (user1, user2, user3)
      const hasSequential = checkSequentialPattern(usernames)
      
      // Check for similar usernames (john.doe1, john.doe2)
      const hasSimilar = checkSimilarUsernames(usernames)
      
      if (hasSequential || hasSimilar) {
        patterns.push({
          type: 'email_pattern',
          severity: hasSequential ? 'high' : 'medium',
          confidence: hasSequential ? 95 : 80,
          bookingIds: domainBookings.map(b => b.id),
          description: `${hasSequential ? 'Sequential' : 'Similar'} email patterns detected from ${domain}`,
          details: {
            domain,
            emails: domainBookings.map(b => b.guestEmail),
            pattern: hasSequential ? 'sequential' : 'similar',
            uniqueDevices: new Set(domainBookings.map(b => b.deviceFingerprint).filter(Boolean)).size,
            uniqueIPs: new Set(domainBookings.map(b => b.bookingIpAddress).filter(Boolean)).size
          },
          firstSeen: domainBookings[0].createdAt,
          lastSeen: domainBookings[domainBookings.length - 1].createdAt,
          occurrences: domainBookings.length
        })
      }
    }
  }
  
  return patterns
}

// GEOGRAPHIC ANOMALY DETECTION
async function detectGeographicAnomalies(startDate: Date, endDate: Date): Promise<SuspiciousPattern[]> {
  const patterns: SuspiciousPattern[] = []
  
  // Find bookings with location mismatches
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      bookingCountry: { not: null }
    },
    include: {
      car: {
        select: {
          city: true,
          state: true
        }
      }
    }
  })
  
  // Group by guest to check for impossible travel
  const guestBookings = new Map<string, typeof bookings>()
  bookings.forEach(booking => {
    const key = booking.guestEmail || booking.guestPhone || booking.guestName
    if (key) {
      if (!guestBookings.has(key)) {
        guestBookings.set(key, [])
      }
      guestBookings.get(key)!.push(booking)
    }
  })
  
  for (const [guest, guestBookingList] of guestBookings) {
    if (guestBookingList.length >= 2) {
      // Sort by date
      guestBookingList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      
      // Check for impossible travel
      for (let i = 1; i < guestBookingList.length; i++) {
        const prev = guestBookingList[i - 1]
        const curr = guestBookingList[i]
        
        // Different pickup locations
        if (prev.car.city !== curr.car.city || prev.car.state !== curr.car.state) {
          const timeDiff = (curr.startDate.getTime() - prev.endDate.getTime()) / (1000 * 60 * 60) // hours
          
          // If rentals overlap or are very close in different cities
          if (timeDiff < 24) {
            patterns.push({
              type: 'geographic_anomaly',
              severity: timeDiff < 0 ? 'critical' : 'high',
              confidence: 95,
              bookingIds: [prev.id, curr.id],
              description: `Impossible travel: bookings in ${prev.car.city}, ${prev.car.state} and ${curr.car.city}, ${curr.car.state} within ${Math.round(timeDiff)} hours`,
              details: {
                guest,
                locations: [
                  `${prev.car.city}, ${prev.car.state}`,
                  `${curr.car.city}, ${curr.car.state}`
                ],
                timeDiffHours: timeDiff,
                overlapping: timeDiff < 0
              },
              firstSeen: prev.createdAt,
              lastSeen: curr.createdAt,
              occurrences: 2
            })
          }
        }
      }
    }
  }
  
  // Check for booking country vs pickup location mismatch
  for (const booking of bookings) {
    if (booking.bookingCountry && booking.car.state) {
      // Simple check - booking from outside US for US rental
      if (!['US', 'USA', 'United States'].includes(booking.bookingCountry) && 
          ['CA', 'TX', 'FL', 'NY', 'AZ'].includes(booking.car.state)) {
        
        // Check if high risk score too
        if ((booking.riskScore || 0) > 50) {
          patterns.push({
            type: 'geographic_anomaly',
            severity: 'medium',
            confidence: 70,
            bookingIds: [booking.id],
            description: `International booking from ${booking.bookingCountry} for rental in ${booking.car.city}, ${booking.car.state}`,
            details: {
              bookingCountry: booking.bookingCountry,
              pickupLocation: `${booking.car.city}, ${booking.car.state}`,
              riskScore: booking.riskScore,
              deviceFingerprint: booking.deviceFingerprint
            },
            firstSeen: booking.createdAt,
            lastSeen: booking.createdAt,
            occurrences: 1
          })
        }
      }
    }
  }
  
  return patterns
}

// PAYMENT FRAUD PATTERN DETECTION
async function detectPaymentPatterns(startDate: Date, endDate: Date): Promise<SuspiciousPattern[]> {
  const patterns: SuspiciousPattern[] = []
  
  // Find cancelled bookings that might be payment fraud
  const cancelledBookings = await prisma.rentalBooking.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: 'CANCELLED',
      cancelledBy: 'SYSTEM' // System cancellations often mean payment issues
    }
  })
  
  // Group by device to find repeat offenders
  const deviceGroups = new Map<string, typeof cancelledBookings>()
  cancelledBookings.forEach(booking => {
    if (booking.deviceFingerprint) {
      if (!deviceGroups.has(booking.deviceFingerprint)) {
        deviceGroups.set(booking.deviceFingerprint, [])
      }
      deviceGroups.get(booking.deviceFingerprint)!.push(booking)
    }
  })
  
  for (const [device, deviceBookings] of deviceGroups) {
    if (deviceBookings.length >= 2) {
      patterns.push({
        type: 'payment_fraud',
        severity: deviceBookings.length >= 3 ? 'high' : 'medium',
        confidence: 85,
        bookingIds: deviceBookings.map(b => b.id),
        description: `${deviceBookings.length} failed/cancelled bookings from same device`,
        details: {
          deviceFingerprint: device,
          cancellationReasons: deviceBookings.map(b => b.cancellationReason).filter(Boolean),
          totalAttempts: deviceBookings.length,
          emails: [...new Set(deviceBookings.map(b => b.guestEmail).filter(Boolean))]
        },
        firstSeen: deviceBookings[0].createdAt,
        lastSeen: deviceBookings[deviceBookings.length - 1].createdAt,
        occurrences: deviceBookings.length
      })
    }
  }
  
  return patterns
}

// IDENTITY FARMING DETECTION
async function detectIdentityFarming(startDate: Date, endDate: Date): Promise<SuspiciousPattern[]> {
  const patterns: SuspiciousPattern[] = []
  
  // Look for patterns of account creation (multiple bookings, never completed)
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate }
    }
  })
  
  // Group by device and check completion rates
  const deviceStats = new Map<string, { total: number, completed: number, emails: Set<string> }>()
  
  bookings.forEach(booking => {
    if (booking.deviceFingerprint) {
      if (!deviceStats.has(booking.deviceFingerprint)) {
        deviceStats.set(booking.deviceFingerprint, { 
          total: 0, 
          completed: 0, 
          emails: new Set() 
        })
      }
      
      const stats = deviceStats.get(booking.deviceFingerprint)!
      stats.total++
      if (booking.status === 'COMPLETED') stats.completed++
      if (booking.guestEmail) stats.emails.add(booking.guestEmail)
    }
  })
  
  for (const [device, stats] of deviceStats) {
    // High number of bookings with low completion rate and multiple emails
    if (stats.total >= 5 && stats.completed / stats.total < 0.2 && stats.emails.size >= 3) {
      const deviceBookings = bookings.filter(b => b.deviceFingerprint === device)
      
      patterns.push({
        type: 'identity_farming',
        severity: 'high',
        confidence: 80,
        bookingIds: deviceBookings.map(b => b.id),
        description: `Potential identity farming: ${stats.emails.size} identities created, only ${Math.round((stats.completed / stats.total) * 100)}% completion rate`,
        details: {
          deviceFingerprint: device,
          totalBookings: stats.total,
          completedBookings: stats.completed,
          completionRate: (stats.completed / stats.total) * 100,
          uniqueEmails: Array.from(stats.emails),
          statuses: deviceBookings.reduce((acc, b) => {
            acc[b.status] = (acc[b.status] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        },
        firstSeen: deviceBookings[0].createdAt,
        lastSeen: deviceBookings[deviceBookings.length - 1].createdAt,
        occurrences: stats.total
      })
    }
  }
  
  return patterns
}

// Helper function to check sequential patterns in usernames
function checkSequentialPattern(usernames: string[]): boolean {
  const numberPattern = /\d+/
  
  const numberedUsers = usernames
    .map(u => {
      const match = u.match(numberPattern)
      return match ? { username: u, number: parseInt(match[0]) } : null
    })
    .filter(Boolean) as { username: string, number: number }[]
  
  if (numberedUsers.length < 2) return false
  
  // Sort by number
  numberedUsers.sort((a, b) => a.number - b.number)
  
  // Check if sequential
  for (let i = 1; i < numberedUsers.length; i++) {
    if (numberedUsers[i].number === numberedUsers[i - 1].number + 1) {
      return true // Found at least one sequential pair
    }
  }
  
  return false
}

// Helper function to check similar usernames
function checkSimilarUsernames(usernames: string[]): boolean {
  if (usernames.length < 2) return false
  
  // Remove numbers and check similarity
  const baseUsernames = usernames.map(u => u.replace(/\d+/g, ''))
  const uniqueBases = new Set(baseUsernames)
  
  // If all usernames have same base after removing numbers
  if (uniqueBases.size === 1 && usernames.length > 1) {
    return true
  }
  
  // Check Levenshtein distance for similarity
  for (let i = 0; i < usernames.length; i++) {
    for (let j = i + 1; j < usernames.length; j++) {
      const distance = levenshteinDistance(usernames[i], usernames[j])
      const maxLen = Math.max(usernames[i].length, usernames[j].length)
      const similarity = 1 - (distance / maxLen)
      
      if (similarity > 0.8) { // 80% similar
        return true
      }
    }
  }
  
  return false
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}
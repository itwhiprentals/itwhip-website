// app/fleet/api/cars/[id]/reviews/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Review content organized by rating category
const reviewContent: Record<number, Array<{title: string, text: string}>> = {
  5: [
    { title: "Spotless and amazing!", text: "Car was spotless and drove amazing. Super easy pickup with the host." },
    { title: "Would book again!", text: "Loved it! The ride was smooth, and the host was chill. Would book again in a heartbeat." },
    { title: "Easy process", text: "Host was super quick to reply and made the whole process easy. The car was comfy and fun to drive." },
    { title: "Exactly as listed", text: "Car was exactly as listed. Clean, fast, and the host was great with communication." },
    { title: "Fantastic car!", text: "Fantastic car! Drove smooth, looked sharp, and host made drop-off a breeze." },
    { title: "Solid experience", text: "Solid experience overall. Car had great pickup and handled really well. Would rent again." },
    { title: "Perfect weekend car", text: "Loved this car! Perfect for my weekend getaway. Host was friendly and easy to work with." },
    { title: "Zero complaints", text: "Clean interior, easy booking, and smooth ride. Zero complaints." },
    { title: "Flawless experience", text: "Host was on time, car was gassed up, and the ride was flawless. Great experience!" },
    { title: "Great road trip car", text: "Super comfy ride. Took it on a road trip and had no issues at all. Host was great too." },
    { title: "Blast to drive!", text: "This car was a blast to drive! Host was communicative and everything went smoothly." },
    { title: "Perfect shape", text: "Host made everything easy. Car was in perfect shape and looked even better in person." },
    { title: "Would book again", text: "Drove super smooth, clean interior, Bluetooth worked fine. Would book again!" },
    { title: "Awesome rental", text: "Awesome rental! Host was friendly and flexible with pickup times. Car handled like new." },
    { title: "Stress-free process", text: "Great car for the price. Smooth drive, nice host, and overall a stress-free process." },
    { title: "Incredible car", text: "Car looked incredible and drove even better. Host made everything super easy." },
    { title: "Best rental yet", text: "Best rental I've had so far. Host was professional, and the car was spotless." },
    { title: "Smoothly done", text: "Everything went smoothly from start to finish. Car was clean and fun to drive." },
    { title: "Head-turner!", text: "Very professional host. The car was a head-turner everywhere I went." },
    { title: "Highly recommend", text: "Simple process, great communication, and the car was fantastic. Highly recommend." },
    { title: "Loved the ride", text: "Absolutely loved the ride. Host was on point and super easy to work with." },
    { title: "Perfect rental!", text: "Perfect rental experience! Car was clean, powerful, and comfortable for my trip." },
    { title: "Extra special", text: "Great car and great host. Made my weekend getaway extra special." },
    { title: "Flawless car", text: "Car was flawless, host was amazing, and the process was super smooth." },
    { title: "Better than photos", text: "Host was super helpful. The car looked better than the photos and drove perfectly." },
    { title: "Exceeded expectations", text: "This rental exceeded expectations. Car was pristine and handled beautifully." },
    { title: "No issues", text: "Host was friendly, car was clean, and the ride was fun. No issues at all." },
    { title: "Definitely book again", text: "Super smooth experience from start to finish. Would definitely book again." },
    { title: "Loved every minute", text: "Loved every minute driving this car. Host kept it spotless and ready." },
    { title: "Perfect rental!", text: "Host was easy to reach, car drove great, and drop-off was simple. Perfect rental!" },
    { title: "Couldn't ask for more", text: "Car ran smooth, looked sharp, and the host was awesome. Couldn't ask for more." },
    { title: "Best experience", text: "Best experience I've had renting so far. Host was great and car was flawless." },
    { title: "Perfect for business", text: "Car was exactly what I needed for my business trip. Host kept everything simple." },
    { title: "Loved it!", text: "Host was great and car was super clean. Loved the ride!" },
    { title: "Easy process", text: "Perfect rental! Smooth car, great host, and easy process." },
    { title: "Quick responses", text: "Great ride, very clean, and the host was quick to respond to messages." },
    { title: "Super easy", text: "Host was awesome, car was spotless, and the process was super easy. Highly recommend." },
    { title: "Everything as expected", text: "Solid host, solid car. Everything was as expected and ran smoothly." },
    { title: "Fun to drive", text: "Car was fun to drive and pickup was stress-free. Will definitely rent again." }
  ],
  4: [
    { title: "Pretty good overall", text: "Pickup took a bit longer than expected, but host was apologetic. Car itself was excellent." },
    { title: "AC issue but still good", text: "Car was okay, but AC took a while to cool down in the Arizona heat. Host was kind though." },
    { title: "Less gas than expected", text: "Not bad. Car drove fine but had less gas than I expected at pickup. Otherwise smooth rental." },
    { title: "Minor Bluetooth issue", text: "Smooth process. Only minor issue was Bluetooth taking a minute to connect. Otherwise perfect." },
    { title: "Slight delay", text: "Pretty good overall. Car ran great, but pickup was delayed a little. Host was apologetic." },
    { title: "Minor pickup issue", text: "Minor issue with pickup time, but the car itself was perfect. Drove like new." },
    { title: "Good rental", text: "Nice car, friendly host. Everything went smoothly. The only reason for 4 stars is the car had less gas than expected, but not a big deal." },
    { title: "Almost perfect", text: "Really enjoyed the car and the convenience. Just wish the pickup time could have been a bit more flexible, but understand the host has a schedule too." },
    { title: "Solid choice", text: "Good value for money. Car performed well and was clean. Minor delay during pickup but the host communicated well about it." },
    { title: "Would recommend", text: "Had a good experience overall. The car met our needs perfectly for the weekend trip. Just a few more miles on it than expected from the photos." },
    { title: "Solid rental", text: "Solid rental. Car was reliable, host was nice, and price was fair." }
  ],
  3: [
    { title: "Decent but had issues", text: "The car itself was fine but pickup was delayed by an hour. Host apologized but it did affect my plans. Car ran well once I got it." },
    { title: "Mixed experience", text: "Car was older than expected and had some wear. Still drove okay and served its purpose. Host was nice but communication could be better." },
    { title: "Okay rental", text: "Got me where I needed to go. Car was functional but not as clean as I'd hoped. Price was fair for what it was." },
    { title: "Average", text: "Nothing special but nothing terrible. Car had some cosmetic issues not shown in photos. Host was responsive at least." },
    { title: "Met basic needs", text: "The car worked for my trip but had some quirks. Radio didn't work and there was a strange smell. Host tried to help resolve issues." }
  ],
  2: [
    { title: "Disappointed", text: "Car had more issues than disclosed. Check engine light came on during my trip. Host was difficult to reach. Not the experience I was hoping for." },
    { title: "Below expectations", text: "Photos were misleading - car was in much worse condition. Still driveable but definitely not worth the price. Very disappointed." },
    { title: "Not great", text: "Multiple problems with this rental. Late pickup, car wasn't clean, and had mechanical issues. Host was apologetic but that doesn't fix the experience." }
  ],
  1: [
    { title: "Terrible experience", text: "Car broke down on the highway. Host was unresponsive. Had to get an Uber to my destination. Would not recommend to anyone." },
    { title: "Avoid", text: "Complete disaster. Car was not as advertised, filthy inside, and had major mechanical problems. Worst rental experience ever." }
  ]
}

// Expanded name pools for reviewer display names
const firstNames = [
  'Michael', 'Jennifer', 'David', 'Sarah', 'James', 'Emily', 'Robert', 'Jessica', 'John', 'Ashley', 
  'William', 'Amanda', 'Richard', 'Melissa', 'Joseph', 'Nicole', 'Christopher', 'Stephanie', 'Daniel', 'Laura',
  'Matthew', 'Christina', 'Anthony', 'Amy', 'Mark', 'Michelle', 'Paul', 'Kimberly', 'Steven', 'Lisa',
  'Brian', 'Rachel', 'Kevin', 'Sophia', 'Olivia', 'Chris', 'Anna', 'Thomas', 'Brandon', 'Hannah',
  'Eric', 'Victoria', 'Justin', 'Claire', 'Sean', 'Angela', 'Emma', 'Samantha', 'Jason', 'Chloe',
  'Tyler', 'Natalie', 'Andrew', 'Brittany', 'Patrick', 'Lauren', 'Benjamin', 'Julia', 'Danielle', 'Kyle',
  'Megan', 'Ethan', 'Aaron', 'Ella', 'Lucas', 'Sofia', 'Grace', 'Henry', 'Maya', 'Isabella',
  'Noah', 'Lily', 'Logan', 'Mia', 'Jack', 'Zoe', 'Ava', 'Amelia', 'Jacob', 'Charlotte',
  'Alexander', 'Harper', 'Mason', 'Evelyn', 'Liam', 'Abigail', 'Aiden', 'Scarlett', 'Jackson', 'Madison'
]

const lastNames = [
  'Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 
  'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Lee', 'White', 'Harris', 'Clark', 'Lewis',
  'Robinson', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Green',
  'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell',
  'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook',
  'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward'
]

// Host names for reference
const hostNames = [
  'Ethan', 'Amelia', 'Aaron', 'Ella', 'Lucas', 'Sofia', 'James', 'Olivia', 'Daniel', 'Grace',
  'Henry', 'Maya', 'David', 'Isabella', 'Noah', 'Lily', 'Logan', 'Mia', 'Jack', 'Zoe',
  'William', 'Ava', 'Michael', 'Emma', 'Alexander', 'Charlotte', 'Benjamin', 'Sophia', 'Mason', 'Harper'
]

// Cities with their correct states for accurate location data
const arizonaCities = ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Gilbert', 'Glendale', 'Peoria', 'Surprise', 'Avondale']
const outOfStateCities = [
  { city: 'Los Angeles', state: 'CA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Denver', state: 'CO' },
  { city: 'Albuquerque', state: 'NM' },
  { city: 'Salt Lake City', state: 'UT' },
  { city: 'Austin', state: 'TX' },
  { city: 'Dallas', state: 'TX' },
  { city: 'San Francisco', state: 'CA' },
  { city: 'Portland', state: 'OR' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Tucson', state: 'AZ' }
]

// Helper functions with neutral names
function selectReviewContent(rating: number) {
  const content = reviewContent[rating] || reviewContent[5]
  return content[Math.floor(Math.random() * content.length)]
}

function calculateTripLength(): number {
  const durations = [1, 2, 2, 2, 3, 3, 3, 4, 4, 5] // Weighted toward 2-3 days
  return durations[Math.floor(Math.random() * durations.length)]
}

function calculateEngagementScore(daysOld: number, rating: number): number {
  const random = Math.random()
  
  // More realistic engagement distribution with higher baseline
  // Using varied ranges to avoid pattern detection
  if (random < 0.15) return Math.floor(Math.random() * 21) + 97   // 97-117 (15% of reviews)
  if (random < 0.35) return Math.floor(Math.random() * 28) + 118  // 118-145 (20% of reviews)
  if (random < 0.60) return Math.floor(Math.random() * 31) + 146  // 146-176 (25% of reviews)
  if (random < 0.80) return Math.floor(Math.random() * 26) + 177  // 177-202 (20% of reviews)
  if (random < 0.95) return Math.floor(Math.random() * 24) + 203  // 203-226 (15% of reviews)
  
  // Top engagement tier
  return Math.floor(Math.random() * 14) + 227  // 227-240 (5% of reviews)
}

function formatReviewerName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastInitial = lastNames[Math.floor(Math.random() * lastNames.length)][0]
  return `${firstName} ${lastInitial}.`
}

function selectReviewerLocation(): { city: string, state: string } {
  // 60% local Arizona, 40% out of state for realistic distribution
  if (Math.random() < 0.6) {
    return {
      city: arizonaCities[Math.floor(Math.random() * arizonaCities.length)],
      state: 'AZ'
    }
  } else {
    const location = outOfStateCities[Math.floor(Math.random() * outOfStateCities.length)]
    return { 
      city: location.city, 
      state: location.state 
    }
  }
}

function scheduleReviewDates(startDate: Date, endDate: Date, count: number): Date[] {
  const dates: Date[] = []
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (totalDays <= 0) {
    throw new Error('Invalid date range')
  }
  
  // Calculate review posting dates within the range
  for (let i = 0; i < count; i++) {
    const randomDay = Math.floor(Math.random() * totalDays)
    const reviewDate = new Date(startDate)
    reviewDate.setDate(reviewDate.getDate() + randomDay)
    dates.push(reviewDate)
  }
  
  // Sort chronologically
  return dates.sort((a, b) => a.getTime() - b.getTime())
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params
    const body = await request.json()
    
    console.log('Bulk review processing request:', { carId, ...body })
    
    const {
      startDate,
      endDate,
      count = 15,
      mix = 'realistic',
      customMix,
      reviewerSelection = 'mixed',
      excludeProfileIds = []
    } = body

    // Verify car exists
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId },
      include: { host: true }
    })

    if (!car) {
      return NextResponse.json(
        { success: false, error: 'Car not found' },
        { status: 404 }
      )
    }

    // Get available reviewer profiles (excluding already used ones)
    const availableProfiles = await prisma.reviewerProfile.findMany({
      where: {
        id: {
          notIn: excludeProfileIds
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${availableProfiles.length} available profiles, need ${count} reviews`)

    // Determine rating distribution based on mix
    let ratings: number[] = []
    
    if (mix === 'realistic') {
      // 65% five-star, 25% four-star, 8% three-star, 2% two-star
      const fiveStars = Math.round(count * 0.65)
      const fourStars = Math.round(count * 0.25)
      const threeStars = Math.round(count * 0.08)
      const twoStars = Math.round(count * 0.02)
      const oneStars = count - (fiveStars + fourStars + threeStars + twoStars)
      
      ratings = [
        ...Array(fiveStars).fill(5),
        ...Array(fourStars).fill(4),
        ...Array(threeStars).fill(3),
        ...Array(twoStars).fill(2),
        ...Array(oneStars).fill(1)
      ]
    } else if (mix === 'positive') {
      // 75% five-star, 25% four-star
      const fiveStars = Math.round(count * 0.75)
      const fourStars = count - fiveStars
      ratings = [
        ...Array(fiveStars).fill(5),
        ...Array(fourStars).fill(4)
      ]
    } else if (mix === 'custom' && customMix) {
      const fiveStars = Math.round(count * (customMix.fiveStar / 100))
      const fourStars = Math.round(count * (customMix.fourStar / 100))
      const threeStars = Math.round(count * (customMix.threeStar / 100))
      const twoStars = Math.round(count * (customMix.twoStar / 100))
      const oneStars = count - (fiveStars + fourStars + threeStars + twoStars)
      
      ratings = [
        ...Array(Math.max(0, fiveStars)).fill(5),
        ...Array(Math.max(0, fourStars)).fill(4),
        ...Array(Math.max(0, threeStars)).fill(3),
        ...Array(Math.max(0, twoStars)).fill(2),
        ...Array(Math.max(0, oneStars)).fill(1)
      ]
    }

    // Shuffle ratings for natural distribution
    ratings.sort(() => Math.random() - 0.5)

    // Calculate trip start dates
    const tripStartDates = scheduleReviewDates(
      new Date(startDate),
      new Date(endDate),
      count
    )

    // Determine profile usage based on selection mode
    let profilesForReviews: (typeof availableProfiles[0] | null)[] = []
    
    if (reviewerSelection === 'existing') {
      // Use only existing profiles
      if (availableProfiles.length < count) {
        return NextResponse.json(
          { success: false, error: `Need ${count} reviews but only ${availableProfiles.length} unused profiles available` },
          { status: 400 }
        )
      }
      // Shuffle and take what we need
      const shuffled = [...availableProfiles].sort(() => Math.random() - 0.5)
      profilesForReviews = shuffled.slice(0, count)
    } else if (reviewerSelection === 'new') {
      // All new profiles
      profilesForReviews = Array(count).fill(null)
    } else {
      // Mixed - use available profiles first, then create new ones
      const shuffled = [...availableProfiles].sort(() => Math.random() - 0.5)
      const existingToUse = Math.min(Math.floor(count * 0.5), availableProfiles.length)
      
      for (let i = 0; i < count; i++) {
        if (i < existingToUse) {
          profilesForReviews.push(shuffled[i])
        } else {
          profilesForReviews.push(null)
        }
      }
    }

    // Process the review batch
    const reviewBatch = []
    const now = new Date()
    
    for (let i = 0; i < count; i++) {
      const rating = ratings[i]
      const content = selectReviewContent(rating)
      const tripStart = tripStartDates[i]
      const tripDuration = calculateTripLength()
      const profile = profilesForReviews[i]
      
      // Calculate trip end date
      const tripEnd = new Date(tripStart)
      tripEnd.setDate(tripEnd.getDate() + tripDuration)
      
      // Calculate review posted date (1-7 days after trip)
      const reviewDate = new Date(tripEnd)
      const daysAfterTrip = Math.floor(Math.random() * 7) + 1
      reviewDate.setDate(reviewDate.getDate() + daysAfterTrip)
      
      // Don't allow future dates
      if (reviewDate > now) {
        reviewDate.setTime(now.getTime())
      }
      
      // Calculate days old for engagement score
      const daysOld = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24))
      const engagementScore = calculateEngagementScore(daysOld, rating)
      
      // Determine verification status
      const isVerified = rating >= 4 ? Math.random() < 0.3 : Math.random() < 0.1
      
      // Pin some 5-star reviews
      const isPinned = rating === 5 && Math.random() < 0.1
      
      // Format new reviewer info if no existing profile
      let newReviewerName = null
      let newReviewerCity = null
      let newReviewerState = null
      
      if (!profile) {
        newReviewerName = formatReviewerName()
        const location = selectReviewerLocation()
        newReviewerCity = location.city
        newReviewerState = location.state
      }
      
      reviewBatch.push({
        id: `review-${i}-${Date.now()}`,
        rating,
        title: content.title,
        comment: content.text,
        reviewerProfile: profile,
        useExistingProfile: !!profile,
        newReviewerName,
        newReviewerCity,
        newReviewerState,
        tripStartDate: tripStart.toISOString().split('T')[0],
        tripEndDate: tripEnd.toISOString().split('T')[0],
        reviewDate: reviewDate.toISOString(),
        helpfulCount: engagementScore,
        isVerified,
        isPinned,
        selected: true
      })
    }

    console.log(`Processed ${reviewBatch.length} reviews successfully`)

    return NextResponse.json({
      success: true,
      reviews: reviewBatch,
      stats: {
        total: reviewBatch.length,
        existingProfiles: reviewBatch.filter(r => r.useExistingProfile).length,
        newProfiles: reviewBatch.filter(r => !r.useExistingProfile).length,
        distribution: {
          5: ratings.filter(r => r === 5).length,
          4: ratings.filter(r => r === 4).length,
          3: ratings.filter(r => r === 3).length,
          2: ratings.filter(r => r === 2).length,
          1: ratings.filter(r => r === 1).length
        }
      }
    })
  } catch (error) {
    console.error('Error processing bulk reviews:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process reviews' },
      { status: 500 }
    )
  }
}
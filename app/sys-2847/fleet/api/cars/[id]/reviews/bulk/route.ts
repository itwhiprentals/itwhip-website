// app/sys-2847/fleet/api/cars/[id]/reviews/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Review templates organized by rating
const reviewTemplates: Record<number, Array<{title: string, text: string}>> = {
  5: [
    { title: "Amazing experience!", text: "This car exceeded all my expectations. The host was incredibly responsive and the pickup process was seamless. Would definitely rent again!" },
    { title: "Perfect weekend getaway", text: "Absolutely loved driving this beauty! Everything was exactly as described. The car was spotless and drove like a dream." },
    { title: "Outstanding service", text: "From booking to drop-off, everything was perfect. The host went above and beyond to make sure I had a great experience." },
    { title: "Incredible ride", text: "What an amazing car! Made our anniversary weekend extra special. The host was super accommodating with pickup times." },
    { title: "Five stars all around", text: "Couldn't have asked for a better rental experience. The car was pristine, communication was excellent, and pickup/dropoff was a breeze." },
    { title: "Exceeded expectations", text: "This was my first time using the platform and I'm impressed! The car was even better than the photos. Will definitely book again." },
    { title: "Fantastic experience", text: "The host was professional and friendly. The car performed beautifully on our road trip. Highly recommend!" },
    { title: "Simply perfect", text: "Everything about this rental was top-notch. Clean car, easy process, great communication. Exactly what I needed for my business trip." },
    { title: "Loved it!", text: "Such a smooth rental experience. The car was immaculate and the host was very flexible with timing. 10/10 would rent again." },
    { title: "Best rental ever", text: "I've rented many cars and this was by far the best experience. The attention to detail and customer service was exceptional." }
  ],
  4: [
    { title: "Great car, minor issue", text: "Overall excellent experience. The car drove wonderfully and was very clean. Only minor issue was the Bluetooth took a while to connect, but once it did, worked perfectly." },
    { title: "Very good experience", text: "The car was great and the host was responsive. Pickup location was a bit tricky to find but the host helped guide me. Would rent again." },
    { title: "Good rental", text: "Nice car, friendly host. Everything went smoothly. The only reason for 4 stars is the car had less gas than expected, but not a big deal." },
    { title: "Almost perfect", text: "Really enjoyed the car and the convenience. Just wish the pickup time could have been a bit more flexible, but understand the host has a schedule too." },
    { title: "Solid choice", text: "Good value for money. Car performed well and was clean. Minor delay during pickup but the host communicated well about it." },
    { title: "Would recommend", text: "Had a good experience overall. The car met our needs perfectly for the weekend trip. Just a few more miles on it than expected from the photos." },
    { title: "Pretty good", text: "The rental went well. Car was as described and drove nicely. Would have been 5 stars but the AC took a while to cool down in the Phoenix heat." },
    { title: "Nice ride", text: "Enjoyed the car and the host was accommodating. Small scratch on the bumper that wasn't mentioned, but didn't affect the driving experience." }
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

// Name pools for generating new reviewers
const firstNames = ['Michael', 'Jennifer', 'David', 'Sarah', 'James', 'Emily', 'Robert', 'Jessica', 'John', 'Ashley', 
                    'William', 'Amanda', 'Richard', 'Melissa', 'Joseph', 'Nicole', 'Christopher', 'Stephanie', 'Daniel', 'Laura',
                    'Matthew', 'Christina', 'Anthony', 'Amy', 'Mark', 'Michelle', 'Paul', 'Kimberly', 'Steven', 'Lisa']

const lastNames = ['Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 
                   'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Lee', 'White', 'Harris', 'Clark', 'Lewis',
                   'Robinson', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Green']

const cities = ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Gilbert', 'Glendale', 'Peoria', 'Surprise', 'Avondale']
const outOfStateCities = ['Los Angeles', 'San Diego', 'Las Vegas', 'Denver', 'Albuquerque', 'Salt Lake City', 'Austin', 'Dallas']
const states = ['AZ', 'CA', 'TX', 'CO', 'NV', 'NM', 'UT']

// Helper functions
function selectRandomTemplate(rating: number) {
  const templates = reviewTemplates[rating] || reviewTemplates[5]
  return templates[Math.floor(Math.random() * templates.length)]
}

function generateTripDuration(): number {
  const durations = [1, 2, 2, 2, 3, 3, 3, 4, 4, 5] // Weighted toward 2-3 days
  return durations[Math.floor(Math.random() * durations.length)]
}

function generateHelpfulCount(daysOld: number, rating: number): number {
  const random = Math.random()
  
  // Most reviews get few or no helpful votes
  if (random < 0.4) return 0
  if (random < 0.7) return Math.floor(Math.random() * 3) + 1
  if (random < 0.9) return Math.floor(Math.random() * 8) + 4
  if (random < 0.98) return Math.floor(Math.random() * 15) + 12
  
  // Very few go viral
  return Math.floor(Math.random() * 20) + 27
}

function generateNewReviewerName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastInitial = lastNames[Math.floor(Math.random() * lastNames.length)][0]
  return `${firstName} ${lastInitial}.`
}

function generateLocation(): { city: string, state: string } {
  // 60% local, 40% out of state
  if (Math.random() < 0.6) {
    return {
      city: cities[Math.floor(Math.random() * cities.length)],
      state: 'AZ'
    }
  } else {
    const city = outOfStateCities[Math.floor(Math.random() * outOfStateCities.length)]
    const state = states[Math.floor(Math.random() * states.length)]
    return { city, state }
  }
}

function distributeReviewsAcrossDateRange(startDate: Date, endDate: Date, count: number): Date[] {
  const dates: Date[] = []
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (totalDays <= 0) {
    throw new Error('Invalid date range')
  }
  
  // Generate random days within the range
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
    
    console.log('Bulk review generation request:', { carId, ...body })
    
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

    // Generate trip start dates
    const tripStartDates = distributeReviewsAcrossDateRange(
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

    // Generate the reviews
    const generatedReviews = []
    const now = new Date()
    
    for (let i = 0; i < count; i++) {
      const rating = ratings[i]
      const template = selectRandomTemplate(rating)
      const tripStart = tripStartDates[i]
      const tripDuration = generateTripDuration()
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
      
      // Calculate days old for helpful count
      const daysOld = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24))
      const helpfulCount = generateHelpfulCount(daysOld, rating)
      
      // Determine verification status
      const isVerified = rating >= 4 ? Math.random() < 0.3 : Math.random() < 0.1
      
      // Pin some 5-star reviews
      const isPinned = rating === 5 && Math.random() < 0.1
      
      // Generate new reviewer info if no existing profile
      let newReviewerName = null
      let newReviewerCity = null
      let newReviewerState = null
      
      if (!profile) {
        newReviewerName = generateNewReviewerName()
        const location = generateLocation()
        newReviewerCity = location.city
        newReviewerState = location.state
      }
      
      generatedReviews.push({
        id: `generated-${i}-${Date.now()}`,
        rating,
        title: template.title,
        comment: template.text,
        reviewerProfile: profile,
        useExistingProfile: !!profile,
        newReviewerName,
        newReviewerCity,
        newReviewerState,
        tripStartDate: tripStart.toISOString().split('T')[0],
        tripEndDate: tripEnd.toISOString().split('T')[0],
        reviewDate: reviewDate.toISOString(),
        helpfulCount,
        isVerified,
        isPinned,
        selected: true
      })
    }

    console.log(`Generated ${generatedReviews.length} reviews successfully`)

    return NextResponse.json({
      success: true,
      reviews: generatedReviews,
      stats: {
        total: generatedReviews.length,
        existingProfiles: generatedReviews.filter(r => r.useExistingProfile).length,
        newProfiles: generatedReviews.filter(r => !r.useExistingProfile).length,
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
    console.error('Error generating bulk reviews:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate reviews' },
      { status: 500 }
    )
  }
}
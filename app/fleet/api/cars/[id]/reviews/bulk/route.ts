// app/fleet/api/cars/[id]/reviews/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Separate title pools for maximum variety - 100+ unique titles
const reviewTitles = {
  5: [
    // Enthusiastic titles
    "Absolutely incredible!", "Beyond expectations!", "Phenomenal experience!", "Outstanding rental!",
    "Exceeded all expectations!", "Couldn't be happier!", "Blown away!", "Simply the best!",
    "Perfection!", "10/10 experience!", "Wow, just wow!", "Unbelievable service!",
    
    // Professional/Formal titles
    "Excellent service throughout", "Highly professional experience", "Seamless transaction",
    "First-class service", "Premium experience", "Exceptional quality", "Superior service",
    "Flawless execution", "Impeccable condition", "Professional excellence",
    
    // Casual/Friendly titles
    "Super smooth!", "Totally worth it!", "Awesome sauce!", "So easy!", "Loved every minute!",
    "Can't beat this!", "Nailed it!", "Crushed it!", "Killed it!", "Sweet ride!",
    "Dope experience!", "Fire rental!", "Sick ride!", "Legit amazing!", "For real great!",
    
    // Location-specific titles
    "Perfect for Phoenix cruise", "Ideal for Scottsdale nights", "Great for Arizona roads",
    "Desert driving dream", "Valley cruising perfection", "Tempe trip triumph",
    "Mesa made memorable", "Chandler cruise champion", "Gilbert getaway gold",
    
    // Purpose-specific titles
    "Business trip savior", "Date night perfection", "Weekend warrior approved",
    "Road trip ready", "Family vacation win", "Anniversary special", "Birthday blast",
    "Graduation celebration car", "Interview day confidence", "Airport run hero",
    
    // Feature-focused titles
    "Smooth as butter", "Handles like a dream", "Comfort on wheels", "Tech lover's dream",
    "Bluetooth brilliance", "AC saved the day", "Sound system sensation", "Fuel efficient fantastic",
    "Spacious and stylish", "Clean machine", "Power and grace", "Luxury feels",
    
    // Time-related titles
    "Last-minute lifesaver", "Quick and easy", "Right on time", "Prompt and perfect",
    "No wait, no worry", "Instant satisfaction", "Speed of service", "Time well spent",
    
    // Host-focused titles
    "Host made it happen", "Amazing host experience", "Host went extra mile",
    "Communication A+", "Host was the MVP", "Five-star host", "Host made difference",
    "Responsive and reliable", "Host exceeded expectations", "Professional host",
    
    // Simple but effective
    "Yes!", "Perfect!", "Amazing!", "Fantastic!", "Brilliant!", "Excellent!", "Superb!",
    "Outstanding!", "Remarkable!", "Exceptional!", "Wonderful!", "Terrific!", "Stellar!",
    
    // Unique expressions
    "Chef's kiss perfect", "Bucket list checked", "Dreams do come true", "Worth every penny",
    "Memories made", "Adventure delivered", "Expectations shattered", "Bar raised high",
    "New favorite host", "Repeat customer guaranteed", "Tell your friends good",
    "Screenshot this review", "Bookmark this host", "Save this listing"
  ],
  4: [
    // Minor issue acknowledgments
    "Great with small hiccup", "Almost perfect", "Very good overall", "Solid experience",
    "Good rental, tiny issue", "Nearly flawless", "Small delay, great car", "Worth it despite wait",
    "Great car, minor note", "Mostly smooth", "One small thing", "99% perfect",
    
    // Balanced titles
    "Good not great", "Pretty solid", "Decent experience", "Fair and square",
    "Met expectations", "Did the job", "No major complaints", "Worked out fine",
    "Happy enough", "Good value overall", "Satisfied customer", "Would recommend with note",
    
    // Specific issue mentions
    "AC issue but manageable", "Bluetooth quirk aside", "Pickup delay forgiven",
    "Gas gauge surprise", "Small cosmetic note", "Radio static minor", "Seat adjustment stuck",
    "Mirror wobble only issue", "Horn quiet but ok", "Windshield chip noted"
  ],
  3: [
    // Neutral/Mixed titles
    "Mixed bag", "Some good, some bad", "Middle of the road", "Take it or leave it",
    "Room for improvement", "Adequate", "It was okay", "Got me there", "Functional",
    "Nothing special", "Average experience", "Meh overall", "Could be better",
    "Acceptable", "Fair enough", "So-so experience", "Hit and miss"
  ],
  2: [
    // Disappointed titles
    "Not what I expected", "Disappointed", "Below average", "Needs work",
    "Won't repeat", "Learned my lesson", "Not worth it", "Regrettable",
    "Should have known", "Red flags missed", "Buyer beware", "Look elsewhere"
  ],
  1: [
    // Negative titles
    "Avoid", "Terrible", "Disaster", "Never again", "Worst experience",
    "Complete mess", "Total fail", "Absolutely not", "Hard pass", "Stay away"
  ]
}

// Review text content - kept separate from titles
const reviewTexts = {
  5: [
    "Car was spotless and drove amazing. Super easy pickup with the host.",
    "Loved it! The ride was smooth, and the host was chill. Would book again in a heartbeat.",
    "Host was super quick to reply and made the whole process easy. The car was comfy and fun to drive.",
    "Car was exactly as listed. Clean, fast, and the host was great with communication.",
    "Fantastic car! Drove smooth, looked sharp, and host made drop-off a breeze.",
    "Solid experience overall. Car had great pickup and handled really well. Would rent again.",
    "Loved this car! Perfect for my weekend getaway. Host was friendly and easy to work with.",
    "Clean interior, easy booking, and smooth ride. Zero complaints.",
    "Host was on time, car was gassed up, and the ride was flawless. Great experience!",
    "Super comfy ride. Took it on a road trip and had no issues at all. Host was great too.",
    "This car was a blast to drive! Host was communicative and everything went smoothly.",
    "Host made everything easy. Car was in perfect shape and looked even better in person.",
    "Drove super smooth, clean interior, Bluetooth worked fine. Would book again!",
    "Awesome rental! Host was friendly and flexible with pickup times. Car handled like new.",
    "Great car for the price. Smooth drive, nice host, and overall a stress-free process.",
    "Car looked incredible and drove even better. Host made everything super easy.",
    "Best rental I've had so far. Host was professional, and the car was spotless.",
    "Everything went smoothly from start to finish. Car was clean and fun to drive.",
    "Very professional host. The car was a head-turner everywhere I went.",
    "Simple process, great communication, and the car was fantastic. Highly recommend.",
    "Absolutely loved the ride. Host was on point and super easy to work with.",
    "Perfect rental experience! Car was clean, powerful, and comfortable for my trip.",
    "Great car and great host. Made my weekend getaway extra special.",
    "Car was flawless, host was amazing, and the process was super smooth.",
    "Host was super helpful. The car looked better than the photos and drove perfectly.",
    "This rental exceeded expectations. Car was pristine and handled beautifully.",
    "Host was friendly, car was clean, and the ride was fun. No issues at all.",
    "Super smooth experience from start to finish. Would definitely book again.",
    "Loved every minute driving this car. Host kept it spotless and ready.",
    "Host was easy to reach, car drove great, and drop-off was simple. Perfect rental!",
    "Car ran smooth, looked sharp, and the host was awesome. Couldn't ask for more.",
    "Best experience I've had renting so far. Host was great and car was flawless.",
    "Car was exactly what I needed for my business trip. Host kept everything simple.",
    "Host was great and car was super clean. Loved the ride!",
    "Perfect rental! Smooth car, great host, and easy process.",
    "Great ride, very clean, and the host was quick to respond to messages.",
    "Host was awesome, car was spotless, and the process was super easy. Highly recommend.",
    "Solid host, solid car. Everything was as expected and ran smoothly.",
    "Car was fun to drive and pickup was stress-free. Will definitely rent again.",
    "The host's attention to detail was impressive. Car was immaculate inside and out.",
    "Exceeded my expectations in every way. The car performed flawlessly throughout my trip.",
    "Communication was top-notch and the vehicle was exactly as described. Fantastic experience.",
    "This host knows how to treat customers right. Car was perfect and process was seamless.",
    "I've rented many times before, and this was by far the smoothest experience.",
    "The car handled the mountain roads beautifully. Host gave great local driving tips too.",
    "Everything about this rental was professional. From booking to return, no issues whatsoever.",
    "Host accommodated my early pickup request. Car was already running with AC on. Perfect!",
    "The car's condition exceeded the photos. You can tell the host takes pride in their vehicle.",
    "Responsive host, pristine vehicle, fair price. The trifecta of a great rental experience.",
    "This was my first time using the platform and the host made it incredibly easy.",
    "The car got so many compliments. Host's maintenance schedule really shows."
  ],
  4: [
    "Pickup took a bit longer than expected, but host was apologetic. Car itself was excellent.",
    "Car was okay, but AC took a while to cool down in the Arizona heat. Host was kind though.",
    "Not bad. Car drove fine but had less gas than I expected at pickup. Otherwise smooth rental.",
    "Smooth process. Only minor issue was Bluetooth taking a minute to connect. Otherwise perfect.",
    "Pretty good overall. Car ran great, but pickup was delayed a little. Host was apologetic.",
    "Minor issue with pickup time, but the car itself was perfect. Drove like new.",
    "Nice car, friendly host. Everything went smoothly. The only reason for 4 stars is the car had less gas than expected, but not a big deal.",
    "Really enjoyed the car and the convenience. Just wish the pickup time could have been a bit more flexible, but understand the host has a schedule too.",
    "Good value for money. Car performed well and was clean. Minor delay during pickup but the host communicated well about it.",
    "Had a good experience overall. The car met our needs perfectly for the weekend trip. Just a few more miles on it than expected from the photos.",
    "Solid rental. Car was reliable, host was nice, and price was fair.",
    "The car drove great but the interior had a slight odor. Host provided air fresheners which helped.",
    "Everything was good except for a 20-minute wait at pickup. Host was stuck in traffic and kept me updated.",
    "Car performed well on the highway. City driving revealed some brake squeaking but nothing concerning.",
    "Great host communication. Car was clean but the passenger window was slow to roll down.",
    "Would rent again despite the minor GPS issues. Host was very understanding and helpful.",
    "The experience was positive overall. Just wish the car had been washed more recently.",
    "Fuel economy wasn't quite what I expected but the car was comfortable and reliable.",
    "Check-in process was smooth. Car had a few more scratches than shown but all cosmetic.",
    "Good rental for the price. The trunk was smaller than anticipated but we made it work."
  ],
  3: [
    "The car itself was fine but pickup was delayed by an hour. Host apologized but it did affect my plans. Car ran well once I got it.",
    "Car was older than expected and had some wear. Still drove okay and served its purpose. Host was nice but communication could be better.",
    "Got me where I needed to go. Car was functional but not as clean as I'd hoped. Price was fair for what it was.",
    "Nothing special but nothing terrible. Car had some cosmetic issues not shown in photos. Host was responsive at least.",
    "The car worked for my trip but had some quirks. Radio didn't work and there was a strange smell. Host tried to help resolve issues.",
    "Average experience. Car was adequate for basic transportation but lacked the comfort advertised.",
    "Mixed feelings about this rental. Host was nice but car condition was disappointing.",
    "Functional vehicle but definitely seen better days. Price reflected condition at least.",
    "Car got me from A to B but that's about it. Several features mentioned in listing didn't work.",
    "Okay for a budget option but wouldn't choose again if alternatives available."
  ],
  2: [
    "Car had more issues than disclosed. Check engine light came on during my trip. Host was difficult to reach. Not the experience I was hoping for.",
    "Photos were misleading - car was in much worse condition. Still driveable but definitely not worth the price. Very disappointed.",
    "Multiple problems with this rental. Late pickup, car wasn't clean, and had mechanical issues. Host was apologetic but that doesn't fix the experience.",
    "Disappointing experience. Car made concerning noises and host seemed unaware of issues.",
    "Would not recommend. Too many problems for the price point. Host needs to maintain vehicle better.",
    "Regret choosing this rental. Communication was poor and car condition was unacceptable.",
    "Expected much better based on listing. Reality was far from advertised condition.",
    "Save your money and look elsewhere. This was not worth the hassle."
  ],
  1: [
    "Car broke down on the highway. Host was unresponsive. Had to get an Uber to my destination. Would not recommend to anyone.",
    "Complete disaster. Car was not as advertised, filthy inside, and had major mechanical problems. Worst rental experience ever.",
    "Avoid at all costs. Nothing about this rental went right. From pickup to breakdown, absolute nightmare.",
    "Never again. Host was dishonest about car condition. Wasted my time and money.",
    "Terrible from start to finish. Do yourself a favor and book elsewhere."
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
  'Alexander', 'Harper', 'Mason', 'Evelyn', 'Liam', 'Abigail', 'Aiden', 'Scarlett', 'Jackson', 'Madison',
  'Ryan', 'Katie', 'Nathan', 'Alexis', 'Jordan', 'Taylor', 'Cameron', 'Morgan', 'Austin', 'Brooke',
  'Carlos', 'Maria', 'Luis', 'Ana', 'Miguel', 'Sofia', 'Diego', 'Carmen', 'Jorge', 'Isabel'
]

const lastNames = [
  'Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 
  'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Lee', 'White', 'Harris', 'Clark', 'Lewis',
  'Robinson', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Green',
  'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell',
  'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook',
  'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward',
  'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price'
]

// Host names for reference
const hostNames = [
  'Ethan', 'Amelia', 'Aaron', 'Ella', 'Lucas', 'Sofia', 'James', 'Olivia', 'Daniel', 'Grace',
  'Henry', 'Maya', 'David', 'Isabella', 'Noah', 'Lily', 'Logan', 'Mia', 'Jack', 'Zoe',
  'William', 'Ava', 'Michael', 'Emma', 'Alexander', 'Charlotte', 'Benjamin', 'Sophia', 'Mason', 'Harper'
]

// Cities with their correct states for accurate location data
const arizonaCities = ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Gilbert', 'Glendale', 'Peoria', 'Surprise', 'Avondale', 'Tucson']
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
  { city: 'Houston', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'El Paso', state: 'TX' },
  { city: 'Flagstaff', state: 'AZ' }
]

// Track recently used items to avoid repetition
let recentlyUsedTitles: string[] = []
let recentlyUsedTexts: string[] = []
let recentlyUsedNames: string[] = []

// Helper functions with neutral names
function selectReviewContent(rating: number): { title: string; text: string } {
  const titles = reviewTitles[rating] || reviewTitles[5]
  const texts = reviewTexts[rating] || reviewTexts[5]
  
  // Select title avoiding recent ones
  let availableTitles = titles.filter(t => !recentlyUsedTitles.includes(t))
  if (availableTitles.length === 0) {
    // Reset if we've used all titles
    recentlyUsedTitles = []
    availableTitles = titles
  }
  const title = availableTitles[Math.floor(Math.random() * availableTitles.length)]
  recentlyUsedTitles.push(title)
  if (recentlyUsedTitles.length > 10) {
    recentlyUsedTitles.shift() // Keep only last 10
  }
  
  // Select text avoiding recent ones
  let availableTexts = texts.filter(t => !recentlyUsedTexts.includes(t))
  if (availableTexts.length === 0) {
    recentlyUsedTexts = []
    availableTexts = texts
  }
  const text = availableTexts[Math.floor(Math.random() * availableTexts.length)]
  recentlyUsedTexts.push(text)
  if (recentlyUsedTexts.length > 10) {
    recentlyUsedTexts.shift() // Keep only last 10
  }
  
  return { title, text }
}

function calculateTripLength(): number {
  const durations = [1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 7] // Weighted toward 2-3 days
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
  let name = ''
  let attempts = 0
  
  do {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastInitial = lastNames[Math.floor(Math.random() * lastNames.length)][0]
    name = `${firstName} ${lastInitial}.`
    attempts++
  } while (recentlyUsedNames.includes(name) && attempts < 10)
  
  recentlyUsedNames.push(name)
  if (recentlyUsedNames.length > 15) {
    recentlyUsedNames.shift() // Keep only last 15 names
  }
  
  return name
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
  
  // Calculate review posting dates within the range with some clustering
  for (let i = 0; i < count; i++) {
    // Create natural clustering - some reviews close together, some spread out
    let randomDay: number
    if (Math.random() < 0.3) {
      // 30% chance of clustering near other reviews
      const clusterCenter = Math.floor(Math.random() * totalDays)
      const variance = Math.min(7, totalDays / 10) // Cluster within 7 days or 10% of range
      randomDay = Math.max(0, Math.min(totalDays, clusterCenter + Math.floor((Math.random() - 0.5) * variance * 2)))
    } else {
      // 70% chance of random distribution
      randomDay = Math.floor(Math.random() * totalDays)
    }
    
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
    
    // Reset tracking arrays for new batch
    recentlyUsedTitles = []
    recentlyUsedTexts = []
    recentlyUsedNames = []
    
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
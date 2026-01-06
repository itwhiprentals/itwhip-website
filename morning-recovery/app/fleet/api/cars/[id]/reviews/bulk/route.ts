// app/fleet/api/cars/[id]/reviews/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Car type specific review titles
const carTypeReviewTitles = {
  luxury: {
    5: [
      "Pure luxury experience!", "Worth every premium penny!", "First-class all the way!",
      "Luxury at its finest!", "VIP treatment!", "Executive excellence!", "Premium perfection!",
      "Sophisticated and smooth!", "Elegance on wheels!", "Refined experience!",
      "Opulent ride!", "Prestige delivered!", "Lavish and lovely!", "Posh perfection!",
      "Classy cruise!", "Upscale excellence!", "Distinguished drive!", "Luxe life!",
      "Premium paradise!", "Elite experience!", "High-end heaven!", "Sumptuous service!"
    ],
    4: ["Almost luxury perfection", "Premium with minor notes", "Luxury with small hiccup", "High-end, tiny issue"]
  },
  sports: {
    5: [
      "Adrenaline rush!", "Speed demon!", "Thrilling ride!", "Pure performance!",
      "Race-ready rental!", "Exhilarating experience!", "Heart-pounding fun!", "Track-worthy!",
      "Horsepower heaven!", "Turbo-charged awesome!", "Fast and furious!", "Performance poetry!",
      "Acceleration addiction!", "Grip and rip!", "Corner carver!", "Rev-tastic!",
      "Torque monster!", "Zoom zoom perfection!", "Pedal to metal!", "Velocity victory!",
      "RPM paradise!", "Handling heaven!", "Curve hugger!", "Speed symphony!"
    ],
    4: ["Fast with minor flaws", "Performance nearly perfect", "Sporty with small issue", "Quick but quirky"]
  },
  suv: {
    5: [
      "Family adventure ready!", "Space for everyone!", "Road trip champion!", "Versatile victor!",
      "Command the road!", "Room with a view!", "Cargo king!", "Seven-seat sensation!",
      "Adventure approved!", "Trail blazer!", "Comfort cruiser!", "Family fortress!",
      "Spacious sanctuary!", "Weekend warrior!", "Hauling hero!", "Roomy ride!",
      "Utility utopia!", "Space supreme!", "Cargo champion!", "Family friendly fantastic!",
      "All-terrain ace!", "Capability king!", "Rugged and ready!", "Space master!"
    ],
    4: ["Great SUV, minor issue", "Spacious with small note", "Family-friendly, tiny flaw", "Roomy but"]
  },
  economy: {
    5: [
      "Budget brilliance!", "Wallet-friendly winner!", "Fuel sipper supreme!", "Value champion!",
      "Economic excellence!", "Mileage master!", "Frugal and fun!", "Budget beauty!",
      "Gas saver glory!", "Affordable ace!", "Thrifty triumph!", "Value victory!",
      "Cost-effective cruise!", "Penny pincher's dream!", "Economical excellence!", "Budget boss!",
      "Savings superstar!", "Efficient and easy!", "Money saver!", "Budget breakthrough!",
      "Fuel-friendly fantastic!", "Value virtuoso!", "Economic elegance!", "Affordable awesome!"
    ],
    4: ["Good value, small issue", "Budget-friendly with note", "Economical, minor flaw", "Value with quirk"]
  },
  minivan: {
    5: [
      "Family vacation perfect!", "Kid-hauler heaven!", "Soccer mom approved!", "Cargo capacity champion!",
      "Road trip ready!", "Group travel genius!", "Space station!", "Family fleet flagship!",
      "Passenger paradise!", "Sliding door sensation!", "Entertainment equipped!", "Family freedom!",
      "Vacation vehicle victor!", "Crew carrier!", "Space shuttle!", "Family fun machine!",
      "People mover perfection!", "Group getaway great!", "Squad goals!", "Family express!"
    ],
    4: ["Great for families, minor issue", "Spacious van, small note", "Family-sized with flaw"]
  },
  convertible: {
    5: [
      "Wind in hair heaven!", "Sun-soaked sensation!", "Top-down triumph!", "Open-air awesome!",
      "Sunshine and smiles!", "Convertible king!", "Fresh air fantastic!", "Sky's the limit!",
      "Freedom feeling!", "Breeze bliss!", "Open road romance!", "Sunset cruiser!",
      "Hair-raising fun!", "Blue sky beauty!", "Drop-top dream!", "Sun seeker's choice!",
      "Open-air odyssey!", "Vitamin D delight!", "Endless sky!", "Fresh air freedom!"
    ],
    4: ["Great convertible, top quirk", "Open-air with minor issue", "Top-down, small problem"]
  },
  electric: {
    5: [
      "Silent but powerful!", "Zero emissions hero!", "Future of driving!", "Eco-excellence!",
      "Green machine!", "Planet-friendly perfection!", "Whisper quiet wonder!", "Clean energy cruise!",
      "Tesla-rific!", "Volt-age victory!", "Charged up champion!", "Sustainable superstar!",
      "Emission-free excellence!", "Electric elegance!", "Battery boss!", "Green glory!",
      "Eco warrior!", "Silent speed!", "Clean cruise!", "Future forward!"
    ],
    4: ["Great EV, charging hiccup", "Electric with range anxiety", "Green with minor issue"]
  },
  truck: {
    5: [
      "Hauling hero!", "Towing titan!", "Work horse winner!", "Truck yeah!",
      "Payload paradise!", "Bed of roses!", "Heavy duty heaven!", "Capability king!",
      "Load master!", "Trail boss!", "Work truck wonder!", "Power and payload!",
      "Rugged ruler!", "Tow pro!", "Haul of fame!", "Truck stop triumph!",
      "Payload perfection!", "Built tough!", "Heavy hauler!", "Load legend!"
    ],
    4: ["Great truck, minor quirk", "Capable with small issue", "Hauler with hiccup"]
  }
}

// Short review texts (1-2 sentences max)
const shortReviewTexts = {
  5: [
    "Perfect. No notes.", "Flawless experience.", "Will book again!",
    "Exactly what I needed.", "10/10 would recommend.", "Amazing!",
    "Loved it!", "Best rental ever.", "Super easy process.",
    "Great car, great host.", "Smooth transaction.", "Five stars!",
    "Exceeded expectations.", "Absolutely perfect.", "No complaints.",
    "Fantastic experience.", "Highly recommend!", "Will be back.",
    "Outstanding service.", "Can't fault it.", "Brilliant!",
    "Top notch.", "Superb.", "Excellent throughout."
  ],
  4: [
    "Good but not perfect.", "Minor issues only.", "Would book again.",
    "Pretty good overall.", "Small hiccup.", "Still recommended.",
    "Mostly great.", "One small thing.", "Good experience.",
    "Nearly perfect.", "Minor delay.", "Still worth it."
  ],
  3: [
    "It was okay.", "Nothing special.", "Did the job.",
    "Average.", "Meh.", "Could be better.",
    "Just fine.", "Acceptable.", "Middle of the road."
  ]
}

// Jargon-heavy enthusiast reviews
const enthusiastReviews = {
  sports: [
    "The DCT shifts were telepathic. Perfect heel-toe downshifts and the LSD really planted the rear through corners. Sport+ mode completely changed the throttle mapping.",
    "Loved the naturally aspirated response. No turbo lag, just linear power delivery. The Brembos had zero fade even after spirited canyon runs.",
    "The chassis tuning is sublime. Perfect 50/50 weight distribution and you can really feel it. The steering ratio is aggressive but not twitchy.",
    "Variable valve timing really shows above 6k RPM. The VTEC crossover is addictive. Short throw shifter was precise with perfect gate spacing.",
    "The electronically controlled dampers made a huge difference between comfort and track modes. Roll bars kept everything flat through the twisties.",
    "Michelin Pilot Sport 4S tires provided insane grip. Could really push it through the apex. The mechanical LSD is so much better than electronic.",
    "Twin-scroll turbo spools so quickly. Minimal lag and the overboost function in sport mode adds serious midrange punch.",
    "The exhaust has active valves that really open up in sport mode. Dual clutch was lightning quick on upshifts with perfect rev matching on downshifts."
  ],
  luxury: [
    "The air suspension with magic body control was phenomenal. Road imperfections just disappeared. The NVH levels rival my S-Class.",
    "Nappa leather with contrast stitching throughout. The Burmester sound system's 3D surround was audiophile quality. Soft close everything.",
    "The HUD with augmented reality navigation was next level. Night vision with pedestrian detection saved me twice. ACC with stop-and-go was flawless.",
    "Quattro AWD with torque vectoring was confidence inspiring. The Matrix LED headlights turned night into day. Ambient lighting had 64 colors!",
    "The executive rear seats with massage, heating, cooling, and individual climate zones made my clients very happy. WiFi hotspot worked great.",
    "Four-zone climate with air ionization and fragrance system. The panoramic roof with variable tint was amazing. Gesture control actually worked.",
    "The active noise cancellation made it tomb quiet inside. Could have a conference call at 85mph. The heads up display showed everything I needed."
  ],
  electric: [
    "Regen braking set to max for one-pedal driving. The instant torque is addictive. 0-60 in under 3 seconds never gets old.",
    "The battery thermal management kept charging speeds high even on the third Supercharger stop. V3 charging peaked at 250kW!",
    "Autopilot with FSD beta was mind blowing. Navigate on autopilot handled the interchange perfectly. Summon actually worked in the parking garage.",
    "The heat pump efficiency was impressive in cold weather. Only lost about 20% range at 30°F. Preconditioning while plugged in is a game changer.",
    "CCS fast charging compatibility meant more options than just Superchargers. The built-in trip planner with charger preconditioning was brilliant.",
    "The frunk and trunk space was massive without an engine. The camp mode with climate control running off the battery was perfect for waiting.",
    "Over-the-air updates added features during my rental! The acceleration boost was definitely noticeable. Track mode v2 was insane."
  ]
}

// Car type specific review content
const carTypeReviewTexts = {
  luxury: [
    "The leather seats were like sitting on clouds. Every detail screamed premium quality.",
    "Massage seats made the long drive feel like a spa day. The sound system was concert quality.",
    "The ride was whisper quiet even at highway speeds. You could hear a pin drop inside.",
    "Wood grain trim and ambient lighting created such an elegant atmosphere. Pure class.",
    "The heads-up display and driver assists made driving effortless. Technology at its finest.",
    "Cooled seats were a blessing in Arizona heat. The panoramic roof made it feel even more spacious.",
    "The power everything and soft-close doors reminded me this was special. Worth the splurge.",
    "Adaptive cruise control and lane keeping made the highway portion a breeze. So smooth.",
    "The quilted leather and piano black trim were gorgeous. Every surface felt expensive.",
    "Rear seat entertainment kept the kids quiet. The executive seating package was worth it.",
    "The Bang & Olufsen sound system was crystal clear. Could hear every instrument perfectly.",
    "Air suspension soaked up every bump. Felt like floating on a cloud.",
    "The fragrance system and ionizer made the cabin smell amazing. Little touches matter.",
    "Night vision display saved me from a coyote on the highway. Technology that matters.",
    "The power trunk and soft-close doors made loading luggage effortless. Pure luxury."
  ],
  sports: [
    "The acceleration threw me back in my seat! This thing is seriously quick.",
    "Took it through some canyon roads and the handling was incredible. Stuck like glue.",
    "The exhaust note gave me chills. You can feel the power in every gear.",
    "Launch control is addictive! 0-60 never gets old in this beast.",
    "The paddle shifters made me feel like a race car driver. So much fun!",
    "Cornering was flat and confident. The grip levels are insane.",
    "Sport mode completely transforms the car. Jekyll and Hyde personality.",
    "The turbo whistle and blow-off valve sounds are intoxicating. Pure theater.",
    "Redline pulls all day. This thing begs to be driven hard.",
    "The downshifts with rev matching sounded incredible. Pure automotive symphony.",
    "Traction control off made things interesting. Sideways smiles all day!",
    "The launch never gets old. My passengers were screaming!",
    "Carbon ceramic brakes stopped on a dime. Zero fade after hard driving.",
    "The differential locked up perfectly exiting corners. Planted and powerful.",
    "Sport exhaust with valves open sounded like thunder. Set off car alarms!"
  ],
  suv: [
    "Plenty of room for the whole family and all our luggage. Third row was actually usable.",
    "The high seating position gave great visibility. Felt safe and secure on the highway.",
    "Cargo space swallowed everything we threw at it. Perfect for our Costco runs.",
    "All-wheel drive came in handy on some dirt roads. Very capable vehicle.",
    "The captain's chairs in the second row were a hit with the kids. No more fighting!",
    "Towing capacity was perfect for our small trailer. Didn't even feel it back there.",
    "Fold-flat seats made it easy to haul furniture. So versatile.",
    "The ride was smooth despite the size. Handled better than expected."
  ],
  economy: [
    "Got amazing gas mileage on my trip. Barely had to fill up once!",
    "Perfect for city driving and parking. Fits in tiny spots with ease.",
    "More features than I expected at this price point. Great value.",
    "Zippy enough for city driving and merging. Does everything you need.",
    "The AC worked great which is all I needed in Phoenix heat. Simple and effective.",
    "Bluetooth and backup camera at this price? Impressed with the value.",
    "Fuel economy was incredible. Saved so much on gas for my road trip.",
    "Small but mighty. Had everything I needed without the premium price."
  ],
  minivan: [
    "The kids loved the built-in entertainment system. Kept them quiet for hours.",
    "Sliding doors were a game changer with car seats. So much easier than regular doors.",
    "Stow-and-go seats are genius. Went from people hauler to cargo van in seconds.",
    "The amount of cupholders is ridiculous but somehow we used them all!",
    "Power sliding doors and liftgate made loading kids and gear effortless.",
    "Rear climate control kept everyone comfortable. No more arguments about temperature.",
    "The built-in vacuum was clutch after the beach trip. Such a smart feature.",
    "Seven adults fit comfortably with room for luggage. Impressive space utilization."
  ],
  convertible: [
    "Top-down cruise through Scottsdale at sunset was magical. Perfect weather for it.",
    "The power top worked flawlessly. Up or down in seconds at a stoplight.",
    "Wind management was better than expected. Could actually have a conversation top-down.",
    "Hard to beat the open-air feeling cruising through the desert. Pure freedom.",
    "The heated seats made evening drives with the top down comfortable. Best of both worlds.",
    "Trunk space was surprisingly decent even with the top down. Fit our weekend bags.",
    "Top-up it's a regular car, top-down it's an experience. Two cars in one.",
    "The looks and waves we got driving around were worth it alone. Attention grabber!"
  ],
  electric: [
    "The instant torque is addictive. Silent but violent acceleration.",
    "One-pedal driving took some getting used to but now I love it. So smooth.",
    "The regenerative braking basically meant I never used the brake pedal. Efficient.",
    "Charging at the hotel overnight was convenient. Woke up to a full battery.",
    "The tech features were next level. Over-the-air updates and everything.",
    "Silent cabin made conversation easy. Could hear my music perfectly.",
    "Pre-conditioning the cabin from the app was amazing in summer heat. Already cool when I got in.",
    "Autopilot features made highway driving relaxing. The future is here."
  ],
  truck: [
    "The bed was perfect for my Home Depot run. Swallowed everything with room to spare.",
    "Towed my buddy's car with ease. Plenty of power and stability.",
    "The crew cab had more room than most SUVs. Comfortable for five adults.",
    "4WD came in handy at the job site. Got through mud without breaking a sweat.",
    "The integrated bed steps and rails made loading/unloading easy. Well thought out.",
    "Backup camera and sensors made parking this beast surprisingly easy.",
    "The torque for merging and passing was impressive. Never felt underpowered.",
    "Work truck on weekdays, family hauler on weekends. Does it all."
  ]
}

// Extended city list with more variety
const arizonaCities = [
  'Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Gilbert', 'Glendale', 
  'Peoria', 'Surprise', 'Avondale', 'Tucson', 'Goodyear', 'Buckeye', 'Casa Grande',
  'Maricopa', 'Queen Creek', 'Prescott', 'Flagstaff', 'Sedona', 'Yuma', 'Lake Havasu City'
]

const outOfStateCities = [
  { city: 'Los Angeles', state: 'CA' }, { city: 'San Diego', state: 'CA' },
  { city: 'San Francisco', state: 'CA' }, { city: 'Sacramento', state: 'CA' },
  { city: 'San Jose', state: 'CA' }, { city: 'Fresno', state: 'CA' },
  { city: 'Oakland', state: 'CA' }, { city: 'Long Beach', state: 'CA' },
  { city: 'Las Vegas', state: 'NV' }, { city: 'Henderson', state: 'NV' },
  { city: 'Reno', state: 'NV' }, { city: 'Denver', state: 'CO' },
  { city: 'Colorado Springs', state: 'CO' }, { city: 'Boulder', state: 'CO' },
  { city: 'Albuquerque', state: 'NM' }, { city: 'Santa Fe', state: 'NM' },
  { city: 'Salt Lake City', state: 'UT' }, { city: 'Provo', state: 'UT' },
  { city: 'Austin', state: 'TX' }, { city: 'Dallas', state: 'TX' },
  { city: 'Houston', state: 'TX' }, { city: 'San Antonio', state: 'TX' },
  { city: 'El Paso', state: 'TX' }, { city: 'Fort Worth', state: 'TX' },
  { city: 'Portland', state: 'OR' }, { city: 'Eugene', state: 'OR' },
  { city: 'Seattle', state: 'WA' }, { city: 'Spokane', state: 'WA' },
  { city: 'Chicago', state: 'IL' }, { city: 'New York', state: 'NY' },
  { city: 'Miami', state: 'FL' }, { city: 'Atlanta', state: 'GA' },
  { city: 'Boston', state: 'MA' }, { city: 'Philadelphia', state: 'PA' }
]

// Generic review titles (fallback for unmatched car types)
const genericReviewTitles = {
  5: [
    "Absolutely incredible!", "Beyond expectations!", "Phenomenal experience!", "Outstanding rental!",
    "Exceeded all expectations!", "Couldn't be happier!", "Blown away!", "Simply the best!",
    "Perfection!", "10/10 experience!", "Wow, just wow!", "Unbelievable service!",
    "Excellent service throughout", "Highly professional experience", "Seamless transaction",
    "First-class service", "Premium experience", "Exceptional quality", "Superior service",
    "Flawless execution", "Impeccable condition", "Professional excellence",
    "Super smooth!", "Totally worth it!", "Awesome sauce!", "So easy!", "Loved every minute!",
    "Can't beat this!", "Nailed it!", "Crushed it!", "Killed it!", "Sweet ride!"
  ],
  4: [
    "Great with small hiccup", "Almost perfect", "Very good overall", "Solid experience",
    "Good rental, tiny issue", "Nearly flawless", "Small delay, great car", "Worth it despite wait",
    "Great car, minor note", "Mostly smooth", "One small thing", "99% perfect"
  ],
  3: [
    "Mixed bag", "Some good, some bad", "Middle of the road", "Take it or leave it",
    "Room for improvement", "Adequate", "It was okay", "Got me there", "Functional",
    "Nothing special", "Average experience", "Meh overall", "Could be better"
  ],
  2: [
    "Not what I expected", "Disappointed", "Below average", "Needs work",
    "Won't repeat", "Learned my lesson", "Not worth it", "Regrettable"
  ],
  1: [
    "Avoid", "Terrible", "Disaster", "Never again", "Worst experience",
    "Complete mess", "Total fail", "Absolutely not", "Hard pass"
  ]
}

// Generic review texts (used when no car type specific content matches)
const genericReviewTexts = {
  5: [
    "Car was spotless and drove amazing. Super easy pickup with the host.",
    "Loved it! The ride was smooth, and the host was chill. Would book again in a heartbeat.",
    "Host was super quick to reply and made the whole process easy. The car was comfy and fun to drive.",
    "Car was exactly as listed. Clean, fast, and the host was great with communication.",
    "Fantastic car! Drove smooth, looked sharp, and host made drop-off a breeze.",
    "Everything went smoothly from start to finish. Car was clean and fun to drive.",
    "Simple process, great communication, and the car was fantastic. Highly recommend.",
    "Perfect rental experience! Car was clean, powerful, and comfortable for my trip."
  ],
  4: [
    "Pickup took a bit longer than expected, but host was apologetic. Car itself was excellent.",
    "Car was okay, but AC took a while to cool down in the Arizona heat. Host was kind though.",
    "Not bad. Car drove fine but had less gas than I expected at pickup. Otherwise smooth rental.",
    "Pretty good overall. Car ran great, but pickup was delayed a little. Host was apologetic."
  ],
  3: [
    "The car itself was fine but pickup was delayed by an hour. Host apologized but it did affect my plans.",
    "Car was older than expected and had some wear. Still drove okay and served its purpose.",
    "Got me where I needed to go. Car was functional but not as clean as I'd hoped."
  ],
  2: [
    "Car had more issues than disclosed. Check engine light came on during my trip.",
    "Photos were misleading - car was in much worse condition. Still driveable but not worth the price."
  ],
  1: [
    "Car broke down on the highway. Host was unresponsive. Had to get an Uber to my destination.",
    "Complete disaster. Car was not as advertised, filthy inside, and had major mechanical problems."
  ]
}

// Expanded name pools with diverse backgrounds
const firstNames = [
  // Traditional English names
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
  
  // Hispanic/Latino names
  'Carlos', 'Maria', 'Luis', 'Ana', 'Miguel', 'Diego', 'Carmen', 'Jorge', 'Isabel', 'Rosa',
  'Pedro', 'Elena', 'Juan', 'Patricia', 'Ricardo', 'Linda', 'Fernando', 'Barbara', 'Adrian', 'Monica',
  'Alejandro', 'Gabriela', 'Roberto', 'Daniela', 'Eduardo', 'Natalia', 'Javier', 'Valeria', 'Marco', 'Andrea',
  'Oscar', 'Fernanda', 'Sergio', 'Camila', 'Andres', 'Lucia', 'Rafael', 'Sofia', 'Alberto', 'Regina',
  
  // Additional diverse names
  'Derek', 'Heather', 'Shane', 'Rebecca', 'Brett', 'Tiffany', 'Chad', 'Crystal', 'Troy', 'Dawn',
  'Blake', 'Amber', 'Cody', 'April', 'Dustin', 'Jasmine', 'Trevor', 'Kayla', 'Wesley', 'Destiny',
  'Marcus', 'Vanessa', 'Andre', 'Alicia', 'Jerome', 'Jasmin', 'Terrell', 'Latoya', 'Damon', 'Ebony',
  'Keith', 'Monique', 'Darren', 'Tanya', 'Reginald', 'Shanice', 'Maurice', 'Keisha', 'Cedric', 'Tamara',
  
  // Asian names
  'Kevin', 'Grace', 'Jason', 'Amy', 'Eric', 'Jennifer', 'Brian', 'Michelle', 'Andrew', 'Lisa',
  'Jay', 'Cindy', 'Ken', 'Jenny', 'Tony', 'Helen', 'Steve', 'Nancy', 'Mike', 'Karen',
  
  // Modern trendy names
  'Mason', 'Emma', 'Oliver', 'Ava', 'Elijah', 'Charlotte', 'William', 'Sophia', 'James', 'Amelia',
  'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper', 'Sebastian', 'Luna',
  'Mateo', 'Camila', 'Jackson', 'Gianna', 'Levi', 'Elizabeth', 'Daniel', 'Eleanor', 'Michael', 'Ella'
]

const lastNames = [
  'Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 
  'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Lee', 'White', 'Harris', 'Clark', 'Lewis',
  'Robinson', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Green',
  'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell',
  'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook',
  'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward',
  'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price',
  'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long',
  'Patterson', 'Hughes', 'Flores', 'Washington', 'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander'
]

// Track recently used items to avoid repetition
let recentlyUsedTitles: string[] = []
let recentlyUsedTexts: string[] = []
let recentlyUsedNames: string[] = []

// Interface for booking periods
interface BookingPeriod {
  startDate: Date
  endDate: Date
  reviewId: string
}

// Helper function to check if two date ranges overlap
function datesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 <= end2 && start2 <= end1
}

// Helper function to find next available slot
function findNextAvailableSlot(
  requestedStart: Date, 
  duration: number, 
  existingBookings: BookingPeriod[],
  maxDate: Date
): { start: Date; end: Date } | null {
  let currentStart = new Date(requestedStart)
  let currentEnd = new Date(currentStart)
  currentEnd.setDate(currentEnd.getDate() + duration)
  
  // Try up to 30 different slots
  for (let attempt = 0; attempt < 30; attempt++) {
    // Check if current slot overlaps with any existing booking
    const hasOverlap = existingBookings.some(booking => 
      datesOverlap(currentStart, currentEnd, booking.startDate, booking.endDate)
    )
    
    if (!hasOverlap && currentEnd <= maxDate) {
      return { start: currentStart, end: currentEnd }
    }
    
    // Move to next potential slot (1-3 days after current end)
    const daysToSkip = Math.floor(Math.random() * 3) + 1
    currentStart = new Date(currentEnd)
    currentStart.setDate(currentStart.getDate() + daysToSkip)
    currentEnd = new Date(currentStart)
    currentEnd.setDate(currentEnd.getDate() + duration)
    
    // If we've gone past the max date, try going backwards
    if (currentEnd > maxDate && attempt === 15) {
      currentStart = new Date(requestedStart)
      currentStart.setDate(currentStart.getDate() - duration - 5)
      currentEnd = new Date(currentStart)
      currentEnd.setDate(currentEnd.getDate() + duration)
    }
  }
  
  return null
}

// Get car type category for proper review selection
function getCarTypeCategory(carType: string): string {
  const typeMap: { [key: string]: string } = {
    'luxury': 'luxury',
    'premium': 'luxury',
    'executive': 'luxury',
    'sports': 'sports',
    'sport': 'sports',
    'performance': 'sports',
    'convertible': 'convertible',
    'cabriolet': 'convertible',
    'roadster': 'convertible',
    'suv': 'suv',
    'crossover': 'suv',
    'economy': 'economy',
    'compact': 'economy',
    'budget': 'economy',
    'minivan': 'minivan',
    'van': 'minivan',
    'electric': 'electric',
    'ev': 'electric',
    'hybrid': 'electric',
    'truck': 'truck',
    'pickup': 'truck'
  }
  
  const lowerType = carType.toLowerCase()
  for (const [key, value] of Object.entries(typeMap)) {
    if (lowerType.includes(key)) {
      return value
    }
  }
  return 'generic'
}

// Select car-type aware review content with enhanced variety
function selectCarAwareReviewContent(rating: number, carType: string, hostName?: string): { title: string; text: string } {
  const category = getCarTypeCategory(carType)
  
  // Determine review style (30% short, 10% enthusiast/jargon, 60% regular)
  const styleRoll = Math.random()
  let isShort = styleRoll < 0.30
  let isEnthusiast = styleRoll >= 0.30 && styleRoll < 0.40 && rating >= 4
  
  // For enthusiast reviews, only use for appropriate car types
  if (isEnthusiast && !['sports', 'luxury', 'electric'].includes(category)) {
    isEnthusiast = false
  }
  
  // Get appropriate title pool
  let titlePool: string[] = []
  if (category !== 'generic' && carTypeReviewTitles[category as keyof typeof carTypeReviewTitles]) {
    const categoryTitles = carTypeReviewTitles[category as keyof typeof carTypeReviewTitles]
    titlePool = categoryTitles[rating as keyof typeof categoryTitles] || categoryTitles[5] || []
  }
  
  // Fallback to generic if no specific titles
  if (titlePool.length === 0) {
    titlePool = genericReviewTitles[rating as keyof typeof genericReviewTitles] || genericReviewTitles[5]
  }
  
  // Get appropriate text pool
  let textPool: string[] = []
  
  if (isShort && shortReviewTexts[rating as keyof typeof shortReviewTexts]) {
    textPool = shortReviewTexts[rating as keyof typeof shortReviewTexts]
  } else if (isEnthusiast && enthusiastReviews[category as keyof typeof enthusiastReviews]) {
    textPool = enthusiastReviews[category as keyof typeof enthusiastReviews]
  } else if (category !== 'generic' && carTypeReviewTexts[category as keyof typeof carTypeReviewTexts]) {
    textPool = carTypeReviewTexts[category as keyof typeof carTypeReviewTexts]
  }
  
  // For lower ratings or if no specific texts, use generic
  if (textPool.length === 0 || (rating < 4 && !isShort)) {
    textPool = genericReviewTexts[rating as keyof typeof genericReviewTexts] || genericReviewTexts[5]
  }
  
  // Select title avoiding recent ones
  let availableTitles = titlePool.filter(t => !recentlyUsedTitles.includes(t))
  if (availableTitles.length === 0) {
    recentlyUsedTitles = []
    availableTitles = titlePool
  }
  const title = availableTitles[Math.floor(Math.random() * availableTitles.length)]
  recentlyUsedTitles.push(title)
  if (recentlyUsedTitles.length > 20) {
    recentlyUsedTitles.shift()
  }
  
  // Select text avoiding recent ones
  let availableTexts = textPool.filter(t => !recentlyUsedTexts.includes(t))
  if (availableTexts.length === 0) {
    recentlyUsedTexts = []
    availableTexts = textPool
  }
  let text = availableTexts[Math.floor(Math.random() * availableTexts.length)]
  
  // Occasionally mention the host by name (25% chance for 5-star reviews, not for short reviews)
  if (hostName && rating === 5 && Math.random() < 0.25 && !isShort) {
    const hostMentions = [
      ` ${hostName} was super responsive throughout.`,
      ` ${hostName} made the whole process seamless.`,
      ` Big thanks to ${hostName} for the smooth experience!`,
      ` ${hostName} was fantastic to work with.`,
      ` Shout out to ${hostName} for being an amazing host!`,
      ` ${hostName} went above and beyond.`,
      ` Can't say enough good things about ${hostName}.`,
      ` ${hostName} is a superhost for sure!`,
      ` ${hostName} really knows customer service.`,
      ` ${hostName} made pickup and drop-off so easy.`,
      ` ${hostName} was accommodating with my schedule change.`,
      ` Appreciate ${hostName}'s attention to detail.`,
      ` ${hostName} provided great local recommendations too!`,
      ` ${hostName} had the car ready and running when I arrived.`,
      ` Thank you ${hostName} for the smooth rental!`
    ]
    text += hostMentions[Math.floor(Math.random() * hostMentions.length)]
  }
  
  // Add location-specific mentions occasionally (15% chance for 4-5 star reviews)
  if (rating >= 4 && Math.random() < 0.15 && !isShort) {
    const locationMentions = [
      " Perfect for cruising Scottsdale.",
      " Great for my Phoenix business trip.",
      " Handled the I-17 beautifully.",
      " Made the drive to Sedona memorable.",
      " Ideal for the Arizona heat.",
      " Loved taking it through the McDowell Mountains.",
      " Perfect for the Tempe to Tucson run.",
      " Great for navigating downtown Phoenix.",
      " Made my Flagstaff trip comfortable.",
      " Handled the desert roads like a champ."
    ]
    text += locationMentions[Math.floor(Math.random() * locationMentions.length)]
  }
  
  recentlyUsedTexts.push(text)
  if (recentlyUsedTexts.length > 25) {
    recentlyUsedTexts.shift()
  }
  
  return { title, text }
}

function calculateTripLength(): number {
  const durations = [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 7] // More variety
  return durations[Math.floor(Math.random() * durations.length)]
}

function calculateEngagementScore(daysOld: number, rating: number): number {
  const random = Math.random()
  
  // Higher engagement for better ratings and newer reviews
  const ratingBonus = rating >= 4 ? 20 : 0
  const ageMultiplier = Math.max(0.5, 1 - (daysOld / 365))
  
  let baseScore: number
  if (random < 0.10) baseScore = Math.floor(Math.random() * 31) + 80   // 80-110 (10%)
  else if (random < 0.25) baseScore = Math.floor(Math.random() * 41) + 111  // 111-151 (15%)
  else if (random < 0.50) baseScore = Math.floor(Math.random() * 41) + 152  // 152-192 (25%)
  else if (random < 0.75) baseScore = Math.floor(Math.random() * 36) + 193  // 193-228 (25%)
  else if (random < 0.90) baseScore = Math.floor(Math.random() * 31) + 229  // 229-259 (15%)
  else baseScore = Math.floor(Math.random() * 41) + 260  // 260-300 (10%)
  
  return Math.floor(baseScore * ageMultiplier) + ratingBonus
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
  if (recentlyUsedNames.length > 20) {
    recentlyUsedNames.shift()
  }
  
  return name
}

function selectReviewerLocation(): { city: string, state: string } {
  // 65% local Arizona, 35% out of state for realistic distribution
  if (Math.random() < 0.65) {
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

function scheduleNonOverlappingReviews(
  startDate: Date, 
  endDate: Date, 
  count: number, 
  tripDurations: number[]
): { tripStart: Date; tripEnd: Date }[] {
  const bookings: BookingPeriod[] = []
  const results: { tripStart: Date; tripEnd: Date }[] = []
  const maxAttempts = count * 3
  let attempts = 0
  
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  for (let i = 0; i < count && attempts < maxAttempts; i++) {
    attempts++
    
    const duration = tripDurations[i]
    
    // Generate a random starting point
    const randomStartDay = Math.floor(Math.random() * Math.max(1, totalDays - duration))
    const potentialStart = new Date(startDate)
    potentialStart.setDate(potentialStart.getDate() + randomStartDay)
    
    // Try to find a non-overlapping slot
    const slot = findNextAvailableSlot(potentialStart, duration, bookings, endDate)
    
    if (slot) {
      bookings.push({
        startDate: slot.start,
        endDate: slot.end,
        reviewId: `review-${i}`
      })
      results.push({
        tripStart: slot.start,
        tripEnd: slot.end
      })
    } else {
      console.log(`Could only fit ${results.length} non-overlapping bookings in the date range`)
      break
    }
  }
  
  // Sort by start date
  results.sort((a, b) => a.tripStart.getTime() - b.tripStart.getTime())
  
  return results
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

    // Verify car exists and get car type
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

    const carType = car.carType || 'generic'
    const hostName = car.host?.name?.split(' ')[0] || undefined // Get first name of host

    // Get available reviewer profiles
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

    console.log(`Found ${availableProfiles.length} available profiles for ${carType} car, need ${count} reviews`)

    // Determine rating distribution based on mix
    let ratings: number[] = []
    
    if (mix === 'realistic') {
      // Luxury/sports cars might have slightly higher ratings
      const isHighEnd = ['luxury', 'sports', 'convertible'].includes(getCarTypeCategory(carType))
      const fiveStars = Math.round(count * (isHighEnd ? 0.70 : 0.65))
      const fourStars = Math.round(count * (isHighEnd ? 0.22 : 0.25))
      const threeStars = Math.round(count * 0.06)
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

    // Generate trip durations for all reviews
    const tripDurations = Array(count).fill(0).map(() => calculateTripLength())

    // Calculate non-overlapping trip dates
    const tripDates = scheduleNonOverlappingReviews(
      new Date(startDate),
      new Date(endDate),
      count,
      tripDurations
    )

    // Adjust count if we couldn't fit all bookings
    const actualCount = tripDates.length
    if (actualCount < count) {
      console.log(`Adjusted review count from ${count} to ${actualCount} due to date constraints`)
      ratings = ratings.slice(0, actualCount)
    }

    // Determine profile usage
    let profilesForReviews: (typeof availableProfiles[0] | null)[] = []
    
    if (reviewerSelection === 'existing') {
      if (availableProfiles.length < actualCount) {
        return NextResponse.json(
          { success: false, error: `Need ${actualCount} reviews but only ${availableProfiles.length} unused profiles available` },
          { status: 400 }
        )
      }
      const shuffled = [...availableProfiles].sort(() => Math.random() - 0.5)
      profilesForReviews = shuffled.slice(0, actualCount)
    } else if (reviewerSelection === 'new') {
      profilesForReviews = Array(actualCount).fill(null)
    } else {
      const shuffled = [...availableProfiles].sort(() => Math.random() - 0.5)
      const existingToUse = Math.min(Math.floor(actualCount * 0.5), availableProfiles.length)
      
      for (let i = 0; i < actualCount; i++) {
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
    
    for (let i = 0; i < actualCount; i++) {
      const rating = ratings[i]
      const content = selectCarAwareReviewContent(rating, carType, hostName)
      const { tripStart, tripEnd } = tripDates[i]
      const profile = profilesForReviews[i]
      
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
      
      // Higher verification rate for luxury/sports cars
      const isHighEndCar = ['luxury', 'sports', 'convertible'].includes(getCarTypeCategory(carType))
      const isVerified = rating >= 4 ? 
        Math.random() < (isHighEndCar ? 0.4 : 0.3) : 
        Math.random() < 0.1
      
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
        selected: true,
        carType: carType,
        hostName: car.host?.name || 'Host'
      })
    }

    console.log(`Processed ${reviewBatch.length} ${carType} reviews with non-overlapping dates`)

    return NextResponse.json({
      success: true,
      reviews: reviewBatch,
      carInfo: {
        type: carType,
        category: getCarTypeCategory(carType),
        hostName: car.host?.name
      },
      stats: {
        total: reviewBatch.length,
        requestedCount: count,
        actualCount: actualCount,
        existingProfiles: reviewBatch.filter(r => r.useExistingProfile).length,
        newProfiles: reviewBatch.filter(r => !r.useExistingProfile).length,
        distribution: {
          5: ratings.filter(r => r === 5).length,
          4: ratings.filter(r => r === 4).length,
          3: ratings.filter(r => r === 3).length,
          2: ratings.filter(r => r === 2).length,
          1: ratings.filter(r => r === 1).length
        },
        dateRangeCoverage: {
          earliestTrip: reviewBatch[0]?.tripStartDate,
          latestTrip: reviewBatch[reviewBatch.length - 1]?.tripEndDate,
          averageGapDays: actualCount > 1 ? 
            Math.floor(
              (new Date(reviewBatch[reviewBatch.length - 1].tripStartDate).getTime() - 
               new Date(reviewBatch[0].tripStartDate).getTime()) / 
              (1000 * 60 * 60 * 24) / (actualCount - 1)
            ) : 0
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
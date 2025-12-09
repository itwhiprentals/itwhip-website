export interface CitySeoData {
  slug: string
  name: string
  type: 'city' | 'airport' | 'neighborhood' | 'tourism'
  metaTitle: string
  metaDescription: string
  h1: string
  heroSubtitle: string
  description: string
  airport: string | null
  landmarks: string[]
  neighborhoods?: string[]
  popularRoutes: string[]
  whyRent: string[]
  faqs: { question: string; answer: string }[]
  coordinates: { lat: number; lng: number }
  nearbyLocations: string[]
  searchTerms: string[]
}

export const CITY_SEO_DATA: Record<string, CitySeoData> = {
  'phoenix': {
    slug: 'phoenix',
    name: 'Phoenix',
    type: 'city',
    metaTitle: 'Car Rentals in Phoenix, AZ from $35/day | ItWhip',
    metaDescription: 'Rent cars from local Phoenix owners starting at $35/day. Free Sky Harbor airport delivery, hotel drop-offs, and no lines. Verified hosts, $1M insurance included.',
    h1: 'Rent Cars from Local Phoenix Owners',
    heroSubtitle: 'Skip Sky Harbor lines — free airport & hotel delivery across the Valley',
    description: 'Phoenix is massive — over 500 square miles — and public transit is limited. You need a car to get from Sky Harbor to downtown, north to the resorts, or out to the hiking trails. With ItWhip, your rental arrives pre-cooled (critical in 115° summers) and ready to go. No shuttle buses, no counter lines, no surprise fees.\n\nWhether you\'re here for business in downtown, spring training in the suburbs, or exploring the desert, locals on ItWhip have the perfect car waiting — economy for commuting, SUVs for mountain drives, or luxury for a night out in Scottsdale.\n\nDriving tip: Phoenix traffic peaks 7-9 AM and 4-6 PM on the I-10 and Loop 101. Leave extra time if heading to the airport — rush hour can add 30-45 minutes.',
    airport: 'PHX',
    landmarks: ['Camelback Mountain', 'Desert Botanical Garden', 'Heard Museum', 'Papago Park', 'South Mountain Park', 'Downtown Phoenix', 'Chase Field'],
    popularRoutes: ['PHX to Scottsdale (20 min)', 'PHX to Sedona (2 hrs)', 'PHX to Grand Canyon South Rim (3.5 hrs)', 'Downtown to Camelback hiking trails (15 min)'],
    whyRent: ['Public transit is limited — a car is essential', 'Free airport delivery beats rental counters', 'Perfect for exploring the Valley\'s spread-out attractions', 'Great for business travelers staying downtown or in the suburbs'],
    faqs: [
      { question: 'Do you deliver to Sky Harbor Airport?', answer: 'Yes — free curbside pickup and drop-off at PHX for most rentals.' },
      { question: 'What\'s the best car for Phoenix summer?', answer: 'All ItWhip cars are MaxAC™ certified — guaranteed cold AC even in 115° heat.' },
      { question: 'Is parking easy downtown?', answer: 'Street parking is metered; garages are plentiful near Roosevelt Row and Chase Field.' },
      { question: 'Can I drive to Sedona same-day?', answer: 'Absolutely — 2-hour scenic drive north. Many guests rent convertibles or SUVs for the red rocks.' },
      { question: 'Any rush hour to avoid?', answer: 'Avoid I-10 and Loop 101 from 7-9 AM and 4-6 PM — add 30-45 min to airport trips.' }
    ],
    coordinates: { lat: 33.4484, lng: -112.0740 },
    nearbyLocations: ['Scottsdale', 'Tempe', 'Mesa', 'Glendale', 'Chandler'],
    searchTerms: ['car rental phoenix', 'sky harbor car rental', 'phoenix airport car rental alternative', 'rent car phoenix az', 'cheap car rental phoenix']
  },
  'scottsdale': {
    slug: 'scottsdale',
    name: 'Scottsdale',
    type: 'city',
    metaTitle: 'Luxury Car Rentals in Scottsdale, AZ from $99/day | ItWhip',
    metaDescription: 'Rent luxury, exotic, and convertible cars from local Scottsdale owners. Free resort delivery to Four Seasons, Fairmont, or your Airbnb.',
    h1: 'Luxury & Exotic Car Rentals in Scottsdale',
    heroSubtitle: 'Delivered to your resort — no lines, no hassle',
    description: 'Scottsdale is all about lifestyle — golf courses, luxury resorts, Old Town nightlife, and stunning desert drives. Public transit is basically nonexistent, and Uber from the airport can cost $60+ each way. With ItWhip, get a convertible, supercar, or premium SUV delivered straight to your hotel or Airbnb.\n\nPerfect for a weekend in Old Town, a day at Troon North golf, or a sunset cruise up to Pinnacle Peak. Locals on ItWhip know the best cars for showing off on Scottsdale Road or handling the winding drives to Carefree.\n\nDriving tip: Scottsdale roads are wide and beautiful, but watch for cyclists and golf carts near resorts. Parking is free at most shopping centers like Kierland Commons.',
    airport: 'PHX',
    landmarks: ['Old Town Scottsdale', 'Scottsdale Fashion Square', 'Taliesin West', 'McDowell Sonoran Preserve', 'Troon North Golf Club', 'Barrett-Jackson Auction', 'Pinnacle Peak'],
    popularRoutes: ['PHX to Old Town (25 min)', 'Scottsdale to Sedona (2 hrs)', 'Scottsdale to Fountain Hills (20 min)', 'Resort row to Talking Stick (10 min)'],
    whyRent: ['No public transit — a car is a must', 'Free resort delivery beats taxi/Uber prices', 'Perfect for golf, shopping, and nightlife', 'Convertibles are made for Scottsdale weather'],
    faqs: [
      { question: 'Do you deliver to Scottsdale resorts?', answer: 'Yes — free delivery to Four Seasons, Fairmont Princess, Andaz, and most resorts.' },
      { question: 'Best car for Old Town nightlife?', answer: 'Convertibles and luxury sedans are most popular — arrive in style.' },
      { question: 'Can I drive to Sedona?', answer: 'Absolutely — 2-hour scenic route with stunning views. Many guests rent Jeeps or luxury SUVs.' },
      { question: 'Parking in Old Town?', answer: 'Free public garages and street parking after 5 PM — easy compared to Phoenix.' },
      { question: 'Golf course delivery?', answer: 'Yes — we deliver to Troon North, Grayhawk, TPC Scottsdale, and most courses.' }
    ],
    coordinates: { lat: 33.4942, lng: -111.9261 },
    nearbyLocations: ['Phoenix', 'Paradise Valley', 'Fountain Hills', 'Tempe', 'Carefree'],
    searchTerms: ['luxury car rental scottsdale', 'exotic car rental scottsdale', 'convertible rental scottsdale', 'scottsdale resort car rental', 'barrett jackson car rental']
  },
  'tempe': {
    slug: 'tempe',
    name: 'Tempe',
    type: 'city',
    metaTitle: 'Car Rentals in Tempe, AZ – ASU & Events from $39/day | ItWhip',
    metaDescription: 'Rent cars from local Tempe owners near ASU. Free delivery for Sun Devil games, Tempe Town Lake, or Mill Avenue nightlife.',
    h1: 'Car Rentals in Tempe – ASU, Events & Nightlife',
    heroSubtitle: 'Delivered anywhere in Tempe — campus, lake, or Mill Ave',
    description: 'Tempe revolves around Arizona State University, Tempe Town Lake, and Mill Avenue nightlife. Light rail exists, but a car is essential for getting to games at Sun Devil Stadium, hiking Papago Park, or exploring the East Valley. With ItWhip, skip rental counters and get a car delivered to your dorm, hotel, or Airbnb.\n\nPerfect for ASU students and parents, Sun Devil football weekends, Tempe Festival of the Arts, or just cruising Mill Ave. Locals have everything from economy cars for campus commuting to SUVs for lake trips.\n\nDriving tip: Game days turn Tempe into gridlock — arrive early or use rural roads. Parking near Mill Ave is limited; look for garages.',
    airport: 'PHX',
    landmarks: ['Arizona State University', 'Tempe Town Lake', 'Mill Avenue District', 'Papago Park', 'Sun Devil Stadium', 'Tempe Beach Park', 'ASU Gammage'],
    popularRoutes: ['PHX to Tempe (15 min)', 'Tempe to Scottsdale (15 min)', 'Tempe to Mesa (10 min)', 'Campus to Papago hiking (5 min)'],
    whyRent: ['Light rail doesn\'t cover everything', 'Free delivery for game days and events', 'Perfect for ASU students without cars', 'Easy access to East Valley attractions'],
    faqs: [
      { question: 'Delivery to ASU campus?', answer: 'Yes — we deliver to dorms, Greek row, and campus parking with permit coordination.' },
      { question: 'Best car for Sun Devil games?', answer: 'SUVs and trucks for tailgating — many hosts near stadium.' },
      { question: 'Parking on Mill Avenue?', answer: 'Limited street parking; use garages or park further out and walk.' },
      { question: 'Can I drive to Scottsdale nightlife?', answer: '15-minute drive — perfect for bar hopping without Uber surge pricing.' },
      { question: 'Lake trips?', answer: 'Many guests rent kayaks/SUPs — we have trucks and SUVs with roof racks.' }
    ],
    coordinates: { lat: 33.4255, lng: -111.9400 },
    nearbyLocations: ['Phoenix', 'Scottsdale', 'Mesa', 'Chandler', 'Gilbert'],
    searchTerms: ['car rental tempe', 'asu car rental', 'tempe town lake car rental', 'sun devil stadium parking', 'mill avenue car rental']
  },
  'mesa': {
    slug: 'mesa',
    name: 'Mesa',
    type: 'city',
    metaTitle: 'Car Rentals in Mesa, AZ from $35/day – Mesa Gateway Airport | ItWhip',
    metaDescription: 'Rent cars from local Mesa owners near Mesa Gateway Airport (AZA). Cheaper and easier than airport counters.',
    h1: 'Car Rentals in Mesa – Mesa Gateway & East Valley',
    heroSubtitle: 'Closest alternative to Mesa Gateway Airport — free delivery',
    description: 'Mesa is the affordable, family-friendly side of the Valley — home to Mesa Gateway Airport, spring training baseball, and wide-open spaces. Public transit is sparse, and AZA has limited rental options. With ItWhip, get a car delivered right to the terminal or your East Valley home.\n\nPerfect for budget flyers using Allegiant/Spirit at AZA, Cubs spring training at Sloan Park, or exploring Usery Mountain recreation. Locals offer everything from economy sedans for airport runs to SUVs for desert adventures.\n\nDriving tip: Mesa Gateway is quieter than Sky Harbor, but construction on the 202 Loop is common — check AZ511 for delays.',
    airport: 'AZA',
    landmarks: ['Mesa Gateway Airport', 'Sloan Park (Cubs Spring Training)', 'Usery Mountain Regional Park', 'Superstition Mountains', 'Mesa Arts Center', 'Riverview Park', 'Golfland Sunsplash'],
    popularRoutes: ['AZA to Phoenix (40 min)', 'Mesa to Scottsdale (25 min)', 'Mesa to Superstition Mountains (30 min)', 'Mesa to Gilbert San Tan Village (15 min)'],
    whyRent: ['Mesa Gateway has limited rental counters', 'Free airport delivery saves time and money', 'Perfect for spring training and family trips', 'Easy access to East Valley recreation'],
    faqs: [
      { question: 'Delivery to Mesa Gateway Airport?', answer: 'Yes — free curbside pickup at AZA for most rentals.' },
      { question: 'Best car for spring training?', answer: 'SUVs for tailgating at Sloan Park — many hosts nearby.' },
      { question: 'Driving to Superstition Mountains?', answer: '30-minute scenic drive — rent a Jeep or SUV for off-road trails.' },
      { question: 'Parking at Riverview Park?', answer: 'Free and plentiful — great for family outings.' },
      { question: 'AZA vs PHX?', answer: 'AZA is cheaper flights but farther east — ItWhip makes it easy.' }
    ],
    coordinates: { lat: 33.4218, lng: -111.8245 },
    nearbyLocations: ['Phoenix', 'Tempe', 'Gilbert', 'Chandler', 'Apache Junction'],
    searchTerms: ['car rental mesa', 'mesa gateway car rental', 'aza airport car rental', 'spring training car rental mesa', 'cheap car rental mesa az']
  },
  'chandler': {
    slug: 'chandler',
    name: 'Chandler',
    type: 'city',
    metaTitle: 'Car Rentals in Chandler, AZ from $40/day | ItWhip',
    metaDescription: 'Rent cars from local Chandler owners. Free delivery for Intel employees, Ocotillo offices, or family trips in the Southeast Valley.',
    h1: 'Car Rentals in Chandler – Intel & Family Friendly',
    heroSubtitle: 'Delivered to your office or home — free for Intel and Ocotillo',
    description: 'Chandler is the tech and family hub of the Southeast Valley — home to Intel\'s massive campus, upscale Ocotillo offices, and quiet neighborhoods. Public transit is limited, and a car is essential for commuting, school runs, or weekend escapes. With ItWhip, get a car delivered right to your driveway or workplace parking lot.\n\nPerfect for Intel employees who need reliable transport, families visiting San Tan Village, or anyone exploring the growing Chandler scene. Locals offer fuel-efficient sedans for daily drives and SUVs for mountain adventures.\n\nDriving tip: Chandler traffic is light compared to Phoenix, but Price Road (101) backs up during shift changes at Intel — plan around 7-8 AM and 4-5 PM.',
    airport: 'PHX',
    landmarks: ['Intel Ocotillo Campus', 'San Tan Village', 'Chandler Fashion Center', 'Rawhide Western Town', 'Veterans Oasis Park', 'Tumbleweed Park', 'Bear Creek Golf Complex'],
    popularRoutes: ['PHX to Chandler (30 min)', 'Chandler to Gilbert (10 min)', 'Chandler to Mesa (15 min)', 'Ocotillo to San Tan Mountains (20 min)'],
    whyRent: ['Limited public transit in Southeast Valley', 'Free delivery for Intel/Ocotillo employees', 'Perfect for family outings and shopping', 'Easy access to growing Chandler amenities'],
    faqs: [
      { question: 'Delivery to Intel campus?', answer: 'Yes — free delivery to Ocotillo parking lots (coordinate with security if needed).' },
      { question: 'Best car for family trips?', answer: 'SUVs and minivans are most popular — plenty of hosts in Chandler.' },
      { question: 'Parking at San Tan Village?', answer: 'Free and abundant — great for shopping weekends.' },
      { question: 'Driving to Sedona?', answer: '2.5 hours north — many guests rent SUVs for the scenic route.' },
      { question: 'Shift change traffic?', answer: 'Avoid Price Road 7-8 AM and 4-5 PM — Intel shifts cause backups.' }
    ],
    coordinates: { lat: 33.3062, lng: -111.8413 },
    nearbyLocations: ['Phoenix', 'Gilbert', 'Mesa', 'Tempe', 'Queen Creek'],
    searchTerms: ['car rental chandler', 'intel chandler car rental', 'ocotillo car rental', 'san tan village car rental', 'cheap car rental chandler az']
  },
  'gilbert': {
    slug: 'gilbert',
    name: 'Gilbert',
    type: 'city',
    metaTitle: 'Car Rentals in Gilbert, AZ from $38/day | ItWhip',
    metaDescription: 'Rent cars from local Gilbert owners. Free delivery for San Tan Village shopping, family outings, or East Valley commutes.',
    h1: 'Car Rentals in Gilbert – Family & Shopping Friendly',
    heroSubtitle: 'Delivered to your neighborhood — perfect for San Tan and family trips',
    description: 'Gilbert is one of America\'s fastest-growing towns — known for family-friendly vibes, top-rated schools, and the massive San Tan Village shopping center. Public transit is almost nonexistent, and a car is essential for daily life, school runs, or weekend adventures. With ItWhip, get a car delivered right to your driveway in Heritage District or Power Ranch.\n\nPerfect for shopping at San Tan, Topgolf outings, or exploring Riparian Preserve. Locals offer family SUVs, minivans, and efficient sedans — everything you need for Gilbert life.\n\nDriving tip: Gilbert roads are wide and well-maintained, but San Tan Village traffic spikes on weekends — arrive early for parking.',
    airport: 'PHX',
    landmarks: ['San Tan Village', 'Riparian Preserve at Water Ranch', 'Gilbert Farmers Market', 'Freestone District Park', 'Topgolf Gilbert', 'Discovery Park', 'Heritage District'],
    popularRoutes: ['PHX to Gilbert (35 min)', 'Gilbert to Chandler (10 min)', 'Gilbert to Mesa (15 min)', 'San Tan to Queen Creek (10 min)'],
    whyRent: ['No public transit in Gilbert', 'Free delivery for family neighborhoods', 'Perfect for San Tan Village shopping', 'Easy access to East Valley parks and recreation'],
    faqs: [
      { question: 'Delivery to San Tan Village?', answer: 'Yes — free delivery to parking lots for shopping trips.' },
      { question: 'Best car for family outings?', answer: 'Minivans and SUVs are most popular — plenty of hosts in Gilbert.' },
      { question: 'Parking at Riparian Preserve?', answer: 'Free and plentiful — great for birdwatching and walks.' },
      { question: 'Driving to Sedona?', answer: '2.5 hours north — many guests rent SUVs for the drive.' },
      { question: 'Weekend traffic?', answer: 'San Tan Village gets busy Saturday mornings — plan extra time.' }
    ],
    coordinates: { lat: 33.3528, lng: -111.7890 },
    nearbyLocations: ['Chandler', 'Mesa', 'Queen Creek', 'Phoenix', 'San Tan Valley'],
    searchTerms: ['car rental gilbert', 'san tan village car rental', 'gilbert family car rental', 'cheap car rental gilbert az', 'riparian preserve car rental']
  },
  'glendale': {
    slug: 'glendale',
    name: 'Glendale',
    type: 'city',
    metaTitle: 'Car Rentals in Glendale, AZ from $42/day – Westgate & Sports | ItWhip',
    metaDescription: 'Rent cars from local Glendale owners near Westgate. Free delivery for Cardinals games, concerts, or West Valley commutes.',
    h1: 'Car Rentals in Glendale – Westgate, Sports & Events',
    heroSubtitle: 'Delivered to Westgate or your home — perfect for game days',
    description: 'Glendale is the sports and entertainment hub of the West Valley — home to State Farm Stadium (Cardinals), Gila River Arena, and the massive Westgate Entertainment District. Public transit is limited, and a car is essential for game days, concerts, or exploring Arrowhead. With ItWhip, get a car delivered right to your tailgate spot or hotel.\n\nPerfect for Cardinals football, spring training at Camelback Ranch, or shopping at Tanger Outlets. Locals offer trucks for tailgating, SUVs for family outings, and sedans for daily drives.\n\nDriving tip: Game days at State Farm Stadium turn the Loop 101 into a parking lot — arrive 2 hours early or use side roads.',
    airport: 'PHX',
    landmarks: ['State Farm Stadium', 'Gila River Arena', 'Westgate Entertainment District', 'Camelback Ranch (Spring Training)', 'Tanger Outlets', 'Arrowhead Towne Center', 'Peoria Sports Complex'],
    popularRoutes: ['PHX to Glendale (30 min)', 'Glendale to Peoria (15 min)', 'Glendale to Surprise (20 min)', 'Westgate to Lake Pleasant (30 min)'],
    whyRent: ['Limited public transit in West Valley', 'Free delivery for game days and events', 'Perfect for tailgating and concerts', 'Easy access to spring training venues'],
    faqs: [
      { question: 'Delivery to State Farm Stadium?', answer: 'Yes — free delivery to parking lots for Cardinals games (coordinate tailgate spot).' },
      { question: 'Best car for tailgating?', answer: 'Trucks and SUVs — many hosts near stadium with coolers/racks.' },
      { question: 'Parking at Westgate?', answer: 'Free for most events; arrive early for concerts.' },
      { question: 'Spring training?', answer: '15-minute drive to Camelback Ranch — we deliver to the stadium.' },
      { question: 'Game day traffic?', answer: 'Loop 101 backs up 2+ hours — use side roads or arrive very early.' }
    ],
    coordinates: { lat: 33.5387, lng: -112.1859 },
    nearbyLocations: ['Phoenix', 'Peoria', 'Surprise', 'Goodyear', 'Avondale'],
    searchTerms: ['car rental glendale', 'westgate car rental', 'state farm stadium parking', 'cardinals game car rental', 'spring training glendale']
  },
  'peoria': {
    slug: 'peoria',
    name: 'Peoria',
    type: 'city',
    metaTitle: 'Car Rentals in Peoria, AZ from $40/day – Lake Pleasant & Sports | ItWhip',
    metaDescription: 'Rent cars from local Peoria owners near Lake Pleasant. Free delivery for spring training, boating, or West Valley commutes.',
    h1: 'Car Rentals in Peoria – Lake Pleasant & Spring Training',
    heroSubtitle: 'Delivered to your lake house or stadium — free',
    description: 'Peoria is the outdoor and sports heart of the West Valley — home to Lake Pleasant recreation, Peoria Sports Complex (spring training), and growing neighborhoods. Public transit is minimal, and a car is essential for lake trips, baseball games, or commuting to Phoenix. With ItWhip, get a car delivered right to your Airbnb or marina slip.\n\nPerfect for boating at Lake Pleasant, Padres/Mariners spring training, or hiking the Sunrise Mountain trails. Locals offer trucks for towing, SUVs for off-road, and sedans for daily drives.\n\nDriving tip: Lake Pleasant Road gets busy on weekends — leave early for boat launches. Watch for wildlife on the drive north.',
    airport: 'PHX',
    landmarks: ['Lake Pleasant Regional Park', 'Peoria Sports Complex', 'Sunrise Mountain Preserve', 'Arrowhead Towne Center', 'Challenge Course at Rio Vista', 'P83 Entertainment District', 'Westbrook Village Golf'],
    popularRoutes: ['PHX to Peoria (40 min)', 'Peoria to Lake Pleasant (20 min)', 'Peoria to Glendale (15 min)', 'Peoria to Surprise stadiums (20 min)'],
    whyRent: ['No public transit to Lake Pleasant', 'Free delivery for boating and camping', 'Perfect for spring training season', 'Easy access to West Valley hiking'],
    faqs: [
      { question: 'Delivery to Lake Pleasant?', answer: 'Yes — free delivery to marinas and campgrounds (coordinate boat ramp).' },
      { question: 'Best car for boating?', answer: 'Trucks and SUVs with tow hitches — many hosts offer them.' },
      { question: 'Spring training parking?', answer: 'Free at Peoria Sports Complex — arrive early for good spots.' },
      { question: 'Driving to Surprise?', answer: '20 minutes — many guests rent for multi-team days.' },
      { question: 'Weekend lake traffic?', answer: 'Lake Pleasant Road busy Saturday mornings — leave before 9 AM.' }
    ],
    coordinates: { lat: 33.5806, lng: -112.2374 },
    nearbyLocations: ['Glendale', 'Surprise', 'Sun City', 'Phoenix', 'Lake Pleasant'],
    searchTerms: ['car rental peoria', 'lake pleasant car rental', 'peoria sports complex parking', 'spring training peoria', 'cheap car rental peoria az']
  },
  'goodyear': {
    slug: 'goodyear',
    name: 'Goodyear',
    type: 'city',
    metaTitle: 'Car Rentals in Goodyear, AZ from $38/day – Spring Training & Estrella | ItWhip',
    metaDescription: 'Rent cars from local Goodyear owners near Goodyear Ballpark. Free delivery for Reds/Guardians spring training, Estrella Mountain hikes, or West Valley commutes.',
    h1: 'Car Rentals in Goodyear – Spring Training & Estrella Mountain',
    heroSubtitle: 'Delivered to your stadium or trailhead — free',
    description: 'Goodyear is the fast-growing heart of the Southwest Valley — home to Goodyear Ballpark (Reds/Guardians spring training), Estrella Mountain Regional Park, and master-planned communities. Public transit is nonexistent, and a car is essential for stadium trips, hiking, or commuting to Phoenix.\n\nPerfect for spring training fans, Estrella hikers, or families in Estrella/Palm Valley neighborhoods. Locals offer trucks, SUVs, and sedans for every need.\n\nDriving tip: I-10 West backs up during rush hour — use the 303 Loop to avoid delays. Spring training weekends pack the ballpark area.',
    airport: 'PHX',
    landmarks: ['Goodyear Ballpark', 'Estrella Mountain Regional Park', 'Palm Valley', 'Estrella Falls', 'PebbleCreek Golf', 'Goodyear Recreation Campus', 'Wigwam Resort'],
    popularRoutes: ['PHX to Goodyear (30 min)', 'Goodyear to Glendale Westgate (20 min)', 'Goodyear to Buckeye (15 min)', 'Estrella Mountain trails (10 min)'],
    whyRent: ['No public transit in Southwest Valley', 'Free delivery for spring training', 'Perfect for Estrella Mountain hiking', 'Easy access to West Valley growth'],
    faqs: [
      { question: 'Delivery to Goodyear Ballpark?', answer: 'Yes — free delivery for Reds/Guardians spring training games.' },
      { question: 'Best car for Estrella hiking?', answer: 'SUVs and trucks — trails can be dusty and remote.' },
      { question: 'Parking at the ballpark?', answer: 'Free but fills up fast — arrive 1 hour early for spring training.' },
      { question: 'Driving to Phoenix?', answer: '30-40 minutes via I-10 or 303 Loop — avoid rush hour.' },
      { question: 'Best neighborhoods?', answer: 'Estrella, Palm Valley, and PebbleCreek are most popular — we deliver everywhere.' }
    ],
    coordinates: { lat: 33.4353, lng: -112.3577 },
    nearbyLocations: ['Avondale', 'Buckeye', 'Glendale', 'Phoenix', 'Litchfield Park'],
    searchTerms: ['car rental goodyear', 'goodyear ballpark car rental', 'estrella mountain car rental', 'spring training goodyear', 'cheap car rental goodyear az']
  },
  'surprise': {
    slug: 'surprise',
    name: 'Surprise',
    type: 'city',
    metaTitle: 'Car Rentals in Surprise, AZ from $38/day – Spring Training & Retirement | ItWhip',
    metaDescription: 'Rent cars from local Surprise owners near Surprise Stadium. Free delivery for Royals/Rangers spring training or Sun City West retirement communities.',
    h1: 'Car Rentals in Surprise – Spring Training & Sun City West',
    heroSubtitle: 'Delivered to your stadium or retirement home — free',
    description: 'Surprise is the retirement and spring training haven of the Northwest Valley — home to Surprise Stadium (Royals/Rangers), Sun City West communities, and family neighborhoods. Public transit is limited, and a car is essential for baseball games, golf outings, or commuting to Phoenix.\n\nPerfect for spring training fans, retirees in Sun City, or families exploring White Tank Mountain. Locals offer comfortable sedans for daily drives and SUVs for park trips.\n\nDriving tip: Spring training traffic clogs Bell Road — arrive early or use the 303 Loop. Watch for golf carts in retirement areas.',
    airport: 'PHX',
    landmarks: ['Surprise Stadium', 'Sun City West', 'White Tank Mountain Regional Park', 'Surprise Recreation Campus', 'Wildlife World Zoo', 'Arrowhead Towne Center', 'Trilby Wash'],
    popularRoutes: ['PHX to Surprise (45 min)', 'Surprise to Glendale (20 min)', 'Surprise to Lake Pleasant (30 min)', 'Sun City West to Peoria (15 min)'],
    whyRent: ['Limited transit in Northwest Valley', 'Free delivery for spring training', 'Perfect for retirement community outings', 'Easy access to White Tank hiking'],
    faqs: [
      { question: 'Delivery to Surprise Stadium?', answer: 'Yes — free delivery for Royals/Rangers spring training games.' },
      { question: 'Best car for Sun City West?', answer: 'Comfortable sedans and golf carts — many hosts in the area.' },
      { question: 'Parking at the stadium?', answer: 'Free but limited — arrive 1 hour early for spring training.' },
      { question: 'Driving to Lake Pleasant?', answer: '30 minutes north — rent an SUV for boating.' },
      { question: 'Retirement area tips?', answer: 'Watch for golf carts on roads — slower speeds in Sun City.' }
    ],
    coordinates: { lat: 33.6292, lng: -112.3679 },
    nearbyLocations: ['Peoria', 'Glendale', 'Sun City', 'El Mirage', 'Waddell'],
    searchTerms: ['car rental surprise', 'surprise stadium car rental', 'sun city west car rental', 'spring training surprise', 'cheap car rental surprise az']
  },
  'tucson': {
    slug: 'tucson',
    name: 'Tucson',
    type: 'city',
    metaTitle: 'Car Rentals in Tucson, AZ from $35/day – Saguaro & UofA | ItWhip',
    metaDescription: 'Rent cars from local Tucson owners near Tucson Airport (TUS). Free delivery for University of Arizona, Saguaro National Park, or winter escapes.',
    h1: 'Car Rentals in Tucson – UofA & Desert Adventures',
    heroSubtitle: 'Delivered to your campus or trailhead — free',
    description: 'Tucson is the gateway to the Sonoran Desert — known for University of Arizona, Saguaro National Park, and year-round sunshine. Public transit is okay downtown, but a car is essential for campus commutes, park hikes, or trips to Mt. Lemmon. With ItWhip, get a car delivered to your dorm, airport, or hotel.\n\nPerfect for UA Wildcat games, desert stargazing, or winter visitors escaping the snow. Locals offer Jeeps for off-road, sedans for city drives, and SUVs for family outings.\n\nDriving tip: Tucson summers hit 110° — always check tire pressure. Mt. Lemmon road has sharp turns; go slow and pull over for locals.',
    airport: 'TUS',
    landmarks: ['University of Arizona', 'Saguaro National Park', 'Mt. Lemmon', 'Arizona-Sonora Desert Museum', 'Pima Air & Space Museum', 'Sabino Canyon', 'Tucson Botanical Gardens'],
    popularRoutes: ['TUS to UofA (15 min)', 'Tucson to Mt. Lemmon (1 hr)', 'Tucson to Saguaro Park East (30 min)', 'Tucson to Phoenix (2 hrs)'],
    whyRent: ['Desert attractions spread out beyond transit', 'Free airport delivery at TUS', 'Perfect for UA students and visitors', 'Jeeps for Saguaro and Mt. Lemmon'],
    faqs: [
      { question: 'Delivery to Tucson Airport?', answer: 'Yes — free curbside at TUS for most rentals.' },
      { question: 'Best car for Mt. Lemmon?', answer: 'SUVs or AWD — road is winding with elevation changes.' },
      { question: 'Parking at UofA?', answer: 'Metered lots; use garages for events — arrive early.' },
      { question: 'Driving to Saguaro Park?', answer: '30 minutes east — rent a Jeep for trails.' },
      { question: 'Summer driving tips?', answer: 'Carry water, check tires — heat causes blowouts.' }
    ],
    coordinates: { lat: 32.2226, lng: -110.9747 },
    nearbyLocations: ['Phoenix', 'Mt. Lemmon', 'Oro Valley', 'Marana', 'Sahuarita'],
    searchTerms: ['car rental tucson', 'tus airport car rental', 'u of a car rental', 'saguaro national park car rental', 'mt lemmon car rental']
  },
  'sedona': {
    slug: 'sedona',
    name: 'Sedona',
    type: 'city',
    metaTitle: 'Sedona Car Rentals from $65/day – Red Rocks & Jeeps | ItWhip',
    metaDescription: 'Rent Jeeps and convertibles from local Sedona owners. Free delivery for red rock hikes, vortex tours, or wine country drives.',
    h1: 'Sedona Car Rentals – Red Rocks & Vortex Adventures',
    heroSubtitle: 'Delivered to your trail or lodge — free',
    description: 'Sedona is the spiritual and adventure capital of Arizona — famous for red rock formations, energy vortexes, and world-class hiking. No public transit means a car is crucial for getting to trailheads, wineries, or jeep tours. With ItWhip, get an off-road vehicle or convertible delivered to your lodge or Airbnb.\n\nPerfect for vortex seekers, hikers at Cathedral Rock, or wine tasting in Cottonwood. Locals know the best Jeeps for Pink Jeep-style trails or sedans for scenic drives.\n\nDriving tip: Sedona\'s roads are winding and unpaved in spots — rent 4WD for Bell Rock or Schnebly Hill. Watch for wildlife at dusk.',
    airport: 'PHX',
    landmarks: ['Cathedral Rock', 'Bell Rock', 'Sedona Vortex Sites', 'Red Rock State Park', 'Oak Creek Canyon', 'Tlaquepaque Arts Village', 'Chapel of the Holy Dove'],
    popularRoutes: ['PHX to Sedona (2 hrs)', 'Sedona to Jerome (30 min)', 'Sedona to Cottonwood wineries (20 min)', 'Uptown to Airport Mesa vortex (10 min)'],
    whyRent: ['No transit to vortexes and trails', 'Free delivery for spiritual retreats', 'Perfect for red rock jeep tours', 'Convertibles for scenic Oak Creek drives'],
    faqs: [
      { question: 'Delivery to Sedona lodges?', answer: 'Yes — free to Enchantment, L\'Auberge, or your Airbnb.' },
      { question: 'Best car for red rock trails?', answer: 'Jeeps or SUVs — many hosts offer 4WD for Schnebly Hill.' },
      { question: 'Parking at Cathedral Rock?', answer: 'Limited trailhead spots — arrive early or shuttle from town.' },
      { question: 'Drive time from Phoenix?', answer: '2 hours scenic via I-17 — stunning views the whole way.' },
      { question: 'Sedona traffic tips?', answer: 'Uptown clogs on weekends — use 89A bypass for faster travel.' }
    ],
    coordinates: { lat: 34.8697, lng: -111.7609 },
    nearbyLocations: ['Flagstaff', 'Cottonwood', 'Jerome', 'Camp Verde', 'Phoenix'],
    searchTerms: ['sedona car rental', 'sedona jeep rental', 'red rock car rental', 'sedona vortex car rental', 'sedona airport car rental']
  },
  'flagstaff': {
    slug: 'flagstaff',
    name: 'Flagstaff',
    type: 'city',
    metaTitle: 'Flagstaff Car Rentals from $55/day – Snow & Grand Canyon | ItWhip',
    metaDescription: 'Rent 4WD and SUVs from local Flagstaff owners. Free delivery for NAU, snow trips, or Grand Canyon drives.',
    h1: 'Flagstaff Car Rentals – Snow, NAU & Grand Canyon',
    heroSubtitle: 'Delivered to your lodge or campus — free',
    description: 'Flagstaff is Arizona\'s mountain town — known for Northern Arizona University, winter snow, and as the gateway to the Grand Canyon. Public transit is okay downtown, but a car is essential for ski trips to Snowbowl, NAU commutes, or drives to the Canyon rim. With ItWhip, get a 4WD SUV or truck delivered to your cabin or dorm.\n\nPerfect for NAU Lumberjacks, winter visitors at Arizona Snowbowl, or Grand Canyon day-trippers. Locals offer snow-ready vehicles for mountain roads and sedans for city drives.\n\nDriving tip: Flagstaff winters bring snow — chains required for Snowbowl. US-180 to Grand Canyon can close for weather; check AZ511.',
    airport: 'FLG',
    landmarks: ['Arizona Snowbowl', 'Northern Arizona University', 'Lowell Observatory', 'Walnut Canyon National Monument', 'Wupatki National Monument', 'Historic Downtown Flagstaff', 'Sunset Crater Volcano'],
    popularRoutes: ['FLG to Snowbowl (20 min)', 'Flagstaff to Grand Canyon South Rim (1.5 hrs)', 'Flagstaff to Sedona (45 min)', 'NAU to Downtown (5 min)'],
    whyRent: ['Winter snow requires 4WD', 'Free delivery for NAU students', 'Gateway to Grand Canyon and monuments', 'Easy access to northern Arizona adventures'],
    faqs: [
      { question: 'Delivery to Flagstaff Airport?', answer: 'Yes — free curbside at FLG for most rentals.' },
      { question: 'Best car for Snowbowl?', answer: '4WD SUVs or trucks — chains included with many hosts.' },
      { question: 'Parking downtown?', answer: 'Metered streets; garages free after 5 PM.' },
      { question: 'Drive to Grand Canyon?', answer: '1.5 hours south — rent an SUV for winter conditions.' },
      { question: 'Winter driving tips?', answer: 'Carry chains, check AZ511 for closures — snow can hit suddenly.' }
    ],
    coordinates: { lat: 35.1983, lng: -111.6513 },
    nearbyLocations: ['Sedona', 'Grand Canyon Village', 'Williams', 'Winslow', 'Page'],
    searchTerms: ['car rental flagstaff', 'flagstaff airport car rental', 'nau car rental', 'snowbowl car rental', 'grand canyon car rental from flagstaff']
  },
  'queen-creek': {
    slug: 'queen-creek',
    name: 'Queen Creek',
    type: 'city',
    metaTitle: 'Queen Creek Car Rentals from $42/day – Wine Country & Farms | ItWhip',
    metaDescription: 'Rent cars from local Queen Creek owners. Free delivery for Schnepf Farms, Queen Creek Olive Mill, or East Valley wine tours.',
    h1: 'Queen Creek Car Rentals – Wine Country & Family Farms',
    heroSubtitle: 'Delivered to your winery or farm — free',
    description: 'Queen Creek is the agricultural and wine gem of the East Valley — known for Schnepf Farms, Queen Creek Olive Mill, and growing master-planned communities. Public transit is nonexistent, and a car is essential for farm tours, wine tastings, or commuting to Mesa. With ItWhip, get a car delivered to your Airbnb or vineyard.\n\nPerfect for family farm visits, olive oil tastings, or exploring San Tan Mountain hikes. Locals offer SUVs for dirt roads and sedans for wine country drives.\n\nDriving tip: Queen Creek roads are rural and winding — watch for tractors and horses. Ellsworth Loop gets busy during farm events.',
    airport: 'AZA',
    landmarks: ['Queen Creek Olive Mill', 'Schnepf Farms', 'San Tan Mountain Regional Park', 'Queen Creek Marketplace', 'Horseshoe Park & Equestrian Centre', 'Mansel Carter Oasis Park', 'Agritopia'],
    popularRoutes: ['AZA to Queen Creek (15 min)', 'Queen Creek to Gilbert (15 min)', 'Queen Creek to San Tan Mountains (10 min)', 'Queen Creek to Chandler (20 min)'],
    whyRent: ['Rural East Valley has no transit', 'Free delivery for farm and wine tours', 'Perfect for family outings and shopping', 'Easy access to San Tan hiking'],
    faqs: [
      { question: 'Delivery to Schnepf Farms?', answer: 'Yes — free delivery for events and tours.' },
      { question: 'Best car for wine tours?', answer: 'Convertibles or luxury sedans — scenic drives through vineyards.' },
      { question: 'Parking at Olive Mill?', answer: 'Free and plentiful — busy on weekends.' },
      { question: 'Driving to San Tan Park?', answer: '10 minutes south — rent an SUV for trails.' },
      { question: 'Rural road tips?', answer: 'Watch for farm equipment — slower speeds on Ellsworth.' }
    ],
    coordinates: { lat: 33.2487, lng: -111.6343 },
    nearbyLocations: ['Gilbert', 'Chandler', 'Mesa', 'Apache Junction', 'San Tan Valley'],
    searchTerms: ['car rental queen creek', 'schnepf farms car rental', 'queen creek olive mill car rental', 'san tan mountain car rental', 'wine tour car rental queen creek']
  },
  'paradise-valley': {
    slug: 'paradise-valley',
    name: 'Paradise Valley',
    type: 'city',
    metaTitle: 'Paradise Valley Luxury Car Rentals from $150/day | ItWhip',
    metaDescription: 'Rent luxury cars from local Paradise Valley owners. Free delivery to Camelback resorts, spas, or your estate.',
    h1: 'Paradise Valley Luxury Car Rentals – Resorts & Estates',
    heroSubtitle: 'Delivered to your Camelback estate — discreet & free',
    description: 'Paradise Valley is Arizona\'s most exclusive enclave — home to billionaires, luxury resorts, and Camelback Mountain views. No public transit means a car is essential for discreet trips to spas, golf courses, or Phoenix outings. With ItWhip, get a high-end vehicle delivered privately to your estate or resort.\n\nPerfect for Camelback hikes, Sanctuary spa days, or Biltmore Fashion Park shopping. Locals offer exotics, luxury sedans, and SUVs for the ultimate Valley experience.\n\nDriving tip: Paradise Valley roads are quiet and manicured — watch for speed limits in residential areas. Camelback Mountain parking fills fast; arrive early for hikes.',
    airport: 'PHX',
    landmarks: ['Camelback Mountain', 'Sanctuary Camelback Mountain Resort', 'Paradise Valley Country Club', 'Biltmore Fashion Park', 'Echo Canyon Recreation Area', 'Mummy Mountain', 'El Chorro Lodge'],
    popularRoutes: ['PHX to Paradise Valley (25 min)', 'Paradise Valley to Scottsdale Old Town (10 min)', 'Camelback to Biltmore (5 min)', 'Paradise Valley to Phoenix Art Museum (15 min)'],
    whyRent: ['Exclusive area with no transit', 'Discreet delivery to estates and resorts', 'Perfect for luxury spa and golf days', 'Convertibles for Camelback views'],
    faqs: [
      { question: 'Delivery to Paradise Valley resorts?', answer: 'Yes — discreet free delivery to Sanctuary, Mountain Shadows, or your estate.' },
      { question: 'Best car for Camelback hikes?', answer: 'Luxury SUVs — trails start right from resorts.' },
      { question: 'Parking at Biltmore?', answer: 'Valet or free self-parking — busy during events.' },
      { question: 'Driving to Scottsdale?', answer: '10 minutes — easy for shopping and dining.' },
      { question: 'Residential area tips?', answer: 'Strict speed limits — 25 mph in most neighborhoods.' }
    ],
    coordinates: { lat: 33.5303, lng: -111.9429 },
    nearbyLocations: ['Scottsdale', 'Phoenix', 'Arcadia', 'Biltmore', 'Camelback'],
    searchTerms: ['luxury car rental paradise valley', 'camelback mountain car rental', 'sanctuary resort car rental', 'biltmore car rental', 'paradise valley estate car rental']
  },
  'ahwatukee': {
    slug: 'ahwatukee',
    name: 'Ahwatukee',
    type: 'city',
    metaTitle: 'Ahwatukee Car Rentals from $38/day – South Mountain & Family | ItWhip',
    metaDescription: 'Rent cars from local Ahwatukee owners. Free delivery for South Mountain hikes, family neighborhoods, or East Valley commutes.',
    h1: 'Ahwatukee Car Rentals – South Mountain & Family Friendly',
    heroSubtitle: 'Delivered to your trail or neighborhood — free',
    description: 'Ahwatukee is the hidden gem at Phoenix\'s southern edge — a family-oriented community backed by South Mountain Preserve, with easy access to the East Valley. Public transit is limited, and a car is essential for hiking, school runs, or commuting to Chandler. With ItWhip, get a car delivered to your home or trailhead.\n\nPerfect for South Mountain adventures, Ahwatukee Foothills outings, or family trips to Desert Foothills Park. Locals offer SUVs for mountain drives and sedans for daily needs.\n\nDriving tip: Ahwatukee\'s winding roads near South Mountain can be steep — watch for hikers and cyclists. Chandler Blvd traffic peaks during rush hour.',
    airport: 'PHX',
    landmarks: ['South Mountain Preserve', 'Ahwatukee Foothills Village', 'Desert Foothills Park', 'Western Star Park', 'Pecos Community Center', 'South Mountain Golf Course', 'Hidden Valley'],
    popularRoutes: ['PHX to Ahwatukee (25 min)', 'Ahwatukee to Chandler (10 min)', 'Ahwatukee to Tempe (15 min)', 'South Mountain trails (5 min)'],
    whyRent: ['Limited transit in South Valley', 'Free delivery for South Mountain hikes', 'Perfect for family neighborhoods', 'Easy access to Phoenix attractions'],
    faqs: [
      { question: 'Delivery to South Mountain?', answer: 'Yes — free to trailheads and parking lots.' },
      { question: 'Best car for hiking?', answer: 'SUVs with AWD — trails can be rugged.' },
      { question: 'Parking at Desert Foothills?', answer: 'Free and plentiful — great for picnics.' },
      { question: 'Driving to Chandler?', answer: '10 minutes east — quick for shopping.' },
      { question: 'Rush hour tips?', answer: 'Avoid Chandler Blvd 7-8 AM and 4-5 PM — backups from commuters.' }
    ],
    coordinates: { lat: 33.3417, lng: -111.9841 },
    nearbyLocations: ['Phoenix', 'Chandler', 'Tempe', 'South Mountain', 'Laveen'],
    searchTerms: ['car rental ahwatukee', 'south mountain car rental', 'ahwatukee foothills car rental', 'desert foothills car rental', 'cheap car rental ahwatukee']
  },
  'avondale': {
    slug: 'avondale',
    name: 'Avondale',
    type: 'city',
    metaTitle: 'Avondale Car Rentals from $35/day – NASCAR & West Valley | ItWhip',
    metaDescription: 'Rent cars from local Avondale owners near Phoenix Raceway. Free delivery for NASCAR, Estrella Park, or West Valley commutes.',
    h1: 'Avondale Car Rentals – NASCAR & West Valley Adventures',
    heroSubtitle: 'Delivered to your track or park — free',
    description: 'Avondale is the racing and outdoor hub of the West Valley — home to Phoenix Raceway (NASCAR), Estrella Star Tower, and family communities. Public transit is sparse, and a car is essential for track days, park hikes, or commuting to Goodyear. With ItWhip, get a car delivered to your garage or raceway parking.\n\nPerfect for NASCAR weekends, Estrella Park stargazing, or family outings to Friendship Park. Locals offer trucks for towing and sedans for daily drives.\n\nDriving tip: Race weekends clog the I-10 — use the 101 Loop south. Watch for dust storms in summer.',
    airport: 'PHX',
    landmarks: ['Phoenix Raceway', 'Estrella Star Tower', 'Friendship Park', 'Avondale Sports Center', 'Estrella Mountain Regional Park', 'Goodyear Farms Historic Cemetery', 'Loma Linda Park'],
    popularRoutes: ['PHX to Avondale (25 min)', 'Avondale to Goodyear (10 min)', 'Avondale to Estrella Park (15 min)', 'Phoenix Raceway to Glendale (30 min)'],
    whyRent: ['No transit in West Valley', 'Free delivery for NASCAR weekends', 'Perfect for Estrella Park outings', 'Easy access to Phoenix Raceway'],
    faqs: [
      { question: 'Delivery to Phoenix Raceway?', answer: 'Yes — free to parking lots for NASCAR events.' },
      { question: 'Best car for race weekends?', answer: 'Trucks and SUVs for tailgating — many hosts nearby.' },
      { question: 'Parking at Estrella Park?', answer: 'Free but limited — arrive early for stargazing.' },
      { question: 'Driving to Goodyear?', answer: '10 minutes west — quick for shopping.' },
      { question: 'Race day traffic?', answer: 'I-10 clogs 2+ hours — use side roads or arrive very early.' }
    ],
    coordinates: { lat: 33.4356, lng: -112.3496 },
    nearbyLocations: ['Goodyear', 'Phoenix', 'Litchfield Park', 'Tolleson', 'Estrella Mountain'],
    searchTerms: ['car rental avondale', 'phoenix raceway car rental', 'nascar avondale car rental', 'estrella park car rental', 'cheap car rental avondale az']
  },
  'sky-harbor-airport': {
    slug: 'sky-harbor-airport',
    name: 'Sky Harbor Airport',
    type: 'airport',
    metaTitle: 'Sky Harbor Airport Car Rentals from $35/day | ItWhip',
    metaDescription: 'Rent cars from local owners at Sky Harbor Airport (PHX). Free curbside delivery, no lines, no shuttle waits. $1M insurance included.',
    h1: 'Car Rentals at Sky Harbor Airport (PHX)',
    heroSubtitle: 'Free curbside pickup — skip the rental counter chaos',
    description: 'Sky Harbor (PHX) is Arizona\'s busiest airport, handling 48 million passengers yearly — but the rental car center requires long shuttle rides and endless lines. You need a car to escape the airport and explore Phoenix, but traditional counters add stress and fees. With ItWhip, your rental arrives pre-cooled at the curb, ready for immediate takeoff — no waiting, no hassle.\n\nPerfect for business travelers heading downtown, families to resorts, or quick getaways to the desert. Locals offer economy cars for short trips or luxury for Valley arrivals.\n\nAirport tip: PHX has three terminals — specify yours for seamless delivery. Driving out: I-10 East to Scottsdale (20 min) or West to Glendale (30 min); avoid rush hour (7-9 AM/4-6 PM) on the 10 or 202 Loop.',
    airport: 'PHX',
    landmarks: ['Sky Harbor Terminal 4', 'Desert Botanical Garden', 'Papago Park', 'Chase Field', 'Heard Museum', 'Camelback Mountain', 'South Mountain Park'],
    popularRoutes: ['PHX to Scottsdale (20 min)', 'PHX to Tempe (15 min)', 'PHX to Mesa Gateway (35 min)', 'PHX to Downtown Phoenix (10 min)'],
    whyRent: ['Long shuttle lines at rental center', 'Free curbside delivery saves time', 'Perfect for Phoenix arrivals', 'Convertibles for sunny AZ drives'],
    faqs: [
      { question: 'Curbside delivery at PHX?', answer: 'Yes — free at all terminals, no shuttle needed.' },
      { question: 'Best car for Phoenix arrival?', answer: 'Pre-cooled sedans or SUVs — always MaxAC™ certified.' },
      { question: 'Airport parking?', answer: 'Short-term lots $4/hour; use cell phone lot for quick pickups.' },
      { question: 'Drive time to Scottsdale?', answer: '20-30 minutes via Loop 101 — avoid rush hour.' },
      { question: 'Rental return?', answer: 'Easy curbside drop-off — no gas station stops required.' }
    ],
    coordinates: { lat: 33.4343, lng: -111.9975 },
    nearbyLocations: ['Phoenix', 'Tempe', 'Scottsdale', 'Mesa', 'Chandler'],
    searchTerms: ['sky harbor car rental', 'phx airport car rental', 'sky harbor rental alternative', 'phx curbside car rental', 'cheap car rental sky harbor']
  },
  'mesa-gateway-airport': {
    slug: 'mesa-gateway-airport',
    name: 'Mesa Gateway Airport',
    type: 'airport',
    metaTitle: 'Mesa Gateway Airport Car Rentals from $35/day | ItWhip',
    metaDescription: 'Rent cars from local owners at Mesa Gateway Airport (AZA). Free curbside delivery for Allegiant/Spirit flyers — no lines, no waits.',
    h1: 'Car Rentals at Mesa Gateway Airport (AZA)',
    heroSubtitle: 'Free curbside pickup — beat the limited airport options',
    description: 'Mesa Gateway (AZA) is the budget-friendly alternative to Sky Harbor — serving 1.8 million passengers yearly with cheap flights from Allegiant and Spirit, but rental car options are sparse and often overpriced. You need a car to reach Mesa\'s suburbs or Phoenix, but counters here are limited. With ItWhip, your rental arrives at the curb, ready for East Valley drives — no shuttles, no hassle.\n\nPerfect for bargain hunters flying into AZA, heading to Cubs spring training, or exploring Superstition Mountains. Locals offer affordable sedans for commutes or SUVs for desert trips.\n\nAirport tip: AZA is smaller and easier than PHX, but flights are mostly regional — specify terminal for delivery. Driving out: SR-202 East to Gilbert (15 min) or North to Scottsdale (35 min); watch for construction on the 202 Loop.',
    airport: 'AZA',
    landmarks: ['Mesa Gateway Terminal', 'Sloan Park (Cubs Spring Training)', 'Usery Mountain Regional Park', 'San Tan Mountain Regional Park', 'Superstition Springs Center', 'Golfland Sunsplash', 'Mesa Arts Center'],
    popularRoutes: ['AZA to Mesa (5 min)', 'AZA to Gilbert (15 min)', 'AZA to Phoenix (35 min)', 'AZA to Superstition Mountains (30 min)'],
    whyRent: ['Limited rental counters at AZA', 'Free curbside delivery saves money', 'Perfect for budget flyers', 'Convertibles for East Valley drives'],
    faqs: [
      { question: 'Curbside delivery at AZA?', answer: 'Yes — free at the small terminal, no shuttle needed.' },
      { question: 'Best car for spring training?', answer: 'SUVs for Sloan Park tailgating — many hosts nearby.' },
      { question: 'Airport parking?', answer: 'Cheap lots $3/day; use for quick pickups.' },
      { question: 'Drive time to Phoenix?', answer: '35-45 minutes via SR-202 — avoid rush hour.' },
      { question: 'Rental return?', answer: 'Easy curbside drop-off — no extra fees.' }
    ],
    coordinates: { lat: 33.3078, lng: -111.6556 },
    nearbyLocations: ['Mesa', 'Gilbert', 'Chandler', 'Apache Junction', 'Queen Creek'],
    searchTerms: ['mesa gateway car rental', 'aza airport car rental', 'mesa gateway rental alternative', 'aza curbside car rental', 'cheap car rental mesa gateway']
  },
  'scottsdale-airport': {
    slug: 'scottsdale-airport',
    name: 'Scottsdale Airport',
    type: 'airport',
    metaTitle: 'Scottsdale Airport Car Rentals from $65/day | ItWhip',
    metaDescription: 'Rent cars from local owners at Scottsdale Airport (SDL). Free curbside delivery for private flyers, no lines, no waits. $1M insurance included.',
    h1: 'Car Rentals at Scottsdale Airport (SDL)',
    heroSubtitle: 'Free curbside pickup — skip the FBO hassle',
    description: 'Scottsdale Airport (SDL) is the luxury and private aviation hub of Arizona — serving business jets, charters, and affluent travelers with quick access to upscale neighborhoods. You need a car to reach resorts or meetings, but traditional options are limited. With ItWhip, your rental arrives pre-cooled at the FBO or ramp, ready for immediate departure — no waiting, no fees.\n\nPerfect for executives flying into SDL for Scottsdale golf trips, Paradise Valley estates, or Old Town events. Locals offer luxury sedans for business and convertibles for leisure.\n\nAirport tip: SDL is smaller and more exclusive than PHX — specify your FBO (Cutter Aviation, Signature) for seamless delivery. Driving out: Scottsdale Road North to resorts (10 min) or South to Phoenix (20 min); avoid afternoon traffic on the 101 Loop.',
    airport: 'SDL',
    landmarks: ['Scottsdale Airport FBO', 'Scottsdale Airpark', 'Kierland Commons', 'TPC Scottsdale', 'Grayhawk Golf Club', 'McDowell Mountain Regional Park', 'Pinnacle Peak Park'],
    popularRoutes: ['SDL to Old Town Scottsdale (10 min)', 'SDL to TPC Scottsdale (5 min)', 'SDL to Phoenix (20 min)', 'SDL to Sedona (1.5 hrs)'],
    whyRent: ['Exclusive airport with limited rentals', 'Free FBO delivery for private jets', 'Perfect for golf and business trips', 'Convertibles for Scottsdale drives'],
    faqs: [
      { question: 'Curbside delivery at SDL?', answer: 'Yes — free at FBOs like Cutter or Signature for most rentals.' },
      { question: 'Best car for Scottsdale golf?', answer: 'Luxury SUVs — room for clubs and quick to courses like TPC.' },
      { question: 'Parking at the airport?', answer: 'Free short-term; FBOs offer valet for charters.' },
      { question: 'Drive time to Old Town?', answer: '10 minutes south — quick for dining and shopping.' },
      { question: 'Private jet tips?', answer: 'Coordinate with your handler; we meet at the ramp.' }
    ],
    coordinates: { lat: 33.6229, lng: -111.9105 },
    nearbyLocations: ['Scottsdale', 'Paradise Valley', 'Fountain Hills', 'Phoenix', 'Carefree'],
    searchTerms: ['scottsdale airport car rental', 'sdl airport car rental', 'scottsdale airpark car rental', 'sdl fbo car rental', 'private jet car rental scottsdale']
  },
  'camelback': {
    slug: 'camelback',
    name: 'Camelback',
    type: 'tourism',
    metaTitle: 'Camelback Mountain Car Rentals from $99/day | ItWhip',
    metaDescription: 'Rent convertibles and luxury cars near Camelback Mountain. Free delivery for hikes, resorts, or Biltmore shopping in Phoenix.',
    h1: 'Car Rentals Near Camelback Mountain – Hikes & Resorts',
    heroSubtitle: 'Delivered to your trail or hotel — free',
    description: 'Camelback Mountain is Phoenix\'s iconic hiking destination — a rugged peak with stunning city views, surrounded by luxury resorts and Biltmore shopping. No transit reaches the trails, and a car is essential for getting to Echo Canyon or Cholla trailheads. With ItWhip, get a car delivered to your resort or parking lot — ready for sunrise hikes or sunset drives.\n\nPerfect for fitness enthusiasts climbing Camelback, spa days at Sanctuary, or shopping at Biltmore Fashion Park. Locals offer convertibles for breezy drives and SUVs for gear.\n\nDriving tip: Camelback Road is busy with resort traffic — park at Echo Canyon lot early (fills by 7 AM). Watch for hikers on trailside roads.',
    airport: 'PHX',
    landmarks: ['Camelback Mountain', 'Sanctuary Camelback Resort', 'Biltmore Fashion Park', 'Echo Canyon Recreation Area', 'Cholla Trail', 'The Phoenician Resort', 'Arizona Biltmore'],
    popularRoutes: ['PHX to Camelback (25 min)', 'Camelback to Biltmore (5 min)', 'Camelback to Scottsdale (10 min)', 'Camelback to Paradise Valley (5 min)'],
    whyRent: ['No transit to Camelback trails', 'Free delivery for sunrise hikes', 'Perfect for resort and shopping trips', 'Convertibles for mountain views'],
    faqs: [
      { question: 'Delivery to Camelback trailheads?', answer: 'Yes — free to Echo Canyon or Cholla parking lots.' },
      { question: 'Best car for Biltmore shopping?', answer: 'Luxury sedans — valet parking at Fashion Park.' },
      { question: 'Parking at Echo Canyon?', answer: 'Free but limited — arrive before 7 AM for popular hikes.' },
      { question: 'Drive time from PHX?', answer: '25 minutes — quick for airport arrivals.' },
      { question: 'Hiking tips?', answer: 'Carry water; trails are steep and exposed — start early in summer.' }
    ],
    coordinates: { lat: 33.5150, lng: -111.9619 },
    nearbyLocations: ['Paradise Valley', 'Scottsdale', 'Phoenix', 'Biltmore', 'Arcadia'],
    searchTerms: ['camelback mountain car rental', 'camelback resort car rental', 'echo canyon car rental', 'biltmore fashion park car rental', 'camelback hiking car rental']
  },
  'old-town-scottsdale': {
    slug: 'old-town-scottsdale',
    name: 'Old Town Scottsdale',
    type: 'tourism',
    metaTitle: 'Old Town Scottsdale Car Rentals from $99/day | ItWhip',
    metaDescription: 'Rent luxury and convertibles in Old Town Scottsdale. Free delivery for nightlife, galleries, or shopping.',
    h1: 'Car Rentals in Old Town Scottsdale – Nightlife & Galleries',
    heroSubtitle: 'Delivered to your hotel or bar — free',
    description: 'Old Town Scottsdale is Arizona\'s vibrant nightlife and arts district — packed with bars, galleries, shops, and restaurants. No public transit means a car is essential for hopping between spots or heading to resorts. With ItWhip, get a car delivered to your hotel or Fifth Avenue curb.\n\nPerfect for bar crawling on Scottsdale Road, gallery hopping at Marshall Way, or shopping at Fashion Square. Locals offer convertibles for night drives and luxury for making an entrance.\n\nDriving tip: Old Town parking is metered but free after 9 PM — use garages for weekends. Watch for pedestrians on Scottsdale Road.',
    airport: 'PHX',
    landmarks: ['Fifth Avenue Shops', 'Marshall Way Arts District', 'Scottsdale Fashion Square', 'Scottsdale Museum of Contemporary Art', 'Western Spirit Museum', 'Old Adobe Mission', 'Scottsdale Waterfront'],
    popularRoutes: ['PHX to Old Town (25 min)', 'Old Town to Camelback (10 min)', 'Old Town to Tempe Mill Ave (15 min)', 'Fashion Square to Talking Stick (10 min)'],
    whyRent: ['No transit for nightlife hopping', 'Free delivery to hotels and bars', 'Perfect for gallery and shopping tours', 'Convertibles for Scottsdale evenings'],
    faqs: [
      { question: 'Delivery to Old Town hotels?', answer: 'Yes — free to The Scott, W Scottsdale, or your Airbnb.' },
      { question: 'Best car for Scottsdale Road?', answer: 'Convertibles and luxury — show off in style.' },
      { question: 'Parking in Old Town?', answer: 'Metered until 9 PM; free garages after.' },
      { question: 'Drive time to Fashion Square?', answer: '5 minutes walk — but car for carrying shopping bags.' },
      { question: 'Nightlife tips?', answer: 'Scottsdale Road busy after 10 PM — use rideshares if drinking.' }
    ],
    coordinates: { lat: 33.4942, lng: -111.9261 },
    nearbyLocations: ['Scottsdale', 'Paradise Valley', 'Fountain Hills', 'Tempe', 'Phoenix'],
    searchTerms: ['old town scottsdale car rental', 'scottsdale nightlife car rental', 'marshall way car rental', 'fashion square car rental', 'old town galleries car rental']
  },
  'biltmore': {
    slug: 'biltmore',
    name: 'Biltmore',
    type: 'neighborhood',
    metaTitle: 'Biltmore Car Rentals from $99/day – Fashion Park & Golf | ItWhip',
    metaDescription: 'Rent luxury cars near Biltmore Fashion Park. Free delivery for shopping, golf, or Camelback hikes in Phoenix.',
    h1: 'Car Rentals Near Biltmore – Fashion Park & Luxury Golf',
    heroSubtitle: 'Delivered to your shop or tee time — free',
    description: 'The Biltmore area is Phoenix\'s upscale shopping and golf haven — centered on Biltmore Fashion Park, Arizona Biltmore Resort, and premier courses. No transit means a car is essential for mall runs, tee times, or Camelback hikes. With ItWhip, get a luxury vehicle delivered to your hotel or parking lot.\n\nPerfect for high-end shopping at Saks/Nordstrom, golf at Biltmore Links, or spa days at the Arizona Biltmore. Locals offer premium sedans for fashion outings and SUVs for golf bags.\n\nDriving tip: Biltmore traffic is light but parking at Fashion Park fills during holidays — use valet. Camelback Road has speed cameras.',
    airport: 'PHX',
    landmarks: ['Biltmore Fashion Park', 'Arizona Biltmore Resort', 'Wrigley Mansion', 'Biltmore Golf Course', 'Camelback Mountain', 'Piestewa Peak', 'Echo Canyon Trail'],
    popularRoutes: ['PHX to Biltmore (20 min)', 'Biltmore to Camelback (5 min)', 'Biltmore to Old Town Scottsdale (10 min)', 'Fashion Park to Downtown Phoenix (15 min)'],
    whyRent: ['No transit to Biltmore shops', 'Free delivery for fashion park trips', 'Perfect for golf course outings', 'Convertibles for luxury drives'],
    faqs: [
      { question: 'Delivery to Biltmore Fashion Park?', answer: 'Yes — free to parking garages or valet.' },
      { question: 'Best car for Biltmore golf?', answer: 'Luxury SUVs — room for clubs and gear.' },
      { question: 'Parking at Fashion Park?', answer: 'Free self-park or valet — busy on weekends.' },
      { question: 'Drive time to Camelback?', answer: '5 minutes — easy for morning hikes.' },
      { question: 'Holiday tips?', answer: 'Shopping crowds peak Dec — arrive early or use valet.' }
    ],
    coordinates: { lat: 33.5101, lng: -112.0298 },
    nearbyLocations: ['Phoenix', 'Arcadia', 'Camelback', 'Paradise Valley', 'Scottsdale'],
    searchTerms: ['biltmore car rental', 'biltmore fashion park car rental', 'arizona biltmore resort car rental', 'biltmore golf car rental', 'camelback biltmore car rental']
  },
  'downtown-phoenix': {
    slug: 'downtown-phoenix',
    name: 'Downtown Phoenix',
    type: 'neighborhood',
    metaTitle: 'Downtown Phoenix Car Rentals from $35/day | ItWhip',
    metaDescription: 'Rent cars in Downtown Phoenix for events, museums, or Chase Field. Free delivery to hotels or convention center.',
    h1: 'Car Rentals in Downtown Phoenix – Events & Culture',
    heroSubtitle: 'Delivered to your hotel or venue — free',
    description: 'Downtown Phoenix is the urban heart of Arizona — packed with museums, events, Chase Field, and the convention center. Public transit (light rail) works for basics, but a car is essential for late-night outings or trips beyond the core. With ItWhip, get a car delivered to your hotel or event venue.\n\nPerfect for Diamondbacks games at Chase Field, Heard Museum visits, or Phoenix Convention Center conferences. Locals offer sedans for city parking and SUVs for day trips.\n\nDriving tip: Downtown streets are grid-like but one-way — use apps for navigation. Parking garages are plentiful but meter during events.',
    airport: 'PHX',
    landmarks: ['Chase Field', 'Footprint Center', 'Phoenix Convention Center', 'Heard Museum', 'Roosevelt Row Arts District', 'Arizona Science Center', 'Heritage Square'],
    popularRoutes: ['PHX to Downtown (10 min)', 'Downtown to Tempe (15 min)', 'Downtown to Scottsdale (20 min)', 'Chase Field to South Mountain (15 min)'],
    whyRent: ['Light rail doesn\'t cover nights/events', 'Free delivery to convention center', 'Perfect for Chase Field games', 'Convertibles for downtown drives'],
    faqs: [
      { question: 'Delivery to Phoenix Convention Center?', answer: 'Yes — free to loading docks or nearby hotels.' },
      { question: 'Best car for Chase Field?', answer: 'Sedans for easy parking — many hosts downtown.' },
      { question: 'Parking downtown?', answer: 'Metered streets; garages $10-20 for events.' },
      { question: 'Drive time from PHX?', answer: '10 minutes — quick but traffic during rush.' },
      { question: 'Event tips?', answer: 'Arrive early for games — use light rail if no car.' }
    ],
    coordinates: { lat: 33.4484, lng: -112.0740 },
    nearbyLocations: ['Phoenix', 'Tempe', 'Scottsdale', 'Glendale', 'Ahwatukee'],
    searchTerms: ['downtown phoenix car rental', 'chase field car rental', 'phoenix convention center car rental', 'heard museum car rental', 'roosevelt row car rental']
  },
  'arcadia': {
    slug: 'arcadia',
    name: 'Arcadia',
    type: 'neighborhood',
    metaTitle: 'Arcadia Car Rentals from $99/day – Citrus Groves & Biltmore | ItWhip',
    metaDescription: 'Rent luxury cars in Arcadia Phoenix. Free delivery for citrus grove tours, Biltmore shopping, or upscale outings.',
    h1: 'Car Rentals in Arcadia – Citrus Groves & Upscale Phoenix',
    heroSubtitle: 'Delivered to your estate or grove — free',
    description: 'Arcadia is Phoenix\'s charming, tree-lined neighborhood — known for citrus groves, upscale homes, and proximity to Biltmore. No public transit means a car is essential for grove tours, shopping, or Camelback hikes. With ItWhip, get a car delivered to your home or boutique hotel.\n\nPerfect for citrus picking at local farms, Biltmore Fashion Park shopping, or hiking nearby trails. Locals offer convertibles for grove drives and luxury for upscale outings.\n\nDriving tip: Arcadia streets are residential and narrow — watch for cyclists and pedestrians. Camelback Road has speed cameras.',
    airport: 'PHX',
    landmarks: ['Arcadia Citrus Groves', 'Biltmore Fashion Park', 'Camelback Mountain', 'Arizona Biltmore Resort', 'Wrigley Mansion', 'Piestewa Peak', 'Echo Canyon Trail'],
    popularRoutes: ['PHX to Arcadia (20 min)', 'Arcadia to Biltmore (5 min)', 'Arcadia to Old Town Scottsdale (10 min)', 'Arcadia to South Mountain (15 min)'],
    whyRent: ['No transit in upscale neighborhoods', 'Free delivery for grove tours', 'Perfect for Biltmore shopping', 'Convertibles for citrus drives'],
    faqs: [
      { question: 'Delivery to Arcadia groves?', answer: 'Yes — free to farms and estates.' },
      { question: 'Best car for Biltmore?', answer: 'Luxury sedans — valet parking available.' },
      { question: 'Parking at Camelback?', answer: 'Limited trailhead spots — arrive early.' },
      { question: 'Drive time to PHX?', answer: '20 minutes — easy airport access.' },
      { question: 'Neighborhood tips?', answer: 'Residential speeds 25 mph — quiet streets.' }
    ],
    coordinates: { lat: 33.5014, lng: -111.9778 },
    nearbyLocations: ['Phoenix', 'Biltmore', 'Camelback', 'Paradise Valley', 'Scottsdale'],
    searchTerms: ['arcadia car rental', 'arcadia citrus car rental', 'biltmore arcadia car rental', 'camelback arcadia car rental', 'arcadia phoenix car rental']
  },
  'papago-park': {
    slug: 'papago-park',
    name: 'Papago Park',
    type: 'tourism',
    metaTitle: 'Papago Park Car Rentals from $40/day – Hikes & Zoo | ItWhip',
    metaDescription: 'Rent cars near Papago Park in Tempe/Phoenix. Free delivery for Hole-in-the-Rock hikes, Desert Botanical Garden, or zoo visits.',
    h1: 'Car Rentals Near Papago Park – Hikes & Desert Adventures',
    heroSubtitle: 'Delivered to your trail or garden — free',
    description: 'Papago Park is Phoenix\'s urban oasis — a 1,500-acre preserve with red buttes, Hole-in-the-Rock, and the Desert Botanical Garden. No transit reaches the trails, and a car is essential for park exploration or zoo visits. With ItWhip, get a car delivered to your parking lot or nearby hotel.\n\nPerfect for Hole-in-the-Rock sunset hikes, botanical garden tours, or Phoenix Zoo outings. Locals offer SUVs for dirt paths and sedans for park loops.\n\nDriving tip: Papago Park roads are looped and scenic — always yield to cyclists. Parking fills fast at Hole-in-the-Rock; use overflow lots.',
    airport: 'PHX',
    landmarks: ['Hole-in-the-Rock', 'Desert Botanical Garden', 'Phoenix Zoo', 'Papago Golf Course', 'Hunt\'s Tomb', 'Tempe Papago Park', 'Buttes Resort'],
    popularRoutes: ['PHX to Papago (15 min)', 'Papago to Tempe Town Lake (5 min)', 'Papago to Scottsdale (10 min)', 'Hole-in-the-Rock to Zoo (5 min)'],
    whyRent: ['No transit to park trails', 'Free delivery for sunrise hikes', 'Perfect for zoo and garden visits', 'Convertibles for desert drives'],
    faqs: [
      { question: 'Delivery to Papago Park?', answer: 'Yes — free to parking lots and trailheads.' },
      { question: 'Best car for Hole-in-the-Rock?', answer: 'SUVs — short dirt road to the base.' },
      { question: 'Parking at Desert Botanical Garden?', answer: 'Free but busy — arrive early for events.' },
      { question: 'Drive time from PHX?', answer: '15 minutes — quick for airport arrivals.' },
      { question: 'Park tips?', answer: 'Carry water; trails are short but hot in summer.' }
    ],
    coordinates: { lat: 33.4606, lng: -111.9475 },
    nearbyLocations: ['Phoenix', 'Tempe', 'Scottsdale', 'Papago Buttes', 'Zoo'],
    searchTerms: ['papago park car rental', 'hole in the rock car rental', 'desert botanical garden car rental', 'phoenix zoo car rental', 'papago park hikes car rental']
  },
  'lake-pleasant': {
    slug: 'lake-pleasant',
    name: 'Lake Pleasant',
    type: 'tourism',
    metaTitle: 'Lake Pleasant Car Rentals from $50/day – Boating & Camping | ItWhip',
    metaDescription: 'Rent trucks and SUVs near Lake Pleasant in Peoria. Free delivery for boating, camping, or hiking in the regional park.',
    h1: 'Car Rentals Near Lake Pleasant – Boating & Camping',
    heroSubtitle: 'Delivered to your marina or campsite — free',
    description: 'Lake Pleasant is Arizona\'s premier boating and camping spot — a 10,000-acre reservoir with marinas, beaches, and hiking trails. No transit reaches the lake, and a car is essential for towing boats or carrying gear. With ItWhip, get a truck or SUV delivered to your slip or campground.\n\nPerfect for weekend boating, fishing at Scorpion Bay, or camping at Roadrunner Campground. Locals offer towing-capable vehicles for lake days.\n\nDriving tip: Lake Pleasant Parkway gets busy on weekends — leave early for boat launches. Always check water levels for safe boating.',
    airport: 'PHX',
    landmarks: ['Lake Pleasant Regional Park', 'Scorpion Bay Marina', 'Roadrunner Campground', 'Desert Tortoise Campground', 'Humbug Cove', 'Pleasant Harbor Marina', 'Firebird Motorsports Park'],
    popularRoutes: ['PHX to Lake Pleasant (45 min)', 'Peoria to Lake Pleasant (20 min)', 'Lake Pleasant to Glendale (30 min)', 'Marina to Humbug Cove (10 min boat)'],
    whyRent: ['No transit to the lake', 'Free delivery for boating trips', 'Perfect for camping and fishing', 'Trucks for towing boats'],
    faqs: [
      { question: 'Delivery to Lake Pleasant marinas?', answer: 'Yes — free to Scorpion Bay or Pleasant Harbor slips.' },
      { question: 'Best car for boating?', answer: 'Trucks with tow hitches — many hosts offer them.' },
      { question: 'Parking at the lake?', answer: 'Fees $7/car; arrive early for weekends.' },
      { question: 'Drive time from Peoria?', answer: '20 minutes north — scenic but winding.' },
      { question: 'Boating tips?', answer: 'Check AZ Game & Fish for water levels — droughts can close ramps.' }
    ],
    coordinates: { lat: 33.8642, lng: -112.2679 },
    nearbyLocations: ['Peoria', 'Glendale', 'Surprise', 'Phoenix', 'Sun City'],
    searchTerms: ['lake pleasant car rental', 'scorpion bay car rental', 'lake pleasant boating car rental', 'lake pleasant camping car rental', 'lake pleasant truck rental']
  },
  'sedona-village': {
    slug: 'sedona-village',
    name: 'Sedona Village',
    type: 'tourism',
    metaTitle: 'Sedona Village Car Rentals from $65/day – Uptown & Vortexes | ItWhip',
    metaDescription: 'Rent Jeeps and convertibles in Sedona Village. Free delivery for Uptown shopping, vortex tours, or red rock drives.',
    h1: 'Car Rentals in Sedona Village – Uptown & Vortex Adventures',
    heroSubtitle: 'Delivered to your gallery or vortex — free',
    description: 'Sedona Village is the beating heart of Sedona — Uptown\'s shops, galleries, and eateries surrounded by red rock vortexes and trails. No transit means a car is essential for gallery hopping or driving to Airport Mesa vortex. With ItWhip, get a Jeep or convertible delivered to your Uptown hotel or trail parking.\n\nPerfect for vortex meditations, Tlaquepaque art walks, or Uptown dining. Locals know the best off-road vehicles for red rock access.\n\nDriving tip: Uptown parking is limited and paid — use lots or park south and walk. Vortex roads like Schnebly Hill are rough; 4WD recommended.',
    airport: 'PHX',
    landmarks: ['Tlaquepaque Arts Village', 'Airport Mesa Vortex', 'Uptown Sedona', 'Chapel of the Holy Dove', 'Sedona Heritage Museum', 'Sedona Arts Center', 'Crescent Moon Ranch'],
    popularRoutes: ['PHX to Sedona Village (2 hrs)', 'Uptown to Airport Mesa (10 min)', 'Sedona to Jerome (30 min)', 'Uptown to Bell Rock (15 min)'],
    whyRent: ['No transit to vortex sites', 'Free delivery for Uptown tours', 'Perfect for gallery hopping', 'Convertibles for red rock drives'],
    faqs: [
      { question: 'Delivery to Uptown hotels?', answer: 'Yes — free to galleries, shops, or your lodge.' },
      { question: 'Best car for vortex tours?', answer: 'Jeeps for rough roads to Airport Mesa or Bell Rock.' },
      { question: 'Parking in Uptown?', answer: 'Paid lots $3/hour; free after 5 PM on weekdays.' },
      { question: 'Drive time to Jerome?', answer: '30 minutes — scenic but winding highway.' },
      { question: 'Vortex tips?', answer: 'Always stay on trails; carry water for hikes.' }
    ],
    coordinates: { lat: 34.8697, lng: -111.7609 },
    nearbyLocations: ['Sedona', 'Oak Creek Canyon', 'Jerome', 'Cottonwood', 'Flagstaff'],
    searchTerms: ['sedona village car rental', 'uptown sedona car rental', 'sedona vortex car rental', 'tlaquepaque car rental', 'sedona arts car rental']
  },
  'westgate': {
    slug: 'westgate',
    name: 'Westgate',
    type: 'tourism',
    metaTitle: 'Westgate Car Rentals from $42/day – Glendale Events | ItWhip',
    metaDescription: 'Rent cars near Westgate Entertainment District in Glendale. Free delivery for concerts, shopping, or Cardinals games.',
    h1: 'Car Rentals Near Westgate – Events & Shopping',
    heroSubtitle: 'Delivered to your concert or mall — free',
    description: 'Westgate is the entertainment epicenter of Glendale — a massive district with shops, restaurants, bars, and events next to State Farm Stadium. No transit means a car is essential for game days or mall runs. With ItWhip, get a car delivered to your parking spot or hotel.\n\nPerfect for Cardinals tailgates, concerts at Desert Diamond Arena, or shopping at Tanger Outlets. Locals offer trucks for events and sedans for daily needs.\n\nDriving tip: Westgate parking is chaotic during events — arrive 2 hours early. Use the 101 Loop to avoid I-17 backups.',
    airport: 'PHX',
    landmarks: ['Westgate Entertainment District', 'Tanger Outlets', 'Desert Diamond Arena', 'State Farm Stadium', 'Fountain Park', 'Gila River Arena', 'Historic Downtown Glendale'],
    popularRoutes: ['PHX to Westgate (30 min)', 'Westgate to Lake Pleasant (30 min)', 'Westgate to Peoria (15 min)', 'Westgate to Glendale Historic District (5 min)'],
    whyRent: ['No transit to Westgate events', 'Free delivery for concerts and games', 'Perfect for Tanger shopping', 'Convertibles for West Valley drives'],
    faqs: [
      { question: 'Delivery to Westgate?', answer: 'Yes — free to parking lots for events.' },
      { question: 'Best car for Cardinals games?', answer: 'Trucks and SUVs for tailgating — many hosts nearby.' },
      { question: 'Parking at Tanger Outlets?', answer: 'Free and plentiful — busy on weekends.' },
      { question: 'Drive time to Lake Pleasant?', answer: '30 minutes north — great for post-event outings.' },
      { question: 'Event traffic tips?', answer: 'Loop 101 clogs — use side streets or arrive very early.' }
    ],
    coordinates: { lat: 33.5346, lng: -112.2613 },
    nearbyLocations: ['Glendale', 'Peoria', 'Surprise', 'Phoenix', 'Lake Pleasant'],
    searchTerms: ['westgate car rental', 'westgate entertainment car rental', 'desert diamond arena car rental', 'tanger outlets car rental', 'westgate glendale car rental']
  },
  'talking-stick': {
    slug: 'talking-stick',
    name: 'Talking Stick',
    type: 'tourism',
    metaTitle: 'Talking Stick Car Rentals from $50/day – Casino & Golf | ItWhip',
    metaDescription: 'Rent cars near Talking Stick Resort in Scottsdale. Free delivery for casino, golf, or Salt River tubing.',
    h1: 'Car Rentals Near Talking Stick – Casino & Golf',
    heroSubtitle: 'Delivered to your resort or course — free',
    description: 'Talking Stick District is Scottsdale\'s entertainment and golf mecca — home to Talking Stick Resort & Casino, Salt River Fields (spring training), and premier courses. No transit means a car is essential for casino nights or tee times. With ItWhip, get a car delivered to your resort or clubhouse.\n\nPerfect for casino gaming, Diamondbacks/Rockies spring training, or golf at Talking Stick Golf Club. Locals offer luxury for evenings and SUVs for outings.\n\nDriving tip: Talking Stick Way gets crowded during events — use the 101 Loop. Parking at the casino is free but valet for convenience.',
    airport: 'PHX',
    landmarks: ['Talking Stick Resort & Casino', 'Salt River Fields at Talking Stick', 'Talking Stick Golf Club', 'Pavilion Lakes Golf', 'OdySea Aquarium', 'Butterfly Wonderland', 'Salt River Tubing'],
    popularRoutes: ['PHX to Talking Stick (25 min)', 'Talking Stick to Old Town Scottsdale (10 min)', 'Talking Stick to Salt River Tubing (5 min)', 'Casino to Golf Club (5 min)'],
    whyRent: ['No transit to casino and golf', 'Free delivery for spring training', 'Perfect for tubing and aquarium trips', 'Convertibles for Salt River drives'],
    faqs: [
      { question: 'Delivery to Talking Stick Resort?', answer: 'Yes — free to casino valet or hotel entrance.' },
      { question: 'Best car for golf?', answer: 'Luxury SUVs — room for clubs and gear.' },
      { question: 'Parking at Salt River Fields?', answer: 'Free for spring training — arrive early.' },
      { question: 'Drive time to tubing?', answer: '5 minutes east — rent a truck for floats.' },
      { question: 'Casino tips?', answer: 'Valet parking free with validation — busy on weekends.' }
    ],
    coordinates: { lat: 33.5615, lng: -111.8882 },
    nearbyLocations: ['Scottsdale', 'Salt River Pima-Maricopa', 'Fountain Hills', 'Phoenix', 'Tempe'],
    searchTerms: ['talking stick car rental', 'talking stick resort car rental', 'salt river fields car rental', 'talking stick golf car rental', 'salt river tubing car rental']
  }
}

// Helper functions
export function getCitySeoData(slug: string): CitySeoData | null {
  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-')
  return CITY_SEO_DATA[normalizedSlug] || null
}

export function getAllCitySlugs(): string[] {
  return Object.keys(CITY_SEO_DATA)
}

export function getCitiesByType(type: CitySeoData['type']): CitySeoData[] {
  return Object.values(CITY_SEO_DATA).filter(city => city.type === type)
}

export function getNearbyCities(slug: string): CitySeoData[] {
  const city = getCitySeoData(slug)
  if (!city) return []
  return city.nearbyLocations
    .map(name => getCitySeoData(name.toLowerCase().replace(/\s+/g, '-')))
    .filter((c): c is CitySeoData => c !== null)
}

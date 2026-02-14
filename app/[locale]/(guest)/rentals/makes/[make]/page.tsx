// app/(guest)/rentals/makes/[make]/page.tsx
import { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { generateCarUrl } from '@/app/lib/utils/urls'
import {
  IoCarOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'
import { getAlternateLanguages, getCanonicalUrl, getOgLocale } from '@/app/lib/seo/alternates'

// ISR - Revalidate every 60 seconds
export const revalidate = 60

// ============================================
// CAR MAKE SEO DATA
// ============================================
const CAR_MAKE_SEO_DATA: Record<string, {
  displayName: string
  dbValue: string
  description: string
  longDescription: string
  country: string
  founded: string
  keywords: string[]
  popularModels: string[]
  knownFor: string[]
  priceRange: string
}> = {
  'tesla': {
    displayName: 'Tesla',
    dbValue: 'Tesla',
    description: 'Tesla rentals in Phoenix, AZ. Experience Model 3, Model Y, Model S, and Model X electric vehicles. Zero emissions, instant torque, Autopilot included.',
    longDescription: 'Experience the future of driving with a Tesla rental from ItWhip. Our Tesla fleet includes the sporty Model 3, versatile Model Y, luxurious Model S, and spacious Model X. Enjoy instant torque, zero emissions, and access to Arizona\'s Supercharger network.',
    country: 'USA',
    founded: '2003',
    keywords: ['tesla rental phoenix', 'model 3 rental arizona', 'model y rental phoenix', 'electric car rental phoenix', 'tesla model s rental'],
    popularModels: ['Model 3', 'Model Y', 'Model S', 'Model X'],
    knownFor: ['Electric vehicles', 'Autopilot', 'Over-the-air updates', 'Supercharger network', 'Instant torque'],
    priceRange: '$80-250/day'
  },
  'bmw': {
    displayName: 'BMW',
    dbValue: 'BMW',
    description: 'BMW rentals in Phoenix, AZ. Drive the Ultimate Driving Machine. From the 3 Series to X5, experience German engineering excellence.',
    longDescription: 'The Ultimate Driving Machine awaits. Our BMW rental collection spans from the agile 3 Series sedan to the commanding X5 SUV. Experience precision German engineering, luxurious interiors, and the legendary BMW driving dynamics on Arizona\'s roads.',
    country: 'Germany',
    founded: '1916',
    keywords: ['bmw rental phoenix', 'bmw 3 series rental arizona', 'bmw x5 rental phoenix', 'luxury german car rental', 'bmw rental scottsdale'],
    popularModels: ['3 Series', '5 Series', 'X3', 'X5', 'M4'],
    knownFor: ['Driving dynamics', 'Luxury interiors', 'German engineering', 'Performance', 'Technology'],
    priceRange: '$90-350/day'
  },
  'mercedes': {
    displayName: 'Mercedes-Benz',
    dbValue: 'Mercedes-Benz',
    description: 'Mercedes-Benz rentals in Phoenix, AZ. Experience luxury and innovation with C-Class, E-Class, S-Class, and GLE models.',
    longDescription: 'Experience "The Best or Nothing" with a Mercedes-Benz rental. From the elegant C-Class to the flagship S-Class, our Mercedes collection delivers unmatched luxury, cutting-edge technology, and timeless German craftsmanship for your Arizona journey.',
    country: 'Germany',
    founded: '1926',
    keywords: ['mercedes rental phoenix', 'mercedes benz rental arizona', 'c class rental phoenix', 's class rental scottsdale', 'luxury car rental phoenix'],
    popularModels: ['C-Class', 'E-Class', 'S-Class', 'GLE', 'AMG GT'],
    knownFor: ['Luxury', 'Innovation', 'Safety', 'Comfort', 'Prestige'],
    priceRange: '$100-500/day'
  },
  'porsche': {
    displayName: 'Porsche',
    dbValue: 'Porsche',
    description: 'Porsche rentals in Phoenix, AZ. Feel the thrill of a 911, Cayenne, or Taycan. Pure driving excitement in the Arizona desert.',
    longDescription: 'There is no substitute. Rent a Porsche and experience automotive perfection on Arizona\'s scenic roads. From the iconic 911 to the versatile Cayenne and revolutionary Taycan, every Porsche delivers an unforgettable driving experience.',
    country: 'Germany',
    founded: '1931',
    keywords: ['porsche rental phoenix', 'porsche 911 rental arizona', 'cayenne rental phoenix', 'taycan rental scottsdale', 'exotic car rental phoenix'],
    popularModels: ['911', 'Cayenne', 'Macan', 'Taycan', 'Panamera'],
    knownFor: ['Performance', 'Racing heritage', 'Engineering', 'Design', 'Driving experience'],
    priceRange: '$200-800/day'
  },
  'lamborghini': {
    displayName: 'Lamborghini',
    dbValue: 'Lamborghini',
    description: 'Lamborghini rentals in Phoenix, AZ. Turn heads in a Huracán or Urus. Italian exotic supercar experience in Arizona.',
    longDescription: 'Make a statement with a Lamborghini rental. Our Italian exotic collection features the stunning Huracán and the powerful Urus SUV. Experience head-turning style, thunderous V10 and V8 power, and the thrill of driving an automotive icon.',
    country: 'Italy',
    founded: '1963',
    keywords: ['lamborghini rental phoenix', 'huracan rental arizona', 'urus rental phoenix', 'exotic car rental scottsdale', 'supercar rental phoenix'],
    popularModels: ['Huracán', 'Urus', 'Aventador'],
    knownFor: ['Exotic styling', 'V10/V12 engines', 'Italian craftsmanship', 'Head-turning presence', 'Supercar performance'],
    priceRange: '$800-2000/day'
  },
  'audi': {
    displayName: 'Audi',
    dbValue: 'Audi',
    description: 'Audi rentals in Phoenix, AZ. Vorsprung durch Technik. From A4 to Q7, experience quattro all-wheel drive and German luxury.',
    longDescription: 'Advancement through technology. Our Audi rental fleet showcases German innovation from the sporty A4 to the spacious Q7 SUV. Experience legendary quattro all-wheel drive, virtual cockpit displays, and refined luxury throughout your Arizona travels.',
    country: 'Germany',
    founded: '1909',
    keywords: ['audi rental phoenix', 'audi a4 rental arizona', 'audi q7 rental phoenix', 'quattro rental scottsdale', 'german luxury car rental'],
    popularModels: ['A4', 'A6', 'Q5', 'Q7', 'RS6'],
    knownFor: ['Quattro AWD', 'Virtual Cockpit', 'Build quality', 'Technology', 'Understated luxury'],
    priceRange: '$85-300/day'
  },
  'lexus': {
    displayName: 'Lexus',
    dbValue: 'Lexus',
    description: 'Lexus rentals in Phoenix, AZ. Japanese luxury and reliability. From ES to RX, experience refined comfort and legendary dependability.',
    longDescription: 'Experience the pursuit of perfection. Our Lexus rental collection combines Japanese reliability with world-class luxury. From the smooth ES sedan to the popular RX crossover, enjoy whisper-quiet rides and legendary dependability across Arizona.',
    country: 'Japan',
    founded: '1989',
    keywords: ['lexus rental phoenix', 'lexus es rental arizona', 'lexus rx rental phoenix', 'japanese luxury car rental', 'reliable luxury car rental'],
    popularModels: ['ES', 'IS', 'RX', 'GX', 'LC'],
    knownFor: ['Reliability', 'Quiet comfort', 'Build quality', 'Hybrid technology', 'Customer service'],
    priceRange: '$80-250/day'
  },
  'dodge': {
    displayName: 'Dodge',
    dbValue: 'Dodge',
    description: 'Dodge rentals in Phoenix, AZ. Experience American muscle with Challenger, Charger, and Durango. Hellcat and SRT models available for the ultimate thrill.',
    longDescription: 'Unleash American muscle on Arizona roads. Our Dodge rental fleet features the iconic Challenger and Charger, including earth-shaking Hellcat and SRT variants. From the rumble of a V8 to the practicality of the Durango SUV, experience raw American performance.',
    country: 'USA',
    founded: '1900',
    keywords: ['dodge rental phoenix', 'challenger rental arizona', 'charger rental phoenix', 'hellcat rental phoenix', 'challenger rental scottsdale', 'muscle car rental arizona', 'srt rental phoenix', 'dodge charger hellcat rental'],
    popularModels: ['Challenger', 'Challenger SRT', 'Challenger Hellcat', 'Charger', 'Charger SRT', 'Charger Hellcat', 'Durango'],
    knownFor: ['American muscle', 'V8 power', 'Hellcat supercharged engines', 'Bold styling', 'Raw performance'],
    priceRange: '$80-400/day'
  },
  'toyota': {
    displayName: 'Toyota',
    dbValue: 'Toyota',
    description: 'Toyota rentals in Phoenix, AZ. Experience legendary reliability with Camry, RAV4, Highlander, and more. Perfect for Arizona road trips.',
    longDescription: 'Drive with confidence in a Toyota rental. Known worldwide for unmatched reliability and value, our Toyota fleet includes the best-selling Camry, versatile RAV4, family-friendly Highlander, and rugged 4Runner for desert adventures.',
    country: 'Japan',
    founded: '1937',
    keywords: ['toyota rental phoenix', 'camry rental arizona', 'rav4 rental phoenix', 'highlander rental scottsdale', 'reliable car rental phoenix'],
    popularModels: ['Camry', 'RAV4', 'Highlander', '4Runner', 'Corolla'],
    knownFor: ['Reliability', 'Fuel efficiency', 'Resale value', 'Safety features', 'Low maintenance'],
    priceRange: '$45-120/day'
  },
  'honda': {
    displayName: 'Honda',
    dbValue: 'Honda',
    description: 'Honda rentals in Phoenix, AZ. Reliable and efficient vehicles including Civic, Accord, CR-V, and Pilot. Trusted for Arizona travel.',
    longDescription: 'Count on Honda for your Arizona journey. Our Honda rental selection features the sporty Civic, refined Accord sedan, popular CR-V crossover, and spacious Pilot SUV. Enjoy excellent fuel economy and Honda\'s legendary dependability.',
    country: 'Japan',
    founded: '1948',
    keywords: ['honda rental phoenix', 'civic rental arizona', 'accord rental phoenix', 'crv rental scottsdale', 'reliable car rental arizona'],
    popularModels: ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V'],
    knownFor: ['Reliability', 'Efficiency', 'Build quality', 'Value retention', 'Low cost of ownership'],
    priceRange: '$40-110/day'
  },
  'ford': {
    displayName: 'Ford',
    dbValue: 'Ford',
    description: 'Ford rentals in Phoenix, AZ. American innovation with Mustang, F-150, Explorer, and Bronco. Built Ford Tough for Arizona adventures.',
    longDescription: 'Experience American innovation with a Ford rental. From the iconic Mustang to the capable F-150 and adventurous Bronco, our Ford fleet delivers power, capability, and style for any Arizona excursion.',
    country: 'USA',
    founded: '1903',
    keywords: ['ford rental phoenix', 'mustang rental arizona', 'f150 rental phoenix', 'bronco rental scottsdale', 'truck rental arizona'],
    popularModels: ['Mustang', 'F-150', 'Explorer', 'Bronco', 'Edge'],
    knownFor: ['American heritage', 'Truck capability', 'Mustang performance', 'Innovation', 'Durability'],
    priceRange: '$50-200/day'
  },
  'chevrolet': {
    displayName: 'Chevrolet',
    dbValue: 'Chevrolet',
    description: 'Chevrolet rentals in Phoenix, AZ. From Corvette to Tahoe, experience American performance and versatility. Find your perfect Chevy rental.',
    longDescription: 'Find your perfect match in our Chevrolet lineup. Choose the legendary Corvette for thrilling drives, the powerful Silverado for work or play, or the spacious Tahoe for family adventures across Arizona.',
    country: 'USA',
    founded: '1911',
    keywords: ['chevrolet rental phoenix', 'chevy rental arizona', 'corvette rental phoenix', 'tahoe rental scottsdale', 'silverado rental arizona'],
    popularModels: ['Corvette', 'Silverado', 'Tahoe', 'Equinox', 'Camaro'],
    knownFor: ['American performance', 'Truck capability', 'Corvette sports car', 'Family SUVs', 'Value'],
    priceRange: '$50-350/day'
  },
  'jeep': {
    displayName: 'Jeep',
    dbValue: 'Jeep',
    description: 'Jeep rentals in Phoenix, AZ. Adventure awaits with Wrangler, Grand Cherokee, and Gladiator. Perfect for Arizona trails and desert exploration.',
    longDescription: 'Go anywhere with a Jeep rental. Our fleet includes the iconic Wrangler for off-road adventures, the refined Grand Cherokee for luxury and capability, and the versatile Gladiator truck. Arizona\'s trails are calling.',
    country: 'USA',
    founded: '1941',
    keywords: ['jeep rental phoenix', 'wrangler rental arizona', 'grand cherokee rental phoenix', 'gladiator rental scottsdale', 'off road rental arizona'],
    popularModels: ['Wrangler', 'Grand Cherokee', 'Gladiator', 'Cherokee', 'Compass'],
    knownFor: ['Off-road capability', '4x4 systems', 'Wrangler heritage', 'Adventure ready', 'Trail rated'],
    priceRange: '$70-180/day'
  },
  'nissan': {
    displayName: 'Nissan',
    dbValue: 'Nissan',
    description: 'Nissan rentals in Phoenix, AZ. Innovation that excites with Altima, Rogue, Pathfinder, and GT-R. Quality Japanese vehicles for Arizona roads.',
    longDescription: 'Experience innovation that excites with a Nissan rental. From the practical Altima sedan to the adventurous Pathfinder and legendary GT-R supercar, Nissan delivers quality and excitement for your Arizona travels.',
    country: 'Japan',
    founded: '1933',
    keywords: ['nissan rental phoenix', 'altima rental arizona', 'rogue rental phoenix', 'pathfinder rental scottsdale', 'gtr rental arizona'],
    popularModels: ['Altima', 'Rogue', 'Pathfinder', 'GT-R', 'Frontier'],
    knownFor: ['Innovation', 'Value', 'ProPilot technology', 'Reliability', 'GT-R performance'],
    priceRange: '$45-500/day'
  },
  'hyundai': {
    displayName: 'Hyundai',
    dbValue: 'Hyundai',
    description: 'Hyundai rentals in Phoenix, AZ. Modern design and value with Sonata, Tucson, Palisade, and more. Award-winning Korean vehicles.',
    longDescription: 'Discover modern design and exceptional value with a Hyundai rental. Our fleet showcases the stylish Sonata, versatile Tucson, and premium Palisade SUV. Enjoy Hyundai\'s industry-leading warranty and features.',
    country: 'South Korea',
    founded: '1967',
    keywords: ['hyundai rental phoenix', 'sonata rental arizona', 'tucson rental phoenix', 'palisade rental scottsdale', 'affordable car rental arizona'],
    popularModels: ['Sonata', 'Tucson', 'Palisade', 'Santa Fe', 'Elantra'],
    knownFor: ['Value', 'Design', 'Warranty', 'Technology', 'Fuel efficiency'],
    priceRange: '$40-100/day'
  },
  'kia': {
    displayName: 'Kia',
    dbValue: 'Kia',
    description: 'Kia rentals in Phoenix, AZ. Stylish and reliable vehicles including Telluride, Sportage, and K5. Movement that inspires.',
    longDescription: 'Experience movement that inspires with a Kia rental. The award-winning Telluride offers premium SUV comfort, while the Sportage and K5 deliver style and efficiency for Arizona\'s roads.',
    country: 'South Korea',
    founded: '1944',
    keywords: ['kia rental phoenix', 'telluride rental arizona', 'sportage rental phoenix', 'k5 rental scottsdale', 'affordable suv rental arizona'],
    popularModels: ['Telluride', 'Sportage', 'K5', 'Sorento', 'Carnival'],
    knownFor: ['Design awards', 'Value', 'Telluride SUV', 'Long warranty', 'Modern features'],
    priceRange: '$40-110/day'
  },
  'subaru': {
    displayName: 'Subaru',
    dbValue: 'Subaru',
    description: 'Subaru rentals in Phoenix, AZ. All-wheel drive standard with Outback, Forester, and WRX. Perfect for outdoor adventures in Arizona.',
    longDescription: 'Adventure awaits with Subaru\'s legendary all-wheel drive. Our fleet includes the versatile Outback, practical Forester, and sporty WRX. Perfect for exploring Arizona\'s diverse terrain in any weather.',
    country: 'Japan',
    founded: '1953',
    keywords: ['subaru rental phoenix', 'outback rental arizona', 'forester rental phoenix', 'wrx rental scottsdale', 'awd rental arizona'],
    popularModels: ['Outback', 'Forester', 'Crosstrek', 'WRX', 'Ascent'],
    knownFor: ['Standard AWD', 'Safety ratings', 'Reliability', 'Outdoor lifestyle', 'Boxer engines'],
    priceRange: '$55-150/day'
  },
  'mazda': {
    displayName: 'Mazda',
    dbValue: 'Mazda',
    description: 'Mazda rentals in Phoenix, AZ. Driving passion with Mazda3, CX-5, and MX-5 Miata. Japanese craftsmanship meets driving excitement.',
    longDescription: 'Feel the joy of driving with a Mazda rental. Known for exceptional handling and premium interiors at competitive prices, our Mazda fleet includes the sporty Mazda3, versatile CX-5, and iconic MX-5 Miata roadster.',
    country: 'Japan',
    founded: '1920',
    keywords: ['mazda rental phoenix', 'mazda3 rental arizona', 'cx5 rental phoenix', 'miata rental scottsdale', 'fun car rental arizona'],
    popularModels: ['Mazda3', 'CX-5', 'CX-9', 'MX-5 Miata', 'CX-30'],
    knownFor: ['Driving dynamics', 'Premium feel', 'Kodo design', 'Reliability', 'Value'],
    priceRange: '$45-120/day'
  },
  'volkswagen': {
    displayName: 'Volkswagen',
    dbValue: 'Volkswagen',
    description: 'Volkswagen rentals in Phoenix, AZ. German engineering for everyone with Golf, Jetta, Tiguan, and Atlas. Das Auto awaits.',
    longDescription: 'Experience German engineering for everyone with a Volkswagen rental. From the iconic Golf hatchback to the spacious Atlas SUV, VW delivers quality, comfort, and driving enjoyment for Arizona roads.',
    country: 'Germany',
    founded: '1937',
    keywords: ['volkswagen rental phoenix', 'vw rental arizona', 'golf rental phoenix', 'atlas rental scottsdale', 'german car rental arizona'],
    popularModels: ['Golf', 'Jetta', 'Tiguan', 'Atlas', 'ID.4'],
    knownFor: ['German engineering', 'Build quality', 'Driving feel', 'Practicality', 'Value'],
    priceRange: '$50-130/day'
  },
  'cadillac': {
    displayName: 'Cadillac',
    dbValue: 'Cadillac',
    description: 'Cadillac rentals in Phoenix, AZ. American luxury with Escalade, CT5, and Lyriq. Bold design meets premium comfort.',
    longDescription: 'Experience American luxury redefined with a Cadillac rental. Our fleet features the commanding Escalade SUV, stylish CT5 sedan, and innovative Lyriq EV. Bold design and cutting-edge technology await.',
    country: 'USA',
    founded: '1902',
    keywords: ['cadillac rental phoenix', 'escalade rental arizona', 'ct5 rental phoenix', 'luxury suv rental scottsdale', 'american luxury rental arizona'],
    popularModels: ['Escalade', 'CT5', 'Lyriq', 'XT5', 'XT6'],
    knownFor: ['American luxury', 'Escalade prestige', 'Bold styling', 'Super Cruise', 'Comfort'],
    priceRange: '$90-400/day'
  },
  'genesis': {
    displayName: 'Genesis',
    dbValue: 'Genesis',
    description: 'Genesis rentals in Phoenix, AZ. Korean luxury reimagined with G70, G80, and GV80. Athletic elegance and premium features.',
    longDescription: 'Discover Korean luxury excellence with a Genesis rental. Our fleet showcases the sporty G70, executive G80, and premium GV80 SUV. Experience athletic elegance and an industry-leading suite of standard features.',
    country: 'South Korea',
    founded: '2015',
    keywords: ['genesis rental phoenix', 'g80 rental arizona', 'gv80 rental phoenix', 'luxury korean car rental scottsdale', 'premium car rental arizona'],
    popularModels: ['G70', 'G80', 'G90', 'GV70', 'GV80'],
    knownFor: ['Value luxury', 'Design', 'Standard features', 'Warranty', 'Service'],
    priceRange: '$80-200/day'
  },
  'volvo': {
    displayName: 'Volvo',
    dbValue: 'Volvo',
    description: 'Volvo rentals in Phoenix, AZ. Scandinavian safety and style with XC40, XC60, and XC90. Safe and sophisticated travel.',
    longDescription: 'Travel safely and stylishly with a Volvo rental. Known for pioneering safety innovations, our Volvo fleet includes the compact XC40, versatile XC60, and luxurious XC90. Scandinavian design meets world-class protection.',
    country: 'Sweden',
    founded: '1927',
    keywords: ['volvo rental phoenix', 'xc90 rental arizona', 'xc60 rental phoenix', 'safe car rental scottsdale', 'scandinavian car rental arizona'],
    popularModels: ['XC40', 'XC60', 'XC90', 'S60', 'V60'],
    knownFor: ['Safety leadership', 'Scandinavian design', 'Comfort', 'Electrification', 'Quality'],
    priceRange: '$70-180/day'
  },
  'land-rover': {
    displayName: 'Land Rover',
    dbValue: 'Land Rover',
    description: 'Land Rover rentals in Phoenix, AZ. Luxury off-road capability with Range Rover, Defender, and Discovery. Go beyond.',
    longDescription: 'Go beyond ordinary with a Land Rover rental. Experience the ultimate combination of luxury and off-road capability. From the iconic Range Rover to the rugged Defender, conquer Arizona\'s terrain in style.',
    country: 'UK',
    founded: '1948',
    keywords: ['land rover rental phoenix', 'range rover rental arizona', 'defender rental phoenix', 'luxury suv rental scottsdale', 'off road luxury rental arizona'],
    popularModels: ['Range Rover', 'Range Rover Sport', 'Defender', 'Discovery', 'Evoque'],
    knownFor: ['Luxury off-road', 'British heritage', 'Capability', 'Prestige', 'Adventure'],
    priceRange: '$150-600/day'
  },
  'ferrari': {
    displayName: 'Ferrari',
    dbValue: 'Ferrari',
    description: 'Ferrari rentals in Phoenix, AZ. Italian supercar excellence with 488, SF90, and Roma. Prancing horse dreams realized.',
    longDescription: 'Live your supercar dream with a Ferrari rental. Experience the legendary Italian marque\'s passion for performance. Feel the thrill of a prancing horse on Arizona\'s scenic roads.',
    country: 'Italy',
    founded: '1947',
    keywords: ['ferrari rental phoenix', '488 rental arizona', 'f8 rental phoenix', 'supercar rental scottsdale', 'exotic car rental arizona'],
    popularModels: ['488', 'F8 Tributo', 'SF90', 'Roma', 'Portofino'],
    knownFor: ['Racing heritage', 'Italian passion', 'Performance', 'Exclusivity', 'Design'],
    priceRange: '$1000-3000/day'
  },
  'mclaren': {
    displayName: 'McLaren',
    dbValue: 'McLaren',
    description: 'McLaren rentals in Phoenix, AZ. British supercar engineering with 720S and Artura. F1 technology for the road.',
    longDescription: 'Experience F1 technology on the road with a McLaren rental. Born from racing, our McLaren fleet delivers breathtaking performance and cutting-edge aerodynamics for the ultimate Arizona driving experience.',
    country: 'UK',
    founded: '1963',
    keywords: ['mclaren rental phoenix', '720s rental arizona', 'artura rental phoenix', 'supercar rental scottsdale', 'exotic car rental arizona'],
    popularModels: ['720S', 'Artura', 'GT', '765LT'],
    knownFor: ['F1 heritage', 'Lightweight design', 'Performance', 'Technology', 'Exclusivity'],
    priceRange: '$1200-3500/day'
  },
  'bentley': {
    displayName: 'Bentley',
    dbValue: 'Bentley',
    description: 'Bentley rentals in Phoenix, AZ. British handcrafted luxury with Continental GT and Bentayga. Extraordinary journeys await.',
    longDescription: 'Experience extraordinary British luxury with a Bentley rental. Handcrafted perfection meets effortless power in the Continental GT and commanding Bentayga SUV. Travel in unparalleled comfort and style.',
    country: 'UK',
    founded: '1919',
    keywords: ['bentley rental phoenix', 'continental gt rental arizona', 'bentayga rental phoenix', 'ultra luxury rental scottsdale', 'exotic car rental arizona'],
    popularModels: ['Continental GT', 'Bentayga', 'Flying Spur'],
    knownFor: ['Handcrafted luxury', 'British heritage', 'Grand touring', 'Performance', 'Exclusivity'],
    priceRange: '$800-2000/day'
  },
  'rolls-royce': {
    displayName: 'Rolls-Royce',
    dbValue: 'Rolls-Royce',
    description: 'Rolls-Royce rentals in Phoenix, AZ. The pinnacle of luxury with Ghost and Cullinan. Effortless, everywhere.',
    longDescription: 'Experience automotive perfection with a Rolls-Royce rental. The pinnacle of luxury awaits with the Ghost sedan and Cullinan SUV. Effortless power, unmatched craftsmanship, and an unforgettable presence.',
    country: 'UK',
    founded: '1904',
    keywords: ['rolls royce rental phoenix', 'ghost rental arizona', 'cullinan rental phoenix', 'ultra luxury rental scottsdale', 'exotic car rental arizona'],
    popularModels: ['Ghost', 'Cullinan', 'Phantom', 'Wraith'],
    knownFor: ['Ultimate luxury', 'British craftsmanship', 'Starlight headliner', 'Bespoke options', 'Prestige'],
    priceRange: '$1500-4000/day'
  },
  'chrysler': {
    displayName: 'Chrysler',
    dbValue: 'Chrysler',
    description: 'Chrysler rentals in Phoenix, AZ. American comfort and style with 300 and Pacifica. Premium features at accessible prices.',
    longDescription: 'Experience American comfort with a Chrysler rental. Our fleet includes the bold Chrysler 300 sedan with its commanding presence, and the versatile Pacifica minivan perfect for family travel across Arizona.',
    country: 'USA',
    founded: '1925',
    keywords: ['chrysler rental phoenix', 'chrysler 300 rental arizona', 'pacifica rental phoenix', 'family car rental scottsdale', 'minivan rental arizona'],
    popularModels: ['300', 'Pacifica', 'Pacifica Hybrid'],
    knownFor: ['Bold design', 'Premium features', 'Family comfort', 'American heritage', 'Value'],
    priceRange: '$60-130/day'
  },
  'ram': {
    displayName: 'RAM',
    dbValue: 'Ram',
    description: 'RAM rentals in Phoenix, AZ. Heavy-duty capability with 1500, 2500, and 3500 trucks. Built to serve Arizona\'s toughest jobs.',
    longDescription: 'Get the job done with a RAM truck rental. Our RAM fleet offers the refined 1500 for daily driving and the powerful 2500/3500 for serious hauling. Experience class-leading towing capacity and interior comfort.',
    country: 'USA',
    founded: '2010',
    keywords: ['ram rental phoenix', 'ram 1500 rental arizona', 'ram 2500 rental phoenix', 'truck rental scottsdale', 'heavy duty truck rental arizona'],
    popularModels: ['1500', '2500', '3500', 'TRX'],
    knownFor: ['Towing capacity', 'Luxury truck interiors', 'Heavy-duty capability', 'Multifunction tailgate', 'Work-ready'],
    priceRange: '$80-250/day'
  },
  'gmc': {
    displayName: 'GMC',
    dbValue: 'GMC',
    description: 'GMC rentals in Phoenix, AZ. Professional grade trucks and SUVs with Sierra, Yukon, and Denali. Premium capability awaits.',
    longDescription: 'Experience Professional Grade with a GMC rental. Our fleet features the capable Sierra truck, spacious Yukon SUV, and luxurious Denali trims. GMC delivers premium refinement with serious capability for Arizona adventures.',
    country: 'USA',
    founded: '1911',
    keywords: ['gmc rental phoenix', 'sierra rental arizona', 'yukon rental phoenix', 'denali rental scottsdale', 'truck rental arizona'],
    popularModels: ['Sierra', 'Yukon', 'Acadia', 'Terrain', 'Hummer EV'],
    knownFor: ['Professional Grade', 'Denali luxury', 'Truck capability', 'Premium interiors', 'MultiPro tailgate'],
    priceRange: '$80-350/day'
  }
}

// No generateStaticParams — pages render on-demand via ISR (revalidate = 60)

// Slug aliases for makes with different URL formats
const MAKE_SLUG_ALIASES: Record<string, string> = {
  'mercedes-benz': 'mercedes',
}

// Generate metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; make: string }>
}): Promise<Metadata> {
  const { locale, make } = await params
  const lookupKey = MAKE_SLUG_ALIASES[make.toLowerCase()] || make.toLowerCase()
  const makeData = CAR_MAKE_SEO_DATA[lookupKey]

  if (!makeData) {
    return { title: 'Make Not Found - ItWhip' }
  }

  const title = `${makeData.displayName} Rentals in Phoenix, AZ | ItWhip`
  const description = makeData.description

  return {
    title,
    description,
    keywords: makeData.keywords,
    openGraph: {
      title,
      description,
      url: getCanonicalUrl(`/rentals/makes/${make}`, locale),
      siteName: 'ItWhip',
      locale: getOgLocale(locale),
      type: 'website',
      images: [{
        url: 'https://itwhip.com/og-default-car.jpg',
        width: 1200,
        height: 630,
        alt: `${makeData.displayName} Rentals in Phoenix`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://itwhip.com/og-default-car.jpg']
    },
    alternates: {
      canonical: getCanonicalUrl(`/rentals/makes/${make}`, locale),
      languages: getAlternateLanguages(`/rentals/makes/${make}`),
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

// Page component
export default async function CarMakePage({
  params
}: {
  params: Promise<{ make: string }>
}) {
  const { make } = await params
  // Check aliases first, then use the make directly
  const lookupKey = MAKE_SLUG_ALIASES[make.toLowerCase()] || make.toLowerCase()
  const makeData = CAR_MAKE_SEO_DATA[lookupKey]

  if (!makeData) {
    notFound()
  }

  // Fetch cars of this make from database
  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      make: {
        equals: makeData.dbValue,
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      vehicleType: true, // For rideshare badge
      dailyRate: true,
      city: true,
      state: true,
      seats: true,
      latitude: true,
      longitude: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      fuelType: true,
      esgScore: true,
      photos: {
        select: { url: true },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          rating: true
        }
      }
    },
    orderBy: [
      { instantBook: 'desc' },
      { rating: 'desc' }
    ],
    take: 24
  })

  // Transform cars for CompactCarCard component
  const transformedCars = cars.map(car => ({
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    dailyRate: Number(car.dailyRate),
    carType: car.carType,
    vehicleType: car.vehicleType as 'RENTAL' | 'RIDESHARE' | null,
    seats: car.seats,
    city: car.city,
    rating: car.rating ? Number(car.rating) : null,
    totalTrips: car.totalTrips,
    instantBook: car.instantBook,
    photos: car.photos || [],
    host: car.host ? {
      name: car.host.name,
      profilePhoto: car.host.profilePhoto
    } : null
  }))

  // Generate schemas
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://itwhip.com' },
      { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://itwhip.com/rentals' },
      { '@type': 'ListItem', position: 3, name: `${makeData.displayName} Rentals`, item: `https://itwhip.com/rentals/makes/${make}` }
    ]
  }

  // AutoRental schema for star ratings in Google search results
  const autoRentalSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    '@id': `https://itwhip.com/rentals/makes/${make}#autorental`,
    name: `ItWhip ${makeData.displayName} Rentals`,
    url: `https://itwhip.com/rentals/makes/${make}`,
    description: makeData.description,
    areaServed: {
      '@type': 'State',
      name: 'Arizona',
      containedInPlace: { '@type': 'Country', name: 'United States' }
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Phoenix',
      addressRegion: 'AZ',
      addressCountry: 'US'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '182',
      reviewCount: '182',
      bestRating: '5',
      worstRating: '1'
    }
  }

  const brandSchema = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: makeData.displayName,
    description: makeData.description,
    url: `https://itwhip.com/rentals/makes/${make}`
  }

  // Calculate priceValidUntil once for all offers (30 days from now)
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${makeData.displayName} Rentals in Phoenix, AZ`,
    description: makeData.description,
    numberOfItems: cars.length,
    itemListElement: cars.slice(0, 10).map((car, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: `${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`,
        description: `Rent this ${car.year} ${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)} in ${car.city}, AZ`,
        image: car.photos?.[0]?.url || '',
        url: `https://itwhip.com${generateCarUrl({ id: car.id, make: car.make, model: car.model, year: car.year, city: car.city })}`,
        brand: {
          '@type': 'Brand',
          name: makeData.displayName
        },
        offers: {
          '@type': 'Offer',
          price: car.dailyRate,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          priceValidUntil,
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'US',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 3,
            returnMethod: 'https://schema.org/ReturnAtKiosk',
            returnFees: 'https://schema.org/FreeReturn',
            refundType: 'https://schema.org/FullRefund',
            returnPolicyCountry: 'US'
          },
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: 0,
              currency: 'USD'
            },
            shippingDestination: {
              '@type': 'DefinedRegion',
              addressCountry: 'US',
              addressRegion: 'AZ'
            },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 24,
                unitCode: 'd'
              },
              transitTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 2,
                unitCode: 'd'
              }
            }
          }
        },
        ...(car.rating && car.totalTrips > 0 ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: car.rating,
            reviewCount: car.totalTrips
          }
        } : {})
      }
    }))
  }

  // Get related makes (exclude current)
  const relatedMakes = Object.entries(CAR_MAKE_SEO_DATA)
    .filter(([key]) => key !== make.toLowerCase())
    .slice(0, 6)

  return (
    <>
      <Script
        id="autorental-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(autoRentalSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="brand-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      <Script
        id="itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <Header />

        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 flex items-center gap-1">
                <IoHomeOutline className="w-4 h-4" />
                Home
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
              <Link href="/rentals" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                Rentals
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">
                {makeData.displayName} Rentals
              </span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-4 sm:pt-6 pb-12 md:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <span>{makeData.country}</span>
                  <span>•</span>
                  <span>Est. {makeData.founded}</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-amber-400">
                  {makeData.displayName} Rentals in Phoenix, AZ
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
                  {makeData.longDescription}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 text-center">
                  <span className="text-gray-400 text-sm">Available</span>
                  <p className="text-3xl font-bold">{cars.length}</p>
                  <span className="text-gray-400 text-sm">vehicles</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 text-center">
                  <span className="text-gray-400 text-sm">From</span>
                  <p className="text-2xl font-bold">{makeData.priceRange.split('-')[0]}</p>
                  <span className="text-gray-400 text-sm">/day</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Known For Section */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              {makeData.displayName.toUpperCase()} IS KNOWN FOR
            </h2>
            <div className="flex flex-wrap gap-2">
              {makeData.knownFor.map((trait) => (
                <span
                  key={trait}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-1 border border-gray-200 dark:border-gray-700"
                >
                  <IoShieldCheckmarkOutline className="w-4 h-4 text-green-500" />
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Models */}
        <section className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              POPULAR MODELS
            </h2>
            <div className="flex flex-wrap gap-3">
              {makeData.popularModels.map((model) => {
                const modelSlug = model.toLowerCase().replace(/\s+/g, '-')
                return (
                  <Link
                    key={model}
                    href={`/rentals/makes/${make}/${modelSlug}`}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:border-purple-500 hover:text-purple-600 transition shadow-sm hover:shadow-md"
                  >
                    {makeData.displayName} {model}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Car Listings */}
        <section className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Available {makeData.displayName} Vehicles
            </h2>

            {transformedCars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {transformedCars.map((car) => (
                  <CompactCarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <IoCarOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No {makeData.displayName} Vehicles Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Check back soon or browse other makes.
                </p>
                <Link
                  href="/rentals/search"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Browse All Cars
                  <IoChevronForwardOutline className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Other Makes */}
        <section className="py-8 md:py-12 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Browse Other Makes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {relatedMakes.map(([key, data]) => (
                <Link
                  key={key}
                  href={`/rentals/makes/${key}`}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center hover:shadow-lg transition group border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600">
                    {data.displayName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {data.country}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}

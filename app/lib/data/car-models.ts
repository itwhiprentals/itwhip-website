// app/lib/data/car-models.ts
// SEO data for make/model pages

export interface CarModelData {
  make: string
  makeSlug: string
  model: string
  modelSlug: string
  displayName: string
  h1: string
  metaTitle: string
  metaDescription: string
  heroSubtitle: string
  carType: string
  specs: {
    engine?: string
    horsepower?: string
    acceleration?: string
    range?: string
    seats: string
    drivetrain: string
    fuelType: string
  }
  whyRent: string[]
  perfectFor: string[]
  features: string[]
  priceRange: { min: number; max: number }
  content: string
  faqs: { question: string; answer: string }[]
}

export const CAR_MODEL_DATA: Record<string, CarModelData> = {
  'tesla/model-y': {
    make: 'Tesla',
    makeSlug: 'tesla',
    model: 'Model Y',
    modelSlug: 'model-y',
    displayName: 'Tesla Model Y',
    h1: 'Rent a Tesla Model Y in Phoenix',
    metaTitle: 'Rent Tesla Model Y Phoenix | Electric SUV Rental | ItWhip',
    metaDescription: 'Rent a Tesla Model Y in Phoenix. All-electric SUV with 330+ mile range, autopilot, spacious interior. Free Supercharging tips included. Book from local owners.',
    heroSubtitle: 'Experience the future of driving with Tesla\'s best-selling electric SUV. Zero emissions, instant torque, and cutting-edge technology.',
    carType: 'SUV',
    specs: {
      range: '330 miles',
      horsepower: '384 hp (Long Range)',
      acceleration: '0-60 in 4.8s',
      seats: '5-7',
      drivetrain: 'AWD',
      fuelType: 'Electric'
    },
    whyRent: [
      'Save on gas with all-electric driving',
      'Access to Tesla Supercharger network',
      'Autopilot for stress-free highway driving',
      'Spacious cargo for luggage and gear',
      'Premium sound system and large touchscreen'
    ],
    perfectFor: [
      'Road trips across Arizona',
      'Eco-conscious travelers',
      'Tech enthusiasts',
      'Families needing extra space',
      'First-time EV experiences'
    ],
    features: [
      'Full Self-Driving capable',
      '15" center touchscreen',
      'Over-the-air updates',
      'Glass panoramic roof',
      'Premium connectivity',
      'Sentry Mode security'
    ],
    priceRange: { min: 89, max: 149 },
    content: 'The Tesla Model Y combines SUV practicality with electric performance. Perfect for exploring Phoenix and beyond, it offers ample range for day trips to Sedona, the Grand Canyon, or Tucson without range anxiety. Many hosts include Supercharging credits or tips for free charging locations.',
    faqs: [
      {
        question: 'Where can I charge a Tesla Model Y in Phoenix?',
        answer: 'Phoenix has an extensive Tesla Supercharger network with locations at Scottsdale Fashion Square, Tempe Marketplace, Phoenix Sky Harbor area, and more. Your host can share their favorite charging spots.'
      },
      {
        question: 'How far can I drive on a full charge?',
        answer: 'The Model Y Long Range offers 330+ miles of range. Most hosts charge to 80-90% for battery health, giving you 270-300 miles—plenty for most Phoenix adventures.'
      },
      {
        question: 'Is the Tesla easy to drive?',
        answer: 'Yes! The Model Y drives like a regular car with instant acceleration. Your host will walk you through the touchscreen controls and features at pickup.'
      }
    ]
  },

  'tesla/model-3': {
    make: 'Tesla',
    makeSlug: 'tesla',
    model: 'Model 3',
    modelSlug: 'model-3',
    displayName: 'Tesla Model 3',
    h1: 'Rent a Tesla Model 3 in Phoenix',
    metaTitle: 'Rent Tesla Model 3 Phoenix | Electric Sedan Rental | ItWhip',
    metaDescription: 'Rent a Tesla Model 3 in Phoenix. All-electric sedan with 350+ mile range, autopilot, minimalist design. Experience premium electric driving from local owners.',
    heroSubtitle: 'The world\'s best-selling electric car. Sleek design, incredible performance, and industry-leading range.',
    carType: 'Sedan',
    specs: {
      range: '350 miles',
      horsepower: '366 hp (Long Range)',
      acceleration: '0-60 in 4.2s',
      seats: '5',
      drivetrain: 'AWD/RWD',
      fuelType: 'Electric'
    },
    whyRent: [
      'Zero emissions, zero gas costs',
      'Minimalist, futuristic interior',
      'Best-in-class EV range',
      'Track-ready acceleration',
      'Ultra-low running costs'
    ],
    perfectFor: [
      'Business travelers',
      'Airport pickups',
      'Weekend getaways',
      'Eco-conscious renters',
      'Performance enthusiasts'
    ],
    features: [
      'Autopilot standard',
      '15.4" center display',
      'Glass roof',
      'Premium audio',
      'App connectivity',
      'Keyless entry via phone'
    ],
    priceRange: { min: 79, max: 139 },
    content: 'The Tesla Model 3 redefined what an electric car can be. With instant acceleration, a minimalist interior centered around a massive touchscreen, and enough range to reach the Grand Canyon and back, it\'s perfect for experiencing electric driving.',
    faqs: [
      {
        question: 'What\'s the difference between Model 3 and Model Y?',
        answer: 'The Model 3 is a sedan with sportier handling and slightly longer range. The Model Y is a crossover SUV with more cargo space and available third-row seating. Choose Model 3 for efficiency and sportiness, Model Y for space.'
      },
      {
        question: 'Can I take it on a road trip?',
        answer: 'Absolutely! The Model 3 is perfect for Arizona road trips. The Supercharger network covers all major routes including Phoenix to LA, Vegas, Tucson, and Flagstaff.'
      },
      {
        question: 'How does the key work?',
        answer: 'Most hosts set you up with the Tesla app which turns your phone into the key. Some also provide a key card as backup. Your host will explain everything at pickup.'
      }
    ]
  },

  'bmw/x5': {
    make: 'BMW',
    makeSlug: 'bmw',
    model: 'X5',
    modelSlug: 'x5',
    displayName: 'BMW X5',
    h1: 'Rent a BMW X5 in Phoenix',
    metaTitle: 'Rent BMW X5 Phoenix | Luxury SUV Rental | ItWhip',
    metaDescription: 'Rent a BMW X5 in Phoenix. Premium luxury SUV with powerful performance, advanced tech, and spacious comfort. Book from local owners on ItWhip.',
    heroSubtitle: 'The Sports Activity Vehicle that started it all. Commanding presence, athletic performance, and first-class luxury.',
    carType: 'SUV',
    specs: {
      engine: '3.0L Turbo I6 / 4.4L Twin-Turbo V8',
      horsepower: '335-523 hp',
      acceleration: '0-60 in 4.3-5.3s',
      seats: '5-7',
      drivetrain: 'xDrive AWD',
      fuelType: 'Gasoline/Hybrid'
    },
    whyRent: [
      'Perfect blend of luxury and sportiness',
      'Confident handling in any weather',
      'Spacious interior for passengers and luggage',
      'Premium Harman Kardon sound system',
      'Advanced driver assistance features'
    ],
    perfectFor: [
      'Business executives',
      'Family road trips',
      'Golf weekends in Scottsdale',
      'Special occasions',
      'Airport VIP pickups'
    ],
    features: [
      'iDrive 8 infotainment',
      'Panoramic moonroof',
      'Heated/ventilated seats',
      'Gesture control',
      'Parking assistance',
      'Head-up display'
    ],
    priceRange: { min: 129, max: 229 },
    content: 'The BMW X5 defines the luxury sport SUV segment. Whether you\'re heading to a Scottsdale resort, navigating Phoenix traffic, or exploring mountain roads to Sedona, the X5 delivers confidence, comfort, and capability in equal measure.',
    faqs: [
      {
        question: 'Is the BMW X5 good for Arizona summers?',
        answer: 'Yes! The X5 features a powerful A/C system, available ventilated seats, and a panoramic roof with shade. The xDrive system also handles monsoon weather confidently.'
      },
      {
        question: 'What\'s the fuel economy?',
        answer: 'The X5 40i gets around 21 city/26 highway MPG. For better efficiency, look for the X5 xDrive45e plug-in hybrid which offers 30+ miles of electric range.'
      },
      {
        question: 'Can it fit golf clubs?',
        answer: 'Absolutely. The X5 has 33.9 cubic feet behind the second row, easily accommodating multiple golf bags plus luggage for a Scottsdale golf weekend.'
      }
    ]
  },

  'porsche/cayenne': {
    make: 'Porsche',
    makeSlug: 'porsche',
    model: 'Cayenne',
    modelSlug: 'cayenne',
    displayName: 'Porsche Cayenne',
    h1: 'Rent a Porsche Cayenne in Phoenix',
    metaTitle: 'Rent Porsche Cayenne Phoenix | Sports SUV Rental | ItWhip',
    metaDescription: 'Rent a Porsche Cayenne in Phoenix. Sports car DNA in an SUV body. Powerful, luxurious, and unmistakably Porsche. Book from local owners on ItWhip.',
    heroSubtitle: 'The SUV with a sports car soul. Porsche performance meets everyday practicality.',
    carType: 'SUV',
    specs: {
      engine: '3.0L Turbo V6 / 4.0L Twin-Turbo V8',
      horsepower: '348-631 hp',
      acceleration: '0-60 in 3.1-5.9s',
      seats: '5',
      drivetrain: 'AWD',
      fuelType: 'Gasoline/Hybrid'
    },
    whyRent: [
      'Sports car performance in SUV form',
      'Iconic Porsche driving dynamics',
      'Luxurious interior craftsmanship',
      'Impressive towing capability',
      'Head-turning presence everywhere'
    ],
    perfectFor: [
      'Performance enthusiasts',
      'Scottsdale resort trips',
      'Desert driving experiences',
      'Business entertainment',
      'Special celebrations'
    ],
    features: [
      'Porsche Active Suspension',
      'Sport Chrono package',
      'Bose or Burmester audio',
      'Panoramic roof',
      'Rear-axle steering',
      'Night vision assist'
    ],
    priceRange: { min: 179, max: 349 },
    content: 'The Porsche Cayenne proves you don\'t have to sacrifice performance for practicality. With genuine sports car DNA, it attacks mountain roads with confidence while still offering space for four adults and their luggage. It\'s the ultimate do-everything vehicle.',
    faqs: [
      {
        question: 'How does the Cayenne compare to other luxury SUVs?',
        answer: 'The Cayenne prioritizes driving dynamics over everything else. It handles more like a sports car than any competitor, while still offering genuine luxury and practicality.'
      },
      {
        question: 'Which Cayenne model should I rent?',
        answer: 'The base Cayenne offers excellent performance for most drivers. For more power, look for the Cayenne S or GTS. The Turbo and Turbo GT models deliver supercar-level acceleration.'
      },
      {
        question: 'Is it comfortable for long drives?',
        answer: 'Yes! Despite its sporty character, the Cayenne offers excellent long-distance comfort with supportive seats, effective noise isolation, and adaptive air suspension on most models.'
      }
    ]
  },

  'mercedes/s-class': {
    make: 'Mercedes-Benz',
    makeSlug: 'mercedes',
    model: 'S-Class',
    modelSlug: 's-class',
    displayName: 'Mercedes-Benz S-Class',
    h1: 'Rent a Mercedes S-Class in Phoenix',
    metaTitle: 'Rent Mercedes S-Class Phoenix | Luxury Sedan Rental | ItWhip',
    metaDescription: 'Rent a Mercedes-Benz S-Class in Phoenix. The pinnacle of luxury sedans with first-class comfort, cutting-edge technology. Book from local owners on ItWhip.',
    heroSubtitle: 'The best car in the world. Revolutionary technology, unmatched comfort, and timeless elegance.',
    carType: 'Sedan',
    specs: {
      engine: '3.0L Turbo I6 / 4.0L Twin-Turbo V8',
      horsepower: '429-496 hp',
      acceleration: '0-60 in 4.4-4.8s',
      seats: '4-5',
      drivetrain: '4MATIC AWD',
      fuelType: 'Gasoline/Hybrid'
    },
    whyRent: [
      'Ultimate luxury experience',
      'Chauffeur-quality rear seating',
      'Cutting-edge technology showcase',
      'Whisper-quiet cabin',
      'Arrives like royalty anywhere'
    ],
    perfectFor: [
      'Executive transportation',
      'Wedding day arrivals',
      'Special anniversaries',
      'Business client meetings',
      'Ultimate comfort road trips'
    ],
    features: [
      'MBUX Hyperscreen',
      'Executive rear seats',
      'Burmester 4D audio',
      'Air suspension',
      'Massage seats',
      'Augmented reality navigation'
    ],
    priceRange: { min: 229, max: 399 },
    content: 'The Mercedes-Benz S-Class has defined automotive luxury for over 50 years. The latest generation showcases technology that feels like science fiction—from the optional 56-inch Hyperscreen to rear seats that rival first-class airline pods. This is how VIPs travel.',
    faqs: [
      {
        question: 'What makes the S-Class special?',
        answer: 'The S-Class debuts Mercedes\' latest technology before any other model. It offers the most advanced driver assistance, the quietest cabin, and features like E-Active Body Control that can lean into corners or lift the car to help you exit.'
      },
      {
        question: 'Is the back seat really that nice?',
        answer: 'The S-Class rear seat is legendary. With executive seating, you get massage, heating/cooling, individual climate zones, fold-out tables, and the option to stretch out with the front passenger seat moved forward.'
      },
      {
        question: 'Should I drive it or be driven?',
        answer: 'Both experiences are incredible. The S-Class is remarkably easy to drive with excellent visibility and parking assistance, but being chauffeured in the rear lets you experience the full luxury treatment.'
      }
    ]
  },

  'dodge/hellcat': {
    make: 'Dodge',
    makeSlug: 'dodge',
    model: 'Challenger Hellcat',
    modelSlug: 'hellcat',
    displayName: 'Dodge Challenger Hellcat',
    h1: 'Rent a Dodge Hellcat in Phoenix',
    metaTitle: 'Rent Dodge Hellcat Phoenix | 700+ HP Muscle Car | ItWhip',
    metaDescription: 'Rent a Dodge Challenger Hellcat in Phoenix. 700+ supercharged horsepower, American muscle legend. Experience raw power from local owners on ItWhip.',
    heroSubtitle: 'Over 700 supercharged horsepower. The most powerful American muscle car ever built.',
    carType: 'Coupe',
    specs: {
      engine: '6.2L Supercharged HEMI V8',
      horsepower: '717-807 hp',
      acceleration: '0-60 in 3.4-3.6s',
      seats: '5',
      drivetrain: 'RWD',
      fuelType: 'Premium Gasoline'
    },
    whyRent: [
      'Unmatched American muscle power',
      'Iconic supercharger whine',
      'Surprisingly practical daily driver',
      'Head-turning classic styling',
      'Raw, unfiltered driving experience'
    ],
    perfectFor: [
      'Muscle car enthusiasts',
      'Bachelor/bachelorette parties',
      'Route 66 road trips',
      'Car show appearances',
      'Bucket list experiences'
    ],
    features: [
      'SRT Drive Modes',
      'Launch Control',
      'Line Lock for burnouts',
      'Brembo brakes',
      'Uconnect 4C with Performance Pages',
      'Adaptive damping suspension'
    ],
    priceRange: { min: 199, max: 399 },
    content: 'The Dodge Challenger Hellcat is American excess at its finest. With over 700 supercharged horsepower, it\'s one of the most powerful production cars ever made. The signature supercharger whine announces your arrival everywhere, while the retro-inspired styling turns every head. This is a bucket list car.',
    faqs: [
      {
        question: 'Is 700 horsepower manageable?',
        answer: 'Yes, with respect. The Hellcat has multiple drive modes including a lower-power "Valet" mode. Most hosts will walk you through the car\'s features and ensure you\'re comfortable before handing over the keys.'
      },
      {
        question: 'What\'s the fuel economy?',
        answer: 'Realistically, expect 12-15 MPG with spirited driving. The 18-gallon tank means planning fuel stops on longer trips. Most hosts recommend premium fuel.'
      },
      {
        question: 'Can I do burnouts?',
        answer: 'The Hellcat has Line Lock specifically for this purpose. However, most hosts have policies against burnouts due to tire wear. Always check with your host about what\'s allowed.'
      }
    ]
  },

  'lamborghini/huracan': {
    make: 'Lamborghini',
    makeSlug: 'lamborghini',
    model: 'Huracán',
    modelSlug: 'huracan',
    displayName: 'Lamborghini Huracán',
    h1: 'Rent a Lamborghini Huracán in Phoenix',
    metaTitle: 'Rent Lamborghini Huracán Phoenix | Exotic Supercar | ItWhip',
    metaDescription: 'Rent a Lamborghini Huracán in Phoenix. V10 supercar with 630+ HP, scissor doors optional, Italian exotic perfection. Book from local owners on ItWhip.',
    heroSubtitle: 'Italian V10 perfection. The supercar that makes dreams reality.',
    carType: 'Exotic',
    specs: {
      engine: '5.2L Naturally Aspirated V10',
      horsepower: '610-640 hp',
      acceleration: '0-60 in 2.5-2.9s',
      seats: '2',
      drivetrain: 'AWD/RWD',
      fuelType: 'Premium Gasoline'
    },
    whyRent: [
      'Bucket list exotic car experience',
      'Screaming naturally aspirated V10',
      'Stunning Italian design',
      'Surprisingly approachable to drive',
      'Instant celebrity status'
    ],
    perfectFor: [
      'Milestone celebrations',
      'Proposal moments',
      'Content creation',
      'Dream car experiences',
      'Exotic car enthusiasts'
    ],
    features: [
      'ANIMA drive modes',
      'Carbon ceramic brakes',
      'Optional scissor doors',
      'Digital instrument cluster',
      'Launch control',
      'Magnetorheological suspension'
    ],
    priceRange: { min: 999, max: 1999 },
    content: 'The Lamborghini Huracán represents the pinnacle of automotive desire. Its naturally aspirated V10 engine sings to 8,500 RPM with a sound no turbo can match. The angular Italian styling stops traffic everywhere, while the all-wheel-drive system makes the performance surprisingly accessible.',
    faqs: [
      {
        question: 'Is the Huracán hard to drive?',
        answer: 'Surprisingly, no. The Huracán is one of the most approachable supercars thanks to its all-wheel drive (on most versions) and modern driver aids. Your host will ensure you\'re comfortable before departure.'
      },
      {
        question: 'What should I know before renting?',
        answer: 'Expect a thorough verification process and substantial security deposit. You\'ll need a clean driving record and may need to be 25+. Mileage limits are typically lower than standard rentals.'
      },
      {
        question: 'How do the doors work?',
        answer: 'The EVO and later models have standard doors. The Performante and some earlier models have available scissor doors. Both are easy to operate once your host shows you.'
      }
    ]
  },

  'bentley/bentayga': {
    make: 'Bentley',
    makeSlug: 'bentley',
    model: 'Bentayga',
    modelSlug: 'bentayga',
    displayName: 'Bentley Bentayga',
    h1: 'Rent a Bentley Bentayga in Phoenix',
    metaTitle: 'Rent Bentley Bentayga Phoenix | Ultra-Luxury SUV | ItWhip',
    metaDescription: 'Rent a Bentley Bentayga in Phoenix. Handcrafted ultra-luxury SUV combining British craftsmanship with supercar performance. Book from local owners.',
    heroSubtitle: 'The world\'s most luxurious SUV. British craftsmanship meets modern performance.',
    carType: 'SUV',
    specs: {
      engine: '4.0L Twin-Turbo V8 / 6.0L W12',
      horsepower: '542-626 hp',
      acceleration: '0-60 in 3.8-4.4s',
      seats: '4-5',
      drivetrain: 'AWD',
      fuelType: 'Gasoline/Hybrid'
    },
    whyRent: [
      'Ultimate in SUV luxury',
      'Handcrafted British interior',
      'Surprisingly capable off-road',
      'Rolls-Royce-level presence',
      'Unique and exclusive experience'
    ],
    perfectFor: [
      'Luxury resort arrivals',
      'Executive entertainment',
      'Special celebrations',
      'Unique travel experiences',
      'Those who demand the best'
    ],
    features: [
      'Hand-stitched leather',
      'Bentley Rotating Display',
      'Naim for Bentley audio',
      'All-terrain capability',
      'Diamond-knurled controls',
      'Mulliner customization options'
    ],
    priceRange: { min: 799, max: 1499 },
    content: 'The Bentley Bentayga is for those who refuse to compromise. Handcrafted in Crewe, England, it combines artisan craftsmanship with modern performance. The interior takes 130 hours to complete, featuring hand-stitched leather, real wood veneers, and optional diamond-quilted seats. Despite the luxury, it can genuinely handle off-road terrain.',
    faqs: [
      {
        question: 'What makes Bentley different from other luxury SUVs?',
        answer: 'Bentley handcrafts each vehicle with techniques dating back a century. The leather comes from bulls raised in areas without barbed wire (no scratches), and the wood veneers are bookmatched like fine furniture. It\'s automotive art.'
      },
      {
        question: 'Is it really capable off-road?',
        answer: 'Yes! The Bentayga has multiple terrain modes and can actually handle moderate off-road conditions. Most owners don\'t use this capability, but it\'s there if you want a unique desert adventure.'
      },
      {
        question: 'How does it compare to Range Rover?',
        answer: 'The Bentayga is a step above Range Rover in luxury and exclusivity. Think of Range Rover as business class, Bentayga as first class. The materials, attention to detail, and exclusivity are unmatched.'
      }
    ]
  },

  'ferrari/488': {
    make: 'Ferrari',
    makeSlug: 'ferrari',
    model: '488',
    modelSlug: '488',
    displayName: 'Ferrari 488',
    h1: 'Rent a Ferrari 488 in Phoenix',
    metaTitle: 'Rent Ferrari 488 Phoenix | Italian Supercar Rental | ItWhip',
    metaDescription: 'Rent a Ferrari 488 in Phoenix. Twin-turbo V8, 660 HP, iconic Italian design. Experience the prancing horse from local owners on ItWhip.',
    heroSubtitle: 'The prancing horse. Italian passion, engineering excellence, and pure driving emotion.',
    carType: 'Exotic',
    specs: {
      engine: '3.9L Twin-Turbo V8',
      horsepower: '661-710 hp',
      acceleration: '0-60 in 2.8-3.0s',
      seats: '2',
      drivetrain: 'RWD',
      fuelType: 'Premium Gasoline'
    },
    whyRent: [
      'Iconic Ferrari experience',
      'Award-winning turbocharged V8',
      'Breathtaking design',
      'Race-bred technology',
      'Life-changing driving experience'
    ],
    perfectFor: [
      'Dream car experiences',
      'Major celebrations',
      'Proposal drives',
      'Content creation',
      'Car enthusiasts'
    ],
    features: [
      'Manettino drive modes',
      'Side-slip control',
      'Carbon ceramic brakes',
      'Retractable hardtop (Spider)',
      'F1-inspired steering wheel',
      'Virtual short wheelbase'
    ],
    priceRange: { min: 1199, max: 2499 },
    content: 'The Ferrari 488 represents the perfect blend of track capability and road usability. Its twin-turbo V8 won International Engine of the Year four times consecutively, delivering 661 horsepower with surprising efficiency. The Spider variant adds open-air Italian motoring to the experience.',
    faqs: [
      {
        question: 'Is the 488 hard to drive?',
        answer: 'Modern Ferraris are remarkably approachable. The 488 has sophisticated electronics that make it safe while still allowing driver engagement. Your host will explain the Manettino drive modes and ensure you\'re comfortable.'
      },
      {
        question: 'GTB or Spider?',
        answer: 'The GTB (coupe) is slightly stiffer and lighter. The Spider has a folding hardtop for open-air driving—perfect for Phoenix weather. Most renters prefer the Spider for the experience.'
      },
      {
        question: 'What\'s the verification process?',
        answer: 'Expect thorough verification including driving history check, identity verification, and substantial security deposit. Minimum age is typically 25, and exotic car experience may be required by some hosts.'
      }
    ]
  },

  'ford/mustang-gt': {
    make: 'Ford',
    makeSlug: 'ford',
    model: 'Mustang GT',
    modelSlug: 'mustang-gt',
    displayName: 'Ford Mustang GT',
    h1: 'Rent a Ford Mustang GT in Phoenix',
    metaTitle: 'Rent Ford Mustang GT Phoenix | V8 Muscle Car Rental | ItWhip',
    metaDescription: 'Rent a Ford Mustang GT in Phoenix. Iconic American V8 muscle with 450+ HP. Classic styling, modern performance. Book from local owners on ItWhip.',
    heroSubtitle: 'The American icon. 60 years of muscle car heritage with modern performance.',
    carType: 'Coupe',
    specs: {
      engine: '5.0L Coyote V8',
      horsepower: '450-486 hp',
      acceleration: '0-60 in 4.0-4.3s',
      seats: '4',
      drivetrain: 'RWD',
      fuelType: 'Premium Gasoline'
    },
    whyRent: [
      'Affordable V8 muscle car fun',
      'Iconic American design',
      'Thrilling exhaust note',
      'Available in coupe or convertible',
      'Perfect for Arizona scenic drives'
    ],
    perfectFor: [
      'Route 66 adventures',
      'Desert sunset cruises',
      'American muscle experience',
      'Convertible top-down driving',
      'First-time sports car renters'
    ],
    features: [
      'MagneRide dampers',
      'Track Apps performance data',
      'Line Lock',
      'Rev matching',
      'B&O premium audio',
      'Digital instrument cluster'
    ],
    priceRange: { min: 119, max: 199 },
    content: 'The Ford Mustang GT delivers genuine V8 muscle at an accessible price. The 5.0-liter Coyote V8 produces a soundtrack that stirs the soul, while the modern platform offers handling that would shock classic Mustang owners. It\'s the perfect combination of heritage and capability.',
    faqs: [
      {
        question: 'Coupe or convertible?',
        answer: 'The coupe is slightly stiffer and sportier. The convertible is perfect for enjoying Arizona\'s weather—imagine cruising through Sedona with the top down. Most Phoenix renters prefer the convertible experience.'
      },
      {
        question: 'How does it compare to the Hellcat?',
        answer: 'The Hellcat has nearly double the horsepower but costs significantly more to rent. The Mustang GT offers 90% of the thrills at a more accessible price point. It\'s the sweet spot for muscle car fun.'
      },
      {
        question: 'Is it a good daily driver?',
        answer: 'Yes! Modern Mustangs have comfortable interiors, good visibility, and reasonable fuel economy in normal driving. It\'s muscle car fun that you can actually live with day-to-day.'
      }
    ]
  },

  'jeep/wrangler': {
    make: 'Jeep',
    makeSlug: 'jeep',
    model: 'Wrangler',
    modelSlug: 'wrangler',
    displayName: 'Jeep Wrangler',
    h1: 'Rent a Jeep Wrangler in Phoenix',
    metaTitle: 'Rent Jeep Wrangler Phoenix | 4x4 Off-Road Rental | ItWhip',
    metaDescription: 'Rent a Jeep Wrangler in Phoenix. Ultimate off-road adventure vehicle for Arizona trails. Removable top, 4x4 capability. Book from local owners.',
    heroSubtitle: 'Go anywhere. Do anything. The icon of freedom and adventure.',
    carType: 'SUV',
    specs: {
      engine: '2.0L Turbo / 3.6L V6 / 6.4L V8',
      horsepower: '270-470 hp',
      acceleration: '0-60 in 4.5-7.5s',
      seats: '4-5',
      drivetrain: '4WD',
      fuelType: 'Gasoline'
    },
    whyRent: [
      'Unmatched off-road capability',
      'Removable top for open-air driving',
      'Access Arizona\'s best trails',
      'Iconic recognizable design',
      'Adventure-ready from factory'
    ],
    perfectFor: [
      'Sedona trail adventures',
      'Desert exploration',
      'Scenic mountain drives',
      'Camping trips',
      'Outdoor enthusiasts'
    ],
    features: [
      'Dana 44 axles',
      'Electronic disconnecting sway bar',
      'Sky One-Touch Power Top',
      'Off-Road+ mode',
      'Rock rails',
      'Skid plates'
    ],
    priceRange: { min: 99, max: 179 },
    content: 'The Jeep Wrangler is the key to Arizona\'s outdoor playground. From the red rocks of Sedona to the trails around Flagstaff, there\'s nowhere a Wrangler can\'t take you. Remove the top for the full Arizona experience—sunshine, mountain views, and adventure await.',
    faqs: [
      {
        question: 'Can I take it off-road?',
        answer: 'Most hosts allow their Wranglers on maintained dirt roads and moderate trails. Extreme rock crawling may require specific host approval. Always discuss your planned routes with your host beforehand.'
      },
      {
        question: 'How do I remove the top?',
        answer: 'Your host will show you how the top works. Soft tops take about 5 minutes to fold back. Hardtops require removal of panels. The Sky One-Touch top (if equipped) is power-operated.'
      },
      {
        question: 'Is it comfortable on highways?',
        answer: 'Honestly, the Wrangler prioritizes off-road capability over highway comfort. Expect more wind noise and a firmer ride than typical SUVs. It\'s part of the character—embrace the adventure!'
      }
    ]
  },

  'chevrolet/corvette': {
    make: 'Chevrolet',
    makeSlug: 'chevrolet',
    model: 'Corvette',
    modelSlug: 'corvette',
    displayName: 'Chevrolet Corvette',
    h1: 'Rent a Chevrolet Corvette in Phoenix',
    metaTitle: 'Rent Chevrolet Corvette Phoenix | Mid-Engine Sports Car | ItWhip',
    metaDescription: 'Rent a Chevrolet Corvette C8 in Phoenix. Mid-engine supercar performance at sports car prices. American icon, exotic capabilities. Book from local owners.',
    heroSubtitle: 'America\'s supercar. Mid-engine revolution with exotic car capabilities at an attainable price.',
    carType: 'Coupe',
    specs: {
      engine: '6.2L V8 / 5.5L Flat-Plane Crank V8',
      horsepower: '490-670 hp',
      acceleration: '0-60 in 2.6-2.9s',
      seats: '2',
      drivetrain: 'RWD',
      fuelType: 'Premium Gasoline'
    },
    whyRent: [
      'Exotic car performance, attainable pricing',
      'Mid-engine handling revolution',
      'Removable targa top',
      'Dual-trunk practicality',
      'American supercar pride'
    ],
    perfectFor: [
      'Sports car enthusiasts',
      'Scenic canyon drives',
      'Weekend getaways',
      'Car show appearances',
      'Performance driving experiences'
    ],
    features: [
      'Magnetic Ride Control',
      'Performance Data Recorder',
      'Z51 Performance Package',
      'Front and rear trunk',
      'Head-up display',
      'Bose premium audio'
    ],
    priceRange: { min: 249, max: 449 },
    content: 'The C8 Corvette changed everything. With its engine behind the seats like a Ferrari, it delivers exotic car performance at a fraction of the price. The dual-trunk setup (front and rear) offers surprising practicality, and the removable targa top lets you enjoy Arizona sunshine.',
    faqs: [
      {
        question: 'How different is the mid-engine layout?',
        answer: 'Night and day from previous Corvettes. The mid-engine C8 feels more like a European exotic—better balanced, more responsive, and incredibly confidence-inspiring. It\'s genuinely a supercar.'
      },
      {
        question: 'Is it practical for a road trip?',
        answer: 'Surprisingly, yes. The front trunk (frunk) holds a carry-on, and the rear trunk fits a golf bag. It\'s one of the most practical supercars for actual use.'
      },
      {
        question: 'Stingray or Z06?',
        answer: 'The Stingray is fantastic for 95% of drivers—plenty of power and capability. The Z06 has a flat-plane crank V8 that revs to 8,600 RPM for a more exotic experience and significantly more power.'
      }
    ]
  }
}

// Helper functions
export function getCarModelBySlug(make: string, model: string): CarModelData | undefined {
  const key = `${make}/${model}`
  return CAR_MODEL_DATA[key]
}

export function getAllCarModelSlugs(): { make: string; model: string }[] {
  return Object.keys(CAR_MODEL_DATA).map(key => {
    const [make, model] = key.split('/')
    return { make, model }
  })
}

export function getModelsByMake(makeSlug: string): CarModelData[] {
  return Object.values(CAR_MODEL_DATA).filter(car => car.makeSlug === makeSlug)
}

export const CAR_MODEL_LIST = Object.values(CAR_MODEL_DATA)

// Get all unique makes with their data
export function getAllMakes(): { slug: string; name: string; modelCount: number }[] {
  const makeMap = new Map<string, { name: string; count: number }>()

  for (const car of CAR_MODEL_LIST) {
    const existing = makeMap.get(car.makeSlug)
    if (existing) {
      existing.count++
    } else {
      makeMap.set(car.makeSlug, { name: car.make, count: 1 })
    }
  }

  return Array.from(makeMap.entries()).map(([slug, data]) => ({
    slug,
    name: data.name,
    modelCount: data.count
  }))
}

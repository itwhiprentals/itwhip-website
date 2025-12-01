// app/lib/data/vehicles.ts
// Comprehensive vehicle database with makes, models, and years

export interface VehicleMake {
    name: string
    models: string[]
  }
  
  // Complete vehicle database organized by manufacturer
  export const vehicleDatabase: Record<string, string[]> = {
    // ============================================
    // JAPANESE MANUFACTURERS
    // ============================================
    'Acura': [
      'ILX', 'TLX', 'RLX', 'NSX',
      'RDX', 'MDX', 'ZDX',
      'RSX', 'TSX', 'RL', 'TL', 'Legend', 'Integra'
    ],
    'Honda': [
      'Civic', 'Accord', 'Insight', 'Clarity',
      'Fit', 'HR-V', 'CR-V', 'Passport', 'Pilot', 'Ridgeline',
      'Odyssey', 'Element', 'Crosstour', 'S2000', 'Prelude', 'CR-Z'
    ],
    'Infiniti': [
      'Q50', 'Q60', 'Q70',
      'QX50', 'QX55', 'QX60', 'QX80',
      'G35', 'G37', 'M35', 'M37', 'M56', 'FX35', 'FX50', 'JX35', 'EX35'
    ],
    'Lexus': [
      'IS', 'ES', 'GS', 'LS', 'LC', 'RC', 'LFA',
      'UX', 'NX', 'RX', 'GX', 'LX',
      'CT', 'HS', 'SC'
    ],
    'Mazda': [
      'Mazda3', 'Mazda6', 'MX-5 Miata', 'MX-30', 'RX-8',
      'CX-3', 'CX-30', 'CX-5', 'CX-9', 'CX-50', 'CX-90',
      'Tribute', 'CX-7', 'Mazda5', 'Mazda2', 'RX-7'
    ],
    'Mitsubishi': [
      'Mirage', 'Lancer', 'Eclipse', 'Eclipse Cross',
      'Outlander', 'Outlander Sport', 'Pajero', 'Montero',
      '3000GT', 'Galant', 'Diamante', 'Endeavor', 'Raider'
    ],
    'Nissan': [
      'Altima', 'Maxima', 'Sentra', 'Versa', 'Leaf', '370Z', '400Z', 'GT-R',
      'Kicks', 'Rogue', 'Rogue Sport', 'Murano', 'Pathfinder', 'Armada',
      'Frontier', 'Titan', 'Quest', 'Juke', 'Xterra', '350Z', '300ZX', 'Cube'
    ],
    'Subaru': [
      'Impreza', 'Legacy', 'WRX', 'BRZ',
      'Crosstrek', 'Forester', 'Outback', 'Ascent', 'Solterra',
      'Baja', 'Tribeca', 'SVX'
    ],
    'Suzuki': [
      'Swift', 'SX4', 'Kizashi', 'Aerio',
      'Vitara', 'Grand Vitara', 'XL7', 'Samurai', 'Sidekick',
      'Equator', 'Forenza', 'Reno', 'Verona'
    ],
    'Toyota': [
      'Camry', 'Corolla', 'Avalon', 'Prius', 'Mirai', 'GR86', 'Supra', 'Crown',
      'C-HR', 'Corolla Cross', 'RAV4', 'Venza', 'Highlander', '4Runner', 'Sequoia', 'Land Cruiser', 'bZ4X',
      'Tacoma', 'Tundra', 'Sienna',
      'Yaris', 'Matrix', 'Celica', 'MR2', 'FJ Cruiser', 'Echo', 'Tercel', 'Solara'
    ],
  
    // ============================================
    // AMERICAN MANUFACTURERS
    // ============================================
    'Buick': [
      'Enclave', 'Envision', 'Encore', 'Encore GX',
      'LaCrosse', 'Regal', 'Verano', 'Cascada',
      'Lucerne', 'Park Avenue', 'LeSabre', 'Century', 'Rendezvous', 'Rainier', 'Terraza'
    ],
    'Cadillac': [
      'CT4', 'CT5', 'CT6',
      'XT4', 'XT5', 'XT6', 'Escalade', 'Lyriq',
      'ATS', 'CTS', 'XTS', 'STS', 'DTS', 'DeVille', 'Eldorado', 'Seville', 'SRX', 'ELR', 'XLR'
    ],
    'Chevrolet': [
      'Malibu', 'Impala', 'Camaro', 'Corvette', 'Spark', 'Sonic', 'Cruze', 'Volt', 'Bolt EV', 'Bolt EUV',
      'Trax', 'Trailblazer', 'Equinox', 'Blazer', 'Traverse', 'Tahoe', 'Suburban',
      'Colorado', 'Silverado 1500', 'Silverado 2500HD', 'Silverado 3500HD', 'Avalanche',
      'Express', 'Astro', 'Venture', 'Uplander', 'HHR', 'SS', 'Caprice', 'Monte Carlo', 'Cobalt', 'Aveo'
    ],
    'Chrysler': [
      '300', 'Pacifica', 'Voyager',
      '200', 'Sebring', 'Concorde', 'LHS', 'Crossfire', 'Aspen', 'PT Cruiser', 'Town & Country'
    ],
    'Dodge': [
      'Charger', 'Challenger', 'Dart',
      'Durango', 'Journey', 'Hornet',
      'Grand Caravan', 'Caravan', 'Avenger', 'Magnum', 'Caliber', 'Nitro', 'Viper', 'Neon', 'Stratus', 'Intrepid'
    ],
    'Ford': [
      'Fusion', 'Mustang', 'Mustang Mach-E', 'Taurus', 'Focus', 'Fiesta', 'GT',
      'EcoSport', 'Escape', 'Bronco', 'Bronco Sport', 'Edge', 'Explorer', 'Expedition', 'Flex',
      'Ranger', 'Maverick', 'F-150', 'F-150 Lightning', 'F-250', 'F-350', 'F-450',
      'Transit', 'Transit Connect', 'E-Series', 'Windstar', 'Freestar', 'C-Max', 'Freestyle', 'Five Hundred', 'Crown Victoria', 'Thunderbird', 'Contour', 'Escort', 'Probe'
    ],
    'GMC': [
      'Terrain', 'Acadia', 'Yukon', 'Yukon XL', 'Hummer EV',
      'Canyon', 'Sierra 1500', 'Sierra 2500HD', 'Sierra 3500HD',
      'Savana', 'Safari', 'Envoy', 'Jimmy', 'Sonoma', 'Typhoon', 'Syclone'
    ],
    'Hummer': [
      'H1', 'H2', 'H3', 'H3T', 'EV Pickup', 'EV SUV'
    ],
    'Jeep': [
      'Wrangler', 'Wrangler Unlimited', 'Gladiator',
      'Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Grand Cherokee L', 'Grand Cherokee 4xe', 'Wagoneer', 'Grand Wagoneer',
      'Liberty', 'Patriot', 'Commander', 'CJ-5', 'CJ-7', 'CJ-8'
    ],
    'Lincoln': [
      'Continental', 'MKZ', 'MKS', 'Town Car', 'LS', 'Zephyr',
      'Corsair', 'Nautilus', 'Aviator', 'Navigator',
      'MKC', 'MKT', 'MKX', 'Mark LT', 'Blackwood'
    ],
    'Ram': [
      '1500', '2500', '3500',
      'ProMaster', 'ProMaster City',
      'Dakota', 'C/V'
    ],
    'Tesla': [
      'Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster', 'Semi'
    ],
  
    // ============================================
    // GERMAN MANUFACTURERS
    // ============================================
    'Audi': [
      'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'TT', 'R8', 'e-tron GT',
      'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'e-tron',
      'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'SQ5', 'SQ7', 'SQ8',
      'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'RS Q8',
      'Allroad', 'TT RS'
    ],
    'BMW': [
      '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series',
      'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM',
      'Z4', 'i3', 'i4', 'i5', 'i7', 'iX',
      'M2', 'M3', 'M4', 'M5', 'M6', 'M8', 'X3 M', 'X4 M', 'X5 M', 'X6 M',
      '1 Series', 'Z3', 'Z8', 'i8'
    ],
    'Mercedes-Benz': [
      'A-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'EQS Sedan',
      'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'EQB', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV',
      'SL', 'SLC', 'AMG GT',
      'Maybach S-Class', 'Maybach GLS',
      'Metris', 'Sprinter',
      'B-Class', 'R-Class', 'SLK', 'SLR McLaren', 'CLK', 'ML', 'GL'
    ],
    'Porsche': [
      '718 Boxster', '718 Cayman', '718 Spyder',
      '911', '911 Carrera', '911 Turbo', '911 GT3', '911 GT2',
      'Taycan', 'Panamera',
      'Macan', 'Cayenne',
      'Carrera GT', '918 Spyder', '944', '928', '968', 'Boxster', 'Cayman'
    ],
    'Volkswagen': [
      'Jetta', 'Passat', 'Arteon', 'Golf', 'GTI', 'Golf R', 'Beetle', 'CC',
      'Taos', 'Tiguan', 'Atlas', 'Atlas Cross Sport', 'ID.4', 'ID.Buzz',
      'Touareg', 'Routan', 'Eos', 'Phaeton', 'Rabbit', 'GLI'
    ],
  
    // ============================================
    // KOREAN MANUFACTURERS
    // ============================================
    'Genesis': [
      'G70', 'G80', 'G90',
      'GV60', 'GV70', 'GV80', 'Electrified G80', 'Electrified GV70'
    ],
    'Hyundai': [
      'Elantra', 'Sonata', 'Azera', 'Veloster', 'Ioniq', 'Ioniq 5', 'Ioniq 6',
      'Venue', 'Kona', 'Kona Electric', 'Tucson', 'Santa Fe', 'Santa Cruz', 'Palisade',
      'Accent', 'Genesis Coupe', 'Equus', 'Entourage', 'Veracruz', 'Santa Fe Sport', 'XG350', 'Tiburon'
    ],
    'Kia': [
      'Forte', 'K5', 'Stinger', 'Cadenza', 'Rio', 'EV6', 'EV9',
      'Soul', 'Seltos', 'Sportage', 'Sorento', 'Telluride', 'Carnival', 'Niro', 'Niro EV',
      'Optima', 'Amanti', 'Borrego', 'Rondo', 'Sedona', 'Spectra', 'Sephia'
    ],
  
    // ============================================
    // EUROPEAN MANUFACTURERS
    // ============================================
    'Alfa Romeo': [
      'Giulia', 'Stelvio', 'Tonale',
      '4C', '4C Spider', '8C Competizione', 'GTV', 'Spider', '159', '156', '147', 'MiTo', 'Giulietta'
    ],
    'Aston Martin': [
      'DB11', 'DB12', 'DBS', 'Vantage', 'DBX', 'DBX707', 'Valkyrie',
      'DB9', 'DB7', 'Rapide', 'Virage', 'Vanquish', 'V8 Vantage', 'V12 Vantage', 'One-77', 'Vulcan'
    ],
    'Bentley': [
      'Continental GT', 'Continental GTC', 'Flying Spur', 'Bentayga', 'Mulliner',
      'Mulsanne', 'Arnage', 'Azure', 'Brooklands', 'Continental Flying Spur'
    ],
    'Ferrari': [
      '296 GTB', '296 GTS', 'Roma', 'Portofino M', 'F8 Tributo', 'F8 Spider', 'SF90 Stradale', 'SF90 Spider', '812 Superfast', '812 GTS', 'Purosangue', 'Daytona SP3',
      '488 GTB', '488 Spider', '488 Pista', 'GTC4Lusso', 'California', 'LaFerrari', '458 Italia', '458 Spider', 'FF', 'F12', 'F430', '599 GTB', 'Enzo', '360', '355', '348', 'Testarossa', 'F40', 'F50'
    ],
    'Fiat': [
      '500', '500X', '500L', '500e', '500 Abarth',
      '124 Spider', 'Panda', 'Tipo', 'Punto', 'Bravo', 'Doblo', 'Multipla', 'Uno', 'Stilo'
    ],
    'Jaguar': [
      'XE', 'XF', 'XJ', 'F-Type', 'I-Pace',
      'E-Pace', 'F-Pace',
      'X-Type', 'S-Type', 'XK', 'XKR', 'XJR'
    ],
    'Lamborghini': [
      'Huracán', 'Huracán Evo', 'Huracán STO', 'Huracán Tecnica',
      'Urus', 'Urus S', 'Urus Performante',
      'Revuelto', 'Countach LPI 800-4',
      'Aventador', 'Aventador S', 'Aventador SVJ', 'Gallardo', 'Murciélago', 'Diablo', 'Countach', 'LM002'
    ],
    'Land Rover': [
      'Defender', 'Defender 90', 'Defender 110', 'Defender 130',
      'Discovery', 'Discovery Sport',
      'Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque',
      'LR2', 'LR3', 'LR4', 'Freelander'
    ],
    'Lotus': [
      'Emira', 'Evora', 'Eletre',
      'Elise', 'Exige', 'Evora GT', 'Esprit', 'Europa'
    ],
    'Maserati': [
      'Ghibli', 'Quattroporte', 'MC20', 'GranTurismo', 'GranCabrio', 'Grecale', 'Levante',
      'GranSport', 'Coupe', 'Spyder', '3200 GT'
    ],
    'McLaren': [
      'Artura', '720S', '720S Spider', '765LT', '750S',
      '570S', '570GT', '600LT', '540C', '675LT',
      'GT', 'Elva', 'Speedtail', 'Senna', 'P1', 'MP4-12C', 'F1'
    ],
    'Mini': [
      'Cooper', 'Cooper S', 'John Cooper Works',
      'Clubman', 'Countryman', 'Paceman', 'Coupe', 'Roadster', 'Convertible',
      'Cooper SE', 'Countryman PHEV'
    ],
    'Polestar': [
      'Polestar 1', 'Polestar 2', 'Polestar 3', 'Polestar 4', 'Polestar 5'
    ],
    'Rolls-Royce': [
      'Phantom', 'Ghost', 'Wraith', 'Dawn', 'Cullinan', 'Spectre',
      'Silver Shadow', 'Silver Spur', 'Corniche', 'Park Ward', 'Silver Seraph'
    ],
    'Saab': [
      '9-3', '9-5', '9-7X', '9-2X', '900', '9000'
    ],
    'Smart': [
      'Fortwo', 'Fortwo Electric', 'Forfour', 'Roadster', '#1'
    ],
    'Volvo': [
      'S60', 'S90', 'V60', 'V90',
      'XC40', 'XC40 Recharge', 'XC60', 'XC90', 'C40 Recharge', 'EX30', 'EX90',
      'C30', 'C70', 'S40', 'S80', 'V40', 'V50', 'V70', 'XC70', '240', '740', '850', '940', '960'
    ],
  
    // ============================================
    // OTHER MANUFACTURERS
    // ============================================
    'Fisker': [
      'Ocean', 'Pear', 'Ronin', 'Alaska', 'Karma'
    ],
    'Lucid': [
      'Air', 'Air Pure', 'Air Touring', 'Air Grand Touring', 'Gravity'
    ],
    'Rivian': [
      'R1T', 'R1S', 'R2', 'R3'
    ],
    'Scion': [
      'tC', 'xA', 'xB', 'xD', 'iA', 'iM', 'iQ', 'FR-S'
    ],
    'Saturn': [
      'Ion', 'Aura', 'Sky', 'L-Series', 'S-Series',
      'Vue', 'Outlook', 'Relay'
    ],
    'Pontiac': [
      'G6', 'G8', 'Grand Prix', 'Grand Am', 'Bonneville', 'Firebird', 'Trans Am', 'Solstice', 'GTO',
      'Vibe', 'Aztek', 'Torrent', 'Montana', 'Sunfire'
    ],
    'Oldsmobile': [
      'Alero', 'Aurora', 'Intrigue', 'Cutlass', 'Eighty-Eight', 'Ninety-Eight', 'Toronado',
      'Bravada', 'Silhouette'
    ],
    'Mercury': [
      'Grand Marquis', 'Sable', 'Milan', 'Montego', 'Cougar', 'Marauder',
      'Mountaineer', 'Mariner', 'Villager', 'Monterey'
    ],
    'Plymouth': [
      'Neon', 'Breeze', 'Prowler', 'Acclaim', 'Sundance', 'Laser',
      'Voyager', 'Grand Voyager', 'Barracuda', 'Duster', 'Roadrunner', 'Satellite', 'Fury', 'GTX', 'Cuda'
    ],
    'Isuzu': [
      'Trooper', 'Rodeo', 'Axiom', 'VehiCROSS', 'Ascender',
      'i-Series', 'Hombre', 'Amigo', 'Pickup'
    ],
    'Daewoo': [
      'Lanos', 'Nubira', 'Leganza', 'Matiz'
    ],
    'Datsun': [
      '240Z', '260Z', '280Z', '280ZX', '510', '610', '710', 'B210', 'F10', '200SX', '210', '310', '810', 'Maxima', 'Stanza'
    ],
    'DeLorean': [
      'DMC-12'
    ],
    'Eagle': [
      'Talon', 'Vision', 'Premier', 'Summit', 'Medallion'
    ],
    'Geo': [
      'Metro', 'Prizm', 'Storm', 'Tracker', 'Spectrum'
    ],
    'AMC': [
      'Gremlin', 'Hornet', 'Pacer', 'Javelin', 'AMX', 'Eagle', 'Spirit', 'Concord', 'Matador'
    ],
    'Bugatti': [
      'Chiron', 'Chiron Sport', 'Chiron Super Sport', 'Divo', 'Centodieci', 'Bolide', 'Mistral', 'Veyron', 'EB110'
    ],
    'Koenigsegg': [
      'Jesko', 'Jesko Absolut', 'Gemera', 'Regera', 'Agera', 'Agera RS', 'One:1', 'CCXR', 'CCX', 'CC8S'
    ],
    'Pagani': [
      'Huayra', 'Huayra Roadster', 'Huayra BC', 'Utopia', 'Zonda', 'Zonda R', 'Zonda Cinque'
    ],
    'Spyker': [
      'C8', 'C8 Aileron', 'C8 Laviolette', 'C8 Spyder', 'B6 Venator'
    ],
    'Morgan': [
      'Plus Four', 'Plus Six', 'Super 3', '3 Wheeler', 'Aero 8', 'Roadster', 'Plus 8'
    ],
    'TVR': [
      'Griffith', 'Tuscan', 'Sagaris', 'T350', 'Tamora', 'Cerbera', 'Chimaera'
    ],
    'Wiesmann': [
      'GT', 'GT MF5', 'Roadster', 'Roadster MF3', 'Thunderball'
    ],
    'Maybach': [
      '57', '62', '57S', '62S', 'Landaulet', 'Exelero'
    ],
    'Panoz': [
      'Esperante', 'Roadster', 'AIV Roadster', 'GTS'
    ],
    'Shelby': [
      'Cobra', 'GT350', 'GT500', 'GT-H', 'Series 1', 'SuperCars', '1000'
    ],
    'SSC': [
      'Tuatara', 'Ultimate Aero', 'Aero'
    ],
    'Vector': [
      'W8', 'M12', 'WX-3', 'Avtech WX-3'
    ],
    'Hennessey': [
      'Venom GT', 'Venom F5', 'Venom 1000', 'Mammoth 1000', 'VelociRaptor'
    ],
    'Rimac': [
      'Nevera', 'Concept One', 'Concept S'
    ],
    'Czinger': [
      '21C', 'Hyper GT'
    ],
    'Pininfarina': [
      'Battista', 'B95'
    ],
    'Karma': [
      'Revero', 'Revero GT', 'GS-6', 'GSe-6'
    ],
    'VinFast': [
      'VF 8', 'VF 9', 'VF 5', 'VF 6', 'VF 7'
    ],
    'BYD': [
      'Seal', 'Dolphin', 'Atto 3', 'Tang', 'Han', 'Song Plus', 'Yuan Plus', 'Seagull'
    ],
    'NIO': [
      'ES8', 'ES6', 'EC6', 'ET7', 'ET5', 'ES7', 'EC7', 'EP9'
    ],
    'XPeng': [
      'P7', 'P5', 'G3', 'G9', 'X9'
    ],
    'Li Auto': [
      'L9', 'L8', 'L7', 'One', 'L6', 'Mega'
    ],
    'Peugeot': [
      '208', '308', '408', '508', '2008', '3008', '5008',
      'e-208', 'e-308', 'e-2008', 'e-3008', 'e-5008',
      '206', '207', '307', '407', '607', '806', '807', 'Partner', 'Expert', 'Traveller', 'RCZ'
    ],
    'Citroën': [
      'C3', 'C4', 'C5 X', 'C5 Aircross',
      'ë-C3', 'ë-C4', 'ë-C4 X',
      'C1', 'C2', 'C3 Aircross', 'C4 Picasso', 'C4 Cactus', 'DS3', 'DS4', 'DS5', 'Berlingo', 'SpaceTourer'
    ],
    'Renault': [
      'Clio', 'Megane', 'Talisman', 'Scenic', 'Espace',
      'Captur', 'Kadjar', 'Koleos', 'Arkana', 'Austral',
      'Zoe', 'Megane E-Tech', 'Twingo', 'Fluence', 'Laguna', 'Latitude', 'Kangoo', 'Trafic', 'Master', 'Alpine A110'
    ],
    'Opel': [
      'Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland',
      'Corsa-e', 'Mokka-e', 'Astra-e', 'Combo-e Life', 'Zafira-e Life',
      'Adam', 'Karl', 'Meriva', 'Zafira', 'Vectra', 'Omega', 'Calibra', 'Manta', 'GT', 'Speedster', 'Antara', 'Frontera'
    ],
    'SEAT': [
      'Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco', 'Cupra Formentor', 'Cupra Born', 'Cupra Tavascan',
      'Toledo', 'Altea', 'Exeo', 'Mii', 'Alhambra'
    ],
    'Skoda': [
      'Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq iV', 'Enyaq Coupe iV',
      'Rapid', 'Roomster', 'Yeti', 'Citigo'
    ],
    'Dacia': [
      'Sandero', 'Logan', 'Duster', 'Jogger', 'Spring',
      'Lodgy', 'Dokker'
    ],
    'Lancia': [
      'Ypsilon', 'Delta', 'Thema', 'Musa', 'Phedra', 'Thesis', 'Voyager', 'Stratos', 'Fulvia', '037', 'Aurelia', 'Flaminia', 'Flavia'
    ],
    'DS Automobiles': [
      'DS 3', 'DS 3 Crossback', 'DS 4', 'DS 7', 'DS 9',
      'DS 3 E-Tense', 'DS 4 E-Tense', 'DS 7 E-Tense', 'DS 9 E-Tense'
    ],
    'Cupra': [
      'Formentor', 'Leon', 'Born', 'Tavascan', 'Ateca', 'Terramar'
    ],
    'Alpine': [
      'A110', 'A110 S', 'A110 R', 'A290'
    ]
  }
  
  // Get all available makes (sorted alphabetically)
  export function getAllMakes(): string[] {
    return Object.keys(vehicleDatabase).sort()
  }
  
  // Get models for a specific make
  export function getModelsByMake(make: string): string[] {
    return vehicleDatabase[make] || []
  }
  
  // Get available years (from current year down to 2000)
  export function getYears(): number[] {
    const currentYear = new Date().getFullYear()
    const years: number[] = []
    for (let year = currentYear + 1; year >= 2000; year--) {
      years.push(year)
    }
    return years
  }
  
  // Get years as strings for select options
  export function getYearStrings(): string[] {
    return getYears().map(year => year.toString())
  }
  
  // Search makes by partial name
  export function searchMakes(query: string): string[] {
    const lowerQuery = query.toLowerCase()
    return getAllMakes().filter(make => 
      make.toLowerCase().includes(lowerQuery)
    )
  }
  
  // Search models by partial name within a make
  export function searchModels(make: string, query: string): string[] {
    const models = getModelsByMake(make)
    const lowerQuery = query.toLowerCase()
    return models.filter(model => 
      model.toLowerCase().includes(lowerQuery)
    )
  }
  
  // Validate if a make exists
  export function isValidMake(make: string): boolean {
    return make in vehicleDatabase
  }
  
  // Validate if a model exists for a given make
  export function isValidModel(make: string, model: string): boolean {
    const models = getModelsByMake(make)
    return models.includes(model)
  }
  
  // Get popular makes (commonly rented vehicles)
  export function getPopularMakes(): string[] {
    return [
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan',
      'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz', 'Audi',
      'Lexus', 'Tesla', 'Jeep', 'Subaru', 'Mazda',
      'Volkswagen', 'Ram', 'GMC', 'Dodge', 'Cadillac'
    ]
  }
  
  // Get luxury makes
  export function getLuxuryMakes(): string[] {
    return [
      'Aston Martin', 'Bentley', 'Bugatti', 'Ferrari', 'Lamborghini',
      'Maserati', 'McLaren', 'Porsche', 'Rolls-Royce', 'Koenigsegg',
      'Pagani', 'Rimac', 'Lucid', 'Genesis', 'Lexus', 'BMW',
      'Mercedes-Benz', 'Audi', 'Cadillac', 'Lincoln', 'Infiniti', 'Acura'
    ]
  }
  
  // Get electric vehicle makes
  export function getEVMakes(): string[] {
    return [
      'Tesla', 'Rivian', 'Lucid', 'Polestar', 'Fisker',
      'NIO', 'XPeng', 'BYD', 'VinFast', 'Rimac', 'Pininfarina'
    ]
  }
  
  // Count total makes and models
  export function getVehicleStats(): { totalMakes: number; totalModels: number } {
    const makes = Object.keys(vehicleDatabase)
    let totalModels = 0
    makes.forEach(make => {
      totalModels += vehicleDatabase[make].length
    })
    return {
      totalMakes: makes.length,
      totalModels
    }
  }
  
  // Type for vehicle selection
  export interface VehicleSelection {
    make: string
    model: string
    year: string
  }
  
  // Validate complete vehicle selection
  export function isValidVehicleSelection(selection: VehicleSelection): boolean {
    const { make, model, year } = selection
    const yearNum = parseInt(year)
    const years = getYears()
    
    return (
      isValidMake(make) &&
      isValidModel(make, model) &&
      years.includes(yearNum)
    )
  }
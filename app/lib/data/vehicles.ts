// app/lib/data/vehicles.ts
// Comprehensive vehicle database with makes, models, trims, and specifications

export type CarType = 'sedan' | 'suv' | 'truck' | 'coupe' | 'convertible' | 'hatchback' | 'minivan' | 'wagon' | 'sports' | 'crossover'
export type FuelType = 'gas' | 'diesel' | 'electric' | 'hybrid' | 'plug-in hybrid' | 'hydrogen'
export type TransmissionType = 'automatic' | 'manual' | 'cvt' | 'both' | 'automatic/manual'

export interface CarSpec {
  trims: string[]
  seats: number
  doors: number
  transmission: TransmissionType
  carType: CarType
  fuelType: FuelType | 'gas/hybrid' | 'gas/electric' | 'gas/hybrid/electric' // "gas/hybrid" means user picks
}

export interface VehicleDatabase {
  [make: string]: {
    [model: string]: CarSpec
  }
}

// Year-based vehicle database interface
export interface YearBasedVehicleDatabase {
  [make: string]: {
    [model: string]: {
      [year: string]: CarSpec
    }
  }
}

// ============================================
// COMPREHENSIVE VEHICLE DATABASE
// ============================================
export const vehicleSpecs: VehicleDatabase = {
  // ============================================
  // LUXURY / EXOTIC
  // ============================================
  'Lamborghini': {
    'Huracán': { trims: ['EVO', 'EVO Spyder', 'STO', 'Tecnica', 'Sterrato'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    'Urus': { trims: ['Base', 'S', 'Performante'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Revuelto': { trims: ['Base'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'hybrid' },
    'Aventador': { trims: ['LP 700-4', 'LP 750-4 SV', 'S', 'SVJ'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    'Gallardo': { trims: ['LP 550-2', 'LP 560-4', 'LP 570-4 Superleggera'], seats: 2, doors: 2, transmission: 'both', carType: 'sports', fuelType: 'gas' },
  },
  'Ferrari': {
    '296 GTB': { trims: ['Base', 'Assetto Fiorano'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'hybrid' },
    '296 GTS': { trims: ['Base', 'Assetto Fiorano'], seats: 2, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'hybrid' },
    'Roma': { trims: ['Base'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    'Roma Spider': { trims: ['Base'], seats: 4, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas' },
    'Portofino M': { trims: ['Base'], seats: 4, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas' },
    'SF90 Stradale': { trims: ['Base', 'Assetto Fiorano'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'hybrid' },
    'SF90 Spider': { trims: ['Base', 'Assetto Fiorano'], seats: 2, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'hybrid' },
    '812 Superfast': { trims: ['Base'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    '812 GTS': { trims: ['Base'], seats: 2, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas' },
    'Purosangue': { trims: ['Base'], seats: 4, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'F8 Tributo': { trims: ['Base'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    'F8 Spider': { trims: ['Base'], seats: 2, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas' },
    '488 GTB': { trims: ['Base'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    '488 Spider': { trims: ['Base'], seats: 2, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas' },
    '458 Italia': { trims: ['Base', 'Speciale'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
  },
  'Porsche': {
    '911': { trims: ['Carrera', 'Carrera S', 'Carrera 4', 'Carrera 4S', 'Targa 4', 'Targa 4S', 'Turbo', 'Turbo S', 'GT3', 'GT3 RS', 'GT2 RS'], seats: 4, doors: 2, transmission: 'both', carType: 'sports', fuelType: 'gas' },
    '718 Boxster': { trims: ['Base', 'T', 'S', 'GTS 4.0', 'Spyder'], seats: 2, doors: 2, transmission: 'both', carType: 'convertible', fuelType: 'gas' },
    '718 Cayman': { trims: ['Base', 'T', 'S', 'GTS 4.0', 'GT4', 'GT4 RS'], seats: 2, doors: 2, transmission: 'both', carType: 'coupe', fuelType: 'gas' },
    'Taycan': { trims: ['Base', '4S', 'GTS', 'Turbo', 'Turbo S'], seats: 4, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
    'Taycan Sport Turismo': { trims: ['Base', '4S', 'GTS', 'Turbo', 'Turbo S'], seats: 4, doors: 4, transmission: 'automatic', carType: 'wagon', fuelType: 'electric' },
    'Taycan Cross Turismo': { trims: ['4', '4S', 'GTS', 'Turbo', 'Turbo S'], seats: 4, doors: 4, transmission: 'automatic', carType: 'wagon', fuelType: 'electric' },
    'Panamera': { trims: ['Base', '4', '4S', 'GTS', 'Turbo', 'Turbo S'], seats: 4, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'Macan': { trims: ['Base', 'S', 'GTS', 'Turbo'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Macan Electric': { trims: ['4', '4S', 'Turbo'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Cayenne': { trims: ['Base', 'S', 'E-Hybrid', 'GTS', 'Turbo', 'Turbo GT'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Cayenne Coupe': { trims: ['Base', 'S', 'E-Hybrid', 'GTS', 'Turbo', 'Turbo GT'], seats: 4, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
  },
  'Bentley': {
    'Continental GT': { trims: ['V8', 'Speed', 'Mulliner'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    'Continental GTC': { trims: ['V8', 'Speed', 'Mulliner'], seats: 4, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas' },
    'Flying Spur': { trims: ['V8', 'Hybrid', 'Speed', 'Mulliner'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'Bentayga': { trims: ['V8', 'S', 'Azure', 'Speed', 'EWB'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
  },
  'Rolls-Royce': {
    'Phantom': { trims: ['Base', 'EWB'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'Ghost': { trims: ['Base', 'EWB', 'Black Badge'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'Wraith': { trims: ['Base', 'Black Badge'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    'Dawn': { trims: ['Base', 'Black Badge'], seats: 4, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas' },
    'Cullinan': { trims: ['Base', 'Black Badge'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Spectre': { trims: ['Base'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'electric' },
  },
  'McLaren': {
    'Artura': { trims: ['Base', 'Spider'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'hybrid' },
    '750S': { trims: ['Coupe', 'Spider'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    '720S': { trims: ['Coupe', 'Spider'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    '765LT': { trims: ['Coupe', 'Spider'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    'GT': { trims: ['Base'], seats: 2, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    '570S': { trims: ['Coupe', 'Spider'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    '600LT': { trims: ['Coupe', 'Spider'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
  },
  'Aston Martin': {
    'DB12': { trims: ['Base', 'Volante'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    'DB11': { trims: ['V8', 'V8 Volante', 'V12', 'V12 Volante'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    'DBS': { trims: ['Coupe', 'Volante'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    'Vantage': { trims: ['Base', 'Roadster', 'F1 Edition'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    'DBX': { trims: ['Base', 'V8'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'DBX707': { trims: ['Base'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
  },
  'Maserati': {
    'GranTurismo': { trims: ['Modena', 'Trofeo', 'Folgore'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas/electric' },
    'GranCabrio': { trims: ['Modena', 'Trofeo', 'Folgore'], seats: 4, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas/electric' },
    'MC20': { trims: ['Coupe', 'Cielo'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    'Ghibli': { trims: ['Base', 'Modena', 'Trofeo'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'Quattroporte': { trims: ['Modena', 'Trofeo'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'Grecale': { trims: ['GT', 'Modena', 'Trofeo', 'Folgore'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/electric' },
    'Levante': { trims: ['GT', 'Modena', 'Trofeo'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
  },

  // ============================================
  // PREMIUM GERMAN
  // ============================================
  'BMW': {
    '2 Series': { trims: ['230i', '230i xDrive', 'M240i', 'M240i xDrive'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    '3 Series': { trims: ['330i', '330i xDrive', '330e', 'M340i', 'M340i xDrive'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    // Direct model entries for fuzzy matching
    '330i': { trims: ['Base', 'xDrive'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    '340i': { trims: ['Base', 'xDrive'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    '4 Series': { trims: ['430i', '430i xDrive', 'M440i', 'M440i xDrive'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    '430i': { trims: ['Base', 'xDrive'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    '4 Series Gran Coupe': { trims: ['430i', '430i xDrive', 'M440i', 'M440i xDrive'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    '5 Series': { trims: ['530i', '530i xDrive', '540i xDrive', '550e xDrive'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    '7 Series': { trims: ['740i', '740i xDrive', '750e xDrive', '760i xDrive'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    '8 Series': { trims: ['840i', '840i xDrive', 'M850i xDrive'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    '8 Series Gran Coupe': { trims: ['840i', '840i xDrive', 'M850i xDrive'], seats: 4, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'X1': { trims: ['sDrive28i', 'xDrive28i'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'X2': { trims: ['sDrive28i', 'xDrive28i', 'M35i'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'X3': { trims: ['xDrive30', 'M50'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'X4': { trims: ['xDrive30i', 'M40i'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'X5': { trims: ['sDrive40i', 'xDrive40i', 'xDrive50e', 'M60i', 'M Competition'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'X6': { trims: ['sDrive40i', 'xDrive40i', 'M50i'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'X7': { trims: ['xDrive40i', 'M60i', 'ALPINA XB7'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Z4': { trims: ['sDrive30i', 'M40i'], seats: 2, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas' },
    'i3': { trims: ['Base', 'S', 'with Range Extender'], seats: 4, doors: 4, transmission: 'automatic', carType: 'hatchback', fuelType: 'electric' },
    'i3s': { trims: ['Base', 'with Range Extender'], seats: 4, doors: 4, transmission: 'automatic', carType: 'hatchback', fuelType: 'electric' },
    'I3': { trims: ['Base', 'S', 'with Range Extender'], seats: 4, doors: 4, transmission: 'automatic', carType: 'hatchback', fuelType: 'electric' },
    'I3 S': { trims: ['Base', 'with Range Extender'], seats: 4, doors: 4, transmission: 'automatic', carType: 'hatchback', fuelType: 'electric' },
    'i4': { trims: ['eDrive40', 'xDrive40', 'M50'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
    'i5': { trims: ['eDrive40', 'xDrive40', 'M60 xDrive'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
    'i7': { trims: ['eDrive50', 'xDrive60', 'M70 xDrive'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
    'iX': { trims: ['xDrive50', 'M60'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'M2': { trims: ['Base'], seats: 4, doors: 2, transmission: 'both', carType: 'coupe', fuelType: 'gas' },
    'M3': { trims: ['Base', 'Competition', 'Competition xDrive'], seats: 5, doors: 4, transmission: 'both', carType: 'sedan', fuelType: 'gas' },
    'M4': { trims: ['Base', 'Competition', 'Competition xDrive', 'CS'], seats: 4, doors: 2, transmission: 'both', carType: 'coupe', fuelType: 'gas' },
    'M5': { trims: ['Base'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'hybrid' },
    'M8': { trims: ['Base', 'Competition'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    'X3 M': { trims: ['Base', 'Competition'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'X5 M': { trims: ['Base', 'Competition'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'X6 M': { trims: ['Base', 'Competition'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'XM': { trims: ['Base', 'Label Red'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'hybrid' },
  },
  'Mercedes-Benz': {
    'A-Class': { trims: ['A 220', 'A 220 4MATIC', 'AMG A 35 4MATIC'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'C-Class': { trims: ['C 300', 'C 300 4MATIC', 'AMG C 43 4MATIC', 'AMG C 63 S E PERFORMANCE'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'E-Class': { trims: ['E 350', 'E 350 4MATIC', 'E 450 4MATIC', 'E 450 4MATIC All-Terrain', 'AMG E 53 Hybrid'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'S-Class': { trims: ['S 500 4MATIC', 'S 580 4MATIC', 'S 580e 4MATIC', 'AMG S 63 E PERFORMANCE'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    // Direct model entries for fuzzy matching
    'S 550': { trims: ['Base', '4MATIC'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'S550': { trims: ['Base', '4MATIC'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'S 63': { trims: ['AMG', 'AMG 4MATIC'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    'CLA': { trims: ['CLA 250', 'CLA 250 4MATIC', 'AMG CLA 35 4MATIC', 'AMG CLA 45 4MATIC+'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'CLS': { trims: ['CLS 450 4MATIC', 'AMG CLS 53 4MATIC+'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'GLA': { trims: ['GLA 250', 'GLA 250 4MATIC', 'AMG GLA 35 4MATIC', 'AMG GLA 45 4MATIC+'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'GLB': { trims: ['GLB 250', 'GLB 250 4MATIC', 'AMG GLB 35 4MATIC'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'GLC': { trims: ['GLC 300', 'GLC 300 4MATIC', 'GLC 350e 4MATIC', 'AMG GLC 43 4MATIC', 'AMG GLC 63 S E PERFORMANCE'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'GLC Coupe': { trims: ['GLC 300 4MATIC', 'AMG GLC 43 4MATIC', 'AMG GLC 63 S E PERFORMANCE'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'GLE': { trims: ['GLE 350', 'GLE 350 4MATIC', 'GLE 450 4MATIC', 'GLE 450e 4MATIC', 'GLE 580 4MATIC', 'AMG GLE 53 4MATIC+', 'AMG GLE 63 S 4MATIC+'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'GLE Coupe': { trims: ['GLE 450 4MATIC', 'AMG GLE 53 4MATIC+', 'AMG GLE 63 S 4MATIC+'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'GLS': { trims: ['GLS 450 4MATIC', 'GLS 580 4MATIC', 'AMG GLS 63 4MATIC+', 'Maybach GLS 600 4MATIC'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'G-Class': { trims: ['G 550', 'AMG G 63', 'G 580 with EQ Technology'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/electric' },
    'SL': { trims: ['SL 55 4MATIC+', 'SL 63 4MATIC+'], seats: 2, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas' },
    'AMG GT': { trims: ['43', '53', '55', '63', '63 S E PERFORMANCE'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas/hybrid' },
    'AMG GT Roadster': { trims: ['Roadster', 'C Roadster', 'R Roadster'], seats: 2, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas' },
    'EQS': { trims: ['EQS 450+', 'EQS 450 4MATIC', 'EQS 580 4MATIC', 'AMG EQS'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
    'EQS SUV': { trims: ['EQS 450+', 'EQS 450 4MATIC', 'EQS 580 4MATIC', 'AMG EQS SUV'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'EQE': { trims: ['EQE 350+', 'EQE 350 4MATIC', 'EQE 500 4MATIC', 'AMG EQE'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
    'EQE SUV': { trims: ['EQE 350+', 'EQE 350 4MATIC', 'EQE 500 4MATIC', 'AMG EQE SUV'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'EQB': { trims: ['EQB 250+', 'EQB 300 4MATIC', 'EQB 350 4MATIC'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Maybach S-Class': { trims: ['S 580 4MATIC', 'S 680 4MATIC'], seats: 4, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
  },
  'Audi': {
    'A3': { trims: ['Premium', 'Premium Plus'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'A4': { trims: ['Premium', 'Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'A5 Sportback': { trims: ['Premium', 'Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'A6': { trims: ['Premium', 'Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'A6 allroad': { trims: ['Premium', 'Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'wagon', fuelType: 'gas' },
    'A7': { trims: ['Premium', 'Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'A8 L': { trims: ['55 TFSI', '60 TFSI e'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'Q3': { trims: ['Premium', 'Premium Plus'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Q4 e-tron': { trims: ['Premium', 'Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Q4 Sportback e-tron': { trims: ['Premium', 'Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Q5': { trims: ['Premium', 'Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Q5 Sportback': { trims: ['Premium', 'Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Q7': { trims: ['Premium', 'Premium Plus', 'Prestige'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Q8': { trims: ['Premium', 'Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'TT': { trims: ['45 TFSI', '45 TFSI quattro'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    'TT Roadster': { trims: ['45 TFSI', '45 TFSI quattro'], seats: 2, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas' },
    'R8': { trims: ['V10 performance', 'V10 performance Spyder'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    'S3': { trims: ['Base'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'S4': { trims: ['Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'S5 Sportback': { trims: ['Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'S6': { trims: ['Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'S7': { trims: ['Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'S8': { trims: ['Base'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'S e-tron GT': { trims: ['Premium Plus', 'Prestige'], seats: 4, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
    'RS3': { trims: ['Base'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'RS5 Sportback': { trims: ['Base'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'RS6 Avant': { trims: ['Performance', 'GT'], seats: 5, doors: 4, transmission: 'automatic', carType: 'wagon', fuelType: 'gas' },
    'RS7': { trims: ['Performance'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'RS e-tron GT': { trims: ['Performance'], seats: 4, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
    'SQ5': { trims: ['Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'SQ5 Sportback': { trims: ['Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'SQ7': { trims: ['Premium Plus', 'Prestige'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'SQ8': { trims: ['Premium Plus', 'Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'RS Q8': { trims: ['Performance'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
  },

  // ============================================
  // PREMIUM JAPANESE
  // ============================================
  'Lexus': {
    'IS': { trims: ['IS 300', 'IS 300 AWD', 'IS 350', 'IS 350 AWD', 'IS 500 F SPORT Performance'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'ES': { trims: ['ES 250 AWD', 'ES 300h', 'ES 350', 'ES 350 F SPORT'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'LS': { trims: ['LS 500', 'LS 500 AWD', 'LS 500h AWD'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'LC': { trims: ['LC 500', 'LC 500 Convertible', 'LC 500h'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas/hybrid' },
    'RC': { trims: ['RC 300', 'RC 300 AWD', 'RC 350', 'RC 350 AWD', 'RC F', 'RC F Final Edition'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    'UX': { trims: ['UX 300h', 'UX 300h AWD'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'hybrid' },
    'NX': { trims: ['NX 250', 'NX 250 AWD', 'NX 350', 'NX 350h', 'NX 450h+'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'RX': { trims: ['RX 350', 'RX 350 AWD', 'RX 350h', 'RX 350h AWD', 'RX 450h+', 'RX 500h'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'GX': { trims: ['GX 550 Premium', 'GX 550 Premium+', 'GX 550 Luxury', 'GX 550 Luxury+', 'GX 550 Overtrail', 'GX 550 Overtrail+'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'LX 600': { trims: ['Premium', 'Luxury', 'F Sport Handling'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'LX 700h': { trims: ['Luxury', 'F Sport Handling', 'Ultra Luxury', 'Overtrail'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'hybrid' },
    'TX': { trims: ['TX 350', 'TX 500h', 'TX 550h+'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'RZ': { trims: ['RZ 300e', 'RZ 450e'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
  },
  'Acura': {
    'Integra': { trims: ['Base', 'A-Spec', 'A-Spec w/ Technology', 'Type S'], seats: 5, doors: 4, transmission: 'both', carType: 'hatchback', fuelType: 'gas' },
    'TLX': { trims: ['Base', 'Technology', 'A-Spec', 'Advance', 'Type S', 'Type S Advance'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'RDX': { trims: ['Base', 'Technology', 'A-Spec', 'Advance', 'A-Spec Advance'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'MDX': { trims: ['Base', 'Technology', 'A-Spec', 'Advance', 'Type S', 'Type S Advance'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'ZDX': { trims: ['A-Spec', 'Type S'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
  },
  'Infiniti': {
    'Q50': { trims: ['Pure', 'Luxe', 'Sensory', 'Red Sport 400'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'Q60': { trims: ['Pure', 'Luxe', 'Red Sport 400'], seats: 4, doors: 2, transmission: 'automatic', carType: 'coupe', fuelType: 'gas' },
    'QX50': { trims: ['Pure', 'Luxe', 'Essential', 'Sensory', 'Autograph'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'QX55': { trims: ['Luxe', 'Essential', 'Sensory'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'QX60': { trims: ['Pure', 'Luxe', 'Sensory', 'Autograph'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'QX80': { trims: ['Luxe', 'Premium Select', 'Sensory', 'Autograph'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
  },
  'Genesis': {
    'G70': { trims: ['2.0T Standard', '2.0T Advanced', '3.3T Standard', '3.3T Sport', '3.3T Sport Prestige'], seats: 5, doors: 4, transmission: 'both', carType: 'sedan', fuelType: 'gas' },
    'G80': { trims: ['2.5T Standard', '2.5T Advanced', '2.5T Prestige', '3.5T Sport', '3.5T Sport Prestige', 'Electrified'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/electric' },
    'G90': { trims: ['3.5T Standard', '3.5T E-Supercharger', '3.5T E-Supercharger Long Wheelbase'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'GV60': { trims: ['Advanced', 'Performance'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'GV70': { trims: ['2.5T Standard', '2.5T Advanced', '2.5T Sport Prestige', '3.5T Sport Prestige', 'Electrified'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/electric' },
    'GV80': { trims: ['2.5T Standard', '2.5T Advanced', '2.5T Advanced+', '3.5T Sport', '3.5T Prestige'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'GV80 Coupe': { trims: ['2.5T Advanced', '3.5T Advanced+', '3.5T Sport Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
  },

  // ============================================
  // MAINSTREAM JAPANESE
  // ============================================
  'Toyota': {
    'Camry': { trims: ['LE', 'SE', 'SE Nightshade', 'XLE', 'XSE', 'TRD'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'Corolla': { trims: ['L', 'LE', 'SE', 'XLE', 'XSE'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'Corolla Hatchback': { trims: ['SE', 'XSE', 'Nightshade'], seats: 5, doors: 4, transmission: 'both', carType: 'hatchback', fuelType: 'gas' },
    'Crown': { trims: ['XLE', 'Limited', 'Platinum'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'hybrid' },
    'Prius': { trims: ['L Eco', 'LE', 'XLE', 'Limited'], seats: 5, doors: 5, transmission: 'cvt', carType: 'hatchback', fuelType: 'hybrid' },
    'Prius Prime': { trims: ['LE', 'XLE', 'Limited'], seats: 4, doors: 5, transmission: 'cvt', carType: 'hatchback', fuelType: 'plug-in hybrid' },
    'Prius Prime PHEV': { trims: ['LE', 'XLE', 'Limited'], seats: 4, doors: 5, transmission: 'cvt', carType: 'hatchback', fuelType: 'plug-in hybrid' },
    'GR86': { trims: ['Base', 'Premium', 'Special Edition'], seats: 4, doors: 2, transmission: 'both', carType: 'coupe', fuelType: 'gas' },
    'Supra': { trims: ['2.0', '3.0', '3.0 Premium', 'A91-MT Edition', 'A91-CF Edition'], seats: 2, doors: 2, transmission: 'both', carType: 'sports', fuelType: 'gas' },
    'Mirai': { trims: ['XLE', 'Limited'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'hydrogen' },
    'C-HR': { trims: ['LE', 'XLE', 'Nightshade', 'Limited'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Corolla Cross': { trims: ['L', 'LE', 'XLE', 'S', 'SE'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'RAV4': { trims: ['LE', 'XLE', 'XLE Premium', 'Adventure', 'TRD Off-Road', 'Limited', 'Prime SE', 'Prime XSE'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Venza': { trims: ['LE', 'XLE', 'Limited', 'Nightshade'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'hybrid' },
    'Highlander': { trims: ['L', 'LE', 'XLE', 'XSE', 'Limited', 'Platinum', 'Bronze Edition'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Grand Highlander': { trims: ['XLE', 'Limited', 'Platinum', 'Limited Max', 'Platinum Max'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    '4Runner': { trims: ['SR5', 'SR5 Premium', 'TRD Sport', 'TRD Off-Road', 'TRD Off-Road Premium', 'Limited', 'TRD Pro', 'Limited i-FORCE MAX'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Sequoia': { trims: ['SR5', 'Limited', 'Platinum', 'TRD Pro', 'Capstone'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'hybrid' },
    'Land Cruiser': { trims: ['1958', 'Land Cruiser', 'First Edition'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'hybrid' },
    'bZ4X': { trims: ['XLE', 'Limited'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Tacoma': { trims: ['SR', 'SR5', 'TRD Sport', 'TRD Off-Road', 'Limited', 'TRD Pro', 'Trailhunter'], seats: 5, doors: 4, transmission: 'both', carType: 'truck', fuelType: 'gas/hybrid' },
    'Tundra': { trims: ['SR', 'SR5', 'Limited', 'Platinum', '1794 Edition', 'TRD Pro', 'Capstone'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas/hybrid' },
    'Sienna': { trims: ['LE', 'XLE', 'XSE', 'Woodland Edition', 'Limited', 'Platinum', '25th Anniversary Limited'], seats: 8, doors: 4, transmission: 'automatic', carType: 'minivan', fuelType: 'hybrid' },
  },
  'Honda': {
    'Civic': { trims: ['LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Si', 'Type R'], seats: 5, doors: 4, transmission: 'both', carType: 'sedan', fuelType: 'gas' },
    'Civic Hatchback': { trims: ['LX', 'Sport', 'EX-L', 'Sport Touring', 'Si', 'Type R'], seats: 5, doors: 4, transmission: 'both', carType: 'hatchback', fuelType: 'gas' },
    'Accord': { trims: ['LX', 'EX', 'EX-L', 'Sport', 'Sport-L', 'Touring'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'HR-V': { trims: ['LX', 'Sport', 'EX-L'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'CR-V': { trims: ['LX', 'EX', 'EX-L', 'Sport', 'Sport-L', 'Touring', 'Sport Touring'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Passport': { trims: ['Sport', 'EX-L', 'TrailSport', 'Touring', 'Elite'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Pilot': { trims: ['LX', 'Sport', 'EX-L', 'TrailSport', 'Touring', 'Elite', 'Black Edition'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Prologue': { trims: ['EX', 'Touring', 'Elite'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Ridgeline': { trims: ['Sport', 'RTL', 'RTL-E', 'TrailSport', 'Black Edition'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas' },
    'Odyssey': { trims: ['LX', 'EX', 'EX-L', 'Sport', 'Touring', 'Elite'], seats: 8, doors: 4, transmission: 'automatic', carType: 'minivan', fuelType: 'gas' },
  },
  'Nissan': {
    'Sentra': { trims: ['S', 'SV', 'SR', 'SR Midnight Edition'], seats: 5, doors: 4, transmission: 'cvt', carType: 'sedan', fuelType: 'gas' },
    'Altima': { trims: ['S', 'SV', 'SR', 'SR VC-Turbo', 'SL', 'Platinum'], seats: 5, doors: 4, transmission: 'cvt', carType: 'sedan', fuelType: 'gas' },
    'Versa': { trims: ['S', 'SV', 'SR'], seats: 5, doors: 4, transmission: 'cvt', carType: 'sedan', fuelType: 'gas' },
    'Leaf': { trims: ['S', 'SV Plus'], seats: 5, doors: 4, transmission: 'automatic', carType: 'hatchback', fuelType: 'electric' },
    'Z': { trims: ['Sport', 'Performance', 'NISMO'], seats: 2, doors: 2, transmission: 'both', carType: 'sports', fuelType: 'gas' },
    'GT-R': { trims: ['Premium', 'T-Spec', 'NISMO'], seats: 4, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    'Kicks': { trims: ['S', 'SV', 'SR'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Rogue': { trims: ['S', 'SV', 'SL', 'Platinum', 'Rock Creek'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Murano': { trims: ['S', 'SV', 'SL', 'Platinum'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Pathfinder': { trims: ['S', 'SV', 'SL', 'Rock Creek', 'Platinum'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Armada': { trims: ['S', 'SV', 'SL', 'Platinum', 'Midnight Edition'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Ariya': { trims: ['Engage', 'Venture+', 'Evolve+', 'Empower+', 'Premiere', 'Platinum+'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Frontier': { trims: ['S', 'SV', 'PRO-X', 'PRO-4X'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas' },
    'Titan': { trims: ['S', 'SV', 'PRO-4X', 'SL', 'Platinum Reserve'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas' },
  },
  'Mazda': {
    'Mazda3': { trims: ['2.5 S', '2.5 S Select', '2.5 S Preferred', '2.5 S Premium', '2.5 S Premium Plus', '2.5 Turbo', '2.5 Turbo Premium Plus'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'Mazda3 Hatchback': { trims: ['2.5 S', '2.5 S Select', '2.5 S Preferred', '2.5 S Premium', '2.5 S Premium Plus', '2.5 Turbo', '2.5 Turbo Premium Plus'], seats: 5, doors: 4, transmission: 'automatic', carType: 'hatchback', fuelType: 'gas' },
    'MX-5 Miata': { trims: ['Sport', 'Club', 'Grand Touring'], seats: 2, doors: 2, transmission: 'both', carType: 'convertible', fuelType: 'gas' },
    'MX-5 Miata RF': { trims: ['Sport', 'Club', 'Grand Touring'], seats: 2, doors: 2, transmission: 'both', carType: 'convertible', fuelType: 'gas' },
    'CX-30': { trims: ['2.5 S', '2.5 S Select', '2.5 S Preferred', '2.5 S Premium', '2.5 Turbo', '2.5 Turbo Premium', '2.5 Turbo Premium Plus'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'CX-50': { trims: ['2.5 S', '2.5 S Select', '2.5 S Preferred', '2.5 S Premium', '2.5 S Premium Plus', '2.5 Turbo', '2.5 Turbo Meridian Edition', '2.5 Turbo Premium', '2.5 Turbo Premium Plus'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'CX-5': { trims: ['2.5 S', '2.5 S Select', '2.5 S Preferred', '2.5 S Premium', '2.5 S Premium Plus', '2.5 Turbo', '2.5 Turbo Signature'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'CX-70': { trims: ['3.3 Turbo S', '3.3 Turbo S Premium', '3.3 Turbo S Premium Plus'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'CX-90': { trims: ['3.3 Turbo S', '3.3 Turbo S Premium', '3.3 Turbo S Premium Plus', 'PHEV Premium', 'PHEV Premium Plus'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'MX-30': { trims: ['Base', 'Premium Plus'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
  },
  'Subaru': {
    'Impreza': { trims: ['Base', 'Sport', 'RS'], seats: 5, doors: 4, transmission: 'automatic', carType: 'hatchback', fuelType: 'gas' },
    'Legacy': { trims: ['Base', 'Premium', 'Sport', 'Limited', 'Touring XT'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'WRX': { trims: ['Base', 'Premium', 'Limited', 'GT'], seats: 5, doors: 4, transmission: 'both', carType: 'sedan', fuelType: 'gas' },
    'BRZ': { trims: ['Premium', 'Limited', 'tS'], seats: 4, doors: 2, transmission: 'both', carType: 'coupe', fuelType: 'gas' },
    'Crosstrek': { trims: ['Base', 'Premium', 'Sport', 'Limited', 'Wilderness'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Forester': { trims: ['Base', 'Premium', 'Sport', 'Limited', 'Touring', 'Wilderness'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Outback': { trims: ['Base', 'Premium', 'Limited', 'Touring', 'Onyx Edition', 'Onyx Edition XT', 'Limited XT', 'Touring XT', 'Wilderness'], seats: 5, doors: 4, transmission: 'automatic', carType: 'wagon', fuelType: 'gas' },
    'Ascent': { trims: ['Base', 'Premium', 'Onyx Edition', 'Limited', 'Touring'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Solterra': { trims: ['Premium', 'Limited', 'Touring'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
  },

  // ============================================
  // MAINSTREAM AMERICAN
  // ============================================
  'Ford': {
    'Mustang': { trims: ['EcoBoost', 'EcoBoost Premium', 'GT', 'GT Premium', 'Dark Horse', 'Dark Horse Premium'], seats: 4, doors: 2, transmission: 'both', carType: 'coupe', fuelType: 'gas' },
    'Mustang Convertible': { trims: ['EcoBoost', 'EcoBoost Premium', 'GT', 'GT Premium'], seats: 4, doors: 2, transmission: 'both', carType: 'convertible', fuelType: 'gas' },
    'Mustang Mach-E': { trims: ['Select', 'Premium', 'California Route 1', 'GT', 'Rally'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'EcoSport': { trims: ['S', 'SE', 'SES'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Escape': { trims: ['Base', 'Active', 'ST-Line', 'ST-Line Select', 'Platinum'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Bronco Sport': { trims: ['Base', 'Big Bend', 'Outer Banks', 'Badlands', 'Heritage Limited', 'Heritage Edition', 'Free Wheeling'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Bronco': { trims: ['Base', 'Big Bend', 'Black Diamond', 'Outer Banks', 'Badlands', 'Wildtrak', 'Everglades', 'Raptor', 'Heritage Edition', 'Heritage Limited'], seats: 5, doors: 4, transmission: 'both', carType: 'suv', fuelType: 'gas' },
    'Edge': { trims: ['SE', 'SEL', 'ST-Line', 'ST'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Explorer': { trims: ['Base', 'XLT', 'ST-Line', 'Timberline', 'Limited', 'ST', 'Platinum', 'King Ranch'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Expedition': { trims: ['XLT', 'XLT Max', 'Limited', 'Limited Max', 'Timberline', 'King Ranch', 'King Ranch Max', 'Platinum', 'Platinum Max'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Maverick': { trims: ['XL', 'XLT', 'Lariat', 'Tremor'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas/hybrid' },
    'Ranger': { trims: ['XL', 'XLT', 'Lariat', 'Raptor'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas' },
    'F-150': { trims: ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Tremor', 'Raptor', 'Raptor R'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas/hybrid' },
    'F-150 Lightning': { trims: ['Pro', 'XLT', 'Lariat', 'Platinum', 'Flash'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'electric' },
    'F-250': { trims: ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Tremor'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas/diesel' },
    'F-350': { trims: ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas/diesel' },
    'Transit Connect': { trims: ['XL Cargo Van', 'XLT Cargo Van', 'XL Passenger Wagon', 'XLT Passenger Wagon'], seats: 7, doors: 4, transmission: 'automatic', carType: 'minivan', fuelType: 'gas' },
  },
  'Chevrolet': {
    'Malibu': { trims: ['LS', 'RS', 'LT', '2LT', 'Premier'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'Camaro': { trims: ['1LS', '1LT', '2LT', '3LT', 'LT1', '1SS', '2SS', 'ZL1'], seats: 4, doors: 2, transmission: 'both', carType: 'coupe', fuelType: 'gas' },
    'Camaro Convertible': { trims: ['1LT', '2LT', '3LT', 'LT1', '1SS', '2SS', 'ZL1'], seats: 4, doors: 2, transmission: 'both', carType: 'convertible', fuelType: 'gas' },
    'Corvette': { trims: ['1LT', '2LT', '3LT', 'Z06 1LZ', 'Z06 2LZ', 'Z06 3LZ', 'E-Ray 1LZ', 'E-Ray 2LZ', 'E-Ray 3LZ'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas/hybrid' },
    'Bolt EV': { trims: ['1LT', '2LT'], seats: 5, doors: 4, transmission: 'automatic', carType: 'hatchback', fuelType: 'electric' },
    'Bolt EUV': { trims: ['1LT', '2LT', 'Premier', 'Redline Edition'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Trax': { trims: ['LS', '1RS', 'LT', '2RS', 'Activ'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Trailblazer': { trims: ['LS', 'LT', 'RS', 'Activ'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Equinox': { trims: ['LS', 'LT', 'RS', 'Activ', 'Premier'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Equinox EV': { trims: ['1LT', '2LT', '3LT', '2RS', '3RS'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Blazer': { trims: ['LT', 'RS', 'Premier'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Blazer EV': { trims: ['LT', 'RS', 'SS'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Traverse': { trims: ['LS', 'LT', 'Z71', 'RS', 'Premier', 'High Country'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Tahoe': { trims: ['LS', 'LT', 'Z71', 'RST', 'Premier', 'High Country'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Suburban': { trims: ['LS', 'LT', 'Z71', 'RST', 'Premier', 'High Country'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Colorado': { trims: ['WT', 'LT', 'Z71', 'Trail Boss', 'ZR2', 'ZR2 Bison'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas' },
    'Silverado 1500': { trims: ['WT', 'Custom', 'Custom Trail Boss', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'ZR2', 'High Country'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas' },
    'Silverado EV': { trims: ['WT', 'RST', 'Trail Boss'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'electric' },
    'Silverado 2500HD': { trims: ['WT', 'Custom', 'LT', 'LTZ', 'ZR2', 'High Country'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas/diesel' },
    'Silverado 3500HD': { trims: ['WT', 'LT', 'LTZ', 'High Country'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas/diesel' },
  },
  'Dodge': {
    'Charger': { trims: ['SXT', 'GT', 'R/T', 'Scat Pack', 'SRT Hellcat'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'Challenger': { trims: ['SXT', 'GT', 'R/T', 'R/T Scat Pack', 'SRT Hellcat', 'SRT Hellcat Redeye', 'SRT Super Stock', 'SRT Demon 170'], seats: 5, doors: 2, transmission: 'both', carType: 'coupe', fuelType: 'gas' },
    'Durango': { trims: ['SXT', 'GT', 'R/T', 'Citadel', 'SRT 392', 'SRT Hellcat'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Hornet': { trims: ['GT', 'GT Plus', 'R/T', 'R/T Plus'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
  },
  'Jeep': {
    'Renegade': { trims: ['Sport', 'Latitude', 'Altitude', 'Limited', 'Trailhawk'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Compass': { trims: ['Sport', 'Latitude', 'Latitude Lux', 'Limited', 'Trailhawk'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Cherokee': { trims: ['Latitude', 'Latitude Lux', 'X', 'Limited', 'Trailhawk', 'Altitude'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Grand Cherokee': { trims: ['Laredo', 'Altitude', 'Limited', 'Trailhawk', 'Overland', 'Summit', 'Summit Reserve', '4xe', 'SRT', 'Trackhawk'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Grand Cherokee L': { trims: ['Laredo', 'Altitude', 'Limited', 'Overland', 'Summit', 'Summit Reserve'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Wrangler': { trims: ['Sport', 'Sport S', 'Willys', 'Willys Sport', 'Sahara', 'Rubicon', 'Rubicon X', 'Rubicon 392', 'High Altitude'], seats: 5, doors: 4, transmission: 'both', carType: 'suv', fuelType: 'gas/hybrid' },
    'Wrangler Unlimited': { trims: ['Sport', 'Sport S', 'Willys', 'Willys Sport', 'Sahara', 'Sahara Altitude', 'Rubicon', 'Rubicon X', 'Rubicon 392', 'High Altitude', '4xe'], seats: 5, doors: 4, transmission: 'both', carType: 'suv', fuelType: 'gas/hybrid' },
    'Gladiator': { trims: ['Sport', 'Sport S', 'Willys', 'Willys Sport', 'Overland', 'Rubicon', 'Rubicon X', 'Mojave', 'High Altitude'], seats: 5, doors: 4, transmission: 'both', carType: 'truck', fuelType: 'gas' },
    'Wagoneer': { trims: ['Series I', 'Series II', 'Series III', 'Carbide'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Grand Wagoneer': { trims: ['Series I', 'Series II', 'Series III', 'Obsidian', 'L Series I', 'L Series II', 'L Series III', 'L Hurricane I-6'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Wagoneer S': { trims: ['Base', 'Launch Edition'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
  },
  'Ram': {
    '1500': { trims: ['Tradesman', 'Big Horn', 'Lone Star', 'Laramie', 'Rebel', 'Limited', 'Limited Longhorn', 'TRX'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas' },
    '1500 REV': { trims: ['Tradesman', 'Big Horn', 'Laramie', 'Limited', 'Tungsten'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'electric' },
    '2500': { trims: ['Tradesman', 'Big Horn', 'Lone Star', 'Laramie', 'Power Wagon', 'Limited', 'Limited Longhorn'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas/diesel' },
    '3500': { trims: ['Tradesman', 'Big Horn', 'Lone Star', 'Laramie', 'Limited', 'Limited Longhorn'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas/diesel' },
    'ProMaster': { trims: ['1500 Low Roof', '1500 High Roof', '2500 High Roof', '3500 High Roof', '3500 EXT High Roof'], seats: 2, doors: 4, transmission: 'automatic', carType: 'minivan', fuelType: 'gas' },
    'ProMaster City': { trims: ['Tradesman Cargo Van', 'Tradesman SLT Cargo Van', 'Wagon', 'Wagon SLT'], seats: 5, doors: 4, transmission: 'automatic', carType: 'minivan', fuelType: 'gas' },
  },
  'GMC': {
    'Terrain': { trims: ['Elevation', 'SLE', 'SLT', 'AT4', 'Denali'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Acadia': { trims: ['SLE', 'AT4', 'SLT', 'Denali'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Yukon': { trims: ['SLE', 'SLT', 'AT4', 'Denali', 'Denali Ultimate'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Yukon XL': { trims: ['SLE', 'SLT', 'AT4', 'Denali', 'Denali Ultimate'], seats: 9, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Canyon': { trims: ['Elevation', 'AT4', 'AT4X', 'Denali'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas' },
    'Sierra 1500': { trims: ['Pro', 'SLE', 'Elevation', 'SLT', 'AT4', 'AT4X', 'Denali', 'Denali Ultimate'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas' },
    'Sierra EV': { trims: ['Elevation', 'AT4X', 'Denali Edition 1'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'electric' },
    'Sierra 2500HD': { trims: ['Pro', 'SLE', 'SLT', 'AT4', 'AT4X', 'Denali', 'Denali Ultimate'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas/diesel' },
    'Sierra 3500HD': { trims: ['Pro', 'SLE', 'SLT', 'AT4', 'Denali', 'Denali Ultimate'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas/diesel' },
    'Hummer EV': { trims: ['EV2', 'EV2X', 'EV3X', 'Edition 1'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'electric' },
    'Hummer EV SUV': { trims: ['EV2', 'EV2X', 'EV3X', 'Edition 1'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
  },
  'Cadillac': {
    'CT4': { trims: ['Luxury', 'Premium Luxury', 'Sport', 'V-Series', 'CT4-V Blackwing'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'CT5': { trims: ['Luxury', 'Premium Luxury', 'Sport', 'V-Series', 'CT5-V Blackwing'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'XT4': { trims: ['Luxury', 'Premium Luxury', 'Sport'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'XT5': { trims: ['Luxury', 'Premium Luxury', 'Sport'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'XT6': { trims: ['Luxury', 'Premium Luxury', 'Sport'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Escalade': { trims: ['Luxury', 'Premium Luxury', 'Sport', 'V-Series', 'Platinum'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Escalade ESV': { trims: ['Luxury', 'Premium Luxury', 'Sport', 'V-Series', 'Platinum'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Lyriq': { trims: ['Tech', 'Luxury', 'Sport'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Celestiq': { trims: ['Base'], seats: 4, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
  },
  'Lincoln': {
    'Corsair': { trims: ['Standard', 'Reserve', 'Grand Touring'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Nautilus': { trims: ['Standard', 'Reserve', 'Black Label'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Aviator': { trims: ['Standard', 'Reserve', 'Grand Touring', 'Black Label', 'Black Label Grand Touring'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Navigator': { trims: ['Standard', 'Reserve', 'Black Label'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Navigator L': { trims: ['Standard', 'Reserve', 'Black Label'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
  },

  // ============================================
  // MAINSTREAM KOREAN
  // ============================================
  'Hyundai': {
    'Elantra': { trims: ['SE', 'SEL', 'Limited', 'N Line', 'N'], seats: 5, doors: 4, transmission: 'both', carType: 'sedan', fuelType: 'gas/hybrid' },
    'Sonata': { trims: ['SE', 'SEL', 'SEL Plus', 'Limited', 'N Line'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'Ioniq 5': { trims: ['SE Standard Range', 'SE', 'SEL', 'Limited', 'N'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Ioniq 6': { trims: ['SE Standard Range', 'SE', 'SEL', 'Limited'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
    'Venue': { trims: ['SE', 'SEL', 'Limited'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Kona': { trims: ['SE', 'SEL', 'Limited', 'N Line', 'N', 'Electric SE', 'Electric SEL', 'Electric Limited'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/electric' },
    'Tucson': { trims: ['SE', 'SEL', 'XRT', 'Limited', 'N Line', 'Hybrid Blue', 'Hybrid SEL', 'Hybrid Limited', 'Plug-in Hybrid SEL', 'Plug-in Hybrid Limited'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Santa Fe': { trims: ['SE', 'SEL', 'XRT', 'Limited', 'Calligraphy', 'Hybrid SEL', 'Hybrid Limited', 'Plug-in Hybrid SEL', 'Plug-in Hybrid Limited'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Santa Cruz': { trims: ['SE', 'SEL', 'SEL Premium', 'Limited', 'Night'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'gas' },
    'Palisade': { trims: ['SE', 'SEL', 'XRT', 'Limited', 'Calligraphy'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
  },
  'Kia': {
    'Forte': { trims: ['LXS', 'GT-Line', 'GT'], seats: 5, doors: 4, transmission: 'both', carType: 'sedan', fuelType: 'gas' },
    'K5': { trims: ['LXS', 'GT-Line', 'GT-Line AWD', 'EX', 'GT'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'Stinger': { trims: ['GT-Line', 'GT1', 'GT2', 'Scorpion Special Edition'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'EV6': { trims: ['Light', 'Wind', 'GT-Line', 'GT'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'EV9': { trims: ['Light', 'Wind', 'Land', 'GT-Line', 'GT-Line AWD'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Soul': { trims: ['LX', 'S', 'GT-Line', 'Turbo', 'EV S', 'EV X-Line'], seats: 5, doors: 4, transmission: 'automatic', carType: 'hatchback', fuelType: 'gas/electric' },
    'Seltos': { trims: ['LX', 'S', 'EX', 'SX', 'X-Line', 'X-Line Turbo', 'SX Turbo'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Sportage': { trims: ['LX', 'EX', 'X-Line', 'SX', 'SX-Prestige', 'X-Pro', 'X-Pro Prestige', 'Hybrid LX', 'Hybrid EX', 'Hybrid SX-Prestige', 'Plug-in Hybrid X-Line', 'Plug-in Hybrid SX-Prestige'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Sorento': { trims: ['LX', 'S', 'EX', 'SX', 'SX-Prestige', 'X-Line', 'X-Line SX-Prestige', 'Hybrid S', 'Hybrid EX', 'Hybrid SX-Prestige', 'Plug-in Hybrid SX', 'Plug-in Hybrid SX-Prestige'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Telluride': { trims: ['LX', 'S', 'EX', 'SX', 'SX-Prestige', 'X-Line', 'X-Pro', 'X-Pro Prestige'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Carnival': { trims: ['LX', 'LX Seat Package', 'EX', 'SX', 'SX Prestige'], seats: 8, doors: 4, transmission: 'automatic', carType: 'minivan', fuelType: 'gas' },
    'Niro': { trims: ['LX', 'EX', 'EX Touring', 'SX Touring', 'EV Wind', 'EV Wave', 'Plug-in Hybrid LXS', 'Plug-in Hybrid EX', 'Plug-in Hybrid SX Touring'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'hybrid' },
  },

  // ============================================
  // VOLKSWAGEN GROUP
  // ============================================
  'Volkswagen': {
    'Jetta': { trims: ['S', 'Sport', 'SE', 'SEL', 'GLI S', 'GLI Autobahn'], seats: 5, doors: 4, transmission: 'both', carType: 'sedan', fuelType: 'gas' },
    'Passat': { trims: ['S', 'SE', 'SEL', 'Limited Edition'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'Arteon': { trims: ['SE', 'SEL Premium R-Line', 'SEL R-Line'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'Golf GTI': { trims: ['S', 'SE', 'Autobahn'], seats: 5, doors: 4, transmission: 'both', carType: 'hatchback', fuelType: 'gas' },
    'Golf R': { trims: ['Base', '20th Anniversary Edition'], seats: 5, doors: 4, transmission: 'both', carType: 'hatchback', fuelType: 'gas' },
    'Taos': { trims: ['S', 'SE', 'SEL'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Tiguan': { trims: ['S', 'SE', 'SE R-Line', 'SEL', 'SEL R-Line'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Atlas': { trims: ['SE', 'SE with Technology', 'SEL', 'SEL R-Line', 'SEL Premium R-Line'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Atlas Cross Sport': { trims: ['SE', 'SE with Technology', 'SE with Technology R-Line', 'SEL', 'SEL R-Line', 'SEL Premium R-Line'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'ID.4': { trims: ['Standard', 'S', 'S Plus', 'Pro', 'Pro S', 'Pro S Plus', 'AWD Pro', 'AWD Pro S', 'AWD Pro S Plus'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'ID.Buzz': { trims: ['Pro S', 'Pro S Plus', '1st Edition'], seats: 7, doors: 4, transmission: 'automatic', carType: 'minivan', fuelType: 'electric' },
  },

  // ============================================
  // ELECTRIC VEHICLES
  // ============================================
  'Tesla': {
    'Model 3': { trims: ['Standard Range Plus', 'Long Range', 'Performance'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
    'Model S': { trims: ['Long Range', 'Plaid'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
    'Model X': { trims: ['Long Range', 'Plaid'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Model Y': { trims: ['Standard Range', 'Long Range', 'Performance'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Cybertruck': { trims: ['Rear-Wheel Drive', 'All-Wheel Drive', 'Cyberbeast', 'Foundation Series'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'electric' },
  },
  'Rivian': {
    'R1T': { trims: ['Explore', 'Adventure', 'Launch Edition'], seats: 5, doors: 4, transmission: 'automatic', carType: 'truck', fuelType: 'electric' },
    'R1S': { trims: ['Explore', 'Adventure', 'Launch Edition'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
  },
  'Lucid': {
    'Air': { trims: ['Pure', 'Touring', 'Grand Touring', 'Grand Touring Performance', 'Sapphire'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
    'Gravity': { trims: ['Touring', 'Grand Touring'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
  },
  'Polestar': {
    'Polestar 2': { trims: ['Single Motor', 'Long Range Single Motor', 'Long Range Dual Motor', 'BST Edition 270'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'electric' },
    'Polestar 3': { trims: ['Long Range Dual Motor', 'Long Range Dual Motor with Performance Pack'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'Polestar 4': { trims: ['Long Range Single Motor', 'Long Range Dual Motor'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
  },

  // ============================================
  // VOLVO
  // ============================================
  'Volvo': {
    'S60': { trims: ['Core', 'Plus', 'Ultimate', 'Recharge Plus', 'Recharge Ultimate'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'S90': { trims: ['Core', 'Plus', 'Ultimate', 'Recharge Plus', 'Recharge Ultimate'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas/hybrid' },
    'V60': { trims: ['Cross Country Core', 'Cross Country Plus', 'Cross Country Ultimate'], seats: 5, doors: 4, transmission: 'automatic', carType: 'wagon', fuelType: 'gas' },
    'V90': { trims: ['Cross Country Core', 'Cross Country Plus', 'Cross Country Ultimate'], seats: 5, doors: 4, transmission: 'automatic', carType: 'wagon', fuelType: 'gas' },
    'XC40': { trims: ['Core', 'Plus', 'Ultimate', 'Recharge Core', 'Recharge Plus', 'Recharge Ultimate'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/electric' },
    'XC60': { trims: ['Core', 'Plus', 'Ultimate', 'Recharge Plus', 'Recharge Ultimate'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'XC90': { trims: ['Core', 'Plus', 'Ultimate', 'Recharge Plus', 'Recharge Ultimate'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'C40 Recharge': { trims: ['Core', 'Plus', 'Ultimate'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'EX30': { trims: ['Core', 'Plus', 'Ultra'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
    'EX90': { trims: ['Core', 'Plus', 'Ultra'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
  },

  // ============================================
  // OTHERS - MINI, ALFA ROMEO, LAND ROVER, JAGUAR
  // ============================================
  'Mini': {
    'Cooper': { trims: ['Classic', 'Signature', 'Iconic'], seats: 4, doors: 2, transmission: 'automatic', carType: 'hatchback', fuelType: 'gas' },
    'Cooper S': { trims: ['Classic', 'Signature', 'Iconic'], seats: 4, doors: 2, transmission: 'automatic', carType: 'hatchback', fuelType: 'gas' },
    'John Cooper Works': { trims: ['Base', 'GP'], seats: 4, doors: 2, transmission: 'automatic', carType: 'hatchback', fuelType: 'gas' },
    'Cooper Convertible': { trims: ['Classic', 'Signature', 'Iconic'], seats: 4, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas' },
    'Clubman': { trims: ['Classic', 'Signature', 'Iconic', 'JCW'], seats: 5, doors: 4, transmission: 'automatic', carType: 'wagon', fuelType: 'gas' },
    'Countryman': { trims: ['Classic', 'Signature', 'Iconic', 'JCW', 'SE'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Cooper SE': { trims: ['Classic', 'Signature', 'Iconic'], seats: 4, doors: 2, transmission: 'automatic', carType: 'hatchback', fuelType: 'electric' },
  },
  'Alfa Romeo': {
    'Giulia': { trims: ['Sprint', 'Ti', 'Veloce', 'Quadrifoglio'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
    'Stelvio': { trims: ['Sprint', 'Ti', 'Veloce', 'Quadrifoglio'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Tonale': { trims: ['Sprint', 'Ti', 'Veloce', 'Ti PHEV', 'Veloce PHEV'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
  },
  'Land Rover': {
    'Defender 90': { trims: ['S', 'SE', 'X-Dynamic SE', 'X', 'V8', 'V8 Carpathian Edition'], seats: 5, doors: 2, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Defender 110': { trims: ['S', 'SE', 'X-Dynamic SE', 'X', 'V8', 'V8 Carpathian Edition'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Defender 130': { trims: ['S', 'SE', 'X-Dynamic SE', 'X', 'Outbound'], seats: 8, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Discovery': { trims: ['S', 'R-Dynamic S', 'R-Dynamic SE', 'R-Dynamic HSE', 'Metropolitan Edition'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Discovery Sport': { trims: ['S', 'SE', 'R-Dynamic SE', 'R-Dynamic HSE'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Range Rover Evoque': { trims: ['S', 'SE', 'Dynamic SE', 'Dynamic HSE', 'Autobiography'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Range Rover Velar': { trims: ['S', 'SE', 'R-Dynamic S', 'R-Dynamic SE', 'R-Dynamic HSE', 'SV Autobiography Dynamic Edition'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Range Rover Sport': { trims: ['SE', 'Dynamic SE', 'Dynamic HSE', 'Autobiography', 'First Edition', 'SV Edition One'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
    'Range Rover': { trims: ['SE', 'HSE', 'Autobiography', 'SV', 'First Edition', 'LWB SE', 'LWB HSE', 'LWB Autobiography', 'LWB SV'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas/hybrid' },
  },
  'Jaguar': {
    'F-Type': { trims: ['P300', 'P340', 'R-Dynamic P300', 'R-Dynamic P380', 'R', 'R75'], seats: 2, doors: 2, transmission: 'automatic', carType: 'sports', fuelType: 'gas' },
    'F-Type Convertible': { trims: ['P300', 'P340', 'R-Dynamic P300', 'R-Dynamic P380', 'R', 'R75'], seats: 2, doors: 2, transmission: 'automatic', carType: 'convertible', fuelType: 'gas' },
    'F-Pace': { trims: ['S', 'SE', 'R-Dynamic S', 'R-Dynamic SE', 'R-Dynamic HSE', 'SVR', '400 Sport'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'E-Pace': { trims: ['S', 'SE', 'R-Dynamic S', 'R-Dynamic SE', 'R-Dynamic HSE'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'I-Pace': { trims: ['S', 'SE', 'R-Dynamic S', 'R-Dynamic SE', 'R-Dynamic HSE', 'HSE', 'EV400'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'electric' },
  },
  'Chrysler': {
    'Pacifica': { trims: ['Touring', 'Touring L', 'Limited', 'Pinnacle', 'Hybrid Touring', 'Hybrid Touring L', 'Hybrid Limited', 'Hybrid Pinnacle'], seats: 7, doors: 4, transmission: 'automatic', carType: 'minivan', fuelType: 'gas/hybrid' },
    '300': { trims: ['Touring', 'Touring L', 'S', 'C'], seats: 5, doors: 4, transmission: 'automatic', carType: 'sedan', fuelType: 'gas' },
  },
  'Buick': {
    'Encore GX': { trims: ['Preferred', 'Select', 'Essence', 'Sport Touring', 'Avenir'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Envision': { trims: ['Preferred', 'Essence', 'Avenir'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Enclave': { trims: ['Essence', 'Premium', 'Avenir'], seats: 7, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    'Envista': { trims: ['Preferred', 'Sport Touring', 'Avenir'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
  },
  'Fiat': {
    '500X': { trims: ['Sport', 'Yacht Club Capri'], seats: 5, doors: 4, transmission: 'automatic', carType: 'suv', fuelType: 'gas' },
    '500e': { trims: ['Inspired By Beauty', 'Inspired By Music', 'Inspired By Los Angeles'], seats: 4, doors: 2, transmission: 'automatic', carType: 'hatchback', fuelType: 'electric' },
  },
}

// ============================================
// YEAR-BASED VEHICLE DATABASE (2015-2025)
// ============================================
export const vehicleSpecsByYear: YearBasedVehicleDatabase = {
  'Mercedes-Benz': {
    'S-Class': {
      // ===== W222 GENERATION (2014-2020) =====
      '2015': {
        trims: ['S 550', 'S 550 4MATIC', 'S 600', 'S 63 AMG 4MATIC', 'S 65 AMG'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['S 550', 'S 550 4MATIC', 'S 550e', 'S 600', 'AMG S 63 4MATIC', 'AMG S 65'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2017': {
        trims: ['S 550', 'S 550 4MATIC', 'S 550e', 'S 600', 'AMG S 63 4MATIC', 'AMG S 65'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2018': {
        trims: ['S 560', 'S 560 4MATIC', 'S 560e', 'AMG S 63 4MATIC', 'AMG S 65'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2019': {
        trims: ['S 560', 'S 560 4MATIC', 'S 560e', 'AMG S 63 4MATIC', 'AMG S 65'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2020': {
        trims: ['S 560', 'S 560 4MATIC', 'S 560e', 'AMG S 63 4MATIC', 'AMG S 65'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      // ===== W223 GENERATION (2021-Present) =====
      '2021': {
        trims: ['S 500 4MATIC', 'S 580 4MATIC', 'AMG S 63 E PERFORMANCE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['S 500 4MATIC', 'S 580 4MATIC', 'AMG S 63 E PERFORMANCE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['S 500 4MATIC', 'S 580 4MATIC', 'AMG S 63 E PERFORMANCE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['S 500 4MATIC', 'S 580 4MATIC', 'AMG S 63 E PERFORMANCE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['S 500 4MATIC', 'S 580 4MATIC', 'AMG S 63 E PERFORMANCE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
    },
    'C-Class': {
      // ===== W205 GENERATION (2015-2021) =====
      '2015': {
        trims: ['C 300', 'C 300 4MATIC', 'C 400 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['C 300', 'C 300 4MATIC', 'C 350e', 'AMG C 43 4MATIC', 'AMG C 63', 'AMG C 63 S'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['C 300', 'C 300 4MATIC', 'C 350e', 'AMG C 43 4MATIC', 'AMG C 63', 'AMG C 63 S'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['C 300', 'C 300 4MATIC', 'C 350e', 'AMG C 43 4MATIC', 'AMG C 63', 'AMG C 63 S'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['C 300', 'C 300 4MATIC', 'AMG C 43 4MATIC', 'AMG C 63', 'AMG C 63 S'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['C 300', 'C 300 4MATIC', 'AMG C 43 4MATIC', 'AMG C 63', 'AMG C 63 S'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['C 300', 'C 300 4MATIC', 'AMG C 43 4MATIC', 'AMG C 63', 'AMG C 63 S'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== W206 GENERATION (2022-2025) =====
      '2022': {
        trims: ['C 300', 'C 300 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['C 300', 'C 300 4MATIC', 'AMG C 43 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['C 300', 'C 300 4MATIC', 'AMG C 43 4MATIC', 'AMG C 63 S E PERFORMANCE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['C 300', 'C 300 4MATIC', 'AMG C 43 4MATIC', 'AMG C 63 S E PERFORMANCE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
    },
    'E-Class': {
      // ===== W212 GENERATION (2010-2016) =====
      '2015': {
        trims: ['E 250 BlueTEC', 'E 250 BlueTEC 4MATIC', 'E 350', 'E 350 4MATIC', 'E 400 4MATIC', 'E 550 4MATIC', 'E 63 AMG', 'E 63 AMG S'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['E 300', 'E 300 4MATIC', 'E 350', 'E 350 4MATIC', 'E 400 4MATIC', 'AMG E 63 S 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== W213 GENERATION (2017-2025) =====
      '2017': {
        trims: ['E 300', 'E 300 4MATIC', 'E 400 4MATIC', 'AMG E 43 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['E 300', 'E 300 4MATIC', 'E 400 4MATIC', 'AMG E 43 4MATIC', 'AMG E 63 S 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['E 300', 'E 300 4MATIC', 'E 450 4MATIC', 'AMG E 53 4MATIC', 'AMG E 63 S 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['E 350', 'E 350 4MATIC', 'E 450 4MATIC', 'AMG E 53 4MATIC', 'AMG E 63 S 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['E 350', 'E 350 4MATIC', 'E 450 4MATIC', 'AMG E 53 4MATIC', 'AMG E 63 S 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['E 350', 'E 350 4MATIC', 'E 450 4MATIC', 'AMG E 53 4MATIC', 'AMG E 63 S 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['E 350', 'E 350 4MATIC', 'E 450 4MATIC', 'AMG E 53 4MATIC', 'AMG E 63 S 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['E 350', 'E 350 4MATIC', 'E 450 4MATIC', 'AMG E 53 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['E 350', 'E 350 4MATIC', 'E 450 4MATIC', 'AMG E 53 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
    },
    'GLE': {
      // ===== W166 GENERATION (2016-2019) - Note: Called ML-Class prior to 2016 =====
      '2015': {
        trims: ['ML 250 BlueTEC', 'ML 350', 'ML 350 BlueTEC', 'ML 400 4MATIC', 'ML 63 AMG'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['GLE 300d 4MATIC', 'GLE 350', 'GLE 350 4MATIC', 'GLE 450 AMG 4MATIC', 'AMG GLE 63 S 4MATIC'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['GLE 300d 4MATIC', 'GLE 350', 'GLE 350 4MATIC', 'GLE 450 AMG 4MATIC', 'AMG GLE 43 4MATIC', 'AMG GLE 63 S 4MATIC'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['GLE 350', 'GLE 350 4MATIC', 'GLE 450 AMG 4MATIC', 'AMG GLE 43 4MATIC', 'AMG GLE 63 S 4MATIC'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['GLE 350', 'GLE 350 4MATIC', 'GLE 450 AMG 4MATIC', 'AMG GLE 43 4MATIC', 'AMG GLE 63 S 4MATIC'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== W167 GENERATION (2020-2025) =====
      '2020': {
        trims: ['GLE 350', 'GLE 350 4MATIC', 'GLE 450 4MATIC', 'AMG GLE 53 4MATIC', 'AMG GLE 63 S 4MATIC'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['GLE 350', 'GLE 350 4MATIC', 'GLE 450 4MATIC', 'GLE 580 4MATIC', 'AMG GLE 53 4MATIC', 'AMG GLE 63 S 4MATIC'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['GLE 350', 'GLE 350 4MATIC', 'GLE 450 4MATIC', 'GLE 580 4MATIC', 'AMG GLE 53 4MATIC', 'AMG GLE 63 S 4MATIC'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['GLE 350', 'GLE 350 4MATIC', 'GLE 450 4MATIC', 'GLE 580 4MATIC', 'AMG GLE 53 4MATIC', 'AMG GLE 63 S 4MATIC'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['GLE 350', 'GLE 350 4MATIC', 'GLE 450 4MATIC', 'GLE 580 4MATIC', 'AMG GLE 53 4MATIC', 'AMG GLE 63 S 4MATIC'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['GLE 350', 'GLE 350 4MATIC', 'GLE 450 4MATIC', 'GLE 580 4MATIC', 'AMG GLE 53 4MATIC'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
    'GLC': {
      // ===== X253 GENERATION (2016-2025) =====
      '2016': {
        trims: ['GLC 300', 'GLC 300 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['GLC 300', 'GLC 300 4MATIC', 'AMG GLC 43 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['GLC 300', 'GLC 300 4MATIC', 'AMG GLC 43 4MATIC', 'AMG GLC 63 4MATIC', 'AMG GLC 63 S 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['GLC 300', 'GLC 300 4MATIC', 'AMG GLC 43 4MATIC', 'AMG GLC 63 4MATIC', 'AMG GLC 63 S 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['GLC 300', 'GLC 300 4MATIC', 'AMG GLC 43 4MATIC', 'AMG GLC 63 4MATIC', 'AMG GLC 63 S 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['GLC 300', 'GLC 300 4MATIC', 'AMG GLC 43 4MATIC', 'AMG GLC 63 4MATIC', 'AMG GLC 63 S 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['GLC 300', 'GLC 300 4MATIC', 'AMG GLC 43 4MATIC', 'AMG GLC 63 4MATIC', 'AMG GLC 63 S 4MATIC'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['GLC 300', 'GLC 300 4MATIC', 'AMG GLC 43 4MATIC', 'AMG GLC 63 S E PERFORMANCE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['GLC 300', 'GLC 300 4MATIC', 'AMG GLC 43 4MATIC', 'AMG GLC 63 S E PERFORMANCE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['GLC 300', 'GLC 300 4MATIC', 'AMG GLC 43 4MATIC', 'AMG GLC 63 S E PERFORMANCE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
  },
  'Toyota': {
    'Camry': {
      // ===== XV50 GENERATION (2012-2017) =====
      '2015': {
        trims: ['L', 'LE', 'SE', 'XLE', 'XSE', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2016': {
        trims: ['LE', 'SE', 'XLE', 'XSE', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2017': {
        trims: ['LE', 'SE', 'XLE', 'XSE', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      // ===== XV70 GENERATION (2018-Present) =====
      '2018': {
        trims: ['L', 'LE', 'SE', 'XLE', 'XSE', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE', 'Hybrid XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2019': {
        trims: ['L', 'LE', 'SE', 'XLE', 'XSE', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE', 'Hybrid XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2020': {
        trims: ['L', 'LE', 'SE', 'XLE', 'XSE', 'TRD', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE', 'Hybrid XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2021': {
        trims: ['LE', 'SE', 'SE Nightshade', 'XLE', 'XSE', 'TRD', 'Hybrid LE', 'Hybrid SE', 'Hybrid SE Nightshade', 'Hybrid XLE', 'Hybrid XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['LE', 'SE', 'SE Nightshade', 'XLE', 'XSE', 'TRD', 'Hybrid LE', 'Hybrid SE', 'Hybrid SE Nightshade', 'Hybrid XLE', 'Hybrid XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['LE', 'SE', 'SE Nightshade', 'XLE', 'XSE', 'TRD', 'Hybrid LE', 'Hybrid SE', 'Hybrid SE Nightshade', 'Hybrid XLE', 'Hybrid XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['LE', 'SE', 'SE Nightshade', 'XLE', 'XSE', 'TRD', 'Hybrid LE', 'Hybrid SE', 'Hybrid SE Nightshade', 'Hybrid XLE', 'Hybrid XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['LE', 'SE', 'SE Nightshade', 'XLE', 'XSE', 'TRD', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE', 'Hybrid XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
    },
    'Corolla': {
      // ===== E170 GENERATION (2014-2018) =====
      '2015': {
        trims: ['L', 'LE', 'LE Eco', 'S', 'S Plus'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['L', 'LE', 'LE Eco', 'S', 'S Plus', 'S Premium'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['L', 'LE', 'LE Eco', 'SE', 'XLE', 'XSE', 'iM'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['L', 'LE', 'LE Eco', 'SE', 'XLE', 'XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== E210 GENERATION (2019-Present) =====
      '2019': {
        trims: ['L', 'LE', 'SE', 'XLE', 'XSE', 'Hatchback SE', 'Hatchback XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['L', 'LE', 'SE', 'XLE', 'XSE', 'Hybrid LE', 'Hybrid XLE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2021': {
        trims: ['L', 'LE', 'SE', 'XLE', 'XSE', 'Apex Edition', 'Hybrid LE', 'Hybrid XLE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['LE', 'SE', 'XLE', 'XSE', 'Apex Edition', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['LE', 'SE', 'XLE', 'XSE', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE', 'Hybrid XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['LE', 'SE', 'XLE', 'XSE', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE', 'Hybrid XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['LE', 'SE', 'XLE', 'XSE', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE', 'Hybrid XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
    },
    'RAV4': {
      // ===== XA40 GENERATION (2013-2018) =====
      '2015': {
        trims: ['LE', 'XLE', 'Limited', 'Limited Platinum'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['LE', 'XLE', 'Limited', 'Limited Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2017': {
        trims: ['LE', 'XLE', 'SE', 'Limited', 'Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid SE', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2018': {
        trims: ['LE', 'XLE', 'SE', 'Limited', 'Platinum', 'Adventure', 'Hybrid LE', 'Hybrid XLE', 'Hybrid SE', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      // ===== XA50 GENERATION (2019-Present) =====
      '2019': {
        trims: ['LE', 'XLE', 'XLE Premium', 'Adventure', 'Limited', 'Hybrid LE', 'Hybrid XLE', 'Hybrid XSE', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2020': {
        trims: ['LE', 'XLE', 'XLE Premium', 'Adventure', 'TRD Off-Road', 'Limited', 'Hybrid LE', 'Hybrid XLE', 'Hybrid XSE', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2021': {
        trims: ['LE', 'XLE', 'XLE Premium', 'Adventure', 'TRD Off-Road', 'Limited', 'Prime SE', 'Prime XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['LE', 'XLE', 'XLE Premium', 'Adventure', 'TRD Off-Road', 'Limited', 'Hybrid Woodland Edition', 'Prime SE', 'Prime XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['LE', 'XLE', 'XLE Premium', 'Adventure', 'TRD Off-Road', 'Limited', 'Hybrid Woodland Edition', 'Prime SE', 'Prime XSE', 'Prime XSE Premium'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['LE', 'XLE', 'XLE Premium', 'Adventure', 'TRD Off-Road', 'Limited', 'Hybrid Woodland Edition', 'Prime SE', 'Prime XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['LE', 'XLE', 'XLE Premium', 'Adventure', 'TRD Off-Road', 'Limited', 'Hybrid Woodland Edition', 'Prime SE', 'Prime XSE'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
    'Highlander': {
      // ===== XU50 GENERATION (2014-2019) =====
      '2015': {
        trims: ['LE', 'LE Plus', 'XLE', 'Limited', 'Limited Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid Limited'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2016': {
        trims: ['LE', 'LE Plus', 'XLE', 'SE', 'Limited', 'Limited Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid Limited', 'Hybrid Limited Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2017': {
        trims: ['LE', 'LE Plus', 'XLE', 'SE', 'Limited', 'Limited Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid SE', 'Hybrid Limited', 'Hybrid Limited Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2018': {
        trims: ['LE', 'LE Plus', 'XLE', 'SE', 'Limited', 'Limited Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid SE', 'Hybrid Limited', 'Hybrid Limited Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2019': {
        trims: ['LE', 'LE Plus', 'XLE', 'SE', 'Limited', 'Limited Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid SE', 'Hybrid Limited', 'Hybrid Limited Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      // ===== XU70 GENERATION (2020-Present) =====
      '2020': {
        trims: ['L', 'LE', 'XLE', 'Limited', 'Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid Limited', 'Hybrid Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2021': {
        trims: ['L', 'LE', 'XLE', 'XSE', 'Limited', 'Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid XSE', 'Hybrid Limited', 'Hybrid Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['L', 'LE', 'XLE', 'XSE', 'Limited', 'Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid XSE', 'Hybrid Limited', 'Hybrid Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['L', 'LE', 'XLE', 'XSE', 'Limited', 'Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid XSE', 'Hybrid Limited', 'Hybrid Platinum', 'Hybrid Bronze Edition'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['L', 'LE', 'XLE', 'XSE', 'Limited', 'Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid XSE', 'Hybrid Limited', 'Hybrid Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['LE', 'XLE', 'XSE', 'Limited', 'Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid XSE', 'Hybrid Limited', 'Hybrid Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
  },
  'Honda': {
    'Civic': {
      // ===== 9TH GENERATION (2012-2015) =====
      '2015': {
        trims: ['LX', 'EX', 'EX-L', 'Si', 'EX-L Navi'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== 10TH GENERATION (2016-2021) =====
      '2016': {
        trims: ['LX', 'EX', 'EX-T', 'EX-L', 'Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['LX', 'EX', 'EX-T', 'EX-L', 'Touring', 'Si', 'Type R', 'Hatchback LX', 'Hatchback Sport', 'Hatchback EX', 'Hatchback EX-L'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['LX', 'EX', 'EX-T', 'EX-L', 'Touring', 'Si', 'Type R'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['LX', 'EX', 'Sport', 'EX-L', 'Touring', 'Si', 'Type R'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Si', 'Type R'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Si', 'Type R'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== 11TH GENERATION (2022-Present) =====
      '2022': {
        trims: ['LX', 'Sport', 'EX', 'Touring', 'Si'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['LX', 'Sport', 'EX', 'Touring', 'Si', 'Type R'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['LX', 'Sport', 'EX', 'Touring', 'Si', 'Type R'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['LX', 'Sport', 'EX', 'Touring', 'Si', 'Type R', 'Hybrid Sport', 'Hybrid Sport Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
    },
    'Accord': {
      // ===== 9TH GENERATION (2013-2017) =====
      '2015': {
        trims: ['LX', 'Sport', 'EX', 'EX-L', 'EX-L V6', 'Touring', 'Hybrid EX-L', 'Hybrid Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2016': {
        trims: ['LX', 'Sport', 'EX', 'EX-L', 'EX-L V6', 'Touring', 'Touring V6'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['LX', 'Sport', 'Sport SE', 'EX', 'EX-L', 'EX-L V6', 'Touring', 'Touring V6', 'Hybrid EX-L', 'Hybrid Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      // ===== 10TH GENERATION (2018-2022) =====
      '2018': {
        trims: ['LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Hybrid EX-L', 'Hybrid Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2019': {
        trims: ['LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Hybrid EX-L', 'Hybrid Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2020': {
        trims: ['LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Hybrid EX-L', 'Hybrid Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2021': {
        trims: ['LX', 'Sport', 'Sport SE', 'EX', 'EX-L', 'Touring', 'Hybrid EX-L', 'Hybrid Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['LX', 'Sport', 'Sport SE', 'EX', 'EX-L', 'Touring', 'Hybrid Sport', 'Hybrid EX-L', 'Hybrid Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      // ===== 11TH GENERATION (2023-Present) =====
      '2023': {
        trims: ['LX', 'Sport', 'EX-L', 'Sport-L', 'Touring', 'Hybrid Sport', 'Hybrid Sport-L', 'Hybrid Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['LX', 'Sport', 'EX-L', 'Sport-L', 'Touring', 'Hybrid Sport', 'Hybrid Sport-L', 'Hybrid Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['LX', 'Sport', 'EX-L', 'Sport-L', 'Touring', 'Hybrid Sport', 'Hybrid Sport-L', 'Hybrid Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
    },
    'CR-V': {
      // ===== 4TH GENERATION (2012-2016) =====
      '2015': {
        trims: ['LX', 'SE', 'EX', 'EX-L', 'Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['LX', 'SE', 'EX', 'EX-L', 'Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 5TH GENERATION (2017-2022) =====
      '2017': {
        trims: ['LX', 'EX', 'EX-L', 'Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['LX', 'EX', 'EX-L', 'Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['LX', 'EX', 'EX-L', 'Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['LX', 'EX', 'EX-L', 'Touring', 'Hybrid LX', 'Hybrid EX', 'Hybrid EX-L', 'Hybrid Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2021': {
        trims: ['LX', 'EX', 'EX-L', 'Touring', 'Special Edition', 'Hybrid LX', 'Hybrid EX', 'Hybrid EX-L', 'Hybrid Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['LX', 'EX', 'EX-L', 'Touring', 'Special Edition', 'Hybrid LX', 'Hybrid Sport', 'Hybrid EX-L', 'Hybrid Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      // ===== 6TH GENERATION (2023-Present) =====
      '2023': {
        trims: ['LX', 'EX', 'EX-L', 'Sport', 'Sport Touring', 'Hybrid Sport', 'Hybrid Sport Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['LX', 'EX', 'EX-L', 'Sport', 'Sport Touring', 'Hybrid Sport', 'Hybrid Sport Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['LX', 'EX', 'EX-L', 'Sport', 'Sport Touring', 'Hybrid Sport', 'Hybrid Sport Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
  },
  'Ford': {
    'F-150': {
      // ===== 13TH GENERATION (2015-2020) =====
      '2015': {
        trims: ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['XL', 'XLT', 'Lariat', 'Raptor', 'King Ranch', 'Platinum', 'Limited'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['XL', 'XLT', 'Lariat', 'Raptor', 'King Ranch', 'Platinum', 'Limited'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['XL', 'XLT', 'Lariat', 'Raptor', 'King Ranch', 'Platinum', 'Limited'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['XL', 'XLT', 'Lariat', 'Raptor', 'King Ranch', 'Platinum', 'Limited'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      // ===== 14TH GENERATION (2021-Present) =====
      '2021': {
        trims: ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Tremor'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['XL', 'XLT', 'Lariat', 'Raptor', 'King Ranch', 'Platinum', 'Limited', 'Tremor', 'Lightning'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas/hybrid/electric'
      },
      '2023': {
        trims: ['XL', 'XLT', 'Lariat', 'Raptor', 'Raptor R', 'King Ranch', 'Platinum', 'Limited', 'Tremor', 'Lightning'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas/hybrid/electric'
      },
      '2024': {
        trims: ['XL', 'XLT', 'Lariat', 'Raptor', 'Raptor R', 'King Ranch', 'Platinum', 'Limited', 'Tremor', 'Lightning'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas/hybrid/electric'
      },
      '2025': {
        trims: ['XL', 'XLT', 'Lariat', 'Raptor', 'King Ranch', 'Platinum', 'Limited', 'Tremor', 'Lightning'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas/hybrid/electric'
      },
    },
    'Explorer': {
      // ===== 5TH GENERATION (2011-2019) =====
      '2015': {
        trims: ['Base', 'XLT', 'Limited', 'Sport', 'Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['Base', 'XLT', 'Limited', 'Sport', 'Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['Base', 'XLT', 'Limited', 'Sport', 'Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['Base', 'XLT', 'Limited', 'Sport', 'Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['Base', 'XLT', 'Limited', 'Sport', 'Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 6TH GENERATION (2020-Present) =====
      '2020': {
        trims: ['XLT', 'Limited', 'ST', 'Platinum', 'Hybrid Limited', 'Hybrid Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2021': {
        trims: ['XLT', 'Limited', 'ST', 'Timberline', 'King Ranch', 'Platinum', 'Hybrid XLT', 'Hybrid Limited', 'Hybrid Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['XLT', 'Limited', 'ST', 'Timberline', 'King Ranch', 'Platinum', 'Hybrid XLT', 'Hybrid Limited', 'Hybrid Platinum'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['XLT', 'Limited', 'ST', 'ST-Line', 'Timberline', 'King Ranch', 'Platinum', 'Hybrid XLT', 'Hybrid Limited'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['XLT', 'Limited', 'ST', 'ST-Line', 'Timberline', 'King Ranch', 'Platinum', 'Hybrid XLT', 'Hybrid Limited'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['XLT', 'Limited', 'ST', 'ST-Line', 'Timberline', 'King Ranch', 'Platinum', 'Hybrid XLT', 'Hybrid Limited'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
    'Escape': {
      // ===== 3RD GENERATION (2013-2019) =====
      '2015': {
        trims: ['S', 'SE', 'Titanium'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['S', 'SE', 'Titanium'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['S', 'SE', 'Titanium'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['S', 'SE', 'SEL', 'Titanium'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['S', 'SE', 'SEL', 'Titanium'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 4TH GENERATION (2020-Present) =====
      '2020': {
        trims: ['S', 'SE', 'SEL', 'Titanium', 'Hybrid SE', 'Hybrid SEL', 'Hybrid Titanium'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2021': {
        trims: ['S', 'SE', 'SEL', 'Titanium', 'Hybrid SE', 'Hybrid SEL', 'Hybrid Titanium'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['S', 'SE', 'SEL', 'Titanium', 'Hybrid SE', 'Hybrid SEL', 'Hybrid Titanium'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['Active', 'ST-Line', 'ST-Line Elite', 'Hybrid Active', 'Plug-In Hybrid ST-Line Elite'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['Active', 'ST-Line', 'ST-Line Elite', 'Platinum', 'Hybrid Active', 'Plug-In Hybrid ST-Line Elite', 'Plug-In Hybrid Platinum'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['Active', 'ST-Line', 'ST-Line Elite', 'Platinum', 'Hybrid Active', 'Plug-In Hybrid ST-Line Elite', 'Plug-In Hybrid Platinum'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
  },
  'Chevrolet': {
    'Silverado 1500': {
      // ===== 3RD GENERATION (2014-2018) =====
      '2015': {
        trims: ['WT', 'LS', 'LT', 'LTZ', 'High Country'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['WT', 'LS', 'LT', 'LTZ', 'High Country'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['WT', 'LS', 'LT', 'LTZ', 'High Country'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['WT', 'LS', 'Custom', 'LT', 'LTZ', 'High Country'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      // ===== 4TH GENERATION (2019-Present) =====
      '2019': {
        trims: ['WT', 'Custom', 'Custom Trail Boss', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'High Country'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['WT', 'Custom', 'Custom Trail Boss', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'High Country'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['WT', 'Custom', 'Custom Trail Boss', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'High Country'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['WT', 'Custom', 'Custom Trail Boss', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'High Country', 'ZR2'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['WT', 'Custom', 'Custom Trail Boss', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'High Country', 'ZR2'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['WT', 'Custom', 'Custom Trail Boss', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'High Country', 'ZR2'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['WT', 'Custom', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'High Country', 'ZR2'],
        seats: 6,
        doors: 4,
        transmission: 'automatic',
        carType: 'truck',
        fuelType: 'gas'
      },
    },
    'Equinox': {
      // ===== 2ND GENERATION (2010-2017) =====
      '2015': {
        trims: ['L', 'LS', 'LT', 'LTZ'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['L', 'LS', 'LT', 'LTZ'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['L', 'LS', 'LT', 'Premier'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 3RD GENERATION (2018-Present) =====
      '2018': {
        trims: ['L', 'LS', 'LT', 'Premier'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['L', 'LS', 'LT', 'Premier'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['L', 'LS', 'LT', 'Premier'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['L', 'LS', 'LT', 'Premier'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['LS', 'LT', 'RS', 'Premier'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['LS', 'LT', 'RS', 'Premier'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['LS', 'LT', 'RS', 'Premier', 'ACTIV'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['LS', 'LT', 'RS', 'Premier', 'ACTIV'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
    },
    'Malibu': {
      // ===== 8TH GENERATION (2013-2015) =====
      '2015': {
        trims: ['LS', 'LT', 'LTZ'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== 9TH GENERATION (2016-Present) =====
      '2016': {
        trims: ['L', 'LS', 'LT', 'Premier', 'Hybrid'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2017': {
        trims: ['L', 'LS', 'LT', 'Premier', 'Hybrid'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2018': {
        trims: ['L', 'LS', 'LT', 'Premier', 'Hybrid'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2019': {
        trims: ['LS', 'LT', 'RS', 'Premier', 'Hybrid'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2020': {
        trims: ['LS', 'LT', 'RS', 'Premier'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['LS', 'LT', 'RS', 'Premier'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['LS', 'LT', 'RS', 'Premier'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['LS', 'LT', 'RS', 'Premier'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['LS', 'LT', 'RS', 'Premier'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['LS', 'LT', 'RS', 'Premier'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
    },
  },
  'Hyundai': {
    'Elantra': {
      // ===== 5TH GENERATION (2011-2016) =====
      '2015': {
        trims: ['SE', 'Sport', 'Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['SE', 'Sport', 'Value Edition', 'Limited', 'Eco'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== 6TH GENERATION (2017-2020) =====
      '2017': {
        trims: ['SE', 'SEL', 'Value Edition', 'Limited', 'Sport', 'Eco'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['SE', 'SEL', 'Value Edition', 'Limited', 'Sport', 'Eco'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['SE', 'SEL', 'Value Edition', 'Limited', 'Sport', 'Eco'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['SE', 'SEL', 'Value Edition', 'Limited', 'Sport', 'Eco'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== 7TH GENERATION (2021-Present) =====
      '2021': {
        trims: ['SE', 'SEL', 'N Line', 'Limited', 'Hybrid Blue', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['SE', 'SEL', 'N Line', 'Limited', 'Hybrid Blue', 'Hybrid SEL', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['SE', 'SEL', 'N Line', 'Limited', 'Hybrid Blue', 'Hybrid SEL', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['SE', 'SEL', 'N Line', 'Limited', 'Hybrid Blue', 'Hybrid SEL', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['SE', 'SEL', 'N Line', 'Limited', 'Hybrid Blue', 'Hybrid SEL', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
    },
    'Sonata': {
      // ===== 6TH GENERATION (2011-2014) - Partial =====
      '2015': {
        trims: ['SE', 'Sport', 'Sport 2.0T', 'Limited', 'Eco'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['SE', 'Sport', 'Sport 2.0T', 'Limited', 'Eco', 'Hybrid SE', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2017': {
        trims: ['SE', 'Sport', 'Sport 2.0T', 'Limited', 'Eco', 'Hybrid SE', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      // ===== 7TH GENERATION (2018-2019) =====
      '2018': {
        trims: ['SE', 'SEL', 'Sport', 'Limited', 'Hybrid SE', 'Hybrid SEL', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2019': {
        trims: ['SE', 'SEL', 'SEL Plus', 'Sport', 'Limited', 'Hybrid SE', 'Hybrid SEL', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      // ===== 8TH GENERATION (2020-Present) =====
      '2020': {
        trims: ['SE', 'SEL', 'SEL Plus', 'Limited', 'N Line', 'Hybrid SE', 'Hybrid SEL', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2021': {
        trims: ['SE', 'SEL', 'SEL Plus', 'Limited', 'N Line', 'Hybrid SE', 'Hybrid SEL', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['SE', 'SEL', 'SEL Plus', 'Limited', 'N Line', 'Hybrid SE', 'Hybrid SEL', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['SE', 'SEL', 'SEL Plus', 'Limited', 'N Line', 'Hybrid SE', 'Hybrid SEL', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['SE', 'SEL', 'SEL Plus', 'Limited', 'N Line', 'Hybrid SE', 'Hybrid SEL', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['SE', 'SEL', 'SEL Plus', 'Limited', 'N Line', 'Hybrid SE', 'Hybrid SEL', 'Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
    },
    'Tucson': {
      // ===== 3RD GENERATION (2016-2020) =====
      '2015': {
        trims: ['SE', 'Eco', 'Sport', 'Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['SE', 'Eco', 'Sport', 'Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['SE', 'Eco', 'Sport', 'Value', 'Limited', 'Night'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['SE', 'SEL', 'Value', 'Sport', 'Limited', 'Night', 'Ultimate'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['SE', 'SEL', 'Value', 'Sport', 'Limited', 'Night', 'Ultimate'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['SE', 'SEL', 'Value', 'Sport', 'Limited', 'Night', 'Ultimate'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 4TH GENERATION (2021-Present) =====
      '2021': {
        trims: ['SE', 'SEL', 'N Line', 'Limited', 'Ultimate'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['SE', 'SEL', 'N Line', 'Limited', 'Ultimate', 'Hybrid Blue', 'Hybrid SEL', 'Hybrid Limited', 'Plug-in Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['SE', 'SEL', 'N Line', 'Limited', 'Ultimate', 'Hybrid Blue', 'Hybrid SEL', 'Hybrid Limited', 'Plug-in Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['SE', 'SEL', 'N Line', 'Limited', 'Ultimate', 'Hybrid Blue', 'Hybrid SEL', 'Hybrid Limited', 'Plug-in Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['SE', 'SEL', 'N Line', 'Limited', 'Ultimate', 'Hybrid Blue', 'Hybrid SEL', 'Hybrid Limited', 'Plug-in Hybrid Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
    'Santa Fe': {
      // ===== 3RD GENERATION (2013-2018) =====
      '2015': {
        trims: ['SE', 'Sport', 'Limited'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['SE', 'Sport', 'Limited', 'Ultimate'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['SE', 'SEL', 'Sport', 'Limited', 'Ultimate'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['SE', 'SEL', 'SEL Plus', 'Sport', 'Limited', 'Limited Ultimate'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 4TH GENERATION (2019-Present) =====
      '2019': {
        trims: ['SE', 'SEL', 'SEL Plus', 'Limited', 'Limited 2.0T', 'Ultimate'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['SE', 'SEL', 'SEL Plus', 'Limited', 'Limited 2.0T', 'Ultimate'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['SE', 'SEL', 'SEL Plus', 'Limited', 'Calligraphy'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['SE', 'SEL', 'SEL Plus', 'Limited', 'Calligraphy', 'Hybrid SEL', 'Hybrid Limited', 'Hybrid Calligraphy', 'Plug-in Hybrid Limited', 'Plug-in Hybrid Calligraphy'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['SE', 'SEL', 'XRT', 'Limited', 'Calligraphy', 'Hybrid SEL', 'Hybrid Limited', 'Hybrid Calligraphy', 'Plug-in Hybrid Limited', 'Plug-in Hybrid Calligraphy'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['SE', 'SEL', 'XRT', 'Limited', 'Calligraphy', 'Hybrid SEL', 'Hybrid Limited', 'Hybrid Calligraphy', 'Plug-in Hybrid Limited', 'Plug-in Hybrid Calligraphy'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['SE', 'SEL', 'XRT', 'Limited', 'Calligraphy', 'Hybrid SEL', 'Hybrid Limited', 'Hybrid Calligraphy', 'Plug-in Hybrid Limited', 'Plug-in Hybrid Calligraphy'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
  },
  'Kia': {
    'Forte': {
      // ===== 2ND GENERATION (2014-2018) =====
      '2015': {
        trims: ['LX', 'EX', 'SX'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['LX', 'EX', 'SX'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['LX', 'S', 'EX', 'SX'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['LX', 'S', 'EX', 'SX'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== 3RD GENERATION (2019-Present) =====
      '2019': {
        trims: ['FE', 'LXS', 'EX', 'GT-Line'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['FE', 'LXS', 'EX', 'GT-Line'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['FE', 'LXS', 'EX', 'GT-Line'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['LX', 'LXS', 'GT-Line', 'GT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['LX', 'LXS', 'GT-Line', 'GT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['LX', 'LXS', 'GT-Line', 'GT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['LX', 'LXS', 'GT-Line', 'GT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
    },
    'Optima': {
      // ===== 3RD GENERATION (2011-2015) =====
      '2015': {
        trims: ['LX', 'EX', 'SX', 'SXL Turbo'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== 4TH GENERATION (2016-2020) =====
      '2016': {
        trims: ['LX', 'LX Turbo', 'EX', 'SX', 'SXL Turbo', 'Hybrid EX', 'Hybrid LX'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2017': {
        trims: ['LX', 'LX Turbo', 'EX', 'SX', 'SX Limited', 'SXL Turbo', 'Hybrid EX', 'Hybrid LX', 'Plug-in Hybrid EX'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2018': {
        trims: ['LX', 'LX Turbo', 'S', 'EX', 'SX', 'SX Limited', 'SXL Turbo', 'Hybrid EX', 'Hybrid LX'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2019': {
        trims: ['LX', 'LX Turbo', 'S', 'EX', 'SX', 'SXL Turbo', 'Hybrid EX', 'Hybrid LX'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2020': {
        trims: ['LX', 'LX Turbo', 'S', 'EX', 'SX', 'SXL Turbo', 'Hybrid EX'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
    },
    'K5': {
      // ===== 1ST GENERATION (2021-Present) - Replaced Optima =====
      '2021': {
        trims: ['LX', 'LXS', 'GT-Line', 'EX', 'GT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['LX', 'LXS', 'GT-Line', 'EX', 'GT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['LX', 'LXS', 'GT-Line', 'EX', 'GT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['LX', 'LXS', 'GT-Line', 'EX', 'GT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['LX', 'LXS', 'GT-Line', 'EX', 'GT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
    },
    'Sportage': {
      // ===== 3RD GENERATION (2011-2016) =====
      '2015': {
        trims: ['LX', 'EX', 'SX'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['LX', 'EX', 'SX', 'SX Turbo'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 4TH GENERATION (2017-2022) =====
      '2017': {
        trims: ['LX', 'EX', 'SX', 'SX Turbo'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['LX', 'EX', 'SX', 'SX Turbo'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['LX', 'S', 'EX', 'SX', 'SX Turbo'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['LX', 'S', 'EX', 'SX', 'SX Turbo'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['LX', 'S', 'EX', 'SX', 'SX Turbo'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['LX', 'S', 'EX', 'SX', 'SX Turbo'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 5TH GENERATION (2023-Present) =====
      '2023': {
        trims: ['LX', 'EX', 'X-Line', 'SX', 'SX Prestige', 'Hybrid LX', 'Hybrid EX', 'Hybrid SX', 'Hybrid SX Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['LX', 'EX', 'X-Line', 'SX', 'SX Prestige', 'Hybrid LX', 'Hybrid EX', 'Hybrid SX', 'Hybrid SX Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['LX', 'EX', 'X-Line', 'SX', 'SX Prestige', 'Hybrid LX', 'Hybrid EX', 'Hybrid SX', 'Hybrid SX Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
    'Sorento': {
      // ===== 2ND GENERATION (2011-2015) =====
      '2015': {
        trims: ['LX', 'EX', 'SX', 'SX Limited'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 3RD GENERATION (2016-2020) =====
      '2016': {
        trims: ['L', 'LX', 'EX', 'SX', 'SX Limited'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['L', 'LX', 'EX', 'SX', 'SX Limited', 'SXL'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['L', 'LX', 'EX', 'SX', 'SX Limited', 'SXL'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['L', 'LX', 'EX', 'SX', 'SX Limited', 'SXL'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['L', 'LX', 'S', 'EX', 'SX', 'SX Limited', 'SXL'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 4TH GENERATION (2021-Present) =====
      '2021': {
        trims: ['LX', 'S', 'EX', 'SX', 'SX Prestige', 'Hybrid LX', 'Hybrid EX', 'Hybrid SX', 'Hybrid SX Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['LX', 'S', 'EX', 'SX', 'SX Prestige', 'Hybrid LX', 'Hybrid EX', 'Hybrid SX', 'Hybrid SX Prestige', 'Plug-in Hybrid SX', 'Plug-in Hybrid SX Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['LX', 'S', 'EX', 'SX', 'SX Prestige', 'X-Line', 'Hybrid LX', 'Hybrid EX', 'Hybrid SX', 'Hybrid SX Prestige', 'Plug-in Hybrid SX', 'Plug-in Hybrid SX Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['LX', 'S', 'EX', 'SX', 'SX Prestige', 'X-Line', 'Hybrid LX', 'Hybrid EX', 'Hybrid SX', 'Hybrid SX Prestige', 'Plug-in Hybrid SX', 'Plug-in Hybrid SX Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['LX', 'S', 'EX', 'SX', 'SX Prestige', 'X-Line', 'Hybrid LX', 'Hybrid EX', 'Hybrid SX', 'Hybrid SX Prestige', 'Plug-in Hybrid SX', 'Plug-in Hybrid SX Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
  },
  'Jeep': {
    'Cherokee': {
      // ===== 5TH GENERATION (2014-Present) =====
      '2015': {
        trims: ['Sport', 'Latitude', 'Limited', 'Trailhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['Sport', 'Latitude', 'Limited', 'Trailhawk', 'Overland'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['Sport', 'Latitude', 'Limited', 'Trailhawk', 'Overland'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['Sport', 'Latitude', 'Latitude Plus', 'Limited', 'Trailhawk', 'Overland'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['Latitude', 'Latitude Plus', 'Limited', 'Trailhawk', 'Overland', 'High Altitude'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Latitude', 'Latitude Plus', 'Latitude Lux', 'Limited', 'Trailhawk', 'Overland', 'High Altitude'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Latitude', 'Latitude Plus', 'Latitude Lux', 'Limited', '80th Anniversary', 'Trailhawk', 'Overland', 'High Altitude'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['Latitude', 'Latitude Lux', 'Limited', 'Trailhawk', 'Altitude', 'Overland', 'High Altitude'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['Latitude', 'Latitude Lux', 'Limited', 'Trailhawk', 'Altitude', 'Overland', 'High Altitude'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['Latitude', 'Latitude Lux', 'Limited', 'Trailhawk', 'Altitude', 'Overland', 'High Altitude'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['Latitude', 'Latitude Lux', 'Limited', 'Trailhawk', 'Altitude', 'Overland', 'High Altitude'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
    },
    'Grand Cherokee': {
      // ===== 4TH GENERATION (2011-2021) =====
      '2015': {
        trims: ['Laredo', 'Limited', 'Overland', 'Summit', 'SRT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['Laredo', 'Limited', '75th Anniversary', 'Overland', 'Summit', 'SRT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['Laredo', 'Limited', 'Trailhawk', 'Overland', 'Summit', 'SRT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['Laredo', 'Limited', 'Trailhawk', 'Overland', 'Summit', 'SRT', 'Trackhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['Laredo', 'Limited', 'Trailhawk', 'Overland', 'Summit', 'High Altitude', 'SRT', 'Trackhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Laredo', 'Limited', 'Trailhawk', 'Overland', 'Summit', 'High Altitude', 'SRT', 'Trackhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Laredo', 'Limited', '80th Anniversary', 'Trailhawk', 'Overland', 'Summit', 'High Altitude', 'SRT', 'Trackhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 5TH GENERATION (2021-Present) =====
      '2022': {
        trims: ['Laredo', 'Limited', 'Trailhawk', 'Altitude', 'Overland', 'Summit', 'Summit Reserve', '4xe', 'Trailhawk 4xe'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['Laredo', 'Altitude', 'Limited', 'Trailhawk', 'Overland', 'Summit', 'Summit Reserve', '4xe', 'Trailhawk 4xe'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['Laredo', 'Altitude', 'Limited', 'Trailhawk', 'Overland', 'Summit', 'Summit Reserve', '4xe', 'Trailhawk 4xe'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['Laredo', 'Altitude', 'Limited', 'Trailhawk', 'Overland', 'Summit', 'Summit Reserve', '4xe', 'Trailhawk 4xe'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
    'Wrangler': {
      // ===== 3RD GENERATION (2007-2018) =====
      '2015': {
        trims: ['Sport', 'Willys Wheeler', 'Sahara', 'Rubicon'],
        seats: 4,
        doors: 2,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['Sport', 'Willys Wheeler', 'Black Bear', 'Sahara', 'Rubicon'],
        seats: 4,
        doors: 2,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['Sport', 'Sport S', 'Willys Wheeler', 'Sahara', 'Rubicon', 'Rubicon Recon'],
        seats: 4,
        doors: 2,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['Sport', 'Sport S', 'Willys Wheeler', 'Sahara', 'Moab', 'Rubicon', 'Rubicon Recon'],
        seats: 4,
        doors: 2,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 4TH GENERATION (2018-Present) =====
      '2019': {
        trims: ['Sport', 'Sport S', 'Sahara', 'Moab', 'Rubicon'],
        seats: 4,
        doors: 2,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Sport', 'Sport S', 'Willys', 'Sahara', 'Rubicon', 'Rubicon Recon'],
        seats: 4,
        doors: 2,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Sport', 'Sport S', 'Willys', 'Sahara', '80th Anniversary', 'Rubicon', 'Rubicon 392', '4xe', 'Sahara 4xe', 'Rubicon 4xe'],
        seats: 4,
        doors: 2,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2022': {
        trims: ['Sport', 'Sport S', 'Willys', 'Sahara', 'Rubicon', 'Rubicon 392', '4xe', 'Sahara 4xe', 'Rubicon 4xe'],
        seats: 4,
        doors: 2,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2023': {
        trims: ['Sport', 'Sport S', 'Willys', 'Sahara', 'Rubicon', 'Rubicon 392', '4xe', 'Sahara 4xe', 'Rubicon 4xe'],
        seats: 4,
        doors: 2,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['Sport', 'Sport S', 'Willys', 'Sahara', 'Rubicon', 'Rubicon 392', '4xe', 'Sahara 4xe', 'Rubicon 4xe'],
        seats: 4,
        doors: 2,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['Sport', 'Sport S', 'Willys', 'Sahara', 'Rubicon', 'Rubicon 392', '4xe', 'Sahara 4xe', 'Rubicon 4xe'],
        seats: 4,
        doors: 2,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
    'Compass': {
      // ===== 2ND GENERATION (2017-Present) =====
      '2017': {
        trims: ['Sport', 'Latitude', 'Limited', 'Trailhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['Sport', 'Latitude', 'Limited', 'Trailhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['Sport', 'Latitude', 'Altitude', 'Limited', 'Trailhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Sport', 'Latitude', 'Altitude', 'Limited', 'Trailhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Sport', 'Latitude', 'Altitude', 'Limited', '80th Anniversary', 'Trailhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['Sport', 'Latitude', 'Latitude Lux', 'Altitude', 'Limited', 'Trailhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['Sport', 'Latitude', 'Latitude Lux', 'Altitude', 'Limited', 'Trailhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['Sport', 'Latitude', 'Latitude Lux', 'Altitude', 'Limited', 'Trailhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['Sport', 'Latitude', 'Latitude Lux', 'Altitude', 'Limited', 'Trailhawk'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
    },
  },
  'Subaru': {
    'Impreza': {
      // ===== 4TH GENERATION (2012-2016) =====
      '2015': {
        trims: ['2.0i', '2.0i Premium', '2.0i Sport Premium', '2.0i Limited', '2.0i Sport Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['2.0i', '2.0i Premium', '2.0i Sport Premium', '2.0i Limited', '2.0i Sport Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== 5TH GENERATION (2017-Present) =====
      '2017': {
        trims: ['2.0i', '2.0i Premium', '2.0i Sport', '2.0i Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['2.0i', '2.0i Premium', '2.0i Sport', '2.0i Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['2.0i', '2.0i Premium', '2.0i Sport', '2.0i Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Base', 'Premium', 'Sport', 'Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Base', 'Premium', 'Sport', 'Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'RS'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'RS'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'RS'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'RS'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
    },
    'Legacy': {
      // ===== 6TH GENERATION (2015-2019) =====
      '2015': {
        trims: ['2.5i', '2.5i Premium', '2.5i Limited', '3.6R Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['2.5i', '2.5i Premium', '2.5i Limited', '3.6R Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['2.5i', '2.5i Premium', '2.5i Sport', '2.5i Limited', '3.6R Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['2.5i', '2.5i Premium', '2.5i Sport', '2.5i Limited', '3.6R Limited', '3.6R Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['2.5i', '2.5i Premium', '2.5i Sport', '2.5i Limited', '3.6R Limited', '3.6R Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== 7TH GENERATION (2020-Present) =====
      '2020': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'Limited XT', 'Touring XT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'Limited XT', 'Touring XT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'Limited XT', 'Touring XT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'Limited XT', 'Touring XT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'Limited XT', 'Touring XT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'Limited XT', 'Touring XT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
    },
    'Outback': {
      // ===== 5TH GENERATION (2015-2019) =====
      '2015': {
        trims: ['2.5i', '2.5i Premium', '2.5i Limited', '3.6R Limited'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'wagon',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['2.5i', '2.5i Premium', '2.5i Limited', '3.6R Limited', '3.6R Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'wagon',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['2.5i', '2.5i Premium', '2.5i Limited', '3.6R Limited', '3.6R Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'wagon',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['2.5i', '2.5i Premium', '2.5i Limited', '3.6R Limited', '3.6R Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'wagon',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['2.5i', '2.5i Premium', '2.5i Limited', '3.6R Limited', '3.6R Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'wagon',
        fuelType: 'gas'
      },
      // ===== 6TH GENERATION (2020-Present) =====
      '2020': {
        trims: ['Base', 'Premium', 'Onyx Edition XT', 'Limited', 'Limited XT', 'Touring XT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'wagon',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Base', 'Premium', 'Onyx Edition XT', 'Limited', 'Limited XT', 'Touring XT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'wagon',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['Base', 'Premium', 'Onyx Edition XT', 'Limited', 'Limited XT', 'Touring XT', 'Wilderness'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'wagon',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['Base', 'Premium', 'Onyx Edition XT', 'Limited', 'Limited XT', 'Touring XT', 'Wilderness'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'wagon',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['Base', 'Premium', 'Onyx Edition XT', 'Limited', 'Limited XT', 'Touring XT', 'Wilderness'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'wagon',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['Base', 'Premium', 'Onyx Edition XT', 'Limited', 'Limited XT', 'Touring XT', 'Wilderness'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'wagon',
        fuelType: 'gas'
      },
    },
    'Forester': {
      // ===== 4TH GENERATION (2014-2018) =====
      '2015': {
        trims: ['2.5i', '2.5i Premium', '2.5i Limited', '2.5i Touring', '2.0XT Premium', '2.0XT Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['2.5i', '2.5i Premium', '2.5i Limited', '2.5i Touring', '2.0XT Premium', '2.0XT Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['2.5i', '2.5i Premium', '2.5i Limited', '2.5i Touring', '2.0XT Premium', '2.0XT Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['2.5i', '2.5i Premium', '2.5i Limited', '2.5i Touring', '2.0XT Premium', '2.0XT Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 5TH GENERATION (2019-Present) =====
      '2019': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'Touring', 'Wilderness'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'Touring', 'Wilderness'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'Touring', 'Wilderness'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['Base', 'Premium', 'Sport', 'Limited', 'Touring', 'Wilderness'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
    },
  },
  'Mazda': {
    'Mazda3': {
      // ===== 3RD GENERATION (2014-2018) =====
      '2015': {
        trims: ['i Sport', 'i Touring', 'i Grand Touring', 's Touring', 's Grand Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['i Sport', 'i Touring', 'i Grand Touring', 's Touring', 's Grand Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['Sport', 'Touring', 'Touring 2.5', 'Grand Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['Sport', 'Touring', 'Grand Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== 4TH GENERATION (2019-Present) =====
      '2019': {
        trims: ['Base', 'Preferred', 'Select', 'Premium'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Base', 'Preferred', 'Select', 'Premium'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Base', 'Preferred', 'Select', 'Premium', '2.5 Turbo', '2.5 Turbo Premium Plus'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['Base', 'Preferred', 'Select', 'Premium', '2.5 Turbo', '2.5 Turbo Premium Plus'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['Base', 'Preferred', 'Select', 'Premium', '2.5 Turbo', '2.5 Turbo Premium Plus'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['Base', 'Preferred', 'Select', 'Premium', '2.5 Turbo', '2.5 Turbo Premium Plus'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['Base', 'Preferred', 'Select', 'Premium', '2.5 Turbo', '2.5 Turbo Premium Plus'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
    },
    'Mazda6': {
      // ===== 3RD GENERATION (2014-2021) =====
      '2015': {
        trims: ['Sport', 'Touring', 'Grand Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['Sport', 'Touring', 'Grand Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['Sport', 'Touring', 'Grand Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['Sport', 'Touring', 'Grand Touring', 'Grand Touring Reserve', 'Signature'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['Sport', 'Touring', 'Grand Touring', 'Grand Touring Reserve', 'Signature'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Sport', 'Touring', 'Grand Touring', 'Grand Touring Reserve', 'Signature'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Sport', 'Touring', 'Carbon Edition', 'Grand Touring', 'Grand Touring Reserve', 'Signature'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
    },
    'CX-5': {
      // ===== 1ST GENERATION (2013-2016) =====
      '2015': {
        trims: ['Sport', 'Touring', 'Grand Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['Sport', 'Touring', 'Grand Touring'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 2ND GENERATION (2017-Present) =====
      '2017': {
        trims: ['Sport', 'Touring', 'Grand Touring', 'Grand Select'],
        seats: 5,
        doors: 4,
        transmission: 'automatic/manual',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['Sport', 'Touring', 'Grand Touring', 'Grand Touring Reserve'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['Sport', 'Touring', 'Grand Touring', 'Grand Touring Reserve', 'Signature'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Sport', 'Touring', 'Grand Touring', 'Grand Touring Reserve', 'Signature'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Sport', 'Touring', 'Carbon Edition', 'Grand Touring', 'Grand Touring Reserve', 'Signature'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['Sport', 'Touring', 'Carbon Edition', 'Grand Touring', 'Grand Touring Reserve', 'Signature', '2.5 Turbo'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['Sport', 'Preferred', 'Select', 'Premium', 'Premium Plus', '2.5 Turbo', '2.5 Turbo Premium Plus'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['Sport', 'Preferred', 'Select', 'Premium', 'Premium Plus', '2.5 Turbo', '2.5 Turbo Premium Plus'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['Sport', 'Preferred', 'Select', 'Premium', 'Premium Plus', '2.5 Turbo', '2.5 Turbo Premium Plus'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
    },
    'CX-9': {
      // ===== 2ND GENERATION (2016-Present) =====
      '2016': {
        trims: ['Sport', 'Touring', 'Grand Touring'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['Sport', 'Touring', 'Grand Touring', 'Signature'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['Sport', 'Touring', 'Grand Touring', 'Signature'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['Sport', 'Touring', 'Grand Touring', 'Signature'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Sport', 'Touring', 'Grand Touring', 'Signature'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Sport', 'Touring', 'Carbon Edition', 'Grand Touring', 'Signature'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['Sport', 'Touring', 'Carbon Edition', 'Grand Touring', 'Signature'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['Sport', 'Touring', 'Carbon Edition', 'Grand Touring', 'Signature'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['Sport', 'Touring', 'Carbon Edition', 'Grand Touring', 'Signature'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['Sport', 'Touring', 'Carbon Edition', 'Grand Touring', 'Signature'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
    },
  },

  // ===== TIER 3: PREMIUM BRANDS =====
  'BMW': {
    '3 Series': {
      // ===== F30 GENERATION (2012-2018) =====
      '2015': {
        trims: ['320i', '320i xDrive', '328i', '328i xDrive', '328d', '328d xDrive', '335i', '335i xDrive', 'ActiveHybrid 3'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['320i', '320i xDrive', '328i', '328i xDrive', '328d', '328d xDrive', '340i', '340i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['320i', '320i xDrive', '330i', '330i xDrive', '330e iPerformance', '340i', '340i xDrive', '340i xDrive Gran Turismo'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['320i', '320i xDrive', '330i', '330i xDrive', '330e iPerformance', '340i', '340i xDrive', '340i xDrive Gran Turismo'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== G20 GENERATION (2019-2025) =====
      '2019': {
        trims: ['330i', '330i xDrive', 'M340i', 'M340i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['330i', '330i xDrive', '330e', 'M340i', 'M340i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['330i', '330i xDrive', '330e', 'M340i', 'M340i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['330i', '330i xDrive', '330e', 'M340i', 'M340i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['330i', '330i xDrive', '330e', 'M340i', 'M340i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['330i', '330i xDrive', '330e', 'M340i', 'M340i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['330i', '330i xDrive', '330e', 'M340i', 'M340i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
    },
    '5 Series': {
      // ===== F10 GENERATION (2011-2016) =====
      '2015': {
        trims: ['528i', '528i xDrive', '535d', '535d xDrive', '535i', '535i xDrive', '535i Gran Turismo', '550i', '550i xDrive', 'ActiveHybrid 5'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['528i', '528i xDrive', '535d', '535d xDrive', '535i', '535i xDrive', '535i Gran Turismo', '550i', '550i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== G30 GENERATION (2017-2025) =====
      '2017': {
        trims: ['530i', '530i xDrive', '540i', '540i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['530i', '530i xDrive', '530e', '530e xDrive', '540i', '540i xDrive', 'M550i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['530i', '530i xDrive', '530e', '530e xDrive', '540i', '540i xDrive', 'M550i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['530i', '530i xDrive', '530e', '530e xDrive', '540i', '540i xDrive', 'M550i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['530i', '530i xDrive', '530e', '530e xDrive', '540i', '540i xDrive', 'M550i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['530i', '530i xDrive', '530e', '530e xDrive', '540i', '540i xDrive', 'M550i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['530i', '530i xDrive', '530e', '530e xDrive', '540i', '540i xDrive', 'M550i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['530i', '530i xDrive', '530e', '530e xDrive', '540i', '540i xDrive', 'M550i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['530i', '530i xDrive', '530e', '530e xDrive', '540i', '540i xDrive', 'M550i xDrive'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
    },
    'X3': {
      // ===== F25 GENERATION (2011-2017) =====
      '2015': {
        trims: ['sDrive28i', 'xDrive28i', 'xDrive28d', 'xDrive35i'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['sDrive28i', 'xDrive28i', 'xDrive28d', 'xDrive35i'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['sDrive28i', 'xDrive28i', 'xDrive28d', 'xDrive35i'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== G01 GENERATION (2018-2025) =====
      '2018': {
        trims: ['sDrive30i', 'xDrive30i', 'M40i'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['sDrive30i', 'xDrive30i', 'M40i'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['sDrive30i', 'xDrive30i', 'xDrive30e', 'M40i'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['sDrive30i', 'xDrive30i', 'xDrive30e', 'M40i'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['sDrive30i', 'xDrive30i', 'xDrive30e', 'M40i'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['sDrive30i', 'xDrive30i', 'xDrive30e', 'M40i'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['sDrive30i', 'xDrive30i', 'xDrive30e', 'M40i'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['sDrive30i', 'xDrive30i', 'xDrive30e', 'M40i'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
    },
    'X5': {
      // ===== F15 GENERATION (2014-2018) =====
      '2015': {
        trims: ['sDrive35i', 'xDrive35i', 'xDrive35d', 'xDrive50i'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['sDrive35i', 'xDrive35i', 'xDrive35d', 'xDrive40e', 'xDrive50i'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['sDrive35i', 'xDrive35i', 'xDrive35d', 'xDrive40e', 'xDrive50i'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['sDrive35i', 'xDrive35i', 'xDrive35d', 'xDrive40e', 'xDrive50i'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== G05 GENERATION (2019-2025) =====
      '2019': {
        trims: ['sDrive40i', 'xDrive40i', 'xDrive50i'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['sDrive40i', 'xDrive40i', 'xDrive45e', 'xDrive50i', 'M50i'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['sDrive40i', 'xDrive40i', 'xDrive45e', 'xDrive50i', 'M50i'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['sDrive40i', 'xDrive40i', 'xDrive45e', 'xDrive50i', 'M50i'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['sDrive40i', 'xDrive40i', 'xDrive45e', 'xDrive50i', 'M60i'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['sDrive40i', 'xDrive40i', 'xDrive45e', 'xDrive50i', 'M60i'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['sDrive40i', 'xDrive40i', 'xDrive45e', 'xDrive50i', 'M60i'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
    },
  },

  'Audi': {
    'A4': {
      // ===== B8 GENERATION (2008-2016) =====
      '2015': {
        trims: ['Premium', 'Premium Plus', 'Prestige', 'allroad Premium', 'allroad Premium Plus', 'allroad Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['Premium', 'Premium Plus', 'Prestige', 'allroad Premium', 'allroad Premium Plus', 'allroad Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== B9 GENERATION (2017-2025) =====
      '2017': {
        trims: ['Premium', 'Premium Plus', 'Prestige', 'allroad Premium', 'allroad Premium Plus', 'allroad Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['Premium', 'Premium Plus', 'Prestige', 'allroad Premium', 'allroad Premium Plus', 'allroad Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['Premium', 'Premium Plus', 'Prestige', 'allroad Premium', 'allroad Premium Plus', 'allroad Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige', 'allroad Premium', 'allroad Premium Plus', 'allroad Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige', 'allroad Premium', 'allroad Premium Plus', 'allroad Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige', 'allroad Premium', 'allroad Premium Plus', 'allroad Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige', 'allroad Premium', 'allroad Premium Plus', 'allroad Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige', 'allroad Premium', 'allroad Premium Plus', 'allroad Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige', 'allroad Premium', 'allroad Premium Plus', 'allroad Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
    },
    'A6': {
      // ===== C7 GENERATION (2012-2018) =====
      '2015': {
        trims: ['Premium', 'Premium Plus', 'Prestige', 'TDI Premium Plus', 'TDI Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['Premium', 'Premium Plus', 'Prestige', 'TDI Premium Plus', 'TDI Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['Premium', 'Premium Plus', 'Prestige', 'Competition Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['Premium', 'Premium Plus', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== C8 GENERATION (2019-2025) =====
      '2019': {
        trims: ['Premium', 'Premium Plus', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
    },
    'Q5': {
      // ===== 8R GENERATION (2009-2017) =====
      '2015': {
        trims: ['Premium', 'Premium Plus', 'Prestige', 'TDI Premium', 'TDI Premium Plus', 'TDI Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['Premium', 'Premium Plus', 'Prestige', 'TDI Premium', 'TDI Premium Plus', 'TDI Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['Premium', 'Premium Plus', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== FY GENERATION (2018-2025) =====
      '2018': {
        trims: ['Premium', 'Premium Plus', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
    },
    'Q7': {
      // ===== 4L GENERATION (2007-2015) =====
      '2015': {
        trims: ['Premium', 'Premium Plus', 'Prestige', 'TDI Premium', 'TDI Premium Plus', 'TDI Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['Premium', 'Premium Plus', 'Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== 4M GENERATION (2017-2025) =====
      '2017': {
        trims: ['Premium', 'Premium Plus', 'Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['Premium', 'Premium Plus', 'Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Premium Plus 55 TFSI', 'Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Premium Plus 55 TFSI', 'Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Premium Plus 55 TFSI', 'Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Premium Plus 55 TFSI', 'Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Premium Plus 55 TFSI', 'Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['Premium', 'Premium Plus', 'Premium Plus 45 TFSI', 'Premium Plus 55 TFSI', 'Prestige'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
    },
  },

  'Lexus': {
    'ES': {
      // ===== XV60 GENERATION (2013-2018) =====
      '2015': {
        trims: ['ES 300h', 'ES 350'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['ES 300h', 'ES 350'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['ES 300h', 'ES 350'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['ES 300h', 'ES 350'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== XV70 GENERATION (2019-2025) =====
      '2019': {
        trims: ['ES 300h', 'ES 350', 'ES 350 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['ES 300h', 'ES 350', 'ES 350 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['ES 250 AWD', 'ES 300h', 'ES 350', 'ES 350 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['ES 250 AWD', 'ES 300h', 'ES 350', 'ES 350 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['ES 250 AWD', 'ES 300h', 'ES 350', 'ES 350 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['ES 250 AWD', 'ES 300h', 'ES 350', 'ES 350 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['ES 250 AWD', 'ES 300h', 'ES 350', 'ES 350 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas/hybrid'
      },
    },
    'RX': {
      // ===== AL20 GENERATION (2016-2019) =====
      '2015': {
        trims: ['RX 350', 'RX 350 F SPORT', 'RX 450h', 'RX 450h F SPORT'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['RX 350', 'RX 350 F SPORT', 'RX 450h', 'RX 450h F SPORT'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['RX 350', 'RX 350 F SPORT', 'RX 450h', 'RX 450h F SPORT'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['RX 350', 'RX 350 F SPORT', 'RX 350L', 'RX 450h', 'RX 450h F SPORT', 'RX 450hL'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['RX 350', 'RX 350 F SPORT', 'RX 350L', 'RX 450h', 'RX 450h F SPORT', 'RX 450hL'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== AL25 GENERATION (2020-2025) =====
      '2020': {
        trims: ['RX 350', 'RX 350 F SPORT', 'RX 350L', 'RX 450h', 'RX 450h F SPORT', 'RX 450hL'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['RX 350', 'RX 350 F SPORT', 'RX 350L', 'RX 450h', 'RX 450h F SPORT', 'RX 450hL'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['RX 350', 'RX 350 F SPORT', 'RX 350L', 'RX 450h', 'RX 450h F SPORT', 'RX 450hL'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['RX 350', 'RX 350 F SPORT', 'RX 350h', 'RX 450h+', 'RX 500h F SPORT'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['RX 350', 'RX 350 F SPORT', 'RX 350h', 'RX 450h+', 'RX 500h F SPORT'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['RX 350', 'RX 350 F SPORT', 'RX 350h', 'RX 450h+', 'RX 500h F SPORT'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
    'NX': {
      // ===== XZ10 GENERATION (2015-2021) =====
      '2015': {
        trims: ['NX 200t', 'NX 200t F SPORT', 'NX 300h', 'NX 300h F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['NX 200t', 'NX 200t F SPORT', 'NX 300h', 'NX 300h F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['NX 200t', 'NX 200t F SPORT', 'NX 300h', 'NX 300h F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['NX 300', 'NX 300 F SPORT', 'NX 300h', 'NX 300h F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['NX 300', 'NX 300 F SPORT', 'NX 300h', 'NX 300h F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['NX 300', 'NX 300 F SPORT', 'NX 300h', 'NX 300h F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2021': {
        trims: ['NX 300', 'NX 300 F SPORT', 'NX 300h', 'NX 300h F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      // ===== XZ25 GENERATION (2022-2025) =====
      '2022': {
        trims: ['NX 250', 'NX 350', 'NX 350 F SPORT', 'NX 350h', 'NX 450h+'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['NX 250', 'NX 350', 'NX 350 F SPORT', 'NX 350h', 'NX 450h+'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2024': {
        trims: ['NX 250', 'NX 350', 'NX 350 F SPORT', 'NX 350h', 'NX 450h+'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
      '2025': {
        trims: ['NX 250', 'NX 350', 'NX 350 F SPORT', 'NX 350h', 'NX 450h+'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'gas/hybrid'
      },
    },
    'IS': {
      // ===== XE30 GENERATION (2014-2020) =====
      '2015': {
        trims: ['IS 250', 'IS 250 F SPORT', 'IS 350', 'IS 350 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2016': {
        trims: ['IS 200t', 'IS 200t F SPORT', 'IS 300', 'IS 300 F SPORT', 'IS 350', 'IS 350 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2017': {
        trims: ['IS 200t', 'IS 200t F SPORT', 'IS 300', 'IS 300 F SPORT', 'IS 350', 'IS 350 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2018': {
        trims: ['IS 300', 'IS 300 F SPORT', 'IS 350', 'IS 350 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2019': {
        trims: ['IS 300', 'IS 300 F SPORT', 'IS 350', 'IS 350 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2020': {
        trims: ['IS 300', 'IS 300 F SPORT', 'IS 350', 'IS 350 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      // ===== XE40 GENERATION (2021-2025) =====
      '2021': {
        trims: ['IS 300', 'IS 300 F SPORT', 'IS 350', 'IS 350 F SPORT', 'IS 500 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2022': {
        trims: ['IS 300', 'IS 300 F SPORT', 'IS 350', 'IS 350 F SPORT', 'IS 500 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2023': {
        trims: ['IS 300', 'IS 300 F SPORT', 'IS 350', 'IS 350 F SPORT', 'IS 500 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2024': {
        trims: ['IS 300', 'IS 300 F SPORT', 'IS 350', 'IS 350 F SPORT', 'IS 500 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
      '2025': {
        trims: ['IS 300', 'IS 300 F SPORT', 'IS 350', 'IS 350 F SPORT', 'IS 500 F SPORT'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'gas'
      },
    },
  },

  'Tesla': {
    'Model S': {
      // ===== 1ST GENERATION (2012-2016) =====
      '2015': {
        trims: ['70D', '85', '85D', 'P85D', 'P90D'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2016': {
        trims: ['60', '60D', '70', '70D', '75', '75D', '90D', 'P90D', 'P100D'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      // ===== 2ND GENERATION REFRESH (2017-2020) =====
      '2017': {
        trims: ['75', '75D', '90D', '100D', 'P100D'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2018': {
        trims: ['75D', '100D', 'P100D'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2019': {
        trims: ['Standard Range', 'Long Range', 'Performance'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2020': {
        trims: ['Long Range', 'Performance'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      // ===== PLAID REFRESH (2021-2025) =====
      '2021': {
        trims: ['Long Range', 'Plaid'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2022': {
        trims: ['Long Range', 'Plaid'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2023': {
        trims: ['Long Range', 'Plaid'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2024': {
        trims: ['Long Range', 'Plaid'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2025': {
        trims: ['Long Range', 'Plaid'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
    },
    'Model X': {
      // ===== 1ST GENERATION (2015-2020) =====
      '2015': {
        trims: ['70D', '90D', 'P90D'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2016': {
        trims: ['60D', '70D', '75D', '90D', 'P90D', 'P100D'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2017': {
        trims: ['75D', '90D', '100D', 'P100D'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2018': {
        trims: ['75D', '100D', 'P100D'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2019': {
        trims: ['Standard Range', 'Long Range', 'Performance'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2020': {
        trims: ['Long Range', 'Performance'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      // ===== PLAID REFRESH (2021-2025) =====
      '2021': {
        trims: ['Long Range', 'Plaid'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2022': {
        trims: ['Long Range', 'Plaid'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2023': {
        trims: ['Long Range', 'Plaid'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2024': {
        trims: ['Long Range', 'Plaid'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2025': {
        trims: ['Long Range', 'Plaid'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
    },
    'Model 3': {
      // ===== 1ST GENERATION (2017-2023) =====
      '2017': {
        trims: ['Long Range'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2018': {
        trims: ['Mid Range', 'Long Range', 'Performance'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2019': {
        trims: ['Standard Range Plus', 'Long Range', 'Performance'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2020': {
        trims: ['Standard Range Plus', 'Long Range', 'Performance'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2021': {
        trims: ['Standard Range Plus', 'Long Range', 'Performance'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2022': {
        trims: ['Rear-Wheel Drive', 'Long Range', 'Performance'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2023': {
        trims: ['Rear-Wheel Drive', 'Long Range', 'Performance'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      // ===== HIGHLAND REFRESH (2024-2025) =====
      '2024': {
        trims: ['Rear-Wheel Drive', 'Long Range', 'Performance'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
      '2025': {
        trims: ['Rear-Wheel Drive', 'Long Range', 'Performance'],
        seats: 5,
        doors: 4,
        transmission: 'automatic',
        carType: 'sedan',
        fuelType: 'electric'
      },
    },
    'Model Y': {
      // ===== 1ST GENERATION (2020-2025) =====
      '2020': {
        trims: ['Long Range', 'Performance'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2021': {
        trims: ['Standard Range', 'Long Range', 'Performance'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2022': {
        trims: ['Long Range', 'Performance'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2023': {
        trims: ['Rear-Wheel Drive', 'Long Range', 'Performance'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2024': {
        trims: ['Rear-Wheel Drive', 'Long Range', 'Performance'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
      '2025': {
        trims: ['Rear-Wheel Drive', 'Long Range', 'Performance'],
        seats: 7,
        doors: 4,
        transmission: 'automatic',
        carType: 'suv',
        fuelType: 'electric'
      },
    },
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get all available makes (sorted alphabetically)
export function getAllMakes(): string[] {
  return Object.keys(vehicleSpecs).sort()
}

// Get models for a specific make
export function getModelsByMake(make: string): string[] {
  const makeData = vehicleSpecs[make]
  return makeData ? Object.keys(makeData).sort() : []
}

// Get spec for a specific make/model
export function getModelSpec(make: string, model: string): CarSpec | null {
  return vehicleSpecs[make]?.[model] || null
}

// Get trims for a specific make/model (optionally filtered by year)
export function getTrimsByModel(make: string, model: string, year?: string): string[] {
  // If year provided and year-specific data exists, use it
  if (year && vehicleSpecsByYear[make]?.[model]?.[year]) {
    return vehicleSpecsByYear[make][model][year].trims
  }

  // Fallback to current year if available in year-based data
  if (vehicleSpecsByYear[make]?.[model]) {
    const currentYear = new Date().getFullYear().toString()
    if (vehicleSpecsByYear[make][model][currentYear]) {
      return vehicleSpecsByYear[make][model][currentYear].trims
    }
  }

  // Final fallback to legacy database
  return vehicleSpecs[make]?.[model]?.trims || []
}

// Get available years for a specific make/model from year-based data
export function getYearsByModel(make: string, model: string): string[] {
  if (!vehicleSpecsByYear[make]?.[model]) {
    return []
  }
  return Object.keys(vehicleSpecsByYear[make][model]).sort((a, b) => parseInt(b) - parseInt(a))
}

// Check if year-specific data exists for a make/model/year
export function hasYearData(make: string, model: string, year: string): boolean {
  return Boolean(vehicleSpecsByYear[make]?.[model]?.[year])
}

// Get the closest available year for a make/model if exact year is missing
export function getClosestYear(make: string, model: string, targetYear: string): string | null {
  const availableYears = getYearsByModel(make, model)
  if (availableYears.length === 0) {
    return null
  }

  // If exact year exists, return it
  if (availableYears.includes(targetYear)) {
    return targetYear
  }

  // Find closest year
  const target = parseInt(targetYear)
  let closest = availableYears[0]
  let minDiff = Math.abs(parseInt(closest) - target)

  for (const year of availableYears) {
    const diff = Math.abs(parseInt(year) - target)
    if (diff < minDiff) {
      minDiff = diff
      closest = year
    }
  }

  return closest
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
  return make in vehicleSpecs
}

// Validate if a model exists for a given make
export function isValidModel(make: string, model: string): boolean {
  return vehicleSpecs[make]?.[model] !== undefined
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
    'Aston Martin', 'Bentley', 'Ferrari', 'Lamborghini',
    'Maserati', 'McLaren', 'Porsche', 'Rolls-Royce',
    'Lucid', 'Genesis', 'Lexus', 'BMW',
    'Mercedes-Benz', 'Audi', 'Cadillac', 'Lincoln', 'Infiniti', 'Acura'
  ]
}

// Get electric vehicle makes
export function getEVMakes(): string[] {
  return [
    'Tesla', 'Rivian', 'Lucid', 'Polestar'
  ]
}

// Count total makes and models
export function getVehicleStats(): { totalMakes: number; totalModels: number } {
  const makes = Object.keys(vehicleSpecs)
  let totalModels = 0
  makes.forEach(make => {
    totalModels += Object.keys(vehicleSpecs[make]).length
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
  trim?: string
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

// Check if a model requires fuel type selection (has multiple fuel options)
export function requiresFuelTypeSelection(make: string, model: string): boolean {
  const spec = getModelSpec(make, model)
  if (!spec) return false
  return spec.fuelType === 'gas/hybrid' || spec.fuelType === 'gas/electric' || spec.fuelType === 'gas/diesel'
}

// Check if a model requires TransmissionType selection
export function requiresTransmissionTypeSelection(make: string, model: string): boolean {
  const spec = getModelSpec(make, model)
  if (!spec) return false
  return spec.TransmissionType === 'both'
}

// Get fuel type options for a model
export function getFuelTypeOptions(make: string, model: string): FuelType[] {
  const spec = getModelSpec(make, model)
  if (!spec) return ['gas']

  switch (spec.fuelType) {
    case 'gas/hybrid':
      return ['gas', 'hybrid']
    case 'gas/electric':
      return ['gas', 'electric']
    case 'gas/diesel':
      return ['gas', 'diesel']
    default:
      return [spec.fuelType as FuelType]
  }
}

// Get TransmissionType options for a model
export function getTransmissionTypeOptions(make: string, model: string): ('automatic' | 'manual')[] {
  const spec = getModelSpec(make, model)
  if (!spec) return ['automatic']

  if (spec.TransmissionType === 'both') {
    return ['automatic', 'manual']
  }
  return [spec.TransmissionType as 'automatic' | 'manual']
}

// Legacy compatibility - old vehicleDatabase format for any code that depends on it
export const vehicleDatabase: Record<string, string[]> = Object.fromEntries(
  Object.entries(vehicleSpecs).map(([make, models]) => [
    make,
    Object.keys(models)
  ])
)

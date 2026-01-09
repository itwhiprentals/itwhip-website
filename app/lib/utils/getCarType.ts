// app/lib/utils/getCarType.ts
// Utility to determine carType from make/model using vehicle database

import { vehicleSpecs, type CarType } from '@/app/lib/data/vehicles'

/**
 * Get carType from the vehicle database based on make and model
 * Returns the carType if found, or attempts to infer from model name patterns
 *
 * @param make - Vehicle make (e.g., "Toyota", "BMW")
 * @param model - Vehicle model (e.g., "Camry", "3 Series")
 * @returns CarType or null if cannot be determined
 */
export function getCarTypeFromDatabase(
  make: string,
  model: string
): CarType | null {
  if (!make || !model) return null

  // Normalize for lookup (case-insensitive)
  const normalizedMake = Object.keys(vehicleSpecs).find(
    m => m.toLowerCase() === make.toLowerCase()
  )

  if (!normalizedMake) {
    // Try to infer from model patterns
    return inferCarTypeFromModel(model)
  }

  const makeSpecs = vehicleSpecs[normalizedMake]
  if (!makeSpecs) return inferCarTypeFromModel(model)

  // Try exact model match
  const normalizedModel = Object.keys(makeSpecs).find(
    m => m.toLowerCase() === model.toLowerCase()
  )

  if (normalizedModel) {
    return makeSpecs[normalizedModel].carType
  }

  // Try partial model match (e.g., "Camry SE" matches "Camry")
  const partialMatch = Object.keys(makeSpecs).find(
    m => model.toLowerCase().includes(m.toLowerCase()) ||
         m.toLowerCase().includes(model.toLowerCase().split(' ')[0])
  )

  if (partialMatch) {
    return makeSpecs[partialMatch].carType
  }

  // Fallback to inference
  return inferCarTypeFromModel(model)
}

/**
 * Infer carType from model name patterns when not found in database
 */
function inferCarTypeFromModel(model: string): CarType | null {
  const modelLower = model.toLowerCase()

  // SUV/Crossover patterns
  const suvPatterns = [
    'suv', 'crossover', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7',
    'rav4', 'cr-v', 'crv', 'pilot', 'highlander', 'tahoe', 'suburban',
    'expedition', 'explorer', 'escape', 'edge', 'bronco', 'blazer',
    'traverse', 'equinox', 'trailblazer', '4runner', 'sequoia',
    'gx', 'lx', 'rx', 'nx', 'ux', 'q3', 'q5', 'q7', 'q8',
    'gle', 'glc', 'gls', 'glb', 'eqe suv', 'eqs suv',
    'ix', 'x5m', 'x6m', 'x3m', 'x4m', 'wrangler', 'grand cherokee',
    'cherokee', 'compass', 'renegade', 'range rover', 'discovery',
    'defender', 'evoque', 'velar', 'cayenne', 'macan', 'urus',
    'bentayga', 'cullinan', 'purosangue', 'dbx', 'outback',
    'forester', 'crosstrek', 'ascent', 'pathfinder', 'murano',
    'rogue', 'armada', 'terrain', 'acadia', 'yukon', 'escalade',
    'navigator', 'aviator', 'corsair', 'nautilus', 'mkx', 'mdx',
    'rdx', 'qx50', 'qx55', 'qx60', 'qx80', 'telluride', 'sorento',
    'sportage', 'seltos', 'palisade', 'santa fe', 'tucson', 'kona',
    'venue', 'cx-5', 'cx-30', 'cx-50', 'cx-9', 'cx-90'
  ]
  if (suvPatterns.some(p => modelLower.includes(p))) {
    return 'suv'
  }

  // Truck patterns
  const truckPatterns = [
    'truck', 'f-150', 'f150', 'f-250', 'f250', 'f-350', 'f350',
    'silverado', 'sierra', 'ram 1500', 'ram 2500', 'ram 3500',
    'tundra', 'tacoma', 'titan', 'frontier', 'colorado', 'canyon',
    'ridgeline', 'ranger', 'maverick', 'gladiator', 'cybertruck',
    'rivian r1t', 'lightning', 'hummer ev pickup'
  ]
  if (truckPatterns.some(p => modelLower.includes(p))) {
    return 'truck'
  }

  // Sports car patterns
  const sportsPatterns = [
    'sports', 'gt-r', 'gtr', 'corvette', 'camaro', 'mustang',
    'challenger', 'charger', '911', 'cayman', 'boxster', '718',
    'huracan', 'huracán', 'aventador', 'gallardo', '488', '458', 'f8',
    'sf90', '296', 'roma', '812', 'california', '720s', '750s', '570s',
    'artura', 'supra', '86', 'brz', 'z', '370z', '350z', 'nismo',
    'amg gt', 'm3', 'm4', 'm5', 'm8', 'rs3', 'rs4', 'rs5', 'rs6', 'rs7',
    'hellcat', 'demon', 'srt', 'shelby', 'gt500', 'gt350', 'raptor',
    'type r', 'sti', 'wrx'
  ]
  if (sportsPatterns.some(p => modelLower.includes(p))) {
    return 'sports'
  }

  // Convertible patterns
  const convertiblePatterns = [
    'convertible', 'spyder', 'spider', 'roadster', 'cabrio', 'cabriolet',
    'drop top', 'droptop', 'soft top', 'hardtop convertible'
  ]
  if (convertiblePatterns.some(p => modelLower.includes(p))) {
    return 'convertible'
  }

  // Coupe patterns
  const coupePatterns = [
    'coupe', 'coupé', 'gran coupe', 'gran turismo', '2-door', '2 door',
    'rc', 'lc', 'q60', 'tlx type s coupe', 'continental gt', 'wraith'
  ]
  if (coupePatterns.some(p => modelLower.includes(p))) {
    return 'coupe'
  }

  // Minivan patterns
  const minivanPatterns = [
    'minivan', 'sienna', 'odyssey', 'pacifica', 'grand caravan',
    'voyager', 'sedona', 'carnival', 'transit connect'
  ]
  if (minivanPatterns.some(p => modelLower.includes(p))) {
    return 'minivan'
  }

  // Wagon patterns
  const wagonPatterns = [
    'wagon', 'estate', 'avant', 'touring', 'sportwagen', 'alltrack',
    'v60', 'v90', 'outback', 'cross country', 'sport turismo'
  ]
  if (wagonPatterns.some(p => modelLower.includes(p))) {
    return 'wagon'
  }

  // Hatchback patterns
  const hatchbackPatterns = [
    'hatchback', 'hatch', 'gti', 'golf', 'civic hatchback', 'mazda3',
    'corolla hatchback', 'veloster', 'fit', 'yaris', 'accent', 'rio',
    'sonic', 'spark', 'versa note', 'mirage', 'leaf'
  ]
  if (hatchbackPatterns.some(p => modelLower.includes(p))) {
    return 'hatchback'
  }

  // Default to sedan for most regular cars
  // Common sedan model patterns
  const sedanPatterns = [
    'camry', 'accord', 'civic', 'corolla', 'altima', 'maxima', 'sentra',
    'sonata', 'elantra', 'optima', 'k5', 'forte', 'malibu', 'impala',
    'fusion', 'taurus', 'legacy', 'impreza', 'mazda6', 'mazda3 sedan',
    '3 series', '5 series', '7 series', 'a4', 'a6', 'a8', 's4', 's6', 's8',
    'c-class', 'e-class', 's-class', 'cla', 'cls', 'is', 'es', 'ls', 'gs',
    'tlx', 'ilx', 'rlx', 'q50', 'q70', 'g70', 'g80', 'g90',
    'ct4', 'ct5', 'cts', 'ats', 'xts', 's60', 's90', 'model 3', 'model s',
    'taycan', 'panamera', 'flying spur', 'ghost', 'phantom', 'ghibli',
    'quattroporte', 'giulia', 'charger sxt', 'charger gt', '300',
    'passat', 'jetta', 'arteon'
  ]
  if (sedanPatterns.some(p => modelLower.includes(p))) {
    return 'sedan'
  }

  // If nothing matches, return null - let it be classified manually
  return null
}

/**
 * Get carType with fallback to uppercase version
 * (handles SEDAN vs sedan database inconsistency)
 */
export function normalizeCarType(carType: string | null): string {
  if (!carType) return 'SEDAN' // Default to sedan
  return carType.toUpperCase()
}

// app/lib/booking/ai/dl-state-rules.ts
// State-specific driver's license rules for Claude Vision DL verification
// Used to inject state context into the Claude prompt so it understands
// state-specific expiration rules, security features, and license formats.

export interface StateDLRules {
  name: string
  abbreviation: string
  expirationRules: string
  maxValidYears: number
  securityFeatures: string[]
  licenseNumberFormat: string
  knownQuirks: string[]
}

// Primary markets (AZ + common visitors) get full detail
// Other states get basic rules
export const STATE_DL_RULES: Record<string, StateDLRules> = {
  AZ: {
    name: 'Arizona',
    abbreviation: 'AZ',
    expirationRules: 'Standard licenses issued before age 60 are valid until the holder turns 65. After 65, renewed every 5 years in person. Travel ID / REAL ID cards valid for 8 years. Under-65 renewals every 12 years.',
    maxValidYears: 49, // Issued at 16, valid to 65
    securityFeatures: [
      'Polycarbonate card material (100% polycarbonate since 2023)',
      'DynaprintTM technology for fraud prevention',
      'Laser-engraved saguaro cactus that shifts to ponderosa pine',
      'Secure Surface raised tactile feel',
      'Arizona state seal ghost image',
      'Laser-engraved tactile signature',
      'Microprinting along borders',
      'UV fluorescent ink patterns',
      'PDF417 2D barcode on back',
      'Machine-readable zone (MRZ) on back',
    ],
    licenseNumberFormat: '1 letter + 8 digits (e.g., D12345678) or 9 digits',
    knownQuirks: [
      'Expiration date can be 30-49 years in the future — this is COMPLETELY NORMAL for AZ',
      'Under-21 cards are vertical/portrait orientation',
      '21+ cards are horizontal/landscape orientation',
      'REAL ID compliant cards have a gold star in upper right corner',
      'Older cards (pre-2023) use different security features but are still valid',
    ],
  },

  CA: {
    name: 'California',
    abbreviation: 'CA',
    expirationRules: 'Valid for 5 years from issue date, expires on birthday. Seniors 70+ may have shorter renewal periods.',
    maxValidYears: 5,
    securityFeatures: [
      'Holographic overlay with state imagery',
      'Microprinting throughout card',
      'UV-reactive images',
      'Laser-engraved photo',
      'Raised tactile date of birth across photo (3D)',
      'Laser-engraved raised signature',
      'Digital security signature on back barcode (2025+ cards)',
      'PDF417 2D barcode on back',
      'No magnetic strip (removed on 2025+ redesign)',
    ],
    licenseNumberFormat: '1 letter + 7 digits (e.g., A1234567)',
    knownQuirks: [
      'Under-21 cards are vertical/portrait orientation',
      '21+ cards are horizontal/landscape with photo on left',
      'REAL ID cards have gold bear and star',
      '2025 redesign has significantly different look from older cards — both are valid',
      'Header says "California" with blue text for DL, green for ID',
    ],
  },

  TX: {
    name: 'Texas',
    abbreviation: 'TX',
    expirationRules: 'Valid for 8 years for ages 18-84. Ages 85+ valid for 2 years. Expires on birthday.',
    maxValidYears: 8,
    securityFeatures: [
      'Polycarbonate card with laser engraving',
      'Texas state flag ghost image',
      'Tactile features (raised lettering)',
      'UV-reactive state imagery',
      'Microprinting',
      'PDF417 2D barcode on back',
      'Holographic overlay',
    ],
    licenseNumberFormat: '8 digits (e.g., 12345678)',
    knownQuirks: [
      'Under-21 cards are vertical/portrait',
      'Texas star on REAL ID compliant cards',
      'Audit number on front of card',
    ],
  },

  NV: {
    name: 'Nevada',
    abbreviation: 'NV',
    expirationRules: 'Valid for 8 years. Ages 65+ valid for 4 years. Expires on birthday.',
    maxValidYears: 8,
    securityFeatures: [
      'Polycarbonate card construction',
      'Nevada state imagery ghost image',
      'Laser-engraved photo and signature',
      'Holographic overlay',
      'UV-reactive features',
      'Microprinting',
      'PDF417 2D barcode on back',
    ],
    licenseNumberFormat: '10 digits or 12 digits',
    knownQuirks: [
      'Under-21 cards are vertical/portrait',
      'Gold star for REAL ID compliance',
    ],
  },

  CO: {
    name: 'Colorado',
    abbreviation: 'CO',
    expirationRules: 'Valid for 5 years. Expires on birthday. Ages 21-60 can renew online.',
    maxValidYears: 5,
    securityFeatures: [
      'Polycarbonate card with laser engraving',
      'Colorado mountain ghost image',
      'Holographic overlay',
      'UV-reactive features',
      'Microprinting',
      'PDF417 2D barcode on back',
    ],
    licenseNumberFormat: '9 digits (e.g., 12-345-6789) with dashes',
    knownQuirks: [
      'Under-21 cards are vertical/portrait',
      'REAL ID has gold circle with star',
    ],
  },

  NM: {
    name: 'New Mexico',
    abbreviation: 'NM',
    expirationRules: 'Valid for 4 or 8 years depending on type. REAL ID valid for 8 years. Expires on birthday.',
    maxValidYears: 8,
    securityFeatures: [
      'Zia symbol ghost image',
      'Holographic overlay',
      'UV-reactive features',
      'Microprinting',
      'PDF417 2D barcode on back',
    ],
    licenseNumberFormat: '9 digits',
    knownQuirks: [
      'Zia sun symbol is prominent on card',
      'Under-21 cards are vertical/portrait',
    ],
  },

  UT: {
    name: 'Utah',
    abbreviation: 'UT',
    expirationRules: 'Valid for 5 years (8 years with REAL ID). Ages 65+ valid for 5 years. Expires on birthday.',
    maxValidYears: 8,
    securityFeatures: [
      'Beehive ghost image',
      'Holographic overlay',
      'UV-reactive features',
      'Laser-engraved features',
      'Microprinting',
      'PDF417 2D barcode on back',
    ],
    licenseNumberFormat: '4-10 digits',
    knownQuirks: [
      'Under-21 cards are vertical/portrait',
      'Beehive is the state symbol visible on card',
    ],
  },

  FL: {
    name: 'Florida',
    abbreviation: 'FL',
    expirationRules: 'Valid for 8 years. Expires on birthday. Ages 80+ valid for 6 years.',
    maxValidYears: 8,
    securityFeatures: [
      'Polycarbonate card construction',
      'Florida state seal ghost image',
      'Holographic overlay with palm trees',
      'UV-reactive state imagery',
      'Laser-engraved photo',
      'Microprinting',
      'PDF417 2D barcode on back',
    ],
    licenseNumberFormat: '1 letter + 12 digits (e.g., A123-456-78-901)',
    knownQuirks: [
      'Under-21 cards are vertical/portrait',
      'Gold star for REAL ID compliance',
      'License number is algorithmic (based on name and DOB)',
    ],
  },

  NY: {
    name: 'New York',
    abbreviation: 'NY',
    expirationRules: 'Valid for 8 years. Expires on birthday.',
    maxValidYears: 8,
    securityFeatures: [
      'Polycarbonate card with laser engraving',
      'Statue of Liberty ghost image',
      'Holographic overlay',
      'UV-reactive features',
      'Raised tactile features',
      'Microprinting',
      'PDF417 2D barcode on back',
    ],
    licenseNumberFormat: '9 digits (e.g., 123 456 789)',
    knownQuirks: [
      'Under-21 cards are vertical/portrait',
      'Enhanced Driver License (EDL) has different design from standard',
      'REAL ID has gold star with circle',
    ],
  },

  IL: {
    name: 'Illinois',
    abbreviation: 'IL',
    expirationRules: 'Valid for 4 years. Ages 81-86 renew every 2 years. Ages 87+ renew annually.',
    maxValidYears: 4,
    securityFeatures: [
      'Lincoln ghost image',
      'Holographic overlay',
      'UV-reactive features',
      'Laser-engraved features',
      'Microprinting',
      'PDF417 2D barcode on back',
    ],
    licenseNumberFormat: '1 letter + 11 digits (e.g., A123-4567-8901)',
    knownQuirks: [
      'Under-21 cards are vertical/portrait',
      'License number is algorithmic (based on name and DOB)',
      'Short validity period (4 years) is normal for IL',
    ],
  },

  WA: {
    name: 'Washington',
    abbreviation: 'WA',
    expirationRules: 'Valid for 6 years. Expires on birthday.',
    maxValidYears: 6,
    securityFeatures: [
      'Mount Rainier ghost image',
      'Holographic overlay',
      'UV-reactive features',
      'Laser-engraved features',
      'Microprinting',
      'PDF417 2D barcode on back',
    ],
    licenseNumberFormat: '12 characters (alphanumeric, based on name)',
    knownQuirks: [
      'Under-21 cards are vertical/portrait',
      'Enhanced Driver License (EDL) option for border crossing',
      'License number is generated from last name',
    ],
  },

  OR: {
    name: 'Oregon',
    abbreviation: 'OR',
    expirationRules: 'Valid for 8 years. Expires on birthday.',
    maxValidYears: 8,
    securityFeatures: [
      'Oregon state imagery ghost image',
      'Holographic overlay',
      'UV-reactive features',
      'Laser-engraved features',
      'Microprinting',
      'PDF417 2D barcode on back',
    ],
    licenseNumberFormat: '1-9 digits (variable length)',
    knownQuirks: [
      'Under-21 cards are vertical/portrait',
      'REAL ID has gold star',
    ],
  },
}

// Default rules for states not in our detailed list
export const DEFAULT_DL_RULES: Omit<StateDLRules, 'name' | 'abbreviation'> = {
  expirationRules: 'Typically valid for 4-8 years. Check state-specific rules.',
  maxValidYears: 10,
  securityFeatures: [
    'Holographic overlay',
    'UV-reactive features',
    'Microprinting',
    'Ghost image',
    'PDF417 2D barcode on back',
  ],
  licenseNumberFormat: 'Varies by state',
  knownQuirks: [
    'Under-21 cards are typically vertical/portrait orientation',
    'REAL ID compliant cards have a gold star or marking',
  ],
}

/**
 * Get DL rules for a state. Falls back to defaults for unlisted states.
 */
export function getStateDLRules(stateCode: string): StateDLRules {
  const upper = stateCode?.toUpperCase().trim()
  if (upper && STATE_DL_RULES[upper]) {
    return STATE_DL_RULES[upper]
  }
  return {
    name: upper || 'Unknown',
    abbreviation: upper || '??',
    ...DEFAULT_DL_RULES,
  }
}

/**
 * Build prompt text for state-specific DL rules.
 * This gets injected into the Claude system prompt.
 */
export function buildStateRulesPrompt(stateCode?: string): string {
  if (!stateCode) {
    return `
STATE-SPECIFIC RULES:
You do not know the issuing state in advance. After identifying the state from the card:
- Look up whether the expiration date is normal for that state
- Arizona (AZ) licenses are valid until age 65 — expiration dates 30-50 years in the future are COMPLETELY NORMAL
- Most other states issue licenses valid for 4-8 years
- Do NOT flag a far-future expiration as a red flag if it matches the state's rules
`
  }

  const rules = getStateDLRules(stateCode)
  return `
STATE-SPECIFIC RULES FOR ${rules.name.toUpperCase()} (${rules.abbreviation}):
- Expiration: ${rules.expirationRules}
- Maximum valid period: Up to ${rules.maxValidYears} years from issue is NORMAL
- License number format: ${rules.licenseNumberFormat}
- Known security features to look for: ${rules.securityFeatures.join(', ')}
- Important quirks: ${rules.knownQuirks.join('. ')}

CRITICAL: If this is an ${rules.abbreviation} license, apply these rules when evaluating expiration dates and security features. Do NOT flag state-normal characteristics as red flags.
`
}

/**
 * Build a comprehensive rules prompt covering all states (for system prompt caching).
 */
export function buildAllStateRulesPrompt(): string {
  const lines: string[] = ['STATE DRIVER\'S LICENSE REFERENCE GUIDE:']

  for (const [code, rules] of Object.entries(STATE_DL_RULES)) {
    lines.push(`\n${rules.name} (${code}):`)
    lines.push(`  Expiration: ${rules.expirationRules}`)
    lines.push(`  Max valid years: ${rules.maxValidYears}`)
    lines.push(`  License # format: ${rules.licenseNumberFormat}`)
    lines.push(`  Quirks: ${rules.knownQuirks.join('; ')}`)
  }

  lines.push('\nOther states: Typically 4-8 year validity. Under-21 cards are vertical. REAL ID cards have gold star.')

  return lines.join('\n')
}

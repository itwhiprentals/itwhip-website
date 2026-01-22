// app/lib/agreements/validation-rules.ts
// Extensible keyword configuration for rule-based PDF validation
// Version: 1.0.0

export const RULES_VERSION = '1.0.0'

/**
 * Validation rules for determining if a PDF is a rental agreement.
 *
 * This configuration can be extended over time:
 * - Add new keywords to improve detection
 * - Adjust point values to fine-tune scoring
 * - Add new document type categories
 *
 * Future: Store in database for admin-editable configuration
 */
export const VALIDATION_RULES = {
  // Keywords that indicate a RENTAL AGREEMENT (positive signals)
  rentalKeywords: {
    // High-value keywords (15 points each)
    // These are strong indicators of a rental agreement
    high: [
      'rental agreement',
      'lease agreement',
      'vehicle rental',
      'car rental',
      'automobile lease',
      'rental contract',
      'vehicle lease agreement',
      'car lease agreement',
      'rental terms and conditions',
      'vehicle rental contract'
    ],

    // Medium-value keywords (8 points each)
    // Common rental terminology
    medium: [
      'renter',
      'lessee',
      'lessor',
      'daily rate',
      'rental period',
      'rental term',
      'vehicle condition',
      'return policy',
      'mileage limit',
      'mileage allowance',
      'excess mileage',
      'fuel policy',
      'rental rate',
      'rental fee',
      'security deposit',
      'damage waiver',
      'collision damage',
      'liability coverage',
      'authorized driver',
      'rental duration',
      'pick-up date',
      'return date',
      'vehicle description'
    ],

    // Low-value keywords (3 points each)
    // Generic terms that might appear in rental agreements
    low: [
      'signature',
      'signed',
      'dated',
      'witness',
      'pickup',
      'drop-off',
      'insurance',
      'deposit',
      'agreement',
      'contract',
      'terms',
      'conditions',
      'hereby',
      'acknowledge',
      'parties',
      'effective date',
      'termination',
      'liability'
    ]
  },

  // Keywords that indicate NOT a rental agreement (negative signals)
  blocklist: {
    // Critical keywords - instant rejection (score = 0)
    // These definitively indicate the document is not a VEHICLE rental agreement
    critical: [
      // Tax/IRS documents
      'internal revenue service',
      'irs',
      'form w-9',
      'form w-2',
      'form w-4',
      'form 1099',
      'form 1040',
      'cp575',
      'cp2000',
      'employer identification number',
      'ein:',
      'tax return',
      'social security number',
      'ssn:',
      'schedule c',
      'schedule se',
      'income tax',
      'federal tax',
      'state tax',
      'tax refund',
      'withholding',
      'department of the treasury',
      // Residential/Housing leases (NOT vehicle rentals)
      'residential lease',
      'residential lease agreement',
      'landlord',
      'tenant',
      'dwelling',
      'apartment lease',
      'house lease',
      'premises is to be occupied',
      'residential dwelling',
      'lead-based paint',
      'lead paint disclosure',
      'habitability',
      'eviction',
      'month-to-month lease',
      'subletting',
      'right of entry'
    ],

    // High negative keywords (-50 points each)
    // Strong indicators this is a different document type
    high: [
      // Financial documents
      'bank statement',
      'account balance',
      'checking account',
      'savings account',
      'credit card statement',
      'loan application',
      'mortgage application',
      'credit report',
      'fico score',
      'credit score',
      'account summary',
      'minimum payment due',
      'apr',
      'annual percentage rate',
      // Housing lease indicators (not as definitive but strong)
      'rental property',
      'property management',
      'occupant(s)',
      'bedroom(s)',
      'bathroom(s)',
      'furnishings',
      'appliances provided',
      'utilities',
      'smoking policy',
      'pets allowed',
      'waterbeds',
      'noise ordinance',
      'security deposit shall be returned',
      'move-in inspection',
      'move-in checklist'
    ],

    // Medium negative keywords (-20 points each)
    // Indicators of other document types
    medium: [
      'insurance card',
      'insurance id card',
      'vehicle registration',
      'certificate of title',
      'title transfer',
      'bill of sale',
      'purchase agreement',
      'sales contract',
      'proof of insurance',
      'policy number:',
      'claim number:',
      'registration certificate',
      'medical records',
      'utility bill',
      'phone bill'
    ]
  },

  // Document structure requirements
  structure: {
    // Minimum text length for a valid rental agreement
    minLength: 500,

    // Maximum text length (sanity check)
    maxLength: 500000,

    // Whether to check for date patterns
    requiresDatePattern: true
  },

  // Scoring thresholds
  scoring: {
    // Starting score (neutral)
    baseScore: 50,

    // Minimum score to be considered valid
    minValidScore: 40,

    // Score threshold for high confidence
    highConfidenceScore: 60,

    // Maximum possible score
    maxScore: 100,

    // Minimum possible score
    minScore: 0
  }
}

// Document type strings for consistency
export type DocumentType = 'rental_agreement' | 'lease_agreement' | 'unknown' | 'not_agreement'

/**
 * Helper to check if a keyword exists in text
 * Case-insensitive matching with WORD BOUNDARIES
 * This prevents "irs" from matching inside "first", "pairs", etc.
 */
export function textContainsKeyword(text: string, keyword: string): boolean {
  // Escape special regex characters in the keyword
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Use word boundaries to match whole words only
  const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i')
  return regex.test(text)
}

/**
 * Count how many keywords from a list are found in text
 */
export function countKeywordMatches(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase()
  return keywords.filter(keyword => lowerText.includes(keyword.toLowerCase())).length
}

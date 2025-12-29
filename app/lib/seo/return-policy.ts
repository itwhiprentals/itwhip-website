// app/lib/seo/return-policy.ts
// Merchant Return Policy for Google Search Console compliance
// Aligned with ItWhip's 72-hour cancellation policy

/**
 * Standard Merchant Return Policy for all Product schema.org structured data
 *
 * Based on ItWhip Cancellation Policy:
 * - 72+ hours before pickup: 100% refund
 * - 24-72 hours: 75% refund
 * - 12-24 hours: 50% refund
 * - <12 hours: No refund
 */
export const MERCHANT_RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'US',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 3, // 72 hours = 3 days for full refund
  returnMethod: 'https://schema.org/ReturnAtKiosk', // Car returned to host location
  returnFees: 'https://schema.org/FreeReturn', // No penalty within cancellation window
  refundType: 'https://schema.org/FullRefund' // 100% refund at 72+ hours
}

// app/lib/seo/return-policy.ts
// Schema.org structured data constants for Google Search Console compliance
// Aligned with ItWhip's policies and Arizona operations

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

/**
 * Shipping Details for Product schema.org structured data
 * For car rentals, "shipping" = pickup/delivery options
 *
 * - Free pickup at host location (default)
 * - Available in Arizona (AZ)
 * - 0-1 day handling (car preparation)
 * - 0 day transit (immediate pickup at location)
 */
export const SHIPPING_DETAILS = {
  '@type': 'OfferShippingDetails',
  shippingRate: {
    '@type': 'MonetaryAmount',
    value: '0',
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
      maxValue: 1,
      unitCode: 'd' // UN/CEFACT Common Code for "day"
    },
    transitTime: {
      '@type': 'QuantitativeValue',
      minValue: 0,
      maxValue: 0,
      unitCode: 'd' // UN/CEFACT Common Code for "day"
    }
  }
}

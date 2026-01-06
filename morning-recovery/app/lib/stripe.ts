// app/lib/stripe.ts
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export const STRIPE_CONNECT_ACCOUNT_TYPE = 'express' as const
export const STRIPE_CURRENCY = 'usd' as const
export const MINIMUM_PAYOUT_AMOUNT = 50.00 // $50 minimum

// Helper to format Stripe amounts (cents to dollars)
export function formatStripeCurrency(amountInCents: number): string {
  return (amountInCents / 100).toFixed(2)
}

// Helper to convert dollars to Stripe cents
export function toStripeCents(amountInDollars: number): number {
  return Math.round(amountInDollars * 100)
}
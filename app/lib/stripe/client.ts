// app/lib/stripe/client.ts
import Stripe from 'stripe'

// Get the key from environment variable
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY!

if (!STRIPE_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

// Initialize Stripe with your secret key
export const stripe = new Stripe(
  STRIPE_KEY,
  {
    apiVersion: '2025-08-27.basil' as any,
    typescript: true,
  }
)

// Helper to determine if we're in test mode
export const isTestMode = () => {
  return STRIPE_KEY.startsWith('sk_test_')
}

// Format amount for Stripe (converts dollars to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100)
}

// Format amount from Stripe (converts cents to dollars)  
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100
}

console.log('Stripe initialized with key starting:', STRIPE_KEY.substring(0, 20) + '...')
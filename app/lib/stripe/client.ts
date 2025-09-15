// app/lib/stripe/client.ts
import Stripe from 'stripe'

// Temporarily hardcode the key to bypass environment variable issues
const STRIPE_KEY = 'sk_test_51O22e7IZPP7mao58ZBwgxNyQTKFW8uWVNb4he61hh2huTRp2y8enDK0EtPvFmjihJqw1vPaDOiex0UgRbykP4YhW0058b6R1jh'

// Initialize Stripe with your secret key
export const stripe = new Stripe(
  STRIPE_KEY,
  {
    apiVersion: '2024-11-20.acacia',
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

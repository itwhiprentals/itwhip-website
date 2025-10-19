// app/api/host/banking/add-card/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Get host from session/auth - update this to match your auth system
    const hostEmail = request.headers.get('x-host-email')
    
    if (!hostEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - No host email found' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { token, cardholderName } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Card token is required' },
        { status: 400 }
      )
    }

    if (!cardholderName) {
      return NextResponse.json(
        { error: 'Cardholder name is required' },
        { status: 400 }
      )
    }

    // Get host from database
    const host = await prisma.rentalHost.findUnique({
      where: { email: hostEmail },
      select: {
        id: true,
        email: true,
        stripeConnectAccountId: true,
        stripeAccountStatus: true,
        stripeChargesEnabled: true,
        stripePayoutsEnabled: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    const stripeAccountId = host.stripeConnectAccountId
    
    if (!stripeAccountId) {
      return NextResponse.json(
        { error: 'Please connect your Stripe account first before adding cards' },
        { status: 400 }
      )
    }

    // Check if Stripe Connect account is fully onboarded
    try {
      const account = await stripe.accounts.retrieve(stripeAccountId)
      
      if (!account.charges_enabled || !account.payouts_enabled) {
        // Account exists but onboarding not complete - generate onboarding link
        const onboardingLink = await stripe.accountLinks.create({
          account: stripeAccountId,
          refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/host/profile?tab=banking&refresh=true`,
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/host/profile?tab=banking&onboarding_complete=true`,
          type: 'account_onboarding' // Use onboarding type since account isn't fully set up
        })

        return NextResponse.json(
          { 
            error: 'Please complete your Stripe Connect setup first',
            requiresOnboarding: true,
            onboardingUrl: onboardingLink.url,
            message: 'Your Stripe account needs to be fully activated before you can add payment methods.'
          },
          { status: 400 }
        )
      }
    } catch (stripeError: any) {
      console.error('Error checking Stripe account:', stripeError)
      return NextResponse.json(
        { error: 'Unable to verify Stripe account status' },
        { status: 500 }
      )
    }

    // Retrieve the token to get card details
    const retrievedToken = await stripe.tokens.retrieve(token)
    
    // Check if it's a debit card
    if (retrievedToken.card?.funding !== 'debit') {
      return NextResponse.json(
        { error: 'Only debit cards are accepted for instant payouts. This appears to be a credit card.' },
        { status: 400 }
      )
    }

    // Check if this card is already saved in our database
    const existingCard = await prisma.paymentMethod.findFirst({
      where: {
        hostId: host.id,
        type: 'card',
        last4: retrievedToken.card?.last4 || '',
        brand: retrievedToken.card?.brand || ''
      }
    })

    if (existingCard) {
      return NextResponse.json(
        { error: 'This card is already added to your account.' },
        { status: 400 }
      )
    }

    // Try to add the card as an external account to the Connect account
    try {
      // For instant payouts, add the debit card as an external account
      const card = await stripe.accounts.createExternalAccount(
        stripeAccountId,
        {
          external_account: token,
          default_for_currency: true
        }
      )

      // Save card info to our database
      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          hostId: host.id,
          stripeMethodId: card.id,
          type: 'card',
          brand: retrievedToken.card?.brand || 'Unknown',
          last4: retrievedToken.card?.last4 || '0000',
          expiryMonth: retrievedToken.card?.exp_month || 0,
          expiryYear: retrievedToken.card?.exp_year || 0,
          holderName: cardholderName,
          isDefault: false,
          status: 'active',
          isVerified: true,
          verifiedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        method: {
          id: paymentMethod.id,
          type: 'card',
          brand: paymentMethod.brand,
          last4: paymentMethod.last4,
          expMonth: paymentMethod.expiryMonth,
          expYear: paymentMethod.expiryYear,
          status: 'active',
          isDefault: paymentMethod.isDefault
        },
        message: 'Debit card added successfully for instant payouts.'
      })

    } catch (stripeAddCardError: any) {
      console.error('Error adding card to Stripe:', stripeAddCardError)
      
      // If we can't add the card programmatically, save it and provide manual onboarding
      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          hostId: host.id,
          stripeMethodId: `card_${Date.now()}`,
          type: 'card',
          brand: retrievedToken.card?.brand || 'Unknown',
          last4: retrievedToken.card?.last4 || '0000',
          expiryMonth: retrievedToken.card?.exp_month || 0,
          expiryYear: retrievedToken.card?.exp_year || 0,
          holderName: cardholderName,
          isDefault: false,
          status: 'pending'
        }
      })

      // Generate account update link for manual card addition
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/host/profile?tab=banking&refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/host/profile?tab=banking&card_added=true`,
        type: 'account_update' // Now safe to use since account is onboarded
      })

      return NextResponse.json({
        success: true,
        requiresOnboarding: true,
        onboardingUrl: accountLink.url,
        method: {
          id: paymentMethod.id,
          type: 'card',
          brand: paymentMethod.brand,
          last4: paymentMethod.last4,
          expMonth: paymentMethod.expiryMonth,
          expYear: paymentMethod.expiryYear,
          status: 'pending',
          isDefault: paymentMethod.isDefault
        },
        message: 'Card information saved. Please complete setup in Stripe dashboard to enable instant payouts.'
      })
    }

  } catch (error: any) {
    console.error('Error adding card:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to add card',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
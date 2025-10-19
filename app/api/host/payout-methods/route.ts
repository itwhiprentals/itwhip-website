// app/api/host/payout-methods/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'
import { PAYOUT_CONFIG } from '@/app/fleet/financial-constants'

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!userId && !hostId) {
    return null
  }
  
  const host = await prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId }
  })
  
  return host
}

// GET - Fetch host's payout methods
export async function GET(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get saved payout methods from host profile
    const payoutMethods = []
    
    // Check if host has bank account on file
    if (host.bankAccountLast4) {
      payoutMethods.push({
        id: 'bank_primary',
        type: 'bank' as const,
        name: host.bankAccountName || 'Bank Account',
        last4: host.bankAccountLast4,
        isDefault: host.defaultPayoutMethod === 'bank_account',
        bankName: host.bankName || 'Bank',
        accountType: host.bankAccountType || 'checking'
      })
    }
    
    // Check if host has debit card on file (for instant payouts)
    if (host.debitCardLast4) {
      payoutMethods.push({
        id: 'card_primary',
        type: 'debit' as const,
        name: 'Debit Card',
        last4: host.debitCardLast4,
        isDefault: host.defaultPayoutMethod === 'debit_card',
        cardBrand: host.cardBrand || 'Visa',
        expiryMonth: host.cardExpiryMonth,
        expiryYear: host.cardExpiryYear
      })
    }
    
    // Get Stripe connected account info if exists
    if (host.stripeAccountId) {
      try {
        // In production, you'd fetch from Stripe API
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
        // const account = await stripe.accounts.retrieve(host.stripeAccountId)
        
        // For now, we'll use stored data
        payoutMethods.push({
          id: 'stripe_connect',
          type: 'stripe' as const,
          name: 'Stripe Connected Account',
          last4: host.stripeAccountLast4 || '****',
          isDefault: host.defaultPayoutMethod === 'stripe',
          status: host.stripeAccountStatus || 'active'
        })
      } catch (error) {
        console.error('Failed to fetch Stripe account:', error)
      }
    }
    
    // Get payout schedule preferences
    const payoutSchedule = {
      frequency: host.payoutFrequency || 'standard', // standard, instant, weekly
      minimumAmount: host.customMinimumPayout || PAYOUT_CONFIG.MINIMUM_PAYOUT_AMOUNT,
      instantPayoutEnabled: host.instantPayoutEnabled || false,
      instantPayoutFee: PAYOUT_CONFIG.INSTANT_PAYOUT_FEE
    }
    
    return NextResponse.json({
      methods: payoutMethods,
      defaultMethodId: payoutMethods.find(m => m.isDefault)?.id || null,
      payoutSchedule,
      supportedMethods: PAYOUT_CONFIG.SUPPORTED_METHODS,
      processingFees: {
        percent: PAYOUT_CONFIG.PROCESSING_FEE_PERCENT,
        fixed: PAYOUT_CONFIG.PROCESSING_FEE_FIXED
      }
    })
    
  } catch (error) {
    console.error('Payout methods fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payout methods' },
      { status: 500 }
    )
  }
}

// POST - Add new payout method
export async function POST(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { type, details, setAsDefault } = body
    
    // Validate payout method type
    if (!PAYOUT_CONFIG.SUPPORTED_METHODS.includes(type)) {
      return NextResponse.json(
        { error: 'Unsupported payout method type' },
        { status: 400 }
      )
    }
    
    // Update host based on method type
    const updateData: any = {}
    
    if (type === 'bank_account') {
      // Validate required fields
      if (!details.accountNumber || !details.routingNumber) {
        return NextResponse.json(
          { error: 'Account number and routing number are required' },
          { status: 400 }
        )
      }
      
      // In production, you'd verify with Stripe or your payment processor
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
      // const bankAccount = await stripe.tokens.create({
      //   bank_account: {
      //     country: 'US',
      //     currency: 'usd',
      //     account_holder_name: details.accountHolderName,
      //     account_holder_type: 'individual',
      //     routing_number: details.routingNumber,
      //     account_number: details.accountNumber
      //   }
      // })
      
      updateData.bankAccountLast4 = details.accountNumber.slice(-4)
      updateData.bankAccountName = details.accountHolderName || host.name
      updateData.bankName = details.bankName
      updateData.bankAccountType = details.accountType || 'checking'
      updateData.bankRoutingNumber = details.routingNumber // Should be encrypted in production
      
      if (setAsDefault) {
        updateData.defaultPayoutMethod = 'bank_account'
      }
      
    } else if (type === 'debit_card') {
      // Validate required fields
      if (!details.cardNumber || !details.expiryMonth || !details.expiryYear || !details.cvc) {
        return NextResponse.json(
          { error: 'Card details are required' },
          { status: 400 }
        )
      }
      
      // Validate card is debit (in production, use payment processor API)
      // For now, basic validation
      if (details.cardNumber.startsWith('4')) {
        updateData.cardBrand = 'Visa'
      } else if (details.cardNumber.startsWith('5')) {
        updateData.cardBrand = 'Mastercard'
      } else {
        return NextResponse.json(
          { error: 'Only Visa and Mastercard debit cards are supported' },
          { status: 400 }
        )
      }
      
      updateData.debitCardLast4 = details.cardNumber.slice(-4)
      updateData.cardExpiryMonth = details.expiryMonth
      updateData.cardExpiryYear = details.expiryYear
      // In production, tokenize card with Stripe instead of storing
      
      if (setAsDefault) {
        updateData.defaultPayoutMethod = 'debit_card'
      }
      
      // Enable instant payouts for debit cards
      updateData.instantPayoutEnabled = true
      
    } else if (type === 'stripe') {
      // Stripe Connect account setup (requires OAuth flow in production)
      return NextResponse.json(
        { error: 'Stripe Connect setup requires OAuth flow' },
        { status: 400 }
      )
    }
    
    // Update host with new payout method
    const updatedHost = await prisma.rentalHost.update({
      where: { id: host.id },
      data: updateData
    })
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: host.userId,
        action: 'payout_method_added',
        entityType: 'payout_method',
        entityId: host.id,
        metadata: {
          methodType: type,
          isDefault: setAsDefault || false
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Payout method added successfully',
      defaultMethod: updatedHost.defaultPayoutMethod
    })
    
  } catch (error) {
    console.error('Payout method creation error:', error)
    return NextResponse.json(
      { error: 'Failed to add payout method' },
      { status: 500 }
    )
  }
}

// PUT - Update payout method or preferences
export async function PUT(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { methodId, setAsDefault, payoutSchedule } = body
    
    const updateData: any = {}
    
    // Update default payout method
    if (methodId && setAsDefault) {
      if (methodId === 'bank_primary' && host.bankAccountLast4) {
        updateData.defaultPayoutMethod = 'bank_account'
      } else if (methodId === 'card_primary' && host.debitCardLast4) {
        updateData.defaultPayoutMethod = 'debit_card'
      } else if (methodId === 'stripe_connect' && host.stripeAccountId) {
        updateData.defaultPayoutMethod = 'stripe'
      } else {
        return NextResponse.json(
          { error: 'Invalid payout method' },
          { status: 400 }
        )
      }
    }
    
    // Update payout schedule preferences
    if (payoutSchedule) {
      if (payoutSchedule.frequency) {
        updateData.payoutFrequency = payoutSchedule.frequency
      }
      if (payoutSchedule.minimumAmount !== undefined) {
        // Validate minimum is at least platform minimum
        if (payoutSchedule.minimumAmount < PAYOUT_CONFIG.MINIMUM_PAYOUT_AMOUNT) {
          return NextResponse.json(
            { error: `Minimum payout must be at least $${PAYOUT_CONFIG.MINIMUM_PAYOUT_AMOUNT}` },
            { status: 400 }
          )
        }
        updateData.customMinimumPayout = payoutSchedule.minimumAmount
      }
      if (payoutSchedule.instantPayoutEnabled !== undefined) {
        // Can only enable instant payouts if they have a debit card
        if (payoutSchedule.instantPayoutEnabled && !host.debitCardLast4) {
          return NextResponse.json(
            { error: 'Debit card required for instant payouts' },
            { status: 400 }
          )
        }
        updateData.instantPayoutEnabled = payoutSchedule.instantPayoutEnabled
      }
    }
    
    // Update host
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: updateData
    })
    
    return NextResponse.json({
      success: true,
      message: 'Payout preferences updated successfully'
    })
    
  } catch (error) {
    console.error('Payout method update error:', error)
    return NextResponse.json(
      { error: 'Failed to update payout preferences' },
      { status: 500 }
    )
  }
}

// DELETE - Remove payout method
export async function DELETE(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const methodId = searchParams.get('methodId')
    
    if (!methodId) {
      return NextResponse.json(
        { error: 'Method ID is required' },
        { status: 400 }
      )
    }
    
    const updateData: any = {}
    
    // Remove the specified method
    if (methodId === 'bank_primary') {
      updateData.bankAccountLast4 = null
      updateData.bankAccountName = null
      updateData.bankName = null
      updateData.bankAccountType = null
      updateData.bankRoutingNumber = null
      
      // If this was default, clear it
      if (host.defaultPayoutMethod === 'bank_account') {
        updateData.defaultPayoutMethod = null
      }
      
    } else if (methodId === 'card_primary') {
      updateData.debitCardLast4 = null
      updateData.cardBrand = null
      updateData.cardExpiryMonth = null
      updateData.cardExpiryYear = null
      
      // If this was default, clear it
      if (host.defaultPayoutMethod === 'debit_card') {
        updateData.defaultPayoutMethod = null
      }
      
      // Disable instant payouts if no other card
      updateData.instantPayoutEnabled = false
      
    } else {
      return NextResponse.json(
        { error: 'Invalid method ID' },
        { status: 400 }
      )
    }
    
    // Check if host will have any payout methods left
    const willHaveMethod = 
      (methodId !== 'bank_primary' && host.bankAccountLast4) ||
      (methodId !== 'card_primary' && host.debitCardLast4) ||
      host.stripeAccountId
    
    if (!willHaveMethod) {
      return NextResponse.json(
        { error: 'You must maintain at least one payout method' },
        { status: 400 }
      )
    }
    
    // Update host
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: updateData
    })
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: host.userId,
        action: 'payout_method_removed',
        entityType: 'payout_method',
        entityId: host.id,
        metadata: {
          methodId: methodId
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Payout method removed successfully'
    })
    
  } catch (error) {
    console.error('Payout method deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to remove payout method' },
      { status: 500 }
    )
  }
}
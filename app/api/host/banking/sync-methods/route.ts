// app/api/host/banking/sync-methods/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

// GET - Sync payment methods from Stripe to database
export async function GET(request: NextRequest) {
  try {
    // Get host info from middleware headers
    const hostId = request.headers.get('x-host-id')
    const hostEmail = request.headers.get('x-host-email')
    
    if (!hostId || !hostEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - No host session found' },
        { status: 401 }
      )
    }

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        email: true,
        stripeConnectAccountId: true,
        stripeCustomerId: true,
        defaultPaymentMethodOnFile: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    if (!host.stripeConnectAccountId) {
      return NextResponse.json(
        { error: 'No Stripe Connect account found' },
        { status: 400 }
      )
    }

    let syncedMethods: any[] = []
    let defaultMethodId: string | null = host.defaultPaymentMethodOnFile

    // STEP 1: Fetch external accounts from Connect account (banks)
    try {
      const account = await stripe.accounts.retrieve(host.stripeConnectAccountId)
      
      if (account.external_accounts) {
        const externalAccounts = account.external_accounts.data

        for (const method of externalAccounts) {
          if (method.object === 'bank_account') {
            // Check if already exists in database
            const existing = await prisma.paymentMethod.findUnique({
              where: { stripeMethodId: method.id }
            })

            if (!existing) {
              // Create new payment method record
              await prisma.paymentMethod.create({
                data: {
                  hostId: host.id,
                  type: 'bank_account',
                  stripeMethodId: method.id,
                  last4: method.last4,
                  brand: method.bank_name || 'Bank',
                  accountType: method.account_holder_type || 'individual',
                  status: method.status || 'active',
                  isDefault: !defaultMethodId, // First one becomes default
                  isVerified: method.status === 'verified'
                }
              })

              // Set as default if no default exists
              if (!defaultMethodId) {
                defaultMethodId = method.id
              }
            }

            syncedMethods.push({
              id: method.id,
              type: 'bank_account',
              last4: method.last4,
              bankName: method.bank_name,
              status: method.status
            })
          } else if (method.object === 'card') {
            // Handle debit cards attached to Connect
            const existing = await prisma.paymentMethod.findUnique({
              where: { stripeMethodId: method.id }
            })

            if (!existing) {
              await prisma.paymentMethod.create({
                data: {
                  hostId: host.id,
                  type: 'debit_card',
                  stripeMethodId: method.id,
                  last4: method.last4,
                  brand: method.brand || 'Card',
                  expiryMonth: method.exp_month,
                  expiryYear: method.exp_year,
                  status: 'active',
                  isDefault: !defaultMethodId,
                  isVerified: true
                }
              })

              if (!defaultMethodId) {
                defaultMethodId = method.id
              }
            }

            syncedMethods.push({
              id: method.id,
              type: 'debit_card',
              last4: method.last4,
              brand: method.brand,
              expMonth: method.exp_month,
              expYear: method.exp_year
            })
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Connect external accounts:', error)
    }

    // STEP 2: Fetch payment methods from Customer account (if exists)
    if (host.stripeCustomerId) {
      try {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: host.stripeCustomerId,
          type: 'card'
        })

        for (const method of paymentMethods.data) {
          const existing = await prisma.paymentMethod.findUnique({
            where: { stripeMethodId: method.id }
          })

          if (!existing) {
            await prisma.paymentMethod.create({
              data: {
                hostId: host.id,
                type: 'card',
                stripeMethodId: method.id,
                last4: method.card!.last4,
                brand: method.card!.brand,
                expiryMonth: method.card!.exp_month,
                expiryYear: method.card!.exp_year,
                status: 'active',
                isDefault: !defaultMethodId,
                isVerified: true
              }
            })

            if (!defaultMethodId) {
              defaultMethodId = method.id
            }
          }

          syncedMethods.push({
            id: method.id,
            type: 'card',
            last4: method.card!.last4,
            brand: method.card!.brand,
            expMonth: method.card!.exp_month,
            expYear: method.card!.exp_year
          })
        }
      } catch (error) {
        console.error('Error fetching Customer payment methods:', error)
      }
    }

    // STEP 3: Update host record with display fields
    const firstBank = syncedMethods.find(m => m.type === 'bank_account')
    const firstCard = syncedMethods.find(m => m.type === 'debit_card' || m.type === 'card')

    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        // Bank info
        bankAccountLast4: firstBank?.last4 || null,
        bankName: firstBank?.bankName || null,
        bankAccountType: firstBank?.accountType || null,
        bankVerified: firstBank?.status === 'verified',
        
        // Card info
        debitCardLast4: firstCard?.last4 || null,
        debitCardBrand: firstCard?.brand || null,
        debitCardExpMonth: firstCard?.expMonth || null,
        debitCardExpYear: firstCard?.expYear || null,
        
        // Default method
        defaultPaymentMethodOnFile: defaultMethodId || host.defaultPaymentMethodOnFile,
        
        // Enable payouts if we have methods
        payoutsEnabled: syncedMethods.length > 0 ? true : host.stripeConnectAccountId ? false : false
      }
    })

    return NextResponse.json({
      success: true,
      syncedCount: syncedMethods.length,
      methods: syncedMethods,
      defaultMethodId,
      message: `Synced ${syncedMethods.length} payment method(s)`
    })

  } catch (error: any) {
    console.error('Error syncing payment methods:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync payment methods',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
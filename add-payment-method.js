require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function addTestPaymentMethod() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Using Stripe key:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...');
    
    const pm = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: 'tok_visa' }
    });
    console.log('✅ Created payment method:', pm.id);
    
    await stripe.paymentMethods.attach(pm.id, {
      customer: 'cus_Syj0V2Wff4G43Y'
    });
    console.log('✅ Attached to customer');
    
    const updated = await prisma.rentalBooking.update({
      where: { id: 'cmf4ufwtt000bdoxmvacjc0ir' },
      data: { stripePaymentMethodId: pm.id }
    });
    
    console.log('✅ Payment method added to booking');
    console.log('Payment Method ID:', pm.id);
    console.log('\nNow try approving in admin panel - payment should work!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

addTestPaymentMethod();

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkPayment() {
  try {
    const pi = await stripe.paymentIntents.retrieve('pi_3S3TnsIZPP7mao580dcR4Akz');
    console.log('Payment Intent Status:', pi.status);
    console.log('Amount: $', pi.amount / 100);
    console.log('Payment Method:', pi.payment_method);
    console.log('Charges:', pi.charges.data.length);
    if (pi.last_payment_error) {
      console.log('Error:', pi.last_payment_error.message);
    }
    
    // Try to confirm and capture if needed
    if (pi.status === 'requires_payment_method') {
      console.log('\nPayment needs payment method attached');
    } else if (pi.status === 'requires_confirmation') {
      console.log('\nPayment needs confirmation');
    } else if (pi.status === 'succeeded') {
      console.log('\nPayment already succeeded!');
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkPayment();

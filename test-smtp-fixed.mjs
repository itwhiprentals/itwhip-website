import { createTransport } from 'nodemailer'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

console.log('Testing with:', {
  host: 'smtp.office365.com',
  user: process.env.SMTP_USER,
  hasPassword: !!process.env.SMTP_PASS
})

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('SMTP credentials not found in .env.local')
  process.exit(1)
}

const transporter = createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
})

try {
  await transporter.verify()
  console.log('Connection successful')
  
  const result = await transporter.sendMail({
    from: 'ItWhip Rentals <info@itwhip.com>',
    to: 'hxris08@gmail.com',
    subject: 'Test Email from ItWhip',
    text: 'Your email system is working.',
    html: '<h2>Test Successful</h2><p>Your ItWhip email system is configured.</p>'
  })
  
  console.log('Email sent:', result.messageId)
  console.log('Response:', result.response)
} catch (error) {
  console.error('Failed:', error.message)
  
  if (error.response) {
    console.error('Server response:', error.response)
  }
  
  if (error.message.includes('auth')) {
    console.log('\nPossible fixes:')
    console.log('1. Check password is correct')
    console.log('2. Enable SMTP AUTH in Office 365 admin')
    console.log('3. Disable security defaults if enabled')
  }
}

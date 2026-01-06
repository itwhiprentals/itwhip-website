import nodemailer from 'nodemailer'

console.log('Testing with:', {
  host: 'smtp.office365.com',
  user: process.env.SMTP_USER,
  hasPassword: !!process.env.SMTP_PASS
})

const transporter = nodemailer.createTransporter({
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
    from: process.env.EMAIL_FROM,
    to: 'hxris08@gmail.com',
    subject: 'Test Email from ItWhip Rental System',
    text: 'If you receive this, your email system is working.',
    html: '<h2>Test Email</h2><p>Your ItWhip rental email system is configured correctly.</p>'
  })
  
  console.log('Email sent successfully:', result.messageId)
  console.log('Response:', result.response)
} catch (error) {
  console.error('Failed:', error.message)
  
  if (error.message.includes('auth')) {
    console.log('\nAuthentication issue. Check:')
    console.log('1. SMTP AUTH is enabled for info@itwhip.com in Office 365')
    console.log('2. Password is correct')
    console.log('3. No 2FA blocking SMTP access')
  }
}

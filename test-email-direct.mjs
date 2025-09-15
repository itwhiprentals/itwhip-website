
import nodemailer from 'nodemailer'

async function testEmail() {

  // Check if credentials exist

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {

    console.error('❌ SMTP credentials not found in environment variables')

    console.log('Add these to .env.local:')

    console.log('SMTP_HOST=smtp.office365.com')

    console.log('SMTP_PORT=587')

    console.log('SMTP_USER=hxris08@gmail.com')

    console.log('SMTP_PASS=Xianns8686*)

    return

  }

  const transporter = nodemailer.createTransporter({

    host: process.env.SMTP_HOST || 'smtp.office365.com',

    port: parseInt(process.env.SMTP_PORT || '587'),

    secure: false,

    auth: {

      user: process.env.SMTP_USER,

      pass: process.env.SMTP_PASS

    },

    tls: {

      rejectUnauthorized: false

    }

  })

  try {

    // Test connection

    await transporter.verify()

    console.log('✅ SMTP connection successful')

    // Send test email

    const result = await transporter.sendMail({

      from: process.env.EMAIL_FROM || 'ItWhip <info@itwhip.com>',

      to: 'hxris08@gmail.com',

      subject: 'Test Email from ItWhip',

      text: 'This is a test email',

      html: '<h1>Test Email</h1><p>If you receive this, email sending is working!</p>'

    })

    console.log('✅ Email sent:', result.messageId)

  } catch (error) {

    console.error('❌ Email error:', error.message)

  }

}

testEmail()


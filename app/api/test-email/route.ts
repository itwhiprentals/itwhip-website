import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransport({
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
    
    await transporter.verify()
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'hxris08@gmail.com',
      subject: 'ItWhip Platform Test',
      html: '<h1>Success!</h1><p>Your ItWhip email system is working.</p>'
    })
    
    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Check hxris08@gmail.com for the test email!' 
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    })
  }
}

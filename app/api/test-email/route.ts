import { NextResponse } from 'next/server'

export async function GET() {
  if (!process.env.SMTP_PASS) {
    return NextResponse.json({
      success: false,
      error: 'SMTP_PASS not configured'
    }, { status: 500 })
  }
  
  try {
    // Import without .default
    const nodemailer = await import('nodemailer');
    
    // Check what we got
    const createTransporter = nodemailer.createTransporter || 
                             nodemailer.default?.createTransporter ||
                             (nodemailer as any).createTransport;
    
    if (!createTransporter) {
      return NextResponse.json({
        success: false,
        error: 'createTransporter not found',
        keys: Object.keys(nodemailer)
      }, { status: 500 })
    }
    
    const transporter = createTransporter({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: 'info@itwhip.com',
        pass: process.env.SMTP_PASS
      },
      requireTLS: true,
      tls: {
        ciphers: 'SSLv3'
      }
    });
    
    const info = await transporter.sendMail({
      from: '"ItWhip Rentals" <info@itwhip.com>',
      to: 'hxris08@gmail.com',
      subject: 'Test Email from ItWhip',
      text: 'If you see this, email is working!',
      html: '<b>If you see this, email is working!</b>'
    });
    
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted
    })
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send email'
    }, { status: 500 })
  }
}

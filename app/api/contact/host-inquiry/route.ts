// app/api/contact/host-inquiry/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    // Parse FormData instead of JSON to handle file uploads
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const vehicleMake = formData.get('vehicleMake') as string
    const vehicleModel = formData.get('vehicleModel') as string
    const vehicleYear = formData.get('vehicleYear') as string
    const location = formData.get('location') as string
    const message = formData.get('message') as string
    const mileage = formData.get('mileage') as string
    const condition = formData.get('condition') as string
    const features = formData.get('features') as string

    // Validate required fields
    if (!name || !email || !phone || !vehicleMake || !vehicleModel || !vehicleYear) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate year
    const year = parseInt(vehicleYear)
    if (year < 2015 && year > 1999) { // Classic cars exception
      return NextResponse.json(
        { error: 'Vehicle must be 2015 or newer (classic vehicles excepted)' },
        { status: 400 }
      )
    }

    // Handle photo uploads
    const photoUrls: string[] = []
    const photos = formData.getAll('photos') as File[]
    
    if (photos && photos.length > 0) {
      for (const photo of photos.slice(0, 5)) { // Max 5 photos
        try {
          // Convert file to base64
          const bytes = await photo.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const base64 = buffer.toString('base64')
          const dataUri = `data:${photo.type};base64,${base64}`
          
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'host-inquiries',
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 800, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          })
          
          photoUrls.push(result.secure_url)
        } catch (uploadError) {
          console.error('Photo upload failed:', uploadError)
          // Continue with other photos even if one fails
        }
      }
    }

    // Create inquiry record with photo URLs
    const inquiry = await prisma.hostInquiry.create({
      data: {
        name,
        email,
        phone,
        vehicleMake,
        vehicleModel,
        vehicleYear: year,
        location: location || 'Phoenix',
        message: message || '',
        mileage: mileage ? parseInt(mileage) : null,
        condition: condition || 'EXCELLENT',
        features: features || '',
        status: 'NEW',
        source: 'WEBSITE',
        metadata: {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          timestamp: new Date().toISOString(),
          photoUrls: photoUrls // Store photo URLs in metadata
        }
      } as any
    })

    // Create admin notification
    await prisma.adminNotification.create({
      data: {
        type: 'HOST_INQUIRY',
        title: `New Host Inquiry: ${vehicleYear} ${vehicleMake} ${vehicleModel}`,
        message: `${name} wants to list their ${vehicleYear} ${vehicleMake} ${vehicleModel}. Location: ${location}. Contact: ${phone} / ${email}. ${photoUrls.length} photo(s) uploaded.`,
        priority: 'MEDIUM',
        status: 'UNREAD',
        actionRequired: true,
        actionUrl: `/admin/host-inquiries/${inquiry.id}`,
        relatedId: inquiry.id,
        relatedType: 'HOST_INQUIRY',
        metadata: {
          inquiryId: inquiry.id,
          vehicleInfo: `${vehicleYear} ${vehicleMake} ${vehicleModel}`,
          contactInfo: { name, email, phone, location },
          photoUrls: photoUrls
        }
      } as any
    })

    // Send detailed email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'info@itwhip.com'
    const emailSubject = `🚗 New Host Inquiry: ${vehicleMake} ${vehicleModel}`
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">New Host Vehicle Inquiry</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #111827; margin: 0 0 15px 0;">Vehicle Details</h2>
            <p style="margin: 5px 0;"><strong>Vehicle:</strong> ${vehicleYear} ${vehicleMake} ${vehicleModel}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${location || 'Phoenix'}</p>
            ${mileage ? `<p style="margin: 5px 0;"><strong>Mileage:</strong> ${mileage}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Condition:</strong> ${condition || 'EXCELLENT'}</p>
            ${features ? `<p style="margin: 5px 0;"><strong>Features:</strong> ${features}</p>` : ''}
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #111827; margin: 0 0 15px 0;">Contact Information</h2>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
          </div>
          
          ${message ? `
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #111827; margin: 0 0 15px 0;">Additional Information</h2>
            <p style="margin: 0; line-height: 1.6;">${message}</p>
          </div>
          ` : ''}
          
          ${photoUrls.length > 0 ? `
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #111827; margin: 0 0 15px 0;">Vehicle Photos (${photoUrls.length})</h2>
            ${photoUrls.map((url, index) => `
              <p style="margin: 5px 0;">
                <a href="${url}" style="color: #10b981; text-decoration: none;">
                  📷 Photo ${index + 1}
                </a>
              </p>
            `).join('')}
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/admin/host-inquiries/${inquiry.id}" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: 500;">
              Review Inquiry in Admin Dashboard
            </a>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            Inquiry ID: ${inquiry.id}<br>
            Submitted: ${new Date().toLocaleString()}<br>
            © ${new Date().getFullYear()} ItWhip Technologies, Inc.
          </p>
        </div>
      </div>
    `
    
    await sendEmail(adminEmail, emailSubject, emailHtml, `New host inquiry from ${name} for ${vehicleMake} ${vehicleModel}`)

    // Send confirmation email to inquirer
    const userSubject = 'We received your vehicle listing inquiry - ItWhip'
    const userHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Thank You for Your Interest!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px;">Hi ${name},</p>
          
          <p style="color: #555; line-height: 1.6;">
            We've received your inquiry about listing your <strong>${vehicleYear} ${vehicleMake} ${vehicleModel}</strong> 
            on ItWhip. Our team is excited to review your submission!
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">What happens next?</h3>
            <ol style="margin: 10px 0; padding-left: 20px; color: #666;">
              <li style="margin: 5px 0;">Our team will review your vehicle within 24 hours</li>
              <li style="margin: 5px 0;">If approved, we'll schedule a quick inspection</li>
              <li style="margin: 5px 0;">You'll receive your host onboarding link</li>
              <li style="margin: 5px 0;">Start earning within 48 hours!</li>
            </ol>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you have any questions in the meantime, feel free to reply to this email or 
            call us at (855) 703-0806.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            The ItWhip Host Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            Reference #${inquiry.id}<br>
            © ${new Date().getFullYear()} ItWhip Technologies, Inc.
          </p>
        </div>
      </div>
    `
    
    await sendEmail(email, userSubject, userHtml, `Thank you for your vehicle listing inquiry. We'll review it within 24 hours.`)

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully',
      inquiryId: inquiry.id
    })

  } catch (error) {
    console.error('Error processing host inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    )
  }
}

// GET endpoint for admin to retrieve inquiries
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'NEW'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch inquiries
    const inquiries = await prisma.hostInquiry.findMany({
      where: status !== 'ALL' ? { status } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.hostInquiry.count({
      where: status !== 'ALL' ? { status } : {}
    })

    return NextResponse.json({
      success: true,
      inquiries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
}
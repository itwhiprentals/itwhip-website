// app/api/careers/[id]/apply/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email'

// Helper to generate application reference number
function generateApplicationRef(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `APP-${year}${month}-${random}`
}

// POST - Submit job application
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params
    
    // Parse form data (handles file upload)
    const formData = await request.formData()
    
    // Extract form fields
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const linkedin = formData.get('linkedin') as string | null
    const portfolio = formData.get('portfolio') as string | null
    const coverLetter = formData.get('coverLetter') as string | null
    const resumeUrl = formData.get('resumeUrl') as string // Already uploaded to Cloudinary
    const source = formData.get('source') as string | null

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !resumeUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields' 
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email address' 
        },
        { status: 400 }
      )
    }

    // Check if job exists and is active
    const job = await prisma.jobPosting.findUnique({
      where: { 
        id: jobId,
        isActive: true
      }
    })

    if (!job) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Job posting not found or no longer active' 
        },
        { status: 404 }
      )
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId: jobId,
        email: email
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You have already applied for this position' 
        },
        { status: 409 } // Conflict
      )
    }

    // Create application with reference number
    const applicationRef = generateApplicationRef()
    
    const application = await prisma.jobApplication.create({
      data: {
        id: crypto.randomUUID(),
        jobId,
        firstName,
        lastName,
        email,
        phone,
        linkedin,
        portfolio,
        resumeUrl,
        coverLetter,
        source: source || 'website',
        status: 'NEW',
        updatedAt: new Date()
      }
    })

    // Update job application count
    await prisma.jobPosting.update({
      where: { id: jobId },
      data: { 
        applicationCount: { increment: 1 }
      }
    })

    // Send confirmation email to applicant
    try {
      await sendEmail(
        email,
        `Application Received - ${job.title} at ItWhip`,
        `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 24px; background: #F59E0B; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px; }
                .ref-code { background: #f3f4f6; padding: 10px 15px; border-radius: 5px; font-family: monospace; display: inline-block; margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 24px;">Application Received!</h1>
                  <p style="margin: 10px 0 0; opacity: 0.9;">Thank you for your interest in ItWhip</p>
                </div>
                <div class="content">
                  <p>Hi ${firstName},</p>

                  <p>We've successfully received your application for the <strong>${job.title}</strong> position in our ${job.department} department.</p>

                  <p>Your application reference number is:</p>
                  <div class="ref-code">${applicationRef}</div>

                  <h3>What happens next?</h3>
                  <ul>
                    <li>Our hiring team will review your application within <strong>48-72 hours</strong></li>
                    <li>If your profile matches our requirements, we'll reach out to schedule an initial conversation</li>
                    <li>You can use your reference number to check your application status</li>
                  </ul>

                  <p>We receive many applications and carefully review each one. While we can't respond to every applicant personally, we truly appreciate your interest in joining our team.</p>

                  <h3>About the role:</h3>
                  <p><strong>Location:</strong> ${job.location}<br>
                  <strong>Type:</strong> ${job.type}<br>
                  <strong>Department:</strong> ${job.department}</p>

                  <div class="footer">
                    <p><strong>ItWhip Technologies</strong><br>
                    Building the future of luxury transportation<br>
                    Phoenix, Arizona</p>

                    <p style="margin-top: 15px; font-size: 12px; color: #999;">
                      This is an automated confirmation email. Please do not reply directly to this message.
                    </p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
        ''
      )
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the application if email fails
    }

    // Send notification email to HR
    try {
      await sendEmail(
        process.env.CAREERS_EMAIL || 'info@itwhip.com',
        `New Application: ${job.title} - ${firstName} ${lastName}`,
        `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>New Job Application Received</h2>

                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Position Details</h3>
                  <p><strong>Position:</strong> ${job.title}<br>
                  <strong>Department:</strong> ${job.department}<br>
                  <strong>Location:</strong> ${job.location}<br>
                  <strong>Application #:</strong> ${applicationRef}</p>
                </div>

                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Applicant Information</h3>
                  <p><strong>Name:</strong> ${firstName} ${lastName}<br>
                  <strong>Email:</strong> <a href="mailto:${email}">${email}</a><br>
                  <strong>Phone:</strong> ${phone}<br>
                  ${linkedin ? `<strong>LinkedIn:</strong> <a href="${linkedin}">${linkedin}</a><br>` : ''}
                  ${portfolio ? `<strong>Portfolio:</strong> <a href="${portfolio}">${portfolio}</a><br>` : ''}
                  <strong>Resume:</strong> <a href="${resumeUrl}">View Resume</a><br>
                  <strong>Source:</strong> ${source || 'Website'}</p>
                </div>

                ${coverLetter ? `
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Cover Letter</h3>
                  <p style="white-space: pre-wrap;">${coverLetter}</p>
                </div>
                ` : ''}

                <div style="margin-top: 30px; padding: 20px; background: #3b82f6; color: white; border-radius: 8px; text-align: center;">
                  <p style="margin: 0 0 15px;">View and manage this application in:</p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://itwhip.com'}/admin/careers/applications/${application.id}"
                     style="display: inline-block; padding: 10px 20px; background: white; color: #3b82f6; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Admin Dashboard
                  </a>
                </div>

                <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
                  Total applications for this position: ${job.applicationCount + 1}
                </p>
              </div>
            </body>
          </html>
        `,
        ''
      )
    } catch (emailError) {
      console.error('Failed to send HR notification:', emailError)
      // Don't fail the application if email fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationRef,
      data: {
        id: application.id,
        applicationRef,
        position: job.title,
        department: job.department
      }
    })

  } catch (error) {
    console.error('Failed to submit application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit application. Please try again.' 
      },
      { status: 500 }
    )
  }
}
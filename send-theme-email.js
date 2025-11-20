const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Email configuration
const config = {
  smtp: {
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: 'info@itwhip.com',
      pass: 'Xianns8686*' // Replace with actual password
    }
  },
  from: 'ItWhip Rentals <info@itwhip.com>',
  replyTo: 'info@itwhip.com',
  to: 'nnylaaja@gmail.com'
};

// Email content
const emailContent = {
  subject: '🎉 BuildABra Theme - Final Delivery & Installation Guide',
  html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif; max-width: 650px; margin: 0 auto; color: #333; background: #ffffff;">
      
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #000 0%, #333 100%); color: #fff; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Your New BuildABra Theme is Ready! 🎉</h1>
        <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.9;">Fashion Nova-Inspired Design | Fully Responsive | Ready to Launch</p>
      </div>

      <!-- Main Content -->
      <div style="padding: 40px 30px;">
        
        <p style="font-size: 17px; line-height: 1.7; margin-bottom: 25px;">
          Hi there,
        </p>
        
        <p style="font-size: 17px; line-height: 1.7; margin-bottom: 30px;">
          Congratulations! Your custom BuildABra theme is complete and ready for installation. This is your <strong>final deliverable</strong> with all the features we discussed, professionally designed and optimized for conversions.
        </p>

        <!-- What's Included Section -->
        <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin: 35px 0; border-left: 4px solid #000;">
          <h2 style="color: #000; font-size: 24px; margin: 0 0 20px 0; font-weight: 700;">✨ What's Included in Your Theme:</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 16px; line-height: 1.6;">
                <strong style="color: #000;">✓</strong> Fashion Nova-inspired modern design
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 16px; line-height: 1.6;">
                <strong style="color: #000;">✓</strong> Complete Size Guide page with sizing charts
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 16px; line-height: 1.6;">
                <strong style="color: #000;">✓</strong> Contact Us page with working contact form
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 16px; line-height: 1.6;">
                <strong style="color: #000;">✓</strong> Our Story page featuring your brand narrative
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 16px; line-height: 1.6;">
                <strong style="color: #000;">✓</strong> Mobile-optimized responsive design
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 16px; line-height: 1.6;">
                <strong style="color: #000;">✓</strong> Product collections setup (Best Sellers, New Arrivals, Sale)
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 16px; line-height: 1.6;">
                <strong style="color: #000;">✓</strong> Professional footer with all navigation links
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 16px; line-height: 1.6;">
                <strong style="color: #000;">✓</strong> Cart functionality and checkout flow
              </td>
            </tr>
          </table>
        </div>

        <!-- Installation Instructions -->
        <h2 style="color: #000; font-size: 26px; margin: 45px 0 25px 0; font-weight: 700;">📦 Installation Instructions</h2>
        
        <div style="background: #ffffff; border: 2px solid #000; padding: 30px; border-radius: 8px; margin: 25px 0;">
          <p style="font-size: 15px; color: #666; margin: 0 0 20px 0;">
            <strong>Installation takes approximately 2-3 minutes:</strong>
          </p>
          
          <table style="width: 100%;">
            <tr>
              <td style="vertical-align: top; padding: 12px 0;">
                <div style="background: #000; color: #fff; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 15px;">1</div>
              </td>
              <td style="padding: 12px 0; font-size: 16px; line-height: 1.7;">
                Log into your Shopify Admin at:<br>
                <a href="https://buildabra.co/admin/themes" style="color: #0066cc; text-decoration: none; font-weight: 600;">https://buildabra.co/admin/themes</a>
              </td>
            </tr>
            <tr>
              <td style="vertical-align: top; padding: 12px 0;">
                <div style="background: #000; color: #fff; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 15px;">2</div>
              </td>
              <td style="padding: 12px 0; font-size: 16px; line-height: 1.7;">
                Scroll down to the <strong>"Theme library"</strong> section
              </td>
            </tr>
            <tr>
              <td style="vertical-align: top; padding: 12px 0;">
                <div style="background: #000; color: #fff; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 15px;">3</div>
              </td>
              <td style="padding: 12px 0; font-size: 16px; line-height: 1.7;">
                Click <strong>"Add theme"</strong> → <strong>"Upload zip file"</strong>
              </td>
            </tr>
            <tr>
              <td style="vertical-align: top; padding: 12px 0;">
                <div style="background: #000; color: #fff; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 15px;">4</div>
              </td>
              <td style="padding: 12px 0; font-size: 16px; line-height: 1.7;">
                Upload the attached <code style="background: #f0f0f0; padding: 3px 8px; border-radius: 4px; font-family: monospace;">BuildABra-Theme-v2.0.zip</code>
              </td>
            </tr>
            <tr>
              <td style="vertical-align: top; padding: 12px 0;">
                <div style="background: #000; color: #fff; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 15px;">5</div>
              </td>
              <td style="padding: 12px 0; font-size: 16px; line-height: 1.7;">
                Once uploaded, click <strong>"Customize"</strong> to preview your new theme
              </td>
            </tr>
            <tr>
              <td style="vertical-align: top; padding: 12px 0;">
                <div style="background: #000; color: #fff; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 15px;">6</div>
              </td>
              <td style="padding: 12px 0; font-size: 16px; line-height: 1.7;">
                When you're satisfied with the preview, click <strong>"Publish"</strong> to make it live
              </td>
            </tr>
          </table>
        </div>

        <!-- Important Notes -->
        <div style="background: #fff9e6; border-left: 4px solid #ffc107; padding: 25px; margin: 35px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 15px 0; color: #000; font-size: 18px; font-weight: 700;">⚠️ Important Notes:</h3>
          <ul style="font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Your current theme will be automatically saved as a backup</li>
            <li style="margin-bottom: 8px;">All products, inventory, and orders remain completely unchanged</li>
            <li style="margin-bottom: 8px;">You can switch back to your previous theme anytime from Shopify admin</li>
            <li style="margin-bottom: 8px;">Always preview using "Customize" before clicking "Publish"</li>
            <li>Your domain (buildabra.co) will automatically work with the new theme</li>
          </ul>
        </div>

        <!-- Pages Created -->
        <h2 style="color: #000; font-size: 24px; margin: 45px 0 20px 0; font-weight: 700;">📄 Pages Included & Ready:</h2>
        <table style="width: 100%; border-collapse: collapse; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 15px 20px; border-bottom: 1px solid #dee2e6; font-size: 16px;">
              <strong>Size Guide</strong>
            </td>
            <td style="padding: 15px 20px; border-bottom: 1px solid #dee2e6; font-size: 15px; color: #666;">
              /pages/size-guide
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 20px; border-bottom: 1px solid #dee2e6; font-size: 16px;">
              <strong>Contact Us</strong>
            </td>
            <td style="padding: 15px 20px; border-bottom: 1px solid #dee2e6; font-size: 15px; color: #666;">
              /pages/contact
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 20px; font-size: 16px;">
              <strong>Our Story</strong>
            </td>
            <td style="padding: 15px 20px; font-size: 15px; color: #666;">
              /pages/about
            </td>
          </tr>
        </table>

        <p style="font-size: 15px; color: #666; margin: 20px 0 0 0; line-height: 1.6;">
          All footer navigation links are configured and working. Additional pages (Shipping, Returns, FAQ, etc.) can be added by you through Shopify Admin → Pages, or we can create them for you at our standard hourly rate.
        </p>

        <!-- Pricing Section -->
        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 35px; border-radius: 8px; margin: 45px 0; border: 2px solid #dee2e6;">
          <h2 style="color: #000; font-size: 26px; margin: 0 0 20px 0; font-weight: 700; text-align: center;">💼 Future Support & Additional Work</h2>
          
          <p style="font-size: 16px; line-height: 1.7; color: #333; text-align: center; margin-bottom: 30px;">
            Your theme is complete and ready to use! If you need any modifications, new pages, or additional features in the future, we're here to help.
          </p>

          <div style="background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; font-weight: 700; color: #000; line-height: 1;">$25</div>
              <div style="font-size: 18px; color: #666; margin-top: 5px;">per hour</div>
            </div>

            <h3 style="color: #000; font-size: 20px; margin: 30px 0 15px 0; font-weight: 700;">Services Include:</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 10px 0; font-size: 16px; line-height: 1.6; vertical-align: top;">
                  <span style="color: #28a745; font-weight: 700; margin-right: 10px;">✓</span>
                </td>
                <td style="padding: 10px 0; font-size: 16px; line-height: 1.6;">
                  Creating new pages (Shipping, Returns, FAQ, Blog posts, etc.)
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-size: 16px; line-height: 1.6; vertical-align: top;">
                  <span style="color: #28a745; font-weight: 700; margin-right: 10px;">✓</span>
                </td>
                <td style="padding: 10px 0; font-size: 16px; line-height: 1.6;">
                  Editing existing pages and content
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-size: 16px; line-height: 1.6; vertical-align: top;">
                  <span style="color: #28a745; font-weight: 700; margin-right: 10px;">✓</span>
                </td>
                <td style="padding: 10px 0; font-size: 16px; line-height: 1.6;">
                  Design modifications and layout changes
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-size: 16px; line-height: 1.6; vertical-align: top;">
                  <span style="color: #28a745; font-weight: 700; margin-right: 10px;">✓</span>
                </td>
                <td style="padding: 10px 0; font-size: 16px; line-height: 1.6;">
                  Adding new features or functionality
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-size: 16px; line-height: 1.6; vertical-align: top;">
                  <span style="color: #28a745; font-weight: 700; margin-right: 10px;">✓</span>
                </td>
                <td style="padding: 10px 0; font-size: 16px; line-height: 1.6;">
                  Technical troubleshooting and bug fixes
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-size: 16px; line-height: 1.6; vertical-align: top;">
                  <span style="color: #28a745; font-weight: 700; margin-right: 10px;">✓</span>
                </td>
                <td style="padding: 10px 0; font-size: 16px; line-height: 1.6;">
                  Theme updates and optimizations
                </td>
              </tr>
            </table>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-top: 25px;">
              <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0;">
                <strong>Billing:</strong> Work is billed in 30-minute increments. You'll receive a time estimate before we start any paid work. Most small page edits take 30 minutes to 1 hour.
              </p>
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div style="background: #000; color: #fff; padding: 35px; border-radius: 8px; margin: 45px 0; text-align: center;">
          <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 700;">🚀 Ready to Launch?</h2>
          <p style="font-size: 17px; margin: 0 0 25px 0; opacity: 0.95; line-height: 1.7;">
            Upload your theme now and start selling with confidence!<br>
            Your beautiful new store is just minutes away.
          </p>
          <div style="display: inline-block; background: #fff; color: #000; padding: 14px 35px; border-radius: 6px; font-weight: 700; font-size: 16px;">
            Install Theme Now →
          </div>
        </div>

        <!-- Support Section -->
        <div style="border-top: 2px solid #dee2e6; padding-top: 35px; margin-top: 45px;">
          <h3 style="color: #000; font-size: 20px; margin: 0 0 15px 0; font-weight: 700;">Need Help During Installation?</h3>
          <p style="font-size: 16px; line-height: 1.7; color: #333; margin: 0 0 20px 0;">
            If you have any questions or run into any issues during installation, simply reply to this email. We're here to ensure your launch goes smoothly!
          </p>
          
          <p style="font-size: 16px; line-height: 1.7; color: #333; margin: 30px 0 0 0;">
            We're excited to see BuildABra go live with this beautiful new design! 🎉
          </p>

          <p style="font-size: 16px; line-height: 1.7; margin-top: 30px;">
            Best regards,<br>
            <strong style="color: #000;">Your Development Team</strong><br>
            <span style="color: #666; font-size: 15px;">ItWhip Rentals</span>
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #dee2e6; margin-top: 40px; padding-top: 25px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #999;">
                <strong>Attachment:</strong> BuildABra-Theme-v2.0.zip
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #999;">
                <strong>File Size:</strong> 256KB
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #999;">
                <strong>Theme Version:</strong> 2.0 (Final Release)
              </td>
            </tr>
          </table>
        </div>

      </div>
    </div>
  `
};

async function sendEmail() {
  try {
    console.log('🚀 Starting email send process...\n');

    // Check if zip file exists
    const zipPath = path.join(__dirname, 'BuildABra-Theme-v2.0.zip');
    if (!fs.existsSync(zipPath)) {
      throw new Error('BuildABra-Theme-v2.0.zip not found! Make sure the file exists in the same folder.');
    }

    const fileSize = (fs.statSync(zipPath).size / 1024).toFixed(2);
    console.log(`✅ Found theme file: BuildABra-Theme-v2.0.zip (${fileSize} KB)\n`);

    // Create transporter
    console.log('📧 Connecting to SMTP server...');
    const transporter = nodemailer.createTransport(config.smtp);

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified\n');

    // Send email
    console.log('📤 Sending email...');
    const info = await transporter.sendMail({
      from: config.from,
      to: config.to,
      replyTo: config.replyTo,
      subject: emailContent.subject,
      html: emailContent.html,
      attachments: [
        {
          filename: 'BuildABra-Theme-v2.0.zip',
          path: zipPath
        }
      ]
    });

    console.log('✅ Email sent successfully!\n');
    console.log('📊 Email Details:');
    console.log(`   From: ${config.from}`);
    console.log(`   To: ${config.to}`);
    console.log(`   Subject: ${emailContent.subject}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Attachment: BuildABra-Theme-v2.0.zip (${fileSize} KB)\n`);
    console.log('🎉 Check your inbox at ${config.to}!\n');

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure the password is correct');
    console.error('2. Check if the zip file exists in this folder');
    console.error('3. Verify SMTP settings for Office 365');
    console.error('4. Make sure less secure app access is enabled (if required)\n');
    process.exit(1);
  }
}

// Run the email send
sendEmail();
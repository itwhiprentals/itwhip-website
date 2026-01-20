// app/lib/email/templates/email-footer.ts
// Reusable email footer component for all ItWhip emails

export interface EmailFooterProps {
  recipientEmail?: string
  includeAppButtons?: boolean
  includeSocialLinks?: boolean
  footerType?: 'full' | 'minimal' | 'text-only'
}

// Actual social media links - updated Jan 2026
const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/people/Itwhipcom/61573990760395/',
  twitter: 'https://x.com/itwhipofficial',
  instagram: 'https://www.instagram.com/itwhipofficial',
  linkedin: 'https://www.linkedin.com/company/itwhip/'
}

// App store links
const APP_LINKS = {
  appStore: 'https://testflight.apple.com/join/ygzsQbNf',
  // Google Play coming soon
}

// Legal disclaimer text
const DISCLAIMER_TEXT = `ItWhip is a peer-to-peer vehicle rental marketplace connecting vehicle owners (Hosts) with renters (Guests). Fleet Partners operate independent vehicle fleets under partnership agreements. Hosts and Partners are independent contractors, not employees of ItWhip Technologies. All rentals are subject to insurance coverage and protection plans as outlined in our Terms of Service. Not all vehicles or hosts are available in all areas.`

// Inline SVG icons as data URIs for email compatibility (works in most email clients)
// Instagram icon - official camera shape
const INSTAGRAM_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/%3E%3C/svg%3E`

// Facebook icon - official f logo
const FACEBOOK_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/%3E%3C/svg%3E`

// X (Twitter) icon - official X logo
const X_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E`

// LinkedIn icon - official in logo
const LINKEDIN_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/%3E%3C/svg%3E`

// Apple logo for App Store
const APPLE_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z'/%3E%3C/svg%3E`

// Google Play triangle
const PLAY_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z'/%3E%3C/svg%3E`

/**
 * Generate HTML email footer
 */
export function emailFooterHtml(props: EmailFooterProps = {}): string {
  const {
    recipientEmail = '',
    includeAppButtons = true,
    includeSocialLinks = true,
    footerType = 'full'
  } = props

  const currentYear = new Date().getFullYear()

  if (footerType === 'full') {
    return `
      <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 20px; background: #f9fafb;">

        <!-- Left-aligned content: Social, App Buttons -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
          <tr>
            <td style="vertical-align: top; padding-left: 16px;">

              ${includeSocialLinks ? `
              <!-- Social Icons Row - Using inline SVG data URIs for proper display -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                <tr>
                  <!-- Instagram -->
                  <td style="padding-right: 8px;">
                    <a href="${SOCIAL_LINKS.instagram}" target="_blank" style="display: block; text-decoration: none;">
                      <table cellpadding="0" cellspacing="0" width="28" height="28" style="background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); border-radius: 6px;">
                        <tr>
                          <td align="center" valign="middle" style="width: 28px; height: 28px;">
                            <img src="${INSTAGRAM_ICON}" alt="Instagram" width="16" height="16" style="display: block; border: 0;" />
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <!-- Facebook -->
                  <td style="padding-right: 8px;">
                    <a href="${SOCIAL_LINKS.facebook}" target="_blank" style="display: block; text-decoration: none;">
                      <table cellpadding="0" cellspacing="0" width="28" height="28" style="background: #1877f2; border-radius: 6px;">
                        <tr>
                          <td align="center" valign="middle" style="width: 28px; height: 28px;">
                            <img src="${FACEBOOK_ICON}" alt="Facebook" width="16" height="16" style="display: block; border: 0;" />
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <!-- X (Twitter) -->
                  <td style="padding-right: 8px;">
                    <a href="${SOCIAL_LINKS.twitter}" target="_blank" style="display: block; text-decoration: none;">
                      <table cellpadding="0" cellspacing="0" width="28" height="28" style="background: #000000; border-radius: 6px;">
                        <tr>
                          <td align="center" valign="middle" style="width: 28px; height: 28px;">
                            <img src="${X_ICON}" alt="X" width="14" height="14" style="display: block; border: 0;" />
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <!-- LinkedIn -->
                  <td>
                    <a href="${SOCIAL_LINKS.linkedin}" target="_blank" style="display: block; text-decoration: none;">
                      <table cellpadding="0" cellspacing="0" width="28" height="28" style="background: #0a66c2; border-radius: 6px;">
                        <tr>
                          <td align="center" valign="middle" style="width: 28px; height: 28px;">
                            <img src="${LINKEDIN_ICON}" alt="LinkedIn" width="16" height="16" style="display: block; border: 0;" />
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              ${includeAppButtons ? `
              <!-- App Buttons - Under social icons, left aligned -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <!-- App Store Button -->
                  <td style="padding-right: 8px;">
                    <a href="${APP_LINKS.appStore}" target="_blank" style="display: block; width: 110px; height: 34px; background: #000000; border-radius: 6px; text-decoration: none; padding: 4px 8px; box-sizing: border-box;">
                      <table cellpadding="0" cellspacing="0" width="100%" height="100%">
                        <tr>
                          <td width="20" style="vertical-align: middle; text-align: center;">
                            <img src="${APPLE_ICON}" alt="Apple" width="16" height="16" style="display: block; border: 0;" />
                          </td>
                          <td style="vertical-align: middle; padding-left: 4px;">
                            <div style="font-size: 7px; color: #ffffff; line-height: 1; font-family: -apple-system, sans-serif;">Download on the</div>
                            <div style="font-size: 11px; color: #ffffff; font-weight: 600; line-height: 1.3; font-family: -apple-system, sans-serif;">App Store</div>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <!-- Google Play Button - grayed out (coming soon) -->
                  <td>
                    <div style="display: block; width: 110px; height: 34px; background: #000000; border-radius: 6px; padding: 4px 8px; box-sizing: border-box; opacity: 0.4;">
                      <table cellpadding="0" cellspacing="0" width="100%" height="100%">
                        <tr>
                          <td width="20" style="vertical-align: middle; text-align: center;">
                            <img src="${PLAY_ICON}" alt="Google Play" width="14" height="14" style="display: block; border: 0;" />
                          </td>
                          <td style="vertical-align: middle; padding-left: 4px;">
                            <div style="font-size: 7px; color: #ffffff; line-height: 1; font-family: -apple-system, sans-serif;">GET IT ON</div>
                            <div style="font-size: 11px; color: #ffffff; font-weight: 600; line-height: 1.3; font-family: -apple-system, sans-serif;">Google Play</div>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
        </table>

        <!-- Disclaimer -->
        <div style="padding: 10px 16px; background: #ffffff; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 9px; color: #9ca3af; line-height: 1.4; text-align: left;">
            ${DISCLAIMER_TEXT}
          </p>
        </div>

        <!-- Bottom Row: Links + Copyright (centered) -->
        <div style="padding: 12px 16px; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 9px; color: #6b7280;">
            <a href="https://itwhip.com/terms" style="color: #6b7280; text-decoration: none;">Terms</a>
            <span style="margin: 0 5px; color: #d1d5db;">|</span>
            <a href="https://itwhip.com/privacy" style="color: #6b7280; text-decoration: none;">Privacy</a>
            <span style="margin: 0 5px; color: #d1d5db;">|</span>
            <a href="https://itwhip.com/support" style="color: #6b7280; text-decoration: none;">Support</a>
            <span style="margin: 0 5px; color: #d1d5db;">|</span>
            <a href="mailto:info@itwhip.com" style="color: #6b7280; text-decoration: none;">info@itwhip.com</a>
          </p>
          <p style="margin: 0; font-size: 9px; color: #9ca3af;">
            &copy; ${currentYear} ItWhip Technologies
          </p>
          ${recipientEmail ? `
          <p style="margin: 6px 0 0 0; font-size: 9px; color: #9ca3af;">
            Sent to ${recipientEmail}
            <span style="margin: 0 4px; color: #d1d5db;">|</span>
            <a href="https://itwhip.com/unsubscribe?email=${encodeURIComponent(recipientEmail)}" style="color: #9ca3af; text-decoration: none;">Unsubscribe</a>
          </p>
          ` : ''}
        </div>
      </div>
    `
  }

  // Minimal footer
  if (footerType === 'minimal') {
    return `
      <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding: 12px 16px; background: #f9fafb; text-align: center;">
        <p style="margin: 0 0 4px 0; font-size: 9px; color: #6b7280;">
          <a href="mailto:info@itwhip.com" style="color: #6b7280; text-decoration: none;">info@itwhip.com</a>
          <span style="margin: 0 5px; color: #d1d5db;">|</span>
          <a href="https://itwhip.com/terms" style="color: #6b7280; text-decoration: none;">Terms</a>
          <span style="margin: 0 5px; color: #d1d5db;">|</span>
          <a href="https://itwhip.com/privacy" style="color: #6b7280; text-decoration: none;">Privacy</a>
        </p>
        <p style="margin: 0; font-size: 9px; color: #9ca3af;">
          &copy; ${currentYear} ItWhip Technologies
        </p>
        ${recipientEmail ? `
        <p style="margin: 4px 0 0 0; font-size: 9px; color: #9ca3af;">
          Sent to ${recipientEmail}
        </p>
        ` : ''}
      </div>
    `
  }

  // Default minimal for unknown types
  return `
    <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding: 12px 16px; text-align: center; font-size: 9px; color: #9ca3af; background: #f9fafb;">
      <p style="margin: 0;">&copy; ${currentYear} ItWhip Technologies</p>
    </div>
  `
}

/**
 * Generate plain text email footer
 */
export function emailFooterText(props: EmailFooterProps = {}): string {
  const {
    recipientEmail = '',
    includeAppButtons = true,
    includeSocialLinks = true,
    footerType = 'full'
  } = props

  const currentYear = new Date().getFullYear()

  if (footerType === 'full') {
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${includeAppButtons ? `Download: ${APP_LINKS.appStore} | Google Play coming soon
` : ''}${includeSocialLinks ? `Follow us: Instagram, Facebook, X, LinkedIn
` : ''}
${DISCLAIMER_TEXT}

Terms: itwhip.com/terms | Privacy: itwhip.com/privacy | Support: info@itwhip.com
(c) ${currentYear} ItWhip Technologies
${recipientEmail ? `Sent to: ${recipientEmail} | Unsubscribe: itwhip.com/unsubscribe` : ''}`
  }

  // Minimal or text-only footer
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contact: info@itwhip.com | Terms: itwhip.com/terms | Privacy: itwhip.com/privacy
(c) ${currentYear} ItWhip Technologies
${recipientEmail ? `Sent to: ${recipientEmail}` : ''}`
}

/**
 * Combined footer export for easy use
 */
export function emailFooter(props: EmailFooterProps = {}) {
  return {
    html: emailFooterHtml(props),
    text: emailFooterText(props)
  }
}

// Export constants for direct access if needed
export { SOCIAL_LINKS, APP_LINKS, DISCLAIMER_TEXT }

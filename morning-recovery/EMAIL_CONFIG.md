# Email Configuration Guide

This document describes the environment variables required for email functionality, including password reset emails.

## Required Environment Variables

### SMTP Server Configuration

```bash
# SMTP Server Hostname
SMTP_HOST=smtp.office365.com

# SMTP Port (587 for STARTTLS, 465 for SSL/TLS)
SMTP_PORT=587

# SMTP Username (your email address)
SMTP_USER=your-email@domain.com

# SMTP Password (use App Password for Office365/Gmail)
SMTP_PASS=your-app-password
```

### Email Address Configuration

```bash
# From address (displayed in email client)
EMAIL_FROM=ItWhip Rentals <info@itwhip.com>

# Reply-to address
EMAIL_REPLY_TO=info@itwhip.com
```

### Application URL

```bash
# Base URL for password reset links
NEXT_PUBLIC_APP_URL=https://itwhip.com
```

## Optional Environment Variables

### TLS Configuration

```bash
# Set to 'true' to disable TLS certificate validation (NOT RECOMMENDED)
# Only use if your SMTP provider has certificate issues
SMTP_INSECURE_TLS=false

# Set to 'true' to require TLS explicitly (some providers need this)
# Office365 usually works without this, but some providers require it
SMTP_REQUIRE_TLS=false
```

### Redis/Upstash (Optional - for Production Rate Limiting)

```bash
# If not configured, rate limiting falls back to in-memory (resets per serverless instance)
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

## Common Production Issues

### 1. Emails Not Sending in Production (Vercel)

**Problem:** Emails work locally but fail in production.

**Solution:**
- Ensure ALL SMTP_* and EMAIL_* variables are set in Vercel Environment Variables
- Go to: Vercel Dashboard > Your Project > Settings > Environment Variables
- Add each variable for Production, Preview, and Development environments
- **Redeploy after adding variables** - environment variables are only loaded at build/runtime

**How to Verify:**
- Check production logs for `[requestId] SMTP Config Check:` entries
- Look for `hasUser: true, hasPass: true` in logs
- If you see `hasUser: false` or `hasPass: false`, variables are not set

### 2. SMTP Authentication Errors

**Problem:** `Error: Invalid login` or `535 Authentication failed`

**Solution:**
- Verify SMTP_USER and SMTP_PASS are correct
- For Office365/Gmail: Use **App Passwords**, not regular passwords
- Check if 2FA is enabled (may require app-specific password)
- Ensure SMTP AUTH is enabled for your account

**How to Verify:**
- Check logs for error code `535` or `Invalid login`
- Review `[requestId] Email send failed:` entries in production logs

### 3. TLS/Certificate Errors

**Problem:** `Error: self-signed certificate` or `Error: unable to verify the first certificate`

**Solution:**
- Most providers work with default secure settings
- Port 465 uses SSL/TLS, Port 587 uses STARTTLS
- If you see certificate errors, check `SMTP_INSECURE_TLS` (not recommended for production)
- Verify your SMTP provider's certificate is valid

**How to Verify:**
- Check logs for TLS-related error codes
- Review `[requestId] Transport created:` entries to see TLS settings

### 4. Rate Limiting Not Working Across Instances

**Problem:** Rate limiting resets when new serverless instance spins up

**Solution:**
- Configure Redis/Upstash for persistent rate limiting
- Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Check logs for `[Password Reset] Using Redis rate limiting` message

**How to Verify:**
- Check logs for rate limiting method (Redis vs in-memory)
- If you see `[Password Reset] Redis not available, using in-memory rate limiting`, Redis is not configured

### 5. Email Delivery Issues (Emails Sent But Not Received)

**Problem:** Logs show email sent successfully, but user doesn't receive it

**Possible Causes:**
- **SPF/DKIM Records:** Verify your sending domain has proper SPF/DKIM records
- **Domain Mismatch:** Ensure `EMAIL_FROM` domain matches your SMTP provider
- **Spam Folder:** Check recipient's spam folder
- **Provider Blocking:** Some providers may block emails from new/unverified domains

**How to Debug:**
- Check logs for `messageId` - this confirms SMTP accepted the email
- Review `response` field in success logs for SMTP server response
- Check email provider's delivery logs/dashboard
- Verify SPF record: `v=spf1 include:spf.protection.outlook.com ~all` (for Office365)

## Logging and Debugging

### Production Logs

All email operations are logged with a unique `requestId` for tracking:

```
[550e8400-e29b-41d4-a716-446655440000] SMTP Config Check: { hasHost: true, hasPort: true, ... }
[550e8400-e29b-41d4-a716-446655440000] Attempting to send email to: user@example.com
[550e8400-e29b-41d4-a716-446655440000] Email sent successfully: { messageId: '...', ... }
```

### What to Look For

1. **Config Check:** Verify all booleans are `true` (especially `hasUser` and `hasPass`)
2. **Transport Created:** Check TLS settings match your provider requirements
3. **Send Result:** Look for `success: true` and `messageId` for successful sends
4. **Error Details:** Check `errorMessage`, `code`, `command`, `responseCode` for failures

### Request ID Tracking

Each password reset request has a unique `requestId` (UUID). Use this to trace the entire flow:
- Rate limit check
- User lookup
- Token generation
- Email send attempt
- Final result

## Example .env Configuration

```bash
# Required
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=info@itwhip.com
SMTP_PASS=your-app-password-here
EMAIL_FROM=ItWhip Rentals <info@itwhip.com>
EMAIL_REPLY_TO=info@itwhip.com
NEXT_PUBLIC_APP_URL=https://itwhip.com

# Optional
SMTP_REQUIRE_TLS=false
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

## Security Notes

- **Never commit `.env` files** to version control
- **Use App Passwords** for Office365/Gmail (not regular passwords)
- **Keep `SMTP_INSECURE_TLS=false`** in production unless absolutely necessary
- **Rotate SMTP passwords** regularly
- **Monitor logs** for authentication failures (potential security issue)

## Testing

To test email configuration:

1. **Check Config:** Look for `[SMTP] SMTP Config Check:` in logs
2. **Test Connection:** Use `testConnection()` function (if available)
3. **Send Test Email:** Trigger password reset and check logs
4. **Verify Delivery:** Check recipient's inbox (and spam folder)

## Support

If emails are still not working after checking the above:

1. Review production logs with the `requestId` from the failed attempt
2. Check all environment variables are set correctly in Vercel
3. Verify SMTP credentials work with a standalone email client
4. Check SMTP provider's status page for outages
5. Review SPF/DKIM records for your sending domain


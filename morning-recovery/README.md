This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Variables

### Required for Email Functionality

The following environment variables are required for password reset emails and other email features:

```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
EMAIL_FROM=ItWhip Rentals <info@itwhip.com>
EMAIL_REPLY_TO=info@itwhip.com
NEXT_PUBLIC_APP_URL=https://itwhip.com
```

### Optional SMTP Settings

```bash
# Disable TLS certificate validation (NOT RECOMMENDED - only for legacy providers)
SMTP_INSECURE_TLS=false

# Require TLS explicitly (some providers need this)
SMTP_REQUIRE_TLS=false
```

### Redis/Upstash (Optional - for Production Rate Limiting)

For production, configure Redis to enable persistent rate limiting across serverless instances:

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

If Redis is not configured, rate limiting falls back to in-memory (resets per serverless instance).

### Common Production Issues

**Emails not sending in production (Vercel):**
- Ensure ALL SMTP_* and EMAIL_* variables are set in Vercel Environment Variables
- Go to: Vercel Dashboard > Your Project > Settings > Environment Variables
- Add each variable for Production, Preview, and Development environments
- **Redeploy after adding variables** - environment variables are only loaded at build/runtime

**SMTP Authentication Errors:**
- Verify SMTP_USER and SMTP_PASS are correct
- For Office365/Gmail: Use App Passwords, not regular passwords
- Check if 2FA is enabled (may require app-specific password)

**TLS/Certificate Errors:**
- Most providers work with default secure settings
- Port 465 uses SSL/TLS, Port 587 uses STARTTLS
- If you see certificate errors, check SMTP_INSECURE_TLS (not recommended)

See `.env.example` for a complete list of environment variables and troubleshooting tips.

# Force rebuild with correct DB
# Force rebuild 1760925856

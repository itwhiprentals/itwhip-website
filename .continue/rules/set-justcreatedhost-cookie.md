---
description: This cookie is used by oauth-redirect to identify new host signups.
---

After setting hostAccessToken and hostRefreshToken cookies in createSuccessResponse, set the 'just_created_host' cookie to 'true' with httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 5 * 60, and path: '/'.
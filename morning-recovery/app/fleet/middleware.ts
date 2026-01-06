import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  
  // Check for URL key parameter (your old method)
  const urlKey = url.searchParams.get('key');
  
  // Check for x-fleet-key header (new method for external APIs)
  const headerKey = request.headers.get('x-fleet-key');
  
  // Check for fleet access cookie (set by layout)
  const cookieKey = request.cookies.get('fleet_access')?.value;
  
  const validKey = 'phoenix-fleet-2847';
  const expectedHeaderKey = process.env.FLEET_API_KEY;

  console.log(`[FLEET API] ${request.method} ${request.nextUrl.pathname}`, {
    hasUrlKey: !!urlKey,
    hasHeaderKey: !!headerKey,
    hasCookie: !!cookieKey,
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    timestamp: new Date().toISOString()
  });

  // ✅ Allow if URL has correct key (your old method)
  if (urlKey === validKey) {
    console.log(`[FLEET API] ✅ ALLOWED with URL key`);
    return NextResponse.next();
  }

  // ✅ Allow if has valid cookie (from layout authentication)
  if (cookieKey === validKey) {
    console.log(`[FLEET API] ✅ ALLOWED with cookie`);
    return NextResponse.next();
  }

  // ✅ Allow if has valid header key (external API access)
  if (headerKey && headerKey === expectedHeaderKey) {
    console.log(`[FLEET API] ✅ ALLOWED with header key`);
    return NextResponse.next();
  }

  // ❌ Block if no valid authentication
  console.warn(`[FLEET API] 🚫 BLOCKED unauthorized access to ${request.nextUrl.pathname}`);
  
  return NextResponse.json(
    { 
      error: 'Unauthorized',
      message: 'Valid authentication required',
      timestamp: new Date().toISOString()
    },
    { status: 403 }
  );
}

// Apply to all /fleet/api/* routes
export const config = {
  matcher: '/fleet/api/:path*',
};
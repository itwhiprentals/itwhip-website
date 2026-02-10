/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Allow phones on local network to access dev server (for VIN scanning)
  allowedDevOrigins: ['10.165.1.231'],

  // Exclude geoip-lite from webpack bundling (use native Node.js require)
  serverExternalPackages: ['geoip-lite'],

  // Ensure WASM binaries are included in Vercel serverless function bundles
  outputFileTracingIncludes: {
    '/api/bookings/verify-dl': ['./node_modules/zxing-wasm/dist/reader/zxing_reader.wasm'],
  },

  // Performance optimizations
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles

  images: {
    // Image optimization
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ]
  },
  async redirects() {
    return [
      // ============================================
      // Helpful redirects
      // ============================================
      { source: '/help', destination: '/support', permanent: true },
      { source: '/sitemap', destination: '/sitemap.xml', permanent: true },
      { source: '/api', destination: '/', permanent: false },

      // ============================================
      // REMOVED/OLD PAGES - Redirect to prevent 404/500
      // ============================================
      { source: '/driver-portal', destination: '/drive', permanent: true },
      { source: '/driver-agreement', destination: '/terms', permanent: true },
      { source: '/cars', destination: '/rentals', permanent: true },
      { source: '/cars/:path*', destination: '/rentals', permanent: true },

      // ============================================
      // LEGACY B2B PAGES - Redirect to P2P equivalents
      // ============================================
      { source: '/hotel-solutions', destination: '/rentals', permanent: true },
      { source: '/gds', destination: '/integrations', permanent: true },

      // ============================================
      // RENAMED PAGES - Point to new locations
      // ============================================
      { source: '/insurance', destination: '/insurance-guide', permanent: true },
      { source: '/itwhip-vs-turo', destination: '/switch-from-turo', permanent: true },

      // ============================================
      // HOST/DEMO PAGES - Redirect to relevant pages
      // ============================================
      { source: '/host-demo', destination: '/host/signup', permanent: true },
      { source: '/schedule-demo', destination: '/contact', permanent: true },
      { source: '/schedule-call', destination: '/contact', permanent: true },

      // ============================================
      // AUTH PAGES - Redirect legacy URLs to new auth paths
      // ============================================
      { source: '/forgot-password', destination: '/auth/forgot-password', permanent: true },
      { source: '/reset-password', destination: '/auth/reset-password', permanent: true },
      { source: '/login', destination: '/auth/login', permanent: true },
      { source: '/signup', destination: '/auth/signup', permanent: true },

      // ============================================
      // Arizona City Hubs
      // ============================================
      { source: '/phoenix', destination: '/rentals/cities/phoenix', permanent: true },
      { source: '/scottsdale', destination: '/rentals/cities/scottsdale', permanent: true },
      { source: '/tempe', destination: '/rentals/cities/tempe', permanent: true },
      { source: '/mesa', destination: '/rentals/cities/mesa', permanent: true },
      { source: '/chandler', destination: '/rentals/cities/chandler', permanent: true },
      { source: '/gilbert', destination: '/rentals/cities/gilbert', permanent: true },
      { source: '/glendale', destination: '/rentals/cities/glendale', permanent: true },
      { source: '/peoria', destination: '/rentals/cities/peoria', permanent: true },
      { source: '/paradise-valley', destination: '/rentals/cities/paradise-valley', permanent: true },
      { source: '/tucson', destination: '/rentals/cities/tucson', permanent: true },
      { source: '/flagstaff', destination: '/rentals/cities/flagstaff', permanent: true },
    ]
  }
};

export default nextConfig;

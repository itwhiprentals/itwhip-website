/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
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

      // ============================================
      // REMOVED/OLD PAGES - Redirect to prevent 404/500
      // ============================================
      { source: '/driver-portal', destination: '/drive', permanent: true },
      { source: '/driver-agreement', destination: '/terms', permanent: true },

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
      // AUTH PAGES
      // ============================================
      { source: '/forgot-password', destination: '/auth/login', permanent: false },

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

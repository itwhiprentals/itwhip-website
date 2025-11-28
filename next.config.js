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
      // REMOVED/OLD PAGES - Redirect to prevent 404/500
      // ============================================
      { source: '/driver-portal', destination: '/', permanent: true },
      
      // ============================================
      // Arizona City Hubs
      // ============================================
      { source: '/phoenix', destination: '/rentals/cities/Phoenix', permanent: true },
      { source: '/scottsdale', destination: '/rentals/cities/Scottsdale', permanent: true },
      { source: '/tempe', destination: '/rentals/cities/Tempe', permanent: true },
      { source: '/mesa', destination: '/rentals/cities/Mesa', permanent: true },
      { source: '/chandler', destination: '/rentals/cities/Chandler', permanent: true },
      { source: '/gilbert', destination: '/rentals/cities/Gilbert', permanent: true },
      { source: '/glendale', destination: '/rentals/cities/Glendale', permanent: true },
      { source: '/peoria', destination: '/rentals/cities/Peoria', permanent: true },
      { source: '/paradise-valley', destination: '/rentals/cities/Paradise%20Valley', permanent: true },
      { source: '/tucson', destination: '/rentals/cities/Tucson', permanent: true },
      { source: '/flagstaff', destination: '/rentals/cities/Flagstaff', permanent: true },
    ]
  }
}

module.exports = nextConfig
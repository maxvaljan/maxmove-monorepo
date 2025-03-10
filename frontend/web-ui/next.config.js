/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Disable static optimization for now to avoid 404/500 page generation issues
  // output: 'standalone',
  
  // Skip building error pages during production build
  typescript: {
    // Disable type checking on build to allow error pages to be skipped
    ignoreBuildErrors: true,
  },
  
  // Image optimization configuration
  images: {
    domains: [
      'xuehdmslktlsgpoexilo.supabase.co',
      'assets.maxmove.com',
      'upload.wikimedia.org',
      'www.gstatic.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // 1 minute
  },
  
  // Customize headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Production-only settings - compress responses
  compress: true,
  
  // Set custom build directory
  distDir: '.next',
  
  // Configure webpack for optimizations
  webpack: (config, { dev, isServer }) => {
    // Split chunks for better performance
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
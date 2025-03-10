require('dotenv').config();

const config = {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL || 'https://xuehdmslktlsgpoexilo.supabase.co',
    key: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZWhkbXNsa3Rsc2dwb2V4aWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDA4ODIsImV4cCI6MjA1MTkxNjg4Mn0.YRsqqW8G-S3UvIrfXblDSqAlTE6fk7QCy1BSNVIgIe0',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // Google Maps configuration
  maps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
  },
  
  // Stripe configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

module.exports = config;
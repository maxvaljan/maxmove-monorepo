# Deployment Guide for MaxMove Next.js Frontend

This guide outlines the steps to deploy the Next.js frontend for MaxMove.

## Prerequisites

- Node.js 18.x or later
- Access to the MaxMove infrastructure
- Access to the production environment variables

## Environment Variables

The following environment variables must be set:

```
NEXT_PUBLIC_API_URL=https://api.maxmove.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

1. Build the Docker image:
   ```bash
   docker build -t maxmove-frontend:latest .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env.production maxmove-frontend:latest
   ```

3. For production deployment with Docker Compose:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Option 2: Vercel Deployment

1. Connect the GitHub repository to Vercel
2. Configure the environment variables in the Vercel dashboard
3. Deploy using the Vercel dashboard or CLI:
   ```bash
   vercel --prod
   ```

### Option 3: Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Post-Deployment Verification

After deployment, verify that the following features work correctly:

1. User authentication (sign-up, sign-in, sign-out)
2. Order creation and tracking
3. Vehicle selection
4. Admin dashboard
5. API integrations

## Rollback Procedure

If issues are encountered with the new Next.js frontend, roll back to the previous Vite version using the following steps:

1. Switch DNS or load balancer to point to the previous Vite frontend
2. Verify that the old version is working correctly
3. Document issues encountered for investigation

## Monitoring

Monitor the performance and error rates after deployment using:

1. Sentry for error monitoring
2. Vercel Analytics or custom analytics for performance metrics
3. Server logs for backend issues

## Notes

- The first deployment may take longer due to initial build optimizations
- API routes need to be properly configured for the production environment
- Check Supabase permissions and API keys after deployment
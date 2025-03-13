# Optimized Dockerfile for Next.js production deployment
# This uses a pre-built Next.js app for faster Docker builds
# Run 'npm run build' locally first, then 'docker build'

# Build stage 
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and pre-built app
COPY package.json ./
COPY .next ./.next
COPY public ./public
COPY next.config.js ./

# Fix potential JSON formatting issues
RUN cat package.json | tr -d '\r' > package.json.tmp && mv package.json.tmp package.json

# Install only production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built application from build stage
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.js ./

# Expose port
EXPOSE 3000

# Set non-root user for better security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Runtime environment variables
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create startup script
RUN echo '#!/bin/sh\n\
echo "Starting Next.js application..."\n\
echo "Using Node.js $(node -v)"\n\
exec npx next start\n\
' > /app/start.sh && chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]
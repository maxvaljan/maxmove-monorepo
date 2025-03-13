# MaxMove Next.js Web UI

This is the Next.js implementation of the MaxMove web interface. It replaces the previous Vite implementation with a modern, server-rendered architecture.

## Docker Deployment

We've added an optimized Docker deployment solution for this application. 

### Building the Docker Image

```bash
# Make the script executable (if not already)
chmod +x scripts/docker-build.sh

# Run the Docker build script
./scripts/docker-build.sh
```

This script:
1. Sets up environment variables
2. Cleans previous build artifacts
3. Installs dependencies
4. Builds the Next.js application locally first
5. Creates an optimized Docker image using the pre-built assets
6. Tags the image with the version from package.json

### Running the Docker Container

```bash
# Run the Docker container
docker run -p 3000:3000 maxmove-web-ui:latest
```

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- A Supabase account and project (for authentication and database)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/maxmove-monorepo.git
   cd maxmove-monorepo/frontend/web-ui-next
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual values.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Features

- 🚀 Next.js 15.x with App Router
- 🔐 Authentication with Supabase Auth
- 🗃️ Database integration with Supabase
- 🎨 Styling with Tailwind CSS
- 🧩 UI components with shadcn/ui
- 📱 Fully responsive design
- 🗺️ Maps integration
- 💳 Wallet and payment system
- 📦 Order management

## Project Structure

- `src/app/` - App Router pages and layouts
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions and services
- `src/hooks/` - Custom React hooks
- `public/` - Static assets

## Development

### Key Commands

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run typecheck` - Run TypeScript to check types

### Code Style

This project follows the code style defined in the MaxMove organization:
- TypeScript for all code
- Strong typing with interfaces
- React functional components with hooks
- Tailwind CSS for styling
- API calls through centralized services

## Testing

### Current Status

The application is currently fully functional in development mode. See `TEST_RESULTS.md` for detailed testing status.

### Known Issues

- There are build issues with error pages (404/500) in production mode
- See `MIGRATION_NOTES.md` for more detailed information on migration status

## Deployment

### Current Deployment Status

The application is fully functional in development mode. See `PRODUCTION_BUILD.md` for information on current production build issues and workarounds.

### Quick Deployment (Development Mode)

For a quick deployment using Docker in development mode:

```bash
# Make the script executable
chmod +x scripts/start-dev-container.sh

# Run the deployment script
./scripts/start-dev-container.sh
```

### Production Deployment

See `DEPLOYMENT.md` for detailed production deployment instructions once the build issues are resolved.

## Replacing Vite with Next.js

This Next.js implementation is ready to replace the existing Vite implementation. We've provided scripts to make this transition smooth:

```bash
# From the monorepo root:
./temp-repo/frontend/web-ui-next/scripts/replace-vite-with-next.sh
```

The script will:
1. Back up the existing Vite implementation
2. Remove the Vite files
3. Copy the Next.js implementation to the target directory
4. Update references in root package.json

See `scripts/README.md` for more detailed information about the migration process.

## License

This project is proprietary and confidential.

## Contributors

- MaxMove Engineering Team
# MaxMove Monorepo Guide

## Build/Run Commands
- Root: `npm run dev` (runs backend + web-ui)
- Backend: `cd backend && npm run dev`
- Web UI: `cd frontend/web-ui && npm run dev`
- Web UI (Next.js): `cd frontend/web-ui-next && npm run dev`
- Customer UI (Expo): `cd frontend/customer-ui && npm run dev`
- Driver UI (Expo): `cd frontend/driver-ui && npm run dev`

## Test/Lint Commands
- Backend tests: `cd backend && npm test`
- Backend single test: `cd backend && npx jest path/to/test.js`
- Backend lint: `cd backend && npm run lint`
- Web UI lint: `cd frontend/web-ui && npm run lint`
- Web UI (Next.js) lint: `cd frontend/web-ui-next && npm run lint`
- Mobile UIs lint: `cd frontend/{customer|driver}-ui && npm run lint`

## Docker Commands
- Build: `npm run docker:build`
- Start: `npm run docker:up`
- Stop: `npm run docker:down`

## Code Style Guidelines
- TypeScript for all frontend code
- Strong typing with explicit interfaces
- React components use PascalCase (VehicleCard.tsx)
- Hooks use camelCase (useFrameworkReady.ts)
- Tailwind CSS for styling (web UIs)
- Use React Query for API data fetching
- Error handling with try/catch in async functions
- Prefer functional components with hooks over class components
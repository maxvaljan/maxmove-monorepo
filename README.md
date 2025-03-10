# MaxMove Monorepo

MaxMove is a logistics platform tailored for the German market, connecting customers, drivers, and businesses for efficient delivery services.

## Project Structure

```
maxmove-monorepo/
├── backend/           # Node.js/Express.js server with Supabase integration
│   ├── src/           # Source code
│   │   ├── controllers/   # Request handlers 
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Core services (Supabase, etc.)
│   │   └── utils/         # Helper functions
├── frontend/
│   ├── web-ui/        # React web dashboards for customers, drivers, businesses, and admins
│   ├── customer-ui/   # React Native customer mobile app
│   └── driver-ui/     # React Native driver mobile app
├── shared/            # Shared utilities, types, and constants
├── docker-compose.yml # Docker configuration
├── package.json       # Root config with workspaces
└── README.md
```

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database & Authentication**: Supabase (PostgreSQL with PostGIS for geospatial data)
- **Real-time Features**: Supabase real-time
- **Payment Integration**: Stripe
- **Mapping**: Mapbox for web, Google Maps for mobile
- **Frontend Web**: React, TypeScript, Vite, ShadCN UI
- **Frontend Mobile**: React Native, Expo
- **Deployment**: Docker on AWS

## API Overview

The MaxMove API provides endpoints for the following functionality:

- **Authentication**: Login, registration, and profile management
- **Orders**: Create, retrieve, update, and cancel delivery orders
- **Vehicles**: Manage vehicle types and characteristics
- **Users**: Profile management, wallet management
- **Payments**: Process payments via Stripe (coming soon)
- **Drivers**: Driver management and tracking (coming soon)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- Supabase account
- Mapbox API key (for web)
- Google Maps API key (for mobile)
- Stripe account (for payments)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/maxmove-monorepo.git
   cd maxmove-monorepo
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory based on `.env.example`
   - Fill in the required environment variables

4. Start the development servers:
   ```
   # All services
   npm run dev
   
   # Or start individually:
   
   # Backend
   npm run dev:backend

   # Web UI
   npm run dev:web

   # Customer UI
   npm run dev:customer

   # Driver UI
   npm run dev:driver
   ```

### Docker Deployment

To deploy using Docker:

```
npm run docker:build
npm run docker:up
```

## Frontend Apps

### Web UI (web-ui)
- Customer dashboard for placing orders
- Driver dashboard for accepting and managing deliveries
- Business dashboard for managing corporate accounts
- Admin dashboard for system management

### Customer Mobile App (customer-ui)
- Place and track orders
- Manage payment methods
- View order history
- Real-time tracking

### Driver Mobile App (driver-ui)
- Accept delivery requests
- Navigation assistance
- Update delivery status
- Manage earnings

## Backend API

### Authentication Endpoints
- POST `/api/auth/login` - Login with email/password
- POST `/api/auth/register` - Register new user
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/profile` - Get authenticated user's profile

### Order Endpoints
- GET `/api/orders` - Get all orders (admin only)
- GET `/api/orders/:id` - Get order by ID
- GET `/api/orders/customer/me` - Get current customer's orders
- GET `/api/orders/driver/me` - Get current driver's orders
- POST `/api/orders` - Create a new order
- PATCH `/api/orders/:id/status` - Update order status
- POST `/api/orders/:orderId/assign` - Assign driver to order
- DELETE `/api/orders/:id` - Cancel an order

### Vehicle Endpoints
- GET `/api/vehicles/types` - Get all vehicle types
- GET `/api/vehicles/types/:id` - Get vehicle type by ID
- POST `/api/vehicles/types` - Create a new vehicle type (admin only)
- PUT `/api/vehicles/types/:id` - Update a vehicle type (admin only)
- DELETE `/api/vehicles/types/:id` - Delete a vehicle type (admin only)

### User Endpoints
- GET `/api/users/me` - Get current user profile
- PUT `/api/users/me` - Update current user profile
- GET `/api/users/wallet` - Get user wallet information
- GET `/api/users/payment-methods` - Get user payment methods

## Contributing

1. Create a new branch for your feature/bugfix
2. Make your changes
3. Submit a pull request


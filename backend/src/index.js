const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFoundHandler');
const config = require('./config');

// Route imports (only import what we've created so far)
const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const userRoutes = require('./routes/user.routes');
const driverRoutes = require('./routes/driver.routes');
const configRoutes = require('./routes/config.routes');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(morgan(config.environment === 'production' ? 'combined' : 'dev')); // Request logging
// Configure CORS for production
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS ? 
    process.env.CORS_ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:8000'],
  credentials: true // Important for cookies
}));
app.use(express.json({ limit: '1mb' })); // JSON parsing with size limit

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    environment: config.environment,
    message: 'MaxMove API is running'
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Welcome to MaxMove API',
    version: '0.1.0',
    documentation: '/api-docs' // For future Swagger/OpenAPI documentation
  });
});

// API routes - only mount the ones we've implemented
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/api-keys', configRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`MaxMove API running on port ${PORT} in ${config.environment} mode`);
  console.log(`Using Supabase project: ${config.supabase.url}`);
});

module.exports = app; // For testing
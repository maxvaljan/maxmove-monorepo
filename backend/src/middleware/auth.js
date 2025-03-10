const { ApiError } = require('./errorHandler');
const supabaseService = require('../services/database/supabase.service');

/**
 * Middleware to verify authentication
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get auth header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized - No token provided');
    }
    
    const token = authHeader.split(' ')[1];
    
    // Use Supabase to verify the JWT
    const { data, error } = await supabaseService.getUser(token);
    
    if (error || !data.user) {
      throw new ApiError(401, 'Unauthorized - Invalid token');
    }
    
    const user = data.user;
    
    // Fetch user profile information
    const profile = await supabaseService.getUserProfile(user.id);
    
    if (!profile) {
      throw new ApiError(401, 'Unauthorized - User profile not found');
    }
    
    // Set user info in request
    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      name: profile.name,
      phone: profile.phone_number
    };
    
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, 'Authentication error'));
    }
  }
};

/**
 * Middleware to check user role
 * @param {Array<string>} roles - Allowed roles
 */
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized - User not authenticated'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden - Insufficient permissions'));
    }
    
    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware
};
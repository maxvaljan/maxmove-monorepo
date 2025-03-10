const supabaseService = require('../services/database/supabase.service');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Auth Controller
 * Handles all authentication-related operations
 */
const authController = {
  /**
   * Login with email and password
   */
  login: async (req, res, next) => {
    try {
      const { email, password, phone } = req.body;
      
      if (!email && !phone) {
        throw new ApiError(400, "Email or phone is required");
      }
      
      if (!password) {
        throw new ApiError(400, "Password is required");
      }
      
      const credentials = email 
        ? { email, password } 
        : { phone, password };
      
      const { data, error } = await supabaseService.signIn(credentials);
      
      if (error) {
        throw new ApiError(401, error.message);
      }
      
      if (!data.user) {
        throw new ApiError(401, "Invalid login credentials");
      }
      
      // Get user profile
      const profile = await supabaseService.getUserProfile(data.user.id);
      
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            role: profile?.role || 'customer',
            name: profile?.name,
            phone: profile?.phone_number
          },
          session: data.session,
          token: data.session.access_token,
          refreshToken: data.session.refresh_token
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Register new user
   */
  register: async (req, res, next) => {
    try {
      const { email, password, name, phone_number, role = 'customer' } = req.body;
      
      if (!email) {
        throw new ApiError(400, "Email is required");
      }
      
      if (!password) {
        throw new ApiError(400, "Password is required");
      }
      
      // Register with Supabase Auth
      const { data, error } = await supabaseService.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone_number
          }
        }
      });
      
      if (error) {
        throw new ApiError(400, error.message);
      }
      
      // At this point, the user is created but may need email verification
      // depending on your Supabase settings
      
      // Create a profile entry if needed
      // You may want to check your Supabase triggers as this might already be happening
      // automatically via Supabase Auth hooks
      
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            role,
            name,
            phone: phone_number
          },
          message: data.session ? "Registration successful" : "Verification email sent",
          session: data.session,
          token: data.session?.access_token,
          refreshToken: data.session?.refresh_token
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Logout user
   */
  logout: async (req, res, next) => {
    try {
      const { error } = await supabaseService.signOut();
      
      if (error) {
        throw new ApiError(500, error.message);
      }
      
      res.status(200).json({
        success: true,
        message: "Logout successful"
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get authenticated user profile
   */
  getProfile: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
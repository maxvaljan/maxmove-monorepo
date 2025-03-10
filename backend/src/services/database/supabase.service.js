const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');
const { logger } = require('../../middleware/errorHandler');

// The same Supabase URL and key used in frontend
const SUPABASE_URL = "https://xuehdmslktlsgpoexilo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZWhkbXNsa3Rsc2dwb2V4aWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDA4ODIsImV4cCI6MjA1MTkxNjg4Mn0.YRsqqW8G-S3UvIrfXblDSqAlTE6fk7QCy1BSNVIgIe0";

/**
 * Singleton Supabase client service
 * This is the central point for all Supabase database interactions
 */
class SupabaseService {
  constructor() {
    if (SupabaseService.instance) {
      return SupabaseService.instance;
    }
    
    // Use the same credentials as frontend for consistency
    this.client = createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );
    
    // Use service role client when available (for admin operations)
    // This will be configured later for operations that need elevated privileges
    if (config.supabase.serviceRoleKey) {
      this.adminClient = createClient(
        SUPABASE_URL,
        config.supabase.serviceRoleKey
      );
    }
    
    SupabaseService.instance = this;
  }
  
  /**
   * Get the standard Supabase client (with anon key)
   */
  getClient() {
    return this.client;
  }
  
  /**
   * Get the admin Supabase client (with service role key)
   * Will throw error if not available
   */
  getAdminClient() {
    if (!this.adminClient) {
      throw new Error('Admin client not available - service role key not configured');
    }
    return this.adminClient;
  }
  
  /**
   * Helper method to handle Supabase errors consistently
   */
  handleError(error, operation) {
    logger.error({
      message: `Supabase ${operation} operation failed`,
      error: error.message,
      details: error.details,
      code: error.code
    });
    throw error;
  }

  // Authentication services
  async signIn(credentials) {
    try {
      return await this.client.auth.signInWithPassword(credentials);
    } catch (error) {
      this.handleError(error, 'signIn');
    }
  }

  async signUp(credentials) {
    try {
      return await this.client.auth.signUp(credentials);
    } catch (error) {
      this.handleError(error, 'signUp');
    }
  }

  async signOut() {
    try {
      return await this.client.auth.signOut();
    } catch (error) {
      this.handleError(error, 'signOut');
    }
  }

  async getUser(jwt) {
    try {
      return await this.client.auth.getUser(jwt);
    } catch (error) {
      this.handleError(error, 'getUser');
    }
  }

  // Database services

  /**
   * Get a user profile by ID
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'getUserProfile');
    }
  }

  /**
   * Get an order by ID
   */
  async getOrderById(id) {
    try {
      const { data, error } = await this.client
        .from('Order')
        .select(`
          *,
          Driver(*),
          vehicle_types(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, `getOrderById(${id})`);
    }
  }

  /**
   * Get orders with filtering
   */
  async getOrders(filter = {}, options = {}) {
    try {
      let query = this.client
        .from('Order')
        .select(`
          *,
          Driver(*),
          vehicle_types(*)
        `);
      
      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      // Apply sorting
      if (options.orderBy) {
        const { column, ascending = true } = options.orderBy;
        query = query.order(column, { ascending });
      } else {
        // Default sort by created_at
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'getOrders');
    }
  }

  /**
   * Create a new order
   */
  async createOrder(orderData) {
    try {
      const { data, error } = await this.client
        .from('Order')
        .insert([orderData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'createOrder');
    }
  }

  /**
   * Update an order
   */
  async updateOrder(id, data) {
    try {
      const { data: order, error } = await this.client
        .from('Order')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return order;
    } catch (error) {
      this.handleError(error, `updateOrder(${id})`);
    }
  }

  /**
   * Get all vehicle types
   */
  async getVehicleTypes() {
    try {
      const { data, error } = await this.client
        .from('vehicle_types')
        .select('*');
      
      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'getVehicleTypes');
    }
  }

  /**
   * Get wallet info for a user
   */
  async getWallet(userId) {
    try {
      const { data, error } = await this.client
        .from('wallet')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'getWallet');
    }
  }

  /**
   * Get transaction history for a user
   */
  async getTransactions(userId, limit = 10) {
    try {
      const { data, error } = await this.client
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'getTransactions');
    }
  }

  /**
   * Get API key by name (e.g., for maps)
   */
  async getApiKey(keyName) {
    try {
      const { data, error } = await this.client
        .from('api_keys')
        .select('key_value')
        .eq('key_name', keyName)
        .single();

      if (error) throw error;
      return data?.key_value;
    } catch (error) {
      this.handleError(error, `getApiKey(${keyName})`);
    }
  }
}

module.exports = new SupabaseService();
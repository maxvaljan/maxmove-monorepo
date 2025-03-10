// API Service for the driver mobile app
// This file handles all API requests to our backend

import * as SecureStore from 'expo-secure-store';

// Base URL for API requests - use .env in a real app
const API_URL = 'http://localhost:3000/api';

// Helper function to get the auth token
const getToken = async () => {
  return await SecureStore.getItemAsync('auth_token');
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await getToken();
    
    // Set headers with authorization if token exists
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Handle 401 Unauthorized by clearing token
    if (response.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    
    return data;
  } catch (error) {
    console.error(`API Request Error: ${endpoint}`, error);
    throw error;
  }
};

// Authentication
export const authAPI = {
  login: async (credentials: { email?: string; phone?: string; password: string }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  
  register: async (userData: { email: string; password: string; name?: string; phone_number?: string }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  logout: async () => {
    const result = await apiRequest('/auth/logout', {
      method: 'POST'
    });
    await SecureStore.deleteItemAsync('auth_token');
    return result;
  },
  
  getProfile: async () => {
    return apiRequest('/users/me');
  }
};

// Driver operations
export const driverAPI = {
  // Update location and optionally status
  updateLocation: async (data: { latitude: number; longitude: number; status?: string }) => {
    return apiRequest('/drivers/location', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  // Update driver status only
  updateStatus: async (status: string) => {
    return apiRequest('/drivers/status', {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  },
  
  // Get driver earnings
  getEarnings: async (startDate?: string, endDate?: string, limit: number = 10) => {
    let endpoint = '/drivers/earnings?';
    if (startDate) endpoint += `&start_date=${startDate}`;
    if (endDate) endpoint += `&end_date=${endDate}`;
    if (limit) endpoint += `&limit=${limit}`;
    
    return apiRequest(endpoint);
  }
};

// Orders
export const orderAPI = {
  // Get orders assigned to current driver
  getOrders: async () => {
    return apiRequest('/orders/driver/me');
  },
  
  // Get order by ID
  getOrderById: async (id: string) => {
    return apiRequest(`/orders/${id}`);
  },
  
  // Update order status
  updateOrderStatus: async (id: string, status: string) => {
    return apiRequest(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};

// Wallet & Payment Methods
export const paymentAPI = {
  getWallet: async () => {
    return apiRequest('/users/wallet');
  }
};

export default {
  auth: authAPI,
  driver: driverAPI,
  orders: orderAPI,
  payment: paymentAPI
};
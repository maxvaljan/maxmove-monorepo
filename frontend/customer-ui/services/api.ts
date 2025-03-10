// API Service for the customer mobile app
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

// Orders
export const orderAPI = {
  getOrders: async () => {
    return apiRequest('/orders/customer/me');
  },
  
  getOrderById: async (id: string) => {
    return apiRequest(`/orders/${id}`);
  },
  
  createOrder: async (orderData: {
    pickup_address: string;
    dropoff_address: string;
    vehicle_type_id: string;
    payment_method?: string;
    contact_name?: string;
    contact_phone?: string;
    items?: any[];
  }) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  
  cancelOrder: async (id: string) => {
    return apiRequest(`/orders/${id}`, {
      method: 'DELETE'
    });
  }
};

// Vehicles
export const vehicleAPI = {
  getVehicleTypes: async () => {
    return apiRequest('/vehicles/types');
  },
  
  getVehicleById: async (id: string) => {
    return apiRequest(`/vehicles/types/${id}`);
  }
};

// Wallet & Payment Methods
export const paymentAPI = {
  getWallet: async () => {
    return apiRequest('/users/wallet');
  },
  
  getPaymentMethods: async () => {
    return apiRequest('/users/payment-methods');
  }
};

// Drivers
export const driverAPI = {
  getNearbyDrivers: async (latitude: number, longitude: number, radius: number = 5) => {
    return apiRequest(`/drivers/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  }
};

export default {
  auth: authAPI,
  orders: orderAPI,
  vehicles: vehicleAPI,
  payment: paymentAPI,
  drivers: driverAPI
};
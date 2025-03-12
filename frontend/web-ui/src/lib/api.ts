// For Next.js we should use relative URLs in the browser since API routes are served from the same domain
// The environment variable will be used for server-side API calls to the backend if needed
const API_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || '') 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const apiClient = {
  async get<T>(endpoint: string, authToken?: string): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        // Check for specific status codes
        if (response.status === 401) {
          return {
            success: false,
            error: 'Unauthorized. Please sign in again.',
          };
        }
        
        if (response.status === 403) {
          return {
            success: false,
            error: 'Access denied. You do not have permission to access this resource.',
          };
        }
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async post<T>(endpoint: string, body: any, authToken?: string): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // Check for specific status codes
        if (response.status === 401) {
          return {
            success: false,
            error: 'Unauthorized. Please sign in again.',
          };
        }
        
        if (response.status === 403) {
          return {
            success: false,
            error: 'Access denied. You do not have permission to access this resource.',
          };
        }
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
  
  async put<T>(endpoint: string, body: any, authToken?: string): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            error: response.status === 401 ? 'Unauthorized. Please sign in again.' : 'Access denied.',
          };
        }
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
  
  async delete<T>(endpoint: string, authToken?: string): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            error: response.status === 401 ? 'Unauthorized. Please sign in again.' : 'Access denied.',
          };
        }
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async getApiKey(keyName: string): Promise<string | null> {
    try {
      const response = await this.get<{ key_name: string; key_value: string }>(`/api/api-keys/${keyName}`);
      
      if (response.success && response.data) {
        return response.data.key_value;
      }
      
      throw new Error(response.error || 'Failed to get API key');
    } catch (error) {
      console.error(`Error fetching ${keyName} API key:`, error);
      return null;
    }
  },
  
  // Helper method to get authenticated token
  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },
  
  // Authentication-specific API methods
  auth: {
    async login(credentials: { email?: string; phone?: string; password: string }) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Platform': 'web'
          },
          body: JSON.stringify(credentials),
          credentials: 'include' // Important for cookies
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Authentication failed');
        }
        
        const data = await response.json();
        
        if (data.success && data.data.token) {
          // Store token in localStorage for client-side access
          localStorage.setItem('auth_token', data.data.token);
          localStorage.setItem('auth_refresh_token', data.data.refreshToken);
          
          // Also store expiry for auto-refresh logic
          if (data.data.expires) {
            localStorage.setItem('auth_expires_at', data.data.expires.at.toString());
            localStorage.setItem('auth_expires_in', data.data.expires.in.toString());
          }
          
          // Store basic user info for quick access
          if (data.data.user) {
            localStorage.setItem('user_id', data.data.user.id);
            localStorage.setItem('user_role', data.data.user.role);
          }
        }
        
        return data;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    async register(userData: { 
      email: string; 
      password: string; 
      name?: string; 
      phone_number?: string;
      role?: string;
    }) {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Platform': 'web'
          },
          body: JSON.stringify(userData),
          credentials: 'include' // Important for cookies
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }
        
        const data = await response.json();
        
        // If we got a token (email verification not required), store it
        if (data.success && data.data.token) {
          localStorage.setItem('auth_token', data.data.token);
          localStorage.setItem('auth_refresh_token', data.data.refreshToken);
          
          if (data.data.expires) {
            localStorage.setItem('auth_expires_at', data.data.expires.at.toString());
            localStorage.setItem('auth_expires_in', data.data.expires.in.toString());
          }
          
          if (data.data.user) {
            localStorage.setItem('user_id', data.data.user.id);
            localStorage.setItem('user_role', data.data.user.role);
          }
        }
        
        return data;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    
    async logout() {
      try {
        // Get refresh token to send to server
        const refreshToken = localStorage.getItem('auth_refresh_token');
        
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Platform': 'web'
          },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include' // Important for cookies
        });
        
        // Clear local storage tokens regardless of server response
        this.clearAuthData();
        
        // Force a hard reload if we're dealing with cookies
        if (response.headers.get('X-Auth-Logout') === 'true') {
          if (typeof window !== 'undefined') {
            window.location.href = '/signin?ts=' + new Date().getTime();
            return { success: true };
          }
        }
        
        return response.ok 
          ? { success: true } 
          : { success: false, error: 'Logout failed on server' };
      } catch (error) {
        console.error('Logout error:', error);
        
        // Still clear local data even if server request fails
        this.clearAuthData();
        
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },
    
    async refreshToken() {
      try {
        const refreshToken = localStorage.getItem('auth_refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Platform': 'web'
          },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include' // Important for cookies
        });
        
        if (!response.ok) {
          // Clear auth data if refresh fails
          this.clearAuthData();
          throw new Error('Token refresh failed');
        }
        
        const data = await response.json();
        
        if (data.success && data.data.token) {
          localStorage.setItem('auth_token', data.data.token);
          localStorage.setItem('auth_refresh_token', data.data.refreshToken);
          
          if (data.data.expires) {
            localStorage.setItem('auth_expires_at', data.data.expires.at.toString());
            localStorage.setItem('auth_expires_in', data.data.expires.in.toString());
          }
        }
        
        return data;
      } catch (error) {
        console.error('Token refresh error:', error);
        this.clearAuthData();
        throw error;
      }
    },
    
    async verifySession() {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          return { success: false, isAuthenticated: false };
        }
        
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Platform': 'web'
          },
          credentials: 'include' // Important for cookies
        });
        
        // If the server says our token is invalid, clear it
        if (response.headers.get('X-Auth-Invalid') === 'true') {
          this.clearAuthData();
          return { success: false, isAuthenticated: false };
        }
        
        if (!response.ok) {
          this.clearAuthData();
          return { success: false, isAuthenticated: false };
        }
        
        const data = await response.json();
        return {
          success: true,
          isAuthenticated: true,
          user: data.data.user
        };
      } catch (error) {
        console.error('Session verification error:', error);
        return { success: false, isAuthenticated: false };
      }
    },
    
    clearAuthData() {
      if (typeof window !== 'undefined') {
        // Clear all auth-related data from localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_expires_at');
        localStorage.removeItem('auth_expires_in');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_role');
        
        // Also clear any items that might be related to Supabase
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.startsWith('supabase.') || 
            key.includes('auth') || 
            key.includes('token')
          )) {
            localStorage.removeItem(key);
          }
        }
      }
    },
    
    isAuthenticated(): boolean {
      if (typeof window === 'undefined') return false;
      
      const token = localStorage.getItem('auth_token');
      if (!token) return false;
      
      // Check expiry if available
      const expiresAt = localStorage.getItem('auth_expires_at');
      if (expiresAt) {
        const expiryTime = parseInt(expiresAt, 10) * 1000; // Convert to milliseconds
        if (Date.now() >= expiryTime) {
          // Token has expired, try to refresh if we have a refresh token
          this.refreshToken().catch(() => {
            this.clearAuthData();
          });
          return false;
        }
      }
      
      return true;
    },
    
    getUserRole(): string | null {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('user_role');
    }
  }
};
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
  }
};
import { AuthResponse, LoginCredentials, RegisterData } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://klick-jet-api.vercel.app';

class ApiError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new ApiError('Invalid response from server', response.status);
  }
  
  if (!response.ok) {
    throw new ApiError(
      data.message || data.error || 'An error occurred',
      response.status
    );
  }
  
  return data;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        mode: 'cors',
        credentials: 'omit',
      });
      
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Unable to connect to server. Please check your internet connection.',
        0
      );
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'omit',
      });
      
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Unable to connect to server. Please check your internet connection.',
        0
      );
    }
  },

  async getMe(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      return handleResponse<AuthResponse>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Unable to connect to server. Please check your internet connection.',
        0
      );
    }
  },

  async logout(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      return handleResponse<{ success: boolean; message: string }>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Unable to connect to server. Please check your internet connection.',
        0
      );
    }
  },
};

export const adminApi = {
  async getPendingSellers(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/sellers/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; sellers: any[] }>(response);
  },

  async approveSeller(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/sellers/${id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  async rejectSeller(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/sellers/${id}/reject`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  async getPendingDeliverers(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/deliverers/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; deliverers: any[] }>(response);
  },

  async approveDeliverer(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/deliverers/${id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  async rejectDeliverer(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/deliverers/${id}/reject`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },
};

export { ApiError };

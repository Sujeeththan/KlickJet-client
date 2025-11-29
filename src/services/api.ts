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

  async getAllSellers(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/sellers`, {
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

  async rejectSeller(token: string, id: string, rejectionReason: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/sellers/${id}/reject`, {
      method: 'PUT',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rejectionReason }),
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  async deleteSeller(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/sellers/${id}`, {
      method: 'DELETE',
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

  async getAllDeliverers(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/deliverers`, {
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

  async rejectDeliverer(token: string, id: string, rejectionReason: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/deliverers/${id}/reject`, {
      method: 'PUT',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rejectionReason }),
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  async deleteDeliverer(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/deliverers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  async getAllUsers(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; users: any[]; count: number }>(response);
  },

  async deleteUser(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },
};

export const sellerApi = {
  async getSellerProducts(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; products: any[] }>(response);
  },

  async createProduct(token: string, productData: FormData) {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
      },
      body: productData,
    });
    return handleResponse<{ success: boolean; message: string; product: any }>(response);
  },

  async updateProduct(token: string, id: string, productData: FormData) {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: { 
        Authorization: `Bearer ${token}`,
      },
      body: productData,
    });
    return handleResponse<{ success: boolean; message: string; product: any }>(response);
  },

  async deleteProduct(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  async getSellerOrders(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; orders: any[] }>(response);
  },

  async getOrderById(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; order: any }>(response);
  },

  async updateOrderStatus(token: string, id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: 'PUT',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  async getDashboardStats(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/seller/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ 
      success: boolean; 
      stats: {
        totalProducts: number;
        totalOrders: number;
        totalSales: number;
        pendingOrders: number;
      }
    }>(response);
  },
};

export const categoriesApi = {
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    return handleResponse<{ success: boolean; categories: any[] }>(response);
  },
};

export { ApiError };

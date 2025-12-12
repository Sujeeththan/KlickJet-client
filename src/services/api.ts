import apiClient from "@/lib/apiClient";
import { AuthResponse, LoginCredentials, RegisterData } from "@/types/auth";

// --- Auth Service ---
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await apiClient.get<AuthResponse>("/auth/me");
    return response.data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>("/auth/logout");
    return response.data;
  },
};

// --- Admin Service ---
export const adminService = {
  getPendingSellers: async () => {
    const response = await apiClient.get<{ success: boolean; sellers: any[] }>(
      "/admin/sellers/pending"
    );
    return response.data;
  },

  getAllSellers: async () => {
    const response = await apiClient.get<{ success: boolean; sellers: any[] }>(
      "/admin/sellers"
    );
    return response.data;
  },

  approveSeller: async (id: string) => {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `/admin/sellers/${id}/approve`
    );
    return response.data;
  },

  rejectSeller: async (id: string, rejectionReason: string) => {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `/admin/sellers/${id}/reject`,
      { rejectionReason }
    );
    return response.data;
  },

  deleteSeller: async (id: string) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/admin/sellers/${id}`);
    return response.data;
  },

  getPendingDeliverers: async () => {
    const response = await apiClient.get<{
      success: boolean;
      deliverers: any[];
    }>("/admin/deliverers/pending");
    return response.data;
  },

  getAllDeliverers: async () => {
    const response = await apiClient.get<{
      success: boolean;
      deliverers: any[];
    }>("/admin/deliverers");
    return response.data;
  },

  approveDeliverer: async (id: string) => {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `/admin/deliverers/${id}/approve`
    );
    return response.data;
  },

  rejectDeliverer: async (id: string, rejectionReason: string) => {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `/admin/deliverers/${id}/reject`,
      { rejectionReason }
    );
    return response.data;
  },

  deleteDeliverer: async (id: string) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/admin/deliverers/${id}`);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await apiClient.get<{
      success: boolean;
      users: any[];
      count: number;
    }>("/admin/users");
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/users/${id}`);
    return response.data;
  },

  getApprovedSellers: async () => {
    const response = await apiClient.get<{
      success: boolean;
      sellers: any[];
      count: number;
      total: number;
    }>("/sellers/public/approved");
    return response.data;
  },
};

// --- Seller Service ---
export const sellerService = {
  getSellerProducts: async () => {
    const response = await apiClient.get<{ success: boolean; products: any[] }>(
      "/products"
    );
    return response.data;
  },

  createProduct: async (productData: any) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      product: any;
    }>("/products", productData);
    return response.data;
  },

  updateProduct: async (id: string, productData: any) => {
    // Corrected endpoint from /api/products to /products as baseURL already has /api
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      product: any;
    }>(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/products/${id}`);
    return response.data;
  },

  getSellerOrders: async () => {
    // Corrected endpoint from /api/orders to /orders
    const response = await apiClient.get<{ success: boolean; orders: any[] }>(
      "/orders"
    );
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; order: any }>(
      `/orders/${id}`
    );
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `/orders/${id}`,
      { status }
    );
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await apiClient.get<{
      success: boolean;
      stats: {
        totalProducts: number;
        totalOrders: number;
        totalSales: number;
        pendingOrders: number;
      };
    }>("/seller/stats");
    return response.data;
  },


  updateSellerProfile: async (id: string, data: any) => {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      seller: any;
    }>(`/sellers/${id}`, data);
    return response.data;
  },
};

// --- Category Service ---
export const categoryService = {
  getCategories: async () => {
    const response = await apiClient.get<{
      success: boolean;
      categories: any[];
    }>("/categories");
    return response.data;
  },
};

// --- Cart Service ---
export const cartService = {
  getCart: async () => {
    const response = await apiClient.get<{ success: boolean; cart: any }>(
      "/cart"
    );
    return response.data;
  },

  addToCart: async (productId: string, quantity: number = 1) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      cart: any;
    }>("/cart", { productId, quantity });
    return response.data;
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      cart: any;
    }>(`/cart/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId: string) => {
    // Corrected endpoint
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      cart: any;
    }>(`/cart/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      cart: any;
    }>("/cart");
    return response.data;
  },
};

// Aliases for backward compatibility (Optional, but helps if user isn't updating all imports immediately)
// If you want strict refactoring, remove these and update imports.
export const authApi = authService;
export const adminApi = adminService;
export const sellerApi = sellerService;
export const categoriesApi = categoryService;
export const cartApi = cartService;

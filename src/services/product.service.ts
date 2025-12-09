import apiClient from "@/lib/apiClient";
import { Product, CreateProductData, UpdateProductData } from "@/types/product";

export const productService = {
  getAll: async (params?: any) => {
    // This maps to getSellerProducts in old api, but also public products?
    // api.ts had `getSellerProducts` at /api/products (which implies seller view or all products?)
    // Usually /api/products is public get all.
    const response = await apiClient.get<{
      success: boolean;
      products: Product[];
    }>("/products", { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get<{
      success: boolean;
      product: Product;
    }>(`/products/${id}`);
    return response.data;
  },
  getBySellerId: async (sellerId: string, params?: any) => {
    const response = await apiClient.get<{
      success: boolean;
      products: Product[];
    }>("/products", {
      params: { ...params, seller_id: sellerId },
    });
    return response.data;
  },
  create: async (data: CreateProductData) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      product: Product;
    }>("/products", data);
    return response.data;
  },
  update: async (id: string, data: Partial<UpdateProductData>) => {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      product: Product;
    }>(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/products/${id}`);
    return response.data;
  },
  // Specific seller stats from api.ts
  getDashboardStats: async () => {
    const response = await apiClient.get<{ success: boolean; stats: any }>(
      "/seller/stats"
    ); // Verify endpoint
    return response.data;
  },
};

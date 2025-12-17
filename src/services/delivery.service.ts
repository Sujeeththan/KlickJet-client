import apiClient from "@/lib/apiClient";

export const deliveryService = {
  getAll: async () => {
    const response = await apiClient.get<{ success: boolean; deliveries: any[] }>("/deliveries");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; delivery: any }>(`/deliveries/${id}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put<{ success: boolean; delivery: any }>(`/deliveries/${id}`, data);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post<{ success: boolean; delivery: any }>("/deliveries", data);
    return response.data;
  }
};
export type UserRole = "public" | "customer" | "seller" | "deliverer" | "admin";

export interface User {
  id: string;
  _id: string; // MongoDB ID from backend
  name: string;
  email: string;
  role: UserRole;
  type?: "customer" | "seller" | "deliverer"; // Type field from admin/users endpoint
  phone_no?: string;
  address?: string;
  shopName?: string;
  vehicle_no?: string;
  vehicle_type?: string;
  status?: "pending" | "approved" | "rejected" | "active" | "inactive";
  isActive?: boolean;
  rejectionReason?: string;
  createdAt: string; // ISO date string from backend
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterData {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  phone_no?: string;
  address?: string;
  shopName?: string;
  vehicle_no?: string;
  vehicle_type?: string;
}

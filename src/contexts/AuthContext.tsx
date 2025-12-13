"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";
import { User, LoginCredentials } from "@/types/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User, redirectUrl?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.user);
    } catch (error: any) {
      // If token is invalid, remove it gracefully without alarming error
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn("Session expired or invalid, logging out...");
        Cookies.remove("token", { path: '/' });
        setUser(null);
      } else {
        console.error("Failed to refresh user", error);
      }
    }
  };

  useEffect(() => {
    // Check for token in cookies and load user
    const token = Cookies.get("token");
    if (token) {
      // Fetch fresh user data from API
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token: string, userData: User, redirectUrl?: string) => {
    try {
      // Store token first
      Cookies.set("token", token, { expires: 7 }); // 7 days

      // Update user state
      setUser(userData);

      // Get redirect path based on role or use provided url
      const redirectPath = redirectUrl || getRoleRedirectPath(userData.role);

      // Use replace instead of push to avoid back button issues
      // Use setTimeout to ensure state is updated before redirect
      setTimeout(() => {
        router.replace(redirectPath);
      }, 100);
    } catch (error) {
      console.error("Login error", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Try to call logout API first (optional - invalidates token on server)
      const token = Cookies.get("token");
      if (token) {
        try {
          await authService.logout();
        } catch (error) {
          // Ignore logout API errors - still proceed with local logout
          console.error("Logout API error (ignored):", error);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state
      Cookies.remove("token", { path: '/' });
      setUser(null);
      toast.success("Logged out successfully");

      // Redirect to landing page
      setTimeout(() => {
        router.replace("/");
      }, 100);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

function getRoleRedirectPath(role: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "customer":
      return "/customer";
    case "seller":
      return "/seller";
    case "deliverer":
      return "/deliverer";
    default:
      return "/";
  }
}

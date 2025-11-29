"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@/services/api';
import { AuthContextType, User, LoginCredentials, RegisterData } from '@/types/auth';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'klickjet_token';
const USER_KEY = 'klickjet_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user and token from localStorage on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          try {
            const response = await authApi.getMe(storedToken);
            setUser(response.user);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          } catch (error) {
            // Token is invalid, clear auth
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error loading auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      
      if (response.token) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        
        toast.success(response.message || 'Login successful');
        
        // Redirect based on role
        const redirectPath = getRoleRedirectPath(response.user.role);
        router.push(redirectPath);
      } else {
        toast.error('Login failed: No token received');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);
      
      // For sellers and deliverers, they need admin approval
      if (data.role === 'seller' || data.role === 'deliverer') {
        toast.success(response.message || 'Registration successful! Awaiting admin approval.');
        router.push('/auth/login');
      } else {
        // For customers, auto-login
        if (response.token) {
          setToken(response.token);
          setUser(response.user);
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          
          toast.success(response.message || 'Registration successful');
          
          const redirectPath = getRoleRedirectPath(response.user.role);
          router.push(redirectPath);
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Registration failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      toast.success('Logged out successfully');
      router.push('/');
    }
  }, [token, router]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await authApi.getMe(token);
      setUser(response.user);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, logout
      await logout();
    }
  }, [token, logout]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getRoleRedirectPath(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'customer':
      return '/customer';
    case 'seller':
      return '/seller';
    case 'deliverer':
      return '/deliverer';
    default:
      return '/';
  }
}

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { cartApi } from "@/services/api";
import { useAuth } from "./AuthContext";

export interface CartItem {
  _id?: string; // MongoDB item ID
  id: number | string; // Product ID
  title: string;
  description?: string;
  price: number;
  seller?: string;
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token, isAuthenticated } = useAuth();

  // Load cart from backend or localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      setMounted(true);
      
      if (isAuthenticated && token) {
        // Load from backend for authenticated users
        try {
          setIsLoading(true);
          const response = await cartApi.getCart(token);
          if (response.success && response.cart) {
            // Transform backend cart items to frontend format
            const transformedItems = response.cart.items.map((item: any) => ({
              _id: item._id,
              id: item.product._id || item.product,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            }));
            setItems(transformedItems);
          }
        } catch (error) {
          console.error("Failed to load cart from backend:", error);
          // Fall back to localStorage
          loadFromLocalStorage();
        } finally {
          setIsLoading(false);
        }
      } else {
        // Load from localStorage for guest users
        loadFromLocalStorage();
      }
    };

    loadCart();
  }, [isAuthenticated, token]);

  const loadFromLocalStorage = () => {
    const savedCart = localStorage.getItem("klickjet-cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }
  };

  // Save cart to localStorage for guest users
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      localStorage.setItem("klickjet-cart", JSON.stringify(items));
    }
  }, [items, mounted, isAuthenticated]);

  // Sync cart with backend
  const syncCart = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await cartApi.getCart(token);
      if (response.success && response.cart) {
        const transformedItems = response.cart.items.map((item: any) => ({
          _id: item._id,
          id: item.product._id || item.product,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        }));
        setItems(transformedItems);
      }
    } catch (error) {
      console.error("Failed to sync cart:", error);
    }
  };

  const addToCart = async (product: Omit<CartItem, "quantity">, quantity: number = 1) => {
    if (isAuthenticated && token) {
      // Add to backend for authenticated users
      try {
        setIsLoading(true);
        const response = await cartApi.addToCart(token, product.id.toString(), quantity);
        if (response.success) {
          toast.success(`${product.title} added to cart`);
          await syncCart();
        }
      } catch (error: any) {
        console.error("Failed to add to cart:", error);
        toast.error(error.message || "Failed to add item to cart");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Add to localStorage for guest users
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);
        
        if (existingItem) {
          toast.success(`Updated ${product.title} quantity in cart`);
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          toast.success(`${product.title} added to cart`);
          return [...prevItems, { ...product, quantity }];
        }
      });
    }
  };

  const removeFromCart = async (productId: number | string) => {
    if (isAuthenticated && token) {
      // Remove from backend for authenticated users
      try {
        setIsLoading(true);
        // Find the cart item ID
        const item = items.find((item) => item.id === productId);
        if (item && item._id) {
          const response = await cartApi.removeFromCart(token, item._id);
          if (response.success) {
            toast.success(`${item.title} removed from cart`);
            await syncCart();
          }
        }
      } catch (error: any) {
        console.error("Failed to remove from cart:", error);
        toast.error(error.message || "Failed to remove item from cart");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Remove from localStorage for guest users
      setItems((prevItems) => {
        const item = prevItems.find((item) => item.id === productId);
        if (item) {
          toast.success(`${item.title} removed from cart`);
        }
        return prevItems.filter((item) => item.id !== productId);
      });
    }
  };

  const updateQuantity = async (productId: number | string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    if (isAuthenticated && token) {
      // Update in backend for authenticated users
      try {
        setIsLoading(true);
        const item = items.find((item) => item.id === productId);
        if (item && item._id) {
          const response = await cartApi.updateCartItem(token, item._id, quantity);
          if (response.success) {
            await syncCart();
          }
        }
      } catch (error: any) {
        console.error("Failed to update cart item:", error);
        toast.error(error.message || "Failed to update quantity");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Update in localStorage for guest users
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && token) {
      // Clear backend cart for authenticated users
      try {
        setIsLoading(true);
        const response = await cartApi.clearCart(token);
        if (response.success) {
          setItems([]);
          toast.success("Cart cleared");
        }
      } catch (error: any) {
        console.error("Failed to clear cart:", error);
        toast.error(error.message || "Failed to clear cart");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Clear localStorage for guest users
      setItems([]);
      toast.success("Cart cleared");
    }
  };

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isLoading,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { cartService } from "@/services/cart.service";
import { useAuth } from "./AuthContext";

export interface CartItem {
  _id?: string; // MongoDB item ID
  id: number | string; // Product ID
  title: string;
  description?: string;
  price: number;
  seller?: string;
  sellerId?: string;
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
  const { user, isAuthenticated } = useAuth();

  // Load cart from backend or localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      setMounted(true);
      
      if (isAuthenticated) {
        // Check for local cart items to sync
        const savedCart = localStorage.getItem("klickjet-cart");
        if (savedCart) {
          try {
            const localItems: CartItem[] = JSON.parse(savedCart);
            if (localItems.length > 0) {
              console.log("Syncing local cart to backend...");
              // Sync items sequentially to ensure order or handle errors individually
              for (const item of localItems) {
                try {
                  await cartService.addToCart(item.id.toString(), item.quantity);
                } catch (err) {
                  console.error(`Failed to sync item ${item.title}:`, err);
                }
              }
              // Clear local cart after attempting sync
              localStorage.removeItem("klickjet-cart");
              toast.success("Your cart has been synced!");
            }
          } catch (error) {
            console.error("Error processing local cart for sync:", error);
          }
        }

        // Load from backend for authenticated users
        try {
          setIsLoading(true);
          const response = await cartService.getCart();
          if (response.success && response.cart) {
            // Transform backend cart items to frontend format
            const transformedItems = response.cart.items
              .filter((item: any) => item && item.product) // Filter out items with missing products
              .map((item: any) => ({
                _id: item._id,
                id: item.product._id || item.product,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                image: item.image || (item.product?.image) || (item.product?.images && item.product.images[0]) || null,
                seller:
                  item.product.seller_id?.shopName ||
                  item.product.seller_id?.name ||
                  "Unknown Shop",
                sellerId: item.product.seller_id?._id || item.product.seller?._id || item.product.seller || null,
              }));
            setItems(transformedItems);
          }
        } catch (error) {
          console.error("Failed to load cart from backend:", error);
          // Fall back to localStorage if backend fails entirely? 
          // Note: We just cleared localStorage above if we synced. 
          // If sync worked but getCart failed, we might show empty cart.
          // But usually getCart shouldn't fail if addToCart worked.
        } finally {
          setIsLoading(false);
        }
      } else {
        // Load from localStorage for guest users
        loadFromLocalStorage();
      }
    };

    loadCart();
  }, [isAuthenticated]);

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
    if (!isAuthenticated) return;

    try {
      const response = await cartService.getCart();
      if (response.success && response.cart) {
        const transformedItems = response.cart.items
          .filter((item: any) => item && item.product) // Filter out items with missing products
          .map((item: any) => ({
            _id: item._id,
            id: item.product._id || item.product,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image || (item.product?.image) || (item.product?.images && item.product.images[0]) || null,
            seller:
              item.product.seller_id?.shopName ||
              item.product.seller_id?.name ||
              "Unknown Shop",
            sellerId: item.product.seller_id?._id || item.product.seller?._id || item.product.seller || null,
          }));
        setItems(transformedItems);
      }
    } catch (error) {
      console.error("Failed to sync cart:", error);
    }
  };

  const addToCart = async (product: Omit<CartItem, "quantity">, quantity: number = 1) => {
    // Check for multiple shop restriction
    if (items.length > 0) {
      // Assuming all items in cart are from same shop (enforced by this logic)
      const currentShopId = items[0].sellerId;
      // If product has sellerId and it doesn't match
      if (currentShopId && product.sellerId && currentShopId !== product.sellerId) {
         toast.error("You can only order from one shop at a time. Please clear your cart first.");
         return;
      }
    }

    // Check if product already exists in cart
    const existingItem = items.find((item) => item.id === product.id);
    
    if (existingItem) {
      // If checking plain 'id', might need to be careful if it's number vs string
      toast.error("This product is already added");
      return;
    }

    if (isAuthenticated) {
      // Add to backend for authenticated users
      try {
        setIsLoading(true);
        const response = await cartService.addToCart(product.id.toString(), quantity);
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
      toast.success(`${product.title} added to cart`);
      setItems((prevItems) => [...prevItems, { ...product, quantity }]);
    }
  };

  const removeFromCart = async (productId: number | string) => {
    if (isAuthenticated) {
      // Remove from backend for authenticated users
      try {
        setIsLoading(true);
        // Find the cart item ID
        const item = items.find((item) => item.id === productId);
        if (item && item._id) {
          const response = await cartService.removeItem(item._id);
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

    if (isAuthenticated) {
      // Update in backend for authenticated users
      try {
        setIsLoading(true);
        const item = items.find((item) => item.id === productId);
        if (item && item._id) {
          const response = await cartService.updateItem(item._id, quantity);
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
    if (isAuthenticated) {
      // Clear backend cart for authenticated users
      try {
        setIsLoading(true);
        const response = await cartService.clearCart();
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

"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Minus, Package, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const deliveryFee = 300;
  const taxRate = 0.08;
  const subtotal = cartTotal;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  // Redirect non-customers to their respective dashboards
  useEffect(() => {
    if (user && user.role !== "customer") {
      if (user.role === "seller") {
        router.push("/seller");
      } else if (user.role === "deliverer") {
        router.push("/deliverer");
      } else if (user.role === "admin") {
        router.push("/admin");
      }
    }
  }, [user, router]);

  // Don't render cart for non-customers
  if (user && user.role !== "customer") {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
            <p className="text-gray-500 mb-6">
              Add some products to get started!
            </p>
            <Link href="/products">
              <Button className="text-white hover:bg-gray-800">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with Back Button */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Your Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cart Items */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Items ({items.length})
            </p>

            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-3 items-start">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={64}
                            height={64}
                            className="object-cover rounded"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>

                      {/* Product Info and Controls */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-base">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              LKR {item.price.toFixed(2)} / unit
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Price and Delete */}
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-base">
                              LKR {(item.price * item.quantity).toFixed(2)}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      LKR {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">
                      LKR {deliveryFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="font-medium">LKR {tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between mb-6">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-xl">
                    LKR {total.toFixed(2)}
                  </span>
                </div>

                <Link href="/checkout">
                  <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 h-11 text-base font-semibold">
                    Checkout
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

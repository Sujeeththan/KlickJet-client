"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderConfirmedPage() {
  const { clearCart } = useCart();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [orderId, setOrderId] = useState("ORD-2025-0000");

  useEffect(() => {
    // Only run once on mount
    const orderCompleted = sessionStorage.getItem("orderCompleted");
    console.log("Order Confirmed Page - orderCompleted flag:", orderCompleted);
    
    if (orderCompleted === "true") {
      console.log("Order verified, showing confirmation page");
      
      // Get order ID from stored order data
      const storedOrder = sessionStorage.getItem("currentOrder");
      if (storedOrder) {
        try {
          const orderData = JSON.parse(storedOrder);
          setOrderId(orderData.orderId);
        } catch (error) {
          console.error("Error parsing order data:", error);
        }
      }
      
      // Set verified first to show the page immediately
      setIsVerified(true);
      
      // Clear cart and remove flag after a short delay to avoid re-render issues
      setTimeout(() => {
        console.log("Clearing cart and removing flag");
        clearCart();
        sessionStorage.removeItem("orderCompleted");
      }, 100);
    } else {
      console.log("No order flag found, redirecting to customer dashboard");
      router.push("/customer");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-surface-primary">
      <Header />

      {isVerified && (
        <main className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Card className="w-full max-w-2xl bg-white shadow-sm">
            <CardContent className="flex flex-col items-center text-center p-12 space-y-6">
              <div className="h-20 w-20 bg-success/10 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Order Confirmed!</h1>
                <p className="text-muted-foreground text-lg">
                  Your order {orderId} has been placed successfully.
                  <br />
                  You will receive a confirmation email shortly.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-6">
                <Link href="/customer">
                  <Button variant="outline" className="w-full sm:w-auto min-w-[140px] h-11 text-base">
                    Return Home
                  </Button>
                </Link>
                <Link href="/track-order">
                  <Button className="w-full sm:w-auto min-w-[140px] h-11 text-base bg-primary hover:bg-primary/90">
                    Track Order
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      )}
    </div>
  );
}

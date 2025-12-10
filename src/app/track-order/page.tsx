"use client";

import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, MapPin, Package, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderData {
  orderId: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    // Retrieve order data from sessionStorage
    const storedOrder = sessionStorage.getItem("currentOrder");
    
    if (storedOrder) {
      try {
        const parsedOrder = JSON.parse(storedOrder);
        setOrderData(parsedOrder);
        console.log("Retrieved order data:", parsedOrder);
      } catch (error) {
        console.error("Error parsing order data:", error);
        router.push("/customer");
      }
    } else {
      console.log("No order data found, redirecting to customer dashboard");
      router.push("/customer");
    }
  }, [router]);

  // Show loading state while checking for order data
  if (!orderData) {
    return (
      <div className="min-h-screen bg-surface-primary">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Track Your Order</h1>
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
            On the way
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Map & Status */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="relative h-[400px] w-full bg-muted">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(orderData.deliveryAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                
                {/* Overlay Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg flex items-center gap-4">
                  <div className="bg-muted p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivering to:</p>
                    <p className="font-semibold text-foreground">{orderData.deliveryAddress}</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-8 pl-4 border-l-2 border-gray-200 ml-4">
              <div className="relative">
                <div className="absolute -left-[25px] bg-green-100 p-1 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Order Confirmed</h3>
                <p className="text-sm text-gray-500">10:23 AM</p>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[25px] bg-green-100 p-1 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Store Preparing</h3>
                <p className="text-sm text-gray-500">10:25 AM</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[25px] bg-gray-900 p-1 rounded-full">
                  <Truck className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Out for Delivery</h3>
                <p className="text-sm text-gray-500">10:45 AM</p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <p className="text-sm text-muted-foreground">{orderData.orderId}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start text-sm gap-3">
                      <div className="flex gap-3 flex-1 min-w-0">
                        {item.image && (
                          <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-500">{item.quantity}x</span>{" "}
                          <span className="truncate">{item.name}</span>
                        </div>
                      </div>
                      <span className="font-medium whitespace-nowrap">LKR {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>LKR {orderData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span>LKR {orderData.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span>LKR {orderData.tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg">LKR {orderData.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Delivery Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Please leave at the front door. Ring the doorbell.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

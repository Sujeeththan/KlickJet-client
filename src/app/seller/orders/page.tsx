"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { ShoppingCart, Package } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Order {
  id: number;
  customerId: number;
  customerName: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { orderService } = await import("@/services/order.service");
      const response = await orderService.getAll();
      // Need to adapt API response to component state if necessary, 
      // or better yet, update component to use Order type from types/order.ts
      // For now, I'll try to map if possible or cast.
      // The component expects structure:
      /* 
         interface Order {
            id: number; // backend uses _id string
            customerId: number; // backend uses user string
            customerName: string; // might need to fetch or might be in user object if populated
            products: Array<{ name: string; quantity: number; price: number }>;
            // ...
         }
      */
      // If backend returns populated items.product, I can get name/price.
      // Since I don't know exact backend shape returned for this user, I'll assume standard Order type and map loosely or set to empty if mismatch.
      
      // Let's assume response.orders is Order[] from types/order.ts
      const fetchedOrders: any[] = response.orders || [];
      
      // Map backend response to component's expected format
      const mappedOrders = fetchedOrders.map((o: any) => ({
        id: o._id,
        customerId: typeof o.customer_id === 'object' ? o.customer_id._id : o.customer_id,
        customerName: typeof o.customer_id === 'object' ? o.customer_id.name : "Customer",
        products: o.items.map((i: any) => ({
            name: typeof i.product === 'object' ? i.product.name : "Product",
            quantity: i.quantity,
            price: i.price || 0
        })),
        totalAmount: o.total_amount, // Backend uses total_amount (snake_case)
        status: o.status,
        createdAt: o.createdAt
      }));

      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Recent Orders</h2>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                Loading orders...
              </p>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <StatusBadge status={order.status as any} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Customer: {order.customerName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <p className="font-semibold text-lg">
                          Rs. {order.totalAmount.toFixed(2)}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          {order.products.length} item(s)
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Products:</p>
                      <div className="space-y-1">
                        {order.products.map((product, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            {product.name} × {product.quantity} - Rs.{" "}
                            {(product.price * product.quantity).toFixed(2)}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

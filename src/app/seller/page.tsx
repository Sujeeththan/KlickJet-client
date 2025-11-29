"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/features/seller/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  pendingOrders: number;
}

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // For now, using placeholder data
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalSales: 0.0,
        pendingOrders: 0,
      });
      setRecentProducts([]);
      setRecentOrders([]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Seller Dashboard</h2>
            <p className="text-muted-foreground">
              Manage your products and orders
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Products"
            value={stats.totalProducts}
            icon={Package}
          />
          <StatCard
            title="Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
          />
          <StatCard
            title="Sales"
            value={`Rs. ${stats.totalSales.toFixed(2)}`}
            icon={DollarSign}
          />
          <StatCard
            title="Pending"
            value={stats.pendingOrders}
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Products</CardTitle>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/seller/products")}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No products yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Rs. {product.price}
                        </p>
                      </div>
                      <p className="text-sm">Stock: {product.stock}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/seller/orders")}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No orders yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer}
                        </p>
                      </div>
                      <p className="text-sm font-medium">Rs. {order.total}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
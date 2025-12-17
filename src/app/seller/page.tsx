"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/features/seller/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { productService } from "@/services/product.service";
import { orderService } from "@/services/order.service";

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
      
      // Fetch products for the seller
      const productResponse = await productService.getAll({ seller_id: user?.id });
      const products = productResponse.products || [];
      
      // Fetch orders containing seller's products
      const orderResponse = await orderService.getAll();
      const allOrders = orderResponse.orders || [];
      
      // Filter orders that contain seller's products
      const sellerOrders = allOrders.filter(order => 
        order.items.some(item => 
          products.some(product => product._id === (typeof item.product === 'string' ? item.product : item.product._id))
        )
      );
      
      const totalProducts = products.length;
      const totalOrders = sellerOrders.length;
      const pendingOrders = sellerOrders.filter(order => order.status === "pending").length;
      const totalSales = sellerOrders
        .filter(order => order.status === "delivered")
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);
      
      setStats({
        totalProducts,
        totalOrders,
        totalSales,
        pendingOrders,
      });
      
      // Set recent products (first 5)
      setRecentProducts(products.slice(0, 5));
      
      // Set recent orders (first 5)
      setRecentOrders(sellerOrders.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
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
          <Button onClick={refreshData} variant="outline" size="sm">
            Refresh Data
          </Button>
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
                      key={product._id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Rs. {product.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <p className="text-sm">Stock: {product.instock ? 'In Stock' : 'Out of Stock'}</p>
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
                      key={order._id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">Order #{order._id.substring(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {typeof order.customer_id === 'object' && order.customer_id !== null ? order.customer_id.name : 'Customer'}
                        </p>
                      </div>
                      <p className="text-sm font-medium">Rs. {order.total_amount?.toFixed(2) || '0.00'}</p>
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
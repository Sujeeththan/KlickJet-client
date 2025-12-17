"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Clock, CheckCircle, TrendingUp, ArrowRight, Package, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { orderService } from "@/services/order.service";

export default function Page() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState([
    {
      title: "Total Orders",
      value: "0",
      subtext: "All time",
      icon: ShoppingCart,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      title: "Pending",
      value: "0",
      subtext: "In progress",
      icon: Clock,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100",
    },
    {
      title: "Completed",
      value: "0",
      subtext: "Delivered",
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
    },
    {
      title: "Total Spent",
      value: "Rs. 0.00",
      subtext: "All orders",
      icon: TrendingUp,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
    },
  ]);

  useEffect(() => {
    fetchCustomerStats();
  }, []);

  const fetchCustomerStats = async () => {
    try {
      const response = await orderService.getAll();
      const orders = response.orders || [];
      
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => order.status === "pending").length;
      const completedOrders = orders.filter(order => order.status === "delivered").length;
      const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      
      setStats([
        {
          title: "Total Orders",
          value: totalOrders.toString(),
          subtext: "All time",
          icon: ShoppingCart,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-100",
        },
        {
          title: "Pending",
          value: pendingOrders.toString(),
          subtext: "In progress",
          icon: Clock,
          iconColor: "text-yellow-600",
          iconBg: "bg-yellow-100",
        },
        {
          title: "Completed",
          value: completedOrders.toString(),
          subtext: "Delivered",
          icon: CheckCircle,
          iconColor: "text-green-600",
          iconBg: "bg-green-100",
        },
        {
          title: "Total Spent",
          value: `Rs. ${totalSpent.toFixed(2)}`,
          subtext: "All orders",
          icon: TrendingUp,
          iconColor: "text-purple-600",
          iconBg: "bg-purple-100",
        },
      ]);
    } catch (error) {
      console.error("Error fetching customer stats:", error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/products">
                <Button className="gap-2">
                  Continue Shopping
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button onClick={logout} variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={`stat-${index}`} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                      <p className="text-sm text-gray-500 mt-1">{stat.subtext}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Orders Section */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b gap-4">
              <div>
                <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Your latest order history and status</p>
              </div>
              <Link href="/orders" className="w-full sm:w-auto">
                <Button variant="default" size="sm" className="w-full sm:w-auto text-white">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
              <p className="text-gray-500 mt-1 max-w-sm">
                When you place your first order, it will appear here with all the details and status updates.
              </p>
              <Link href="/products" className="mt-6">
                <Button variant="outline">Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
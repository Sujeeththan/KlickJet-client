"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/features/deliverer/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, CheckCircle, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalDeliveries: number;
  activeDeliveries: number;
  completedDeliveries: number;
  totalEarnings: number;
}

interface Delivery {
  id: number;
  orderId: number;
  customerName: string;
  deliveryAddress: string;
  status: string;
  amount: number;
  items: number;
}

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalDeliveries: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    totalEarnings: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
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
        totalDeliveries: 0,
        activeDeliveries: 0,
        completedDeliveries: 0,
        totalEarnings: 0.0,
      });
      setRecentDeliveries([]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "picked_up":
        return "bg-blue-100 text-blue-800";
      case "in_transit":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["deliverer"]}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Deliverer Dashboard</h2>
            <p className="text-muted-foreground">
              Manage your deliveries and track earnings
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Deliveries"
            value={stats.totalDeliveries}
            icon={Truck}
          />
          <StatCard
            title="Active"
            value={stats.activeDeliveries}
            icon={Package}
          />
          <StatCard
            title="Completed"
            value={stats.completedDeliveries}
            icon={CheckCircle}
          />
          <StatCard
            title="Earnings"
            value={`Rs. ${stats.totalEarnings.toFixed(2)}`}
            icon={DollarSign}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Deliveries</CardTitle>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/deliverer/deliveries")}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentDeliveries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No deliveries assigned yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">Order #{delivery.orderId}</p>
                        <p className="text-sm text-muted-foreground">
                          {delivery.customerName}
                        </p>
                        <Badge className={`mt-1 ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">Rs. {delivery.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full" 
                variant="default"
                onClick={() => router.push("/deliverer/deliveries")}
              >
                View All Deliveries
              </Button>
              <Button className="w-full" variant="outline">
                Delivery History
              </Button>
              <Button className="w-full" variant="outline">
                Update Availability
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
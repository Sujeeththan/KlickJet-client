"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Truck, Package, MapPin } from "lucide-react";

interface Delivery {
  id: number;
  orderId: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  deliveryFee: number;
  status: string;
  pickupAddress: string;
  createdAt: string;
}

export default function DeliveriesPage() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await delivererApi.getDeliveries(token);
      setDeliveries([]);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
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

  const handleStatusUpdate = async (deliveryId: number, newStatus: string) => {
    try {
      // TODO: Implement API call to update delivery status
      console.log(`Updating delivery ${deliveryId} to status: ${newStatus}`);
      // await delivererApi.updateDeliveryStatus(deliveryId, newStatus, token);
      // fetchDeliveries(); // Refresh the list
    } catch (error) {
      console.error("Error updating delivery status:", error);
    }
  };

  const getActionButton = (delivery: Delivery) => {
    const status = delivery.status.toLowerCase();
    
    if (status === "pending") {
      return (
        <Button
          size="sm"
          onClick={() => handleStatusUpdate(delivery.id, "picked_up")}
        >
          Mark as Picked Up
        </Button>
      );
    } else if (status === "picked_up" || status === "in_transit") {
      return (
        <Button
          size="sm"
          onClick={() => handleStatusUpdate(delivery.id, "delivered")}
        >
          Mark as Delivered
        </Button>
      );
    } else if (status === "delivered") {
      return (
        <Badge className="bg-green-100 text-green-800">
          Completed
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <ProtectedRoute allowedRoles={["deliverer"]}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Deliveries</h2>
            <p className="text-muted-foreground">
              Manage your assigned delivery orders
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Assigned Deliveries</CardTitle>
            <Truck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                Loading deliveries...
              </p>
            ) : deliveries.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No deliveries assigned yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">Order #{delivery.orderId}</h3>
                            <Badge className={getStatusColor(delivery.status)}>
                              {delivery.status.replace("_", " ")}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="font-medium text-muted-foreground">Customer</p>
                              <p className="font-medium">{delivery.customerName}</p>
                              <p className="text-muted-foreground">{delivery.customerPhone}</p>
                            </div>
                            
                            <div>
                              <p className="font-medium text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Delivery Address
                              </p>
                              <p>{delivery.deliveryAddress}</p>
                            </div>
                          </div>

                          <div>
                            <p className="font-medium text-muted-foreground text-sm">
                              Pickup Address
                            </p>
                            <p className="text-sm">{delivery.pickupAddress}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-2">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Order Amount</p>
                            <p className="font-semibold text-lg">
                              Rs. {delivery.totalAmount.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Delivery Fee</p>
                            <p className="font-semibold text-green-600">
                              Rs. {delivery.deliveryFee.toFixed(2)}
                            </p>
                          </div>
                          {getActionButton(delivery)}
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Products:</p>
                        <div className="space-y-1">
                          {delivery.products.map((product, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground">
                              {product.name} × {product.quantity} - Rs.{" "}
                              {(product.price * product.quantity).toFixed(2)}
                            </p>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {delivery.products.length} item(s) • Ordered on{" "}
                          {new Date(delivery.createdAt).toLocaleDateString()}
                        </p>
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

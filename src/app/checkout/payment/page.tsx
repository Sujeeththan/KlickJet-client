"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Package, MapPin, Banknote, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { StripeProvider } from "@/components/payment/StripeProvider";
import { StripePaymentForm } from "@/components/payment/StripePaymentForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ShippingData = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
};

export default function PaymentMethodPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Stripe payment state
  const [showStripeDialog, setShowStripeDialog] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);
  
  // Delete address dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deliveryFee = 300;
  const taxRate = 0.08;
  const subtotal = cartTotal;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  // Load shipping data from sessionStorage
  useEffect(() => {
    const storedShipping = sessionStorage.getItem("shippingData");
    if (!storedShipping) {
      toast.error("Shipping information is missing. Please complete the shipping form.");
      router.push("/checkout/shipping");
      return;
    }
    
    try {
      const parsedShipping = JSON.parse(storedShipping);
      setShippingData(parsedShipping);
    } catch (error) {
      toast.error("Error loading shipping information");
      router.push("/checkout/shipping");
    }
  }, [router]);

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
      toast.error("Your cart is empty");
    }
  }, [items, router]);

  // Redirect non-customers
  useEffect(() => {
    if (user && user.role !== "customer") {
      toast.error("Only customers can checkout");
      if (user.role === "seller") {
        router.push("/seller");
      } else if (user.role === "deliverer") {
        router.push("/deliverer");
      } else if (user.role === "admin") {
        router.push("/admin");
      }
    }
  }, [user, router]);

  if (items.length === 0 || !shippingData) return null;

  async function handlePlaceOrder() {
    // Check if user is logged in
    if (!user) {
      toast.error("Please log in to place your order");
      router.push("/auth/login");
      return;
    }

    // Check if user is a customer
    if (user.role !== "customer") {
      toast.error("Only customers can place orders");
      return;
    }

    if (!shippingData) {
      toast.error("Shipping information is missing");
      router.push("/checkout/shipping");
      return;
    }

    try {
      setIsProcessing(true);
      const fullAddress = `${shippingData.address}, ${shippingData.city}, ${shippingData.zipCode}, Sri Lanka`;
      
      const orderPayload = {
        items: items.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: fullAddress,
        paymentMethod: paymentMethod,
        totalAmount: total,
        contactInfo: {
          firstName: shippingData.firstName,
          lastName: shippingData.lastName,
          phone: shippingData.phone
        }
      };

      // For online payment, create payment intent first
      if (paymentMethod === "online") {
        console.log(" Online payment selected, creating payment intent...");
        
        // Create order first to get order ID
        console.log(" Creating order...");
        const { orderService } = await import("@/services/order.service");
        const orderResponse = await orderService.create(orderPayload);
        const orderId = orderResponse.order?._id;
        console.log("Order created:", orderId);
        
        if (!orderId) {
          throw new Error("Failed to create order");
        }

        // Create payment intent
        console.log("Creating payment intent...");
        const { paymentService } = await import("@/services/payment.service");
        const paymentResponse = await paymentService.createPaymentIntent({
          order_id: orderId,
          payment_method: "online"
        });
        console.log("Payment response:", paymentResponse);

        if (!paymentResponse.stripeClientSecret) {
          console.error("No client secret received:", paymentResponse);
          throw new Error("Failed to initialize payment");
        }

        // Store order data for after payment confirmation
        const orderData = {
          orderId,
          deliveryAddress: fullAddress,
          items: items.map(item => ({
            name: item.title,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
          subtotal,
          deliveryFee,
          tax,
          total,
          shippingDetails: shippingData,
          paymentMethod: paymentMethod,
          timestamp: new Date().toISOString(),
        };
        
        setPendingOrderData(orderData);
        setStripeClientSecret(paymentResponse.stripeClientSecret);
        console.log("Opening Stripe dialog with client secret");
        setShowStripeDialog(true);
        setIsProcessing(false);
      } else {
        // For COD, create order directly
        const { orderService } = await import("@/services/order.service");
        const response = await orderService.create(orderPayload);
        const orderId = response.order?._id || `ORD-${Date.now()}`;
        
        const orderData = {
          orderId,
          deliveryAddress: fullAddress,
          items: items.map(item => ({
            name: item.title,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
          subtotal,
          deliveryFee,
          tax,
          total,
          shippingDetails: shippingData,
          paymentMethod: paymentMethod,
          timestamp: new Date().toISOString(),
        };
        
        sessionStorage.setItem("orderCompleted", "true");
        sessionStorage.setItem("currentOrder", JSON.stringify(orderData));
        sessionStorage.removeItem("shippingData");
        
        clearCart();
        toast.success("Order placed successfully!");
        router.push("/order-confirmed");
      }
    } catch (error: any) {
      console.error("Order creation failed:", error);
      toast.error(error.message || "Failed to place order");
      setIsProcessing(false);
    }
  }

  function handlePaymentSuccess() {
    // Payment successful, complete the order
    if (pendingOrderData) {
      sessionStorage.setItem("orderCompleted", "true");
      sessionStorage.setItem("currentOrder", JSON.stringify(pendingOrderData));
      sessionStorage.removeItem("shippingData");
      
      clearCart();
      setShowStripeDialog(false);
      toast.success("Payment successful! Order placed.");
      router.push("/order-confirmed");
    }
  }

  function handlePaymentError(error: string) {
    toast.error(error);
    setShowStripeDialog(false);
    setStripeClientSecret(null);
    setPendingOrderData(null);
  }

  function handleEditAddress() {
    // Navigate back to shipping page to edit address
    router.push("/checkout/shipping");
  }

  function handleDeleteAddress() {
    // Soft delete: Save to backup before removing
    if (shippingData) {
      sessionStorage.setItem("lastDeletedAddress", JSON.stringify(shippingData));
    }
    
    // Clear shipping data and navigate back to shipping page
    sessionStorage.removeItem("shippingData");
    setShowDeleteDialog(false);
    toast.success("Delivery address removed");
    router.push("/checkout/shipping");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">Shipping</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-primary mx-1 sm:mx-2"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold shrink-0">
                2
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">Payment</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-gray-300 mx-1 sm:mx-2"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold shrink-0">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500 hidden sm:inline">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/checkout/shipping">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Payment Method</h1>
            <p className="text-muted-foreground">Choose how you'd like to pay</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Shipping Info & Payment Method */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Summary */}
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditAddress}
                      className="h-8"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold">
                    {shippingData.firstName} {shippingData.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{shippingData.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {shippingData.city}, {shippingData.zipCode}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Phone: {shippingData.phone}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Select Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Cash on Delivery */}
                <div
                  className={`flex items-start space-x-3 border-2 p-4 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                    paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="h-4 w-4 mt-1 border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <Label className="cursor-pointer font-semibold text-base">
                        Cash on Delivery
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay with cash when you receive your order
                    </p>
                  </div>
                </div>

                {/* Online Payment (Stripe) */}
                <div
                  className={`flex items-start space-x-3 border-2 p-4 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                    paymentMethod === "online" ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}
                  onClick={() => setPaymentMethod("online")}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="h-4 w-4 mt-1 border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <Label className="cursor-pointer font-semibold text-base">
                        Credit / Debit Card
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay securely online with Stripe
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-md sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-start pb-3 border-b last:border-0">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={48}
                            height={48}
                            className="object-cover rounded"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        LKR {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">LKR {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">LKR {deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="font-medium">LKR {tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-xl">LKR {total.toFixed(2)}</span>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-primary/90 h-11 text-base font-semibold"
                >
                  {isProcessing
                    ? "Processing..."
                    : paymentMethod === "cod"
                    ? "Place Order"
                    : "Proceed to Pay"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stripe Payment Dialog */}
        <Dialog open={showStripeDialog} onOpenChange={setShowStripeDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Complete Your Payment</DialogTitle>
              <DialogDescription>
                Enter your card details to complete the payment securely via Stripe.
              </DialogDescription>
            </DialogHeader>
            {stripeClientSecret && (
              <StripeProvider clientSecret={stripeClientSecret}>
                <StripePaymentForm
                  totalAmount={total}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </StripeProvider>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Address Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Delivery Address?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this delivery address? You will be redirected back to the shipping page to enter a new address.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAddress}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

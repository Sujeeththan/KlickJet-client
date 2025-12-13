"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Package, ShoppingBag, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

// --------------------
// Zod Schema
// --------------------
const shippingSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name is required and must be at least 2 characters")
    .regex(/^[A-Za-z ]+$/, "First name can only contain letters and spaces"),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name is required and must be at least 2 characters")
    .regex(/^[A-Za-z ]+$/, "Last name can only contain letters and spaces"),

  address: z
    .string()
    .trim()
    .min(5, "Address is required and must be at least 5 characters"),

  district: z
    .string()
    .min(1, "Please select a district"),

  zipCode: z
    .string()
    .trim()
    .min(4, "Zip Code is required and must be at least 4 characters")
    .regex(/^[0-9]+$/, "Zip Code must contain only digits"),

  phone: z
    .string()
    .trim()
    .min(10, "Phone number is required and must be at least 10 digits")
    .regex(/^[0-9]{10,15}$/, "Phone number must contain only digits"),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

// --------------------
// Component
// --------------------
export default function ShippingAddressPage() {
  const { items, cartTotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [deletedAddress, setDeletedAddress] = useState<ShippingFormValues | null>(null);

  const deliveryFee = 300;
  const taxRate = 0.08;
  const subtotal = cartTotal;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      district: "",
      zipCode: "",
      phone: "",
    },
  });

  // Check for soft-deleted address on mount
  useEffect(() => {
    const backup = sessionStorage.getItem("lastDeletedAddress");
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        setDeletedAddress(parsed);
      } catch (e) {
        console.error("Failed to parse deleted address", e);
      }
    }
  }, []);

  function handleRestore() {
    if (deletedAddress) {
      form.reset(deletedAddress);
      setDeletedAddress(null);
      sessionStorage.removeItem("lastDeletedAddress");
      toast.success("Address restored successfully");
    }
  }

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

  if (items.length === 0) return null;

  function handleContinueToPayment(data: ShippingFormValues) {
    // Check if user is logged in
    if (!user) {
      toast.error("Please log in to continue");
      router.push("/auth/login");
      return;
    }

    // Check if user is a customer
    if (user.role !== "customer") {
      toast.error("Only customers can place orders");
      return;
    }

    // Store shipping data in sessionStorage
    sessionStorage.setItem("shippingData", JSON.stringify(data));
    
    // Navigate to payment page
    router.push("/checkout/payment");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="ml-2 text-sm font-medium">Shipping</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300 mx-2"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Payment</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300 mx-2"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/cart">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Shipping Address</h1>
            <p className="text-muted-foreground">Where should we deliver your order?</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleContinueToPayment)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Shipping Form */}
              <div className="lg:col-span-2">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deletedAddress && (
                      <Alert className="bg-primary/5 border-primary/20 mb-4">
                        <RotateCcw className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-primary font-medium">Restore Address?</AlertTitle>
                        <AlertDescription className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">
                            We found your previously deleted address.
                          </span>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRestore}
                            className="bg-white hover:bg-white/90 border-primary/20 text-primary hover:text-primary/90"
                          >
                            Restore
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter Your First Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter Your Last Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="0771234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Your Address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select District" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DISTRICTS.map((district) => (
                                  <SelectItem key={district} value={district}>
                                    {district}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zip Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="10000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 h-11 text-base font-semibold"
                    >
                      Proceed to Payment
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Package } from "lucide-react";
import Image from "next/image";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --------------------
// Zod Schema
// --------------------
const checkoutSchema = z
  .object({
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

    city: z
      .string()
      .trim()
      .min(2, "City is required and must be at least 2 characters")
      .regex(/^[A-Za-z ]+$/, "City can only contain letters and spaces"),

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

    paymentMethod: z.enum(["cod", "online"], {
      errorMap: () => ({ message: "Payment method is required" }),
    }),

    cardNumber: z.string().optional(),
    expiry: z.string().optional(),
    cvc: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "online") {
      // Card Number Validation
      const cardRegex = /^[0-9]{13,19}$/;
      if (!data.cardNumber || data.cardNumber.length < 13 || data.cardNumber.length > 19 || !cardRegex.test(data.cardNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Card number must be 13-19 digits",
          path: ["cardNumber"],
        });
      }

      // Expiry Validation
      const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
      if (!data.expiry || !expiryRegex.test(data.expiry)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiry is required and must be in MM/YY format",
          path: ["expiry"],
        });
      }

      // CVC Validation
      const cvcRegex = /^[0-9]{3,4}$/;
      if (!data.cvc || !cvcRegex.test(data.cvc)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CVC is required and must be 3 or 4 digits",
          path: ["cvc"],
        });
      }
    }
  });

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// --------------------
// Component
// --------------------
export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const deliveryFee = 2.99;
  const taxRate = 0.08;
  const subtotal = cartTotal;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      zipCode: "",
      phone: "",
      paymentMethod: "cod",
      cardNumber: "",
      expiry: "",
      cvc: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  // Redirect non-customers
  useEffect(() => {
    if (user && user.role !== "customer") {
      if (user.role === "seller") router.push("/seller");
      else if (user.role === "deliverer") router.push("/deliverer");
      else if (user.role === "admin") router.push("/admin");
    }
  }, [user, router]);

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0) router.push("/cart");
  }, [items, router]);

  if (user && user.role !== "customer") return null;
  if (items.length === 0) return null;

  function onSubmit(data: CheckoutFormValues) {
    console.log("Order Data:", data);
    setShowSuccessModal(true);
  }

  function handleCloseSuccessModal() {
    setShowSuccessModal(false);
    clearCart();
    router.push("/customer");
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with Back Button */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Shipping & Payment */}
            <div className="space-y-6">
              {/* Shipping Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
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
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <div className="space-y-3">
                            <div
                              className={`flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-gray-50 ${
                                field.value === "cod" ? "border-black ring-1 ring-black" : "border-gray-200"
                              }`}
                              onClick={() => field.onChange("cod")}
                            >
                              <input
                                type="radio"
                                checked={field.value === "cod"}
                                onChange={() => field.onChange("cod")}
                                className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                              />
                              <Label className="flex-1 cursor-pointer font-medium">Cash on Delivery</Label>
                            </div>

                            <div
                              className={`flex flex-col border p-4 rounded-md cursor-pointer hover:bg-gray-50 ${
                                field.value === "online" ? "border-black ring-1 ring-black" : "border-gray-200"
                              }`}
                              onClick={() => field.onChange("online")}
                            >
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  checked={field.value === "online"}
                                  onChange={() => field.onChange("online")}
                                  className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                                />
                                <div className="flex-1">
                                  <Label className="cursor-pointer font-medium">Online Payment</Label>
                                  <p className="text-xs text-muted-foreground">Credit/Debit Card</p>
                                </div>
                              </div>

                              {field.value === "online" && (
                                <div className="mt-4 space-y-4 pt-4 border-t animate-in fade-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
                                  <FormField
                                    control={form.control}
                                    name="cardNumber"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Card Number</FormLabel>
                                        <FormControl>
                                          <Input placeholder="0000 0000 0000 0000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name="expiry"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Expiry Date</FormLabel>
                                          <FormControl>
                                            <Input placeholder="MM/YY" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="cvc"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>CVC</FormLabel>
                                          <FormControl>
                                            <Input placeholder="123" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 items-start py-2 border-b last:border-0">
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
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 mb-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span className="font-medium">Rs. {deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span className="font-medium">Rs. {tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between mb-6">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-xl">Rs. {total.toFixed(2)}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gray-900 text-white hover:bg-gray-800 h-11 text-base font-semibold"
                  >
                    Place Order
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>

        <Dialog open={showSuccessModal} onOpenChange={handleCloseSuccessModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Order Successful</DialogTitle>
              <DialogDescription className="text-center text-lg py-4">
                Your order was placed successfully.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button onClick={handleCloseSuccessModal} className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

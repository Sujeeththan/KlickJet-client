"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, ShoppingBasket, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is required")
    .regex(
      /^[A-Za-z ]{2,}$/,
      "Name must be at least 2 characters and contain only letters and spaces"
    ),

  email: z
    .string()
    .trim()
    .min(2, "Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Enter a valid email address")
    .toLowerCase(),

  phone_no: z
    .string()
    .trim()
    .min(10, "Phone number is required")
    .regex(/^[0-9]{10,15}$/, "Phone number must be 10–15 digits"),

  address: z
    .string()
    .trim()
    .min(5, "Address is required"),

  vehicleType: z
    .string()
    .trim()
    .min(2, "Vehicle type is required"),

  vehicleNumber: z
    .string()
    .trim()
    .min(2, "Vehicle number is required")
    .regex(/^[A-Z0-9-]+$/, "Invalid vehicle number format"),

  password: z
    .string()
    .min(8, "Password is required")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
      "Password must contain 1 uppercase, 1 number, 1 special character, and be at least 8 characters"
    ),
});

export default function RegisterDelivererPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_no: "",
      address: "",
      vehicleType: "",
      vehicleNumber: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { authService } = await import("@/services/auth.service");
      const response = await authService.register({
        ...values,
        role: "deliverer",
      });
      
      if (response.user) {
        const { toast } = await import("sonner");
        toast.success("Registered successfully, please wait for admin approval");
        router.push("/auth/login");
      }
    } catch (error: any) {
      const { toast } = await import("sonner");
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Centered Popup Card */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden md:h-[700px]">
        {/* Left Side - Registration Form */}
        <div className="relative p-8 md:p-12 flex flex-col justify-center h-full overflow-y-auto">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-900"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-full max-w-md mx-auto space-y-6 py-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Join as Deliverer
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Register to join our delivery team. Approval required.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Your FullName" {...field} className="rounded-lg h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Your Email" {...field} className="rounded-lg h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="0771234567" {...field} className="rounded-lg h-10" />
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
                      <FormLabel className="font-medium">Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City" {...field} className="rounded-lg h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Vehicle Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Bike/Car" {...field} className="rounded-lg h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Vehicle Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-1234" {...field} className="rounded-lg h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter Your Password" {...field} className="rounded-lg h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 h-10 rounded-lg text-primary-foreground font-medium"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register as Deliverer
                </Button>

                <p className="text-center text-xs text-gray-500">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:text-primary/90 font-semibold">
                    Sign in
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block relative h-full bg-gray-900">
          <Image
            src="/register-banner.jpg" 
            alt="Deliver Happiness"
            fill
            className="object-cover opacity-90"
            priority
          />
          {/* Overlay */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-12 bg-black/30">
            <div className="text-center text-white space-y-4">
              <ShoppingBasket className="h-20 w-20 mx-auto opacity-80" />
              <h3 className="text-2xl font-bold tracking-wide text-white drop-shadow-lg">
                Join Our Team
              </h3>
              <h3 className="text-2xl font-bold tracking-wide text-white drop-shadow-lg">
                Deliver Happiness
              </h3>
              <p className="text-gray-100 text-lg drop-shadow-sm max-w-md mx-auto">
                Become a delivery partner and earn on your schedule
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

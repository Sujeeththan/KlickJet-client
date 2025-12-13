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
    .min(1, "Name is required")
    .regex(/^[A-Za-z ]{2,}$/, "Name must contain only letters and spaces"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email address")
    .toLowerCase(),

  phone_no: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{10,15}$/, "Phone number must be 10–15 digits"),

  password: z
    .string()
    .trim()
    .min(1, "Password is required")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
      "Password must have 1 uppercase, 1 number, 1 special character, and be at least 8 characters"
    ),
});

export default function RegisterCustomerPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_no: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { authService } = await import("@/services/auth.service");
      const response = await authService.register({
        ...values,
        role: "customer",
      });
      
      if (response.token && response.user) {
        await login(response.token, response.user);
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
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden md:h-[600px]">
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
          <div className="w-full max-w-sm mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Create Account
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your details to create a new customer account
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
                  Create Account
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
            alt="Grocery Delivery"
            fill
            className="object-cover opacity-90"
            priority
          />
          {/* Overlay */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-12 bg-black/30">
            <div className="text-center text-white space-y-4">
              <ShoppingBasket className="h-20 w-20 mx-auto opacity-80" />
              <h3 className="text-2xl font-bold tracking-wide text-white drop-shadow-lg">
                Your Groceries,
              </h3>
              <h3 className="text-2xl font-bold tracking-wide text-white drop-shadow-lg">
                Delivered in a Click
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

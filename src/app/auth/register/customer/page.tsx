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
import { Loader2, ShoppingBasket } from "lucide-react";
import Link from "next/link";
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
    <div className="min-h-screen flex">
      {/* Left Side - Grocery Theme Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 items-center justify-center p-12">
        <div className="relative w-full h-full max-w-lg flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white space-y-4">
              <ShoppingBasket className="h-32 w-32 mx-auto opacity-50" />
              <h3 className="text-2xl font-bold">Your Groceries,</h3>
              <h3 className="text-2xl font-bold">Delivered in a Click</h3>
              <p className="text-gray-300">
                Shop from your favourite local stores hassle-free
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your details to create a new customer account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="0771234567" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-gray-900 hover:text-gray-700 font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
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
import { Loader2, ShoppingBasket, Facebook, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().trim().min(1, "Email is required").toLowerCase(),

  password: z
    .string()
    .trim()
    .min(1, "Password is required")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
      "Password must have 1 uppercase, 1 number, 1 special character, and be at least 8 characters"
    ),
});

export default function LoginPage() {
  const { login, loading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const redirectPath = getRoleRedirectPath(user.role);
      router.replace(redirectPath);
    }
  }, [loading, isAuthenticated, user, router]);

  // Helper function for role-based redirect
  function getRoleRedirectPath(role: string): string {
    switch (role) {
      case "admin":
        return "/admin";
      case "customer":
        return "/customer";
      case "seller":
        return "/seller";
      case "deliverer":
        return "/deliverer";
      default:
        return "/";
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    form.clearErrors("root"); // Clear previous errors

    try {
      const response = await authService.login({
        email: values.email,
        password: values.password,
      });

      if (response.token && response.user) {
        await login(response.token, response.user);
        // Success - redirect will happen in AuthContext.login()
        toast.success("Login successful!");
      } else {
        throw new Error("No token received from server");
      }
    } catch (error: any) {
      console.error("Login error", error);

      // Extract error message
      let errorMessage = "Login failed. Please check your credentials.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Show error to user
      form.setError("root", {
        message: errorMessage,
      });

      // Show toast notification
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Centered Popup Card */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden md:h-[600px]">
        {/* Left Side - Login Form */}
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
                Log In
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Welcome back! Please enter your details
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                <div className="text-right">
                  <Link
                    href="#"
                    className="text-xs text-primary hover:text-primary/90 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 h-10 rounded-lg text-primary-foreground font-medium"
                  disabled={loading || isSubmitting}
                >
                  {(loading || isSubmitting) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? "Logging in..." : "Log In"}
                </Button>

                {form.formState.errors.root && (
                  <p className="text-sm text-red-600 text-center">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-gray-400">
                      Or Continue With
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" className="w-full h-10 rounded-lg border-gray-300 hover:bg-gray-50">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </Button>
                  <Button type="button" variant="outline" className="w-full h-10 rounded-lg border-gray-300 hover:bg-gray-50">
                    <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                    Facebook
                  </Button>
                </div>

                <p className="text-center text-xs text-gray-500 pt-2">
                  Don't have account?{" "}
                  <Link
                    href="/auth/register/customer"
                    className="text-primary hover:text-primary/90 font-semibold"
                  >
                    Sign up
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block relative h-full bg-gray-900">
          <Image
            src="/login-banner.jpg" 
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

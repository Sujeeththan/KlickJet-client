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
import { Loader2, ShoppingBasket } from "lucide-react";
import Link from "next/link";
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
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Log In
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Please enter your details
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <div className="text-right">
                <Link
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Or Continue With
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button type="button" variant="outline" className="w-full">
                  Google
                </Button>
                <Button type="button" variant="outline" className="w-full">
                  Facebook
                </Button>
              </div>

              <p className="text-center text-sm text-gray-600">
                Don't have account?{" "}
                <Link
                  href="/auth/register/customer"
                  className="text-gray-900 hover:text-gray-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>

      {/* Right Side - Grocery Theme Image */}
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
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PopupModal } from "@/components/ui/popup-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
shopName: z
    .string()
    .trim()
    .min(2, "Shop name is required")
    .regex(
      /^[A-Za-z0-9 ]{3,}$/,
      "Shop name must be at least 3 characters and contain only letters, numbers, and spaces"
    ),

name: z
  .string()
  .trim()
  .min(2, "Owner name is required")
  .regex(
    /^[A-Za-z ]{2,}$/,
    "Owner name must be at least 2 characters and contain only letters and spaces"
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

  password: z
    .string()
    .min(8, "Password is required")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
      "Password must contain 1 uppercase, 1 number, 1 special character, and be at least 8 characters"
    ),
});

export function RegisterSellerModal() {
  const [open, setOpen] = useState(false);
  const { register, isLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shopName: "",
      name: "",
      email: "",
      phone_no: "",
      address: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await register({
        ...values,
        role: "seller",
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      // Error handled by AuthContext toast
    }
  }

  return (
    <PopupModal
      title="Become a Seller"
      description="Register your shop to start selling. Approval required."
      trigger={
        <Button variant="ghost" className="text-sm font-medium">
          Become a Seller
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="shopName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shop Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Shop" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="shop@example.com" {...field} />
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
          </div>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shop Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City" {...field} />
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
            Register Shop
          </Button>
        </form>
      </Form>
    </PopupModal>
  );
}

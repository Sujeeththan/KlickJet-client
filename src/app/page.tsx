"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ArrowRight, Store } from "lucide-react";
import { RegisterSellerModal } from "@/features/auth/RegisterSellerModal";

// Mock data for shops
const shops = [
  {
    id: 1,
    name: "Sujee grocery",
    description: "Your one-stop shop for daily groceries and essentials.",
    image: "/placeholder-shop.jpg", // We'll use a color block if image fails
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: 2,
    name: "Food City",
    description: "Fresh produce, meats, and bakery items delivered fresh.",
    image: "/placeholder-shop.jpg",
    color: "bg-green-100 text-green-700",
  },
  {
    id: 3,
    name: "Keells Super",
    description: "Premium quality products and international brands.",
    image: "/placeholder-shop.jpg",
    color: "bg-red-100 text-red-700",
  },
  {
    id: 4,
    name: "Arpico Super",
    description: "Everything under one roof. Electronics, furniture, and more.",
    image: "/placeholder-shop.jpg",
    color: "bg-blue-100 text-blue-700",
  },
];

export default function IntroPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Choose Your Store</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a shop to browse their exclusive products and offers.
          </p>
          <div className="flex justify-center">
             <RegisterSellerModal
              trigger={
                <Button variant="outline" className="gap-2">
                  Want to sell here? Register your shop
                </Button>
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {shops.map((shop) => (
            <div 
              key={shop.id} 
              className="group relative flex flex-col bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Shop Banner / Icon Area */}
              <div className={`h-32 ${shop.color} flex items-center justify-center`}>
                <Store className="h-12 w-12 opacity-50" />
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-semibold mb-2">{shop.name}</h3>
                <p className="text-muted-foreground mb-6 flex-1">
                  {shop.description}
                </p>
                
                <Link href={`/products?seller=${encodeURIComponent(shop.name)}`} className="w-full">
                  <Button className="w-full gap-2 group-hover:bg-primary/90">
                    Shop Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <footer className="py-6 border-t text-center text-sm text-muted-foreground mt-12">
        © {new Date().getFullYear()} KlickJet. All rights reserved.
      </footer>
    </div>
  );
}

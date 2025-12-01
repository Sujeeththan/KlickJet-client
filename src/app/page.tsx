"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Search, Store } from "lucide-react";
import { RegisterSellerModal } from "@/features/auth/RegisterSellerModal";
import Image from "next/image";

// Mock data for shops
const shops = [
  {
    id: 1,
    name: "Sujee Grocery",
    description: "All home things available",
    image: "/placeholder-shop.jpg", 
  },
  {
    id: 2,
    name: "Food city",
    description: "All home things available",
    image: "/placeholder-shop.jpg",
  },
  {
    id: 3,
    name: "Food city",
    description: "All home things available",
    image: "/placeholder-shop.jpg",
  },
  {
    id: 4,
    name: "Food city",
    description: "All home things available",
    image: "/placeholder-shop.jpg",
  },
  {
    id: 5,
    name: "Food city",
    description: "All home things available",
    image: "/placeholder-shop.jpg",
  },
  {
    id: 6,
    name: "Food city",
    description: "All home things available",
    image: "/placeholder-shop.jpg",
  },
];

export default function IntroPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gray-50 py-16 md:py-24">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                Your Groceries,<br />
                Delivered in a Click
              </h1>
              <p className="text-lg text-gray-500 max-w-lg">
                Shop from your favourite local stores hassle-free.
              </p>
              
              <div className="flex max-w-md gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search Grocery Shops or Items" 
                    className="pl-10 bg-white border-gray-200 h-12"
                  />
                </div>
                <Button className="h-12 px-8 bg-black hover:bg-gray-800 text-white">
                  Search
                </Button>
              </div>
            </div>

            <div className="flex-1 flex gap-4 h-[400px]">
              <div className="flex-1 bg-gray-200 rounded-lg overflow-hidden relative">
                 {/* Placeholder for left image */}
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400">Image 1</div>
              </div>
              <div className="flex-1 bg-gray-200 rounded-lg overflow-hidden relative mt-8">
                 {/* Placeholder for right image (staggered) */}
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400">Image 2</div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Shops Section */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">Our Partner Shops</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shops.map((shop, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow"
              >
                <div className="h-24 w-24 rounded-full bg-gray-300 mb-6 flex items-center justify-center">
                  {/* Circle Placeholder - using gray for strict monochrome */}
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-gray-900">{shop.name}</h3>
                <p className="text-sm text-gray-500 mb-8">
                  {shop.description}
                </p>
                
                <Link href={`/products?seller=${encodeURIComponent(shop.name)}`} className="w-full">
                  <Button className="w-full bg-black hover:bg-gray-800 text-white h-10">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

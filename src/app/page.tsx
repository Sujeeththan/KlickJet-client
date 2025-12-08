"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Store } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for shops
const shops = [
  {
    id: 1,
    name: "Sujee Grocery",
    description: "All home things available",
    image: "/placeholder-shop.jpg",
    location: "Vavuniya",
  },
  {
    id: 2,
    name: "Food city",
    description: "Fresh produce and daily essentials",
    image: "/placeholder-shop.jpg",
    location: "Mullaithivu",
  },
  {
    id: 3,
    name: "Keells Super",
    description: "Quality groceries for your home",
    image: "/placeholder-shop.jpg",
    location: "Jaffna",
  },
  {
    id: 4,
    name: "Arpico Supercentre",
    description: "Everything under one roof",
    image: "/placeholder-shop.jpg",
    location: "Mannar",
  },
  {
    id: 5,
    name: "Laugfs Super",
    description: "24-hour convenience store",
    image: "/placeholder-shop.jpg",
    location: "Killinochi",
  },
  {
    id: 6,
    name: "Sathosa",
    description: "Affordable goods for everyone",
    image: "/placeholder-shop.jpg",
    location: "Anurathapuram",
  },
];

export default function IntroPage() {
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Get unique locations for the filter
  const locations = Array.from(new Set(shops.map(shop => shop.location)));

  // Filter shops based on selection
  const filteredShops = selectedLocation === "all" 
    ? shops 
    : shops.filter(shop => shop.location === selectedLocation);

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
              
              <div className="flex max-w-md gap-4 items-center">
                <div className="flex-1">
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="site-select-trigger h-12 w-full bg-white border-gray-200">
                      <div className="flex items-center gap-2">
                         <Store className="h-4 w-4 text-gray-500" />
                         <SelectValue placeholder="Select your location" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="site-select-content">
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Select your area to see nearby shops
              </p>
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
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-bold text-gray-900">
               {selectedLocation !== "all" ? `Shops in ${selectedLocation}` : "Our Partner Shops"}
             </h2>
             <span className="text-gray-500">
               {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'} found
             </span>
          </div>
          
          {filteredShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredShops.map((shop) => (
                <div 
                  key={shop.id} 
                  className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                >
                  <div className="h-24 w-24 rounded-full bg-gray-300 mb-6 flex items-center justify-center">
                    {/* Circle Placeholder - using gray for strict monochrome */}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1 text-gray-900">{shop.name}</h3>
                  <div className="flex items-center gap-1 mb-2 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600">
                      {shop.location}
                    </span>
                  </div>
                  
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
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No shops found in this area</h3>
              <p className="text-gray-500 mt-2">Try selecting a different location</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

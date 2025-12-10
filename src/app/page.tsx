"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Store } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminService } from "@/services/api";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Shop {
  _id: string;
  shopName: string;
  name: string;
  address: string;
  email?: string;
  phone_no?: string;
}

export default function IntroPage() {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedSellers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchApprovedSellers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getApprovedSellers();
      setShops(response.sellers || []);
    } catch (error) {
      console.error("Error fetching approved sellers:", error);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique locations for the filter (extract from address)
  const locations = Array.from(
    new Set(
      shops
        .map((shop) => {
          // Try to extract location from address (assuming format like "City, District" or just "City")
          const addressParts = shop.address?.split(",") || [];
          return (
            addressParts[addressParts.length - 1]?.trim() ||
            shop.address ||
            "Unknown"
          );
        })
        .filter(Boolean)
    )
  );

  // Filter shops based on selection and user role
  const filteredShops =
    selectedLocation === "all"
      ? shops
      : shops.filter((shop) => {
          const addressParts = shop.address?.split(",") || [];
          const shopLocation =
            addressParts[addressParts.length - 1]?.trim() || shop.address || "";
          return shopLocation.toLowerCase() === selectedLocation.toLowerCase();
        });

  // Apply seller restriction: If user is seller, show ONLY their shop
  const displayShops = (user && user.role === 'seller') 
    ? filteredShops.filter(shop => shop._id === user._id || shop.email === user.email)
    : filteredShops;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <div className="bg-surface-primary py-16 md:py-24">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-secondary leading-tight">
                Your Groceries,
                <br />
                Delivered in a Click
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Shop from your favourite local stores hassle-free.
              </p>

              <div className="flex max-w-md gap-4 items-center">
                <div className="flex-1">
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger className="site-select-trigger h-12 w-full bg-card border-border">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
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
              <p className="text-sm text-muted-foreground/70">
                Select your area to see nearby shops
              </p>
            </div>

            <div className="flex-1 flex gap-4 h-[400px]">
              <div className="flex-1 rounded-lg overflow-hidden relative">
                <Image
                  src="/assets/landing-1.jpg"
                  alt="Woman checking phone for delivery"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 rounded-lg overflow-hidden relative mt-8">
                <Image
                  src="/assets/landing-2.jpg"
                  alt="Fresh vegetables in basket"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Partner Shops Section */}
        {/* We now show this section always, but filtered for sellers */}
        <div>
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {user && user.role === 'seller' 
                  ? "My Shop Preview"
                  : (selectedLocation !== "all" ? `Shops in ${selectedLocation}` : "Our Partner Shops")
                }
              </h2>
              <span className="text-gray-500">
                {displayShops.length}{" "}
                {displayShops.length === 1 ? "shop" : "shops"} found
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : displayShops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayShops.map((shop) => {
                  const addressParts = shop.address?.split(",") || [];
                  const shopLocation =
                    addressParts[addressParts.length - 1]?.trim() ||
                    shop.address ||
                    "Unknown";
                  return (
                    <div
                      key={shop._id}
                      className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                    >
                      <div className="h-24 w-24 rounded-full bg-muted mb-6 flex items-center justify-center">
                        <Store className="h-8 w-8 text-muted-foreground" />
                      </div>

                      <h3 className="text-xl font-bold mb-1 text-foreground">
                        {shop.shopName}
                      </h3>
                      <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
                        <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium text-muted-foreground">
                          {shopLocation}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-8">
                        {shop.address || "Quality products available"}
                      </p>

                      <Link
                        href={`/products?seller_id=${shop._id}`}
                        className="w-full"
                      >
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10">
                          Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-surface-primary rounded-lg border border-dashed border-border">
                <Store className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">
                  No shops found
                </h3>
                <p className="text-muted-foreground mt-2">
                  {selectedLocation !== "all"
                    ? "Try selecting a different location"
                    : "No approved shops available yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

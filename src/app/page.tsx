"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Store, MapPin } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Shop {
  _id: string;
  shopName: string;
  name: string;
  address: string;
  email?: string;
  phone_no?: string;
  shopImage?: string;
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

  // Get unique locations for the filter
  const locations = Array.from(
    new Set(
      shops
        .map((shop) => {
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

              <div className="flex flex-col sm:flex-row w-full max-w-md gap-4 items-center">
                <div className="flex-1 w-full">
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
                {selectedLocation !== "all" && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedLocation("all")}
                    className="h-12 w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground/70">
                Select your area to see nearby shops
              </p>
            </div>

            <div className="flex-1 flex gap-4 h-[300px] md:h-[400px] w-full">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {displayShops.map((shop) => {
                  const addressParts = shop.address?.split(",") || [];
                  const shopLocation =
                    addressParts[addressParts.length - 1]?.trim() ||
                    shop.address ||
                    "Unknown";
                  return (
                    <Card key={shop._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="relative h-48 w-full bg-muted">
                        {shop.shopImage ? (
                          <Image
                            src={shop.shopImage}
                            alt={shop.shopName}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-secondary/10">
                            <Store className="h-16 w-16 text-secondary/40" />
                          </div>
                        )}
                      </div>
                      
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl font-bold text-foreground">{shop.shopName}</CardTitle>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium">{shopLocation}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {shop.address || "Quality products directly from the seller."}
                        </p>
                      </CardContent>
                      
                      <CardFooter>
                        <Link href={`/products?seller_id=${shop._id}`} className="w-full">
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
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

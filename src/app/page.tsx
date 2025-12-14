"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Store, MapPin, Clock, Truck, ShoppingBasket, ShieldCheck, Tag } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface Shop {
  _id: string;
  shopName: string;
  name: string;
  address: string;
  email?: string;
  phone_no?: string;
  shopImage?: string;
}

// Array of placeholder shop images
const PLACEHOLDER_SHOP_IMAGES = [
  "https://images.unsplash.com/photo-1540340061722-9293d5163008?q=80&w=871&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=774&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1628102491629-778571d893a3?q=80&w=580&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=774&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=774&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1601600576337-c1d8a0d1373c?q=80&w=387&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1670684684445-a4504dca0bbc?q=80&w=883&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1655522060985-6769176edff7?q=80&w=774&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=870&auto=format&fit=crop",
  "https://plus.unsplash.com/premium_photo-1664305032567-2c460e29dec1?q=80&w=768&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=387&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1601599963565-b7ba29c8e3ff?q=80&w=464&auto=format&fit=crop"
];

// Helper to get a deterministic random image based on string id
function getPlaceholderImage(id: string) {
  const charCodeSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PLACEHOLDER_SHOP_IMAGES[charCodeSum % PLACEHOLDER_SHOP_IMAGES.length];
}

// Helper to get deterministic random details for a shop
function getShopRandomDetails(id: string) {
  const seed = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Delivery
  const deliveryTimes = ["15-30 mins", "20-40 mins", "30-45 mins", "45-60 mins", "Within 30 mins"];
  const deliveryTime = deliveryTimes[seed % deliveryTimes.length];
  
  // Badges
  const possibleBadges = [
    { text: "Best Seller", variant: "secondary", className: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-none" },
    { text: "Offers Available", variant: "outline", className: "border-blue-200 text-blue-600 bg-blue-50/50" },
    { text: "Top Rated", variant: "secondary", className: "bg-green-100 text-green-700 hover:bg-green-200 border-none" },
    { text: "Premium", variant: "outline", className: "border-purple-200 text-purple-600 bg-purple-50/50" }
  ];
  
  const shopBadges = [];
  // Deterministically select badges
  if (seed % 3 === 0) shopBadges.push(possibleBadges[0]);
  if (seed % 2 === 0) shopBadges.push(possibleBadges[1]);
  if (seed % 5 === 0) shopBadges.push(possibleBadges[2]);
  if (shopBadges.length === 0) shopBadges.push(possibleBadges[3]); // Ensure at least one

  // Timings
  const openTimes = [8, 9, 10];
  const closeTimes = [20, 21, 22, 23];
  const openTime = openTimes[seed % openTimes.length];
  const closeTime = closeTimes[seed % closeTimes.length];
  
  const formatTime = (h: number) => {
    const am = h < 12 ? "AM" : "PM";
    const hour = h % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:00 ${am}`;
  };
  
  const timing = `${formatTime(openTime)} - ${formatTime(closeTime)}`;
  
  return {
    deliveryTime,
    badges: shopBadges.slice(0, 2), // Limit to 2 badges max
    timing,
    openHour: openTime,
    closeHour: closeTime
  };
}

export default function IntroPage() {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHour, setCurrentHour] = useState(12);

  useEffect(() => {
    setCurrentHour(new Date().getHours());
  }, []);

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
        <div className="container mx-auto">
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
Discover fresh products, exclusive deals, and personalized offers.
Support your community while enjoying fast and reliable delivery.
Browse, select, and order—all from the comfort of your home.
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

          <div className="container mx-auto px-4 mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border/20">
              <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl hover:bg-white/50 transition-colors">
                <div className="bg-green-100 p-4 rounded-full shadow-sm">
                  <ShoppingBasket className="h-8 w-8 text-green-700" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground">Fresh Groceries</h4>
                  <p className="text-sm text-muted-foreground">Direct from trusted local shops.</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl hover:bg-white/50 transition-colors">
                <div className="bg-blue-100 p-4 rounded-full shadow-sm">
                  <Truck className="h-8 w-8 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground">Fast Delivery</h4>
                  <p className="text-sm text-muted-foreground">Doorstep delivery in minutes.</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl hover:bg-white/50 transition-colors">
                <div className="bg-purple-100 p-4 rounded-full shadow-sm">
                  <ShieldCheck className="h-8 w-8 text-purple-700" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground">Secure Payment</h4>
                  <p className="text-sm text-muted-foreground">100% secure transactions.</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl hover:bg-white/50 transition-colors">
                <div className="bg-orange-100 p-4 rounded-full shadow-sm">
                  <Tag className="h-8 w-8 text-orange-700" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground">Best Offers</h4>
                  <p className="text-sm text-muted-foreground">Daily discounts & deals.</p>
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
                  
                  const details = getShopRandomDetails(shop._id);
                  const isOpen = currentHour >= details.openHour && currentHour < details.closeHour;
                  
                  return (
                    <Card key={shop._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="relative h-48 w-full bg-muted">
                        <Image
                          src={shop.shopImage || getPlaceholderImage(shop._id)}
                          alt={shop.shopName}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
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
                        
                        <div className="mt-4 space-y-3 pt-3 border-t border-border/50">
                          {/* Delivery Info */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Truck className="h-3.5 w-3.5 text-primary" />
                            <span className="font-medium">Fast Delivery</span>
                            <span className="text-muted-foreground/60">•</span>
                            <span>{details.deliveryTime}</span>
                          </div>

                          {/* Open Status & Timing */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <Clock className={`h-3.5 w-3.5 ${isOpen ? "text-green-600" : "text-red-500"}`} />
                              <span className={`${isOpen ? "text-green-600" : "text-red-500"} font-bold`}>
                                {isOpen ? "Open Now" : "Closed"}
                              </span>
                            </div>
                            <span className="text-muted-foreground font-medium">{details.timing}</span>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {details.badges.map((badge, idx) => (
                              <Badge 
                                key={idx} 
                                variant={badge.variant as any} 
                                className={`h-5 px-1.5 text-[10px] ${badge.className}`}
                              >
                                {badge.text}
                              </Badge>
                            ))}
                          </div>
                        </div>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}

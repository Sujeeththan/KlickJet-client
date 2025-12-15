"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/features/products/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import Link from "next/link";
import { VoiceSearch, VoiceCommand } from "@/components/features/voice/VoiceSearch";
import { useCart } from "@/contexts/CartContext";
import { getShopRandomDetails, isShopOpen } from "@/utils/shopUtils";

function ProductList() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const sellerIdFilter = searchParams.get("seller_id");

  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  const handleVoiceCommand = (command: VoiceCommand) => {
    if (command.action === "search") {
      setSearchInput(command.productName);
      setSearchQuery(command.productName);
      toast.info(`Searching for: ${command.productName}`);
    } else if (command.action === "add") {
       // Find product (fuzzy match)
       const query = command.productName.toLowerCase();
       // Prioritize exact matches or start matches
       const targetProduct = products.find(p => p.name.toLowerCase().includes(query));
       
       if (targetProduct) {
           // Logic to extract seller ID (reused from ProductCard logic safely)
          const sellerId =
            typeof targetProduct.seller_id === "object" && targetProduct.seller_id?._id
              ? targetProduct.seller_id._id
              : typeof targetProduct.seller_id === "string"
              ? targetProduct.seller_id
              : typeof targetProduct.seller === "object" && targetProduct.seller?._id
              ? targetProduct.seller._id
              : typeof targetProduct.seller === "string"
              ? targetProduct.seller
              : undefined;

           if (sellerId) {
             const details = getShopRandomDetails(sellerId);
             const isOpen = isShopOpen(details.openHour, details.closeHour);
             if (!isOpen) {
               const closedMsg = "This shop is currently closed.";
               toast.error(closedMsg);
               if (typeof window !== "undefined" && "speechSynthesis" in window) {
                   const utterance = new SpeechSynthesisUtterance(closedMsg);
                   window.speechSynthesis.speak(utterance);
               }
               return;
             }
           }

           const mainImage =
            targetProduct.images && targetProduct.images.length > 0
              ? targetProduct.images[targetProduct.mainImageIndex || 0]
              : targetProduct.image || "/placeholder.png";

           addToCart({
             id: targetProduct._id,
             title: targetProduct.name,
             price: targetProduct.price,
             sellerId: sellerId,
             image: mainImage
           }, command.quantity);
           
           toast.success(`Voice Assistant: Added ${command.quantity} ${targetProduct.name} to cart`);
       } else {
         const message = "Sorry, the requested product is currently unavailable.";
         toast.error(message);
         
         if (typeof window !== "undefined" && "speechSynthesis" in window) {
           const utterance = new SpeechSynthesisUtterance(message);
           window.speechSynthesis.speak(utterance);
         }
       }
    }
  };
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All products");

  useEffect(() => {
    fetchProducts();
  }, [sellerIdFilter, user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};

      // Restriction: Logged-in users MUST have a seller_id to view products
      // This enforces the "Single Shop" display rule
      if (user && !sellerIdFilter) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Apply seller_id filter if present in URL
      // This allows filtering by specific shop for all users (customers and sellers viewing their own public shop)
      if (sellerIdFilter) {
        params.seller_id = sellerIdFilter;
      }

      const response = await productService.getAll(params);
      setProducts(response.products || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error(error.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== "All products") {
      const categoryMap: Record<string, string> = {
        "Dairy & Eggs": "groceries",
        Bakery: "groceries",
        "Snacks & Beverages": "beverages",
        "Household Essentials": "personal-care",
      };

      const mappedCategory = categoryMap[categoryFilter];
      if (mappedCategory) {
        result = result.filter((product) => {
          const productCategory =
            typeof product.category === "string"
              ? product.category
              : product.category?.name || "";
          return productCategory.toLowerCase() === mappedCategory.toLowerCase();
        });
      }
    }

    return result;
  }, [products, searchQuery, categoryFilter]);

  const categories = [
    "All products",
    "Dairy & Eggs",
    "Bakery",
    "Snacks & Beverages",
    "Household Essentials",
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight mb-4">
                All products are available
                <br />
                your need product order
              </h1>
            </div>
            <div className="md:w-1/2 relative h-64 w-full md:h-80 rounded-lg overflow-hidden">
              <Image
                src="/hero-products.jpg"
                alt="Fresh groceries and cooking"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
          {/* Sidebar Categories */}
          <div className="w-full md:w-64 flex-shrink-0">
            <h2 className="font-bold text-xl mb-6">Categories</h2>
            <div className="space-y-2 ">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`block w-full text-left px-4 py-2 rounded-md transition-colors ${
                    categoryFilter === cat
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-gray-600 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search for products in this Shops"
                  className="pl-10 w-full bg-white border-gray-200"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                />
              </div>
              <div className="flex gap-4">
                <VoiceSearch onCommand={handleVoiceCommand} />
                <Button
                  onClick={handleSearchClick}
                  className="flex-1 sm:flex-none text-white px-8"
                >
                  Search
                </Button>
                {(searchQuery || categoryFilter !== "All products") && (
                  <Button
                    onClick={() => {
                      setSearchInput("");
                      setSearchQuery("");
                      setCategoryFilter("All products");
                    }}
                    variant="outline"
                    className="flex-1 sm:flex-none px-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  // Get seller name from populated seller_id or use seller field
                  const sellerName =
                    typeof product.seller_id === "object" &&
                    product.seller_id?.shopName
                      ? product.seller_id.shopName
                      : typeof product.seller_id === "object" &&
                        product.seller_id?.name
                      ? product.seller_id.name
                      : typeof product.seller === "object" &&
                        product.seller?.shopName
                      ? product.seller.shopName
                      : typeof product.seller === "object" &&
                        product.seller?.name
                      ? product.seller.name
                      : typeof product.seller === "string"
                      ? product.seller
                      : "Unknown Seller";

                  // Get seller ID
                  const sellerId =
                    typeof product.seller_id === "object" &&
                    product.seller_id?._id
                      ? product.seller_id._id
                      : typeof product.seller_id === "string"
                      ? product.seller_id
                      : typeof product.seller === "object" &&
                        product.seller?._id
                      ? product.seller._id
                      : typeof product.seller === "string"
                      ? product.seller
                      : undefined;

                  // Get main image
                  const mainImage =
                    product.images && product.images.length > 0
                      ? product.images[product.mainImageIndex || 0]
                      : product.image || "/placeholder.png";

                  return (
                    <ProductCard
                      key={product._id}
                      id={product._id} // Use MongoDB _id as string
                      title={product.name}
                      description={product.description || ""}
                      price={product.price}
                      seller={sellerName}
                      sellerId={sellerId}
                      image={mainImage}
                      stock={product.stock || product.instock || 0}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                {user && !sellerIdFilter ? (
                  <>
                    <p className="text-lg font-medium text-gray-900 mb-2">Please select a shop</p>
                    <p className="text-gray-500 mb-6">You need to select a shop to view products.</p>
                    <Link href="/">
                      <Button>Browse Shops</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500">No products found</p>
                    {sellerIdFilter && (
                      <p className="text-sm text-gray-400 mt-2">
                        This shop doesn't have any products yet
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

           
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductList />
    </Suspense>
  );
}

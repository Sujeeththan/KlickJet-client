"use client";

import { Header } from "@/components/layout/Header";
import { ProductCard } from "@/features/products/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";

// Mock data for products
const products = [
  {
    id: 1,
    title: "Milo",
    description: "Energy drink",
    price: 150.00,
    seller: "Sujee grocery",
    category: "beverages",
  },
  {
    id: 2,
    title: "Clear shampoo",
    description: "A gentle shampoo that cleans and nourishes your hair for a soft, fresh feel",
    price: 450.00,
    seller: "Sujee grocery",
    category: "personal-care",
  },
  {
    id: 3,
    title: "Soap",
    description: "A refreshing soap that gently cleans your skin and leaves it soft and smooth",
    price: 160.00,
    seller: "Sujee grocery",
    category: "personal-care",
  },
  {
    id: 4,
    title: "Soda",
    description: "Drink",
    price: 450.00,
    seller: "Sujee grocery",
    category: "beverages",
  },

  {
    id:5,
    title: "Milk",
    description: "Drink",
    price: 150.00,
    seller: "Sujee grocery",
    category: "beverages",
  },
    {
    id:6,
    title: "Apple Juice",
    description: "Fresh Drink",
    price: 120.00,
    seller: "Sujee grocery",
    category: "beverages",
  },

    {
    id: 7,
    title: "Rice 5kg",
    description: "White raw rice",
    price: 450.00,
    seller: "Sujee grocery",
    category: "groceries",
  },

    {
    id: 8,
    title: "Sugar 1kg",
    description: "Refined sugar",
    price: 120.00,
    seller: "Sujee grocery",
    category: "groceries",
  },

   {
    id: 9,
    title: "Sunflower Oil 1L",
    description: "Cooking oil",
    price: 190.00,
    seller: "Sujee grocery",
    category: "groceries",
  },

    {
    id: 10,
    title: "Salt 1kg",
    description: "Iodized salt",
    price: 25.00,
    seller: "Sujee grocery",
    category: "groceries",
  },

    {
    id: 11,
    title: "Tea Powder 250g",
    description: "Premium tea blend",
    price: 150.00,
    seller: "Sujee grocery",
    category: "beverages",
  },

    {
    id: 12,
    title: "Bread",
    description: "Fresh bakery bread",
    price: 50.00,
    seller: "Sujee grocery",
    category: "groceries",
  },

   {
    id: 13,
    title: "Eggs (6 pcs)",
    description: "Farm eggs",
    price: 60.00,
    seller: "Sujee grocery",
    category: "groceries",
  }

];

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// ... (imports)

function ProductList() {
  const searchParams = useSearchParams();
  const sellerFilter = searchParams.get("seller");

  // State for search input (what user is typing)
  const [searchInput, setSearchInput] = useState("");
  // State for active search query (what to actually filter by - only set on Enter)
  const [searchQuery, setSearchQuery] = useState("");
  // State for category filter
  const [categoryFilter, setCategoryFilter] = useState("all");
  // State for sort option
  const [sortOption, setSortOption] = useState("newest");

  // Handle Enter key press for search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(searchInput);
    }
  };

  // Filter and sort products based on independent filters
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply seller filter from URL
    if (sellerFilter) {
      result = result.filter(
        (product) => product.seller.toLowerCase() === sellerFilter.toLowerCase()
      );
    }

    // Apply search filter (only if searchQuery is set via Enter key)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.seller.toLowerCase().includes(query)
      );
    }

    // Apply category filter (independent of search)
    if (categoryFilter !== "all") {
      result = result.filter((product) => product.category === categoryFilter);
    }

    // Apply sorting (independent of search and category)
    switch (sortOption) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        // Keep original order for newest
        break;
    }

    return result;
  }, [searchQuery, categoryFilter, sortOption, sellerFilter]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {sellerFilter ? `${sellerFilter}'s Store` : "Welcome to Online Store"}
          </h1>
          <p className="text-gray-500">
            {sellerFilter 
              ? "Browse products from this seller" 
              : "Discover amazing products from trusted sellers"}
          </p>
          {sellerFilter && (
             <Button variant="link" className="p-0 h-auto text-primary" onClick={() => window.history.back()}>
               ← Back to all shops
             </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search products... (Press Enter to search)" 
              className="pl-10 pr-10 w-full"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {(searchInput || searchQuery) && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
                <SelectItem value="groceries">Groceries</SelectItem>
                <SelectItem value="personal-care">Personal Care</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Info */}
        {searchQuery && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "{searchQuery}"
            {filteredProducts.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchInput("");
                }}
                className="ml-2 text-blue-600 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                description={product.description}
                price={product.price}
                seller={product.seller}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
            {(searchQuery || categoryFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchInput("");
                  setCategoryFilter("all");
                  setSortOption("newest");
                }}
                className="mt-4 text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </main>
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

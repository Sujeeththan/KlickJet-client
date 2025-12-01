"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/features/products/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

// Mock data for products
const products = [
  {
    id: 1,
    title: "Juice",
    description: "Mango juice 1L",
    price: 300.00,
    seller: "Sujee Grocery",
    category: "beverages",
    image: "/placeholder.png"
  },
  {
    id: 2,
    title: "Milk",
    description: "Pure Milk 1L",
    price: 200.00,
    seller: "Sujee Grocery",
    category: "beverages",
    image: "/placeholder.png"
  },
  {
    id: 3,
    title: "Rice",
    description: "White rice 1kg",
    price: 300.00,
    seller: "Sujee Grocery",
    category: "groceries",
    image: "/placeholder.png"
  },
  {
    id: 4,
    title: "Sugar",
    description: "Sweet 1kg",
    price: 200.00,
    seller: "Sujee Grocery",
    category: "groceries",
    image: "/placeholder.png"
  },
  {
    id: 5,
    title: "Biscuits",
    description: "Chocolate 1",
    price: 250.00,
    seller: "Sujee Grocery",
    category: "snacks",
    image: "/placeholder.png"
  },
  {
    id: 6,
    title: "Pepsi",
    description: "Energy 1.5L",
    price: 400.00,
    seller: "Sujee Grocery",
    category: "beverages",
    image: "/placeholder.png"
  },
  {
    id: 7,
    title: "Shampoo",
    description: "Clear shampoo 200ml",
    price: 780.00,
    seller: "Sujee Grocery",
    category: "personal-care",
    image: "/placeholder.png"
  },
  {
    id: 8,
    title: "Soap",
    description: "Lux 1",
    price: 160.00,
    seller: "Sujee Grocery",
    category: "personal-care",
    image: "/placeholder.png"
  },
  // Add more items to match the grid if needed
];

function ProductList() {
  const searchParams = useSearchParams();
  const sellerFilter = searchParams.get("seller");

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All products");

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (sellerFilter) {
      result = result.filter(
        (product) => product.seller.toLowerCase() === sellerFilter.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== "All products") {
      const categoryMap: Record<string, string> = {
        "Dairy & Eggs": "groceries",
        "Bakery": "groceries",
        "Snacks & Beverages": "beverages",
        "Household Essentials": "personal-care"
      };
      
      const mappedCategory = categoryMap[categoryFilter];
      if (mappedCategory) {
        result = result.filter((product) => product.category === mappedCategory);
      }
    }

    return result;
  }, [searchQuery, categoryFilter, sellerFilter]);

  const categories = [
    "All products",
    "Dairy & Eggs",
    "Bakery",
    "Snacks & Beverages",
    "Household Essentials"
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                All products are available<br />
                your need product order
              </h1>
            </div>
            <div className="md:w-1/2 relative h-64 w-full md:h-80 bg-gray-200 rounded-lg overflow-hidden">
               {/* Placeholder for the hero image */}
               <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                 Hero Image
               </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
          {/* Sidebar Categories */}
          <div className="w-full md:w-64 flex-shrink-0">
            <h2 className="font-bold text-xl mb-6">Categories</h2>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`block w-full text-left px-4 py-2 rounded-md transition-colors ${
                    categoryFilter === cat
                      ? "bg-gray-200 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
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
            <div className="flex gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search for products in this Shops" 
                  className="pl-10 w-full bg-white border-gray-200"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSearchClick}
                className="bg-black hover:bg-gray-800 text-white px-8"
              >
                Search
              </Button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  description={product.description}
                  price={product.price}
                  seller={product.seller}
                  image={product.image}
                />
              ))}
            </div>
            
            {/* Bottom Images Grid (as seen in design usually) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-16">
               <div className="h-40 bg-gray-100 rounded-lg"></div>
               <div className="h-40 bg-gray-100 rounded-lg"></div>
               <div className="h-40 bg-gray-100 rounded-lg"></div>
               <div className="h-40 bg-gray-100 rounded-lg"></div>
            </div>
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


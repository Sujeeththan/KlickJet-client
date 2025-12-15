"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, ShoppingCart, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { getShopRandomDetails, isShopOpen } from "@/utils/shopUtils";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const productId = params.id as string;

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getById(productId);
      setProduct(response.product);
    } catch (error: any) {
      console.error("Error fetching product:", error);
      toast.error(error.message || "Failed to fetch product");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-gray-500 mb-6">
              The product you're looking for doesn't exist.
            </p>
            <Link href="/products">
              <Button className="bg-gray-900 text-white hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Get seller name from populated seller_id or use seller field
  const sellerName =
    typeof product.seller_id === "object" && product.seller_id?.shopName
      ? product.seller_id.shopName
      : typeof product.seller_id === "object" && product.seller_id?.name
      ? product.seller_id.name
      : typeof product.seller === "object" && product.seller?.shopName
      ? product.seller.shopName
      : typeof product.seller === "object" && product.seller?.name
      ? product.seller.name
      : typeof product.seller === "string"
      ? product.seller
      : "Unknown Seller";

  // Get category
  const category =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || "";

  // Get main image
  const mainImage =
    product.images && product.images.length > 0
      ? product.images[product.mainImageIndex || 0]
      : product.image || "/placeholder.png";

  const handleAddToCart = () => {
    // Calculate sellerId
    const sellerId =
      typeof product.seller_id === "object" && product.seller_id?._id
        ? product.seller_id._id
        : typeof product.seller_id === "string"
        ? product.seller_id
        : typeof product.seller === "object" && product.seller?._id
        ? product.seller._id
        : typeof product.seller === "string"
        ? product.seller
        : undefined;

    if (sellerId) {
      const details = getShopRandomDetails(sellerId);
      const isOpen = isShopOpen(details.openHour, details.closeHour);
      if (!isOpen) {
        toast.error("This shop is currently closed.");
        return;
      }
    }

    addToCart(
      {
        id: product._id,
        title: product.name,
        description: product.description,
        price: product.price,
        seller: sellerName,
        image: mainImage,
      },
      quantity
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/products">
          <Button variant="ghost" className="mb-6 -ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="aspect-square relative bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {mainImage && mainImage !== "/placeholder.png" ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <Package className="h-32 w-32 text-gray-400" />
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize">
                {category.replace("-", " ")}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {product.name}
            </h1>

            <p className="text-gray-600 mb-6 text-lg">
              {product.description || "No description available"}
            </p>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Sold by</p>
              <p className="text-lg font-semibold">{sellerName}</p>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-2">Price</p>
              <p className="text-4xl font-bold text-gray-900">
                Rs. {product.price.toFixed(2)}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  className="h-10 w-10"
                >
                  -
                </Button>
                <span className="text-xl font-semibold w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  className="h-10 w-10"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleAddToCart}
                className="w-full text-white h-12 text-lg font-semibold"
                disabled={addedToCart}
              >
                {addedToCart ? (
                  <>
                    <span className="mr-2">✓</span> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                Total: Rs. {(product.price * quantity).toFixed(2)}
              </p>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-semibold mb-3">Product Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Product ID:</span>
                  <span className="font-medium">#{product._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-medium capitalize">
                    {category.replace("-", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Stock:</span>
                  <span className="font-medium">
                    {product.stock || product.instock || 0} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Availability:</span>
                  <span
                    className={`font-medium ${
                      (product.stock || product.instock || 0) > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(product.stock || product.instock || 0) > 0
                      ? "In Stock"
                      : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

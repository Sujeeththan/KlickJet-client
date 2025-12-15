"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, MapPin, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

import { toast } from "sonner";
import { getShopRandomDetails, isShopOpen } from "@/utils/shopUtils";

interface ProductCardProps {
  id: number | string;
  title: string;
  description: string;
  price: number;
  seller: string;
  sellerId?: string;
  image?: string;
  stock?: number;
}

export function ProductCard({
  id,
  title,
  description,
  price,
  seller,
  sellerId,
  image,
  stock = 100,
}: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a Link (though we moved Link)

    if (sellerId) {
      const details = getShopRandomDetails(sellerId);
      const isOpen = isShopOpen(details.openHour, details.closeHour);
      
      if (!isOpen) {
        toast.error("This shop is currently closed.");
        return;
      }
    }
    
    addToCart({ id, title, description, price, seller, sellerId, image });
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300 bg-white rounded-xl border border-gray-200">
      {/* Product Image */}
      <Link href={`/products/${id}`} className="block">
        <div className="aspect-[4/2] relative bg-muted flex items-center justify-center overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Package className="h-5 w-5 text-muted-foreground/50" />
          )}
        </div>
      </Link>

      {/* Product Details */}
      <CardContent className="p-2.5 flex-1 flex flex-col">
        {/* Product Title */}
        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-sm text-foreground mb-0.5 hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2">
          {description}
        </p>

        {/* Price */}
        <p className="text-base font-bold text-foreground mb-0.5">
          Rs. {price.toFixed(2)}
        </p>

        {/* Stock */}
        <p className="text-xs text-muted-foreground mb-0.5">Stock: {stock}</p>

        {/* Store/Seller Info */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="h-3 w-3" />
          <span>{seller}</span>
        </div>

        {/* Add to List Button */}
        <div className="mt-auto">
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-1.5 flex items-center justify-center gap-1.5 text-xs"
          >
            Add to List
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

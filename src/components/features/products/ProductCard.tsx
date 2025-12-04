"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: number;
  title: string;
  description: string;
  price: number;
  seller: string;
  image?: string;
}

export function ProductCard({ id, title, description, price, seller, image }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({ id, title, description, price, seller, image });
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-square relative bg-gray-100 flex items-center justify-center">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <Package className="h-12 w-12 text-gray-400" />
        )}
      </div>
      <CardContent className="p-3 flex-1">
        <h3 className="font-semibold text-base mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {description}
        </p>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-lg font-bold">Rs. {price.toFixed(2)}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">by {seller}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex gap-2">
        <Button 
          onClick={handleAddToCart}
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8"
        >
          Add to Cart
        </Button>
        <Link href={`/products/${id}`} className="flex-1">
          <Button size="sm" className="w-full bg-gray-900 text-white hover:bg-gray-800 text-xs h-8">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

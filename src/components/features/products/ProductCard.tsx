import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Package } from "lucide-react";

interface ProductCardProps {
  title: string;
  description: string;
  price: number;
  seller: string;
  image?: string;
}

export function ProductCard({ title, description, price, seller, image }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative bg-gray-100 flex items-center justify-center">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <Package className="h-16 w-16 text-gray-400" />
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {description}
        </p>
        <div className="flex items-baseline justify-between mt-4">
          <span className="text-xl font-bold">Rs. {price.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">0</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">by {seller}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-gray-900 text-white hover:bg-gray-800">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { User, ShoppingCart, LogOut, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isProductsPage = pathname === "/products";
  const isHomePage = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const NavLinks = ({ className = "" }: { className?: string }) => (
    <>
      {isProductsPage && (
        <Link
          href="/"
          className={`text-sm font-medium text-muted-foreground hover:text-foreground transition-colors ${className}`}
          onClick={() => setIsOpen(false)}
        >
          Shops
        </Link>
      )}
      {user && user.role === "seller" && !isHomePage && (
        <Link
          href="/"
          className={`text-sm font-medium text-muted-foreground hover:text-foreground transition-colors ${className}`}
          onClick={() => setIsOpen(false)}
        >
          Home
        </Link>
      )}
      {(!user || user.role === "customer") && (
        <Link
          href="/cart"
          className={`flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative ${className}`}
          onClick={() => setIsOpen(false)}
        >
          <ShoppingCart className="h-4 w-4" />
          Cart
          {cartCount > 0 && (
            <Badge
              variant="destructive"
              className="ml-1 h-5 min-w-5 flex items-center justify-center px-1 text-xs"
            >
              {cartCount}
            </Badge>
          )}
        </Link>
      )}
      {user ? (
        <>
          <Link
            href="/customer"
            className={`flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors ${className}`}
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4" />
            Dashboard
          </Link>
          <span className={`text-sm text-muted-foreground ${className}`}>
            {user.email}
          </span>
          {user.role !== "admin" &&
            user.role !== "seller" &&
            user.role !== "deliverer" && (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors ${className}`}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
        </>
      ) : (
        <>
          {mounted && (
            <>
              <Link
                href="/auth/register/seller"
                className={`text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors ${className}`}
                onClick={() => setIsOpen(false)}
              >
                Become a Seller
              </Link>
              <Link
                href="/auth/register/deliverer"
                className={`text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors ${className}`}
                onClick={() => setIsOpen(false)}
              >
                Join as Deliverer
              </Link>
              <div
                className={`flex items-center gap-3 ${
                  className === "flex-col items-start gap-4"
                    ? "flex-col items-start w-full"
                    : "ml-2"
                }`}
              >
                <Link
                  href="/auth/register/customer"
                  className={`text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 border border-border rounded-md hover:bg-accent ${
                    className === "flex-col items-start gap-4"
                      ? "w-full text-center"
                      : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  href="/auth/login"
                  className={`text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors px-4 py-2 rounded-md ${
                    className === "flex-col items-start gap-4"
                      ? "w-full text-center"
                      : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </>
  );

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="KlickJet Logo"
            width={500}
            height={500}
            className="h-25 w-30 object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLinks />
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-6">
              <NavLinks className="flex-col items-start gap-4" />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

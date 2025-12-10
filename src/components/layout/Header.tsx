import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { User, ShoppingCart, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Shops
          </Link>
          {(!user || user.role === "customer") && (
            <Link 
              href="/cart" 
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              {cartCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 min-w-5 flex items-center justify-center px-1 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Link>
          )}
          {user ? (
            <>
              <Link 
                href="/customer" 
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              {user.role !== 'admin' && user.role !== 'seller' && user.role !== 'deliverer' && (
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </>
          ) : (
            <>
              {mounted && (
                <>
                  <Link 
                    href="/auth/register/seller"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Become a Seller
                  </Link>
                  <Link 
                    href="/auth/register/deliverer"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Join as Deliverer
                  </Link>
                  <div className="flex items-center gap-3 ml-2">
                    <Link 
                      href="/auth/register/customer"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 border border-border rounded-md hover:bg-accent"
                    >
                      Sign Up
                    </Link>
                    <Link 
                      href="/auth/login"
                      className="text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors px-4 py-2 rounded-md"
                    >
                      Sign In
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

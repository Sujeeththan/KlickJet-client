"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { User, ShoppingCart, LogOut } from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";
import { RegisterCustomerModal } from "@/components/auth/RegisterCustomerModal";
import { RegisterSellerModal } from "@/components/auth/RegisterSellerModal";
import { RegisterDelivererModal } from "@/components/auth/RegisterDelivererModal";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="KlickJet Logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <span className="text-xl font-semibold text-gray-900">Online Store</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link 
                href="/customer" 
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
              <Link 
                href="/orders" 
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                Orders
              </Link>
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <RegisterSellerModal />
              <RegisterDelivererModal />
              <div className="flex items-center gap-3 ml-2">
                <RegisterCustomerModal />
                <LoginModal />
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

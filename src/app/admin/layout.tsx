"use client";

import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Truck, 
  ListTree, 
  Package, 
  ShoppingCart, 
  BarChart3 
} from "lucide-react";

const adminLinks = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Sellers",
    href: "/admin/sellers",
    icon: ShoppingBag, // Using ShoppingBag as a proxy for Sellers icon if specific one not available
  },
  {
    title: "Deliverers",
    href: "/admin/deliverers",
    icon: Truck,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: ListTree,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 border-r md:sticky md:block">
        <Sidebar links={adminLinks} className="w-full h-full" />
      </aside>
        <main className="flex w-full flex-col overflow-hidden p-1">
            <div className="md:hidden p-4">
                <MobileSidebar links={adminLinks} />
            </div>
            {children}
        </main>
      </div>
    </div>
  );
}

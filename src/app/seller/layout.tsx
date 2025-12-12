"use client";

import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart,
  Settings,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const sellerLinks = [
  {
    title: "Dashboard",
    href: "/seller",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/seller/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/seller/orders",
    icon: ShoppingCart,
  },
  {
    title: "Settings",
    href: "/seller/settings",
    icon: Settings,
  },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <ScrollArea className="h-full py-6 pr-6 lg:py-8">
            <Sidebar links={sellerLinks} className="w-full" />
          </ScrollArea>
        </aside>
        <main className="flex w-full flex-col overflow-hidden p-1">
          <div className="md:hidden p-4">
            <MobileSidebar links={sellerLinks} />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}


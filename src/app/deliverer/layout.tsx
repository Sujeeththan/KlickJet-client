"use client";

import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { 
  LayoutDashboard, 
  Truck,
} from "lucide-react";

const delivererLinks = [
  {
    title: "Dashboard",
    href: "/deliverer",
    icon: LayoutDashboard,
  },
  {
    title: "Deliveries",
    href: "/deliverer/deliveries",
    icon: Truck,
  },
];

export default function DelivererLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 border-r md:sticky md:block">
          <Sidebar links={delivererLinks} className="w-full h-full" />
        </aside>
        <main className="flex w-full flex-col overflow-hidden p-1">
          <div className="md:hidden p-4">
            <MobileSidebar links={delivererLinks} />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

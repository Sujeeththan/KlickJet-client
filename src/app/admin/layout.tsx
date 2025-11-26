"use client";

import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LayoutDashboard, Users, CheckSquare, Settings } from "lucide-react";

const adminLinks = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Approvals",
    href: "/admin/approvals",
    icon: CheckSquare,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
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
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <ScrollArea className="h-full py-6 pr-6 lg:py-8">
            <Sidebar links={adminLinks} className="w-full" />
          </ScrollArea>
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

import { ScrollArea } from "@/components/ui/scroll-area";

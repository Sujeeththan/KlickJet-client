"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <Header />
      <main className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white shadow-sm">
          <CardContent className="flex flex-col items-center text-center p-12 space-y-6">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-2">
              <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Page Not Found</h1>
              <p className="text-muted-foreground text-lg">
                The page you are looking for does not exist or has been moved.
              </p>
            </div>

            <div className="pt-4">
              <Link href="/">
                <Button className="w-full sm:w-auto min-w-[140px] h-11 text-base">
                  Return Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

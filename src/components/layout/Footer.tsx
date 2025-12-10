import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

// Custom TikTok icon since it's not in lucide-react (or use a placeholder)
const TikTok = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-surface-secondary pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* About Section */}
          <div>
            <h3 className="font-bold text-lg mb-4">About KlickJet</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your one-stop shop for the freshest groceries and household essentials.
              Quality products, unbeatable prices.
            </p>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Help & Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">Contact Us</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">FAQ</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">Shipping</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">Track Order</Link>
              </li>
            </ul>
          </div>

          {/* Privacy */}
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="font-bold text-lg mb-4">Privacy</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-foreground">About Us</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">Careers</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">Press</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">Terms of services</Link>
                </li>
              </ul>
            </div>

            {/* Social Icons */}
            <div className="mt-8 md:mt-0 flex gap-4 self-end">
              <Link href="#" className="text-black hover:opacity-80">
                <Instagram className="h-8 w-8" />
              </Link>
              <Link href="#" className="text-black hover:opacity-80">
                <Facebook className="h-8 w-8" />
              </Link>
              <Link href="#" className="text-black hover:opacity-80">
                <TikTok className="h-8 w-8" />
              </Link>
              <Link href="#" className="text-black hover:opacity-80">
                <Twitter className="h-8 w-8" />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} KlickJet. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

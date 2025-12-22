import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Left: Logo & Social Icons */}
          <div>
            <div className="mb-4">
              <Image 
                src="/logo.png" 
                alt="KlickJet" 
                width={140} 
                height={40} 
                className="" 
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              Your one-stop shop for the freshest groceries and household essentials.
              Quality products, unbeatable prices.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4">
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

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">Home</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-foreground">Products</Link>
              </li>
              <li>
                <Link href="/auth/register/seller" className="hover:text-foreground">Become a Seller</Link>
              </li>
              <li>
                <Link href="/auth/register/deliverer" className="hover:text-foreground">Join as Deliverer</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help & Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Help & Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">FAQ</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">Shipping</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">Track Order</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Vavuniya Town</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-5 w-5 shrink-0" />
                <span>+94 760505419</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-5 w-5 shrink-0" />
                <span>KlickJet@gmail.com</span>
              </li>
            </ul>
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

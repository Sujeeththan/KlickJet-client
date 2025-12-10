"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new multi-step checkout flow
    router.replace("/checkout/shipping");
  }, [router]);

  return null;
}

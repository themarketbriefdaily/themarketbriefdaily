"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { Tier } from "@/lib/tiers";

export function CheckoutButton({
  tier,
  children,
  variant = "primary",
  isLoggedIn,
}: {
  tier: Tier;
  children: React.ReactNode;
  variant?: ButtonProps["variant"];
  isLoggedIn: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function start() {
    if (!isLoggedIn) {
      router.push(`/login?next=/pricing?plan=${tier}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Checkout is not configured yet. Add your Stripe keys to enable it.");
        setLoading(false);
      }
    } catch {
      alert("Could not start checkout.");
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} size="lg" className="w-full" onClick={start} disabled={loading}>
      {loading ? "Redirecting…" : children}
    </Button>
  );
}

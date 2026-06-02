"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/markets", label: "Markets" },
  { href: "/investments", label: "Portfolios" },
  { href: "/research", label: "Research" },
  { href: "/learn", label: "Learn" },
  { href: "/pricing", label: "Pricing" },
];

export function Header({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[72px] transition-colors duration-300",
        scrolled
          ? "border-b border-line bg-bg/85 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-bg/60 backdrop-blur-md",
      )}
    >
      <div className="container-tbp flex h-full items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="The Market Brief Daily">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-ink font-display text-base font-extrabold text-white">
            M
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight">
            The Market Brief Daily
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium text-muted transition-colors hover:text-ink",
                pathname.startsWith(item.href) && "text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={isLoggedIn ? "/account" : "/login"}
            className="hidden text-sm font-medium text-muted transition-colors hover:text-ink sm:block"
          >
            {isLoggedIn ? "Account" : "Sign in"}
          </Link>
          <Link
            href="/pricing"
            className="hidden items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-ink-2 sm:inline-flex"
          >
            Get access <span aria-hidden>↗</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-line lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-bg lg:hidden">
          <nav className="container-tbp flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line-soft py-3 text-[15px] font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Link href={isLoggedIn ? "/account" : "/login"} className="py-3 text-[15px] font-medium">
              {isLoggedIn ? "Account" : "Sign in"}
            </Link>
            <Link href="/pricing" className="py-3 text-[15px] font-semibold text-warm">
              Get access ↗
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

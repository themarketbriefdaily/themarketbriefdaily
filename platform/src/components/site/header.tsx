"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/investments", label: "Investments" },
  { href: "/research", label: "Research" },
  { href: "/tools", label: "Tools" },
  { href: "/education", label: "Education" },
  { href: "/about", label: "About" },
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
        // No backdrop-filter: a blurred fixed header over scrolling content
        // causes white repaint smears in Chromium. Alpha background only.
        "fixed inset-x-0 top-0 z-50 h-[72px] transition-colors duration-300",
        scrolled
          ? "border-b border-line bg-bg"
          : "border-b border-transparent bg-bg/90",
      )}
    >
      <div className="container-tbp flex h-full items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="The Market Brief Daily">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-ink font-display text-[13px] font-extrabold tracking-[.02em] text-bg">
            M
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight">
            The Market Brief Daily
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative py-1.5 font-display text-[14.5px] font-medium text-ink-2 transition-colors hover:text-ink",
                  active && "text-ink",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-0 -bottom-px h-[1.5px] rounded-full bg-warm" />
                )}
              </Link>
            );
          })}
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className={`tbp tbp-header${scrolled ? " scrolled" : ""}`} role="banner">
        <div className="tbp-container tbp-header-inner">
          <Link className="tbp-brand" href="/" aria-label="The Market Brief Daily">
            <span className="mark">M</span>
            <span>The Market Brief Daily</span>
          </Link>

          <nav className="tbp-nav" aria-label="Primary">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={isActive(item.href) ? "is-active" : ""}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link className="tbp-cta-mini" href={isLoggedIn ? "/account" : "/pricing"}>
            {isLoggedIn ? "Account" : "Get access"} <span className="arrow">↗</span>
          </Link>

          <button
            className="tbp-burger"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </header>

      <div className={`tbp-mobile-menu${open ? " open" : ""}`} role="navigation" aria-label="Mobile">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link href={isLoggedIn ? "/account" : "/pricing"}>
          {isLoggedIn ? "Account" : "Subscribe"} ↗
        </Link>
      </div>
    </>
  );
}

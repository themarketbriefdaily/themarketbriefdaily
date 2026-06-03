import type { Metadata } from "next";
import { Inter, Inter_Tight, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["italic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.themarketbriefdaily.com"),
  title: {
    default: "The Market Brief Daily — Independent macro & market structure research",
    template: "%s — The Market Brief Daily",
  },
  description:
    "Institutional-grade macro and market-structure research. Daily briefings, transparent model portfolios, live indicators, AI tools, and a finance education library.",
  openGraph: {
    type: "website",
    siteName: "The Market Brief Daily",
    title: "The Market Brief Daily",
    description:
      "Independent macro and market-structure research, model portfolios, live indicators and education.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} ${fraunces.variable}`}>
      <head>
        {/* Original design-system stylesheets (served from /public/assets) — the
            exact look of the original site. Scoped to `.tbp` wrappers. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;850&family=Inter:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@1,9..144,300..600&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/tbp-theme.css" />
        <link rel="stylesheet" href="/assets/tbp-premium.css" />
      </head>
      <body
        style={
          {
            ["--font-sans" as string]: "var(--font-inter)",
            ["--font-display" as string]: "var(--font-inter-tight)",
            ["--font-serif" as string]: "var(--font-fraunces)",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}

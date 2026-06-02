import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  GraduationCap,
  FileText,
  Lock,
  Activity,
  ExternalLink,
} from "lucide-react";
import { getSessionContext } from "@/lib/entitlements";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/courses", label: "Courses & questions", icon: GraduationCap },
  { href: "/admin/posts", label: "Research posts", icon: FileText },
  { href: "/admin/paywall", label: "Paywall rules", icon: Lock },
  { href: "/admin/indicators", label: "Indicator sources", icon: Activity },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware already guards /admin, but enforce here too for defence in depth.
  // When Supabase is unconfigured we allow access in dev so the panel is viewable.
  if (isSupabaseConfigured) {
    const ctx = await getSessionContext();
    if (!ctx.isLoggedIn) redirect("/login?next=/admin");
    if (ctx.role !== "admin") redirect("/account");
  }

  return (
    <div className="flex min-h-screen bg-bg-alt">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-card lg:flex">
        <Link href="/" className="flex items-center gap-2.5 border-b border-line px-6 py-5">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-ink font-display text-base font-extrabold text-white">
            M
          </span>
          <span className="font-display text-sm font-bold tracking-tight">Admin</span>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-bg-alt hover:text-ink"
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          className="flex items-center gap-2 border-t border-line px-6 py-4 text-sm text-muted hover:text-ink"
        >
          <ExternalLink size={15} /> View site
        </Link>
      </aside>

      <div className="flex-1 overflow-x-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-line bg-card px-5 py-4 lg:hidden">
          <span className="font-display text-sm font-bold">Admin</span>
          <Link href="/" className="text-sm text-muted">
            View site
          </Link>
        </div>
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}

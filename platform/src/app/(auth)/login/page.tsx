import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink font-display text-[13px] font-extrabold tracking-[.02em] text-bg">
              M
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight">
              The Market Brief Daily
            </span>
          </Link>

          {!isSupabaseConfigured ? (
            <div className="rounded-xl border border-warm/30 bg-warm/[0.06] p-5 text-sm text-ink-2">
              <p className="font-semibold">Authentication isn&apos;t configured yet.</p>
              <p className="mt-2 text-muted">
                Add <code className="rounded bg-bg-alt px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="rounded bg-bg-alt px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
                <code className="rounded bg-bg-alt px-1">.env.local</code> to enable sign-in. See the
                README migration steps.
              </p>
            </div>
          ) : (
            <Suspense>
              <LoginForm />
            </Suspense>
          )}
        </div>
      </div>

      <div className="relative hidden bg-midnight lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-london-night.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="font-display text-3xl font-extrabold leading-tight tracking-tight">
            Markets, read with <span className="serif-em text-white/90">discipline.</span>
          </p>
          <p className="mt-3 max-w-md text-sm text-white/70">
            Institutional-grade macro and market-structure research, model portfolios and live
            indicators.
          </p>
        </div>
      </div>
    </div>
  );
}

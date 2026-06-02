export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * The whole app degrades gracefully when Supabase is not yet configured:
 * auth-gated features render as "logged-out / free tier" and the public,
 * marketing, indicator and education surfaces all still work. This lets the
 * site run with `npm run dev` before any keys exist.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

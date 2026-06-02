# The Market Brief Daily — Platform

Premium Next.js rebuild of themarketbriefdaily.com: institutional research, model
portfolios, live indicators, a paywalled education/question bank, Stripe billing
and an admin panel.

- **Framework:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4
- **Auth + DB:** Supabase (Postgres + Auth + RLS)
- **Billing:** Stripe (Checkout + Customer Portal + webhooks)
- **Indicators:** FRED API + the existing GitHub Actions data pipeline
- **Charts:** Recharts · **UI:** Radix primitives + a small shadcn-style kit

> The app **runs with zero configuration** — without keys it degrades gracefully
> (logged-out / free tier, sample admin data, fallback indicator values). Add
> keys to light up auth, billing and live macro data.

---

## 1. Local development

```bash
cd platform
npm install
cp .env.example .env.local   # fill in as you go (optional to start)
npm run dev                  # http://localhost:3000
```

## 2. Supabase (auth + database)

1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → API** → copy into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
3. Run the schema: open `supabase/migrations/0001_init.sql` in the **SQL editor**
   and run it, then run `supabase/seed.sql`.
4. **Auth → Providers**: enable Email, and (optionally) Google. Add redirect URL
   `http://localhost:3000/auth/callback` (and your production URL).
5. Sign up at `/login`, then make yourself an admin:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@themarketbriefdaily.com';
   ```
   You can now reach `/admin`.

## 3. Stripe (billing)

1. In the Stripe dashboard create two **recurring** prices (Professional £24/mo,
   Institutional £499/mo). Copy their price IDs.
2. Add to `.env.local`: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`,
   `STRIPE_PRICE_INSTITUTIONAL`.
3. Webhook: in **Developers → Webhooks** add an endpoint
   `https://<your-domain>/api/stripe/webhook` for events
   `checkout.session.completed`, `customer.subscription.*`. Copy the signing
   secret into `STRIPE_WEBHOOK_SECRET`.
   - Local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
4. The webhook writes `tier` + `subscription_status` onto `profiles`, which the
   entitlement layer (`src/lib/entitlements.ts`) reads to gate content.

## 4. Live indicators (FRED)

Get a free key at [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html)
and set `FRED_API_KEY`. Market levels already come live from the existing
`scripts/fetch_data.py` GitHub Action (its JSON is served from `public/data`).

## 5. Deploy to Vercel

1. Import the repo; set **Root Directory** to `platform`.
2. Add every variable from `.env.example` in **Project → Settings → Environment
   Variables**, plus `NEXT_PUBLIC_SITE_URL=https://www.themarketbriefdaily.com`.
3. Deploy. Then point the domain: move the DNS / `CNAME` from GitHub Pages to
   Vercel (Vercel shows the exact records). The old static site stays on the
   `main` branch until you cut over.

---

## Architecture map

| Concern | Location |
| --- | --- |
| Design system (tokens, fonts) | `src/app/globals.css`, `src/app/layout.tsx` |
| Subscription tiers & gating model | `src/lib/tiers.ts` |
| Entitlement resolution (server) | `src/lib/entitlements.ts` |
| Paywall UI | `src/components/paywall/paywall-gate.tsx` |
| Auth (Supabase clients + session refresh) | `src/lib/supabase/*`, `src/middleware.ts` |
| Stripe (checkout / webhook / portal) | `src/app/api/stripe/*` |
| Admin panel | `src/app/admin/*` |
| Live indicators | `src/lib/data/indicators.ts`, `src/app/(site)/markets` |
| Question bank | `src/lib/data/questions.ts`, `src/components/learn/quiz.tsx` |
| Database schema + RLS | `supabase/migrations/0001_init.sql` |

> Note: Next 16 prefers the `proxy.ts` filename over `middleware.ts`; both work.

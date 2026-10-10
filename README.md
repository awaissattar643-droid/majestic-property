# Majestic Property Manager

Property listings website + admin management system for **Majestic Property Solutions** (Clifton, Karachi).

- 🌐 **Public site** (`/`) — property listings grid, search/filter (location, type, price), property detail pages, WhatsApp inquiry button per property.
- 🔧 **Admin panel** (`/admin`) — Supabase email/password login, add/edit/delete properties, photo upload to Supabase Storage.

Stack: **Next.js 14 (App Router, TypeScript) + Supabase (Postgres + Auth + Storage)**. Deploys to **Cloudflare Pages** (free tier).

> **Sample data:** until Supabase env vars are set, the site runs on 3 clearly-labeled **SAMPLE** Karachi listings and shows a "Backend not connected" banner. No fake client claims anywhere.

## 1. Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account

## 2. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com) (free tier is enough).
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates:
   - `properties` table (RLS: public read, authenticated write)
   - `property-images` public storage bucket (public read, authenticated upload/delete)
3. Create the admin user: **Authentication → Users → Add user** — enter an email + password. These are the `/admin` login credentials.
4. Copy your **Project URL** and **anon public key** from **Project Settings → API**.

## 3. Local development

```bash
cd majestic-property
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# NEXT_PUBLIC_OWNER_WHATSAPP (e.g. 923001234567 — no leading +)
npm run dev
# → http://localhost:3000  (site)  → http://localhost:3000/admin  (admin panel)
```

## 4. Deploy to Cloudflare Pages (free)

1. Push this folder to a GitHub repo.
2. In Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build settings:
   - **Build command:** `npx @cloudflare/next-on-pages`
   - **Build output directory:** `.vercel/output/static`
4. **Environment variables** (Pages → Settings → Environment Variables): add the same three `NEXT_PUBLIC_*` vars from `.env.example`.
5. Deploy. Custom domain: Pages → Custom domains (free SSL included).

> No Vercel needed — Vercel's free Hobby plan is non-commercial, so Cloudflare Pages is the correct free host for a client site.

## 5. Going live checklist

- [ ] Supabase project created, `schema.sql` executed
- [ ] Admin user created in Supabase Auth
- [ ] `.env.local` (local) / Pages env vars (production) filled in
- [ ] Real property photos uploaded via `/admin` (replaces sample data)
- [ ] Owner WhatsApp number set (`NEXT_PUBLIC_OWNER_WHATSAPP`)
- [ ] Custom domain connected (optional — works on `*.pages.dev` for free)

## Project structure

```
app/
  page.tsx            → listings grid + search/filter
  property/[id]/      → property detail page
  admin/page.tsx      → login + property management dashboard
components/
  PropertyCard.tsx    → listing card with WhatsApp button
  BackendNotice.tsx   → "Backend not connected" banner
lib/
  types.ts            → Property type + helpers
  supabase.ts         → env-driven Supabase client (null-safe)
  sample-data.ts      → 3 labeled SAMPLE listings (no-backend mode)
supabase/
  schema.sql          → tables, RLS policies, storage bucket
```

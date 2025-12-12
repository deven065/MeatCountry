# MeatCountry

A professional, fast, and responsive e-commerce website for fresh meat and seafood — built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion animations, and Supabase for data/auth. Prices are displayed in Indian Rupees.

## Tech Stack
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS for styling
- Framer Motion for buttery-smooth animations
- Supabase (Postgres + Auth)
- Zustand for cart state (with localStorage persistence)

## Features
- Email/password authentication via Supabase (Sign in / Sign up)
- Product listing, product detail pages, featured products on homepage
- Clean, modern UI with subtle micro-interactions and page transitions
- Responsive across phones, tablets, and desktops
- Cart with animated drawer and a simple checkout summary
- INR currency display using `Intl.NumberFormat('en-IN', { currency: 'INR' })`

## Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

## Setup (Windows PowerShell)

1) Install dependencies
```powershell
npm install
```

2) Configure environment variables
- Copy `.env.local.example` to `.env.local` and fill the values from your Supabase project
```powershell
Copy-Item .env.local.example .env.local
# Edit .env.local and add:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3) Create database schema in Supabase
- In the Supabase Dashboard, open SQL editor and paste the content of `./supabase/schema.sql` and run it
- Optionally import `./supabase/seed.json` into the `products` table (Table editor → Import)

4) Run the dev server
```powershell
npm run dev
```
- Open http://localhost:3000

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run type-check` — TypeScript check
- `npm run lint` — lint via Next.js
- `npm run seed` — print Supabase seeding instructions

## Project Structure
```
app/                # App Router pages
  (auth)/sign-in
  (auth)/sign-up
  (shop)/products
  cart
  api/revalidate
components/         # UI components
lib/                # Supabase clients, currency, animations, types
providers/          # Client-side providers (supabase init)
public/             # Static assets
styles/             # Tailwind globals
supabase/           # SQL schema + seed data
```

## Notes
- This starter reads public data (products) with the Supabase anon key. RLS policies are configured to allow SELECT for anon. Keep write access restricted.
- Hook up real payment and address flows for production.
- Consider deploying to Vercel; set the same env vars in project settings.

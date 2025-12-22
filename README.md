# MeatCountry

A professional, fast, and responsive e-commerce website for fresh meat and seafood — built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion animations, and Supabase for data/auth. Prices are displayed in Indian Rupees.

## Tech Stack
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS for styling
- Framer Motion for buttery-smooth animations
- Supabase (Postgres + Auth)
- Zustand for cart state (with localStorage persistence)

## Features
- 🔐 Email/password authentication via Supabase (Sign in / Sign up)
- 🛍️ Product listing, product detail pages, featured products on homepage
- 🎨 Clean, modern UI with subtle micro-interactions and page transitions
- 📱 Responsive across phones, tablets, and desktops
- 🛒 Cart with animated drawer and persistent storage
- 💳 **Razorpay Payment Gateway Integration** (Cards, UPI, Net Banking, Wallets, COD)
- ✅ Professional checkout flow with order management
- 📦 Order tracking and status management
- 💰 INR currency display using `Intl.NumberFormat('en-IN', { currency: 'INR' })`
- 🎭 Smooth animations with Framer Motion

## Prerequisites
- Node.js 18+
- A Supabase project (free tier works)
- A Razorpay account (free test mode available at [razorpay.com](https://razorpay.com))

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
- Run `./supabase/add-payment-fields.sql` to add Razorpay payment tracking fields
- Optionally import `./supabase/seed.json` into the `products` table (Table editor → Import)

4) Configure Razorpay (optional - for payments)
- Sign up at [razorpay.com](https://razorpay.com) and get your test API keys
- Add to `.env.local`:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
```
- See [QUICK_RAZORPAY_SETUP.md](./QUICK_RAZORPAY_SETUP.md) for detailed setup

5) Run the dev server
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
- `./verify-razorpay-setup.sh` — verify Razorpay integration setup

## Project Structure
```
app/                # App Router pages
  (auth)/sign-in
  (auth)/sign-up
  (shop)/products
  cart
  order-success     # Order confirmation page
  api/
    revalidate
    razorpay/       # Payment gateway API routes
      create-order
      verify-payment
      webhook
components/         # UI components
  checkout.tsx      # Razorpay checkout component
lib/                # Supabase clients, currency, animations, types
  razorpay.ts       # Razorpay utilities
providers/          # Client-side providers (supabase init)
public/             # Static assets
styles/             # Tailwind globals
supabase/           # SQL schema + seed data
  add-payment-fields.sql  # Payment tracking schema
```

## Payment Integration

This project includes a complete **Razorpay payment gateway** integration with:

- 💳 Multiple payment methods (Cards, UPI, Net Banking, Wallets)
- 💵 Cash on Delivery (COD) option
- ✅ Secure payment verification with signature validation
- 📦 Order management and tracking
- 🎨 Beautiful checkout UI
- 📱 Mobile-responsive payment flow

### Quick Setup

1. Get Razorpay API keys from [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Add keys to `.env.local`
3. Run `./verify-razorpay-setup.sh` to verify setup
4. Test with card: `4111 1111 1111 1111`

### Documentation

- **Quick Start**: [QUICK_RAZORPAY_SETUP.md](./QUICK_RAZORPAY_SETUP.md) - 5-minute setup guide
- **Full Guide**: [RAZORPAY_INTEGRATION.md](./RAZORPAY_INTEGRATION.md) - Complete documentation
- **Summary**: [RAZORPAY_COMPLETE_SUMMARY.md](./RAZORPAY_COMPLETE_SUMMARY.md) - Feature overview

## Notes
- This starter reads public data (products) with the Supabase anon key. RLS policies are configured to allow SELECT for anon. Keep write access restricted.
- Payment integration is production-ready but starts in test mode. Switch to live keys when ready.
- Consider deploying to Vercel; set the same env vars in project settings.
- For production, enable Razorpay webhooks for reliable payment status updates.

## Support & Resources

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Razorpay Docs**: [razorpay.com/docs](https://razorpay.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Built with ❤️ - Professional Meat E-commerce Platform**

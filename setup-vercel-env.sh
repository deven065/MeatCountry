#!/bin/bash

echo "🚀 Setting up Vercel Environment Variables"
echo "==========================================="

# Load environment variables from .env.local
if [ -f .env.local ]; then
    source .env.local
    echo "✅ Loaded local environment variables"
else
    echo "❌ .env.local file not found"
    exit 1
fi

# Set environment variables on Vercel
echo "📤 Setting environment variables on Vercel..."

npx vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$NEXT_PUBLIC_SUPABASE_URL"
npx vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "$NEXT_PUBLIC_SUPABASE_URL"
npx vercel env add NEXT_PUBLIC_SUPABASE_URL development <<< "$NEXT_PUBLIC_SUPABASE_URL"

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"

npx vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SUPABASE_SERVICE_ROLE_KEY"
npx vercel env add SUPABASE_SERVICE_ROLE_KEY preview <<< "$SUPABASE_SERVICE_ROLE_KEY"
npx vercel env add SUPABASE_SERVICE_ROLE_KEY development <<< "$SUPABASE_SERVICE_ROLE_KEY"

npx vercel env add NEXT_PUBLIC_SITE_URL production <<< "$NEXT_PUBLIC_SITE_URL"
npx vercel env add NEXT_PUBLIC_SITE_URL preview <<< "$NEXT_PUBLIC_SITE_URL"
npx vercel env add NEXT_PUBLIC_SITE_URL development <<< "$NEXT_PUBLIC_SITE_URL"

npx vercel env add NEXT_PUBLIC_ADMIN_PASSWORD production <<< "$NEXT_PUBLIC_ADMIN_PASSWORD"
npx vercel env add NEXT_PUBLIC_ADMIN_PASSWORD preview <<< "$NEXT_PUBLIC_ADMIN_PASSWORD"
npx vercel env add NEXT_PUBLIC_ADMIN_PASSWORD development <<< "$NEXT_PUBLIC_ADMIN_PASSWORD"

npx vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID production <<< "$NEXT_PUBLIC_RAZORPAY_KEY_ID"
npx vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID preview <<< "$NEXT_PUBLIC_RAZORPAY_KEY_ID"
npx vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID development <<< "$NEXT_PUBLIC_RAZORPAY_KEY_ID"

npx vercel env add RAZORPAY_KEY_SECRET production <<< "$RAZORPAY_KEY_SECRET"
npx vercel env add RAZORPAY_KEY_SECRET preview <<< "$RAZORPAY_KEY_SECRET"
npx vercel env add RAZORPAY_KEY_SECRET development <<< "$RAZORPAY_KEY_SECRET"

npx vercel env add RAZORPAY_WEBHOOK_SECRET production <<< "$RAZORPAY_WEBHOOK_SECRET"
npx vercel env add RAZORPAY_WEBHOOK_SECRET preview <<< "$RAZORPAY_WEBHOOK_SECRET"
npx vercel env add RAZORPAY_WEBHOOK_SECRET development <<< "$RAZORPAY_WEBHOOK_SECRET"

echo "✅ Environment variables set successfully!"
echo "🔄 Triggering new deployment..."
npx vercel --prod

echo "🎉 Deployment completed!"
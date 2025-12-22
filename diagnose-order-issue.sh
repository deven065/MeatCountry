#!/bin/bash

echo "🔍 Diagnosing Order Creation Issue..."
echo ""

# Check environment variables
echo "1️⃣  Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL=" .env.local; then
        echo "✅ NEXT_PUBLIC_SUPABASE_URL is set"
    else
        echo "❌ NEXT_PUBLIC_SUPABASE_URL is missing"
    fi
    
    if grep -q "SUPABASE_SERVICE_ROLE=" .env.local; then
        echo "✅ SUPABASE_SERVICE_ROLE is set"
    else
        echo "❌ SUPABASE_SERVICE_ROLE is missing"
    fi
else
    echo "❌ .env.local file not found"
fi
echo ""

# Check API route exists
echo "2️⃣  Checking API route..."
if [ -f "app/api/orders/create/route.ts" ]; then
    echo "✅ API route exists"
else
    echo "❌ API route missing"
fi
echo ""

# Check if dev server is running
echo "3️⃣  Checking dev server..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ Dev server is running on port 3000"
    echo ""
    echo "⚠️  IMPORTANT: If you just updated .env.local,"
    echo "   you MUST restart the dev server for changes to take effect!"
    echo ""
    echo "   Press Ctrl+C in the terminal running 'npm run dev'"
    echo "   Then run 'npm run dev' again"
else
    echo "❌ Dev server is not running"
    echo "   Run: npm run dev"
fi
echo ""

echo "4️⃣  Next Steps:"
echo ""
echo "If you see any ❌ above, fix those issues first."
echo ""
echo "Then:"
echo "1. Stop your dev server (Ctrl+C)"
echo "2. Restart it: npm run dev"
echo "3. Try the checkout flow again"
echo "4. Check browser console for detailed error messages"
echo ""
echo "If still failing, check the terminal running 'npm run dev'"
echo "for server-side error logs that will show the exact issue."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

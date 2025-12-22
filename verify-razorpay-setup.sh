#!/bin/bash

# Razorpay Integration Verification Script
# Run this to verify your Razorpay integration is properly set up

echo "🔍 Verifying Razorpay Integration..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track status
all_good=true

# Check 1: Environment variables
echo "1️⃣  Checking environment variables..."
if [ -f ".env.local" ]; then
    if grep -q "NEXT_PUBLIC_RAZORPAY_KEY_ID" .env.local && \
       grep -q "RAZORPAY_KEY_SECRET" .env.local; then
        
        # Check if values are set (not placeholder)
        if grep -q "your_razorpay_key_id_here" .env.local; then
            echo -e "${YELLOW}⚠️  Warning: NEXT_PUBLIC_RAZORPAY_KEY_ID not configured${NC}"
            echo "   Get your keys from: https://dashboard.razorpay.com/app/website-app-settings/api-keys"
            all_good=false
        else
            echo -e "${GREEN}✅ Environment variables configured${NC}"
        fi
    else
        echo -e "${RED}❌ Missing Razorpay environment variables in .env.local${NC}"
        all_good=false
    fi
else
    echo -e "${RED}❌ .env.local file not found${NC}"
    all_good=false
fi
echo ""

# Check 2: API Routes
echo "2️⃣  Checking API routes..."
routes=(
    "app/api/razorpay/create-order/route.ts"
    "app/api/razorpay/verify-payment/route.ts"
    "app/api/razorpay/webhook/route.ts"
)

for route in "${routes[@]}"; do
    if [ -f "$route" ]; then
        echo -e "${GREEN}✅ $route exists${NC}"
    else
        echo -e "${RED}❌ $route missing${NC}"
        all_good=false
    fi
done
echo ""

# Check 3: Components
echo "3️⃣  Checking components..."
components=(
    "components/checkout.tsx"
    "app/cart/page.tsx"
    "app/order-success/page.tsx"
)

for component in "${components[@]}"; do
    if [ -f "$component" ]; then
        echo -e "${GREEN}✅ $component exists${NC}"
    else
        echo -e "${RED}❌ $component missing${NC}"
        all_good=false
    fi
done
echo ""

# Check 4: Library files
echo "4️⃣  Checking library files..."
libs=(
    "lib/razorpay.ts"
    "lib/razorpay-test-helpers.ts"
)

for lib in "${libs[@]}"; do
    if [ -f "$lib" ]; then
        echo -e "${GREEN}✅ $lib exists${NC}"
    else
        echo -e "${RED}❌ $lib missing${NC}"
        all_good=false
    fi
done
echo ""

# Check 5: Database schemas
echo "5️⃣  Checking database schemas..."
schemas=(
    "supabase/add-payment-fields.sql"
    "supabase/orders-schema.sql"
)

for schema in "${schemas[@]}"; do
    if [ -f "$schema" ]; then
        echo -e "${GREEN}✅ $schema exists${NC}"
    else
        echo -e "${YELLOW}⚠️  $schema missing (optional)${NC}"
    fi
done
echo ""

# Check 6: Documentation
echo "6️⃣  Checking documentation..."
docs=(
    "RAZORPAY_INTEGRATION.md"
    "QUICK_RAZORPAY_SETUP.md"
    "RAZORPAY_COMPLETE_SUMMARY.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅ $doc exists${NC}"
    else
        echo -e "${YELLOW}⚠️  $doc missing (documentation)${NC}"
    fi
done
echo ""

# Check 7: Dependencies
echo "7️⃣  Checking npm dependencies..."
if [ -f "package.json" ]; then
    if grep -q "razorpay" package.json; then
        echo -e "${GREEN}✅ Razorpay package installed${NC}"
    else
        echo -e "${RED}❌ Razorpay package not found in package.json${NC}"
        echo "   Run: npm install razorpay"
        all_good=false
    fi
else
    echo -e "${RED}❌ package.json not found${NC}"
    all_good=false
fi
echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$all_good" = true ]; then
    echo -e "${GREEN}🎉 All checks passed! Your Razorpay integration is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Add your Razorpay API keys to .env.local"
    echo "2. Run: npm run dev"
    echo "3. Test checkout with card: 4111 1111 1111 1111"
    echo ""
    echo "📚 See QUICK_RAZORPAY_SETUP.md for detailed instructions"
else
    echo -e "${YELLOW}⚠️  Some issues found. Please fix them before testing.${NC}"
    echo ""
    echo "See RAZORPAY_INTEGRATION.md for help"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Quick test instructions
echo "🧪 Quick Test Commands:"
echo "   npm run dev                          # Start dev server"
echo "   open http://localhost:3000/cart      # Open cart page"
echo ""
echo "💳 Test Card: 4111 1111 1111 1111 | CVV: 123 | Expiry: 12/25"
echo ""

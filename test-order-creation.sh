#!/bin/bash

# Quick Test Script for Database Order Creation Fix
# Run this after starting your dev server (npm run dev)

echo "🧪 Testing Order Creation Fix..."
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Dev server not running. Please run: npm run dev"
    exit 1
fi

echo "✅ Dev server is running"
echo ""

# Test the API endpoint
echo "📝 Testing /api/orders/create endpoint..."
echo ""

response=$(curl -s -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "customer_phone": "+91 9876543210",
    "customer_address": "123 Test Street, Mumbai, 400001",
    "items": [
      {
        "product_id": "test-123",
        "product_name": "Test Chicken",
        "unit": "1Kg",
        "quantity": 2,
        "price": 849
      }
    ],
    "subtotal": 1698,
    "delivery_fee": 0,
    "total": 1698,
    "payment_status": "pending",
    "payment_method": "cod"
  }')

echo "Response:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""

# Check if successful
if echo "$response" | grep -q '"success":true'; then
    echo "✅ Order creation successful!"
    echo ""
    echo "Next steps:"
    echo "1. Check Supabase orders table to verify the order was saved"
    echo "2. Test the full checkout flow in the browser"
    echo "3. Complete a test payment to verify end-to-end"
    echo ""
    echo "Test card: 4111 1111 1111 1111"
    echo "CVV: 123, Expiry: 12/25"
else
    echo "❌ Order creation failed"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check if SUPABASE_SERVICE_ROLE is set in .env.local"
    echo "2. Verify orders table exists in Supabase"
    echo "3. Check server logs for detailed errors"
    echo "4. See DATABASE_FIX_DOCUMENTATION.md for more help"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

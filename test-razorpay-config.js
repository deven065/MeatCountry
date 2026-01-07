// Test Razorpay configuration
console.log('=== Razorpay Configuration Test ===')
console.log('NEXT_PUBLIC_RAZORPAY_KEY_ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? '✓ Set' : '✗ Not set')
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✓ Set' : '✗ Not set')
console.log('RAZORPAY_WEBHOOK_SECRET:', process.env.RAZORPAY_WEBHOOK_SECRET ? '✓ Set' : '✗ Not set')
console.log('')

if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.log('⚠️  Missing Razorpay credentials!')
  console.log('Please add these to your .env.local file:')
  console.log('NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx')
  console.log('RAZORPAY_KEY_SECRET=your_key_secret')
  console.log('RAZORPAY_WEBHOOK_SECRET=your_webhook_secret (optional)')
  process.exit(1)
}

console.log('✓ All Razorpay credentials are configured')

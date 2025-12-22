/**
 * Razorpay Integration Test Helper
 * 
 * This file contains test credentials and helper functions
 * for testing the Razorpay payment integration.
 * 
 * DO NOT use these in production!
 */

// Test API Keys (Replace with your actual test keys)
export const RAZORPAY_TEST_CONFIG = {
  keyId: 'rzp_test_YOUR_KEY_ID',
  keySecret: 'YOUR_KEY_SECRET',
}

// Test Cards
export const TEST_CARDS = {
  success: {
    number: '4111 1111 1111 1111',
    cvv: '123',
    expiry: '12/25',
    name: 'Test User',
    description: 'Always successful',
  },
  failure: {
    number: '4111 1111 1111 1234',
    cvv: '123',
    expiry: '12/25',
    name: 'Test User',
    description: 'Always fails',
  },
  authFailure: {
    number: '5104 0155 5555 5558',
    cvv: '123',
    expiry: '12/25',
    name: 'Test User',
    description: 'Authentication failure',
  },
}

// Test UPI IDs
export const TEST_UPI = {
  success: 'success@razorpay',
  failure: 'failure@razorpay',
}

// Test Customer Details
export const TEST_CUSTOMER = {
  name: 'John Doe',
  email: 'test@example.com',
  phone: '+919876543210',
  address: '123 Test Street, Mumbai, Maharashtra, 400001',
}

// Test Order Data
export const TEST_ORDER = {
  items: [
    {
      id: 'test-1',
      name: 'Kadaknath Whole Chicken',
      price_inr: 849,
      quantity: 1,
      unit: '1Kg',
      image: '/chicken.avif',
      slug: 'kadaknath-whole-chicken',
    },
  ],
  subtotal: 849,
  deliveryFee: 0,
  total: 849,
}

// Helper function to test order creation
export async function testCreateOrder(amount: number) {
  try {
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `test_${Date.now()}`,
        notes: { test: 'true' },
      }),
    })

    const data = await response.json()
    console.log('✅ Order created:', data)
    return data
  } catch (error) {
    console.error('❌ Order creation failed:', error)
    throw error
  }
}

// Helper function to test payment verification
export async function testVerifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
) {
  try {
    const response = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    })

    const data = await response.json()
    console.log('✅ Payment verified:', data)
    return data
  } catch (error) {
    console.error('❌ Payment verification failed:', error)
    throw error
  }
}

// Test checklist
export const TEST_CHECKLIST = [
  {
    id: 1,
    test: 'Environment variables configured',
    command: 'Check .env.local for RAZORPAY keys',
    expected: 'Keys should start with rzp_test_',
  },
  {
    id: 2,
    test: 'Razorpay script loads',
    command: 'Open browser console and type: window.Razorpay',
    expected: 'Should return Razorpay constructor function',
  },
  {
    id: 3,
    test: 'Create order API works',
    command: 'testCreateOrder(100)',
    expected: 'Should return order object with id',
  },
  {
    id: 4,
    test: 'Checkout page renders',
    command: 'Navigate to /cart and click "Proceed to Checkout"',
    expected: 'Should show checkout form',
  },
  {
    id: 5,
    test: 'Payment modal opens',
    command: 'Fill form and click "Place Order"',
    expected: 'Razorpay modal should open',
  },
  {
    id: 6,
    test: 'Successful payment flow',
    command: 'Use test card 4111111111111111',
    expected: 'Should redirect to success page',
  },
  {
    id: 7,
    test: 'Failed payment handling',
    command: 'Use test card 4111111111111234',
    expected: 'Should show error message',
  },
  {
    id: 8,
    test: 'COD order placement',
    command: 'Select COD and place order',
    expected: 'Should create order with pending status',
  },
  {
    id: 9,
    test: 'Order saved to database',
    command: 'Check Supabase orders table',
    expected: 'Should have new order entry',
  },
  {
    id: 10,
    test: 'Cart cleared after checkout',
    command: 'Complete checkout',
    expected: 'Cart should be empty',
  },
]

// Console test runner
export function runTests() {
  console.log('🧪 Razorpay Integration Test Checklist\n')
  console.log('Copy and paste each command to test:\n')
  
  TEST_CHECKLIST.forEach((test) => {
    console.log(`\n${test.id}. ${test.test}`)
    console.log(`   Command: ${test.command}`)
    console.log(`   Expected: ${test.expected}`)
  })
  
  console.log('\n\n📝 Test Cards:')
  console.log('Success:', TEST_CARDS.success.number)
  console.log('Failure:', TEST_CARDS.failure.number)
  
  console.log('\n\n📝 Test UPI:')
  console.log('Success:', TEST_UPI.success)
  console.log('Failure:', TEST_UPI.failure)
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  ;(window as any).razorpayTests = {
    testCreateOrder,
    testVerifyPayment,
    runTests,
    TEST_CARDS,
    TEST_UPI,
    TEST_CUSTOMER,
    TEST_ORDER,
  }
}

// Usage in browser console:
// razorpayTests.runTests()
// razorpayTests.testCreateOrder(1000)

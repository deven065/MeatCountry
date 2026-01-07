import { NextRequest, NextResponse } from 'next/server'
import { getRazorpayInstance, toRazorpayAmount } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  try {
    // Check if Razorpay credentials are configured
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured')
      return NextResponse.json(
        { 
          error: 'Payment gateway not configured',
          message: 'Razorpay credentials are missing. Please add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env.local file.',
          details: 'See RAZORPAY_SETUP.md for instructions'
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { amount, currency = 'INR', receipt, notes } = body

    // Validate required fields
    if (!amount || !receipt) {
      return NextResponse.json(
        { error: 'Amount and receipt are required' },
        { status: 400 }
      )
    }

    console.log('Creating Razorpay order:', {
      amount,
      amountInPaise: toRazorpayAmount(amount),
      currency,
      receipt
    })

    // Create Razorpay order
    const options = {
      amount: toRazorpayAmount(amount), // Convert to paise
      currency,
      receipt,
      notes: notes || {},
    }

    const razorpay = getRazorpayInstance()
    const order = await razorpay.orders.create(options)

    console.log('Razorpay order created:', order.id)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    })
  } catch (error: any) {
    console.error('Razorpay order creation error:', error)
    
    // Provide helpful error messages
    let errorMessage = error.message
    if (error.message?.includes('credentials')) {
      errorMessage = 'Invalid Razorpay credentials. Please check your API keys.'
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

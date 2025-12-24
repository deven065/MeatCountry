import { NextRequest, NextResponse } from 'next/server'
import { getRazorpayInstance, toRazorpayAmount } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = 'INR', receipt, notes } = body

    // Validate required fields
    if (!amount || !receipt) {
      return NextResponse.json(
        { error: 'Amount and receipt are required' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const options = {
      amount: toRazorpayAmount(amount), // Convert to paise
      currency,
      receipt,
      notes: notes || {},
    }

    const razorpay = getRazorpayInstance()
    const order = await razorpay.orders.create(options)

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
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

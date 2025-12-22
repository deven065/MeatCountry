import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase admin client inside the handler
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id, // Our database order ID
    } = body

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields' },
        { status: 400 }
      )
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    const isValid = generatedSignature === razorpay_signature

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature', success: false },
        { status: 400 }
      )
    }

    // Update order in database if order_id is provided
    if (order_id) {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_method: 'online',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order_id)

      if (error) {
        console.error('Failed to update order:', error)
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { 
        error: 'Payment verification failed',
        message: error.message,
        success: false
      },
      { status: 500 }
    )
  }
}

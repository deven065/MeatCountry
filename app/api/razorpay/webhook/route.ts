import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Helper function to get Supabase admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * Razorpay Webhook Handler
 * 
 * This endpoint receives payment status updates from Razorpay.
 * Configure this URL in your Razorpay Dashboard under Webhooks.
 * 
 * Webhook URL: https://yourdomain.com/api/razorpay/webhook
 * 
 * Events handled:
 * - payment.authorized
 * - payment.captured
 * - payment.failed
 * - order.paid
 * - refund.created
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Parse webhook payload
    const event = JSON.parse(body)
    console.log('Webhook received:', event.event, event.payload)

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity)
        break

      case 'payment.authorized':
        await handlePaymentAuthorized(event.payload.payment.entity)
        break

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity)
        break

      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity)
        break

      case 'refund.created':
        await handleRefundCreated(event.payload.refund.entity)
        break

      default:
        console.log('Unhandled webhook event:', event.event)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    )
  }
}

async function handlePaymentCaptured(payment: any) {
  console.log('Payment captured:', payment.id)
  
  // Update order payment status
  const { error } = await getSupabaseAdmin()
    .from('orders')
    .update({
      payment_status: 'paid',
      payment_id: payment.id,
      updated_at: new Date().toISOString(),
    })
    .eq('payment_id', payment.id)

  if (error) {
    console.error('Failed to update order after payment captured:', error)
  } else {
    // TODO: Send confirmation email/SMS
    console.log('Order updated successfully')
  }
}

async function handlePaymentAuthorized(payment: any) {
  console.log('Payment authorized:', payment.id)
  
  // Payment is authorized but not yet captured
  // Useful for manual review before capture
  
  const { error } = await getSupabaseAdmin()
    .from('orders')
    .update({
      payment_status: 'authorized',
      payment_id: payment.id,
      updated_at: new Date().toISOString(),
    })
    .eq('payment_id', payment.id)

  if (error) {
    console.error('Failed to update order after payment authorized:', error)
  }
}

async function handlePaymentFailed(payment: any) {
  console.log('Payment failed:', payment.id)
  
  const { error } = await getSupabaseAdmin()
    .from('orders')
    .update({
      payment_status: 'failed',
      payment_id: payment.id,
      updated_at: new Date().toISOString(),
    })
    .eq('payment_id', payment.id)

  if (error) {
    console.error('Failed to update order after payment failed:', error)
  } else {
    // TODO: Send payment failure notification
    console.log('Order marked as failed')
  }
}

async function handleOrderPaid(order: any) {
  console.log('Order paid:', order.id)
  
  // Find order by receipt ID (if you stored it)
  const { error } = await getSupabaseAdmin()
    .from('orders')
    .update({
      payment_status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('order_number', order.receipt)

  if (error) {
    console.error('Failed to update order after order paid:', error)
  }
}

async function handleRefundCreated(refund: any) {
  console.log('Refund created:', refund.id)
  
  const { error } = await getSupabaseAdmin()
    .from('orders')
    .update({
      payment_status: 'refunded',
      updated_at: new Date().toISOString(),
    })
    .eq('payment_id', refund.payment_id)

  if (error) {
    console.error('Failed to update order after refund:', error)
  } else {
    // TODO: Send refund confirmation email
    console.log('Order marked as refunded')
  }
}

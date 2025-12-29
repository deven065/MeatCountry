import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      })
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          details: 'Missing Supabase credentials. Please check SUPABASE_SERVICE_ROLE_KEY in .env.local and restart the dev server.'
        },
        { status: 500 }
      )
    }

    // Create admin client for this request
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const body = await request.json()
    const {
      user_id,
      address_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      items,
      subtotal,
      delivery_fee,
      total,
      payment_status,
      payment_method,
      payment_id,
      notes,
    } = body

    console.log('Creating order with data:', {
      customer_name,
      customer_email,
      itemCount: items?.length,
      total,
      payment_method,
      payment_status,
    })

    // Validate required fields
    if (!items || !subtotal || !total) {
      console.error('Missing required fields:', {
        hasItems: !!items,
        hasSubtotal: !!subtotal,
        hasTotal: !!total,
      })
      return NextResponse.json(
        { error: 'Missing required fields: items, subtotal, total' },
        { status: 400 }
      )
    }

    // Generate unique order number
    const order_number = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase()

    // Create order using the actual table structure
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number,
        customer_name: customer_name || 'Customer',
        customer_email: customer_email || '',
        customer_phone: customer_phone || '',
        customer_address: customer_address || '',
        items: JSON.stringify(items), // Store as JSON string
        subtotal: Math.round(subtotal * 100), // Convert to paisa
        delivery_fee: Math.round((delivery_fee || 0) * 100), // Convert to paisa
        total: Math.round(total * 100), // Convert to paisa
        payment_method: payment_method || 'cod',
        payment_status: payment_status || 'pending',
        payment_id,
        status: 'new',
        notes,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Database error creating order:', {
        error: orderError,
        code: orderError.code,
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint,
      })
      return NextResponse.json(
        { 
          error: 'Failed to create order', 
          details: orderError.message,
          hint: orderError.hint,
          code: orderError.code,
        },
        { status: 500 }
      )
    }

    console.log('Order created successfully:', orderData.id)

    return NextResponse.json({
      success: true,
      order: orderData,
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

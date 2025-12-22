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
    if (!customer_name || !items || !subtotal || !total) {
      console.error('Missing required fields:', {
        hasName: !!customer_name,
        hasItems: !!items,
        hasSubtotal: !!subtotal,
        hasTotal: !!total,
      })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create order in database using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        items,
        subtotal,
        delivery_fee: delivery_fee || 0,
        total,
        payment_status: payment_status || 'pending',
        payment_method: payment_method || 'cod',
        payment_id,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Database error creating order:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        { 
          error: 'Failed to create order', 
          details: error.message,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 }
      )
    }

    console.log('Order created successfully:', data.id)

    return NextResponse.json({
      success: true,
      order: data,
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

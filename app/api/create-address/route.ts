import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, addressData } = body

    if (!userId || !addressData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Supabase admin client (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE!
    
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing service role key' },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Validate address data
    const requiredFields = ['full_name', 'phone', 'address_line_1', 'city', 'state', 'pincode']
    const missingFields = requiredFields.filter(field => !addressData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // If setting as default, unset all other defaults first
    if (addressData.is_default) {
      const { error: updateError } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        
      if (updateError) {
        console.error('Error unsetting default addresses:', updateError)
      }
    }

    // Insert address with admin privileges
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        full_name: addressData.full_name,
        phone: addressData.phone,
        address_line_1: addressData.address_line_1,
        address_line_2: addressData.address_line_2 || null,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        landmark: addressData.landmark || null,
        address_type: addressData.address_type || 'home',
        is_default: addressData.is_default ?? false
      })
      .select()

    if (error) {
      console.error('Server-side address insert error:', error)
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('API route exception:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

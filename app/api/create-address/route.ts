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
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

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
        is_default: addressData.is_default ?? true
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

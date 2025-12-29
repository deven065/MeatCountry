import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

// GET user's wishlist
export async function GET(req: NextRequest) {
  const sb = await supabaseServer()
  
  const { data: { user }, error: authError } = await sb.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: wishlist, error } = await sb
    .from('wishlists')
    .select('*, products(*)')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ wishlist })
}

// POST add item to wishlist
export async function POST(req: NextRequest) {
  const sb = await supabaseServer()
  
  const { data: { user }, error: authError } = await sb.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { product_id } = body

  if (!product_id) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
  }

  // Check if already in wishlist
  const { data: existing } = await sb
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Product already in wishlist' }, { status: 400 })
  }

  const { data: wishlistItem, error } = await sb
    .from('wishlists')
    .insert({
      user_id: user.id,
      product_id
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ wishlistItem })
}

// DELETE remove item from wishlist
export async function DELETE(req: NextRequest) {
  const sb = await supabaseServer()
  
  const { data: { user }, error: authError } = await sb.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('product_id')

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
  }

  const { error } = await sb
    .from('wishlists')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

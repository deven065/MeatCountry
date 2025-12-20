import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

// GET reviews for a product
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('product_id')

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
  }

  const sb = supabaseServer()
  const { data: reviews, error } = await sb
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reviews })
}

// POST a new review
export async function POST(req: NextRequest) {
  const sb = supabaseServer()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await sb.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { product_id, rating, title, comment, images, order_id } = body

  if (!product_id || !rating) {
    return NextResponse.json({ error: 'Product ID and rating are required' }, { status: 400 })
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  // Check if user has already reviewed this product for this order
  const { data: existingReview } = await sb
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .eq('order_id', order_id || null)
    .single()

  if (existingReview) {
    return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 })
  }

  // Check if this is a verified purchase
  let isVerifiedPurchase = false
  if (order_id) {
    const { data: orderItem } = await sb
      .from('order_items')
      .select('id')
      .eq('order_id', order_id)
      .eq('product_id', product_id)
      .single()
    
    if (orderItem) {
      isVerifiedPurchase = true
    }
  }

  const { data: review, error } = await sb
    .from('reviews')
    .insert({
      user_id: user.id,
      product_id,
      rating,
      title: title || null,
      comment: comment || null,
      images: images || [],
      order_id: order_id || null,
      is_verified_purchase: isVerifiedPurchase
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Award loyalty points for review
  const { data: loyaltyPoints } = await sb
    .from('loyalty_points')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (loyaltyPoints) {
    const pointsToAdd = 10 // 10 points for writing a review
    const newBalance = loyaltyPoints.points + pointsToAdd

    await sb
      .from('loyalty_points')
      .update({
        points: newBalance,
        lifetime_points: loyaltyPoints.lifetime_points + pointsToAdd,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    await sb
      .from('loyalty_transactions')
      .insert({
        user_id: user.id,
        type: 'earned',
        points: pointsToAdd,
        description: 'Points earned for writing a review',
        reference_type: 'review',
        reference_id: review.id,
        balance_after: newBalance
      })
  }

  return NextResponse.json({ review })
}

// PUT (update) a review
export async function PUT(req: NextRequest) {
  const sb = supabaseServer()
  
  const { data: { user }, error: authError } = await sb.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { review_id, rating, title, comment, images } = body

  if (!review_id || !rating) {
    return NextResponse.json({ error: 'Review ID and rating are required' }, { status: 400 })
  }

  const { data: review, error } = await sb
    .from('reviews')
    .update({
      rating,
      title: title || null,
      comment: comment || null,
      images: images || [],
      updated_at: new Date().toISOString()
    })
    .eq('id', review_id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ review })
}

// DELETE a review
export async function DELETE(req: NextRequest) {
  const sb = supabaseServer()
  
  const { data: { user }, error: authError } = await sb.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const reviewId = searchParams.get('review_id')

  if (!reviewId) {
    return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })
  }

  const { error } = await sb
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

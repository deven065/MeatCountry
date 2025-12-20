"use client"
import { useState, useEffect } from 'react'
import { Star, ThumbsUp, MessageSquare, CheckCircle } from 'lucide-react'
import { Review } from '@/lib/types'
import { supabaseClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  productId: string
  productName: string
}

export default function ProductReviews({ productId, productName }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Form state
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadReviews()
    checkAuth()
  }, [productId])

  const checkAuth = async () => {
    const sb = supabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    setUser(user)
  }

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?product_id=${productId}`)
      const data = await response.json()
      if (data.reviews) {
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('Please sign in to write a review')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          rating,
          title,
          comment
        })
      })

      const data = await response.json()
      if (response.ok) {
        setReviews([data.review, ...reviews])
        setShowReviewForm(false)
        setRating(5)
        setTitle('')
        setComment('')
        alert('Review submitted successfully! You earned 10 loyalty points!')
      } else {
        alert(data.error || 'Failed to submit review')
      }
    } catch (error) {
      alert('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
      : 0
  }))

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-24 bg-neutral-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-1">Customer Reviews</h2>
          <p className="text-neutral-600">{reviews.length} reviews for {productName}</p>
        </div>
        {user && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors"
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmitReview}
            className="bg-gradient-to-br from-brand-50 to-accent-50 rounded-xl p-6 space-y-4 border-2 border-brand-200"
          >
            <h3 className="text-lg font-bold text-neutral-900">Share your experience</h3>
            
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Your Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sum up your experience in one line"
                className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-lg focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you think about this product..."
                rows={4}
                className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-lg focus:border-brand-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-neutral-400 text-white font-bold rounded-lg transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
          <div className="space-y-4">
            <div className="text-center md:text-left">
              <div className="text-5xl font-black text-neutral-900 mb-1">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating)
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-neutral-600 font-medium">Based on {reviews.length} reviews</p>
            </div>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-neutral-700 w-12">
                  {star} star
                </span>
                <div className="flex-1 h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-600 w-12 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6 border-t pt-8">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 font-medium">No reviews yet</p>
            <p className="text-neutral-500 text-sm">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-b-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-neutral-300'
                        }`}
                      />
                    ))}
                    {review.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-bold text-neutral-900 mb-1">{review.title}</h4>
                  )}
                </div>
                <span className="text-sm text-neutral-500 whitespace-nowrap">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-neutral-700 leading-relaxed mb-3">{review.comment}</p>
              )}
              <button className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-brand-600 font-medium transition-colors">
                <ThumbsUp className="h-4 w-4" />
                Helpful ({review.helpful_count})
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

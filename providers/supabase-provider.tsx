"use client"
import { PropsWithChildren, useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'

export default function SupabaseProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    // Warm up supabase on client and listen for auth changes if needed
    const sb = supabaseClient()
    const { data: sub } = sb.auth.onAuthStateChange(() => {})
    setReady(true)
    return () => sub.subscription.unsubscribe()
  }, [])
  if (!ready) return null
  return children
}

"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const sb = supabaseClient()
    try {
      if (mode === 'sign-in') {
        const { error } = await sb.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await sb.auth.signUp({ email, password })
        if (error) throw error
      }
      router.replace('/')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form onSubmit={onSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-sm space-y-4 p-6 rounded-lg border bg-white">
      <h1 className="text-xl font-semibold">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="w-full rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-60">
        {loading ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Sign up'}
      </button>
      <p className="text-xs text-neutral-600 text-center">
        {mode === 'sign-in' ? (
          <>New here? <Link href="/sign-up" className="text-brand-600 hover:underline">Create an account</Link></>
        ) : (
          <>Already have an account? <Link href="/sign-in" className="text-brand-600 hover:underline">Sign in</Link></>
        )}
      </p>
    </motion.form>
  )
}

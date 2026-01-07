'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase/client'

export default function AdminSetupPage() {
  const router = useRouter()
  const [setupPassword, setSetupPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const SETUP_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_SETUP_PASSWORD || 'MeatCountry2025!Admin'

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const sb = supabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    
    if (!user) {
      setError('Please sign in first to become an admin')
      setCheckingAuth(false)
      return
    }

    // Check if user is already an admin
    const { data: adminData } = await sb
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (adminData) {
      router.push('/admin')
      return
    }

    setUser(user)
    setCheckingAuth(false)
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (setupPassword !== SETUP_PASSWORD) {
      setError('Incorrect setup password')
      return
    }

    if (!user) {
      setError('Please sign in first')
      return
    }

    setLoading(true)

    try {
      const sb = supabaseClient()
      
      // Create admin user
      const { error: insertError } = await sb
        .from('admin_users')
        .insert({
          user_id: user.id,
          role: 'super_admin',
          is_active: true
        })

      if (insertError) {
        if (insertError.message.includes('does not exist')) {
          setError('Admin users table not found. Please run the SQL schema first.')
        } else if (insertError.message.includes('duplicate key')) {
          setError('You are already an admin')
        } else {
          setError(insertError.message)
        }
        setLoading(false)
        return
      }

      alert('✅ Admin account created successfully!')
      router.push('/admin')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Checking authentication...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-red-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Setup</h1>
            <p className="text-gray-600">Enter setup password to create admin account</p>
          </div>

          {!user ? (
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'You need to sign in first'}</p>
              <button
                onClick={() => router.push('/sign-in')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSetup} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">Logged in as:</p>
                <p>{user.email}</p>
              </div>

              <div>
                <label htmlFor="setupPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Setup Password
                </label>
                <input
                  id="setupPassword"
                  type="password"
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter setup password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Default setup password: MeatCountry2025!Admin</p>
            <p className="mt-1">Change it in .env.local</p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/admin')}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Already have admin access? Go to Admin Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

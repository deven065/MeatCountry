'use client'

import { useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminSetupPage() {
  const [setupPassword, setSetupPassword] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'super_admin' | 'admin' | 'manager' | 'support'>('admin')
  const [step, setStep] = useState<'password' | 'form'>('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // Check setup password (should match NEXT_PUBLIC_ADMIN_SETUP_PASSWORD env variable)
  const SETUP_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_SETUP_PASSWORD || 'MeatCountry2025!Admin'

  async function verifySetupPassword(e: React.FormEvent) {
    e.preventDefault()
    if (setupPassword === SETUP_PASSWORD) {
      setStep('form')
      setError('')
    } else {
      setError('Invalid setup password')
    }
  }

  async function createAdminUser(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = supabaseClient()

    try {
      // First, sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // Create admin user entry
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([{
          user_id: authData.user.id,
          role: role,
          permissions: [],
          is_active: true,
        }])

      if (adminError) throw adminError

      // Sign in the user immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      setSuccess('Admin user created successfully! Redirecting to admin dashboard...')
      setTimeout(() => {
        router.push('/admin')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to create admin user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-red-500 rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Setup</h1>
          <p className="text-gray-600">
            {step === 'password' 
              ? 'Enter setup password to create admin account' 
              : 'Create your admin account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'password' ? (
            // Step 1: Verify Setup Password
            <form onSubmit={verifySetupPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Setup Password
                </label>
                <input
                  type="password"
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter setup password"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Default: MeatCountry2025!Admin (Set via NEXT_PUBLIC_ADMIN_SETUP_PASSWORD env variable)
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Continue
              </button>
            </form>
          ) : (
            // Step 2: Create Admin User
            <form onSubmit={createAdminUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="admin@meatcountry.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="super_admin">Super Admin (Full Access)</option>
                  <option value="admin">Admin (Most Features)</option>
                  <option value="manager">Manager (Limited Access)</option>
                  <option value="support">Support (View Only)</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Admin...' : 'Create Admin Account'}
              </button>

              <button
                type="button"
                onClick={() => setStep('password')}
                className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Back
              </button>
            </form>
          )}
        </div>

        {/* Alternative Method */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow text-center">
          <p className="text-sm text-gray-600 mb-2">Alternative: Use SQL Query</p>
          <code className="text-xs bg-gray-100 px-3 py-2 rounded block text-left overflow-x-auto">
            INSERT INTO admin_users (user_id, role, is_active)<br />
            VALUES ('your-user-uuid', 'super_admin', true);
          </code>
        </div>
      </div>
    </div>
  )
}

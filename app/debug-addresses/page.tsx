"use client"
import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import Container from '@/components/container'

export default function DebugAddresses() {
  const [user, setUser] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [allAddresses, setAllAddresses] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const sb = supabaseClient()
    
    try {
      // Get current user
      const { data: { user: authUser }, error: authError } = await sb.auth.getUser()
      
      if (authError) {
        setError(`Auth Error: ${authError.message}`)
        setLoading(false)
        return
      }
      
      setUser(authUser)
      console.log('Current User:', authUser)

      if (!authUser) {
        setError('No user logged in')
        setLoading(false)
        return
      }

      // Try to fetch user's addresses
      const { data: userAddresses, error: userError } = await sb
        .from('addresses')
        .select('*')
        .eq('user_id', authUser.id)

      console.log('User Addresses Query Result:', { data: userAddresses, error: userError })

      if (userError) {
        setError(`User Addresses Error: ${userError.message} (Code: ${userError.code})`)
      } else {
        setAddresses(userAddresses || [])
      }

      // Try to count all addresses (for debugging)
      const { count, error: countError } = await sb
        .from('addresses')
        .select('*', { count: 'exact', head: true })

      console.log('Total addresses count:', count, 'Error:', countError)

    } catch (err: any) {
      setError(`Exception: ${err.message}`)
      console.error('Exception:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Container><div className="py-12">Loading...</div></Container>

  return (
    <Container>
      <div className="py-12 space-y-6">
        <h1 className="text-3xl font-bold">Debug: Addresses</h1>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 font-mono text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Current User</h2>
          {user ? (
            <pre className="bg-neutral-50 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          ) : (
            <p className="text-neutral-600">Not logged in</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">User's Addresses ({addresses.length})</h2>
          {addresses.length > 0 ? (
            <pre className="bg-neutral-50 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(addresses, null, 2)}
            </pre>
          ) : (
            <p className="text-neutral-600">No addresses found for this user</p>
          )}
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
        >
          Refresh Data
        </button>
      </div>
    </Container>
  )
}

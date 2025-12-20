import { supabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = supabaseServer()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/sign-in?redirect=/admin')
  }
  
  // Check if user is admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()
  
  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have admin privileges. Please contact a super admin to grant you access.
          </p>
          <div className="space-y-3">
            <Link 
              href="/admin/setup" 
              className="block w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
            >
              Set Up Admin Account
            </Link>
            <Link 
              href="/" 
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
            >
              Go to Home
            </Link>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-xs font-semibold text-gray-700 mb-2">For Developers:</p>
            <p className="text-xs text-gray-600 mb-2">Run this SQL in Supabase:</p>
            <code className="text-xs bg-gray-800 text-green-400 px-2 py-1 rounded block overflow-x-auto">
              INSERT INTO admin_users (user_id, role, is_active)<br />
              VALUES ('{user.id}', 'super_admin', true);
            </code>
          </div>
        </div>
      </div>
    )
  }
  
  return <AdminDashboard adminUser={adminUser} />
}

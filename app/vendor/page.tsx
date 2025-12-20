import { supabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VendorDashboard } from '@/components/vendor/vendor-dashboard'

export default async function VendorPage() {
  const supabase = supabaseServer()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  // Check if user is a vendor
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (!vendor) {
    redirect('/')
  }

  if (vendor.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {vendor.status === 'pending' && 'Application Pending'}
            {vendor.status === 'rejected' && 'Application Rejected'}
            {vendor.status === 'suspended' && 'Account Suspended'}
          </h1>
          <p className="text-gray-600">
            {vendor.status === 'pending' && 'Your vendor application is under review. You will be notified once approved.'}
            {vendor.status === 'rejected' && 'Your vendor application was rejected. Please contact support for more information.'}
            {vendor.status === 'suspended' && 'Your vendor account has been suspended. Please contact support.'}
          </p>
        </div>
      </div>
    )
  }
  
  return <VendorDashboard vendor={vendor} />
}

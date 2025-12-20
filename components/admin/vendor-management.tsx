'use client'

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { Vendor } from '@/lib/types'

export function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  const supabase = supabaseClient()

  useEffect(() => {
    fetchVendors()
  }, [filter])

  async function fetchVendors() {
    setLoading(true)
    let query = supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (!error && data) {
      setVendors(data)
    }
    setLoading(false)
  }

  async function updateVendorStatus(vendorId: string, newStatus: Vendor['status']) {
    const { error } = await supabase
      .from('vendors')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', vendorId)

    if (!error) {
      fetchVendors()
      setSelectedVendor(null)
    }
  }

  async function toggleVendorActive(vendorId: string, isActive: boolean) {
    const { error } = await supabase
      .from('vendors')
      .update({ is_active: !isActive, updated_at: new Date().toISOString() })
      .eq('id', vendorId)

    if (!error) {
      fetchVendors()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Vendors</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Vendors</p>
          <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {vendors.filter(v => v.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {vendors.filter(v => v.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-blue-600">
            {vendors.filter(v => v.is_active).length}
          </p>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No vendors found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vendor.business_name}</p>
                        <p className="text-xs text-gray-500">{vendor.business_address.substring(0, 50)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <p>{vendor.business_email}</p>
                      <p>{vendor.business_phone}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vendor.commission_rate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${vendor.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          vendor.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleVendorActive(vendor.id, vendor.is_active)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${vendor.is_active ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${vendor.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedVendor(vendor)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Vendor Details</h3>
                <button onClick={() => setSelectedVendor(null)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Business Information */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Business Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Business Name</p>
                    <p className="font-medium">{selectedVendor.business_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{selectedVendor.business_email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium">{selectedVendor.business_phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Commission Rate</p>
                    <p className="font-medium">{selectedVendor.commission_rate}%</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Address</p>
                    <p className="font-medium">{selectedVendor.business_address}</p>
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Tax & Legal Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">GSTIN</p>
                    <p className="font-medium">{selectedVendor.gstin || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">PAN</p>
                    <p className="font-medium">{selectedVendor.pan || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Banking Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Account Holder</p>
                    <p className="font-medium">{selectedVendor.bank_account_holder || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Account Number</p>
                    <p className="font-medium">{selectedVendor.bank_account_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">IFSC Code</p>
                    <p className="font-medium">{selectedVendor.bank_ifsc || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 text-gray-900">Manage Status</h4>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'approved', 'suspended', 'rejected'] as Vendor['status'][]).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateVendorStatus(selectedVendor.id, status)}
                      disabled={selectedVendor.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${selectedVendor.status === status
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : status === 'approved' ? 'bg-green-500 text-white hover:bg-green-600' :
                            status === 'rejected' || status === 'suspended' ? 'bg-red-500 text-white hover:bg-red-600' :
                            'bg-yellow-500 text-white hover:bg-yellow-600'
                        }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

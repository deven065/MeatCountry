'use client'

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { Vendor, Product } from '@/lib/types'
import { formatINR } from '@/lib/currency'

export function VendorDashboard({ vendor }: { vendor: Vendor }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalProducts: 0, activeProducts: 0, totalRevenue: 0, totalOrders: 0 })
  const [showAddProduct, setShowAddProduct] = useState(false)

  const supabase = supabaseClient()

  useEffect(() => {
    fetchProducts()
    fetchStats()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
    
    if (data) setProducts(data)
    setLoading(false)
  }

  async function fetchStats() {
    // Fetch vendor stats
    const { data: vendorProducts } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', vendor.id)

    if (vendorProducts) {
      const productIds = vendorProducts.map((p: any) => p.id)
      
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('subtotal, quantity')
        .in('product_id', productIds)

      const totalRevenue = orderItems?.reduce((sum: number, item: any) => sum + item.subtotal, 0) || 0
      const totalOrders = orderItems?.length || 0

      setStats({
        totalProducts: vendorProducts.length,
        activeProducts: products.filter(p => p.inventory > 0).length,
        totalRevenue,
        totalOrders,
      })
    }
  }

  async function toggleProductFeatured(productId: string, isFeatured: boolean) {
    const { error } = await supabase
      .from('products')
      .update({ is_featured: !isFeatured })
      .eq('id', productId)

    if (!error) {
      fetchProducts()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-sm text-gray-600">{vendor.business_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                {vendor.status}
              </span>
              <span className="text-sm text-gray-600">
                Commission: <span className="font-semibold">{vendor.commission_rate}%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Products" value={stats.totalProducts.toString()} icon="📦" />
          <StatCard title="Active Products" value={stats.activeProducts.toString()} icon="✅" />
          <StatCard title="Total Orders" value={stats.totalOrders.toString()} icon="🛒" />
          <StatCard title="Total Revenue" value={formatINR(stats.totalRevenue)} icon="💰" />
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">My Products</h2>
            <button
              onClick={() => setShowAddProduct(!showAddProduct)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
            >
              {showAddProduct ? 'Cancel' : '+ Add Product'}
            </button>
          </div>

          {showAddProduct && (
            <div className="p-6 border-b bg-gray-50">
              <AddProductForm vendorId={vendor.id} onSuccess={() => {
                setShowAddProduct(false)
                fetchProducts()
                fetchStats()
              }} />
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No products yet. Add your first product to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatINR(product.price_inr)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${
                          product.inventory === 0 ? 'text-red-600' :
                          product.inventory < 10 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {product.inventory}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ⭐ {product.rating.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleProductFeatured(product.id, product.is_featured)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                            ${product.is_featured ? 'bg-red-500' : 'bg-gray-200'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${product.is_featured ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-red-600 hover:text-red-900 font-medium">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function AddProductForm({ vendorId, onSuccess }: { vendorId: string; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_inr: 0,
    unit: 'kg',
    inventory: 0,
    category_id: '',
    images: [''],
    sku: '',
  })
  const [categories, setCategories] = useState<any[]>([])
  const supabase = supabaseClient()

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await supabase.from('products').insert([{
      ...formData,
      vendor_id: vendorId,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      is_featured: false,
      rating: 0,
    }])

    if (!error) {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            required
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="kg">Kilogram (kg)</option>
            <option value="g">Gram (g)</option>
            <option value="piece">Piece</option>
            <option value="pack">Pack</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
          <input
            type="number"
            required
            value={formData.price_inr}
            onChange={(e) => setFormData({ ...formData, price_inr: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock *</label>
          <input
            type="number"
            required
            value={formData.inventory}
            onChange={(e) => setFormData({ ...formData, inventory: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
          <input
            type="url"
            required
            value={formData.images[0]}
            onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
      >
        Add Product
      </button>
    </form>
  )
}

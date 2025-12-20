'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'
import { formatINR } from '@/lib/currency'
import Image from 'next/image'

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const sb = supabaseClient()
    const { data, error } = await sb.from('categories').select('id, name')

    if (!error && data) {
      const categoryMap: Record<string, string> = {}
      data.forEach((cat: any) => {
        categoryMap[cat.id] = cat.name
      })
      setCategories(categoryMap)
    }
  }

  const loadProducts = async () => {
    const sb = supabaseClient()
    const { data, error } = await sb
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProducts(data as Product[])
    }
    setLoading(false)
  }

  const filteredProducts = products.filter(p => {
    if (filter === 'active') return p.inventory > 0
    if (filter === 'inactive') return p.inventory === 0
    return true
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    const sb = supabaseClient()
    const { error } = await sb.from('products').delete().eq('id', id)

    if (error) {
      alert('Failed to delete: ' + error.message)
    } else {
      alert('Product deleted successfully!')
      loadProducts()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600 mt-1">Add, edit, and manage all products</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          ➕ Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Products ({products.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          In Stock ({products.filter(p => p.inventory > 0).length})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'inactive' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Out of Stock ({products.filter(p => p.inventory === 0).length})
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description?.substring(0, 60)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category_id && categories[product.category_id] ? categories[product.category_id] : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {formatINR(product.price_inr)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${product.inventory > 10 ? 'text-green-600' : product.inventory > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        {product.inventory} {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.inventory > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingProduct) && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false)
            setEditingProduct(null)
          }}
          onSuccess={() => {
            loadProducts()
            setShowAddModal(false)
            setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}

function ProductModal({ product, onClose, onSuccess }: {
  product: Product | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; icon: string }>>([])
  const [subcategories, setSubcategories] = useState<Array<{ id: string; name: string; slug: string; category_id: string }>>([])
  const [filteredSubcategories, setFilteredSubcategories] = useState<Array<{ id: string; name: string }>>([])
  const [saving, setSaving] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    category_id: product?.category_id || '',
    subcategory_id: (product as any)?.subcategory_id || '',
    price_inr: product?.price_inr || 0,
    inventory: product?.inventory || 0,
    unit: product?.unit || '500g',
    images: product?.images || [],
    rating: product?.rating || 4.5,
    is_featured: product?.is_featured || false,
  })

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const sb = supabaseClient()
        
        // Load categories - try with icon first, fallback without icon
        let catData: any = null
        let catError: any = null
        
        const result1 = await sb
          .from('categories')
          .select('id, name, slug, icon')
          .order('name', { ascending: true })
        
        if (result1.error && result1.error.message?.includes('column')) {
          // Icon column doesn't exist, try without it
          const result2 = await sb
            .from('categories')
            .select('id, name, slug')
            .order('name', { ascending: true })
          catData = result2.data
          catError = result2.error
        } else {
          catData = result1.data
          catError = result1.error
        }
        
        // Load all subcategories - handle if table doesn't exist
        let subData: any = null
        let subError: any = null
        
        const subResult = await sb
          .from('subcategories')
          .select('id, name, slug, category_id')
          .order('name', { ascending: true })
        
        subData = subResult.data
        subError = subResult.error
        
        console.log('Categories loaded:', catData, 'Error:', catError)
        console.log('Subcategories loaded:', subData, 'Error:', subError)
        
        if (catData && !catError) {
          setCategories(catData)
          // Only set default category if adding new product and no category selected
          if (!product && !formData.category_id && catData.length > 0) {
            setFormData(prev => ({ ...prev, category_id: catData[0].id }))
          }
        } else if (catError) {
          console.error('Failed to load categories:', catError)
          const errorMsg = catError.message || catError.hint || JSON.stringify(catError) || 'Unknown error'
          alert('Failed to load categories: ' + errorMsg + '\n\nPlease make sure you have run the database schema SQL and seeded categories.')
        }

        if (subData && !subError) {
          setSubcategories(subData)
          // Filter subcategories if category already selected
          if (formData.category_id) {
            const filtered = subData.filter((s: any) => s.category_id === formData.category_id)
            setFilteredSubcategories(filtered)
          }
        } else if (subError && !subError.message?.includes('does not exist')) {
          console.warn('Subcategories table may not exist yet:', subError)
        }
      } catch (err) {
        console.error('Exception loading categories:', err)
        alert('Error loading categories: ' + (err as Error).message)
      } finally {
        setLoadingCategories(false)
      }
    }
    
    loadCategories()
  }, [])

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category_id && subcategories.length > 0) {
      const filtered = subcategories.filter((s: any) => s.category_id === formData.category_id)
      setFilteredSubcategories(filtered)
      // Reset subcategory if it doesn't belong to new category
      if (formData.subcategory_id) {
        const subcatBelongsToCategory = filtered.some((s: any) => s.id === formData.subcategory_id)
        if (!subcatBelongsToCategory) {
          setFormData(prev => ({ ...prev, subcategory_id: '' }))
        }
      }
    } else {
      setFilteredSubcategories([])
    }
  }, [formData.category_id, subcategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const sb = supabaseClient()

    if (product) {
      const { error } = await sb.from('products').update(formData).eq('id', product.id)
      if (error) {
        alert('Failed to update: ' + error.message)
      } else {
        alert('Product updated successfully!')
        onSuccess()
      }
    } else {
      const { error } = await sb.from('products').insert([formData])
      if (error) {
        alert('Failed to create: ' + error.message)
      } else {
        alert('Product created successfully!')
        onSuccess()
      }
    }

    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., Chicken Breast Boneless"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loadingCategories}
              >
                {loadingCategories ? (
                  <option value="">Loading categories...</option>
                ) : categories.length === 0 ? (
                  <option value="">No categories found</option>
                ) : (
                  <>
                    <option value="">-- Select a category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {!loadingCategories && categories.length === 0 && (
                <p className="text-xs text-red-600 mt-1">Please add categories to the database first</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                value={formData.subcategory_id}
                onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={!formData.category_id || loadingCategories}
              >
                {!formData.category_id ? (
                  <option value="">Select category first</option>
                ) : filteredSubcategories.length === 0 ? (
                  <option value="">No subcategories</option>
                ) : (
                  <>
                    <option value="">-- Select subcategory (optional) --</option>
                    {filteredSubcategories.map((subcat) => (
                      <option key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <select
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="kg">kg</option>
                <option value="500g">500g</option>
                <option value="250g">250g</option>
                <option value="grams">grams</option>
                <option value="piece">piece</option>
                <option value="dozen">dozen</option>
                <option value="pack">pack</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.price_inr}
                onChange={(e) => setFormData({ ...formData, price_inr: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.inventory}
                onChange={(e) => setFormData({ ...formData, inventory: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma-separated)</label>
            <input
              type="text"
              value={formData.images.join(', ')}
              onChange={(e) => setFormData({ ...formData, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
            {formData.images.length > 0 && formData.images[0] && (
              <div className="mt-2 flex gap-2">
                {formData.images.slice(0, 3).map((img, i) => (
                  <Image
                    key={i}
                    src={img}
                    alt={`Preview ${i + 1}`}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">
              Mark as Featured Product
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

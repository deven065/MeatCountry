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

    console.log('Loading categories:', { data, error })

    if (!error && data) {
      const categoryMap: Record<string, string> = {}
      data.forEach((cat: any) => {
        categoryMap[cat.id] = cat.name
      })
      console.log('Category map:', categoryMap)
      setCategories(categoryMap)
    }
  }

  const loadProducts = async () => {
    const sb = supabaseClient()
    const { data, error } = await sb
      .from('products')
      .select('*')

    console.log('Loading products:', { data, error })
    
    if (error) {
      console.error('Error loading products:', error)
      alert('Failed to load products: ' + error.message)
    }
    
    if (data) {
      console.log('Products loaded:', data.length)
      console.log('First product category_id:', data[0]?.category_id)
      
      // Load variants for each product to get accurate stock
      const productsWithStock = await Promise.all(
        data.map(async (product) => {
          const { data: variants } = await sb
            .from('product_variants')
            .select('inventory, unit')
            .eq('product_id', product.id)
          
          // Calculate total stock from variants
          const totalStock = variants?.reduce((sum, v) => sum + (v.inventory || 0), 0) || 0
          const primaryUnit = variants?.[0]?.unit || product.unit
          
          return {
            ...product,
            inventory: totalStock,
            unit: primaryUnit
          }
        })
      )
      
      setProducts(productsWithStock as Product[])
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
  const [uploadingImages, setUploadingImages] = useState(false)
  const [variants, setVariants] = useState<Array<{
    id?: string
    unit: string
    price_inr: number
    original_price: number | null
    discount_percentage: number
    inventory: number
    is_default: boolean
  }>>([])
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    category_id: product?.category_id || '',
    subcategory_id: (product as any)?.subcategory_id || '',
    price_inr: product?.price_inr || 0,
    original_price: product?.original_price || null,
    discount_percentage: product?.discount_percentage || 0,
    inventory: product?.inventory || 0,
    unit: product?.unit || '500g',
    images: product?.images || [],
    rating: product?.rating || 4.5,
    is_featured: product?.is_featured || false,
  })

  // Auto-calculate discount percentage when prices change
  useEffect(() => {
    if (formData.original_price && formData.original_price > 0 && formData.price_inr > 0) {
      const discount = Math.round(((formData.original_price - formData.price_inr) / formData.original_price) * 100)
      if (discount >= 0) {
        setFormData(prev => ({ ...prev, discount_percentage: discount }))
      }
    } else if (!formData.original_price || formData.original_price === 0) {
      setFormData(prev => ({ ...prev, discount_percentage: 0 }))
    }
  }, [formData.original_price, formData.price_inr])

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

    // Load variants if editing existing product
    if (product?.id) {
      loadVariants()
    }
  }, [])

  const loadVariants = async () => {
    if (!product?.id) return
    
    const sb = supabaseClient()
    const { data, error } = await sb
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true })

    if (!error && data) {
      setVariants(data.map(v => ({
        id: v.id,
        unit: v.unit,
        price_inr: v.price_inr,
        original_price: v.original_price,
        discount_percentage: v.discount_percentage,
        inventory: v.inventory,
        is_default: v.is_default
      })))
    }
  }

  const addVariant = () => {
    setVariants([...variants, {
      unit: '500g',
      price_inr: 0,
      original_price: null,
      discount_percentage: 0,
      inventory: 0,
      is_default: variants.length === 0
    }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    
    // Auto-calculate discount for variants
    if ((field === 'original_price' || field === 'price_inr') && updated[index].original_price && updated[index].original_price > 0 && updated[index].price_inr > 0) {
      const discount = Math.round(((updated[index].original_price! - updated[index].price_inr) / updated[index].original_price!) * 100)
      updated[index].discount_percentage = discount >= 0 ? discount : 0
    }
    
    // If marking as default, unmark others
    if (field === 'is_default' && value === true) {
      updated.forEach((v, i) => {
        if (i !== index) v.is_default = false
      })
    }
    
    setVariants(updated)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    const sb = supabaseClient()
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = `products/${fileName}`

        const { data, error } = await sb.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Upload error:', error)
          alert(`Failed to upload ${file.name}: ${error.message}`)
          continue
        }

        const { data: { publicUrl } } = sb.storage
          .from('product-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] })
      alert(`Successfully uploaded ${uploadedUrls.length} image(s)`)
    } catch (err) {
      console.error('Upload exception:', err)
      alert('Error uploading images: ' + (err as Error).message)
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) })
  }

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

    console.log('Submitting product with variants:', variants)
    console.log('Number of variants in state:', variants.length)

    const sb = supabaseClient()

    try {
      if (product) {
        // Update product
        const { error } = await sb.from('products').update(formData).eq('id', product.id)
        if (error) throw error

        // Save variants
        await saveVariants(product.id)
        
        alert('Product updated successfully!')
        onSuccess()
      } else {
        // Create product
        const { data, error } = await sb.from('products').insert([formData]).select()
        if (error) throw error
        
        if (data && data[0]) {
          // Save variants
          await saveVariants(data[0].id)
        }
        
        alert('Product created successfully!')
        onSuccess()
      }
    } catch (error: any) {
      alert('Failed to save: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const saveVariants = async (productId: string) => {
    if (variants.length === 0) return

    const sb = supabaseClient()
    
    console.log('Saving variants for product:', productId, variants)
    
    // Delete existing variants
    await sb.from('product_variants').delete().eq('product_id', productId)
    
    // Insert new variants
    const variantsToInsert = variants.map((v, index) => ({
      product_id: productId,
      unit: v.unit,
      price_inr: v.price_inr,
      original_price: v.original_price,
      discount_percentage: v.discount_percentage,
      inventory: v.inventory,
      is_default: v.is_default,
      sort_order: index
    }))
    
    console.log('Variants to insert:', variantsToInsert)
    
    const { error } = await sb.from('product_variants').insert(variantsToInsert)
    if (error) {
      console.error('Error saving variants:', error)
      throw error
    }
    console.log('Variants saved successfully!')
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

          {/* Multiple Variants Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
                <p className="text-sm text-gray-600">Add multiple units and prices for this product</p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                + Add Variant
              </button>
            </div>

            {variants.length > 0 && (
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-6 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                        <input
                          type="text"
                          list="variant-unit-options"
                          value={variant.unit}
                          onChange={(e) => updateVariant(index, 'unit', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                          placeholder="e.g., 250g"
                        />
                        <datalist id="variant-unit-options">
                          <option value="250g" />
                          <option value="500g" />
                          <option value="1kg" />
                          <option value="2kg" />
                          <option value="piece" />
                          <option value="dozen" />
                          <option value="pack" />
                          <option value="100ml" />
                          <option value="250ml" />
                          <option value="500ml" />
                          <option value="1L" />
                          <option value="family pack" />
                          <option value="combo" />
                        </datalist>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={variant.price_inr || ''}
                          onChange={(e) => updateVariant(index, 'price_inr', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Original (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={variant.original_price || ''}
                          onChange={(e) => updateVariant(index, 'original_price', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Discount %</label>
                        <input
                          type="number"
                          value={variant.discount_percentage}
                          readOnly
                          disabled
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 text-gray-600"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                        <input
                          type="number"
                          min="0"
                          value={variant.inventory || ''}
                          onChange={(e) => updateVariant(index, 'inventory', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      
                      <div className="flex items-end gap-2">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={variant.is_default}
                            onChange={(e) => updateVariant(index, 'is_default', e.target.checked)}
                            className="rounded"
                          />
                          Default
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {variants.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 text-sm">No variants added. Click "Add Variant" to create multiple unit options.</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
            <div className="space-y-3">
              {/* File Upload Area */}
              <div className="relative">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploadingImages
                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-brand-400'
                  }`}
                >
                  {uploadingImages ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Uploading images...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold text-brand-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Image Previews */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={img}
                        alt={`Product ${i + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-brand-600 text-white text-xs px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">No images uploaded yet. First image will be the primary display image.</p>
              )}
            </div>
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

'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'

interface Subcategory {
  id: string
  name: string
  slug: string
  category_id: string
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  subcategories?: Subcategory[]
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<{ category: Category; subcategory: Subcategory | null } | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const sb = supabaseClient()
    
    try {
      // Load categories - try with icon first
      const catResultWithIcon = await sb
        .from('categories')
        .select('id, name, slug, icon')
        .order('name', { ascending: true })
      
      // If icon column doesn't exist, load without it
      const catResult = catResultWithIcon.error && catResultWithIcon.error.message?.includes('column')
        ? await sb.from('categories').select('id, name, slug').order('name', { ascending: true })
        : catResultWithIcon

      // Load subcategories
      const { data: subData } = await sb
        .from('subcategories')
        .select('id, name, slug, category_id')
        .order('name', { ascending: true })

      if (catResult.data) {
        const categoriesWithSubs = catResult.data.map((cat: any) => ({
          ...cat,
          icon: cat.icon || '📦',
          subcategories: subData?.filter((sub: any) => sub.category_id === cat.id) || []
        }))
        setCategories(categoriesWithSubs)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure? This will also delete all subcategories and unlink products.')) return

    const sb = supabaseClient()
    const { error } = await sb.from('categories').delete().eq('id', id)

    if (error) {
      alert('Failed to delete: ' + error.message)
    } else {
      alert('Category deleted successfully!')
      loadCategories()
    }
  }

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm('Are you sure? This will unlink products from this subcategory.')) return

    const sb = supabaseClient()
    const { error } = await sb.from('subcategories').delete().eq('id', id)

    if (error) {
      alert('Failed to delete: ' + error.message)
    } else {
      alert('Subcategory deleted successfully!')
      loadCategories()
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading categories...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
          <p className="text-gray-600 mt-1">Manage categories and subcategories</p>
        </div>
        <button
          onClick={() => setShowAddCategory(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          ➕ Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No categories found. Click "Add Category" to create one.
          </div>
        ) : (
          <div className="divide-y">
            {categories.map((category) => (
              <div key={category.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="ml-12">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Subcategories ({category.subcategories?.length || 0})
                    </h4>
                    <button
                      onClick={() => setEditingSubcategory({ category, subcategory: null })}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Add Subcategory
                    </button>
                  </div>
                  {category.subcategories && category.subcategories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {category.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm"
                        >
                          <span className="text-gray-700">{sub.name}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingSubcategory({ category, subcategory: sub })}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSubcategory(sub.id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No subcategories</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {(showAddCategory || editingCategory) && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowAddCategory(false)
            setEditingCategory(null)
          }}
          onSuccess={() => {
            loadCategories()
            setShowAddCategory(false)
            setEditingCategory(null)
          }}
        />
      )}

      {/* Subcategory Modal */}
      {editingSubcategory && (
        <SubcategoryModal
          category={editingSubcategory.category}
          subcategory={editingSubcategory.subcategory}
          onClose={() => setEditingSubcategory(null)}
          onSuccess={() => {
            loadCategories()
            setEditingSubcategory(null)
          }}
        />
      )}
    </div>
  )
}

function CategoryModal({ category, onClose, onSuccess }: {
  category: Category | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    icon: category?.icon || '📦'
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const sb = supabaseClient()

    if (category) {
      const { error } = await sb.from('categories').update(formData).eq('id', category.id)
      if (error) {
        alert('Failed to update: ' + error.message)
      } else {
        alert('Category updated successfully!')
        onSuccess()
      }
    } else {
      const { error } = await sb.from('categories').insert([formData])
      if (error) {
        alert('Failed to create: ' + error.message)
      } else {
        alert('Category created successfully!')
        onSuccess()
      }
    }

    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">
              {category ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ 
                ...formData, 
                name: e.target.value,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Poultry"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (auto-generated)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="e.g., poultry"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 🐔"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SubcategoryModal({ category, subcategory, onClose, onSuccess }: {
  category: Category
  subcategory: Subcategory | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: subcategory?.name || '',
    slug: subcategory?.slug || '',
    category_id: category.id
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const sb = supabaseClient()

    if (subcategory) {
      const { error } = await sb.from('subcategories').update(formData).eq('id', subcategory.id)
      if (error) {
        alert('Failed to update: ' + error.message)
      } else {
        alert('Subcategory updated successfully!')
        onSuccess()
      }
    } else {
      const { error } = await sb.from('subcategories').insert([formData])
      if (error) {
        alert('Failed to create: ' + error.message)
      } else {
        alert('Subcategory created successfully!')
        onSuccess()
      }
    }

    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">
              {subcategory ? 'Edit Subcategory' : 'Add Subcategory'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Under: {category.icon} {category.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ 
                ...formData, 
                name: e.target.value,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Farm Chicken"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (auto-generated)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="e.g., farm-chicken"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : subcategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

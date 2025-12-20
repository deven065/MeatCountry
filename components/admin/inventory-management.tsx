'use client'

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { Product, InventoryLog } from '@/lib/types'
import { formatINR } from '@/lib/currency'

export function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [updateForm, setUpdateForm] = useState({ quantity: 0, changeType: 'restock', reason: '' })

  const supabase = supabaseClient()

  useEffect(() => {
    fetchProducts()
    fetchLowStockProducts()
    fetchInventoryLogs()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('inventory', { ascending: true })
    
    if (data) setProducts(data)
    setLoading(false)
  }

  async function fetchLowStockProducts() {
    const { data } = await supabase.rpc('get_low_stock_products')
    if (data) setLowStockProducts(data)
  }

  async function fetchInventoryLogs() {
    const { data } = await supabase
      .from('inventory_logs')
      .select('*, product:products(name)')
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (data) setInventoryLogs(data as any)
  }

  async function updateInventory() {
    if (!selectedProduct || updateForm.quantity === 0) return

    const { error } = await supabase.rpc('update_inventory', {
      p_product_id: selectedProduct.id,
      p_quantity_change: updateForm.quantity,
      p_change_type: updateForm.changeType,
      p_reason: updateForm.reason || null
    })

    if (!error) {
      fetchProducts()
      fetchLowStockProducts()
      fetchInventoryLogs()
      setSelectedProduct(null)
      setUpdateForm({ quantity: 0, changeType: 'restock', reason: '' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">Low Stock Alert</h3>
              <div className="space-y-1">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <p key={product.product_id} className="text-sm text-yellow-800">
                    {product.product_name}: {product.current_stock} {product.current_stock === 1 ? 'unit' : 'units'} remaining (threshold: {product.threshold})
                  </p>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-sm text-yellow-700 font-medium">
                    +{lowStockProducts.length - 5} more items
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-900">All Products</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const isLowStock = (product as any).low_stock_threshold && product.inventory <= (product as any).low_stock_threshold
                  const isOutOfStock = product.inventory === 0

                  return (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(product as any).sku || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatINR(product.price_inr)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${
                          isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {product.inventory}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isOutOfStock ? 'bg-red-100 text-red-800' :
                          isLowStock ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Update Stock
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Inventory Logs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-900">Recent Inventory Changes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Before → After</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(log.product as any)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.change_type === 'restock' ? 'bg-green-100 text-green-800' :
                      log.change_type === 'sale' ? 'bg-blue-100 text-blue-800' :
                      log.change_type === 'return' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.change_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <span className={log.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.quantity_before} → {log.quantity_after}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {log.reason || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Inventory Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Update Inventory</h3>
                <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                <p className="text-sm text-gray-500">Current Stock: {selectedProduct.inventory}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Change Type</label>
                <select
                  value={updateForm.changeType}
                  onChange={(e) => setUpdateForm({ ...updateForm, changeType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="restock">Restock</option>
                  <option value="sale">Sale</option>
                  <option value="return">Return</option>
                  <option value="damage">Damage</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Change {updateForm.changeType === 'sale' || updateForm.changeType === 'damage' ? '(negative)' : '(positive)'}
                </label>
                <input
                  type="number"
                  value={updateForm.quantity}
                  onChange={(e) => setUpdateForm({ ...updateForm, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter quantity"
                />
                <p className="text-xs text-gray-500 mt-1">
                  New stock will be: {selectedProduct.inventory + updateForm.quantity}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea
                  value={updateForm.reason}
                  onChange={(e) => setUpdateForm({ ...updateForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Enter reason for this change"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={updateInventory}
                  disabled={updateForm.quantity === 0}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Update Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

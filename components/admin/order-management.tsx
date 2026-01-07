'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { formatINR } from '@/lib/currency'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck, 
  DollarSign,
  Filter,
  Search,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag
} from 'lucide-react'

// Create admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string | null
  price: number
  quantity: number
  unit: string
  subtotal: number
}

interface Order {
  id: string
  user_id: string
  address_id: string | null
  order_number: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  status: string
  payment_status: string
  payment_method: string
  payment_id: string | null
  created_at: string
  updated_at: string
  wallet_amount_used: number
  loyalty_points_earned: number
  loyalty_points_used: number
  notes: string | null
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  customer_address?: string
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      
      // Fetch orders with address data
      const { data: ordersData, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select(`
          *,
          addresses (
            full_name,
            phone,
            address_line_1,
            address_line_2,
            city,
            state,
            pincode,
            landmark
          )
        `)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError
      
      // Fetch all order items for these orders
      const orderIds = ordersData?.map(o => o.id) || []
      let orderItemsMap: Record<string, any[]> = {}
      
      if (orderIds.length > 0) {
        const { data: itemsData, error: itemsError } = await supabaseAdmin
          .from('order_items')
          .select('*')
          .in('order_id', orderIds)
        
        if (!itemsError && itemsData) {
          // Group items by order_id
          itemsData.forEach(item => {
            if (!orderItemsMap[item.order_id]) {
              orderItemsMap[item.order_id] = []
            }
            orderItemsMap[item.order_id].push(item)
          })
        }
      }
      
      // Merge items and format address into orders
      const ordersWithItems = ordersData?.map(order => {
        const address = order.addresses
        const addressText = address 
          ? `${address.full_name}, ${address.phone}\n${address.address_line_1}${address.address_line_2 ? ', ' + address.address_line_2 : ''}\n${address.city}, ${address.state} - ${address.pincode}${address.landmark ? '\nNear: ' + address.landmark : ''}`
          : 'Address not available'
        
        return {
          ...order,
          customer_name: address?.full_name || 'Customer',
          customer_phone: address?.phone || '',
          customer_email: '', // Not stored in address
          customer_address: addressText,
          items: orderItemsMap[order.id] || []
        }
      }) || []
      
      setOrders(ordersWithItems as any)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error
      
      await loadOrders()
      if (selectedOrder?.id === orderId) {
        const updated = orders.find(o => o.id === orderId)
        if (updated) setSelectedOrder({ ...updated, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error
      
      await loadOrders()
      if (selectedOrder?.id === orderId) {
        const updated = orders.find(o => o.id === orderId)
        if (updated) setSelectedOrder({ ...updated, payment_status: newStatus })
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Failed to update payment status')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      new: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      cutting: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Package },
      ready: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      out_for_delivery: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    }

    const style = styles[status] || styles.new
    const Icon = style.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="h-3.5 w-3.5" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      paid: { bg: 'bg-green-100', text: 'text-green-800' },
      failed: { bg: 'bg-red-100', text: 'text-red-800' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800' },
    }

    const style = styles[status] || styles.pending

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <DollarSign className="h-3 w-3" />
        {status.toUpperCase()}
      </span>
    )
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesPayment && matchesSearch
  })

  const stats = {
    total: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    processing: orders.filter(o => ['cutting', 'ready'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total, 0),
    pending: orders.filter(o => o.payment_status === 'pending').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <ShoppingBag className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.new}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.processing}</p>
            </div>
            <Package className="h-10 w-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.delivered}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatINR(stats.revenue)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payment</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-10 w-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="inline h-4 w-4 mr-1" />
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Order #, name, email, phone..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline h-4 w-4 mr-1" />
              Order Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="cutting">Cutting</option>
              <option value="ready">Ready</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Payment Status
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('all')
                setPaymentFilter('all')
                setSearchTerm('')
              }}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                      {order.payment_id && (
                        <div className="text-xs text-gray-500 font-mono">{order.payment_id}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-xs text-gray-500">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.items?.length || 0} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatINR(order.total)}</div>
                      <div className="text-xs text-gray-500">{order.payment_method}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentBadge(order.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                      <div className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-brand-600 to-brand-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <p className="text-brand-100 mt-1">Order #{selectedOrder.order_number}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <Phone className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{selectedOrder.customer_phone}</p>
                    </div>
                  </div>
                  
                  {selectedOrder.customer_email && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <Mail className="h-5 w-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{selectedOrder.customer_email}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 md:col-span-2">
                    <div className="p-2 bg-white rounded-lg">
                      <MapPin className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Delivery Address</p>
                      <p className="font-medium text-gray-900">{selectedOrder.customer_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: OrderItem, index: number) => (
                      <div key={item.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-600">
                            {item.unit} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatINR(item.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatINR(item.price)} each
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No items found for this order
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatINR(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium text-gray-900">
                      {selectedOrder.delivery_fee > 0 ? formatINR(selectedOrder.delivery_fee) : 'Free'}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-brand-600">{formatINR(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="new">New</option>
                    <option value="cutting">Cutting</option>
                    <option value="ready">Ready</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                  <select
                    value={selectedOrder.payment_status}
                    onChange={(e) => updatePaymentStatus(selectedOrder.id, e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Updated</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedOrder.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

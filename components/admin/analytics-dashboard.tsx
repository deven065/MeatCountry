'use client'

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { formatINR } from '@/lib/currency'

interface AnalyticsData {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  totalCustomers: number
  ordersToday: number
  revenueToday: number
  topProducts: Array<{ name: string; sales: number; revenue: number }>
  ordersByStatus: Array<{ status: string; count: number }>
  revenueByDay: Array<{ date: string; revenue: number }>
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const supabase = supabaseClient()

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  async function fetchAnalytics() {
    setLoading(true)

    // Calculate date filter
    const now = new Date()
    const startDate = new Date()
    if (dateRange === '7d') startDate.setDate(now.getDate() - 7)
    else if (dateRange === '30d') startDate.setDate(now.getDate() - 30)
    else if (dateRange === '90d') startDate.setDate(now.getDate() - 90)
    else startDate.setFullYear(2020) // All time

    // Fetch orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString())

    // Fetch order items for top products
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*, product:products(name)')
      .gte('created_at', startDate.toISOString())

    if (orders && orderItems) {
      // Calculate metrics
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Unique customers
      const uniqueCustomers = new Set(orders.map((o: any) => o.user_id)).size

      // Today's metrics
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const ordersToday = orders.filter((o: any) => new Date(o.created_at) >= todayStart).length
      const revenueToday = orders
        .filter((o: any) => new Date(o.created_at) >= todayStart)
        .reduce((sum: number, order: any) => sum + order.total, 0)

      // Top products
      const productSales = orderItems.reduce((acc: any, item: any) => {
        const productName = (item.product as any)?.name || 'Unknown'
        if (!acc[productName]) {
          acc[productName] = { sales: 0, revenue: 0 }
        }
        acc[productName].sales += item.quantity
        acc[productName].revenue += item.subtotal
        return acc
      }, {} as Record<string, { sales: number; revenue: number }>)

      const topProducts = Object.entries(productSales)
        .map(([name, data]: [string, any]) => ({ name, sales: data.sales, revenue: data.revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // Orders by status
      const statusCounts = orders.reduce((acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const ordersByStatus: { status: string; count: number }[] = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number,
      }))

      // Revenue by day (last 30 days)
      const revenueByDay: Array<{ date: string; revenue: number }> = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const dayRevenue = orders
          .filter((o: any) => {
            const orderDate = new Date(o.created_at)
            return orderDate >= date && orderDate < nextDate
          })
          .reduce((sum: number, order: any) => sum + order.total, 0)

        revenueByDay.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: dayRevenue,
        })
      }

      setAnalytics({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        totalCustomers: uniqueCustomers,
        ordersToday,
        revenueToday,
        topProducts,
        ordersByStatus,
        revenueByDay,
      })
    }

    setLoading(false)
  }

  if (loading || !analytics) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Orders"
          value={analytics.totalOrders.toString()}
          subtitle={`${analytics.ordersToday} today`}
          icon="📦"
        />
        <MetricCard
          title="Total Revenue"
          value={formatINR(analytics.totalRevenue)}
          subtitle={`${formatINR(analytics.revenueToday)} today`}
          icon="💰"
        />
        <MetricCard
          title="Avg Order Value"
          value={formatINR(analytics.averageOrderValue)}
          subtitle="Per order"
          icon="📊"
        />
        <MetricCard
          title="Total Customers"
          value={analytics.totalCustomers.toString()}
          subtitle="Unique buyers"
          icon="👥"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Trend (Last 30 Days)</h3>
        <div className="h-64 flex items-end justify-between gap-1">
          {analytics.revenueByDay.map((day, index) => {
            const maxRevenue = Math.max(...analytics.revenueByDay.map(d => d.revenue))
            const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-red-500 rounded-t hover:bg-red-600 transition-all cursor-pointer group relative"
                  style={{ height: `${height}%`, minHeight: height > 0 ? '2px' : '0' }}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatINR(day.revenue)}
                  </div>
                </div>
                {index % 5 === 0 && (
                  <span className="text-xs text-gray-500 mt-2 -rotate-45 origin-top-left">
                    {day.date}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top 5 Products</h3>
          <div className="space-y-3">
            {analytics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} units sold</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">{formatINR(product.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {analytics.ordersByStatus.map((item, index) => {
              const percentage = (item.count / analytics.totalOrders) * 100

              return (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{item.status}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProductManagement } from '@/components/admin/product-management'
import { CategoryManagement } from '@/components/admin/category-management'
import { supabaseClient } from '@/lib/supabase/client'
import { formatINR } from '@/lib/currency'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders'>('dashboard')

  // Admin password - you can change this in .env.local
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('admin_authenticated')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authenticated', 'true')
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
    setPassword('')
  }

  const handleSeedCategories = async () => {
    if (!confirm('This will seed all categories and subcategories from the navbar. Continue?')) {
      return
    }

    setSeeding(true)
    try {
      const response = await fetch('/api/seed-categories', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success) {
        const inserted = result.stats.categoriesInserted || 0
        const updated = result.stats.categoriesUpdated || 0
        const subInserted = result.stats.subcategoriesInserted || 0
        
        alert(`✅ Success!\n\n• Categories inserted: ${inserted}\n• Categories updated: ${updated}\n• Subcategories inserted: ${subInserted}\n\n${result.message}`)
        // Reload the page to refresh the product management component
        window.location.reload()
      } else {
        if (result.sqlNeeded) {
          alert(`❌ Error: ${result.error}\n\nPlease run this SQL in Supabase SQL Editor:\n\n${result.sqlNeeded}`)
        } else {
          alert(`❌ Error: ${result.error}\n\n${result.details || ''}`)
        }
      }
    } catch (error) {
      alert('Failed to seed categories: ' + (error as Error).message)
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
              <p className="text-gray-600">Enter your password to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Login to Admin Panel
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Default password: admin123</p>
              <p className="mt-1">Change it in .env.local</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F2' }}>
      {/* Header */}
      <div className="sticky top-0 z-40" style={{ background: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #B91C1C 100%)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-wide" style={{ fontFamily: 'Oswald, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Restaurant Dashboard</h1>
                <p className="text-sm text-red-100 mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Complete restaurant & inventory management</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSeedCategories}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-bold uppercase tracking-wide transition-all disabled:opacity-50 border border-white/30"
                style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {seeding ? 'Seeding...' : 'Seed Categories'}
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-bold uppercase tracking-wide transition-all border border-white/30"
                style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-3" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <nav className="flex gap-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 py-3.5 px-6 rounded-xl font-bold uppercase tracking-wide text-sm transition-all ${
                  activeTab === 'dashboard'
                    ? 'text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{ 
                  fontFamily: 'Oswald, sans-serif',
                  background: activeTab === 'dashboard' ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)' : 'transparent'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Daily Pulse
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 py-3.5 px-6 rounded-xl font-bold uppercase tracking-wide text-sm transition-all ${
                  activeTab === 'products'
                    ? 'text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{ 
                  fontFamily: 'Oswald, sans-serif',
                  background: activeTab === 'products' ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)' : 'transparent'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Menu Items
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 py-3.5 px-6 rounded-xl font-bold uppercase tracking-wide text-sm transition-all ${
                  activeTab === 'orders'
                    ? 'text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{ 
                  fontFamily: 'Oswald, sans-serif',
                  background: activeTab === 'orders' ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)' : 'transparent'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Orders
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-2 py-3.5 px-6 rounded-xl font-bold uppercase tracking-wide text-sm transition-all ${
                  activeTab === 'categories'
                    ? 'text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{ 
                  fontFamily: 'Oswald, sans-serif',
                  background: activeTab === 'categories' ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)' : 'transparent'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Categories
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
      </div>
    </div>
  )
}

// Dashboard View Component
function DashboardView() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockAlerts: 0
  })
  const [salesData, setSalesData] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    const sb = supabaseClient()
    
    // Calculate date range for last 7 days
    const today = new Date()
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Load all orders for stats and revenue calculation
    const { data: allOrders } = await sb
      .from('orders')
      .select('*')
      .gte('created_at', last7Days.toISOString())
      .order('created_at', { ascending: true })
    
    // Calculate total revenue (last 7 days)
    const totalRevenue = allOrders?.reduce((sum, order) => sum + parseFloat(order.total || 0), 0) || 0
    
    // Count pending orders (status = new or cutting)
    const { count: pendingCount } = await sb
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['new', 'cutting'])
    
    // Load products for low stock alerts
    const { data: products } = await sb.from('products').select('id')
    const lowStockProducts = await Promise.all(
      (products || []).map(async (product) => {
        const { data: variants } = await sb
          .from('product_variants')
          .select('inventory')
          .eq('product_id', product.id)
        const totalStock = variants?.reduce((sum, v) => sum + (v.inventory || 0), 0) || 0
        return totalStock < 10 && totalStock > 0 ? 1 : 0
      })
    )
    
    // Generate sales data for last 7 days
    const salesByDay: number[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today)
      dayStart.setDate(dayStart.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)
      
      const dayOrders = allOrders?.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= dayStart && orderDate <= dayEnd
      }) || []
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)
      salesByDay.push(dayRevenue)
    }
    
    setStats({
      totalRevenue,
      pendingOrders: pendingCount || 0,
      lowStockAlerts: lowStockProducts.reduce((a: number, b: number) => a + b, 0)
    })
    setSalesData(salesByDay)
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-12" style={{ fontFamily: 'Montserrat, sans-serif' }}>Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Total Revenue (7d)</p>
              <p className="text-4xl font-bold mt-2" style={{ fontFamily: 'Oswald, sans-serif', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatINR(stats.totalRevenue)}</p>
              <p className="text-xs text-green-600 font-semibold mt-2 flex items-center gap-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                +12.5% from last week
              </p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' }}>
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Pending Orders</p>
              <p className="text-4xl font-bold mt-2" style={{ fontFamily: 'Oswald, sans-serif', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.pendingOrders}</p>
              <p className="text-xs text-blue-600 font-semibold mt-2 flex items-center gap-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Requires attention
              </p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' }}>
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Low Stock Alerts</p>
              <p className="text-4xl font-bold mt-2" style={{ fontFamily: 'Oswald, sans-serif', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.lowStockAlerts}</p>
              <p className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Restock needed soon
              </p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' }}>
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold uppercase tracking-wide" style={{ fontFamily: 'Oswald, sans-serif', background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sales Trend (Last 7 Days)</h3>
            <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Daily revenue performance analysis</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-xl">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>
        <div className="relative h-64">
          <svg width="100%" height="100%" viewBox="0 0 700 250" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line key={i} x1="0" y1={i * 50} x2="700" y2={i * 50} stroke="#E5E7EB" strokeWidth="1" />
            ))}
            {/* Sales line */}
            <polyline
              fill="none"
              stroke="#8B0000"
              strokeWidth="3"
              points={salesData.map((value, i) => {
                const x = (i / (salesData.length - 1)) * 700
                const y = 250 - (value / Math.max(...salesData)) * 200
                return `${x},${y}`
              }).join(' ')}
            />
            {/* Data points */}
            {salesData.map((value, i) => {
              const x = (i / (salesData.length - 1)) * 700
              const y = 250 - (value / Math.max(...salesData)) * 200
              return <circle key={i} cx={x} cy={y} r="4" fill="#8B0000" />
            })}
          </svg>
        </div>
        <div className="flex justify-between mt-4 text-sm text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className="text-center">
              <div>{day}</div>
              <div className="font-semibold text-gray-900">{formatINR(salesData[i])}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Order Management Component
function OrderManagement() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const sb = supabaseClient()
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      console.error('Error loading orders:', error)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const sb = supabaseClient()
    const { error } = await sb
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    
    if (error) {
      alert('Failed to update order status: ' + error.message)
    } else {
      alert('Order status updated successfully!')
      loadOrders()
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'NEW' },
      cutting: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'CUTTING/PREPARING' },
      ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'READY FOR DELIVERY' },
      out_for_delivery: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'OUT FOR DELIVERY' },
      delivered: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'DELIVERED' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'CANCELLED' }
    }
    const badge = badges[status as keyof typeof badges] || badges.new
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`} style={{ fontFamily: 'Oswald, sans-serif' }}>
        {badge.label}
      </span>
    )
  }

  const formatItems = (items: any[]) => {
    if (!Array.isArray(items)) return 'N/A'
    return items.map(item => `${item.product_name} (${item.unit})`).join(', ')
  }

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter)

  if (loading) {
    return <div className="text-center py-12" style={{ fontFamily: 'Montserrat, sans-serif' }}>Loading orders...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 flex gap-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {['all', 'new', 'cutting', 'ready', 'out_for_delivery', 'delivered'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-5 py-2.5 rounded-lg font-bold uppercase tracking-wide text-sm transition-all ${
              statusFilter === status ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ fontFamily: 'Oswald, sans-serif' }}
          >
            {status.replace('_', ' ')} ({status === 'all' ? orders.length : orders.filter(o => o.status === status).length})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide" style={{ fontFamily: 'Oswald, sans-serif' }}>Restaurant Orders</h2>
          <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Manage customer orders and kitchen preparation</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>Order #</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>Items</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>Date/Time</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    No orders found. Run the orders-schema.sql file in Supabase to create sample orders.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>#{order.order_number || order.id.substring(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>{order.customer_name}</div>
                        {order.customer_phone && (
                          <div className="text-xs text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>{order.customer_phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <span className="text-sm text-gray-700 line-clamp-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{formatItems(order.items)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>{formatINR(parseFloat(order.total))}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs font-bold uppercase bg-transparent border-none cursor-pointer"
                        style={{ fontFamily: 'Oswald, sans-serif' }}
                      >
                        <option value="new">NEW</option>
                        <option value="cutting">CUTTING/PREPARING</option>
                        <option value="ready">READY FOR DELIVERY</option>
                        <option value="out_for_delivery">OUT FOR DELIVERY</option>
                        <option value="delivered">DELIVERED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                      <div className="mt-1">{getStatusBadge(order.status)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {new Date(order.created_at).toLocaleString('en-IN', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => alert(`Order Details:\n\nOrder Number: ${order.order_number}\nCustomer: ${order.customer_name}\nTotal: ${formatINR(parseFloat(order.total))}\nItems: ${formatItems(order.items)}\n\nEmail: ${order.customer_email || 'N/A'}\nPhone: ${order.customer_phone || 'N/A'}\nAddress: ${order.customer_address || 'N/A'}`)}
                        className="text-red-600 hover:text-red-800 font-bold text-sm uppercase" 
                        style={{ fontFamily: 'Oswald, sans-serif' }}
                      >
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
    </div>
  )
}

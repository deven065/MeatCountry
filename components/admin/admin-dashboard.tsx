'use client'

import { useState } from 'react'
import { AdminUser } from '@/lib/types'
import { ProductManagement } from './product-management'
import { OrderManagement } from './order-management'
import { InventoryManagement } from './inventory-management'
import { VendorManagement } from './vendor-management'
import { AnalyticsDashboard } from './analytics-dashboard'
import { DiscountManagement } from './discount-management'
import { SubscriptionManagement } from './subscription-management'

type Tab = 'overview' | 'products' | 'orders' | 'inventory' | 'vendors' | 'discounts' | 'subscriptions' | 'analytics'

export function AdminDashboard({ adminUser }: { adminUser: AdminUser }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Products', icon: '🥩' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'vendors', label: 'Vendors', icon: '🏪' },
    { id: 'discounts', label: 'Discounts', icon: '🎫' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '🔄' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Role: <span className="font-semibold capitalize">{adminUser.role.replace('_', ' ')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'inventory' && <InventoryManagement />}
        {activeTab === 'vendors' && <VendorManagement />}
        {activeTab === 'discounts' && <DiscountManagement />}
        {activeTab === 'subscriptions' && <SubscriptionManagement />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </div>
    </div>
  )
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Orders" value="1,234" change="+12%" trend="up" />
        <StatCard title="Revenue" value="₹45,678" change="+8%" trend="up" />
        <StatCard title="Active Vendors" value="23" change="+3" trend="up" />
        <StatCard title="Low Stock Items" value="8" change="-2" trend="down" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton icon="➕" label="Add Product" />
          <QuickActionButton icon="📦" label="Create Order" />
          <QuickActionButton icon="🎫" label="New Discount" />
          <QuickActionButton icon="👥" label="Manage Vendors" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <ActivityItem time="2 minutes ago" text="New order #ORD-1234 placed" type="order" />
          <ActivityItem time="15 minutes ago" text="Product 'Chicken Breast' restocked" type="inventory" />
          <ActivityItem time="1 hour ago" text="Vendor 'Fresh Meats Co.' approved" type="vendor" />
          <ActivityItem time="3 hours ago" text="Discount code 'SAVE20' created" type="discount" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, change, trend }: { title: string; value: string; change: string; trend: 'up' | 'down' }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? '↑' : '↓'} {change}
      </p>
    </div>
  )
}

function QuickActionButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
      <span className="text-3xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  )
}

function ActivityItem({ time, text, type }: { time: string; text: string; type: string }) {
  const colors = {
    order: 'bg-blue-100 text-blue-800',
    inventory: 'bg-green-100 text-green-800',
    vendor: 'bg-purple-100 text-purple-800',
    discount: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className="flex items-start gap-3 py-2">
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type as keyof typeof colors]}`}>
        {type}
      </span>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{text}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  )
}

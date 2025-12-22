# 🎛️ Admin Panel Complete Guide

## Overview

The Meat Country admin panel is a comprehensive order and inventory management system designed specifically for meat shop operations. It provides real-time order tracking, payment status management, and business analytics.

## 🔑 Access

- **URL**: `http://localhost:3000/admin`
- **Default Password**: `admin123`
- **Environment Variable**: Set `NEXT_PUBLIC_ADMIN_PASSWORD` in `.env.local` to change the password

## 📊 Features

### 1. Dashboard
Real-time business metrics and analytics:

- **Total Revenue**: Last 7 days revenue with growth percentage
- **Pending Orders**: Orders requiring attention (new/cutting status)
- **Low Stock Alerts**: Products with inventory below 10 units
- **Sales Trend Chart**: Visual representation of daily revenue for the past week
- **Daily Breakdown**: Revenue by day with interactive chart

### 2. Order Management

#### **Order Statistics**
- Total orders count
- New orders requiring attention
- Orders in processing (cutting/ready)
- Delivered orders count
- Total revenue from paid orders
- Pending payment count

#### **Advanced Filtering**
- **Search**: Filter by order number, customer name, email, or phone
- **Order Status Filter**: all | new | cutting | ready | out_for_delivery | delivered | cancelled
- **Payment Status Filter**: all | pending | paid | failed | refunded
- **Clear Filters**: Reset all filters with one click

#### **Order Table Columns**
1. **Order**: Order number and payment ID
2. **Customer**: Name and phone number
3. **Items**: Total items count
4. **Total**: Amount with payment method
5. **Payment**: Payment status badge
6. **Status**: Order status badge with icons
7. **Date**: Created date and time
8. **Actions**: View details button

#### **Order Status Workflow**
```
NEW (🕐) → CUTTING (📦) → READY (✅) → OUT FOR DELIVERY (🚚) → DELIVERED (✅)
                                    ↘
                                   CANCELLED (❌)
```

#### **Payment Status Options**
- **Pending** ⏳: Payment not yet completed (COD or unpaid online)
- **Paid** ✅: Payment successfully received
- **Failed** ❌: Payment attempt failed
- **Refunded** 💸: Payment has been refunded to customer

#### **Order Details Modal**
Click "View" on any order to see:
- **Customer Information**:
  - Phone number
  - Email address
  - Delivery address with map icon
  
- **Order Items**:
  - Product name
  - Unit/weight
  - Quantity
  - Price per item
  - Total per item
  
- **Order Summary**:
  - Subtotal
  - Delivery fee (or "Free")
  - Grand total
  
- **Status Management**:
  - Order status dropdown (update in real-time)
  - Payment status dropdown
  - Last updated timestamp
  
- **Order Timeline**:
  - Created timestamp
  - Last updated timestamp

### 3. Product Management

#### **Features**
- Add new products with variants
- Edit existing products
- Delete products
- Manage inventory per variant
- Set product prices
- Upload product images
- Toggle product status (active/inactive)

#### **Product Variants**
Each product can have multiple variants:
- Different units (kg, pieces, lb, etc.)
- Individual pricing per variant
- Separate inventory tracking
- Stock status indicators

### 4. Category Management

#### **Features**
- Create main categories
- Create subcategories
- Edit category names and slugs
- Delete categories (with confirmation)
- Bulk seed categories from navbar structure

#### **Seed Categories Button**
One-click import of all categories:
- Automatically imports: Chicken, Mutton, Fish, Seafood, Eggs
- Creates all subcategories for each main category
- Handles duplicates intelligently
- Shows detailed import statistics

## 🎨 UI/UX Features

### Visual Design
- **Gradient Headers**: Red gradient matching brand identity
- **Typography**: 
  - Oswald font for headings and numbers
  - Montserrat for body text
- **Color-Coded Badges**:
  - Blue: New orders
  - Yellow: Processing/Cutting
  - Green: Ready/Delivered
  - Purple: Out for delivery
  - Red: Cancelled
  - Orange: Payment pending

### Responsive Design
- Fully mobile-responsive
- Touch-optimized for tablets
- Desktop-optimized layouts
- Adaptive grid systems

### Real-Time Updates
- Live order status changes
- Instant table updates
- No page refresh needed
- Optimistic UI updates

## 🔧 Technical Architecture

### Authentication
- Session-based authentication using sessionStorage
- Password protection
- Auto-check on page load
- Logout functionality

### Database Integration
- **Supabase Client**: Uses anon key for reads
- **Admin Operations**: Server-side routes use service role key
- **Row Level Security**: Properly bypassed for admin operations
- **Real-time Queries**: Fresh data on every load

### API Routes

#### Order Creation
```
POST /api/orders/create
```
**Payload**:
```json
{
  "orderNumber": "ORD-20240128-ABC123",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+919876543210",
  "customerAddress": "123 Main St, Mumbai",
  "items": [
    {
      "product_name": "Chicken Breast",
      "unit": "500g",
      "quantity": 2,
      "price": 250
    }
  ],
  "subtotal": 500,
  "deliveryFee": 40,
  "total": 540,
  "paymentMethod": "razorpay",
  "paymentStatus": "paid",
  "paymentId": "pay_123456789"
}
```

**Response**:
```json
{
  "success": true,
  "order": { /* order object */ },
  "message": "Order created successfully"
}
```

#### Order Status Update
Done directly through Supabase client:
```typescript
await supabase
  .from('orders')
  .update({ 
    status: 'cutting', 
    updated_at: new Date().toISOString() 
  })
  .eq('id', orderId)
```

## 📋 Order Status Definitions

| Status | Description | Next Action |
|--------|-------------|-------------|
| **new** | Fresh order just received | Move to cutting when starting preparation |
| **cutting** | Meat is being cut/prepared in kitchen | Move to ready when preparation complete |
| **ready** | Order packed and ready for pickup | Move to out_for_delivery when driver leaves |
| **out_for_delivery** | Order is with delivery person | Move to delivered when customer receives |
| **delivered** | Order successfully delivered | Final state (complete) |
| **cancelled** | Order was cancelled | Final state (no further action) |

## 💰 Payment Status Definitions

| Status | Description | Use Case |
|--------|-------------|----------|
| **pending** | Payment not yet received | COD orders, unpaid online orders |
| **paid** | Payment successfully received | All successful online payments, received COD |
| **failed** | Payment attempt failed | Failed online payment attempts |
| **refunded** | Money returned to customer | Cancelled orders with refunds |

## 🚀 Quick Start

### 1. First Time Setup
```bash
# Ensure Supabase is configured
# Check .env.local for:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the orders schema
# Go to Supabase Dashboard → SQL Editor
# Paste content from supabase/orders-schema.sql
# Click RUN
```

### 2. Seed Initial Data

#### Option A: Seed Categories
1. Go to `/admin`
2. Click on "Categories" tab
3. Click "Seed All Categories" button
4. Confirm the action
5. Wait for success message

#### Option B: Manual Setup
1. Click "Categories" tab
2. Click "Add Category"
3. Enter category details
4. Click "Save"

### 3. Add Products
1. Click "Products" tab
2. Click "Add Product"
3. Fill in product details:
   - Name, description
   - Category and subcategory
   - Initial variant (unit, price, inventory)
4. Click "Save"

### 4. Monitor Orders
1. Click "Orders" tab
2. View real-time order list
3. Use filters to find specific orders
4. Click "View" to see full details
5. Update status as orders progress

## 📊 Database Schema

### orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'new',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);
```

## 🔐 Security

### RLS (Row Level Security)
The orders table should have RLS enabled but allow admin access:

```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy for admin access (service role)
CREATE POLICY "Service role has full access" ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy for users to view their own orders (optional)
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  TO authenticated
  USING (customer_email = auth.jwt() ->> 'email');
```

### Admin Password
**IMPORTANT**: Change the default admin password!

1. Open `.env.local`
2. Add: `NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password`
3. Restart the development server
4. Use new password to login

### Service Role Key
- **Never expose** service role key in client-side code
- Only use in API routes
- Keep in `.env.local` (not committed to git)
- Rotated regularly in production

## 📱 Mobile Responsiveness

The admin panel is fully responsive:

### Desktop (1024px+)
- 6-column stat cards
- Full-width tables
- Side-by-side forms
- Large modal windows

### Tablet (768px - 1023px)
- 2-column stat cards
- Scrollable tables
- Stacked forms
- Medium modal windows

### Mobile (< 768px)
- 1-column stat cards
- Horizontal scroll tables
- Vertical stacked forms
- Full-screen modals

## 🎯 Best Practices

### Order Management
1. **Update orders promptly** - Keep customers informed
2. **Check payment status** - Verify payment before processing
3. **Use correct workflow** - Follow the status progression
4. **Add notes** - Use the address field for special instructions
5. **Monitor pending orders** - Check new orders frequently

### Inventory Management
1. **Update stock regularly** - Keep inventory counts accurate
2. **Set low stock alerts** - Get notified before running out
3. **Track popular items** - Monitor sales data
4. **Seasonal adjustments** - Adjust inventory for festivals/seasons

### Customer Service
1. **Respond quickly** - Address new orders within 15 minutes
2. **Verify phone numbers** - Call to confirm large orders
3. **Double-check addresses** - Ensure delivery location is clear
4. **Handle cancellations** - Process refunds promptly

## 🐛 Troubleshooting

### Orders Not Showing
```bash
# Check database connection
# In browser console:
console.log(await supabase.from('orders').select('count'))

# Check RLS policies
# In Supabase Dashboard → Authentication → Policies
# Ensure service role has access
```

### Can't Update Order Status
```bash
# Check service role key
# In .env.local
SUPABASE_SERVICE_ROLE_KEY=your_actual_key

# Verify in Supabase Dashboard → Settings → API
```

### Payment Status Not Updating
```bash
# Check Razorpay webhook
# In Razorpay Dashboard → Webhooks
# Ensure webhook URL is correct
# Check webhook logs for errors
```

### Dashboard Stats Incorrect
```bash
# The dashboard queries last 7 days
# Check date filters in DashboardView component
# Verify orders have correct created_at timestamps
```

## 🎓 Training Guide

### For New Admins
1. **Week 1**: Learn order status workflow
2. **Week 2**: Master product management
3. **Week 3**: Understand payment handling
4. **Week 4**: Advanced filtering and reporting

### Daily Checklist
- [ ] Check new orders (every 30 min)
- [ ] Update order statuses
- [ ] Verify payments
- [ ] Review low stock alerts
- [ ] Check delivery schedules

### Weekly Tasks
- [ ] Review sales trends
- [ ] Update product prices
- [ ] Check customer feedback
- [ ] Plan inventory restocking
- [ ] Generate reports

## 📈 Future Enhancements

### Planned Features
- [ ] Export orders to CSV/Excel
- [ ] Print order receipts
- [ ] Customer management system
- [ ] Advanced analytics dashboard
- [ ] SMS notifications to customers
- [ ] WhatsApp integration
- [ ] Delivery route optimization
- [ ] Multi-user admin with roles
- [ ] Order notes/comments
- [ ] Bulk status updates

### API Integrations
- [ ] Google Maps for delivery tracking
- [ ] Accounting software integration
- [ ] Inventory management systems
- [ ] CRM integration
- [ ] Email marketing tools

## 📞 Support

### Common Issues
- **Login fails**: Check password in .env.local
- **No orders**: Run orders-schema.sql in Supabase
- **Stats show 0**: Need at least 1 order in database
- **Can't update status**: Check service role key

### Getting Help
1. Check this documentation
2. Review error messages in browser console
3. Check Supabase logs
4. Contact technical support

## 🎉 Success Metrics

Track these KPIs:
- **Order Fulfillment Time**: Target < 45 minutes
- **Payment Success Rate**: Target > 95%
- **Order Accuracy**: Target > 98%
- **Customer Satisfaction**: Target > 4.5/5
- **Repeat Customer Rate**: Target > 40%

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Maintained By**: Meat Country Team

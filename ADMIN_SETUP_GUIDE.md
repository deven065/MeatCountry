# 🔐 Admin Access Setup Guide

## Quick Start - 3 Ways to Access Admin Dashboard

### Option 1: Admin Setup Page (Recommended for First Admin)
1. Navigate to: **`http://localhost:3000/admin/setup`**
2. Enter setup password: **`MeatCountry2025!Admin`** (default)
3. Create admin account with email & password
4. You'll be redirected to admin dashboard

**Custom Setup Password:**
Create a `.env.local` file and add:
```bash
NEXT_PUBLIC_ADMIN_SETUP_PASSWORD=YourSecurePassword123!
```

---

### Option 2: Direct SQL (For Existing Users)
If you already have a Supabase auth account:

1. Go to Supabase Dashboard → SQL Editor
2. Run this query (replace `your-user-id` with your actual user ID):

```sql
-- Find your user ID first
SELECT id, email FROM auth.users;

-- Then insert admin record
INSERT INTO public.admin_users (user_id, role, is_active)
VALUES ('your-user-id-here', 'super_admin', true);
```

**Role Types:**
- `super_admin` - Full access to everything
- `admin` - Most features, limited destructive actions
- `manager` - Order & inventory management
- `support` - Read-only access

---

### Option 3: Sign Up + SQL (For New Users)
1. Sign up at: **`http://localhost:3000/sign-up`**
2. Note your email address
3. Go to Supabase Dashboard → SQL Editor
4. Run:

```sql
-- Get your user ID by email
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Make yourself admin
INSERT INTO public.admin_users (user_id, role, is_active)
VALUES ('paste-user-id-here', 'super_admin', true);
```

---

## 🔒 Security Features

### Authentication Flow:
1. **Supabase Auth** - Must be logged in (email/password)
2. **Admin Check** - Must have entry in `admin_users` table
3. **Role-Based Access** - Different roles have different permissions
4. **Active Status** - Admins can be deactivated without deleting

### Admin Routes Protected:
- ✅ `/admin` - Main dashboard (requires auth + admin_users entry)
- ✅ `/admin/setup` - Setup page (requires setup password)
- ✅ All admin API routes (should check admin status)

---

## 📋 Admin Dashboard Features

Once logged in as admin, you get access to:

### 🎯 Overview Tab
- Real-time stats (orders, revenue, vendors, low stock)
- Quick action buttons
- Recent activity feed

### 📦 Order Management
- View all orders with filters
- Update order status (pending → confirmed → shipped → delivered)
- View customer details and delivery addresses
- Track payment status

### 📊 Inventory Management
- Track all product stock levels
- **Low stock alerts** (automatic warnings)
- Update inventory with reasons:
  - Restock
  - Sale
  - Return
  - Damage
  - Adjustment
- Complete inventory history log

### 🏪 Vendor Management
- Approve/reject vendor applications
- View vendor details (business info, tax, banking)
- Manage commission rates
- Suspend/activate vendors

### 🎫 Discount Management
- Create discount codes (percentage or fixed)
- Set minimum order values
- Usage limits & expiry dates
- Track discount performance

### 🔄 Subscription Management
- View all recurring orders
- Manage subscription status
- Track next delivery dates
- Frequency options (daily/weekly/monthly)

### 📈 Analytics Dashboard
- Revenue trends (30-day chart)
- Top 5 products
- Orders by status breakdown
- Key metrics (AOV, customers, etc.)

---

## 🚀 Getting Started Checklist

1. **[ ] Set up your admin account**
   - Use `/admin/setup` OR SQL method

2. **[ ] Log in and explore**
   - Navigate to `http://localhost:3000/admin`

3. **[ ] Test permissions**
   - Try accessing with non-admin account (should be denied)

4. **[ ] Add more admins (optional)**
   - Use SQL to add additional admin users

5. **[ ] Secure your setup password**
   - Change `NEXT_PUBLIC_ADMIN_SETUP_PASSWORD` in production
   - Or disable `/admin/setup` route after initial setup

---

## 🔧 Troubleshooting

### "Access Denied" Error
- **Check:** Are you logged in? (sign up/sign in first)
- **Check:** Do you have an entry in `admin_users` table?
- **Fix:** Run the SQL query to add yourself

### Can't Access `/admin/setup`
- **Check:** Is the password correct?
- **Default:** `MeatCountry2025!Admin`
- **Fix:** Set custom password in `.env.local`

### Admin Table Doesn't Exist
- **Fix:** Run the `schema.sql` file in Supabase SQL Editor
- The table should be created automatically

---

## 🔐 Production Deployment

**IMPORTANT:** Before deploying to production:

1. **Change the setup password:**
```bash
# In your deployment platform (Vercel, Netlify, etc.)
NEXT_PUBLIC_ADMIN_SETUP_PASSWORD=YourVerySecurePassword!2025
```

2. **Disable setup route (optional):**
   - Delete `/app/admin/setup/page.tsx`
   - Or add authentication check

3. **Use strong passwords:**
   - Enforce minimum 12 characters for admin accounts
   - Enable 2FA if using Supabase auth features

4. **Set up monitoring:**
   - Track admin logins
   - Alert on suspicious activity

---

## 📞 Need Help?

- **Database Issues:** Check Supabase Dashboard logs
- **Auth Issues:** Verify email confirmation in Supabase Auth
- **Permission Issues:** Check `admin_users` table in Supabase

**Admin URLs:**
- Dashboard: `/admin`
- Setup: `/admin/setup`
- Sign In: `/sign-in?redirect=/admin`

---

**Default Setup Password:** `MeatCountry2025!Admin`

**Remember to change this in production!** 🔒

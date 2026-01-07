# Admin Panel Setup Guide

The admin panel has been restored with proper user-based authentication!

## 🚀 Quick Setup Steps

### 1. Run the SQL Schema

First, you need to create the `admin_users` table in your Supabase database:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **MeatCountry**
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents from: `supabase/admin-users-schema.sql`
6. Click **Run** (or press Ctrl+Enter)

### 2. Access the Admin Setup Page

1. Make sure you're signed in to the website (create an account if needed)
2. Visit: **http://localhost:3000/admin/setup**
3. Enter the setup password: **MeatCountry2025!Admin**
4. Click "Create Admin Account"
5. Done! ✅

### 3. Access the Admin Dashboard

Once you're an admin, you can access the dashboard:
- URL: **http://localhost:3000/admin**

## 📋 Admin Features

Your admin dashboard includes:
- **Dashboard** - Overview with stats (revenue, pending orders, low stock alerts)
- **Products** - Add, edit, delete products
- **Categories** - Manage categories and subcategories
- **Orders** - View and manage customer orders

## 🔐 Security Notes

- The setup password is: `MeatCountry2025!Admin` (change it in `.env.local`)
- Admin access is tied to user accounts (not just a password)
- Only active admin users can access the admin panel
- Super admins can manage other admin users

## 🛠️ Changing Setup Password

Edit `.env.local` and change:
```
NEXT_PUBLIC_ADMIN_SETUP_PASSWORD=YourNewPassword
```

## 👥 Multiple Admins

To add more admins:
1. Have them sign up for an account
2. They visit `/admin/setup` and enter the setup password
3. Or manually add them via SQL:
   ```sql
   INSERT INTO admin_users (user_id, role, is_active)
   VALUES ('user-uuid-here', 'admin', true);
   ```

## 🎭 Admin Roles

- **super_admin** - Full access, can manage other admins
- **admin** - Can manage products, orders, categories
- **manager** - Limited access (for future use)

## Troubleshooting

### "Admin users table not found"
- Make sure you ran the SQL schema from step 1

### "Please sign in first"
- You need to be logged in to become an admin
- Go to `/sign-in` first

### Can't access /admin
- Make sure you completed the setup at `/admin/setup`
- Check that your user is active in the `admin_users` table

## Need Help?

Check the database:
```sql
-- See all admin users
SELECT * FROM admin_users;

-- Check if you're an admin (replace with your email)
SELECT au.* 
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id
WHERE u.email = 'your@email.com';
```

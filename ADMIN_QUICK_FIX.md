# 🚀 Quick Admin Setup (Alternative Method)

## The setup page not working? Use this SQL method instead:

### Step 1: Sign Up First
1. Go to: `http://localhost:3000/sign-up`
2. Create account with:
   - Email: `admin@meatcountry.com`
   - Password: `Admin123!` (or your choice)
3. Click Sign Up

### Step 2: Get Your User ID
Go to Supabase Dashboard → SQL Editor and run:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

Copy your user ID (the long uuid string).

### Step 3: Make Yourself Admin
Run this SQL (replace YOUR_USER_ID with the ID you copied):

```sql
INSERT INTO public.admin_users (user_id, role, permissions, is_active)
VALUES ('YOUR_USER_ID', 'super_admin', '[]', true);
```

### Step 4: Login
1. Go to: `http://localhost:3000/admin`
2. You should now have full access! ✅

---

## OR - Disable Email Confirmation in Supabase:

1. Go to Supabase Dashboard
2. **Authentication** → **Providers** → **Email**
3. Scroll down to **"Confirm email"**
4. **Uncheck** "Enable email confirmations"
5. Click **Save**
6. Try the setup page again: `http://localhost:3000/admin/setup`

---

## Quick Example:

```sql
-- 1. Find your email
SELECT id, email FROM auth.users WHERE email = 'admin@meatcountry.com';

-- 2. Copy the ID, then insert (example):
INSERT INTO public.admin_users (user_id, role, permissions, is_active)
VALUES ('a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'super_admin', '[]', true);
```

**That's it!** Now login at `/admin` 🎉

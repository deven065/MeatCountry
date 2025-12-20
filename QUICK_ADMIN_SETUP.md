# 🚀 Quick Admin Access

## Method 1: Setup Page (Easiest)
```
1. Go to: http://localhost:3000/admin/setup
2. Password: MeatCountry2025!Admin
3. Create your admin account
4. Done! ✅
```

## Method 2: SQL (Fastest for existing users)
```sql
-- Replace YOUR_USER_ID with your actual ID
INSERT INTO admin_users (user_id, role, is_active)
VALUES ('YOUR_USER_ID', 'super_admin', true);
```

## Access Admin Dashboard
```
http://localhost:3000/admin
```

## Default Setup Password
```
MeatCountry2025!Admin
```

Change it by adding to `.env.local`:
```
NEXT_PUBLIC_ADMIN_SETUP_PASSWORD=YourCustomPassword
```

---

**That's it!** See [ADMIN_SETUP_GUIDE.md](ADMIN_SETUP_GUIDE.md) for detailed instructions.

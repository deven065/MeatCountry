# OTP Authentication Setup Guide

## ✅ Code Updated
Your OTP authentication has been updated to use **real SMS OTP** via Supabase Phone Auth.

---

## 🔧 Configuration Required

To enable OTP functionality, you need to configure Supabase Phone Authentication:

### Step 1: Enable Phone Auth in Supabase Dashboard

1. Go to: https://kyzmybdosgscumnxersb.supabase.co/project/kyzmybdosgscumnxersb/auth/providers
2. Scroll to **Phone** section
3. Click **Enable Phone Provider**

### Step 2: Configure SMS Provider (Choose One)

#### Option A: Twilio (Recommended)

1. Sign up at: https://www.twilio.com
2. Get your credentials:
   - Account SID
   - Auth Token
   - Phone Number (with SMS capability)
3. In Supabase Dashboard → Auth → Phone:
   - Select **Twilio** as provider
   - Enter your Twilio credentials
   - Save settings

**Twilio Pricing**: ~₹0.65 per SMS to India

#### Option B: MessageBird

1. Sign up at: https://messagebird.com
2. Get API key
3. Configure in Supabase Phone Auth settings

#### Option C: Vonage (formerly Nexmo)

1. Sign up at: https://www.vonage.com
2. Get API credentials
3. Configure in Supabase Phone Auth settings

### Step 3: Configure Phone Auth Settings

In Supabase Dashboard → Authentication → Providers → Phone:

1. **Enable Phone Sign-ins**: ✅ ON
2. **Confirm Phone**: ✅ ON (recommended for production)
3. **Phone OTP Length**: 6 digits
4. **Phone OTP Expiry**: 60 seconds (default)
5. **Phone Rate Limit**: Configure as needed

### Step 4: Test Phone Auth

1. Try signing in with: `+91XXXXXXXXXX` (10-digit Indian number)
2. You should receive a real SMS with 6-digit OTP
3. Enter OTP to complete authentication

---

## 🚀 Current Implementation Features

### What's Working Now:

✅ **Real OTP Sending**: Uses Supabase `auth.signInWithOtp()`
- Sends SMS to `+91{phone}` format
- Uses configured SMS provider (Twilio/MessageBird/Vonage)

✅ **Real OTP Verification**: Uses Supabase `auth.verifyOtp()`
- Validates 6-digit OTP
- Automatic user creation on first login

✅ **Error Handling**:
- Invalid OTP detection
- Expired OTP detection
- Rate limiting errors
- Configuration errors (with helpful messages)

✅ **User Profile Creation**:
- Auto-creates/updates profile in `profiles` table
- Stores phone number and full name

---

## 📋 Database Setup

Ensure you have a `profiles` table:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'Customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow insert on first login
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## 🧪 Testing Without SMS Provider

If you want to test without configuring SMS (development only):

1. In Supabase Dashboard → Authentication → Settings
2. Enable **Disable email confirmations** (for testing)
3. Use the email authentication instead of phone

---

## 🔒 Security Considerations

1. **Rate Limiting**: Supabase automatically rate limits OTP requests
2. **Phone Verification**: Enable "Confirm Phone" in production
3. **Fraud Prevention**: Monitor unusual patterns in Supabase dashboard
4. **Cost Control**: Set spending limits in Twilio/provider dashboard

---

## 💡 Alternative: Email OTP (Already Working)

Your email authentication is already functional and requires no additional setup:
- Uses Supabase built-in email auth
- No SMS costs
- Suitable for users with email addresses

---

## 📞 Support

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs
2. Check Twilio logs (if using Twilio)
3. Verify phone number format: `+91XXXXXXXXXX`
4. Check error messages in browser console

---

## 🎯 Current User Experience

### Phone Login Flow:
1. User enters 10-digit mobile number
2. Clicks "Proceed Via OTP"
3. **If configured**: Real SMS sent with 6-digit OTP
4. **If not configured**: Clear error message asking to contact support
5. User enters OTP
6. System verifies and logs in
7. Profile created/updated automatically

### Fallback:
- Email/password login always available as backup
- No changes to existing email auth

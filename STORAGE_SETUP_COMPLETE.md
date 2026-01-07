# Supabase Storage Setup for Product Images

## ✅ Quick Fix Applied

The image loading issues have been fixed with:
1. ✅ Added fallback placeholder images
2. ✅ Added error handling for broken images
3. ✅ Updated Next.js config to support all Supabase domains
4. ✅ Added proper image placeholders in admin panel

## 🪣 Create Storage Bucket (Required!)

You MUST create a storage bucket in Supabase for product images to work properly.

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: **kyzmybdosgscumnxersb**
3. Click on **Storage** in the left sidebar

### Step 2: Create New Bucket
1. Click **"New Bucket"** button
2. **Bucket name:** `product-images`
3. **Public bucket:** ✅ YES (Enable)
4. Click **"Create bucket"**

### Step 3: Set Bucket Policies (Important!)
After creating the bucket, set these policies:

```sql
-- Allow public read access (anyone can view images)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

### Step 4: Test Image Upload
1. Go to http://localhost:3000/admin
2. Click "Add Menu Item"
3. Try uploading an image
4. Image should appear in the product list

## 🖼️ Alternative: Use External Images

If you don't want to set up Supabase Storage, you can use external image URLs:

1. Upload images to any hosting service (Imgur, Cloudinary, etc.)
2. When adding products, paste the image URL in the images field
3. Images will load from the external URL

## 🐛 Troubleshooting

### Images Still Not Loading?

1. **Check Browser Console**
   - Press F12 in browser
   - Look for image loading errors
   - Check if URLs are correct

2. **Verify Supabase Bucket**
   - Go to Storage in Supabase Dashboard
   - Check if `product-images` bucket exists
   - Verify bucket is public

3. **Check Image URLs in Database**
   ```sql
   SELECT name, images FROM products LIMIT 5;
   ```
   - Images should be an array: `["https://..."]`
   - URLs should start with your Supabase project URL

4. **Clear Next.js Cache**
   ```bash
   rm -rf .next
   npm run dev
   ```

### Image Upload Failing?

1. **Check File Size**
   - Max file size is usually 50MB
   - Recommended: Keep under 2MB per image

2. **Check File Format**
   - Supported: JPG, PNG, WEBP, AVIF, GIF
   - Use WEBP for best performance

3. **Check Authentication**
   - Make sure you're logged in as admin
   - Check if admin_users table has your user_id

## 📋 Current Setup Status

- [x] Image fallback placeholders added
- [x] Error handling for broken images
- [x] Next.js image config updated
- [ ] Supabase Storage bucket created (You need to do this!)
- [ ] Storage policies configured
- [ ] Test image upload completed

## 🎨 Placeholder Images Available

Your project has these placeholder images in `/public`:
- `/chicken.avif` - Default chicken image
- `/Egg.avif` - Egg placeholder
- `/Fish.avif` - Fish placeholder
- `/Mutton.avif` - Mutton placeholder

These will be used as fallbacks when product images fail to load.

## 🚀 Next Steps

1. Create the `product-images` bucket in Supabase Storage
2. Configure the policies shown above
3. Test uploading an image in the admin panel
4. Refresh the admin page - images should now load!

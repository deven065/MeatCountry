# Supabase Storage Setup for Product Images

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Enter bucket name: `product-images`
5. Make it **Public** (toggle on)
6. Click **Create bucket**

## Step 2: Set Storage Policies

Run this SQL in your Supabase SQL Editor:

```sql
-- Allow public read access to product images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

## Step 3: Usage

- Admin panel now has drag-and-drop file upload
- Upload multiple images at once
- First image is automatically the primary display image
- Hover over images to see delete button
- Images are stored in Supabase Storage at: `https://[your-project].supabase.co/storage/v1/object/public/product-images/products/[filename]`

## Features

✅ Drag and drop or click to upload
✅ Multiple image upload
✅ Image preview with delete option
✅ First image marked as "Primary"
✅ Upload progress indicator
✅ Automatic public URL generation

## Troubleshooting

If upload fails:
1. Check if bucket exists and is public
2. Verify storage policies are set
3. Check browser console for errors
4. Ensure user is authenticated

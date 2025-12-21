-- Complete Fix for Products Table and RLS Issues
-- Run this entire file in your Supabase SQL Editor

-- Step 1: Add subcategory_id column if missing
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES public.subcategories(id) ON DELETE SET NULL;

-- Step 2: Add discount columns if they don't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS original_price integer CHECK (original_price >= 0);

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS discount_percentage integer DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Step 2b: Add created_at column if missing
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Step 3: Drop ALL existing policies on products
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'products' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.products';
    END LOOP;
END $$;

-- Step 4: COMPLETELY DISABLE RLS on products table (for both read and write)
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Step 4b: Also disable RLS on categories and subcategories if enabled
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories DISABLE ROW LEVEL SECURITY;

-- Step 5: Create product_variants table if not exists
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  unit text NOT NULL,
  price_inr integer NOT NULL CHECK (price_inr >= 0),
  original_price integer CHECK (original_price >= 0),
  discount_percentage integer DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  inventory integer NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Step 6: Disable RLS on variants table
ALTER TABLE public.product_variants DISABLE ROW LEVEL SECURITY;

-- Step 7: Verify RLS is disabled
DO $$ 
BEGIN 
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND rowsecurity = false
  ) THEN
    RAISE NOTICE '✅ SUCCESS: RLS is DISABLED on products table. You can now create/update products!';
  ELSE
    RAISE NOTICE '⚠️ WARNING: RLS is still enabled. Please contact support.';
  END IF;
END $$;

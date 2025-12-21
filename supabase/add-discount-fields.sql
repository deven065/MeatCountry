-- Migration: Add discount pricing fields to products table
-- Run this if you already have the products table created

-- Add original_price column (nullable, for MRP)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS original_price integer CHECK (original_price >= 0);

-- Add discount_percentage column (0-100%)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS discount_percentage integer DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Add helpful comment
COMMENT ON COLUMN public.products.original_price IS 'MRP or original price before discount';
COMMENT ON COLUMN public.products.discount_percentage IS 'Discount percentage shown on product badge (0-100)';

-- Migration: Add product variants table for multiple units/prices per product
-- Run this to add the variants functionality to your existing database

-- Create product_variants table
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

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Policies for product_variants
DROP POLICY IF EXISTS "Allow read product_variants" ON public.product_variants;
CREATE POLICY "Allow read product_variants" ON public.product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage product_variants" ON public.product_variants;
CREATE POLICY "Authenticated users can manage product_variants" ON public.product_variants FOR ALL USING (auth.uid() IS NOT NULL);

-- Add helpful comment
COMMENT ON TABLE public.product_variants IS 'Stores multiple unit and price variants for each product (e.g., 250g, 500g, 1kg)';
COMMENT ON COLUMN public.product_variants.is_default IS 'The default variant to show when product is first loaded';
COMMENT ON COLUMN public.product_variants.sort_order IS 'Display order of variants (0 = first)';

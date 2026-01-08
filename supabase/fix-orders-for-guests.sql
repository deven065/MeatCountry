-- Fix orders table to support API requirements
-- Adds user_id and address_id columns for future authenticated user support

-- Add user_id column (nullable to support guest orders)
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add address_id column (nullable, references addresses table)
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS address_id UUID;

-- Ensure customer contact columns exist and are nullable
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS customer_address TEXT;

-- Make customer_name nullable if it exists with NOT NULL constraint
ALTER TABLE public.orders 
  ALTER COLUMN customer_name DROP NOT NULL;

-- Make items column nullable if it exists (for backward compatibility with order_items table)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'items'
  ) THEN
    ALTER TABLE public.orders ALTER COLUMN items DROP NOT NULL;
  END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_address_id_idx ON public.orders(address_id);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON public.orders(customer_email);

-- Disable RLS for simplicity (or set up proper policies if needed)
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Ensure order_items table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on order_items for simplicity
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- Create index for order_items
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);

COMMENT ON TABLE public.orders IS 'Orders table supporting both authenticated users and guest checkout. Guest orders have user_id as NULL.';

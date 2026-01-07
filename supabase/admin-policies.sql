-- Admin policies for accessing all data
-- Run this SQL in your Supabase SQL Editor to allow admin users full access

-- Policy for admins to view all orders
DROP POLICY IF EXISTS "Admin users can view all orders" ON public.orders;
CREATE POLICY "Admin users can view all orders" 
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policy for admins to update all orders
DROP POLICY IF EXISTS "Admin users can update all orders" ON public.orders;
CREATE POLICY "Admin users can update all orders" 
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policy for admins to view all order items
DROP POLICY IF EXISTS "Admin users can view all order items" ON public.order_items;
CREATE POLICY "Admin users can view all order items" 
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policy for admins to view all products
DROP POLICY IF EXISTS "Admin users can view all products" ON public.products;
CREATE POLICY "Admin users can view all products" 
  ON public.products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policy for admins to view all addresses
DROP POLICY IF EXISTS "Admin users can view all addresses" ON public.addresses;
CREATE POLICY "Admin users can view all addresses" 
  ON public.addresses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

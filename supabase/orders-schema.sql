-- Drop existing table if it exists to avoid conflicts
DROP TABLE IF EXISTS orders CASCADE;

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Customer information
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  
  -- Order details
  items JSONB NOT NULL, -- Array of {product_id, product_name, variant_id, unit, quantity, price}
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  
  -- Order status
  status TEXT NOT NULL DEFAULT 'new', -- new, cutting, ready, out_for_delivery, delivered, cancelled
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed, refunded
  payment_method TEXT, -- cod, online, card, razorpay
  payment_id TEXT, -- Razorpay payment ID or transaction reference
  
  -- Delivery details
  delivery_date DATE,
  delivery_time_slot TEXT,
  delivery_instructions TEXT,
  
  -- Metadata
  notes TEXT,
  order_number TEXT UNIQUE
);

-- Create indexes for faster queries
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Add order_number generator function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Disable RLS for development (enable in production with proper policies)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Insert sample orders for testing
INSERT INTO orders (customer_name, customer_email, customer_phone, items, subtotal, total, status, payment_status, payment_method) VALUES
('Rajesh Kumar', 'rajesh@example.com', '+91 98765 43210', '[{"product_name": "Kadaknath Whole Chicken", "unit": "1Kg", "quantity": 1, "price": 849}, {"product_name": "Curry Cut - Small Pieces", "unit": "500g", "quantity": 2, "price": 499}]'::jsonb, 1847, 1847, 'new', 'pending', 'cod'),
('Priya Singh', 'priya@example.com', '+91 98765 43211', '[{"product_name": "Mutton Leg Cut", "unit": "1Kg", "quantity": 1, "price": 899}]'::jsonb, 899, 899, 'cutting', 'paid', 'online'),
('Amit Patel', 'amit@example.com', '+91 98765 43212', '[{"product_name": "Chicken Breast", "unit": "500g", "quantity": 1, "price": 349}, {"product_name": "Fish Fillet", "unit": "500g", "quantity": 2, "price": 450}]'::jsonb, 1249, 1249, 'ready', 'paid', 'card'),
('Sneha Reddy', 'sneha@example.com', '+91 98765 43213', '[{"product_name": "Whole Lamb", "unit": "3Kg", "quantity": 1, "price": 1999}, {"product_name": "Curry Pieces", "unit": "500g", "quantity": 1, "price": 499}]'::jsonb, 2498, 2498, 'new', 'pending', 'cod'),
('Karan Malhotra', 'karan@example.com', '+91 98765 43214', '[{"product_name": "Turkey Breast", "unit": "1Kg", "quantity": 1, "price": 1599}]'::jsonb, 1599, 1599, 'cutting', 'paid', 'online');

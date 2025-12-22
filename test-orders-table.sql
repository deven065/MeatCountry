-- Quick diagnostic query to check orders table
-- Run this in Supabase SQL Editor

-- Check if table exists and view its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Check if there are any existing orders
SELECT COUNT(*) as order_count FROM orders;

-- Try to insert a test order (will rollback)
BEGIN;

INSERT INTO orders (
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    items,
    subtotal,
    delivery_fee,
    total,
    payment_status,
    payment_method,
    status
) VALUES (
    'Test Customer',
    'test@example.com',
    '+91 9876543210',
    'Test Address',
    '[{"product_name": "Test Product", "quantity": 1, "price": 100}]'::jsonb,
    100,
    0,
    100,
    'pending',
    'cod',
    'new'
);

-- Rollback so we don't actually create the test order
ROLLBACK;

-- If the above INSERT succeeds, your schema is correct
-- If it fails, check the error message for the issue

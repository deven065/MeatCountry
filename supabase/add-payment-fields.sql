-- Add payment_id field to orders table for Razorpay integration
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Add index for faster payment_id lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);

-- Update payment_method constraint to include razorpay
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('cod', 'online', 'card', 'razorpay', 'upi', 'wallet'));

-- Add comment for documentation
COMMENT ON COLUMN orders.payment_id IS 'Razorpay payment ID (e.g., pay_xxxxx) or other payment gateway transaction reference';

-- =====================================================
-- Fix Product Categories - Assign category_id to products
-- =====================================================
-- This script updates products to have the correct category_id
-- based on their product names

-- Update Poultry products (Chicken-related items)
UPDATE public.products
SET category_id = (SELECT id FROM public.categories WHERE slug = 'poultry')
WHERE (
  LOWER(name) LIKE '%chicken%' 
  OR LOWER(name) LIKE '%kadaknath%'
  OR LOWER(name) LIKE '%bater%'
  OR LOWER(name) LIKE '%duck%'
  OR LOWER(name) LIKE '%turkey%'
  OR LOWER(name) LIKE '%fowl%'
  OR LOWER(slug) LIKE '%chicken%'
  OR LOWER(slug) LIKE '%kadaknath%'
  OR LOWER(slug) LIKE '%poultry%'
)
AND (category_id IS NULL OR category_id != (SELECT id FROM public.categories WHERE slug = 'poultry'));

-- Update Ready to eat products
UPDATE public.products
SET category_id = (SELECT id FROM public.categories WHERE slug = 'ready-to-eat')
WHERE (
  LOWER(name) LIKE '%sausage%'
  OR LOWER(name) LIKE '%nugget%'
  OR LOWER(name) LIKE '%ball%'
  OR LOWER(name) LIKE '%kofta%'
  OR LOWER(name) LIKE '%patty%'
  OR LOWER(name) LIKE '%patties%'
  OR LOWER(slug) LIKE '%sausage%'
  OR LOWER(slug) LIKE '%nugget%'
  OR LOWER(slug) LIKE '%ready%'
)
AND (category_id IS NULL OR category_id != (SELECT id FROM public.categories WHERE slug = 'ready-to-eat'));

-- Update Pickle products
UPDATE public.products
SET category_id = (SELECT id FROM public.categories WHERE slug = 'pickle')
WHERE (
  LOWER(name) LIKE '%pickle%'
  OR LOWER(name) LIKE '%achaar%'
  OR LOWER(slug) LIKE '%pickle%'
  OR LOWER(slug) LIKE '%achaar%'
)
AND (category_id IS NULL OR category_id != (SELECT id FROM public.categories WHERE slug = 'pickle'));

-- Update Eggs Products (items made from eggs)
UPDATE public.products
SET category_id = (SELECT id FROM public.categories WHERE slug = 'eggs-products')
WHERE (
  LOWER(name) LIKE '%egg%omelet%'
  OR LOWER(name) LIKE '%egg%curry%'
  OR LOWER(name) LIKE '%egg%bhurji%'
  OR LOWER(name) LIKE '%egg%roll%'
  OR (LOWER(name) LIKE '%egg%' AND LOWER(name) NOT LIKE '%eggs')
  OR LOWER(slug) LIKE '%egg%product%'
)
AND (category_id IS NULL OR category_id != (SELECT id FROM public.categories WHERE slug = 'eggs-products'));

-- Update Eggs (plain eggs for sale)
UPDATE public.products
SET category_id = (SELECT id FROM public.categories WHERE slug = 'eggs')
WHERE (
  (LOWER(name) = 'eggs' OR LOWER(name) LIKE 'eggs %' OR LOWER(name) LIKE '% eggs')
  OR LOWER(slug) = 'eggs'
  OR LOWER(slug) LIKE 'eggs-%'
  OR (LOWER(name) LIKE '%egg%' AND LOWER(name) LIKE '%dozen%')
  OR (LOWER(name) LIKE '%egg%' AND LOWER(name) LIKE '%tray%')
)
AND (category_id IS NULL OR category_id != (SELECT id FROM public.categories WHERE slug = 'eggs'));

-- Verify the updates
SELECT 
  c.name as category,
  COUNT(p.id) as product_count,
  STRING_AGG(p.name, ', ') as products
FROM public.categories c
LEFT JOIN public.products p ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Show products without category
SELECT 
  id,
  name,
  slug,
  category_id
FROM public.products
WHERE category_id IS NULL
ORDER BY name;

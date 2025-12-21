-- =====================================================
-- Fix Product Subcategories - Assign subcategory_id to products
-- =====================================================

-- Update Farm Chicken products (regular chicken items)
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'farm-chicken')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'poultry')
AND (
  LOWER(name) LIKE '%chicken%'
  AND LOWER(name) NOT LIKE '%kadaknath%'
  AND LOWER(name) NOT LIKE '%bater%'
  AND LOWER(name) NOT LIKE '%duck%'
  AND LOWER(name) NOT LIKE '%turkey%'
  AND LOWER(name) NOT LIKE '%fowl%'
  AND LOWER(name) NOT LIKE '%desi%'
);

-- Update Kadaknath Chicken products
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'kadaknath-chicken')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'poultry')
AND (LOWER(name) LIKE '%kadaknath%' OR LOWER(slug) LIKE '%kadaknath%');

-- Update Desi Chicken products
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'desi-chicken')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'poultry')
AND (LOWER(name) LIKE '%desi%' OR LOWER(slug) LIKE '%desi%');

-- Update Bater Chicken products
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'bater-chicken')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'poultry')
AND (LOWER(name) LIKE '%bater%' OR LOWER(slug) LIKE '%bater%' OR LOWER(name) LIKE '%quail%');

-- Update Gini Fowl Chicken products
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'gini-fowl-chicken')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'poultry')
AND (LOWER(name) LIKE '%fowl%' OR LOWER(slug) LIKE '%fowl%' OR LOWER(name) LIKE '%gini%');

-- Update Turkey Chicken products
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'turkey-chicken')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'poultry')
AND (LOWER(name) LIKE '%turkey%' OR LOWER(slug) LIKE '%turkey%');

-- Update Duck Chicken products
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'duck-chicken')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'poultry')
AND (LOWER(name) LIKE '%duck%' OR LOWER(slug) LIKE '%duck%');

-- Update Sausage products
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'sausage')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'ready-to-eat')
AND (LOWER(name) LIKE '%sausage%' OR LOWER(slug) LIKE '%sausage%');

-- Update Nuggets products
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'nuggets')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'ready-to-eat')
AND (LOWER(name) LIKE '%nugget%' OR LOWER(slug) LIKE '%nugget%');

-- Update Chicken Balls/Kofta products
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'chicken-balls-kofta')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'ready-to-eat')
AND (LOWER(name) LIKE '%ball%' OR LOWER(name) LIKE '%kofta%' OR LOWER(slug) LIKE '%ball%' OR LOWER(slug) LIKE '%kofta%');

-- Update Patties products
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'patties')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'ready-to-eat')
AND (LOWER(name) LIKE '%patt%' OR LOWER(slug) LIKE '%patt%');

-- Update Mutton ready-to-eat products
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'mutton')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'ready-to-eat')
AND (LOWER(name) LIKE '%mutton%' OR LOWER(slug) LIKE '%mutton%');

-- Update Chicken Pickle products
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'chicken-pickle')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'pickle')
AND (LOWER(name) LIKE '%chicken%' OR LOWER(slug) LIKE '%chicken%');

-- Update Mutton Pickle products
UPDATE public.products
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'mutton-pickle')
WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'pickle')
AND (LOWER(name) LIKE '%mutton%' OR LOWER(slug) LIKE '%mutton%');

-- Verify subcategory assignments
SELECT 
  c.name as category,
  s.name as subcategory,
  COUNT(p.id) as product_count,
  STRING_AGG(p.name, ', ' ORDER BY p.name) as products
FROM public.categories c
LEFT JOIN public.subcategories s ON s.category_id = c.id
LEFT JOIN public.products p ON p.subcategory_id = s.id
GROUP BY c.id, c.name, s.id, s.name
HAVING COUNT(p.id) > 0
ORDER BY c.name, s.name;

-- Show products without subcategory
SELECT 
  p.id,
  p.name,
  p.slug,
  c.name as category,
  p.subcategory_id
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.category_id
WHERE p.subcategory_id IS NULL
ORDER BY c.name, p.name;

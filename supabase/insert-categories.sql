-- =====================================================
-- Insert all categories and subcategories from navbar
-- Run this in Supabase SQL Editor
-- =====================================================

-- First, insert main categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Poultry', 'poultry', '🐔'),
  ('Ready to eat', 'ready-to-eat', '🍽️'),
  ('Pickle', 'pickle', '🥒'),
  ('Eggs Products', 'eggs-products', '🥚'),
  ('Eggs', 'eggs', '🐣')
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  icon = EXCLUDED.icon;

-- Insert subcategories for Poultry
INSERT INTO public.subcategories (name, slug, category_id)
SELECT 'Farm Chicken', 'farm-chicken', id FROM public.categories WHERE slug = 'poultry'
UNION ALL
SELECT 'Desi Chicken', 'desi-chicken', id FROM public.categories WHERE slug = 'poultry'
UNION ALL
SELECT 'Kadaknath Chicken', 'kadaknath-chicken', id FROM public.categories WHERE slug = 'poultry'
UNION ALL
SELECT 'Bater Chicken', 'bater-chicken', id FROM public.categories WHERE slug = 'poultry'
UNION ALL
SELECT 'Gini Fowl Chicken', 'gini-fowl-chicken', id FROM public.categories WHERE slug = 'poultry'
UNION ALL
SELECT 'Turkey Chicken', 'turkey-chicken', id FROM public.categories WHERE slug = 'poultry'
UNION ALL
SELECT 'Duck Chicken', 'duck-chicken', id FROM public.categories WHERE slug = 'poultry'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert subcategories for Ready to eat
INSERT INTO public.subcategories (name, slug, category_id)
SELECT 'Sausage', 'sausage', id FROM public.categories WHERE slug = 'ready-to-eat'
UNION ALL
SELECT 'Nuggets', 'nuggets', id FROM public.categories WHERE slug = 'ready-to-eat'
UNION ALL
SELECT 'Chicken Balls/Kofta', 'chicken-balls-kofta', id FROM public.categories WHERE slug = 'ready-to-eat'
UNION ALL
SELECT 'Patties', 'patties', id FROM public.categories WHERE slug = 'ready-to-eat'
UNION ALL
SELECT 'Mutton', 'mutton', id FROM public.categories WHERE slug = 'ready-to-eat'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert subcategories for Pickle
INSERT INTO public.subcategories (name, slug, category_id)
SELECT 'Chicken Pickle', 'chicken-pickle', id FROM public.categories WHERE slug = 'pickle'
UNION ALL
SELECT 'Mutton Pickle', 'mutton-pickle', id FROM public.categories WHERE slug = 'pickle'
UNION ALL
SELECT 'Fish Pickle', 'fish-pickle', id FROM public.categories WHERE slug = 'pickle'
UNION ALL
SELECT 'Eggs Pickle', 'eggs-pickle', id FROM public.categories WHERE slug = 'pickle'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert subcategories for Eggs Products
INSERT INTO public.subcategories (name, slug, category_id)
SELECT 'Eggs Sausage', 'eggs-sausage', id FROM public.categories WHERE slug = 'eggs-products'
UNION ALL
SELECT 'Egg Peda', 'egg-peda', id FROM public.categories WHERE slug = 'eggs-products'
UNION ALL
SELECT 'Egg Rasmalia', 'egg-rasmalia', id FROM public.categories WHERE slug = 'eggs-products'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert subcategories for Eggs
INSERT INTO public.subcategories (name, slug, category_id)
SELECT 'Classic Eggs', 'classic-eggs', id FROM public.categories WHERE slug = 'eggs'
UNION ALL
SELECT 'Desi Eggs', 'desi-eggs', id FROM public.categories WHERE slug = 'eggs'
UNION ALL
SELECT 'Kadaknath Eggs', 'kadaknath-eggs', id FROM public.categories WHERE slug = 'eggs'
UNION ALL
SELECT 'Duck Eggs', 'duck-eggs', id FROM public.categories WHERE slug = 'eggs'
UNION ALL
SELECT 'Bater Eggs', 'bater-eggs', id FROM public.categories WHERE slug = 'eggs'
UNION ALL
SELECT 'Turkey Eggs', 'turkey-eggs', id FROM public.categories WHERE slug = 'eggs'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Verify the data
SELECT 
  c.name as category,
  c.icon,
  COUNT(s.id) as subcategory_count
FROM public.categories c
LEFT JOIN public.subcategories s ON s.category_id = c.id
GROUP BY c.id, c.name, c.icon
ORDER BY c.name;

-- Show all categories with their subcategories
SELECT 
  c.name as category,
  s.name as subcategory
FROM public.categories c
LEFT JOIN public.subcategories s ON s.category_id = c.id
ORDER BY c.name, s.name;

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const categories = [
  {
    name: 'Poultry',
    slug: 'poultry',
    icon: '🐔',
    subcategories: [
      'Farm Chicken',
      'Desi Chicken',
      'Kadaknath Chicken',
      'Bater Chicken',
      'Gini Fowl Chicken',
      'Turkey Chicken',
      'Duck Chicken'
    ]
  },
  {
    name: 'Ready to eat',
    slug: 'ready-to-eat',
    icon: '🍽️',
    subcategories: [
      'Sausage',
      'Nuggets',
      'Chicken Balls/Kofta',
      'Patties',
      'Mutton'
    ]
  },
  {
    name: 'Pickle',
    slug: 'pickle',
    icon: '🥒',
    subcategories: [
      'Chicken Pickle',
      'Mutton Pickle',
      'Fish Pickle',
      'Eggs Pickle'
    ]
  },
  {
    name: 'Eggs Products',
    slug: 'eggs-products',
    icon: '🥚',
    subcategories: [
      'Eggs Sausage',
      'Egg Peda',
      'Egg Rasmalia'
    ]
  },
  {
    name: 'Eggs',
    slug: 'eggs',
    icon: '🐣',
    subcategories: [
      'Classic Eggs',
      'Desi Eggs',
      'Kadaknath Eggs',
      'Duck Eggs',
      'Bater Eggs',
      'Turkey Eggs'
    ]
  }
]

export async function POST() {
  const logs: string[] = []
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    logs.push('Starting seed process...')
    
    let insertedCategories = 0
    let insertedSubcategories = 0
    let updatedCategories = 0

    // Insert or update categories
    for (const cat of categories) {
      logs.push(`\n--- Processing category: ${cat.name} ---`)
      
      // Check if category exists
      const { data: existingCat, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', cat.slug)
        .maybeSingle()

      logs.push(`Check existing: ${JSON.stringify({ data: existingCat, error: checkError })}`)

      let categoryId: string

      if (existingCat) {
        categoryId = existingCat.id
        logs.push(`Category already exists with ID: ${categoryId}`)
      } else {
        logs.push('Attempting to insert category...')
        
        // Try to insert with icon first
        let insertResult = await supabase
          .from('categories')
          .insert({ name: cat.name, slug: cat.slug, icon: cat.icon })
          .select('id')
          .maybeSingle()

        logs.push(`Insert result (with icon): ${JSON.stringify({ data: insertResult.data, error: insertResult.error?.message })}`)

        // If icon column doesn't exist, try without it
        if (insertResult.error && insertResult.error.message?.includes('column')) {
          logs.push('Icon column does not exist, trying without icon...')
          insertResult = await supabase
            .from('categories')
            .insert({ name: cat.name, slug: cat.slug })
            .select('id')
            .maybeSingle()
          
          logs.push(`Insert result (no icon): ${JSON.stringify({ data: insertResult.data, error: insertResult.error?.message })}`)
        }

        if (insertResult.error) {
          logs.push(`ERROR: Failed to insert category: ${insertResult.error.message}`)
          logs.push(`Full error: ${JSON.stringify(insertResult.error)}`)
          continue
        }

        if (!insertResult.data) {
          logs.push('ERROR: No data returned when inserting category')
          continue
        }

        categoryId = insertResult.data.id
        insertedCategories++
        logs.push(`✓ Inserted category with ID: ${categoryId}`)
      }

      // Check if subcategories table exists by trying to query it
      const { error: subTableError } = await supabase
        .from('subcategories')
        .select('id')
        .limit(1)

      if (subTableError) {
        console.error('Subcategories table does not exist:', subTableError.message)
        return NextResponse.json({
          success: false,
          error: 'Subcategories table does not exist. Please run the schema SQL first.',
          sqlNeeded: `
CREATE TABLE IF NOT EXISTS public.subcategories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(category_id, slug)
);

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS subcategory_id uuid references public.subcategories(id) on delete set null;
          `.trim()
        }, { status: 500 })
      }

      // Insert subcategories
      logs.push(`Inserting ${cat.subcategories.length} subcategories for ${cat.name}...`)
      for (const subcat of cat.subcategories) {
        const subcatSlug = subcat.toLowerCase().replace(/[^a-z0-9]+/g, '-')

        const { data: existingSubcat } = await supabase
          .from('subcategories')
          .select('id')
          .eq('category_id', categoryId)
          .eq('slug', subcatSlug)
          .maybeSingle()

        if (!existingSubcat) {
          const { error: subcatError } = await supabase
            .from('subcategories')
            .insert({
              name: subcat,
              slug: subcatSlug,
              category_id: categoryId
            })

          if (!subcatError) {
            insertedSubcategories++
            logs.push(`  ✓ Inserted: ${subcat}`)
          } else {
            logs.push(`  ✗ Error inserting ${subcat}: ${subcatError.message}`)
          }
        } else {
          logs.push(`  - Already exists: ${subcat}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded database!`,
      stats: {
        categoriesInserted: insertedCategories,
        categoriesUpdated: updatedCategories,
        subcategoriesInserted: insertedSubcategories
      },
      logs: logs
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to seed categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const results: any = {
      categories: { exists: false, count: 0, hasIcon: false, error: null },
      subcategories: { exists: false, count: 0, error: null }
    }

    // Check categories table
    const catCheck = await supabase.from('categories').select('*').limit(5)
    if (catCheck.error) {
      results.categories.error = catCheck.error.message
    } else {
      results.categories.exists = true
      results.categories.count = catCheck.data?.length || 0
      results.categories.hasIcon = catCheck.data?.[0]?.hasOwnProperty('icon') || false
      results.categories.sample = catCheck.data
    }

    // Check subcategories table
    const subCheck = await supabase.from('subcategories').select('*').limit(5)
    if (subCheck.error) {
      results.subcategories.error = subCheck.error.message
    } else {
      results.subcategories.exists = true
      results.subcategories.count = subCheck.data?.length || 0
      results.subcategories.sample = subCheck.data
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
